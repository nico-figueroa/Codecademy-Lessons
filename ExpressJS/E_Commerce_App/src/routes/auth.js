import express from "express";
import {
  register,
  login,
  startOAuth,
  completeOAuth,
} from "../controllers/authController.js";
import { validate } from "../middleware/validationMiddleware.js";
import {
  RegisterSchema,
  LoginSchema,
  OAuthCallbackSchema,
  OAuthStartSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.post("/register", validate(RegisterSchema), register); // Route for user registration
router.post("/login", validate(LoginSchema), login); // Route for user login
router.post("/oauth/:provider/start", validate(OAuthStartSchema), startOAuth); // Route to initiate OAuth flow
router.post(
  "/oauth/:provider/callback",
  validate(OAuthCallbackSchema),
  completeOAuth,
); // Route to handle OAuth callback

export default router;
