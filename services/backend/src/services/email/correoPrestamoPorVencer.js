import { escaparHtml, formatearFecha, obtenerCodigoPrestamo, obtenerNombreCuenta } from "./utilidadesCorreo.js";

export const crearCorreoPrestamoPorVencer = ({ account, prestamo, daysRemaining }) => {
    if (!account || !account.email) {
        throw new Error("No se puede crear aviso de préstamo por vencer sin email de cuenta");
    }

    const name = obtenerNombreCuenta(account);
    const code = obtenerCodigoPrestamo(prestamo);
    const dueDate = formatearFecha(prestamo?.fecha_estimada_devolucion);
    const daysText = daysRemaining !== undefined && daysRemaining !== null
        ? `Quedan ${daysRemaining} día(s) para la devolución.`
        : "La fecha de devolución está próxima.";

    return {
        subject: "Préstamo por vencer",
        text: `Hola ${name}, tu préstamo ${code} está por vencer. Fecha estimada de devolución: ${dueDate}. ${daysText} Saludos, Equipo Inventario MKT`.trim(),
        html: `
            <p>Hola ${escaparHtml(name)},</p>
            <p>Tu préstamo <strong>${escaparHtml(code)}</strong> está por vencer.</p>
            <p>Fecha estimada de devolución: <strong>${escaparHtml(dueDate)}</strong>.</p>
            <p>${escaparHtml(daysText)}</p>
            
            <p>Si tienes dudas o requieres más información, responde a este correo o contacta al encargado del laboratorio. </p>

            <br><p>Saludos,<br><strong> Equipo Inventario MKT</strong></p>
        `
    };
};
