const mongoose = require('mongoose');
const orderStatus = require("../utils/orderStatus");
const { type } = require('os');

const orderSchema = new mongoose.Schema({

  userID: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  status: {
    type: String,
    enum: [orderStatus.Confirmed, orderStatus.Dispatched, orderStatus.Delivered],
    default:  orderStatus.Confirmed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Visa', "Cash"]
  },
  amount: {
    type: Number,
    required: true
  }
})

module.exports = mongoose.model('Order', orderSchema);