const express = require('express');

const orderController = require('../controllers/orders.controller')

const router = express.Router();


router.route('/')
  .get(orderController.getAllOrders)
  .post(orderController.addOrder)

router.route('/:orderId')
  .get(orderController.getSingleOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder)

module.exports = router