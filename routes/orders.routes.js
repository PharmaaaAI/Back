import { Router } from 'express';
import { getAllOrders, addOrder, getSingleOrder, updateOrder, deleteOrder } from '../controllers/orders.controller.js';
const router = Router();
import Stripe from 'stripe';
import verifyToken from "../middleware/verifyToken.js";
import allowedTo from "../middleware/allowedTo.js";
import userRoles from '../utils/userRoles.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.route('/')
  .get(verifyToken, getAllOrders)
  .post(verifyToken, addOrder)

router.route('/:orderId')
  .get(verifyToken, getSingleOrder)
  .patch(verifyToken, updateOrder)
  .delete(verifyToken, deleteOrder)


export default router