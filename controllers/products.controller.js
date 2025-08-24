
const {validationResult} = require("express-validator")
const Product = require("../models/product.model")
const httpStatusText = require("../utils/httpStatusText");
const appError = require('../utils/appError')
const asyncWrapper = require('../middleware/asyncWrapper');
const { log } = require("console");

const getAllProducts = async (req, res) => {

  let products;
  const query = req.query;
  const category = req.query.category;
  const subCategory = req.query.subcategory;
  const querry = {};
  if (category) {
    querry.category = category;
    if(subCategory)
      querry.subcategory = subCategory;
  }

  if(query.limit && query.page)
  {
    console.log("Implement pagination")
    
    const limit = query.limit;
    const page = query.page;

    console.log("limit: ", limit);
    console.log("page: ", page);

    products = await Product.find(querry, {"__v": false}).limit(limit).skip((page - 1) * limit);
  }
  else
    products = await Product.find(querry, {"__v": false});

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

  req.body.images = req.files.map(obj => obj.filename)
  const newProduct = new Product(req.body);
  await newProduct.save();

  res.status(201).json({status: httpStatusText.SUCCESS,data: {newProduct}});
})

const updateProduct = asyncWrapper(async (req, res) => {

  const apdatedProduct = await Product.updateOne({_id: req.params.productID}, {$set: {...req.body}});
  res.json({status: httpStatusText.SUCCESS,data: {apdatedProduct}});
})

const deleteProduct = asyncWrapper(async (req, res, next) => {
  await Product.deleteOne({_id: req.params.productID})
  res.status(200).json({status: httpStatusText.SUCCESS,data: null});

})


module.exports = {
  getAllProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  
}