import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import scheduleRoutes from "./routes/schedule.js";
import interactionRoutes from "./routes/interactions.js";
import referenceRoutes from "./routes/reference.js";
import stockRoutes from "./routes/stock.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/reference", referenceRoutes);
app.use("/api/stock", stockRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
