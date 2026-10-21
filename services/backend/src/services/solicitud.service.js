import sequelize from '../database/connection.js';
import { Solicitud, Activo } from '../models/index.js';

// Rescatado de tu antiguo prestamoService.js, adaptado a roles SLEP
const PREFIJO_POR_ROL = {
    administrador: 'ADM',
    supervisor: 'SUP',
    aprobador: 'APR',
    solicitante: 'SOL'
};

const formatearFechaCodigo = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

// Generador de código rescatado de tu lógica antigua
export const generarCodigoSolicitud = async (role, fecha) => {
    const prefijo = PREFIJO_POR_ROL[role] || 'SOL';
    const fechaCodigo = formatearFechaCodigo(fecha);
    
    // Contamos las solicitudes para generar el correlativo
    const totalDelDia = await Solicitud.count();
    const correlativo = String(totalDelDia + 1).padStart(4, '0');
    
    return `${prefijo}-${fechaCodigo}-${correlativo}`;
};

export const procesarAprobacion = async (id, estado, observaciones, aprobador_id) => {
    // Iniciamos la transacción de seguridad
    const transaction = await sequelize.transaction();

    try {
        const solicitud = await Solicitud.findByPk(id, { transaction });
        if (!solicitud) throw new Error("Solicitud no encontrada");

        if (solicitud.solicitante_id === aprobador_id) {
            throw new Error("Por políticas de transparencia, no puedes aprobar tu propia solicitud.");
        }

        if (['rechazada', 'devuelta'].includes(estado) && (!observaciones || observaciones.trim() === '')) {
            throw new Error("Debe ingresar una observación al rechazar o devolver la solicitud.");
        }

        solicitud.estado = estado;
        solicitud.aprobador_id = aprobador_id;
        if (observaciones) solicitud.observaciones = observaciones;

        // EL IMPACTO EN EL INVENTARIO
        if (estado === 'aprobada') {
            const activo = await Activo.findByPk(solicitud.activo_id, { transaction });
            if (!activo) throw new Error("El activo vinculado no existe");

            if (solicitud.tipo_operacion === 'traslado') {
                if (!solicitud.ubicacion_destino_id) {
                    throw new Error("Un traslado requiere tener una ubicación de destino");
                }
                activo.ubicacion_id = solicitud.ubicacion_destino_id;
                
            } else if (solicitud.tipo_operacion === 'baja') {
                activo.estado_conservacion = 'obsoleto';
            }

            await activo.save({ transaction });
        }

        await solicitud.save({ transaction });
        
        // Confirmamos y guardamos ambos cambios en MySQL
        await transaction.commit();
        return solicitud;

    } catch (error) {
        // Si cualquier cosa falla, deshacemos todos los cambios
        await transaction.rollback();
        throw error;
    }
};