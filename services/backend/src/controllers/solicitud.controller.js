import { Solicitud, Activo, Account } from '../models/index.js';
import * as solicitudService from '../services/solicitud.service.js';

export const crearSolicitud = async (req, res) => {
try {
        // 1. Recibimos los datos exactos que manda el frontend
        const { activo_id, tipo_operacion, justificacion, ubicacion_destino_id } = req.body;
        
        // 2. Extraemos el ID del usuario de forma segura desde el token
        const account_id = req.account?.id;
	if (!activo_id) return res.status(400).json({ mensaje: "Debes seleccionar un activo." });
        if (!account_id) return res.status(400).json({ mensaje: "Error de sesión: No se detectó el ID del usuario." });

        const codigo_solicitud = `MOV-${Date.now().toString().slice(-6)}`;

        const nuevaSolicitud = await Solicitud.create({
            codigo_solicitud,
            activo_id,
            account_id,
            tipo_operacion,
            estado: 'Pendiente',
            justificacion,
            ubicacion_destino_id: ubicacion_destino_id || null
        });

        res.status(201).json({ mensaje: "Solicitud creada exitosamente", solicitud: nuevaSolicitud });
    } catch (error) {
        console.error("🚨 Error al crear solicitud:", error);
        res.status(500).json({ mensaje: "Error al crear la solicitud", error: error.message });
    }
};

// Nueva función: Solo para aprobadores
export const obtenerSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await Solicitud.findAll({
            where: { estado: 'pendiente' },
            include: [
                { model: Activo, attributes: ['codigo_patrimonial', 'descripcion'] },
                // ¡AQUÍ FALTABA TRAER EL ID DEL USUARIO!
                { model: Account, as: 'Solicitante', attributes: ['id', 'nombre_usuario', 'email'] }
            ]
        });
        res.status(200).json(solicitudes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las solicitudes", error: error.message });
    }
};

// Nueva función: Evaluar la solicitud
export const evaluarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body;
        const aprobador_id = req.account.id;

        const actualizada = await solicitudService.procesarAprobacion(id, estado, observaciones, aprobador_id);
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
