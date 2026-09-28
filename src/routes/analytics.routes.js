import { Router } from "express";
import analyticsController from "../controllers/analytics.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import ROLES from "../constants/roles.constant.js";

const analyticsRouter = Router();

analyticsRouter.use(authenticate, authorize(ROLES.ADMIN));

analyticsRouter.get("/dashboard", analyticsController.getDashboard);

analyticsRouter.get("/category-sales", analyticsController.getCategorySales);

analyticsRouter.get("/top-products", analyticsController.getTopProducts);

analyticsRouter.get("/customers", analyticsController.getCustomers);

analyticsRouter.get("/monthly-revenue", analyticsController.getMonthlyRevenue);

analyticsRouter.get("/sales", analyticsController.getSales);

analyticsRouter.get("/order-status", analyticsController.getOrderStatus);

export default analyticsRouter;
