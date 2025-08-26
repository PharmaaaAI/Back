const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  form: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price must be a positive number"]
  },
  quantity: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sideEffects: {
    type: Array,
    required: true
  },
  activeIngredients: {
    type: Array,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  images: {
    type: Array
  },
})

module.exports = mongoose.model('Product', productSchema);