import { Response, Request } from "express";
import { newGoogleOauth, GoogleScopes, createOrUpdateGoogleAccount } from "../services/google.js";
import { prisma } from "../services/prisma.js";
import { signJwt } from "../config/jwt.js";

export async function googleAuthStart(_req: Request, res: Response) {
  const o = newGoogleOauth();
  const url = o.generateAuthUrl({
    access_type: "offline",
    scope: GoogleScopes,
    prompt: "consent"
  });
  res.redirect(url);
}

export async function googleAuthCallback(req: Request, res: Response) {
  const code = req.query.code as string;
  const o = newGoogleOauth();
  const { tokens } = await o.getToken(code);
  o.setCredentials(tokens);
  const ticket = await o.verifyIdToken({ idToken: tokens.id_token! });
  const profile = ticket.getPayload()!;
  // upsert user
  const user = await prisma.user.upsert({
    where: { email: profile.email! },
    update: { name: profile.name ?? undefined, image: profile.picture ?? undefined },
    create: { email: profile.email!, name: profile.name ?? null, image: profile.picture ?? null }
  });
  await createOrUpdateGoogleAccount(user.id, tokens, profile);

  const token = signJwt({ id: user.id, email: user.email, name: user.name });
  res.cookie("token", token, { httpOnly: false, sameSite: "lax" });
  res.redirect(process.env.CORS_ORIGIN?.split(",")[0] || "http://localhost:5173");
}
