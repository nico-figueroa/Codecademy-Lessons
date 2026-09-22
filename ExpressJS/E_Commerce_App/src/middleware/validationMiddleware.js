import { ZodError } from "zod";

// Middleware for validating request data using Zod schemas
// Ensures that incoming requests conform to the expected structure and types
export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: err.errors,
        });
      }
      next(err);
    }
  };
}
