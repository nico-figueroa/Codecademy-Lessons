import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import {
  getMyCart,
  createOrResetCart,
  addItem,
  updateItem,
  removeItem,
} from "../controllers/cartsController.js";

import { validate } from "../middleware/validationMiddleware.js";
import {
  CartItemCreateSchema,
  CartItemUpdateSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.get("/me", authRequired, getMyCart); // Route to get the current user's cart
router.post("/me", authRequired, createOrResetCart); // Route to create or reset the current user's cart

router.post("/me/items", authRequired, validate(CartItemCreateSchema), addItem); // Route to add an item to the current user's cart
router.put(
  "/me/items/:itemId",
  authRequired,
  validate(CartItemUpdateSchema),
  updateItem,
); // Route to update an item in the current user's cart
router.delete("/me/items/:itemId", authRequired, removeItem); // Route to remove an item from the current user's cart

export default router;
