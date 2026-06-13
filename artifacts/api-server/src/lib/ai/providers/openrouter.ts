import type { AIMessage, AIProvider, ChatOptions } from '../types.js';

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

  async chat(messages: AIMessage[], options: ChatOptions = {}): Promise<string> {
    const response = await this.chatCompletions(messages, options, false);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${err}`);
    }
    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content ?? '';
  }

  async streamChat(
    messages: AIMessage[],
    options: ChatOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const response = await this.chatCompletions(messages, options, true);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter stream error ${response.status}: ${err}`);
    }

    let full = '';
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
            choices: Array<{ delta: { content?: string } }>;
          };
          const chunk = parsed.choices[0]?.delta?.content ?? '';
          if (chunk) {
            full += chunk;
            onChunk?.(chunk);
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }

    return full;
  }
}
