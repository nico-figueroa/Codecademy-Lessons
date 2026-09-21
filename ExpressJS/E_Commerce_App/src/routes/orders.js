import express from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import {
  listOrders,
  placeOrder,
  getOrder,
  updateOrder,
  cancelOrder
} from '../controllers/ordersController.js';

import { validate } from '../middleware/validationMiddleware.js';
import { OrderUpdateSchema } from '../validation/schemas.js';

const router = express.Router();

router.get('/', authRequired, listOrders);
router.post('/', authRequired, placeOrder);

router.get('/:orderId', authRequired, getOrder);
router.put('/:orderId', authRequired, validate(OrderUpdateSchema), updateOrder);
router.delete('/:orderId', authRequired, cancelOrder);

export default router;
