import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Zod Error
  if (err.name === "ZodError") {
    statusCode = 422;
    message = "Validation failed";
    errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please login again";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please login again";
  }

  // PostgreSQL Errors
  if (err.code === "23505") {
    statusCode = 409;
    message = "Resource already exists";

    const match = err.detail?.match(/\(([^)]+)\)/);
    const field = match ? match[1] : "field";

    errors = [{ field, message: `${field} already taken` }];
  }

  if (err.code === "23503") {
    statusCode = 400;
    message = "Referenced resource does not exist";
  }

  if (err.code === "22P02") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      statusCode,
      message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;