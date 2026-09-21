import express from "express"; // Import the Express framework
import fs from "fs"; // File system module for reading files
import path from "path"; // Path module for handling and transforming file paths
import { fileURLToPath } from "url"; // Utility to convert file URL to path
import cookieParser from "cookie-parser"; // Middleware for parsing cookies
import logger from "morgan"; // HTTP request logger middleware
import swaggerUi from "swagger-ui-express"; // Swagger UI for API documentation
import pool from "./db.js"; // Database connection pool

// ROUTES
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import cartsRouter from "./routes/carts.js";
import ordersRouter from "./routes/orders.js";
import paymentsRouter from "./routes/payments.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const directory = path.dirname(fileURLToPath(import.meta.url));
const openApiDocument = JSON.parse(
  fs.readFileSync(
    path.join(directory, "..", "openapi.ecommerce.v1.json"),
    "utf8",
  ),
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "public")));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "E-commerce API is running" });
});

app.get("/openapi.json", (req, res) => {
  res.json(openApiDocument);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "E-commerce API Documentation",
  }),
);

// API routes
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/carts", cartsRouter);
app.use("/orders", ordersRouter);
app.use("/payments", paymentsRouter);

// Error handling middleware
app.use(errorHandler);

// DB connection test
pool.connect().then(async (client) => {
  try {
    await client.query("SELECT NOW()");
    client.release();
    console.log("Database connection established");
  } catch (err) {
    client.release();
    console.error("Database connection error", err);
  }
});

export default app;
