import { Router } from 'express';
import { crearEstablecimiento, obtenerEstablecimientos } from '../controllers/establecimiento.controller.js';


const router = Router();

router.post('/', crearEstablecimiento);
router.get('/', obtenerEstablecimientos);

export default router;