const httpStatusText = require("../utils/httpStatusText");
const appError = require('../utils/appError')
const asyncWrapper = require('../middleware/asyncWrapper')
const Order = require('../models/orders.model')

const getAllOrders = async (req, res) => {
  const orders = await Order.find();
  res.status(200).json({status: httpStatusText.SUCCESS, data: orders});
}

const getSingleOrder = asyncWrapper(async(req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);
  if(!order)
  {
    const error = appError.create('order not found', 404, httpStatusText.FAIL)
    return next(error);
  }

  res.status(200).json({status: httpStatusText.SUCCESS, data: order});
})

const addOrder = asyncWrapper(async (req, res, next) => {
  const newOrder = new Order(req.body);
  await newOrder.save();

  res.status(201).json({status: httpStatusText.SUCCESS,data: {newOrder}});
})

const updateOrder = asyncWrapper(async (req, res, next) => {
  const updatedOrder = await Order.updateOne({_id: req.params.orderId}, {$set: {...req.body}})
  res.json({status: httpStatusText.SUCCESS,data: {updatedCart: updatedOrder}});
  
})

const deleteOrder = asyncWrapper(async (req, res, next) => {
  const orderId = req.params.orderId;
  await Order.deleteOne({_id: orderId});
  res.status(200).json({status: httpStatusText.SUCCESS, data: null});
  
})

module.exports = {
  getAllOrders,
  getSingleOrder,
  addOrder,
  updateOrder,
  deleteOrder
}