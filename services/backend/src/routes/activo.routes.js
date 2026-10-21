import { Router } from 'express';
import { crearActivo, obtenerActivos, obtenerHistorialActivo, obtenerActivoPorId, subirDocumento } from '../controllers/activo.controller.js';
import { verifyToken } from '../middlewares/authJwt.js';
import uploadDocument from '../middlewares/uploadDocument.js';

const router = Router();

// --- RUTAS DE ESCRITURA ---
// POST /api/activos -> Crea un nuevo activo (¡Esta era la que faltaba!)
router.post('/', verifyToken, crearActivo);

// --- RUTAS DE LECTURA ---
// GET /api/activos -> Trae todos o filtra si hay query params
router.get('/', verifyToken, obtenerActivos);

// GET /api/activos/:id -> Ficha individual del activo
router.get('/:id', verifyToken, obtenerActivoPorId);

// GET /api/activos/:id/historial -> Trae la línea de tiempo del activo
router.get('/:id/historial', verifyToken, obtenerHistorialActivo);

router.post('/:id/documentos', verifyToken, uploadDocument.single('archivo'), subirDocumento);

export default router;
