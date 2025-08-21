const mongoose = require('mongoose');

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
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('Order', orderSchema);