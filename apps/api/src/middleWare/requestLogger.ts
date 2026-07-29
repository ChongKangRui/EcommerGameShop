// middleware/requestLogger.ts
import { Request, Response, NextFunction } from "express";
import {
  generateLogId,
  createScopedLogger,
  Logger,
} from "src/utils/loggerHelper";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      log: Logger;
    }
  }
}

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.requestId = generateLogId();
  req.log = createScopedLogger(req.requestId);

  req.log.info("------------------------------------------------------------------------");
  req.log.info(`${req.method} ${req.originalUrl} received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  next();
};
