import jwt from "jsonwebtoken";
import { Account, Rol, Permiso } from '../models/index.js';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ message: "No se proporcionó un token de autenticación" });
        }
        
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Inyectar solo los datos del usuario en la request
        req.account = decoded; 
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token no válido", error: error.message });
    }
};

export const isAdministrador = async (req, res, next) => {
    return requirePermission('usuarios', 'editar')(req, res, next);
};

export const isAprobador = (req, res, next) => {
    return requirePermission('solicitudes', 'aprobar')(req, res, next);
};

export const getAccountPermissions = async (accountId) => {
    const account = await Account.findByPk(accountId, {
        include: [{
            model: Rol,
            as: 'NivelAcceso',
            include: [{ model: Permiso, as: 'Permisos' }]
        }]
    });

    return account?.NivelAcceso?.Permisos || [];
};

export const hasPermission = async (accountId, modulo, accion) => {
    const permisos = await getAccountPermissions(accountId);
    return permisos.some((permiso) => permiso.modulo === modulo && permiso.accion === accion);
};

export const requirePermission = (modulo, accion) => async (req, res, next) => {
    try {
        if (await hasPermission(req.account.id, modulo, accion)) {
            return next();
        }

        return res.status(403).json({
            mensaje: `Acceso denegado: requiere el permiso ${modulo}.${accion}`
        });
    } catch (error) {
        console.error('Error validando permisos:', error);
        return res.status(500).json({ mensaje: 'Error validando permisos' });
    }
};