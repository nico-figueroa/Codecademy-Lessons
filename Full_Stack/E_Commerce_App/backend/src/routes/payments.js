import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import {
  createPaymentIntent,
  getPayment,
} from "../controllers/paymentsController.js";

import { validate } from "../middleware/validationMiddleware.js";
import { PaymentIntentCreateSchema } from "../validation/schemas.js";

const router = express.Router();

// Creates (or reuses) a Stripe PaymentIntent for an order. The resulting
// Stripe PaymentIntent is confirmed client-side with Stripe's Payment
// Element; the webhook route (mounted directly in app.js) is what
// authoritatively marks the order as paid.
router.post(
  "/intent",
  authRequired,
  validate(PaymentIntentCreateSchema),
  createPaymentIntent,
);
router.get("/:paymentId", authRequired, getPayment);

export default router;
