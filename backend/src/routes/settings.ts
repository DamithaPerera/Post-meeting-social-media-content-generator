import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getSettings, updateSettings, listAutomations, upsertAutomation, deleteAutomation } from "../controllers/settings.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/", getSettings);
r.post("/", updateSettings);
r.get("/automations", listAutomations);
r.post("/automations", upsertAutomation);
r.delete("/automations/:id", deleteAutomation);
export default r;
