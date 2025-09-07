import axios from "axios";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";
import { logger } from "../config/logger.js";

const API = axios.create({
  baseURL: "https://api.recall.ai/api/v1",
  headers: { Authorization: `Token ${env.RECALL_API_KEY}` }
});

// Join a call (returns call_id)
export async function recallJoinCall(opts: {
  platform: "zoom" | "google-meet" | "microsoft-teams",
  link: string,
  startAt?: Date
}) {
  const { data } = await API.post("/join-call/", {
    platform: opts.platform,
    meeting_link: opts.link
  });
  return data; // { call_id, ... }
}

// Poll call status and media
export async function recallGetCall(callId: string) {
  const { data } = await API.get(`/calls/${callId}/`);
  return data; // includes status and media links
}

export async function scheduleRecallIfNeeded(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId }});
  if (!meeting || !meeting.notetakerOn || !meeting.conferenceLink) return;

  if (meeting.recallCallId) return; // already scheduled/created

  // Join immediately: Recall will waitroom/join per platform automatically.
  let platform: "zoom"|"google-meet"|"microsoft-teams" = "google-meet";
  if (meeting.platform === "ZOOM") platform = "zoom";
  else if (meeting.platform === "MICROSOFT_TEAMS") platform = "microsoft-teams";

  try {
    const joined = await recallJoinCall({ platform, link: meeting.conferenceLink });
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { recallCallId: joined.call_id, recallStatus: "created" }
    });
    logger.info({ meetingId, callId: joined.call_id }, "Recall bot created");
  } catch (e:any) {
    logger.error(e, "recall join failed");
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { recallStatus: "failed" }
    });
  }
}
