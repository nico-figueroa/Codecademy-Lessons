import express from "express";
import auth from "../middleware/auth.js";
import { getReference } from "../controllers/referenceController.js";

const router = express.Router();

router.get("/:itemId", auth, getReference);

export default router;
