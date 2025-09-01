const express = require('express');
const productController = require('../controllers/products.controller');
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const userRoles = require('../utils/userRoles');

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const appError = require('../utils/appError');

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // all images will be stored in Cloudinary/products
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  },
});

// File filter (just in case)
const fileFilter = (req, file, cb) => {
  const inputType = file.mimetype.split('/')[0];
  if (inputType === 'image') {
    cb(null, true);
  } else {
    cb(appError.create("File must be an image", 400), false);
  }
};

const upload = multer({ storage, fileFilter });

router.route('/')
  .get(productController.getAllProducts)
  .post(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    upload.array('images', 5),
    productController.addProduct
  );

router.route('/:productID')
  .get(productController.getSingleProduct)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), productController.updateProduct)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), productController.deleteProduct);

module.exports = router;
