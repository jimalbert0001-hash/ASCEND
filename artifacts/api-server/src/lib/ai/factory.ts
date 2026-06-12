import type { AIProvider } from './types.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { GeminiProvider } from './providers/gemini.js';
import { OpenRouterProvider } from './providers/openrouter.js';

export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'openrouter';

function getProviderName(): ProviderName {
  const env = (process.env.AI_PROVIDER ?? '').toLowerCase();
  const valid: ProviderName[] = ['openai', 'anthropic', 'gemini', 'openrouter'];
  return valid.includes(env as ProviderName) ? (env as ProviderName) : 'openai';
}

export function createProvider(): AIProvider {
  const provider = getProviderName();

  switch (provider) {
    case 'anthropic': {
      const key = process.env.ANTHROPIC_API_KEY ?? '';
      return new AnthropicProvider(key);
    }
    case 'gemini': {
      const key = process.env.GEMINI_API_KEY ?? '';
      return new GeminiProvider(key);
    }
    case 'openrouter': {
      const key = process.env.OPENROUTER_API_KEY ?? '';
      return new OpenRouterProvider(key);
    }
    case 'openai':
    default: {
      const key = process.env.OPENAI_API_KEY ?? '';
      return new OpenAIProvider(key);
    }
  }
}

let _instance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_instance) _instance = createProvider();
  return _instance;
}

export function getProviderStatus(): {
  provider: string;
  configured: boolean;
  envVar: string;
} {
  const name = getProviderName();
  const envVarMap: Record<ProviderName, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GEMINI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
  };
  const envVar = envVarMap[name];
  return {
    provider: name,
    configured: Boolean(process.env[envVar]),
    envVar,
  };
}
