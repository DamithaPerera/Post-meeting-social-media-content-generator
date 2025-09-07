import { Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../services/prisma.js";
import { AuthedRequest } from "../middlewares/auth.js";
import axios from "axios";

// ===== User settings
export async function getSettings(req: AuthedRequest, res: Response) {
  const s = await prisma.userSettings.upsert({
    where: { userId: req.user!.id },
    create: { userId: req.user!.id, botLeadMinutes: env.RECALL_JOIN_LEAD_MINUTES_DEFAULT },
    update: {}
  });
  const linkedIn = await prisma.socialAccount.findFirst({ where: { userId: req.user!.id, provider: "LINKEDIN" } });
  const fb = await prisma.socialAccount.findFirst({ where: { userId: req.user!.id, provider: "FACEBOOK" } });
  res.json({ settings: s, linkedinConnected: !!linkedIn, facebookConnected: !!fb });
}

export async function updateSettings(req: AuthedRequest, res: Response) {
  const { botLeadMinutes } = req.body;
  const s = await prisma.userSettings.upsert({
    where: { userId: req.user!.id },
    update: { botLeadMinutes },
    create: { userId: req.user!.id, botLeadMinutes }
  });
  res.json(s);
}

// ===== Automations
export async function listAutomations(req: AuthedRequest, res: Response) {
  const autos = await prisma.automation.findMany({ where: { userId: req.user!.id } });
  res.json(autos);
}

export async function upsertAutomation(req: AuthedRequest, res: Response) {
  const { id, platform, name, template, enabled } = req.body;
  const a = id
    ? await prisma.automation.update({ where: { id }, data: { platform, name, template, enabled } })
    : await prisma.automation.create({ data: { userId: req.user!.id, platform, name, template, enabled: enabled ?? true } });
  res.json(a);
}

export async function deleteAutomation(req: AuthedRequest, res: Response) {
  await prisma.automation.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}

// ===== LinkedIn OAuth
export function linkedinStart(_req: Request, res: Response) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.LINKEDIN_CLIENT_ID,
    redirect_uri: env.LINKEDIN_REDIRECT_URI,
    scope: "r_liteprofile r_emailaddress w_member_social"
  });
  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
}

export async function linkedinCallback(req: Request, res: Response) {
  const { code } = req.query as any;

  const tokenRes = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.LINKEDIN_REDIRECT_URI,
    client_id: env.LINKEDIN_CLIENT_ID,
    client_secret: env.LINKEDIN_CLIENT_SECRET
  }));
  const accessToken = tokenRes.data.access_token;

  const me = await axios.get("https://api.linkedin.com/v2/me", { headers: { Authorization: `Bearer ${accessToken}` }});
  const userEmail = (await axios.get("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", { headers: { Authorization: `Bearer ${accessToken}` }}))
    .data.elements?.[0]?.["handle~"]?.emailAddress;

  // Map LinkedIn id to URN
  const urn = `urn:li:person:${me.data.id}`;

  // Look up current session user by cookie token? For simplicity, redirect via frontend to attach later.
  // In challenge flow we assume the user is already logged in and carries token param 'u'
  const userId = (req.query.u as string) || ""; // optionally pass ?u=<userId> when starting flow
  if (!userId) return res.status(400).send("Missing user context. Start OAuth from the app.");

  await prisma.socialAccount.upsert({
    where: { provider_profileId_userId: { provider: "LINKEDIN", profileId: urn, userId } },
    create: { provider: "LINKEDIN", profileId: urn, userId, accessToken },
    update: { accessToken }
  });
  res.redirect(process.env.CORS_ORIGIN?.split(",")[0] || "http://localhost:5173");
}

// ===== Facebook OAuth
export function facebookStart(_req: Request, res: Response) {
  const params = new URLSearchParams({
    client_id: env.FACEBOOK_CLIENT_ID,
    redirect_uri: env.FACEBOOK_REDIRECT_URI,
    scope: "public_profile,email,publish_to_groups,pages_manage_posts,publish_actions"
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
}

export async function facebookCallback(req: Request, res: Response) {
  const { code, u } = req.query as any;

  const tokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
    params: {
      client_id: env.FACEBOOK_CLIENT_ID,
      client_secret: env.FACEBOOK_CLIENT_SECRET,
      redirect_uri: env.FACEBOOK_REDIRECT_URI,
      code
    }
  });
  const accessToken = tokenRes.data.access_token;

  const me = await axios.get("https://graph.facebook.com/v19.0/me", { params: { access_token: accessToken }});
  const profileId = me.data.id;

  const userId = u || "";
  if (!userId) return res.status(400).send("Missing user context. Start OAuth from the app.");

  await prisma.socialAccount.upsert({
    where: { provider_profileId_userId: { provider: "FACEBOOK", profileId, userId } },
    create: { provider: "FACEBOOK", profileId, userId, accessToken },
    update: { accessToken }
  });

  res.redirect(process.env.CORS_ORIGIN?.split(",")[0] || "http://localhost:5173");
}
