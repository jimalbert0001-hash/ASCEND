import type { AIProvider } from './types.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { GeminiProvider } from './providers/gemini.js';
import { OpenRouterProvider } from './providers/openrouter.js';

export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'openrouter';

const OPENROUTER_KEY_NAMES = [
  'OPENROUTER_API_KEY',
  'Stanford Coach',
  'OPENROUTER_KEY',
];

const OPENAI_KEY_NAMES = ['OPENAI_API_KEY', 'OPENAI_KEY'];
const ANTHROPIC_KEY_NAMES = ['ANTHROPIC_API_KEY', 'ANTHROPIC_KEY'];
const GEMINI_KEY_NAMES = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GEMINI_KEY'];

function findKey(names: string[]): string {
  for (const name of names) {
    const val = process.env[name];
    if (val) return val;
  }
  return '';
}

function autoDetectProvider(): ProviderName {
  const explicit = (process.env.AI_PROVIDER ?? '').toLowerCase() as ProviderName;
  const valid: ProviderName[] = ['openai', 'anthropic', 'gemini', 'openrouter'];
  if (valid.includes(explicit)) return explicit;

  if (findKey(ANTHROPIC_KEY_NAMES)) return 'anthropic';
  if (findKey(GEMINI_KEY_NAMES)) return 'gemini';
  if (findKey(OPENROUTER_KEY_NAMES)) return 'openrouter';
  if (findKey(OPENAI_KEY_NAMES)) return 'openai';

  return 'openai';
}

export function createProvider(): AIProvider {
  const provider = autoDetectProvider();

  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider(findKey(ANTHROPIC_KEY_NAMES));
    case 'gemini':
      return new GeminiProvider(findKey(GEMINI_KEY_NAMES));
    case 'openrouter':
      return new OpenRouterProvider(findKey(OPENROUTER_KEY_NAMES));
    case 'openai':
    default:
      return new OpenAIProvider(findKey(OPENAI_KEY_NAMES));
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
  model: string;
} {
  const name = autoDetectProvider();

  const keyMap: Record<ProviderName, string[]> = {
    openai: OPENAI_KEY_NAMES,
    anthropic: ANTHROPIC_KEY_NAMES,
    gemini: GEMINI_KEY_NAMES,
    openrouter: OPENROUTER_KEY_NAMES,
  };

  const defaultModelMap: Record<ProviderName, string> = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-haiku-20241022',
    gemini: 'gemini-1.5-flash',
    openrouter: 'meta-llama/llama-3.1-8b-instruct:free',
  };

  const foundKey = findKey(keyMap[name]);
  const envVarFound = keyMap[name].find((n) => process.env[n]) ?? keyMap[name][0];

  return {
    provider: name,
    configured: Boolean(foundKey),
    envVar: envVarFound,
    model: process.env.AI_MODEL ?? defaultModelMap[name],
  };
}
