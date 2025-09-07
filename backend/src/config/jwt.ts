import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function signJwt(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "30d" });
}
export function verifyJwt<T = any>(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as T;
}
