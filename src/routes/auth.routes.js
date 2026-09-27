import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import Validation from "../validators/index.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/register",Validation.validate(registerSchema), authController.register);

authRouter.post("/login",Validation.validate(loginSchema),authController.login);

export default authRouter;