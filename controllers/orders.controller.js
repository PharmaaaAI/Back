const httpStatusText = require("../utils/httpStatusText");
const appError = require('../utils/appError')
const asyncWrapper = require('../middleware/asyncWrapper')
const Order = require('../models/orders.model')
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/product.model")


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

  let amount = 0;
  try {
    for (const product of req.body.products) {
      const prod = await Product.findById(product.productID);
      if (!prod) {
        return next(appError.create("Product not found", 404, httpStatusText.FAIL));
      }
      amount += prod.price * product.quantity;
    }
  }catch{
    const error = appError.create("the product Id is not valid", 404, httpStatusText.FAIL);
    return next(error);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const newOrder = new Order(req.body);
  await newOrder.save();

  return res.status(201).json({status: httpStatusText.SUCCESS,data: null});
})

const confirmPayment = (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("Payment successful:", paymentIntent.id);
  }

  res.json({ received: true });
};

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
  deleteOrder,
  confirmPayment
}