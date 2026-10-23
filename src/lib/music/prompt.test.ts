import { BASE_STYLE, FAMILIES } from '@/data/music';
import { WORDS } from '@/data/words';
import { isSongSource, songRequestFor, wordsTitle } from './prompt';

describe('wordsTitle', () => {
  it.each([
    [['설렘'], '설렘의 노래'],
    [['설렘', '행복'], '설렘과 행복의 노래'],
    [['슬픔', '그리움'], '슬픔과 그리움의 노래'],
    [['스트레스', '불안'], '스트레스와 불안의 노래'],
    [['설렘', '행복', '감사'], '설렘, 행복, 감사의 노래'],
  ])('%j → %s', (labels, expected) => {
    expect(wordsTitle(labels)).toBe(expected);
  });
});

describe('songRequestFor: 감정 단어', () => {
  it('슬플 땐 슬픈 곡: 가라앉은 마음 갈래 스타일에 단어 느낌을 더한다', () => {
    const req = songRequestFor({ kind: 'words', words: ['sadness', 'longing'] })!;
    expect(req.family).toBe('sad');
    expect(req.title).toBe('슬픔과 그리움의 노래');
    expect(req.style.startsWith(BASE_STYLE)).toBe(true);
    expect(req.style).toContain(FAMILIES.sad.style);
    expect(req.style).toContain('nostalgic');
  });

  it('스트레스엔 풀리는 곡, 행복할 땐 행복한 곡', () => {
    expect(songRequestFor({ kind: 'words', words: ['stress'] })!.family).toBe('stress');
    expect(songRequestFor({ kind: 'words', words: ['happy'] })!.family).toBe('happy');
  });

  it('여러 갈래를 섞으면 가장 많은 갈래, 같으면 먼저 고른 단어의 갈래', () => {
    expect(songRequestFor({ kind: 'words', words: ['happy', 'sadness', 'gloom'] })!.family).toBe('sad');
    expect(songRequestFor({ kind: 'words', words: ['peace', 'stress'] })!.family).toBe('calm');
  });

  it('모르는 단어·빈 목록·너무 많은 단어·겹친 단어는 받지 않는다', () => {
    expect(songRequestFor({ kind: 'words', words: ['nope'] })).toBeNull();
    expect(songRequestFor({ kind: 'words', words: [] })).toBeNull();
    expect(songRequestFor({ kind: 'words', words: ['happy', 'love', 'proud', 'peace'] })).toBeNull();
    expect(songRequestFor({ kind: 'words', words: ['happy', 'happy'] })).toBeNull();
  });

  it('어떤 단어 조합이든 Suno 스타일 길이 제한(1000자) 안', () => {
    const longest = [...WORDS].sort((a, b) => b.style.length - a.style.length).slice(0, 3);
    expect(songRequestFor({ kind: 'words', words: longest.map((w) => w.id) })!.style.length).toBeLessThanOrEqual(1000);
  });
});

describe('songRequestFor: 심리테스트 유형', () => {
  it('유형의 음악으로 만든다', () => {
    const req = songRequestFor({ kind: 'test', testId: 'example', resultId: 'b' })!;
    expect(req.title).toBe('예시 유형 B의 노래');
    expect(req.family).toBe('sad');
    expect(req.style).toContain('rainy window');
  });

  it('모르는 테스트나 유형이면 null', () => {
    expect(songRequestFor({ kind: 'test', testId: 'none', resultId: 'a' })).toBeNull();
    expect(songRequestFor({ kind: 'test', testId: 'example', resultId: 'z' })).toBeNull();
  });
});

describe('isSongSource', () => {
  it.each([
    [{ kind: 'words', words: ['happy'] }, true],
    [{ kind: 'test', testId: 'example', resultId: 'a' }, true],
    [{ kind: 'words', words: [1] }, false],
    [{ kind: 'test', testId: 'example' }, false],
    [{ kind: 'free', prompt: 'anything' }, false],
    [null, false],
  ])('%j → %s', (value, expected) => {
    expect(isSongSource(value)).toBe(expected);
  });
});
