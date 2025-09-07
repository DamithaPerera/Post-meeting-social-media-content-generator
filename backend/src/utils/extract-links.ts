export function extractConferenceLink(ev: any): string | null {
  // Try official conferenceData
  const confUri = ev?.conferenceData?.entryPoints?.[0]?.uri || ev?.hangoutLink;
  if (confUri) return confUri;

  // Fallback: scan description/location
  const text = [ev?.location, ev?.description].filter(Boolean).join(" ");
  const match = text.match(/https?:\/\/\S+/i);
  return match ? match[0] : null;
}
