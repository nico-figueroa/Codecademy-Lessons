import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import {
  listOrders,
  placeOrder,
  getOrder,
  updateOrder,
  cancelOrder,
} from "../controllers/ordersController.js";

import { validate } from "../middleware/validationMiddleware.js";
import { OrderUpdateSchema } from "../validation/schemas.js";

const router = express.Router();

router.get("/", authRequired, listOrders); // Route to list all orders for the current user
router.post("/", authRequired, placeOrder); // Route to place a new order

router.get("/:orderId", authRequired, getOrder); // Route to get details of a specific order
router.put("/:orderId", authRequired, validate(OrderUpdateSchema), updateOrder); // Route to update a specific order
router.delete("/:orderId", authRequired, cancelOrder); // Route to cancel a specific order

export default router;
