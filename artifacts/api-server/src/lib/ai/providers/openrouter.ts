import type { AIMessage, AIProvider, ChatOptions } from '../types.js';
import { OpenAIProvider } from './openai.js';

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter';
  private inner: OpenAIProvider;

  constructor(apiKey: string) {
    this.inner = new OpenAIProvider(apiKey, 'https://openrouter.ai/api/v1');
  }

  get isConfigured(): boolean {
    return this.inner.isConfigured;
  }

  async chat(messages: AIMessage[], options: ChatOptions = {}): Promise<string> {
    return this.inner.chat(messages, {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      ...options,
    });
  }

  async streamChat(
    messages: AIMessage[],
    options: ChatOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    return this.inner.streamChat(
      messages,
      { model: 'meta-llama/llama-3.1-8b-instruct:free', ...options },
      onChunk
    );
  }
}
