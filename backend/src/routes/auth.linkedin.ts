import { Router } from "express";
import { linkedinStart, linkedinCallback } from "../controllers/settings.controller.js";
const r = Router();
r.get("/", linkedinStart);
r.get("/callback", linkedinCallback);
export default r;
