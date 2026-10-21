import { Router } from 'express';
import { crearSolicitud, obtenerSolicitudesPendientes, evaluarSolicitud } from '../controllers/solicitud.controller.js';
import { verifyToken, isAprobador } from '../middlewares/authJwt.js';

const router = Router();

// Creación (Cualquier usuario logueado)
router.post('/', verifyToken, crearSolicitud);

// Aprobaciones (Solo roles autorizados) -> ¡Rutas corregidas!
router.get('/', verifyToken, isAprobador, obtenerSolicitudesPendientes);
router.put('/:id/evaluar', verifyToken, isAprobador, evaluarSolicitud);

export default router;
