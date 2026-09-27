import { createMockProvider, pickBucket } from './mock';
import { getProvider } from './provider';
import { PERSONA_PROMPT } from './persona';
import type { LLMProvider } from './types';

async function collect(provider: LLMProvider, text: string): Promise<{ chunks: string[]; full: string }> {
  const chunks: string[] = [];
  for await (const chunk of provider.streamReply({
    system: PERSONA_PROMPT,
    messages: [
      { role: 'assistant', content: '오늘 마음 날씨는 어떤가요?' },
      { role: 'user', content: text },
    ],
  })) {
    chunks.push(chunk);
  }
  return { chunks, full: chunks.join('') };
}

describe('pickBucket (목업 답장 분류)', () => {
  it.each([
    ['너무 피곤해', 'tired'],
    ['그냥 좀 지쳤어요', 'tired'],
    ['요즘 외로워', 'lonely'],
    ['내일 발표가 불안해', 'anxious'],
    ['친구 때문에 속상해', 'sad'],
    ['진짜 짜증나', 'angry'],
    ['좋은 일이 있었어요', 'happy'],
    ['잘 모르겠어요', 'default'],
    ['음', 'default'],
  ])('"%s" → %s', (text, bucket) => {
    expect(pickBucket(text)).toBe(bucket);
  });
});

describe('createMockProvider', () => {
  it('여러 조각으로 나눠 흘려보내고, 이으면 질문으로 끝나는 답장이다', async () => {
    const { chunks, full } = await collect(createMockProvider({ delayMs: 0 }), '너무 피곤해');
    expect(chunks.length).toBeGreaterThan(1);
    expect(full.length).toBeGreaterThan(10);
    expect(full.trim().endsWith('?')).toBe(true);
    expect(full).toContain('온기님');
  });

  it('random을 고정하면 같은 답장을 준다', async () => {
    const a = await collect(createMockProvider({ delayMs: 0, random: () => 0 }), '외로워');
    const b = await collect(createMockProvider({ delayMs: 0, random: () => 0 }), '외로워');
    expect(a.full).toBe(b.full);
  });
});

describe('getProvider', () => {
  it('설정이 없거나 mock이면 목업을 준다', () => {
    expect(getProvider({})).toBeDefined();
    expect(getProvider({ LLM_PROVIDER: 'mock' })).toBeDefined();
  });

  it('아직 없는 제공자면 오류', () => {
    expect(() => getProvider({ LLM_PROVIDER: 'claude' })).toThrow();
  });
});

describe('PERSONA_PROMPT', () => {
  it('말투 규칙과 위기 안내를 담는다', () => {
    expect(PERSONA_PROMPT).toContain('온기님');
    expect(PERSONA_PROMPT).toContain('109');
  });
});

describe('목업 답장과 이름', () => {
  it('사용자가 이름을 바꿀 수 있으므로 답장에서 스스로를 "오목이"·"뱁새"라고 부르지 않는다', async () => {
    const samples = ['외로워', '슬퍼', '불안해', '화나', '피곤해', '행복해', '그냥 그래'];
    for (const text of samples) {
      for (const r of [0, 0.4, 0.8]) {
        const { full } = await collect(createMockProvider({ delayMs: 0, random: () => r }), text);
        expect(full).not.toMatch(/오목이|뱁새/);
      }
    }
  });
});
