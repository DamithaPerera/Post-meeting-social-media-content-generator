import cron from "node-cron";
import { prisma } from "./prisma.js";
import { env } from "../config/env.js";
import { scheduleRecallIfNeeded, recallGetCall } from "./recall.js";
import { logger } from "../config/logger.js";

// Every minute: schedule recall bots X minutes before start
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const inX = new Date(now.getTime() + env.RECALL_JOIN_LEAD_MINUTES_DEFAULT * 60 * 1000);

  const meetings = await prisma.meeting.findMany({
    where: {
      notetakerOn: true,
      recallCallId: null,
      startTime: { gte: now, lte: inX }
    }
  });

  for (const m of meetings) {
    logger.info({ m: m.id }, "Scheduling recall bot");
    await scheduleRecallIfNeeded(m.id);
  }
});

// Every 3 minutes: poll recall status for meetings with a callId and missing transcript
cron.schedule("*/3 * * * *", async () => {
  const pendings = await prisma.meeting.findMany({
    where: { recallCallId: { not: null }, transcriptUrl: null }
  });

  for (const m of pendings) {
    try {
      const info = await recallGetCall(m.recallCallId!);
      // info.status: created|joining|recording|completed|failed
      // info.transcript, info.media
      await prisma.meeting.update({
        where: { id: m.id },
        data: {
          recallStatus: info.status,
          transcriptUrl: info.transcript_url || m.transcriptUrl,
          mediaUrl: info.media_url || m.mediaUrl
        }
      });
    } catch (e) {
      logger.warn(e, "Recall poll failed");
    }
  }
});
