const express = require('express');

const orderController = require('../controllers/orders.controller')

const router = express.Router();

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.route('/')
  .get(orderController.getAllOrders)
  .post(orderController.addOrder)

router.route('/:orderId')
  .get(orderController.getSingleOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder)


module.exports = router