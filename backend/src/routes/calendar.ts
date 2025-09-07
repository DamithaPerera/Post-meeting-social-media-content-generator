import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { listUpcoming, toggleNotetaker } from "../controllers/calendar.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/events", listUpcoming);
r.post("/toggle", toggleNotetaker);
export default r;
