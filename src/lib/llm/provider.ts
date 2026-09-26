import { createMockProvider } from './mock';
import type { LLMProvider } from './types';

/**
 * 환경변수 LLM_PROVIDER로 구현체를 고른다. (기본: mock)
 * Claude 연동 시: ClaudeProvider를 같은 인터페이스로 만들고 여기에 'claude' 분기를 추가한다.
 */
export function getProvider(env: Record<string, string | undefined> = process.env): LLMProvider {
  const name = env.LLM_PROVIDER?.trim() || 'mock';
  if (name === 'mock') {
    return createMockProvider({ delayMs: Number(env.MOCK_DELAY_MS ?? 25) });
  }
  throw new Error(`지원하지 않는 LLM_PROVIDER: ${name}`);
}
