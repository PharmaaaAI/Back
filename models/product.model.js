import { Schema, model } from 'mongoose';

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    require: true
  },
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
    required: true
  },
  inStock: {
    type: Boolean,
    required: true
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
  image: {
    type: String,
    required: true
  },
})

export default model('Product', productSchema);