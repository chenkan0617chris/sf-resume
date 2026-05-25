import { makeOpenAICompatibleProvider } from './openaiCompatible';

const BASE = process.env.VITE_DEEPSEEK_API_BASE || 'https://api.deepseek.com';

export const { analyze, rewrite } = makeOpenAICompatibleProvider({
  baseUrl: BASE,
  chatPath: '/v1/chat/completions',
  supportsJsonMode: true,
});
