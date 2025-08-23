const express = require('express');
const router = express.Router();
const userController = require('../controllers/login.controller');
const userController2 = require('../controllers/signup.controller');

router.post('/signup', userController2.signup);
router.post('/login', userController.login);

module.exports = router;