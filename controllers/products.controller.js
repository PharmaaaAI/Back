
const Product = require("../models/product.model")
const httpStatusText = require("../utils/httpStatusText");

const getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.status(200).json({status: httpStatusText.SUCCESS, data: products})
}

module.exports = {
  getAllProducts
}