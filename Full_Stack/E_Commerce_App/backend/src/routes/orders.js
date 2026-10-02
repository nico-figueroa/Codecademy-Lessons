import express from "express";
import { authRequired, staffOnly } from "../middleware/authMiddleware.js";
import {
  listOrders,
  placeOrder,
  getOrder,
  updateOrder,
  cancelOrder,
  createShipment,
  updateShipment,
  deleteShipment,
} from "../controllers/ordersController.js";

import { validate } from "../middleware/validationMiddleware.js";
import { OrderUpdateSchema, OrderCreateSchema, ShipmentUpdateSchema } from "../validation/schemas.js";

const router = express.Router();

router.get("/", authRequired, listOrders); // Route to list all orders for the current user
router.post("/", authRequired, validate(OrderCreateSchema), placeOrder); // Route to place a new order

router.get("/:orderId", authRequired, getOrder); // Route to get details of a specific order
router.put("/:orderId", authRequired, validate(OrderUpdateSchema), updateOrder); // Route to update a specific order
router.delete("/:orderId", authRequired, cancelOrder); // Route to cancel a specific order

router.post("/:orderId/shipment", authRequired, staffOnly, createShipment); // Admin: create a shipment/label

router.put("/:orderId/shipment", authRequired, staffOnly, validate(ShipmentUpdateSchema), updateShipment); // Staff: edit shipment details
router.delete("/:orderId/shipment", authRequired, staffOnly, deleteShipment); // Staff: remove shipment

export default router;
