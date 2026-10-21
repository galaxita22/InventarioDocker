import jwt from "jsonwebtoken";

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

export const isAdministrador = (req, res, next) => {
    // Ajustado al rol exacto de tu nuevo modelo Account
    if (req.account.role !== 'administrador') {
        return res.status(403).json({ message: "Acceso denegado: Requiere rol de Administrador" });
    }
    next();
};

export const isAprobador = (req, res, next) => {
    // Definimos quiénes tienen poder de firma en el SLEP
    const rolesPermitidos = ['aprobador', 'administrador', 'supervisor'];
    
    if (!rolesPermitidos.includes(req.account.role)) {
        return res.status(403).json({ mensaje: "Acceso denegado: Requiere permisos de aprobación" });
    }
    next();
};