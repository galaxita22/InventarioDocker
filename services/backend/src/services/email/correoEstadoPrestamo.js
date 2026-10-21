import {escaparHtml, formatearFecha, obtenerCodigoPrestamo, obtenerEtiquetaEstado, obtenerNombreCuenta} from "./utilidadesCorreo.js";

// Correo para informar el estado de un préstamo
export const crearCorreoEstadoPrestamo = ({account, prestamo, estado, message}) => {

    if (!account || !account.email) {
        throw new Error("No se puede crear correo de préstamo sin email de cuenta");
    }

    const name = obtenerNombreCuenta(account);
    const statusLabel = obtenerEtiquetaEstado(estado || prestamo?.estado);
    const code = obtenerCodigoPrestamo(prestamo);
    const estimatedReturn = formatearFecha(prestamo?.fecha_estimada_devolucion);
    const safeMessage = message? `<p><strong>Detalle:</strong> ${escaparHtml(message)}</p>`: "";

    const returnDateHtml =statusLabel === "aceptada"? `<p>Fecha límite de devolución: <strong>${escaparHtml(estimatedReturn)}</strong></p>`: "";
    const returnDateText =statusLabel === "aceptada"? `Fecha límite de devolución: ${estimatedReturn}.`: "";

    return {
        subject: `Solicitud de préstamo ${statusLabel}`,
        text: `Hola ${name},Tu solicitud de préstamo ${code} fue ${statusLabel}.${returnDateText}${message || ""}Saludos, Equipo Inventario MKT`.trim(),
        html: `
            <p>Hola ${escaparHtml(name)},</p>
            <p>Tu solicitud de préstamo <strong>${escaparHtml(code)}</strong> fue <strong>${escaparHtml(statusLabel)}</strong>.</p>
            
            ${returnDateHtml}
            ${safeMessage}

            <p>Si tienes dudas o requieres más información, responde a este correo o contacta al encargado del laboratorio. </p>

            <br><p>Saludos,<br><strong> Equipo Inventario MKT</strong></p>
        `
    };
};