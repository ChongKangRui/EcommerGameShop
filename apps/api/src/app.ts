// if we are running in development, we can access .env anywhere
import "dotenv/config";
import helmet from "helmet";

import express from "express";
import cors from "cors";

import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import productRoutes from "./routes/product";
import cartRoutes from "./routes/cart";
import checkoutRoutes from "./routes/checkout";
import orderRoutes from "./routes/order";
import stripeRoutes from "./routes/stripe";
import healthCheckRoutes from "./routes/healthCheck"

import { Response, Request, NextFunction } from "express";
import ExpressError from "./utils/expressError";

import "./cron/cleanup";

import { requestLoggerMiddleware } from "./middleWare/requestLogger";

import { browsingLimiter, checkoutLimiter, globalLimiter } from "./utils/rateLimitHelper";
import { isAdmin, requireAuth } from "./middleWare/auth";



const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// allow this origin to access our api in local machine
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:4173"],
  }),
);

// Apply the rate limiting middleware to all requests.
app.use(requestLoggerMiddleware);

app.get("/", async (req, res) => {
  res.json({ message: "Server is working!" });
});

// exclude express.json for stripe route
app.use("/stripe", express.raw({ type: "application/json" }), stripeRoutes);
app.use(globalLimiter)

app.use(express.json());
app.use("/", userRoutes);
app.use("/healthcheck", healthCheckRoutes)
app.use("/admin",requireAuth, isAdmin, adminRoutes);
app.use("/products", browsingLimiter, productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", requireAuth,orderRoutes)
app.use("/checkout", requireAuth, checkoutLimiter, checkoutRoutes);

//==========================================
// error handling

// for this all, order is important here
// because it will only run when no route matched
app.all("/{*path}", (req: Request, res: Response, next: NextFunction) => {
  next(new ExpressError("Invalid API end point", 404));
});

// express 5 know that this err parameter is for error handle
// and it will automatically handle error
app.use(
  (err: ExpressError, req: Request, res: Response, next: NextFunction) => {
    const { status = 500 } = err;
    if (!err.message) {
      err.message = "Something went wrong, please try again";
    }

    res.status(status).json({ error: err.message });
  },
);

export default app;