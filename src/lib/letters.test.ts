import { checkArchive, cleanText, extractEmoji, filterLetters, mergeLetters, toLetter, type Letter, type RawEmail } from './letters';

function raw(id: number, subject: string, sentTime: string, previewText = ''): RawEmail {
  return { id, pid: id % 1000, subject, previewText, permanentLink: `https://stib.ee/${id}`, sentTime };
}

describe('cleanText (스티비 병합 태그 정리)', () => {
  it.each([
    ['$%name%$ 온기님, 안녕', '온기님, 안녕'],
    ['오늘 하루도 한 발자국 나아간 온기 온기님께💌', '오늘 하루도 한 발자국 나아간 온기님께💌'],
    ["💛 님은 언제 '온기'를 느끼시나요?", "💛 온기님은 언제 '온기'를 느끼시나요?"],
    ['님, 소중한 사람과의 이별을 경험해본 적 있으신가요?', '온기님, 소중한 사람과의 이별을 경험해본 적 있으신가요?'],
    ['$%name%$님, 오늘도 고운 하루 보내고 계신가요?', '온기님, 오늘도 고운 하루 보내고 계신가요?'],
    ['  두   칸  ', '두 칸'],
    [' ', ''],
    ['선생님께 드리는 편지', '선생님께 드리는 편지'],
  ])('%j → %j', (input, expected) => {
    expect(cleanText(input)).toBe(expected);
  });
});

describe('extractEmoji', () => {
  it.each([
    ['해야 할 일을 자꾸만 미루게 돼요 📝', '📝'],
    ['☀️ 좋아', '☀️'],
    ['👩🏻‍💻 취업을 했지만, 이 길이 맞는지 모르겠어요.', '👩🏻‍💻'],
    ['🌟 꿈과 💡 열정', '💡'],
    ['이모지 없는 제목', null],
  ])('%j → %j', (title, expected) => {
    expect(extractEmoji(title)).toBe(expected);
  });
});

describe('toLetter', () => {
  it('제목·미리보기를 정리하고 아직 분류하지 않은 상태로 만든다', () => {
    expect(toLetter(raw(1, ' 온기님의 행복은?☘️', '2026-02-27T20:00:00+09:00', '$%name%$ 온기님, 안녕'))).toEqual({
      id: 1,
      pid: 1,
      title: '온기님의 행복은?☘️',
      preview: '온기님, 안녕',
      link: 'https://stib.ee/1',
      sentAt: '2026-02-27T20:00:00+09:00',
      category: 'uncategorized',
    });
  });
});

describe('mergeLetters', () => {
  const existing: Letter[] = [
    { ...toLetter(raw(1, '옛 제목', '2026-01-01T20:00:00+09:00')), category: 'love', image: '/letters/1.webp' },
    { ...toLetter(raw(2, '사라진 레터', '2025-12-01T20:00:00+09:00')), category: 'daily' },
  ];

  it('기존 분류·그림은 지키고 제목은 최신으로, 새 레터는 미분류로 추가, 원본에서 빠진 레터는 뺀다', () => {
    const { letters, added, removed } = mergeLetters(existing, [
      raw(1, '새 제목', '2026-01-01T20:00:00+09:00'),
      raw(3, '새 레터', '2026-02-01T20:00:00+09:00'),
    ]);
    expect(letters.map((l) => l.id)).toEqual([3, 1]);
    expect(letters[1]).toMatchObject({ title: '새 제목', category: 'love', image: '/letters/1.webp' });
    expect(added.map((l) => l.id)).toEqual([3]);
    expect(added[0].category).toBe('uncategorized');
    expect(removed.map((l) => l.id)).toEqual([2]);
  });
});

describe('filterLetters', () => {
  const letters: Letter[] = [
    { ...toLetter(raw(1, 'a', '2026-01-01T20:00:00+09:00')), category: 'love' },
    { ...toLetter(raw(2, 'b', '2026-03-01T20:00:00+09:00')), category: 'family' },
    { ...toLetter(raw(3, 'c', '2026-02-01T20:00:00+09:00')), category: 'love' },
  ];

  it('전체는 최신순 전부, 카테고리는 그 카테고리만 최신순', () => {
    expect(filterLetters(letters, 'all').map((l) => l.id)).toEqual([2, 3, 1]);
    expect(filterLetters(letters, 'love').map((l) => l.id)).toEqual([3, 1]);
  });
});

describe('src/data/letters.json (실제 데이터 점검)', async () => {
  const { default: data } = await import('@/data/letters.json');
  const { CATEGORIES } = await import('@/data/categories');
  const letters = data as Letter[];

  it('164편 이상이고 id가 고유하다', () => {
    expect(letters.length).toBeGreaterThanOrEqual(164);
    expect(new Set(letters.map((l) => l.id)).size).toBe(letters.length);
  });

  it('모든 레터가 분류돼 있고, 카테고리마다 5편 이상 있다', () => {
    expect(letters.filter((l) => l.category === 'uncategorized')).toEqual([]);
    for (const c of CATEGORIES) {
      expect(letters.filter((l) => l.category === c.id).length, c.label).toBeGreaterThanOrEqual(5);
    }
  });

  it('제목에 병합 태그 흔적이 남아 있지 않다', () => {
    for (const l of letters) {
      expect(l.title).not.toContain('$%name%$');
      expect(l.title).not.toMatch(/온기\s+온기님/);
    }
  });
});

describe('checkArchive (동기화 전에 받은 목록 검사)', () => {
  const emails = [raw(1, '첫 편지', '2026-01-01T20:00:00+09:00'), raw(2, '둘째 편지', '2026-01-08T20:00:00+09:00')];

  it('레터 목록이면 통과시킨다', () => {
    expect(checkArchive(emails, 2)).toEqual({ ok: true, emails });
  });

  it('배열이 아니거나 비어 있으면 거부한다 (기존 목록을 지우지 않게)', () => {
    expect(checkArchive({ data: emails }, 0).ok).toBe(false);
    expect(checkArchive([], 0).ok).toBe(false);
  });

  it('필요한 값이 빠진 항목이 있으면 거부한다', () => {
    expect(checkArchive([...emails, { id: 3, subject: '제목만' }], 0).ok).toBe(false);
  });

  it('기존보다 10% 넘게 줄었으면 거부한다', () => {
    expect(checkArchive(emails, 3).ok).toBe(false);
  });
});
