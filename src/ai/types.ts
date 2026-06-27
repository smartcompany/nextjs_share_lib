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

export type AIChatCompletionChoice = {
  message?: { content?: string | null };
  finish_reason?: string | null;
};

export type AIChatCompletionResponse = {
  choices: AIChatCompletionChoice[];
  usage?: Record<string, unknown>;
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
  data?: Array<{ url?: string | null }>;
};

export type AIClientOptions = {
  apiKey: string;
  provider?: AIProvider;
};
