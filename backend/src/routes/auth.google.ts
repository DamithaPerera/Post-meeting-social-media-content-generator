import { Router } from "express";
import { googleAuthStart, googleAuthCallback } from "../controllers/auth.controller.js";

const r = Router();
r.get("/", googleAuthStart);
r.get("/callback", googleAuthCallback);
export default r;
