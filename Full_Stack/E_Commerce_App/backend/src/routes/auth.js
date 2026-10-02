import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  getPendingOAuth,
  confirmOAuth,
  discardOAuth,
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
  OAuthConfirmSchema,
  OAuthTicketSchema,
  ProfileUpdateSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.post("/register", validate(RegisterSchema), register); // Route for user registration
router.post("/login", validate(LoginSchema), login); // Route for user login
router.get("/me", authRequired, getMe); // Route to fetch the current user's profile
router.put("/me", authRequired, validate(ProfileUpdateSchema), updateMe); // Route to update the current user's profile
router.get(
  "/oauth/pending/:ticket",
  validate(OAuthTicketSchema),
  getPendingOAuth,
); // Who a pending GitHub sign-in would log in as
router.post("/oauth/confirm", validate(OAuthConfirmSchema), confirmOAuth); // Confirm a pending GitHub sign-in
router.post("/oauth/discard", validate(OAuthConfirmSchema), discardOAuth); // Discard it (choose another account)

// These two routes are navigated to directly by the browser (not called via
// fetch/XHR), since real OAuth requires full-page redirects to GitHub.
router.get("/oauth/:provider/start", validate(OAuthStartSchema), startOAuth); // Route to initiate OAuth flow
router.get(
  "/oauth/:provider/callback",
  validate(OAuthCallbackSchema),
  completeOAuth,
); // Route to handle OAuth callback

export default router;
