import type { AIChatContentPart, AIChatMessage } from "./types";

export function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return parsed.pathname.length > 1;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      return parsed.pathname === "/watch" && parsed.searchParams.has("v");
    }
    return false;
  } catch {
    return false;
  }
}

export function createYouTubeContentPart(url: string): AIChatContentPart {
  const trimmed = url.trim();
  if (!isYouTubeUrl(trimmed)) {
    throw new Error(`Invalid YouTube URL: ${url}`);
  }
  return { type: "youtube_url", youtube_url: { url: trimmed } };
}

/** Gemini provider helper: user message with a public YouTube video + prompt. */
export function buildYouTubeChatMessage(
  youtubeUrl: string,
  prompt: string,
): AIChatMessage {
  return {
    role: "user",
    content: [createYouTubeContentPart(youtubeUrl), { type: "text", text: prompt }],
  };
}
