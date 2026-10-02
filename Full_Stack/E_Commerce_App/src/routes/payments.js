import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import {
  createPayment,
  getPayment,
} from "../controllers/paymentsController.js";

import { validate } from "../middleware/validationMiddleware.js";
import { PaymentCreateSchema } from "../validation/schemas.js";

const router = express.Router();

router.post("/", authRequired, validate(PaymentCreateSchema), createPayment); // Route to create a new payment
router.get("/:paymentId", authRequired, getPayment);

export default router;
