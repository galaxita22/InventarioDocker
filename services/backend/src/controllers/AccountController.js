import * as accountService from "../services/account.service.js"

export const register = async (req, res) => {
    try {
        const newAccount = await accountService.registerAccount(req.body);
        res.status(201).json({ message: "Usuario registrado", account: newAccount });
    } catch (error) {
        res.status(400).json({ message: error.message || "Ocurrio un error al registrar el usuario" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        const result = await accountService.loginAccount(email, contrasena);
        res.status(200).json({ message: "Inicio de sesión exitoso", ...result });
    } catch (error) {
        res.status(401).json({ message: error.message || "Ocurrio un error al iniciar sesión" });
    }
};

export const renewToken = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader?.split(" ")[1];
        const result = await accountService.renewToken(token);

        res.status(200).json({
            message: "Sesión renovada",
            ...result
        });
    } catch (error) {
        res.status(401).json({ message: error.message || "No se pudo renovar la sesión" });
    }
};

export const update = async (req, res) => {
    try {
        const updatedAccount = await accountService.updateAccount(req.params.id, req.body, req.account);
        res.status(200).json({ message: "Cuenta actualizada", account: updatedAccount });
    } catch (error) {
        res.status(400).json({ message: error.message || "Ocurrio un error al actualizar la cuenta" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await accountService.deleteAccountById(req.params.id, req.account);
        res.status(200).json({ message: "Cuenta eliminada", id_eliminada: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message || "Ocurrio un error al borrar la cuenta" });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { contrasenaActual, nuevaContrasena } = req.body;
        const { id } = req.params;

        await accountService.changePassword(id, contrasenaActual, nuevaContrasena, req.account);

        res.status(200).json({ message: "Contraseña actualizada con éxito" });
    } catch (error) {
        res.status(400).json({ message: error.message || "Error al cambiar la contraseña" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await accountService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message || "Ocurrio un error al obtener los usuarios" });
    }
};

export const getByID = async (req, res) => {
    try {
        const user = await accountService.getUserById(req.params.id, req.account);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message || "Ocurrio un error al obtener el usuario" });
    }
};

export const ssoCallback = async (req, res) => {
    try {
        const { id } = req.query;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

        if (!id) {
            console.log("Intento de SSO sin ID")
            return res.redirect(`${frontendUrl}/login?error=missing_id`);
        }

        const result = await accountService.loginSSO(id);

        if (!result) {
            console.log(`SSO Rechazado: El RUT ${id} no está registrado en el sistema.`);
            return res.redirect(`${frontendUrl}/login?error=not_registered`);
        }

        console.log(`SSO Exitoso: Usuario ${result.account.nombre_usuario} (RUT: ${result.account.rut}) ha iniciado sesión.`);
        return res.redirect(`${frontendUrl}/login?token=${result.token}`);

    } catch (error) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
        console.error("Error en SSO callback:", error);
        res.redirect(`${frontendUrl}/login?error=server_error`);
    }

}

export const firstLoginFalse = async (req, res) => {
    try {
        const { id } = req.params;
        await accountService.updateFirstLogin(id, false, req.account);

        res.status(200).json({ message: "First login actualizado con éxito" });
    } catch (error) {
        res.status(400).json({ message: error.message || "Error al actualizar el first login" });
    }
}

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Debes enviar una imagen" });
        }
        const { id } = req.params;
        const account = await accountService.updateAvatar(id, req.file.filename, req.account);
        
        res.status(200).json({ 
            message: "Foto de perfil actualizada", 
            avatar_ref: account.avatar_ref 
        });
    } catch (error) {
        res.status(400).json({ message: error.message || "Error al subir la foto" });
    }
}

export const removeAvatar = async (req, res) => {
    try {
        const { id } = req.params;
        await accountService.deleteAvatar(id, req.account);
        res.status(200).json({ message: "Foto de perfil eliminada correctamente" });
    } catch (error) {
        res.status(400).json({ message: error.message || "Error al eliminar la foto" });
    }
};