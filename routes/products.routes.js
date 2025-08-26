const express = require('express');
const productController = require('../controllers/products.controller')
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require('../utils/userRoles');

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
  .get(verifyToken, productController.getAllProducts)
  .post(verifyToken, allowedTo(userRoles.ADMIN), upload.array('images', 5), productController.addProduct)

router.route('/:productID')
  .get(verifyToken, productController.getSingleProduct)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), productController.updateProduct)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), productController.deleteProduct)



module.exports = router