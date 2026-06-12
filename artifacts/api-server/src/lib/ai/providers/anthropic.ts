import type { AIProvider, AIMessage, ChatOptions } from '../types.js';

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private separateSystemAndMessages(messages: AIMessage[]): {
    system: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  } {
    const systemMessages = messages.filter((m) => m.role === 'system');
    const chatMessages = messages.filter((m) => m.role !== 'system');

    return {
      system: systemMessages.map((m) => m.content).join('\n\n'),
      messages: chatMessages as Array<{ role: 'user' | 'assistant'; content: string }>,
    };
  }

  async chat(messages: AIMessage[], options: ChatOptions = {}): Promise<string> {
    const { system, messages: chatMessages } = this.separateSystemAndMessages(messages);

    const body: Record<string, unknown> = {
      model: options.model ?? 'claude-3-5-haiku-20241022',
      max_tokens: options.maxTokens ?? 1500,
      messages: chatMessages,
    };
    if (system) body.system = system;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${err}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    return data.content.find((b) => b.type === 'text')?.text ?? '';
  }

  async streamChat(
    messages: AIMessage[],
    options: ChatOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const { system, messages: chatMessages } = this.separateSystemAndMessages(messages);

    const body: Record<string, unknown> = {
      model: options.model ?? 'claude-3-5-haiku-20241022',
      max_tokens: options.maxTokens ?? 1500,
      messages: chatMessages,
      stream: true,
    };
    if (system) body.system = system;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic stream error ${response.status}: ${err}`);
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
        try {
          const parsed = JSON.parse(payload) as {
            type: string;
            delta?: { type: string; text?: string };
          };
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
            const chunk = parsed.delta.text ?? '';
            if (chunk) {
              full += chunk;
              onChunk?.(chunk);
            }
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }

    return full;
  }
}
