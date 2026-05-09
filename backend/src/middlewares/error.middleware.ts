import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, err.message);
  res.status(500).json({ error: "Erro interno do servidor." });
}
