import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import logger from "../lib/logger";

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.userMessage ?? err.message });
    return;
  }
  logger.error({ err }, err.message);
  res.status(500).json({ error: "Erro interno do servidor." });
}
