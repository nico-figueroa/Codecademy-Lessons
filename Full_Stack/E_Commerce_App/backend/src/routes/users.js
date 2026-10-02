import express from "express";
import { authRequired, adminOnly, staffOnly } from "../middleware/authMiddleware.js";
import {
  listUsers,
  lookupUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";

import { validate } from "../middleware/validationMiddleware.js";
import { UserCreateSchema, UserUpdateSchema } from "../validation/schemas.js";

const router = express.Router();

router.use(authRequired);

// Staff (admin or vendor): minimal customer list for assigning orders
router.get("/lookup", staffOnly, lookupUsers);

router.use(adminOnly); // Everything below is admin-only

router.get("/", listUsers); // Route to list all users
router.post("/", validate(UserCreateSchema), createUser); // Route to create a new user

router.get("/:userId", getUser); // Route to get details of a specific user
router.put("/:userId", validate(UserUpdateSchema), updateUser); // Route to update a specific user
router.delete("/:userId", deleteUser); // Route to delete a specific user

export default router;
