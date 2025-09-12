const express = require('express');
const { getChatRecommendations } = require('../controllers/chat.controller.js');
const verifyToken = require('../middleware/verifyToken.js');

const router = express.Router();

router.post('/recommend', verifyToken, getChatRecommendations);

module.exports = router;
