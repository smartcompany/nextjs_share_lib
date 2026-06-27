import OpenAI from "openai";

import type {
  AIChatCompletionRequest,
  AIChatCompletionResponse,
  AIImageEditRequest,
  AIImageEditResponse,
} from "../types";

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

    return response as AIChatCompletionResponse;
  }

  async editImage(request: AIImageEditRequest): Promise<AIImageEditResponse> {
    const response = await this.client.images.edit({
      model: request.model,
      image: request.image,
      prompt: request.prompt,
    });

    return response as AIImageEditResponse;
  }
}
