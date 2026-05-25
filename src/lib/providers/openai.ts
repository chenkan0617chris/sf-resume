import { makeOpenAICompatibleProvider } from './openaiCompatible';

const BASE = process.env.VITE_OPENAI_API_BASE || 'https://api.openai.com';

export const { analyze, rewrite } = makeOpenAICompatibleProvider({
  baseUrl: BASE,
  chatPath: '/v1/chat/completions',
  supportsJsonMode: true,
});
