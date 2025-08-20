const express = require('express');

const productController = require('../controllers/products.controller')

const router = express.Router();

const multer  = require('multer');
const appError = require('../utils/appError');
const diskStorage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function(req, file, cb){
    imageExtension = file.mimetype.split('/')[1];
    const fileName = `user-${Date.now()}.${imageExtension}`;
    cb(null, fileName);
  }
})

const fileFilter = (req, file, cb) => {

  inputType = file.mimetype.split('/')[0];
  if(inputType === 'image')
    return cb(null, true);
  else
    return cb(appError.create("file must be an image", 400), false)
}

const upload = multer({
  storage: diskStorage,
  fileFilter
})

router.route('/')
  .get(productController.getAllProducts)
  .post(upload.array('images', 5), productController.addProduct)
router.route('/:productID')
  .get(productController.getSingleProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct)

module.exports = router