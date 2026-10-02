import express from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";

import { validate } from "../middleware/validationMiddleware.js";
import { UserCreateSchema, UserUpdateSchema } from "../validation/schemas.js";

const router = express.Router();

router.use(authRequired, adminOnly); // Apply authentication and admin-only middleware to all routes in this router

router.get("/", listUsers); // Route to list all users
router.post("/", validate(UserCreateSchema), createUser); // Route to create a new user

router.get("/:userId", getUser); // Route to get details of a specific user
router.put("/:userId", validate(UserUpdateSchema), updateUser); // Route to update a specific user
router.delete("/:userId", deleteUser); // Route to delete a specific user

export default router;
