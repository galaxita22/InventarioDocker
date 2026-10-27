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

export const procesarAprobacion = async (id, estado, observaciones, aprobador_id, datosAlta = null) => {
    const transaction = await sequelize.transaction();
    try {
        const solicitud = await Solicitud.findByPk(id, { transaction });
        if (!solicitud) throw new Error("Solicitud no encontrada");

        if (solicitud.solicitante_id === aprobador_id) {
            throw new Error("Por políticas de transparencia, no puedes aprobar tu propia solicitud.");
        }

        solicitud.estado = estado;
        solicitud.aprobador_id = aprobador_id;
        if (observaciones) solicitud.observaciones = observaciones;

        if (estado === 'aprobada') {
            if (solicitud.tipo_operacion === 'alta') {
                if (!datosAlta) throw new Error("Debe clasificar el activo (categoría, ubicación, etc) para aprobar un alta.");
                
                const nuevoCodigo = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
                
                const nuevoActivo = await Activo.create({
                    codigo_patrimonial: nuevoCodigo,
                    descripcion: solicitud.nombre_nuevo_activo,
                    categoria: datosAlta.categoria,
                    estado_conservacion: datosAlta.estado_conservacion,
                    valor: datosAlta.valor || 0,
                    ubicacion_id: datosAlta.ubicacion_id
                }, { transaction });

                solicitud.activo_id = nuevoActivo.id;
            } else {
                // ... (MANTÉN TU LÓGICA ACTUAL PARA TRASLADOS Y BAJAS AQUÍ) ...
                const activo = await Activo.findByPk(solicitud.activo_id, { transaction });
                if (!activo) throw new Error("El activo vinculado no existe");

                if (solicitud.tipo_operacion === 'traslado') {
                    activo.ubicacion_id = solicitud.ubicacion_destino_id;
                } else if (solicitud.tipo_operacion === 'baja') {
                    activo.estado_conservacion = 'obsoleto';
                }
                await activo.save({ transaction });
            }
        }

        await solicitud.save({ transaction });
        await transaction.commit();
        return solicitud;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};