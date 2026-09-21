// Centralized error handler for the E-Commerce API
// Provides a consistent JSON response for errors, including handling of unique constraint violations (PostgreSQL error code 23505)

export function errorHandler(err, req, res, next) {
  console.error("❌ API Error:", err);

  // If the error already has a status, use it
  const status = err.status || (err.code === "23505" ? 409 : 500);
  const message =
    err.code === "23505" ? "Resource already exists" : err.message;

  // Standard JSON error response
  res.status(status).json({
    error: message || "Internal Server Error",
    status,
  });
}
