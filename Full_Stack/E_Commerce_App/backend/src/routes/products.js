import express from "express";
import { authRequired, staffOnly } from "../middleware/authMiddleware.js";
import {
  listProducts,
  listAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController.js";

import { validate } from "../middleware/validationMiddleware.js";
import {
  ProductCreateSchema,
  ProductUpdateSchema,
} from "../validation/schemas.js";

const router = express.Router();

router.get("/", listProducts); // Route to list all products
router.post(
  "/",
  authRequired,
  staffOnly,
  validate(ProductCreateSchema),
  createProduct,
); // Route to create a new product

router.get("/admin/all", authRequired, staffOnly, listAllProducts); // Admin: all products incl. inactive
router.get("/:productId", getProduct); // Route to get details of a specific product
router.put(
  "/:productId",
  authRequired,
  staffOnly,
  validate(ProductUpdateSchema),
  updateProduct,
); // Route to update a specific product
router.delete("/:productId", authRequired, staffOnly, deleteProduct); // Route to delete a specific product

export default router;
