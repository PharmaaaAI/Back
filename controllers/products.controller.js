
import { validationResult } from "express-validator";
import Product from "../models/product.model.js";
import  SUCCESS from "../utils/httpStatusText.js";
import  FAIL from "../utils/httpStatusText.js";
import  create  from '../utils/appError.js';
import asyncWrapper from '../middleware/asyncWrapper.js';

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

  if(query.limit && query.page)
  {
    const limit = query.limit;
    const page = query.page;

    products = await find(querry, {"__v": false}).limit(limit).skip((page - 1) * limit);
  }
  else
    products = await find(querry, {"__v": false});

  res.status(200).json({status: SUCCESS, data: products})
}

const getSingleProduct = asyncWrapper(async (req, res, next) => {

  const product = await findById(req.params.productID);
  if(!product){
    const error = create('product not found', 404, FAIL);
    return next(error);
  }
  res.status(200).json({status: SUCCESS,data: product});
})

const addProduct = asyncWrapper(async (req, res, next) => {

  req.body.images = req.files.map(obj => obj.filename)
  const newProduct = new Product(req.body);
  await newProduct.save();

  res.status(201).json({status: SUCCESS,data: {newProduct}});
})

const updateProduct = asyncWrapper(async (req, res) => {

  const apdatedProduct = await updateOne({_id: req.params.productID}, {$set: {...req.body}}, { runValidators: true });
  res.json({status: SUCCESS,data: apdatedProduct});
})

const deleteProduct = asyncWrapper(async (req, res, next) => {

  const deleted = await deleteOne({_id: req.params.productID})
  if(deleted.deletedCount === 0){
    const error = create("product with this id not found", 404, FAIL);
    return next(error);
  }
  res.status(200).json({status: SUCCESS,data: null});
})


export{
  getAllProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  
}