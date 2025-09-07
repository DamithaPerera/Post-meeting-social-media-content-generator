import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../config/jwt.js";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; name?: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies["token"];
  if (!token) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const user = verifyJwt(token);
    req.user = user as any;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
