import OpenAI from "openai";

import { getOpenAIApiKey, requireOpenAIApiKey } from "./config";

export function createOpenAIClient(options?: {
  apiKey?: string;
}): OpenAI {
  return new OpenAI({
    apiKey: options?.apiKey ?? requireOpenAIApiKey(),
  });
}

/** Returns null when OPENAI_API_KEY is missing (optional AI features). */
export function createOpenAIClientIfConfigured(): OpenAI | null {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}
