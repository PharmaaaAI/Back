
const Product = require("../models/product.model")
const httpStatusText = require("../utils/httpStatusText");

const getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.status(200).json({status: httpStatusText.SUCCESS, data: products})
}

const getSingleProduct = asyncWrapper(async (req, res, next) => {

  const product = await Product.findById(req.params.productID);
  if(!product){
    const error = appError.create('product not found', 404, httpStatusText.FAIL);
    return next(error);
  }
  res.status(200).json({status: httpStatusText.SUCCESS,data: {product}});
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
  getAllProducts
}