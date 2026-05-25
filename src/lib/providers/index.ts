// Provider registry. Server-side only — these import API keys from process.env
// and must never be bundled into client code.

import * as anthropic from './anthropic';
import * as openai from './openai';
import * as deepseek from './deepseek';
import type { Provider } from './shared';

export type ProviderId = 'anthropic' | 'openai' | 'deepseek';

interface ProviderEntry {
  id: ProviderId;
  name: string;
  shortName: string;
  defaultAnalyzeModel: string;
  defaultRewriteModel: string;
  models: Array<{ id: string; label: string }>;
  envKey: string;
  impl: Provider;
}

export const PROVIDERS: Record<ProviderId, ProviderEntry> = {
  anthropic: {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    shortName: 'Claude',
    defaultAnalyzeModel: 'claude-haiku-4-5',
    defaultRewriteModel: 'claude-sonnet-4-6',
    models: [
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (balanced)' },
      { id: 'claude-opus-4-7', label: 'Claude Opus 4.7 (highest quality)' },
      { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (fastest)' },
    ],
    envKey: 'ANTHROPIC_API_KEY',
    impl: anthropic,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'OpenAI',
    defaultAnalyzeModel: 'gpt-4o-mini',
    defaultRewriteModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o (balanced)' },
      { id: 'gpt-4o-mini', label: 'GPT-4o mini (fastest)' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    envKey: 'OPENAI_API_KEY',
    impl: openai,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    shortName: 'DeepSeek',
    defaultAnalyzeModel: 'deepseek-chat',
    defaultRewriteModel: 'deepseek-v4-pro',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek Chat (fast, no reasoning)' },
      { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro (reasoning, best quality)' },
      { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
    ],
    envKey: 'DEEPSEEK_API_KEY',
    impl: deepseek,
  },
};

export const PROVIDER_IDS: ProviderId[] = ['deepseek', 'anthropic', 'openai'];

export function getProvider(id: ProviderId): ProviderEntry {
  const p = PROVIDERS[id];
  if (!p) throw new Error(`Unknown provider: ${id}`);
  return p;
}

/** Read the server-side API key from env for a given provider. */
export function getProviderKey(id: ProviderId): string {
  const key = process.env[PROVIDERS[id].envKey];
  if (!key) {
    throw new Error(`Missing env var ${PROVIDERS[id].envKey} for provider ${id}`);
  }
  return key;
}
