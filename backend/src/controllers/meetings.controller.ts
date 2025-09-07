import { Response } from "express";
import { AuthedRequest } from "../middlewares/auth.js";
import { prisma } from "../services/prisma.js";
import axios from "axios";
import { generateEmailFollowup, generateSocialPost } from "../services/ai.js";
import { postToFacebook, postToLinkedIn, savePost } from "../services/social.js";
import { SocialPlatform } from "@prisma/client";

export async function listPast(req: AuthedRequest, res: Response) {
  const past = await prisma.meeting.findMany({
    where: { userId: req.user!.id, endTime: { lte: new Date() } },
    orderBy: { startTime: "desc" },
    include: { attendees: true }
  });
  res.json(past);
}

export async function getMeeting(req: AuthedRequest, res: Response) {
  const m = await prisma.meeting.findFirst({ where: { id: req.params.id, userId: req.user!.id }, include: { attendees: true } });
  if (!m) return res.status(404).json({ error: "Not found" });
  res.json(m);
}

export async function getTranscript(req: AuthedRequest, res: Response) {
  const m = await prisma.meeting.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!m || !m.transcriptUrl) return res.json({ transcript: "" });
  const data = await axios.get(m.transcriptUrl).then(r => r.data).catch(() => "");
  res.json({ transcript: typeof data === "string" ? data : JSON.stringify(data) });
}

export async function getEmailDraft(req: AuthedRequest, res: Response) {
  const { transcript } = await getTranscriptData(req);
  const draft = await generateEmailFollowup(transcript);
  res.json({ draft });
}

export async function getSocialDrafts(req: AuthedRequest, res: Response) {
  const drafts = await prisma.socialDraft.findMany({ where: { meetingId: req.params.id }});
  res.json(drafts);
}

export async function createDraftForAutomations(req: AuthedRequest, res: Response) {
  const meetingId = req.params.id;
  const autos = await prisma.automation.findMany({ where: { userId: req.user!.id, enabled: true }});
  const { transcript } = await getTranscriptData(req);

  const created = [];
  for (const a of autos) {
    const content = await generateSocialPost(transcript, a.platform as any, a.template);
    const d = await prisma.socialDraft.create({ data: { meetingId, platform: a.platform, content }});
    created.push(d);
  }
  res.json(created);
}

export async function postSocial(req: AuthedRequest, res: Response) {
  const { platform, content } = req.body as { platform: SocialPlatform; content: string };
  const meetingId = req.params.id;

  let externalId: string | null = null;
  if (platform === "LINKEDIN") externalId = await postToLinkedIn(req.user!.id, content) as any;
  else if (platform === "FACEBOOK") externalId = await postToFacebook(req.user!.id, content) as any;

  const post = await savePost(meetingId, platform, content, externalId || null);
  res.json(post);
}

async function getTranscriptData(req: AuthedRequest) {
  const m = await prisma.meeting.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  let transcript = "";
  if (m?.transcriptUrl) {
    transcript = await fetchText(m.transcriptUrl);
  }
  return { m, transcript };
}

async function fetchText(url: string) {
  try { const r = await fetch(url); return await r.text(); } catch { return ""; }
}
