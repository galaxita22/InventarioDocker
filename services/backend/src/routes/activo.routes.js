import { Router } from 'express';
import { crearActivo, obtenerActivos, obtenerHistorialActivo, obtenerActivoPorId, subirDocumento } from '../controllers/activo.controller.js';
import { requirePermission, verifyToken } from '../middlewares/authJwt.js';
import uploadDocument from '../middlewares/uploadDocument.js';

const router = Router();

// --- RUTAS DE ESCRITURA ---
// POST /api/activos -> Crea un nuevo activo (¡Esta era la que faltaba!)
router.post('/', verifyToken, requirePermission('inventario', 'crear'), crearActivo);

// --- RUTAS DE LECTURA ---
// GET /api/activos -> Trae todos o filtra si hay query params
router.get('/', verifyToken, requirePermission('inventario', 'leer'), obtenerActivos);

// GET /api/activos/:id -> Ficha individual del activo
router.get('/:id', verifyToken, requirePermission('inventario', 'leer'), obtenerActivoPorId);

// GET /api/activos/:id/historial -> Trae la línea de tiempo del activo
router.get('/:id/historial', verifyToken, requirePermission('inventario', 'leer'), obtenerHistorialActivo);

router.post('/:id/documentos', verifyToken, requirePermission('inventario', 'editar'), uploadDocument.single('archivo'), subirDocumento);

export default router;
