// src/routes/chat.routes.js
import { Router } from 'express';
import { responderChatIA } from '../controllers/chat.controller.js';

const router = Router();

router.post('/', responderChatIA);

export default router;
