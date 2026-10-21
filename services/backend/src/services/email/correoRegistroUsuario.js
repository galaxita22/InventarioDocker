import { escaparHtml, obtenerNombreCuenta } from "./utilidadesCorreo.js";

export const crearCorreoRegistroUsuario = ({ account, password }) => {
    if (!account || !account.email) {
        throw new Error("No se puede crear correo de registro sin email de cuenta");
    }

    if (!password) {
        throw new Error("No se puede crear correo de registro sin contraseña temporal");
    }

    const name = obtenerNombreCuenta(account);
    const safeName = escaparHtml(name);
    const safeEmail = escaparHtml(account.email);
    const safePassword = escaparHtml(password);
    return {
        subject: "Registro confirmado en Inventario MKT",
        text: `Hola ${name}, tu registro en Inventario MKT fue confirmado con el correo ${account.email}. Tu contraseña temporal es: ${password}. Por favor, cambia tu contraseña al iniciar sesión por primera vez.`,
        html: `
            <p>Hola ${safeName},</p>
            <p>Tu registro en Inventario MKT fue confirmado correctamente.</p>
            <p>Correo registrado: <strong>${safeEmail}</strong>.</p>
            <p>Tu contraseña temporal es: <strong>${safePassword}</strong></p>
            <p>Por favor, cambia tu contraseña al iniciar sesión por primera vez para asegurar la seguridad de tu cuenta.</p>
            <p>Saludos,<br/>Equipo Inventario MKT</p>
        `
    };
};
