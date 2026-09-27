import lettersData from '@/data/letters.json';
import { INTRO_QUESTIONS, INTRO_TOPICS, MEET_LINES } from '@/data/intro';
import type { Letter } from '@/lib/letters';
import { classifyIntro, introLetterFor, withBirdName } from './intro';

const LETTERS = lettersData as Letter[];

describe('시작 화면 질문', () => {
  it('질문 6개: 오목이 사진·목록·창밖 날씨·메시지·배터리·고민 주제', () => {
    expect(INTRO_QUESTIONS.map((q) => q.kind)).toEqual(['pics', 'list', 'sky', 'chat', 'battery', 'topics']);
  });
});

describe('withBirdName (시작 화면 문구에 지은 이름 넣기)', () => {
  it('{name}은 이름 그대로, {name:이/가}처럼 쓰면 받침에 맞는 조사를 붙인다', () => {
    expect(withBirdName('안녕, 나는 {name:이야/야}.', '콩이')).toBe('안녕, 나는 콩이야.');
    expect(withBirdName('안녕, 나는 {name:이야/야}.', '별')).toBe('안녕, 나는 별이야.');
    expect(withBirdName('{name:이/가} 배터리를 들고 왔어', '별')).toBe('별이 배터리를 들고 왔어');
    expect(withBirdName('맑은 창이구나. {name}도 날개가 가벼워.', '콩이')).toBe('맑은 창이구나. 콩이도 날개가 가벼워.');
  });

  it('질문·인사 문구에 이름 자리 표시가 잘못 적혀 남는 곳이 없다', () => {
    const texts = [
      ...INTRO_QUESTIONS.flatMap((q) => [
        q.lead,
        q.title,
        ...('options' in q ? q.options.map((o) => ('reaction' in o ? o.reaction : o.example)) : []),
      ]),
      ...MEET_LINES.flatMap((line) => line.lines),
    ];
    for (const text of texts) expect(withBirdName(text, '별')).not.toMatch(/[{}]/);
  });
});

describe('classifyIntro (편지를 고르고 안전 안내를 정하는 데만 쓰는 내부 분류)', () => {
  const light = { q1: { w: 0 }, q2: { w: 0 }, q3: { w: 0 }, q4: { w: 0 }, q5: { w: 0, battery: 5 }, q6: { w: 0, topic: 'work' as const } };

  it('가벼운 답이면 1단계, 고른 고민 주제를 그대로 쓴다', () => {
    expect(classifyIntro(light)).toEqual({ score: 0, tier: 1, topic: 'work' });
  });

  it('앞의 다섯 질문 점수(0~15)가 5 이상이면 2단계, 10 이상이면 3단계', () => {
    expect(classifyIntro({ ...light, q1: { w: 3 }, q2: { w: 2 } }).tier).toBe(2);
    expect(classifyIntro({ ...light, q1: { w: 3 }, q2: { w: 3 }, q3: { w: 2 }, q4: { w: 2 } }).tier).toBe(3);
  });

  it('물어봐 줄 사람이 없고 배터리가 1칸이면 점수와 상관없이 3단계', () => {
    expect(classifyIntro({ ...light, q4: { w: 3, flag: 'alone' }, q5: { w: 3, battery: 1 } }).tier).toBe(3);
  });

  it('배터리 1칸에 창밖이 비면 3단계', () => {
    expect(classifyIntro({ ...light, q3: { w: 3 }, q5: { w: 3, battery: 1 } }).tier).toBe(3);
  });

  it('고민 주제를 고르지 않았으면 무기력·번아웃으로 본다', () => {
    const withoutTopic: Partial<typeof light> = { ...light };
    delete withoutTopic.q6;
    expect(classifyIntro(withoutTopic).topic).toBe('burnout');
  });
});

describe('introLetterFor (주제에 맞는 실제 온기레터)', () => {
  it.each(INTRO_TOPICS.map((t) => [t.id, t] as const))('%s: 고른 편지가 아카이브에 있고, 제목(고민)과 답장 구절이 있다', (_id, topic) => {
    const letter = introLetterFor(topic.id, LETTERS);
    expect(letter.id).toBe(topic.letterId);
    expect(letter.category).toBe(topic.category);
    expect(letter.preview.length).toBeGreaterThan(0);
  });

  it('고른 편지가 아카이브에서 빠졌으면 같은 분류의 가장 최근 편지로 대신한다', () => {
    const lonely = INTRO_TOPICS.find((t) => t.id === 'lonely')!;
    const without = LETTERS.filter((l) => l.id !== lonely.letterId);
    const letter = introLetterFor('lonely', without);
    const latest = without.filter((l) => l.category === 'loneliness' && l.preview).sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
    expect(letter.id).toBe(latest.id);
  });
});
