import type { AIProvider, AIMessage, ChatOptions, ChatResult, TokenUsage } from '../types.js';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private buildContents(messages: AIMessage[]): {
    systemInstruction?: { parts: Array<{ text: string }> };
    contents: Array<{ role: string; parts: Array<{ text: string }> }>;
  } {
    const systemMsgs = messages.filter((m) => m.role === 'system');
    const chatMsgs = messages.filter((m) => m.role !== 'system');

    const result: {
      systemInstruction?: { parts: Array<{ text: string }> };
      contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    } = {
      contents: chatMsgs.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    };

    if (systemMsgs.length > 0) {
      result.systemInstruction = {
        parts: [{ text: systemMsgs.map((m) => m.content).join('\n\n') }],
      };
    }

    return result;
  }

  async chat(messages: AIMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const model = options.model ?? 'gemini-1.5-flash';
    const { systemInstruction, contents } = this.buildContents(messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1500,
      },
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini error ${response.status}: ${err}`);
    }

    const data = (await response.json()) as {
      candidates: Array<{
        content: { parts: Array<{ text: string }> };
      }>;
      usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number };
    };
    const usage: TokenUsage | undefined = data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
        }
      : undefined;
    const content = data.candidates[0]?.content?.parts?.[0]?.text ?? '';
    return { content, usage };
  }

  async streamChat(
    messages: AIMessage[],
    options: ChatOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<ChatResult> {
    const model = options.model ?? 'gemini-1.5-flash';
    const { systemInstruction, contents } = this.buildContents(messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1500,
      },
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini stream error ${response.status}: ${err}`);
    }

    let full = '';
    let promptTokens = 0;
    let completionTokens = 0;
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter((l) => l.startsWith('data: '));

      for (const line of lines) {
        const payload = line.slice(6).trim();
        try {
          const parsed = JSON.parse(payload) as {
            candidates?: Array<{
              content: { parts: Array<{ text: string }> };
            }>;
            usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number };
          };
          if (parsed.usageMetadata) {
            promptTokens = parsed.usageMetadata.promptTokenCount;
            completionTokens = parsed.usageMetadata.candidatesTokenCount;
          }
          const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (chunk) {
            full += chunk;
            onChunk?.(chunk);
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }

    const usage: TokenUsage | undefined =
      promptTokens || completionTokens
        ? {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          }
        : undefined;
    return { content: full, usage };
  }
}
