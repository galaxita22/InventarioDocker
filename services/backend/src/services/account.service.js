import bcrypt from "bcryptjs";
import { Account, Rol } from "../models/index.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { validarRut, calcularDV } from "../utils/validators.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function generarPasswordTemporal(longitud = 12) {

    const caracteres =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

    let password = "";

    for (let i = 0; i < longitud; i++) {
        const indice = crypto.randomInt(0, caracteres.length);
        password += caracteres[indice];
    }

    return password;
}

export const registerAccount = async (data) => {

    if (!data.rut) {
        throw new Error("El campo RUT es obligatorio");
    }

    if (!data.email) {
        throw new Error("El campo correo es obligatorio");
    }
    
    // Nueva validación para la contraseña manual
    if (!data.contrasena) {
        throw new Error("El campo contraseña es obligatorio");
    }

    if (!validarRut(data.rut)) {
        throw new Error("El RUT ingresado no es válido. Debe incluir guion (ej: 12345678-9)");
    }

    const existingAccount = await Account.findOne({ where: { email: data.email } });
    if (existingAccount) {
        throw new Error("El correo electronico ya esta registrado");
    }

    const existingRut = await Account.findOne({ where: { rut: data.rut } });
    if (existingRut) {
        throw new Error("El RUT ya se encuentra registrado");
    }

    // Encriptamos la contraseña que el usuario eligió
    const hashedPassword = await bcrypt.hash(data.contrasena, 10);
    
    const created = await Account.create({
        ...data,
        contrasena: hashedPassword,
        role: "solicitante", // Le damos el rol más bajo por defecto por seguridad
        matricula: data.matricula || null
    });

    return created;
};

