import { Router } from "express";
import authRouter from "./auth.routes.js";
import productRouter from "./product.routes.js";
import orderRouter from "./order.routes.js";
import analyticsRouter from "./analytics.routes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);

apiRouter.use("/products", productRouter);

apiRouter.use("/orders", orderRouter);

apiRouter.use("/analytics", analyticsRouter);

export default apiRouter;
