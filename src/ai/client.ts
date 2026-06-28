import { AI_IMAGE_EDIT_MODEL, getAIChatPresetConfig } from "./config";
import { GeminiProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";
import type {
  AIChatCompletionParams,
  AIChatCompletionResponse,
  AIClientOptions,
  AIImageEditParams,
  AIImageEditResponse,
  AIProvider,
} from "./types";

type AIProviderImpl = {
  createChatCompletion: (
    request: AIChatCompletionParams & ReturnType<typeof getAIChatPresetConfig>,
  ) => Promise<AIChatCompletionResponse>;
  editImage: (
    request: AIImageEditParams & { model: string },
  ) => Promise<AIImageEditResponse>;
};

function createProvider(
  provider: AIProvider,
  apiKey: string,
): AIProviderImpl {
  switch (provider) {
    case "openai":
      return new OpenAIProvider(apiKey);
    case "gemini":
      return new GeminiProvider(apiKey);
    default: {
      const unsupported: never = provider;
      throw new Error(`Unsupported AI provider: ${unsupported}`);
    }
  }
}

export class AIClient {
  private readonly provider: AIProviderImpl;
  private readonly providerName: AIProvider;

  constructor({ apiKey, provider = "openai" }: AIClientOptions) {
    this.providerName = provider;
    this.provider = createProvider(provider, apiKey);
  }

  createChatCompletion(
    params: AIChatCompletionParams,
  ): Promise<AIChatCompletionResponse> {
    const { preset = "default", messages, response_format } = params;
    const presetConfig = getAIChatPresetConfig(this.providerName, preset);

    return this.provider.createChatCompletion({
      ...presetConfig,
      messages,
      ...(response_format ? { response_format } : {}),
    });
  }

  editImage(params: AIImageEditParams): Promise<AIImageEditResponse> {
    return this.provider.editImage({
      ...params,
      model: AI_IMAGE_EDIT_MODEL,
    });
  }
}

export function createAIClient(options: AIClientOptions): AIClient {
  return new AIClient(options);
}
