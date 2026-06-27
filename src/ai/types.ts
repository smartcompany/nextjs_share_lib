import type { AIChatPreset } from "./config";

export type AIProvider = "openai";

export type AIChatContentPart =
  | { type: "text"; text: string }
  | {
      type: "image_url";
      image_url: { url: string; detail?: "low" | "high" | "auto" };
    };

export type AIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | AIChatContentPart[];
};

/** Caller input — model/token settings are resolved inside the library. */
export type AIChatCompletionParams = {
  preset?: AIChatPreset;
  messages: AIChatMessage[];
  response_format?: { type: "json_object" | "text" };
};

/** Provider payload after preset merge. */
export type AIChatCompletionRequest = AIChatPresetConfigFields &
  Pick<AIChatCompletionParams, "messages" | "response_format">;

type AIChatPresetConfigFields = {
  model: string;
  max_completion_tokens: number;
  reasoning_effort?: string;
};

/**
 * Provider-agnostic completion payload.
 * Known fields are typed for common access; extra provider fields pass through.
 */
export type AIChatCompletionMessage = {
  content?: string | null;
  [key: string]: unknown;
};

export type AIChatCompletionChoice = {
  message?: AIChatCompletionMessage;
  finish_reason?: string | null;
  [key: string]: unknown;
};

export type AIChatCompletionResponse = {
  choices: AIChatCompletionChoice[];
  usage?: Record<string, unknown>;
  [key: string]: unknown;
};

/** Caller input — image model is resolved inside the library. */
export type AIImageEditParams = {
  image: File;
  prompt: string;
};

export type AIImageEditRequest = AIImageEditParams & {
  model: string;
};

export type AIImageEditResponse = {
  data?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type AIClientOptions = {
  apiKey: string;
  provider?: AIProvider;
};

/** First text content from a chat completion (convenience for callers). */
export function getChatCompletionText(
  response: AIChatCompletionResponse,
): string | null {
  const content = response.choices[0]?.message?.content;
  return typeof content === "string" ? content : null;
}
