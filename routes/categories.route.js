const express = require('express');
const categoryController = require('../controllers/categories.controller')
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require('../utils/userRoles');

router.route('/')
  .get(categoryController.getAllCategories)
  .post(verifyToken, allowedTo(userRoles.ADMIN), categoryController.addMainCategory)

router.route('/:categoryName')
  .get(categoryController.getSubCategories)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), categoryController.addSubCategory)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), categoryController.deleteMainCategory)

router.route('/:categoryName/:subCategoryName')
  .delete(verifyToken, allowedTo(userRoles.ADMIN), categoryController.deleteSubCategory)

module.exports = router