const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require('../utils/userRoles');
const passport = require("passport");

router.post('/signup', userController.signup);
router.post('/login', userController.signin);
router.get('/', verifyToken, allowedTo(userRoles.ADMIN), userController.getAllUsers)


router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  userController.callback
);

router.route('/:userID')
  .get(verifyToken, userController.getUserInfo)
  .patch(verifyToken, userController.updateInfo)
router.route('/:userID/cart')
  .get(verifyToken, userController.getUserCart)
  .patch(verifyToken, userController.updateCart)

module.exports = router;