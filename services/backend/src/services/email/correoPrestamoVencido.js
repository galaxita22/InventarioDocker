import { escaparHtml, formatearFecha, obtenerCodigoPrestamo, obtenerNombreCuenta } from "./utilidadesCorreo.js";

export const crearCorreoPrestamoVencido = ({ account, prestamo }) => {
    if (!account || !account.email) {
        throw new Error("No se puede crear aviso de préstamo vencido sin email de cuenta");
    }

    const name = obtenerNombreCuenta(account);
    const code = obtenerCodigoPrestamo(prestamo);
    const dueDate = formatearFecha(prestamo?.fecha_estimada_devolucion);

    return {
        subject: "Préstamo vencido",
        text: `Hola ${name}, tu préstamo ${code} ha vencido. La fecha estimada de devolución era ${dueDate}. Por favor regulariza la devolución lo antes posible. Saludos, Equipo Inventario MKT`.trim(),
        html: `
            <p>Hola ${escaparHtml(name)},</p>
            <p>Tu préstamo <strong>${escaparHtml(code)}</strong> ha vencido.</p>
            <p>Fecha estimada de devolución: <strong>${escaparHtml(dueDate)}</strong>.</p>
            <p>Por favor regulariza la devolución lo antes posible.</p>
            
            <p>Si tienes dudas o requieres más información, responde a este correo o contacta al encargado del laboratorio. </p>

            <br><p>Saludos,<br><strong> Equipo Inventario MKT</strong></p>
        `
    };
};
