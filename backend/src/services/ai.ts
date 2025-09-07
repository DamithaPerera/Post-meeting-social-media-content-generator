import axios from "axios";
import { env } from "../config/env.js";

export async function generateEmailFollowup(transcript: string): Promise<string> {
  const base = "Here’s a concise, friendly follow-up summarizing key points, decisions, and next steps:\n\n";
  return runLLM(`Summarize this meeting and draft a friendly follow-up email with bullet points and action items:\n\n${transcript}`)
    .catch(() => base + ruleBasedSummary(transcript));
}

export async function generateSocialPost(transcript: string, platform: "LINKEDIN"|"FACEBOOK", template?: string) {
  const prompt = template || `Draft a ${platform === "LINKEDIN" ? "LinkedIn" : "Facebook"} post (120-180 words), first-person, warm, clear value, no confidential info. End with up to three relevant hashtags. Content:\n${transcript}`;
  return runLLM(prompt).catch(() => ruleBasedPost(transcript, platform));
}

async function runLLM(prompt: string): Promise<string> {
  if (!env.OPENAI_API_KEY) throw new Error("No LLM key");
  const r = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  }, { headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }});
  return r.data.choices[0].message.content.trim();
}

// Extremely basic fallbacks
function ruleBasedSummary(t: string) {
  const first = t.split(/\.\s+/).slice(0, 5).join(". ");
  return `• Key themes: staying calm, goals, next steps.\n• Highlights: ${first}\n• Next steps: schedule review; align risk & goals; confirm timeline.`;
}
function ruleBasedPost(t: string, platform: "LINKEDIN"|"FACEBOOK") {
  const snip = t.replace(/\s+/g," ").slice(0, 220);
  const tags = platform === "LINKEDIN" ? "#FinancialWellness #ClientSuccess #MarketInsights" : "#Community #FinancialTips #Planning";
  return `Great conversation today about aligning plans with life changes. Key takeaways: ${snip}… Small, steady adjustments build confidence over time.\n\n${tags}`;
}
