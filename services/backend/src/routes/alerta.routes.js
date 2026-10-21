import express from "express";
import * as controllerAlerta from "../controllers/AlertaController.js";
import { isAdministrador, verifyToken } from "../middlewares/authJwt.js";

const router = express.Router();

router.post("/alertas", verifyToken, isAdministrador, controllerAlerta.createAlerta);
router.get("/alertas/activas", controllerAlerta.getAlertasActivas);
router.put("/alertas/:id/desactivar", verifyToken, isAdministrador, controllerAlerta.disableAlerta);
router.delete("/alertas/:id", verifyToken, isAdministrador, controllerAlerta.deleteAlerta);

export default router;
