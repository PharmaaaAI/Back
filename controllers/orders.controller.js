const httpStatusText = require("../utils/httpStatusText");
const appError = require('../utils/appError')
const asyncWrapper = require('../middleware/asyncWrapper')
const Order = require('../models/orders.model')
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/product.model");
const userRoles = require("../utils/userRoles");
const orderStatus = require("../utils/orderStatus");


const getAllOrders = async (req, res) => {

  let orders;
  const query = req.query;
  const querry = {};
  if(req.currentUser.role === userRoles.CUSTOMER)
    querry.userID = req.currentUser.userId;
  querry
  if(query.limit && query.page)
  {
    
    const limit = query.limit;
    const page = query.page;

    orders = await Order.find(querry, {"__v": false}).limit(limit).skip((page - 1) * limit);
  }
  else
    orders = await Order.find(querry, {"__v": false});

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
  if(order.userID === req.currentUser.userId || req.currentUser.role === userRoles.ADMIN)
    res.status(200).json({status: httpStatusText.SUCCESS, data: order});
  else
  {
    const error = appError.create("You are not authorized to see this order", 401, httpStatusText.FAIL);
    return next(error);
  }
})

const addOrder = asyncWrapper(async (req, res, next) => {

  for (const product of req.body.products) {
      try {
        const prod = await Product.findById(product.productID);
      if (!prod) {
        return next(appError.create(`Product with ID: ${product.productID} not found`, 404, httpStatusText.FAIL));
      }
    }catch{
      const error = appError.create(`Product with ID: ${product.productID} is not valid`, 404, httpStatusText.FAIL);
      return next(error);
    }
  }

  const {paymentMethod, amount} = req.body;

  let data = null
  if(paymentMethod === "Visa"){
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        payment_method_types: ["card"],
      });

      data = {clientSecret: paymentIntent.client_secret};
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const newOrder = new Order({...req.body, userID: req.currentUser.userId});
  await newOrder.save();

  return res.status(201).json({status: httpStatusText.SUCCESS, data});
})

const updateOrder = asyncWrapper(async (req, res, next) => {
  
  const order = await Order.findById(req.params.orderId);
  if(!order)
  {
    const error = appError.create('order not found', 404, httpStatusText.FAIL)
    return next(error);
  }
  if(order.userID !== req.currentUser.userId && req.currentUser.role !== userRoles.ADMIN && req.currentUser.role !== userRoles.DELIVERY)
  {
    const error = appError.create('you are not authorized to update this order', 401, httpStatusText.FAIL)
    return next(error);
  }
  if(!req.body.products && req.currentUser.role === userRoles.CUSTOMER)
  {
    return next(appError.create('enter new products to update', 404, httpStatusText.FAIL));
  }
  if(!req.body.status && req.currentUser.role === userRoles.DELIVERY)
  {
    return next(appError.create('enter new status to update', 404, httpStatusText.FAIL));
  }

  let update = {};
  if(req.currentUser.role === userRoles.CUSTOMER)
  {
    if(order.status === orderStatus.Confirmed)
      update.products = req.body.products;
    else {
      return next(appError.create("can't update order now", 404, httpStatusText.FAIL));
    }
  }
  else if(req.currentUser.role === userRoles.DELIVERY)
    update.status = req.body.status;
  else if(req.currentUser.role === userRoles.ADMIN)
    update = req.body

  const updatedOrder = await Order.updateOne({_id: req.params.orderId}, {$set: {...update}}, { runValidators: true })
  res.json({status: httpStatusText.SUCCESS,data: updatedOrder});
  
})

const deleteOrder = asyncWrapper(async (req, res, next) => {
  const orderId = req.params.orderId;
  const toDelete = await Order.findById(orderId);
  if(!toDelete){
    const error = appError.create("order with this id not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  if(toDelete.userID !== req.currentUser.userId && req.currentUser.role === userRoles.CUSTOMER)
  {
    const error = appError.create("you are not authorized to delete this order", 404, httpStatusText.FAIL);
    return next(error);
  }

  await Order.deleteOne({_id: orderId})

  res.status(200).json({status: httpStatusText.SUCCESS, data: null});
})

module.exports = {
  getAllOrders,
  getSingleOrder,
  addOrder,
  updateOrder,
  deleteOrder,
}