import express from 'express';
import userController from '../controllers/users.controller.js';
import verifyToken from "../middleware/verifyToken.js";
import allowedTo from "../middleware/allowedTo.js";
import userRoles from '../utils/userRoles.js';

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.signin);
router.get('/', verifyToken, allowedTo(userRoles.ADMIN), userController.getAllUsers)
router.route('/:userID')
  .get(verifyToken, userController.getUserInfo)
  .patch(verifyToken, userController.updateInfo)

export default router;