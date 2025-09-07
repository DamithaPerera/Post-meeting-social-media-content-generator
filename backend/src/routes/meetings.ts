import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { listPast, getMeeting, getTranscript, getEmailDraft, getSocialDrafts, createDraftForAutomations, postSocial } from "../controllers/meetings.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/", listPast);
r.get("/:id", getMeeting);
r.get("/:id/transcript", getTranscript);
r.get("/:id/email-draft", getEmailDraft);
r.get("/:id/social-drafts", getSocialDrafts);
r.post("/:id/generate-drafts", createDraftForAutomations);
r.post("/:id/post", postSocial);
export default r;
