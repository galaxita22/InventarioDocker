import nodemailer from "nodemailer";
import { crearPlantillaCorreo, NOMBRES_PLANTILLAS_CORREO } from "./email/plantillasCorreo.js";

let transportador;

const obtenerConfiguracionCorreo = () => {
    const host = process.env.MAIL_HOST || process.env.SMTP_HOST || "smtp.mailtrap.io";
    const port = Number.parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || "587", 10);
    const user = process.env.MAIL_USER || process.env.SMTP_USER;
    const pass = process.env.MAIL_PASS || process.env.SMTP_PASS;

    return {
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
        from: process.env.MAIL_FROM || process.env.SMTP_FROM || "Inventario MKT <no-reply@localhost>"
    };
};

const obtenerTransportador = () => {
    if (transportador) return transportador;

    const { host, port, secure, auth } = obtenerConfiguracionCorreo();

    transportador = nodemailer.createTransport({
        host,
        port,
        secure,
        auth
    });

    return transportador;
};

const normalizarDestinatarios = (value) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value.filter(Boolean) : value;
};

const construirOpcionesCorreo = ({
    to,
    cc,
    bcc,
    replyTo,
    subject,
    text,
    html,
    attachments,
    headers,
    from
} = {}) => {
    const config = obtenerConfiguracionCorreo();
    const opcionesCorreo = {
        from: from || config.from,
        to: normalizarDestinatarios(to),
        cc: normalizarDestinatarios(cc),
        bcc: normalizarDestinatarios(bcc),
        replyTo,
        subject,
        text,
        html,
        attachments,
        headers
    };

    Object.keys(opcionesCorreo).forEach((key) => {
        if (opcionesCorreo[key] === undefined || opcionesCorreo[key] === null) {
            delete opcionesCorreo[key];
        }
    });

    if (!opcionesCorreo.to && !opcionesCorreo.cc && !opcionesCorreo.bcc) {
        throw new Error("No se puede enviar correo sin destinatario");
    }

    if (!opcionesCorreo.subject) {
        throw new Error("No se puede enviar correo sin asunto");
    }

    if (!opcionesCorreo.text && !opcionesCorreo.html) {
        throw new Error("No se puede enviar correo sin contenido");
    }

    return opcionesCorreo;
};

export const enviarCorreo = async (parametrosCorreo = {}) => {
    const t = obtenerTransportador();
    const opcionesCorreo = construirOpcionesCorreo(parametrosCorreo);

    return await t.sendMail(opcionesCorreo);
};

export const enviarCorreoConPlantilla = async (nombrePlantilla, parametrosPlantilla = {}, parametrosCorreo = {}) => {
    const contenidoPlantilla = crearPlantillaCorreo(nombrePlantilla, parametrosPlantilla);

    return await enviarCorreo({
        ...contenidoPlantilla,
        ...parametrosCorreo
    });
};

const obtenerEmailDestinatario = (account) => {
    if (!account || !account.email) {
        throw new Error("No se puede enviar correo sin email de cuenta");
    }

    return account.email;
};

export const enviarCorreoRegistroUsuario = async (account, password) => {
    return await enviarCorreoConPlantilla(
        NOMBRES_PLANTILLAS_CORREO.REGISTRO_USUARIO,
        { account, password },
        { to: obtenerEmailDestinatario(account) }
    );
};

export const enviarAlertaCambioContrasena = async (account, changedAt = new Date()) => {
    return await enviarCorreoConPlantilla(
        NOMBRES_PLANTILLAS_CORREO.ALERTA_CAMBIO_CONTRASENA,
        { account, changedAt },
        { to: obtenerEmailDestinatario(account) }
    );
};

export const enviarCorreoEstadoPrestamo = async ({ account, prestamo, estado, message }) => {
    return await enviarCorreoConPlantilla(
        NOMBRES_PLANTILLAS_CORREO.ESTADO_PRESTAMO,
        { account, prestamo, estado, message },
        { to: obtenerEmailDestinatario(account) }
    );
};

export const enviarCorreoEstadoReserva = async ({ account, reserva, laboratorio }) => {
    return await enviarCorreoConPlantilla(
        NOMBRES_PLANTILLAS_CORREO.ESTADO_RESERVA,
        { account, reserva, laboratorio },
        { to: obtenerEmailDestinatario(account) }
    );
};

export const enviarCorreoInicioNegociacion = async ({ account, prestamo, component, oferta, message }) => {
    return await enviarCorreoConPlantilla(
        NOMBRES_PLANTILLAS_CORREO.INICIO_NEGOCIACION,
        { account, prestamo, component, oferta, message },
        { to: obtenerEmailDestinatario(account) }
    );
};

export const enviarCorreoPrestamoPorVencer = async ({ account, prestamo, daysRemaining }) => {
    return await enviarCorreoConPlantilla(
        NOMBRES_PLANTILLAS_CORREO.PRESTAMO_POR_VENCER,
        { account, prestamo, daysRemaining },
        { to: obtenerEmailDestinatario(account) }
    );
};

export const enviarCorreoPrestamoVencido = async ({ account, prestamo }) => {
    return await enviarCorreoConPlantilla(
        NOMBRES_PLANTILLAS_CORREO.PRESTAMO_VENCIDO,
        { account, prestamo },
        { to: obtenerEmailDestinatario(account) }
    );
};


export { NOMBRES_PLANTILLAS_CORREO };