export const loginAccount = async (email, contrasena) => {
    // 2. Modificamos la búsqueda para INCLUIR la relación con Rol
    const account = await Account.findOne({
        where: { email },
        include: [{ model: Rol, as: 'NivelAcceso' }] // <-- EL PUENTE MÁGICO
    });

    if (!account) {
        throw new Error("Usuario no encontrado");
    }

    const passwordValido = await bcrypt.compare(contrasena, account.contrasena);
    if (!passwordValido) {
        throw new Error("Contraseña incorrecta");
    }

    const nombreRol = account.NivelAcceso ? account.NivelAcceso.nombre.toLowerCase() : 'solicitante';

    const token = jwt.sign(
        { id: account.id, role: nombreRol }, 
        process.env.JWT_SECRET || 'secreto_super_seguro', 
        { expiresIn: 86400 } // 24 horas
    );
    return {
        token,
        account: {
            id: account.id,
            nombre_usuario: account.nombre_usuario,
            email: account.email,
            role: nombreRol, // <-- Inyectamos el rol aquí para el frontend
            first_login: account.first_login,
            avatar_ref: account.avatar_ref
        }
    };
};
export const renewToken = async (token) => {
    if (!token) {
        throw new Error("No se proporcionó un token");
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch {
        throw new Error("Token de autenticación no válido");
    }

    const account = await Account.findByPk(decoded.id);
    if (!account) {
        throw new Error("La cuenta no existe");
    }

    const payload = {
        id: account.id,
        email: account.email,
        nombre_usuario: account.nombre_usuario,
        role: account.role,
        first_login: account.first_login
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    const accountData = account.toJSON();
    delete accountData.contrasena;

    return { token: newToken, account: accountData };
};

export const updateAccount = async (id, data, requester) => {
    const account = await Account.findByPk(id);
    if (!account) throw new Error("La cuenta no existe");

    if (requester.id !== parseInt(id) && requester.role !== 'administrador') {
        throw new Error("No tienes permisos para modificar esta cuenta");
    }

    if (data.email) {
        const existingEmail = await Account.findOne({ where: { email: data.email } });
        if (existingEmail && existingEmail.id !== account.id) throw new Error("El correo ya se encuentra en uso por otro usuario");
        account.email = data.email;
    }

    if (data.contrasena) {
        account.contrasena = await bcrypt.hash(data.contrasena, 10);
    }

    if (data.role && requester.role === 'administrador') {
        account.role = data.role;
    }

    account.nombre_usuario = data.nombre_usuario || account.nombre_usuario;
    account.escuela = data.escuela || account.escuela;
    account.matricula = data.matricula !== undefined ? (data.matricula || null) : account.matricula;

    return await account.save();
};

export const deleteAccountById = async (id, requester) => {
    const account = await Account.findByPk(id);
    if (!account) throw new Error("La cuenta no existe");

    if (requester.id !== parseInt(id) && requester.role !== 'administrador') {
        throw new Error("No tienes permiso para eliminar esta cuenta");
    }

    return await account.destroy();
};

export const changePassword = async (id, contrasenaActual, nuevaContrasena, requester) => {
    const account = await Account.findByPk(id);
    if (!account) throw new Error("La cuenta no existe");

    if (requester.id !== parseInt(id)) {
        throw new Error("No puedes cambiar la contraseña de otra cuenta");
    }

    const isMatch = await bcrypt.compare(contrasenaActual, account.contrasena);
    if (!isMatch) throw new Error("La contraseña actual es incorrecta");

    account.contrasena = await bcrypt.hash(nuevaContrasena, 10);
    return await account.save();
};

export const getAllUsers = async () => {
    return await Account.findAll({
        attributes: { exclude: ['contrasena'] }
    });
};

// Función para obtener cuenta por ID sin restricciones (solo para uso interno en servicios)
export const getAccountById = async (id) => {
    const user = await Account.findByPk(id, {
        attributes: { exclude: ['contrasena'] }
    });

    if (!user) {
        throw new Error("El usuario no existe");
    }

    return user;
};

// Función para obtener cuenta por ID con validación de permisos (para controladores)
export const getUserById = async (idBuscado, accountSolicitante) => {
    if (
        accountSolicitante.role !== "administrador" &&
        accountSolicitante.id !== parseInt(idBuscado)
    ) {
        throw new Error("No tienes permiso para ver esta cuenta");
    }

    return await getAccountById(idBuscado);
};

export const loginSSO = async (rut) => {
    const rutCompleto = calcularDV(rut);

    const account = await Account.findOne({
        where: { rut: rutCompleto }
    });

    if (!account) {
        return null;
    }

    const payload = {
        id: account.id,
        email: account.email,
        nombre_usuario: account.nombre_usuario,
        role: account.role,
        first_login: account.first_login
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    return { token, account };
}

export const updateFirstLogin = async (id, first_login, requester) => {
    const account = await Account.findByPk(id);
    if (!account) throw new Error("La cuenta no existe");

    if (requester.id !== parseInt(id)) {
        throw new Error("No puedes cambiar el first_login de otra cuenta");
    }

    account.first_login = first_login;
    return await account.save();
}

export const updateAvatar = async (id, filename, requester) => {
    const account = await Account.findByPk(id);
    if (!account) throw new Error("La cuenta no existe");

    if (requester.id !== parseInt(id) && requester.role !== 'administrador') {
        throw new Error("No tienes permisos para modificar esta cuenta");
    }

    account.avatar_ref = `/uploads/${filename}`;
    return await account.save();
}

export const deleteAvatar = async (id, requester) => {
    const account = await Account.findByPk(id);
    if (!account) throw new Error("La cuenta no existe");

    if (requester.id !== parseInt(id) && requester.role !== 'administrador') {
        throw new Error("No tienes permisos para modificar esta cuenta");
    }

    if (account.avatar_ref) {
        // Buscamos el archivo físico y lo eliminamos para no acumular basura
        const filename = path.basename(account.avatar_ref);
        const filePath = path.resolve(process.cwd(), "uploads", filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
        }

        // Limpiamos la base de datos
        account.avatar_ref = null;
        await account.save();
    }
    
    return account;
};

export const asignarRolUsuario = async (usuarioId, rol_id) => {
    const usuario = await Account.findByPk(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");
    
    usuario.rol_id = rol_id;
    await usuario.save();
    return usuario;
};
    