import { MAX_MESSAGES, MAX_USER_CHARS, validateChatRequest } from './validate';

const question = { role: 'assistant', content: '오늘 마음 날씨는 어떤가요?' };

describe('validateChatRequest', () => {
  it('질문 + 사용자 메시지는 통과하고, 필요한 필드만 남긴다', () => {
    const result = validateChatRequest({
      messages: [question, { role: 'user', content: '맑아요', at: 'x', extra: 1 }],
    });
    expect(result).toEqual({
      ok: true,
      messages: [
        { role: 'assistant', content: '오늘 마음 날씨는 어떤가요?' },
        { role: 'user', content: '맑아요' },
      ],
    });
  });

  it.each([null, 'text', [], { messages: 'x' }, { messages: [] }])('형식이 잘못된 요청 %j → 오류', (body) => {
    expect(validateChatRequest(body).ok).toBe(false);
  });

  it('마지막 메시지가 사용자 메시지가 아니면 오류', () => {
    expect(validateChatRequest({ messages: [question] }).ok).toBe(false);
  });

  it(`사용자 메시지는 ${MAX_USER_CHARS}자까지`, () => {
    expect(validateChatRequest({ messages: [{ role: 'user', content: '가'.repeat(1000) }] }).ok).toBe(true);
    expect(validateChatRequest({ messages: [{ role: 'user', content: '가'.repeat(1001) }] }).ok).toBe(false);
  });

  it(`메시지는 ${MAX_MESSAGES}개까지`, () => {
    const make = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: `m${i}` })).reverse();
    // reverse로 마지막이 user가 되게 맞춘다 (n이 홀수일 때 첫 원소가 user)
    expect(validateChatRequest({ messages: make(39) }).ok).toBe(true);
    const forty = [question, ...make(39)];
    expect(validateChatRequest({ messages: forty }).ok).toBe(true);
    expect(validateChatRequest({ messages: [question, ...forty] }).ok).toBe(false);
  });

  it('역할이 이상하거나 빈 사용자 메시지면 오류', () => {
    expect(validateChatRequest({ messages: [{ role: 'system', content: 'x' }] }).ok).toBe(false);
    expect(validateChatRequest({ messages: [{ role: 'user', content: '   ' }] }).ok).toBe(false);
    expect(validateChatRequest({ messages: [{ role: 'user', content: 3 }] }).ok).toBe(false);
  });
});
