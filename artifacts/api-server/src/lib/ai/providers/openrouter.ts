import type { AIMessage, AIProvider, ChatOptions, ChatResult, TokenUsage } from '../types.js';

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter';
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private async chatCompletions(
    messages: AIMessage[],
    options: ChatOptions = {},
    stream = false
  ): Promise<Response> {
    return fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://ascend.replit.app',
        'X-Title': 'ASCEND',
      },
      body: JSON.stringify({
        model: options.model ?? 'meta-llama/llama-3.1-8b-instruct',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1500,
        stream,
      }),
    });
  }

  async chat(messages: AIMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const response = await this.chatCompletions(messages, options, false);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${err}`);
    }
    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };
    const usage: TokenUsage | undefined = data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined;
    return { content: data.choices[0]?.message?.content ?? '', usage };
  }

  async streamChat(
    messages: AIMessage[],
    options: ChatOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<ChatResult> {
    const response = await this.chatCompletions(messages, options, true);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter stream error ${response.status}: ${err}`);
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
        if (payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta: { content?: string } }>;
            usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
          };
          if (parsed.usage) {
            promptTokens = parsed.usage.prompt_tokens;
            completionTokens = parsed.usage.completion_tokens;
          }
          const chunk = parsed.choices?.[0]?.delta?.content ?? '';
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
