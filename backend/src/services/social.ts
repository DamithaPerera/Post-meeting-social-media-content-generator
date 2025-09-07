import axios from "axios";
import { prisma } from "./prisma.js";
import { SocialPlatform } from "@prisma/client";

/** LinkedIn share (UGC or text-only) */
export async function postToLinkedIn(userId: string, content: string) {
  const sa = await prisma.socialAccount.findFirst({ where: { userId, provider: "LINKEDIN" }});
  if (!sa) throw new Error("No LinkedIn account connected.");

  // Get author URN
  const profileId = sa.profileId; // e.g., "urn:li:person:xxxx"
  const r = await axios.post(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      author: profileId,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE"
        }
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    },
    { headers: { Authorization: `Bearer ${sa.accessToken}` } }
  );
  return r.data.id || r.data;
}

/** Facebook feed post (requires pages_manage_posts or publish_actions depend on App type) */
export async function postToFacebook(userId: string, content: string) {
  const sa = await prisma.socialAccount.findFirst({ where: { userId, provider: "FACEBOOK" }});
  if (!sa) throw new Error("No Facebook account connected.");

  // For simplicity, post to the user's feed via Graph API v19.0
  const r = await axios.post(
    `https://graph.facebook.com/v19.0/${sa.profileId}/feed`,
    { message: content, access_token: sa.accessToken }
  );
  return r.data.id;
}

export async function savePost(meetingId: string, platform: SocialPlatform, content: string, externalId: string | null) {
  return prisma.socialPost.create({
    data: { meetingId, platform, content, externalId }
  });
}
