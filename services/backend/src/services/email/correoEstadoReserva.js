import {escaparHtml, formatearFecha, obtenerEtiquetaEstado, obtenerNombreCuenta} from "./utilidadesCorreo.js";

// Correo para informar el estado de un préstamo
export const crearCorreoEstadoReserva = ({account, reserva, laboratorio}) => {

    if (!account || !account.email) {
        throw new Error("No se puede crear correo de reserva sin email de cuenta");
    }

    const name = obtenerNombreCuenta(account);
    const labName = laboratorio?.nombre || "desconocido";
    const estimatedReturn = formatearFecha(reserva?.fecha_reserva);

    return {
        subject: `Solicitud de reserva`,
        text: `Hola ${name}, se reservó el laboratorio ${labName}. Saludos, Equipo Inventario MKT`.trim(),
        html: `
            <p>Hola ${escaparHtml(name)},</p>
            <p>Se ha hecho una reservación del laboratorio ${labName} para la fecha <strong>${escaparHtml(estimatedReturn)}</strong>.</p>

            <p>Si tienes dudas o requieres más información, responde a este correo o contacta al encargado del laboratorio. </p>

            <br><p>Saludos,<br><strong> Equipo Inventario MKT</strong></p>
        `
    };
};