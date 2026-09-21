// Centralized error handler for the E-Commerce API

export function errorHandler(err, req, res, next) {
  console.error('❌ API Error:', err);

  // If the error already has a status, use it
  const status = err.status || 500;

  // Standard JSON error response
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    status,
  });
}
