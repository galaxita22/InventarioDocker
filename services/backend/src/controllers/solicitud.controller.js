import { Solicitud, Activo, Account } from '../models/index.js';
import * as solicitudService from '../services/solicitud.service.js';

export const crearSolicitud = async (req, res) => {
    try {
        const { 
            activo_id, 
            tipo_operacion, 
            justificacion, 
            ubicacion_destino_id,
            fecha_inicio,
            fecha_fin,
            nombre_nuevo_activo 
        } = req.body;
        
        const account_id = req.account?.id; 

        if (!account_id) return res.status(400).json({ mensaje: "Error de sesión: No se detectó el ID del usuario." });

        if (tipo_operacion !== 'alta' && !activo_id) {
            return res.status(400).json({ mensaje: "Debes seleccionar un activo." });
        }
        if (tipo_operacion === 'alta' && !nombre_nuevo_activo) {
            return res.status(400).json({ mensaje: "Debes ingresar el nombre del nuevo activo a solicitar." });
        }

        const codigo_solicitud = `MOV-${Date.now().toString().slice(-6)}`;
        
        const nuevaSolicitud = await Solicitud.create({
            codigo_solicitud,
            activo_id: tipo_operacion === 'alta' ? null : activo_id,
            solicitante_id: account_id,
            tipo_operacion,
            estado: 'pendiente',
            observaciones: justificacion,
            ubicacion_destino_id: ubicacion_destino_id || null,
            fecha_inicio: fecha_inicio || null,
            fecha_fin: fecha_fin || null,
            nombre_nuevo_activo: nombre_nuevo_activo || null
        });
        
        res.status(201).json({ mensaje: "Solicitud creada exitosamente", solicitud: nuevaSolicitud });
    } catch (error) {
        console.error("❌ Error al crear solicitud:", error);
        res.status(500).json({ mensaje: "Error al crear la solicitud", error: error.message });
    }
};

export const obtenerSolicitudesPendientes = async (req, res) => {
    try {
        const { id, role } = req.account;
        const esAprobador = ['administrador', 'aprobador', 'supervisor'].includes(role.toLowerCase());

        const whereClause = esAprobador ? {} : { solicitante_id: id };

        const solicitudes = await Solicitud.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: [
                { model: Activo, attributes: ['codigo_patrimonial', 'descripcion', 'categoria'] },
                { model: Account, as: 'Solicitante', attributes: ['id', 'nombre_usuario', 'email'] }
            ]
        });
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las solicitudes", error: error.message });
    }
};

export const evaluarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones, datosAlta } = req.body; // Capturamos datosAlta
        const aprobador_id = req.account.id;
        
        const actualizada = await solicitudService.procesarAprobacion(id, estado, observaciones, aprobador_id, datosAlta);
        
        res.status(200).json({ mensaje: `Solicitud ${estado} con éxito`, datos: actualizada });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

export const actualizarEstadoSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        const evaluadorId = req.userId; // Viene del middleware verifyToken

        const solicitud = await Solicitud.findByPk(id);
        if (!solicitud) return res.status(404).json({ mensaje: "Solicitud no encontrada" });

        // REGLA DE NEGOCIO: Nadie evalúa su propia solicitud
        if (String(solicitud.account_id) === String(evaluadorId)) {
            return res.status(403).json({ 
                mensaje: "Auditoría: No tienes permisos para aprobar o rechazar tu propia solicitud." 
            });
        }

        solicitud.estado = estado;
        await solicitud.save();

        res.status(200).json({ mensaje: `Solicitud marcada como ${estado}`, solicitud });
    } catch (error) {
        console.error("🚨 Error al cambiar estado:", error);
        res.status(500).json({ mensaje: "Error al actualizar estado", error: error.message });
    }
};
