import { Router } from "express";
import { facebookStart, facebookCallback } from "../controllers/settings.controller.js";
const r = Router();
r.get("/", facebookStart);
r.get("/callback", facebookCallback);
export default r;
