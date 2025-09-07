import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";
import { extractConferenceLink } from "../utils/extract-links.js";
import { detectPlatform } from "../utils/platform.js";
import { dedupeBy } from "../utils/dedupe.js";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.readonly",
];

export function newGoogleOauth() {
  return new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

export async function createOrUpdateGoogleAccount(userId: string, tokens: any, profile: any) {
  const googleId = profile.sub;
  const email = profile.email;
  const expiryDate = tokens.expiry_date ? BigInt(tokens.expiry_date) : null;
  return prisma.googleAccount.upsert({
    where: { id: googleId },
    update: {
      userId, email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
      expiryDate
    },
    create: {
      userId, googleId, email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? "",
      expiryDate
    }
  });
}

export async function refreshIfNeeded(ga: any) {
  const oauth2 = newGoogleOauth();
  oauth2.setCredentials({
    access_token: ga.accessToken,
    refresh_token: ga.refreshToken,
    expiry_date: ga.expiryDate ? Number(ga.expiryDate) : undefined
  });
  if (!ga.expiryDate || Number(ga.expiryDate) < Date.now() + 60_000) {
    const { credentials } = await oauth2.refreshAccessToken();
    await prisma.googleAccount.update({
      where: { id: ga.id },
      data: {
        accessToken: credentials.access_token!,
        expiryDate: BigInt(credentials.expiry_date!),
        refreshToken: credentials.refresh_token ?? ga.refreshToken
      }
    });
    oauth2.setCredentials(credentials);
  }
  return oauth2;
}

export async function listUpcomingMerged(userId: string) {
  const accounts = await prisma.googleAccount.findMany({ where: { userId } });
  const results: any[] = [];
  const now = new Date();
  const maxTime = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14); // next 14d

  for (const ga of accounts) {
    const oauth2 = await refreshIfNeeded(ga);
    const cal = google.calendar({ version: "v3", auth: oauth2 });
    const { data } = await cal.events.list({
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      timeMin: now.toISOString(),
      timeMax: maxTime.toISOString(),
      maxResults: 2500
    });
    for (const ev of data.items ?? []) {
      const attendees = (ev.attendees ?? []).map(a => ({ name: a.displayName, email: a.email }));
      const conferenceLink = extractConferenceLink(ev);
      results.push({
        sourceAccountId: ga.id,
        eventId: `${ga.id}:${ev.id}`,
        title: ev.summary || "(no title)",
        description: ev.description || "",
        startTime: ev.start?.dateTime || ev.start?.date,
        endTime: ev.end?.dateTime || ev.end?.date,
        attendees,
        conferenceLink,
        platform: detectPlatform(conferenceLink)
      });
    }
  }

  return dedupeBy(results, (x) => x.eventId);
}

export const GoogleScopes = SCOPES;
