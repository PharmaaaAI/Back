const express = require('express');

const productController = require('../controllers/products.controller')

const productRouter = express.Router();

productRouter.get('/', productController.getAllProducts)

module.exports = productRouter