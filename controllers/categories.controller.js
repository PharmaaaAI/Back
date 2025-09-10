const asyncWrapper = require('../middleware/asyncWrapper')
const Category = require('../models/category.model');
const appError = require('../utils/appError')
const httpStatusText = require('../utils/httpStatusText')


const getAllCategories = asyncWrapper(async (req, res) => {
  const categories = await Category.find({}, {__v: false, _id: false});
  res.status(200).json({status: httpStatusText.SUCCESS, data: categories});
})

const addMainCategory = asyncWrapper(async (req, res, next) => {
  const categoryName = req.body.categoryName;

  if(!categoryName)
    return appError.create("insert category name to add", 404, httpStatusText.FAIL)
  const category = await Category.findOne({name: categoryName});
  if(category){
    const error = appError.create("category is already exists", 404, httpStatusText.FAIL);
    return next(error);
  }

  const newCategory = new Category({name: categoryName, subcategories: []});
  await newCategory.save();

  res.status(200).json({status: httpStatusText.SUCCESS, data: newCategory});
})

const getSubCategories = asyncWrapper(async (req, res, next) => {
  const categoryName = req.params.categoryName;
  
  const category = await Category.findOne({name: categoryName});
  if(!category){
    const error = appError.create("no main category with this name", 404, httpStatusText.FAIL);
    return next(error);
  }
  
  res.status(200).json({status: httpStatusText.SUCCESS, data: category.subcategories})
})

const addSubCategory = asyncWrapper(async (req, res, next)=> {
  const categoryName = req.params.categoryName;
  const subCategoryName = req.body.categoryName;

  if(!subCategoryName){
    const error = appError.create("Enter sub category name", 404, httpStatusText.FAIL);
    return next(error);
  }
  
  const result = await Category.updateOne(
    { name: categoryName },
    { $addToSet: { subcategories: subCategoryName } },
  );
  
  if(result.matchedCount === 0){
    const error = appError.create("Category not found", 400, httpStatusText.FAIL);
    return next(error);
  }

  if (result.modifiedCount === 0) {
    const error = appError.create(`Subcategory '${subCategoryName}' already exists in '${categoryName}'`, 400, httpStatusText.FAIL);
    return next(error);
  }

  const updatedCategory = await Category.findOne({ name: categoryName });

  res.status(200).json({status: httpStatusText.SUCCESS, data: {updatedCategory}});
});

const deleteMainCategory = asyncWrapper(async (req, res, next) => {
  const categoryName = req.params.categoryName;
  const deletedCategory = await Category.findOneAndDelete({
    name: categoryName,
    subcategories: { $size: 0 }
  });

  if(!deletedCategory){
    const error = appError.create("no empty category with this name", 404, httpStatusText.FAIL)
    return next(error);
  }
  res.status(200).json({status: httpStatusText.SUCCESS, data: null});
})

const deleteSubCategory = asyncWrapper(async (req, res, next) => {
  const { categoryName, subCategoryName } = req.params;

  const category = await Category.findOne({ name: categoryName });

  if (!category) {
    const error = appError.create("Category not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  if (!category.subcategories.includes(subCategoryName)) {
    const error = appError.create(`Subcategory '${subCategoryName}' does not exist in category '${categoryName}'.`, 404, httpStatusText.FAIL);
    return next(error);
  }

  const updatedCategory = await Category.findOneAndUpdate(
    { name: categoryName },
    { $pull: { subcategories: subCategoryName } },
    { new: true }
  );

  return res.status(200).json({status: httpStatusText.SUCCESS, data: {updatedCategory}});
})

module.exports = {
  getAllCategories,
  addMainCategory,
  getSubCategories,
  addSubCategory,
  deleteMainCategory,
  deleteSubCategory
}