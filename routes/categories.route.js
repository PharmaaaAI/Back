import { Router } from 'express';
import { getAllCategories, addMainCategory, getSubCategories, addSubCategory, deleteMainCategory, deleteSubCategory } from '../controllers/categories.controller.js';
const router = Router();
import verifyToken from "../middleware/verifyToken.js";
import allowedTo from "../middleware/allowedTo.js";
import userRoles from '../utils/userRoles.js';

router.route('/')
  .get(verifyToken, getAllCategories)
  .post(verifyToken, allowedTo(userRoles.ADMIN), addMainCategory)

router.route('/:categoryName')
  .get(verifyToken, getSubCategories)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), addSubCategory)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), deleteMainCategory)

router.route('/:categoryName/:subCategoryName')
  .delete(verifyToken, allowedTo(userRoles.ADMIN), deleteSubCategory)

export default router