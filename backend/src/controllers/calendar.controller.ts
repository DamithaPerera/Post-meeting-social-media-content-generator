import { Response } from "express";
import { AuthedRequest } from "../middlewares/auth.js";
import { listUpcomingMerged } from "../services/google.js";
import { prisma } from "../services/prisma.js";
import { detectPlatform } from "../utils/platform.js";

export async function listUpcoming(req: AuthedRequest, res: Response) {
  const events = await listUpcomingMerged(req.user!.id);

  // sync into DB (idempotent)
  for (const e of events) {
    await prisma.meeting.upsert({
      where: { eventId: e.eventId },
      update: {
        title: e.title, description: e.description,
        startTime: new Date(e.startTime), endTime: new Date(e.endTime),
        conferenceLink: e.conferenceLink, platform: detectPlatform(e.conferenceLink),
        sourceAccountId: e.sourceAccountId
      },
      create: {
        userId: req.user!.id,
        eventId: e.eventId,
        sourceAccountId: e.sourceAccountId,
        title: e.title, description: e.description,
        startTime: new Date(e.startTime), endTime: new Date(e.endTime),
        conferenceLink: e.conferenceLink, platform: detectPlatform(e.conferenceLink),
        attendees: { create: e.attendees }
      }
    });
  }

  const upcoming = await prisma.meeting.findMany({
    where: { userId: req.user!.id, startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" }
  });

  res.json(upcoming);
}

export async function toggleNotetaker(req: AuthedRequest, res: Response) {
  const { meetingId, on } = req.body as { meetingId: string; on: boolean };
  const m = await prisma.meeting.update({ where: { id: meetingId, }, data: { notetakerOn: !!on }});
  res.json(m);
}
