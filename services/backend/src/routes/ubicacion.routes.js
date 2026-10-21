import { Router } from 'express';
import { crearUbicacion, obtenerUbicaciones } from '../controllers/ubicacion.controller.js';

const router = Router();

router.post('/', crearUbicacion);
router.get('/', obtenerUbicaciones);

export default router;