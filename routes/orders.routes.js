const express = require('express');
const orderController = require('../controllers/orders.controller')
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require('../utils/userRoles');

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.route('/')
  .get(verifyToken, orderController.getAllOrders)
  .post(verifyToken, orderController.addOrder)

router.route('/:orderId')
  .get(verifyToken, orderController.getSingleOrder)
  .patch(verifyToken, orderController.updateOrder)
  .delete(verifyToken, orderController.deleteOrder)


module.exports = router