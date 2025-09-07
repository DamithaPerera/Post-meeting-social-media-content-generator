export type Meeting = {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  platform: "ZOOM" | "GOOGLE_MEET" | "MICROSOFT_TEAMS" | "UNKNOWN";
  conferenceLink?: string | null;
  notetakerOn: boolean;
  recallStatus?: string | null;
  transcriptUrl?: string | null;
};

export type SocialDraft = {
  id: string;
  platform: "LINKEDIN" | "FACEBOOK";
  content: string;
  createdAt: string;
};

export type Automation = {
  id: string;
  name: string;
  platform: "LINKEDIN" | "FACEBOOK";
  template: string;
  enabled: boolean;
};

export type SettingsResp = {
  settings: { id: string; userId: string; botLeadMinutes: number };
  linkedinConnected: boolean;
  facebookConnected: boolean;
};
