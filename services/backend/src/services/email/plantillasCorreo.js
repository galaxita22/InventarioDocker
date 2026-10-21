import { crearCorreoRegistroUsuario } from "./correoRegistroUsuario.js";
import { crearCorreoAlertaCambioContrasena } from "./correoAlertaCambioContrasena.js";
import { crearCorreoEstadoPrestamo } from "./correoEstadoPrestamo.js";
import { crearCorreoPrestamoPorVencer } from "./correoPrestamoPorVencer.js";
import { crearCorreoPrestamoVencido } from "./correoPrestamoVencido.js";

export const NOMBRES_PLANTILLAS_CORREO = Object.freeze({
    REGISTRO_USUARIO: "registroUsuario",
    ALERTA_CAMBIO_CONTRASENA: "alertaCambioContrasena",
    ESTADO_PRESTAMO: "estadoPrestamo",
    PRESTAMO_POR_VENCER: "prestamoPorVencer",
    PRESTAMO_VENCIDO: "prestamoVencido"
});

const plantillasCorreo = {
    [NOMBRES_PLANTILLAS_CORREO.REGISTRO_USUARIO]: crearCorreoRegistroUsuario,
    [NOMBRES_PLANTILLAS_CORREO.ALERTA_CAMBIO_CONTRASENA]: crearCorreoAlertaCambioContrasena,
    [NOMBRES_PLANTILLAS_CORREO.ESTADO_PRESTAMO]: crearCorreoEstadoPrestamo,
    [NOMBRES_PLANTILLAS_CORREO.PRESTAMO_POR_VENCER]: crearCorreoPrestamoPorVencer,
    [NOMBRES_PLANTILLAS_CORREO.PRESTAMO_VENCIDO]: crearCorreoPrestamoVencido
};

export const crearPlantillaCorreo = (nombrePlantilla, parametros = {}) => {
    const plantilla = plantillasCorreo[nombrePlantilla];
    if (!plantilla) {
        throw new Error(`La plantilla de correo "${nombrePlantilla}" no existe`);
    }
    return plantilla(parametros);
};