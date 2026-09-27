import rateLimit from "express-rate-limit";
import httpStatusCodes from "../utils/httpStatusCodes.js";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per IP
  message: {
    status: "fail",
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  statusCode: httpStatusCodes.BAD_REQUEST,
  standardHeaders: true,
  legacyHeaders: false,
});
