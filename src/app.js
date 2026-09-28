import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "http://localhost:5173"],
        "style-src": null,
      },
    },
  }),
);

const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use("/api", apiRouter);

// 404 Handler for undefined routes
app.use(notFoundHandler);
// Global Error-Handling Middleware (Must be last)
app.use(errorHandler);

export default app;
