import { Router } from 'express';
import * as rolesCtrl from '../controllers/roles.controller.js';
import { requirePermission, verifyToken } from '../middlewares/authJwt.js';

const router = Router();

router.get('/', verifyToken, requirePermission('usuarios', 'leer'), rolesCtrl.obtenerRoles);
router.get('/permisos', verifyToken, requirePermission('usuarios', 'leer'), rolesCtrl.obtenerPermisos);
router.put('/:id/permisos', verifyToken, requirePermission('usuarios', 'editar'), rolesCtrl.actualizarPermisosRol);

export default router;