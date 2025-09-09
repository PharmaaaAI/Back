import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  subcategories: [String],
});

export default model('Category', categorySchema);