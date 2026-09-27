import { Router } from "express";
import orderController from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import Validation from "../validators/index.js";
import { createOrderSchema } from "../validators/order.validator.js";
import ROLES from "../constants/roles.constant.js";

const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post(
  "/",
  authorize(ROLES.CUSTOMER, ROLES.ADMIN),
  Validation.validate(createOrderSchema),
  orderController.createOrder
);

orderRouter.get("/", orderController.getMyOrders);

export default orderRouter;
