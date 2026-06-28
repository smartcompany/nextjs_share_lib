import type {
  AIChatCompletionRequest,
  AIChatCompletionResponse,
  AIChatContentPart,
  AIChatMessage,
  AIImageEditRequest,
  AIImageEditResponse,
} from "../types";
import { isYouTubeUrl } from "../youtube";

type GeminiPart =
  | { text: string }
  | { fileData: { fileUri: string; mimeType?: string } };

type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

function assertNever(value: never): never {
  throw new Error(`Unsupported content part type: ${String(value)}`);
}

function toGeminiPart(part: AIChatContentPart): GeminiPart {
  switch (part.type) {
    case "text":
      return { text: part.text };
    case "youtube_url": {
      const url = part.youtube_url.url.trim();
      if (!isYouTubeUrl(url)) {
        throw new Error(`Invalid YouTube URL: ${url}`);
      }
      return {
        fileData: {
          fileUri: url,
          mimeType: "video/mp4",
        },
      };
    }
    case "image_url":
      throw new Error(
        "Gemini provider does not support image_url parts. Use youtube_url for YouTube videos.",
      );
    default:
      return assertNever(part);
  }
}

function toGeminiContents(messages: AIChatMessage[]): {
  contents: GeminiContent[];
  systemInstruction?: { parts: Array<{ text: string }> };
} {
  const systemTexts: string[] = [];
  const contents: GeminiContent[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemTexts.push(
        typeof message.content === "string"
          ? message.content
          : message.content
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("\n"),
      );
      continue;
    }

    const parts =
      typeof message.content === "string"
        ? [{ text: message.content }]
        : message.content.map(toGeminiPart);

    contents.push({
      role: message.role === "assistant" ? "model" : "user",
      parts,
    });
  }

  return {
    contents,
    ...(systemTexts.length > 0
      ? {
          systemInstruction: {
            parts: [{ text: systemTexts.join("\n\n") }],
          },
        }
      : {}),
  };
}

function toPlainRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? { ...(value as Record<string, unknown>) }
    : {};
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: Record<string, unknown>;
  error?: { message?: string };
};

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export class GeminiProvider {
  constructor(private readonly apiKey: string) {}

  async createChatCompletion(
    request: AIChatCompletionRequest,
  ): Promise<AIChatCompletionResponse> {
    const { contents, systemInstruction } = toGeminiContents(request.messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: request.max_completion_tokens,
        ...(request.response_format?.type === "json_object"
          ? { responseMimeType: "application/json" }
          : {}),
      },
      ...(systemInstruction ? { systemInstruction } : {}),
    };

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${request.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey,
        },
        body: JSON.stringify(body),
      },
    );

    const payload = (await response.json()) as GeminiGenerateContentResponse;

    if (!response.ok) {
      const message =
        payload.error?.message ??
        JSON.stringify(payload).slice(0, 500) ??
        response.statusText;
      throw new Error(`Gemini API error (${response.status}): ${message}`);
    }

    const text =
      payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim() ?? null;

    return {
      choices: [
        {
          message: { content: text },
          finish_reason: payload.candidates?.[0]?.finishReason ?? null,
        },
      ],
      usage: payload.usageMetadata
        ? toPlainRecord(payload.usageMetadata)
        : undefined,
    };
  }

  async editImage(_request: AIImageEditRequest): Promise<AIImageEditResponse> {
    throw new Error("Gemini provider does not support image editing.");
  }
}
