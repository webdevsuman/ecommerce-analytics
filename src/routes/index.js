import { Router } from "express";
import authRouter from "./auth.routes.js";
import productRouter from "./product.routes.js";
import orderRouter from "./order.routes.js";
const apiRouter = Router();

apiRouter.use("/auth", authRouter);

apiRouter.use("/products", productRouter);

apiRouter.use("/orders", orderRouter);

export default apiRouter;
