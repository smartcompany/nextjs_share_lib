export type OpenAIModelPreset = "default" | "vision" | "reasoning";

/** Named presets — swap models here or override via env vars. */
export const OPENAI_MODEL_PRESETS = {
  default: "gpt-5-mini",
  vision: "gpt-5-mini",
  reasoning: "gpt-5-mini",
} as const satisfies Record<OpenAIModelPreset, string>;

export type OpenAIChatConfig = {
  model: string;
  max_completion_tokens: number;
};

export const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

const DEFAULT_MAX_COMPLETION_TOKENS = 2000;

function readMaxCompletionTokens(): number {
  const raw = process.env.OPENAI_MAX_COMPLETION_TOKENS?.trim();
  if (!raw) return DEFAULT_MAX_COMPLETION_TOKENS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_COMPLETION_TOKENS;
}

/**
 * Resolve model name: explicit override → OPENAI_MODEL → OPENAI_MODEL_{PRESET} → preset default.
 */
export function resolveOpenAIModel(
  preset: OpenAIModelPreset = "default",
  override?: string,
): string {
  if (override?.trim()) return override.trim();

  const globalModel = process.env.OPENAI_MODEL?.trim();
  if (globalModel) return globalModel;

  const presetKey = `OPENAI_MODEL_${preset.toUpperCase()}` as const;
  const presetModel = process.env[presetKey]?.trim();
  if (presetModel) return presetModel;

  return OPENAI_MODEL_PRESETS[preset];
}

export function getOpenAIChatConfig(options?: {
  preset?: OpenAIModelPreset;
  model?: string;
  maxCompletionTokens?: number;
}): OpenAIChatConfig {
  return {
    model: resolveOpenAIModel(options?.preset ?? "default", options?.model),
    max_completion_tokens:
      options?.maxCompletionTokens ?? readMaxCompletionTokens(),
  };
}

/** Spread into `openai.chat.completions.create({ ...openAIChatConfig, messages })`. */
export const openAIChatConfig = getOpenAIChatConfig();

/** Alias used by FaceReader / LetsMeet / MyStyle. */
export const openAIConfig = openAIChatConfig;

export function getOpenAIApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

export function requireOpenAIApiKey(): string {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return apiKey;
}
