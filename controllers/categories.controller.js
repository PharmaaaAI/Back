import asyncWrapper from '../middleware/asyncWrapper.js';
import Category from '../models/category.model.js';
import { create } from '../utils/appError.js';
import { SUCCESS, FAIL } from '../utils/httpStatusText.js';


const getAllCategories = asyncWrapper(async (req, res) => {
  const categories = await find({}, {__v: false});
  res.status(200).json({status: SUCCESS, data: categories});
})

const addMainCategory = asyncWrapper(async (req, res, next) => {
  const categoryName = req.body.categoryName;

  if(!categoryName)
    return create("insert category name to add", 404, FAIL)
  const category = await findOne({name: categoryName});
  if(category){
    const error = create("category is already exists", 404, FAIL);
    return next(error);
  }

  const newCategory = new Category({name: categoryName, subcategories: []});
  await newCategory.save();

  res.status(200).json({status: SUCCESS, data: newCategory});
})

const getSubCategories = asyncWrapper(async (req, res, next) => {
  const categoryName = req.params.categoryName;
  
  const category = await findOne({name: categoryName});
  if(!category){
    const error = create("no main category with this name", 404, FAIL);
    return next(error);
  }
  
  res.status(200).json({status: SUCCESS, data: category.subcategories})
})

const addSubCategory = asyncWrapper(async (req, res, next)=> {
  const categoryName = req.params.categoryName;
  const subCategoryName = req.body.categoryName;

  if(!subCategoryName){
    const error = create("Enter sub category name", 404, FAIL);
    return next(error);
  }
  
  const result = await updateOne(
    { name: categoryName },
    { $addToSet: { subcategories: subCategoryName } },
  );
  
  if(result.matchedCount === 0){
    const error = create("Category not found", 400, FAIL);
    return next(error);
  }

  if (result.modifiedCount === 0) {
    const error = create(`Subcategory '${subCategoryName}' already exists in '${categoryName}'`, 400, FAIL);
    return next(error);
  }

  const updatedCategory = await findOne({ name: categoryName });

  res.status(200).json({status: SUCCESS, data: {updatedCategory}});
});

const deleteMainCategory = asyncWrapper(async (req, res, next) => {
  const categoryName = req.params.categoryName;
  const deletedCategory = await findOneAndDelete({
    name: categoryName,
    subcategories: { $size: 0 }
  });

  if(!deletedCategory){
    const error = create("no empty category with this name", 404, FAIL)
    return next(error);
  }
  res.status(200).json({status: SUCCESS, data: null});
})

const deleteSubCategory = asyncWrapper(async (req, res, next) => {
  const { categoryName, subCategoryName } = req.params;

  const category = await findOne({ name: categoryName });

  if (!category) {
    const error = create("Category not found", 404, FAIL);
    return next(error);
  }

  if (!category.subcategories.includes(subCategoryName)) {
    const error = create(`Subcategory '${subCategoryName}' does not exist in category '${categoryName}'.`, 404, FAIL);
    return next(error);
  }

  const updatedCategory = await findOneAndUpdate(
    { name: categoryName },
    { $pull: { subcategories: subCategoryName } },
    { new: true }
  );

  return res.status(200).json({status: SUCCESS, data: {updatedCategory}});
})

export {
  getAllCategories,
  addMainCategory,
  getSubCategories,
  addSubCategory,
  deleteMainCategory,
  deleteSubCategory
};