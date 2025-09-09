import SUCCESS from "../utils/httpStatusText.js";
import FAIL  from "../utils/httpStatusText.js";
import create from '../utils/appError.js';
import asyncWrapper from '../middleware/asyncWrapper.js';
import Order from '../models/orders.model.js';
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import userRoles from "../utils/userRoles.js";
import Confirmed from "../utils/orderStatus.js";

const { CUSTOMER, ADMIN, DELIVERY } = userRoles;
const getAllOrders = async (req, res) => {

  let orders;
  const query = req.query;
  const querry = {};
  if(req.currentUser.role === CUSTOMER)
    querry.userID = req.currentUser.userId;
  querry
  if(query.limit && query.page)
  {
    
    const limit = query.limit;
    const page = query.page;

    orders = await find(querry, {"__v": false}).limit(limit).skip((page - 1) * limit);
  }
  else
    orders = await find(querry, {"__v": false});

  res.status(200).json({status: SUCCESS, data: orders});
}

const getSingleOrder = asyncWrapper(async(req, res, next) => {
  const orderId = req.params.orderId;
  const order = await findById(orderId);
  if(!order)
  {
    const error = create('order not found', 404, FAIL)
    return next(error);
  }
  if(order.userID === req.currentUser.userId || req.currentUser.role === ADMIN)
    res.status(200).json({status: SUCCESS, data: order});
  else
  {
    const error = create("You are not authorized to see this order", 401, FAIL);
    return next(error);
  }
})

const addOrder = asyncWrapper(async (req, res, next) => {

  let amount = 0;
  
  for (const product of req.body.products) {
      try {
        const prod = await _findById(product.productID);
      if (!prod) {
        return next(create(`Product with ID: ${product.productID} not found`, 404, FAIL));
      }
      amount += prod.price * product.quantity;
    }catch{
      const error = create(`Product with ID: ${product.productID} is not valid`, 404, FAIL);
      return next(error);
    }
  }


  let data = null
  if(req.body.paymentMethod === "Visa"){
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

  return res.status(201).json({status: SUCCESS, data});
})

const updateOrder = asyncWrapper(async (req, res, next) => {
  
  const order = await findById(req.params.orderId);
  if(!order)
  {
    const error = create('order not found', 404, FAIL)
    return next(error);
  }
  if(order.userID !== req.currentUser.userId && req.currentUser.role !== ADMIN && req.currentUser.role !== DELIVERY)
  {
    const error = create('you are not authorized to update this order', 401, FAIL)
    return next(error);
  }
  if(!req.body.products && req.currentUser.role === CUSTOMER)
  {
    return next(create('enter new products to update', 404, FAIL));
  }
  if(!req.body.status && req.currentUser.role === DELIVERY)
  {
    return next(create('enter new status to update', 404, FAIL));
  }

  let update = {};
  if(req.currentUser.role === CUSTOMER)
  {
    if(order.status === Confirmed)
      update.products = req.body.products;
    else {
      return next(create("can't update order now", 404, FAIL));
    }
  }
  else if(req.currentUser.role === DELIVERY)
    update.status = req.body.status;
  else if(req.currentUser.role === ADMIN)
    update = req.body

  const updatedOrder = await updateOne({_id: req.params.orderId}, {$set: {...update}}, { runValidators: true })
  res.json({status: SUCCESS,data: updatedOrder});
  
})

const deleteOrder = asyncWrapper(async (req, res, next) => {
  const orderId = req.params.orderId;
  const toDelete = await findById(orderId);
  if(!toDelete){
    const error = create("order with this id not found", 404, FAIL);
    return next(error);
  }

  if(toDelete.userID !== req.currentUser.userId && req.currentUser.role === CUSTOMER)
  {
    const error = create("you are not authorized to delete this order", 404, FAIL);
    return next(error);
  }

  await deleteOne({_id: orderId})

  res.status(200).json({status: SUCCESS, data: null});
})

export {
  getAllOrders,
  getSingleOrder,
  addOrder,
  updateOrder,
  deleteOrder
}