export type AIChatPreset = "default" | "long_output";

export type AIChatPresetConfig = {
  model: string;
  max_completion_tokens: number;
  reasoning_effort?: string;
};

/** Chat model/token settings — change models here. */
export const AI_CHAT_PRESETS_BY_PROVIDER = {
  openai: {
    default: {
      model: "gpt-5-mini",
      max_completion_tokens: 2000,
    },
    long_output: {
      model: "gpt-5-mini",
      max_completion_tokens: 14000,
      reasoning_effort: "minimal",
    },
  },
  gemini: {
    default: {
      model: "gemini-2.5-flash",
      max_completion_tokens: 2000,
    },
    long_output: {
      model: "gemini-2.5-flash",
      max_completion_tokens: 8192,
    },
  },
} as const satisfies Record<
  "openai" | "gemini",
  Record<AIChatPreset, AIChatPresetConfig>
>;

/** @deprecated Use AI_CHAT_PRESETS_BY_PROVIDER.openai */
export const AI_CHAT_PRESETS = AI_CHAT_PRESETS_BY_PROVIDER.openai;

export const AI_IMAGE_EDIT_MODEL = "gpt-image-1";

export function getAIChatPresetConfig(
  provider: keyof typeof AI_CHAT_PRESETS_BY_PROVIDER = "openai",
  preset: AIChatPreset = "default",
): AIChatPresetConfig {
  return AI_CHAT_PRESETS_BY_PROVIDER[provider][preset];
}
