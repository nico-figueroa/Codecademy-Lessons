import express from 'express';
import { register, login, startOAuth, completeOAuth } from '../controllers/authController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { RegisterSchema, LoginSchema, OAuthCallbackSchema, OAuthStartSchema } from '../validation/schemas.js';

const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.post('/oauth/:provider/start', validate(OAuthStartSchema), startOAuth);
router.post('/oauth/:provider/callback', validate(OAuthCallbackSchema), completeOAuth);

export default router;
