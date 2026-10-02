import express from "express";
import {
  register,
  login,
  getMe,
  startOAuth,
  completeOAuth,
} from "../controllers/authController.js";
import { authRequired } from "../middleware/authMiddleware.js";
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
router.get("/me", authRequired, getMe); // Route to fetch the current user's profile

// These two routes are navigated to directly by the browser (not called via
// fetch/XHR), since real OAuth requires full-page redirects to GitHub.
router.get("/oauth/:provider/start", validate(OAuthStartSchema), startOAuth); // Route to initiate OAuth flow
router.get(
  "/oauth/:provider/callback",
  validate(OAuthCallbackSchema),
  completeOAuth,
); // Route to handle OAuth callback

export default router;
