const express = require('express');

const categoryController = require('../controllers/categories.controller')

const router = express.Router();


router.route('/')
  .get(categoryController.getAllCategories)
  .post(categoryController.addMainCategory)

router.route('/:categoryName')
  .get(categoryController.getSubCategories)
  .patch(categoryController.addSubCategory)
  .delete(categoryController.deleteMainCategory)

router.route('/:categoryName/:subCategoryName')
  .delete(categoryController.deleteSubCategory)

module.exports = router