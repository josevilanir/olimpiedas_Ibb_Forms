import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";

let activeRequests = 0;
let totalRequests = 0;

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  activeRequests++;
  totalRequests++;
  const start = Date.now();

  res.on("finish", () => {
    activeRequests--;
    const duration = Date.now() - start;

    if (duration > 1000) {
      logger.warn({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: duration,
        activeRequests,
      }, "Slow request detected");
    }

    if (totalRequests % 100 === 0) {
      logger.info({
        totalRequests,
        activeRequests,
        memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      }, "Server metrics snapshot");
    }
  });

  next();
}
