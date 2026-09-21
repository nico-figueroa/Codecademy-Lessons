import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { RegisterSchema, LoginSchema } from '../validation/schemas.js';

const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);

export default router;
