import { Schema, model } from 'mongoose';
import orderStatus from "../utils/orderStatus.js";


const orderSchema = new Schema({

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

export default model('Order', orderSchema);