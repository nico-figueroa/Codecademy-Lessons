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

router.use(authRequired, adminOnly);

router.get('/', listUsers);
router.post('/', validate(UserCreateSchema), createUser);

router.get('/:userId', getUser);
router.put('/:userId', validate(UserUpdateSchema), updateUser);
router.delete('/:userId', deleteUser);

export default router;
