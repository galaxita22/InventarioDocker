import { escaparHtml, formatearFechaHora, obtenerNombreCuenta } from "./utilidadesCorreo.js";

export const crearCorreoAlertaCambioContrasena = ({ account, changedAt = new Date() }) => {
    if (!account || !account.email) {
        throw new Error("No se puede crear alerta de contraseña sin email de cuenta");
    }

    const name = obtenerNombreCuenta(account);
    const safeName = escaparHtml(name);
    const safeDate = escaparHtml(formatearFechaHora(changedAt));

    return {
        subject: "Alerta de cambio de contraseña",
        text: `Hola ${name}, tu contraseña de Inventario MKT fue cambiada el ${formatearFechaHora(changedAt)}. Si no realizaste este cambio, contacta al equipo de soporte.`,
        html: `
            <p>Hola ${safeName},</p>
            <p>Te informamos que la contraseña de tu cuenta de Inventario MKT fue cambiada.</p>
            <p>Fecha del cambio: <strong>${safeDate}</strong>.</p>
            <p>Si no realizaste este cambio, contacta al equipo de soporte.</p>
            <p>Saludos,<br/>Equipo Inventario MKT</p>
        `
    };
};
