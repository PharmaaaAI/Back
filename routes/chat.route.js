import express from 'express';
import { getChatRecommendations } from '../controllers/chat.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/recommend', verifyToken, getChatRecommendations);

export default router;
