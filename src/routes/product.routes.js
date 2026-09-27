import { Router } from "express";
import productController from "../controllers/product.controller.js";
import Validation from "../validators/index.js";
import { createProductSchema, productQuerySchema } from "../validators/product.validator.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import ROLES from "../constants/roles.constant.js";
const productRouter = Router();

productRouter.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  Validation.validate(createProductSchema),
  productController.createProduct,
);

productRouter.get("/", Validation.validate(productQuerySchema, "query"), productController.getProducts);

export default productRouter;
