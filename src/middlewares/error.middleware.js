import httpStatusCodes from "../utils/httpStatusCodes.js";
import logger from "../utils/logger.js";

// Catch 404 for undefined routes
export const notFoundHandler = (req, res, next) => {
  res.status(httpStatusCodes.NOT_FOUND).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
  });
};

// Centralized error handler
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  let statusCode = err.statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal server error.";

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = httpStatusCodes.BAD_REQUEST;
    message = `Invalid format for field '${err.path}': '${err.value}'.`;
  }

  // 2. Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = httpStatusCodes.BAD_REQUEST;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    message = `Duplicate value '${value}' entered for unique field '${field}'.`;
  }

  // 3. Mongoose Schema Validation Error
  if (err.name === "ValidationError") {
    statusCode = httpStatusCodes.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // 4. JWT Malformed / Tampered Token
  if (err.name === "JsonWebTokenError") {
    statusCode = httpStatusCodes.UNAUTHORIZED;
    message = "Invalid token signature. Please log in again.";
  }

  // 5. JWT Expired Token
  if (err.name === "TokenExpiredError") {
    statusCode = httpStatusCodes.UNAUTHORIZED;
    message = "Your token has expired. Please log in again.";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
