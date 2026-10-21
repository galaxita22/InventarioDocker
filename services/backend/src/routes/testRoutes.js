import express from "express";

import { enviarCorreoRegistroUsuario } from "../services/servicioCorreo.js";
import { procesarTodosLosRecordatorios } from "../services/prestamoReminder.service.js";

const router = express.Router();

router.get("/correo-registro", async (req, res) => {
    const email = req.query.email || process.env.MAIL_TO;
    const nombre_usuario = req.query.nombre_usuario || "Usuario de prueba";
    const password = req.query.password || "Temporal123!";

    if (!email) {
        return res.status(400).json({
            ok: false,
            error: "Debes enviar ?email=correo@dominio.com o configurar MAIL_TO"
        });
    }

    try {
        const info = await enviarCorreoRegistroUsuario({ email, nombre_usuario }, password);

        res.json({
            ok: true,
            message: "Correo de registro enviado",
            messageId: info.messageId || null
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

router.get("/trigger-reminder", async (req, res) => {
    try {
        await procesarTodosLosRecordatorios();
        res.json({
            ok: true,
            message: "Recordatorios de préstamos procesados/enviados con éxito."
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

export default router;
