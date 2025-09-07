import { CallPlatform } from "@prisma/client";

export function detectPlatform(link?: string | null): CallPlatform {
  if (!link) return CallPlatform.UNKNOWN;
  const u = link.toLowerCase();
  if (u.includes("zoom.us")) return CallPlatform.ZOOM;
  if (u.includes("meet.google.com")) return CallPlatform.GOOGLE_MEET;
  if (u.includes("teams.microsoft.com")) return CallPlatform.MICROSOFT_TEAMS;
  return CallPlatform.UNKNOWN;
}
