import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { AuthRequest } from "src/middleWare/auth";

const isTest = process.env.NODE_ENV === "test";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10_000 : 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

// specifically use for user verification
export const authCheckLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: isTest ? 10_000 : 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

export const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: isTest ? 10_000 : 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

// also used by some of the order route
export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10_000 : 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // ipv6Subnet: 56,
  keyGenerator: (req: AuthRequest) => req.userId ?? ipKeyGenerator(req.ip ?? "unknown"),
});

export const cartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10_000 : 200, // generous — cart mutations are frequent and cheap
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) => req.userId ?? ipKeyGenerator(req.ip ?? "unknown"),
});

export const adminBrowserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10_000 : 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) => req.userId ?? ipKeyGenerator(req.ip ?? "unknown"),
});

export const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10_000 : 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) => req.userId ?? ipKeyGenerator(req.ip ?? "unknown"),
});

export const browsingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10_000 : 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10_000 : 150,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
});