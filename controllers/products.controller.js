
const {validationResult} = require("express-validator")
const mongoose = require("mongoose")
const Product = require("../models/product.model")
const httpStatusText = require("../utils/httpStatusText");
const appError = require('../utils/appError')
const asyncWrapper = require('../middleware/asyncWrapper');

const getAllProducts = async (req, res) => {

  let products;
  const query = req.query;
  const category = query.category;
  const subCategory = query.subcategory;
  let description
  if(query.description)
    description = query.description.split(' ');
  const querry = {};
  if (category) {
    querry.category = category;
    if(subCategory)
      querry.subcategory = subCategory;
  }

  if (description && description.length > 0) {
    querry.$or = description.flatMap(word => [
      { description: { $regex: word, $options: "i" } },
      { name: { $regex: word, $options: "i" } }
    ]);
  }

  if (query.minPrice) {
    querry.price = { ...querry.price, $gt: +query.minPrice };
  }

  if (query.maxPrice) {
    querry.price = { ...querry.price, $lt: +query.maxPrice };
  }

  if (query.exclude) {
    querry._id = { $ne: new mongoose.Types.ObjectId(`${query.exclude}`) };
  }

  if (query.sample) {
    const sampleSize = parseInt(query.sample, 10) || 5;
    products = await Product.aggregate([
      { $match: querry },
      { $sample: { size: sampleSize } },
    ]);
  } else {
    if (query.limit && query.page) {
      const limit = query.limit;
      const page = query.page;

      products = await Product.find(querry, { __v: false }).sort({ quantity: -1 }).limit(limit).skip((page - 1) * limit);
    } else products = await Product.find(querry, { __v: false }).sort({ quantity: -1 });
  }

  res.status(200).json({status: httpStatusText.SUCCESS, data: products})
}

const getSingleProduct = asyncWrapper(async (req, res, next) => {

  const product = await Product.findById(req.params.productID);
  if(!product){
    const error = appError.create('product not found', 404, httpStatusText.FAIL);
    return next(error);
  }
  res.status(200).json({status: httpStatusText.SUCCESS,data: product});
})

const addProduct = asyncWrapper(async (req, res, next) => {

  req.body.images = req.files.map(file => file.path);

  const newProduct = new Product(req.body);
  await newProduct.save();

  res.status(201).json({status: httpStatusText.SUCCESS,data: {newProduct}});
})

const updateProduct = asyncWrapper(async (req, res) => {

  const apdatedProduct = await Product.updateOne({_id: req.params.productID}, {$set: {...req.body}}, { runValidators: true });
  res.json({status: httpStatusText.SUCCESS,data: apdatedProduct});
})

const deleteProduct = asyncWrapper(async (req, res, next) => {

  const deleted = await Product.deleteOne({_id: req.params.productID})
  if(deleted.deletedCount === 0){
    const error = appError.create("product with this id not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.status(200).json({status: httpStatusText.SUCCESS,data: null});
})


module.exports = {
  getAllProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  
}
