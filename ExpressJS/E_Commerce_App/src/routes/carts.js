import express from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import {
  getMyCart,
  createOrResetCart,
  addItem,
  updateItem,
  removeItem
} from '../controllers/cartsController.js';

import { validate } from '../middleware/validationMiddleware.js';
import { CartItemCreateSchema, CartItemUpdateSchema } from '../validation/schemas.js';

const router = express.Router();

router.get('/me', authRequired, getMyCart);
router.post('/me', authRequired, createOrResetCart);

router.post('/me/items', authRequired, validate(CartItemCreateSchema), addItem);
router.put('/me/items/:itemId', authRequired, validate(CartItemUpdateSchema), updateItem);
router.delete('/me/items/:itemId', authRequired, removeItem);

export default router;
