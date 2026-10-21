import express from "express";
import * as controllerAccount from "../controllers/AccountController.js";
import { isAdministrador, verifyToken } from "../middlewares/authJwt.js";
import uploadImage from "../middlewares/uploadImage.js";

const router = express.Router();

router.post("/login", controllerAccount.login);
router.post("/renew-token", controllerAccount.renewToken);
router.get("/sso-callback", controllerAccount.ssoCallback);
router.put("/change-password/:id", verifyToken, controllerAccount.updatePassword);
router.get("/:id", verifyToken, controllerAccount.getByID);

router.post("/register", controllerAccount.register);
router.put("/:id", verifyToken, isAdministrador, controllerAccount.update);
router.delete("/:id", verifyToken, isAdministrador, controllerAccount.deleteAccount);

router.get("/", verifyToken, isAdministrador, controllerAccount.getAllUsers);

router.patch("/first-login/:id", verifyToken, controllerAccount.firstLoginFalse);
router.post("/:id/avatar", verifyToken, uploadImage.single("imagen"), controllerAccount.uploadAvatar);
router.delete("/:id/avatar", verifyToken, controllerAccount.removeAvatar);
export default router;
