export const escaparHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const obtenerNombreCuenta = (account = {}) => account.nombre_usuario || account.email || "usuario";

export const formatearFecha = (value) => {
    if (!value) return "sin fecha registrada";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
};

export const formatearFechaHora = (value) => {
    if (!value) return "sin fecha registrada";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export const obtenerCodigoPrestamo = (prestamo = {}) => prestamo.codigo_peticion || `#${prestamo.id || "sin codigo"}`;

export const obtenerCodigoReserva = (reserva = {}) => `#${reserva.id || "sin codigo"}`;

export const obtenerNombreComponente = (component = {}) => component.modelo || component.nombre || component.sku || "producto solicitado";

export const normalizarEstado = (status) => String(status || "").toLowerCase();

export const obtenerEtiquetaEstado = (status) => {
    const normalized = normalizarEstado(status);

    if (["aprobado", "aceptado", "aceptada"].includes(normalized)) return "aceptada";
    if (["rechazado", "rechazada"].includes(normalized)) return "rechazada";

    return status || "actualizada";
};
