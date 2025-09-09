import { Router } from 'express';
import { getAllProducts, addProduct, getSingleProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';
const router = Router();
import verifyToken from "../middleware/verifyToken.js";
import allowedTo from "../middleware/allowedTo.js";
import ADMIN from '../utils/userRoles.js';

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import create from '../utils/appError.js';

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
    cb(create("File must be an image", 400), false);
  }
};

const upload = multer({ storage, fileFilter });

router.route('/')
  .get(verifyToken, getAllProducts)
  .post(
    verifyToken,
    allowedTo(ADMIN),
    upload.array('images', 5),
    addProduct
  );

router.route('/:productID')
  .get(verifyToken, getSingleProduct)
  .patch(verifyToken, allowedTo(ADMIN), updateProduct)
  .delete(verifyToken, allowedTo(ADMIN), deleteProduct);

export default router;
