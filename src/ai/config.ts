export type AIChatPreset = "default" | "long_output";

export type AIChatPresetConfig = {
  model: string;
  max_completion_tokens: number;
  reasoning_effort?: string;
};

/** Chat model/token settings — change models here. */
export const AI_CHAT_PRESETS = {
  default: {
    model: "gpt-5-mini",
    max_completion_tokens: 2000,
  },
  long_output: {
    model: "gpt-5-mini",
    max_completion_tokens: 14000,
    reasoning_effort: "minimal",
  },
} as const satisfies Record<AIChatPreset, AIChatPresetConfig>;

export const AI_IMAGE_EDIT_MODEL = "gpt-image-1";

export function getAIChatPresetConfig(
  preset: AIChatPreset = "default",
): AIChatPresetConfig {
  return AI_CHAT_PRESETS[preset];
}
