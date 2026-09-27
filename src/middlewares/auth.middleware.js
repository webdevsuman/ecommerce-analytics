import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";


export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Token is required. Please login.",
      });
    }

    const decoded = verifyToken(token);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "User not found. Invalid token.",
      });
    }

    if (!currentUser.isActive) {
      return res.status(httpStatusCodes.FORBIDDEN).json({
        success: false,
        message: "This user account has been deactivated.",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {

      return res.status(httpStatusCodes.FORBIDDEN).json({
        success: false,
        message: `Access denied. Role '${req.user?.role || "unknown"}' is not authorized to perform this action.`,
      });
    }
    next();
  };
};
