import express from 'express';
import { authRequired, adminOnly } from '../middleware/authMiddleware.js';
import {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';

import { validate } from '../middleware/validationMiddleware.js';
import { ProductCreateSchema, ProductUpdateSchema } from '../validation/schemas.js';

const router = express.Router();

router.get('/', listProducts);
router.post('/', authRequired, adminOnly, validate(ProductCreateSchema), createProduct);

router.get('/:productId', getProduct);
router.put('/:productId', authRequired, adminOnly, validate(ProductUpdateSchema), updateProduct);
router.delete('/:productId', authRequired, adminOnly, deleteProduct);

export default router;
