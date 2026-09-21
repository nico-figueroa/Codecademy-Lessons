import express from 'express';
import { authRequired, adminOnly } from '../middleware/authMiddleware.js';
import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/usersController.js';

import { validate } from '../middleware/validationMiddleware.js';
import { UserCreateSchema, UserUpdateSchema } from '../validation/schemas.js';

const router = express.Router();

router.get('/', authRequired, adminOnly, listUsers);
router.post('/', authRequired, adminOnly, validate(UserCreateSchema), createUser);

router.get('/:userId', authRequired, getUser);
router.put('/:userId', authRequired, validate(UserUpdateSchema), updateUser);
router.delete('/:userId', authRequired, deleteUser);

export default router;
