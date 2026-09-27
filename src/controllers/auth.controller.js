import User from "../models/User.js";
import httpStatusCodes from "../utils/httpStatusCodes.js";
import { generateToken } from "../utils/jwt.js";
import logger from "../utils/logger.js";
import bcrypt from "bcrypt";

class AuthController {
  async register(req, res) {
    try {
      // { "name": "Rahul", "email": "rahul@gmail.com", "password": "Password@123" }
      const { name, email, password, role } = req.body;

      const isUserExist = await User.findOne({ email });
      if (isUserExist) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: "User already exists. Please login.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password:hashedPassword,
        role: role || "customer",
      });

      return res.status(httpStatusCodes.OK).json({
        success: true,
        message: "Account created successfully.",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(httpStatusCodes.FORBIDDEN).json({
        success: false,
        message: "Your account is deactivated.",
      });
    }

    // Matches decoded.userId expected in auth.middleware.js
    const token = generateToken({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return res.status(httpStatusCodes.OK).json({
      success: true,
      message: "Login successful.",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

}

export default new AuthController();
