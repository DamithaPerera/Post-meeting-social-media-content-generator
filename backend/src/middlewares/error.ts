import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
}
