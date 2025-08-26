const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require('../utils/userRoles');

router.post('/signup', userController.signup);
router.post('/login', userController.signin);
router.get('/', verifyToken, allowedTo(userRoles.ADMIN), userController.getAllUsers)
router.route('/:userID')
  .get(verifyToken, userController.getUserInfo)
  .patch(verifyToken, userController.updateInfo)

module.exports = router;