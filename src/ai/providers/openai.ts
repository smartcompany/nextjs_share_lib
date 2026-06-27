import OpenAI from "openai";

import type {
  AIChatCompletionRequest,
  AIChatCompletionResponse,
  AIImageEditRequest,
  AIImageEditResponse,
} from "../types";

function toPlainRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? { ...(value as Record<string, unknown>) }
    : {};
}

export class OpenAIProvider {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async createChatCompletion(
    request: AIChatCompletionRequest,
  ): Promise<AIChatCompletionResponse> {
    const response = await this.client.chat.completions.create(
      request as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
    );

    return {
      choices: response.choices.map((choice) => ({
        ...toPlainRecord(choice),
        message: choice.message ? toPlainRecord(choice.message) : undefined,
        finish_reason: choice.finish_reason,
      })),
      usage: response.usage ? toPlainRecord(response.usage) : undefined,
    };
  }

  async editImage(request: AIImageEditRequest): Promise<AIImageEditResponse> {
    const response = await this.client.images.edit({
      model: request.model,
      image: request.image,
      prompt: request.prompt,
    });

    return {
      ...toPlainRecord(response),
      data: response.data?.map((item) => toPlainRecord(item)),
    };
  }
}
