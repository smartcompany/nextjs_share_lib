import OpenAI from "openai";

import type {
  AIChatCompletionRequest,
  AIChatCompletionResponse,
  AIChatContentPart,
  AIChatMessage,
  AIImageEditRequest,
  AIImageEditResponse,
} from "../types";

function toOpenAIContent(
  content: string | AIChatContentPart[],
): string | OpenAI.Chat.ChatCompletionContentPart[] {
  if (typeof content === "string") {
    return content;
  }

  return content.map((part) => {
    switch (part.type) {
      case "text":
        return { type: "text" as const, text: part.text };
      case "image_url":
        return {
          type: "image_url" as const,
          image_url: part.image_url,
        };
      case "youtube_url":
        throw new Error(
          "OpenAI provider does not support youtube_url parts. Use provider: \"gemini\".",
        );
      default: {
        const unsupported: never = part;
        throw new Error(`Unsupported content part: ${String(unsupported)}`);
      }
    }
  });
}

function toOpenAIMessages(
  messages: AIChatMessage[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  return messages.map((message) => {
    const content = toOpenAIContent(message.content);
    switch (message.role) {
      case "system":
        return { role: "system", content: typeof content === "string" ? content : "" };
      case "assistant":
        return { role: "assistant", content };
      case "user":
        return { role: "user", content };
    }
  }) as OpenAI.Chat.ChatCompletionMessageParam[];
}

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
    const { messages, ...rest } = request;
    const response = await this.client.chat.completions.create({
      ...(rest as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming),
      messages: toOpenAIMessages(messages),
    });

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
