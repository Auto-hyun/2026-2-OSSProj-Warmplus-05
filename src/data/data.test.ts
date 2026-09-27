import { QUESTIONS } from './questions';
import { MISSIONS, MISSION_THEME_LABEL, getMission, type MissionTheme } from './missions';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { STAGES, getStage } from './stages';
import { CATEGORIES, getCategory, isCategoryId } from './categories';
import { HELPLINES } from './helplines';
import { LINKS } from './links';

describe('오늘의 질문 목록', () => {
  it('60개 이상이고 중복이 없다', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(60);
    expect(new Set(QUESTIONS).size).toBe(QUESTIONS.length);
  });

  it('모두 물음표로 끝난다', () => {
    for (const q of QUESTIONS) expect(q.trim().endsWith('?')).toBe(true);
  });
});

describe('미션 목록', () => {
  it('40개 이상이고 id가 고유한 kebab-case다', () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(40);
    const ids = MISSIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('테마마다 6개 이상 있다', () => {
    const themes = Object.keys(MISSION_THEME_LABEL) as MissionTheme[];
    expect(themes).toHaveLength(5);
    for (const t of themes) {
      expect(MISSIONS.filter((m) => m.theme === t).length).toBeGreaterThanOrEqual(6);
    }
  });

  it('제목은 20자 이하이고 설명·이모지가 있다', () => {
    for (const m of MISSIONS) {
      expect(m.title.length).toBeLessThanOrEqual(20);
      expect(m.description.length).toBeGreaterThan(0);
      expect(m.emoji.length).toBeGreaterThan(0);
    }
  });

  it('getMission은 id로 찾고 없으면 undefined', () => {
    expect(getMission('walk-10')?.title).toBeTruthy();
    expect(getMission('없는-미션')).toBeUndefined();
  });
});

describe('성장 단계', () => {
  it('1~5단계, 필요 누적 미션은 0/3/7/15/30', () => {
    expect(STAGES.map((s) => s.no)).toEqual([1, 2, 3, 4, 5]);
    expect(STAGES.map((s) => s.minMissions)).toEqual([0, 3, 7, 15, 30]);
  });

  it('단계 이름은 새 진화 그림(2026-09-27)을 따른다', () => {
    expect(STAGES.map((s) => s.name)).toEqual(['알', '아기새', '편지 오목이', '우체부 오목이', '온기 오목이']);
    expect(getStage(3).description).toBe('용기를 내어 마음을 전하는 마음');
  });

  it('각 단계 그림은 새 경로에 실제로 있다 (경로가 바뀌어야 브라우저·이미지 캐시에 옛 그림이 남지 않는다)', () => {
    for (const s of STAGES) {
      expect(s.image).toBe(`/mascot/v2/stage-${s.no}.png`);
      expect(existsSync(join(process.cwd(), 'public', s.image))).toBe(true);
    }
  });
});

describe('온기레터 카테고리', () => {
  it('10개이고 id가 고유하다', () => {
    expect(CATEGORIES).toHaveLength(10);
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(10);
  });

  it('getCategory·isCategoryId', () => {
    expect(getCategory('love').label).toBe('연애·사랑');
    expect(isCategoryId('news')).toBe(true);
    expect(isCategoryId('uncategorized')).toBe(false);
    expect(isCategoryId(3)).toBe(false);
  });
});

describe('도움 번호와 링크', () => {
  it('첫 번째 도움 번호는 109 자살예방상담전화다', () => {
    expect(HELPLINES[0].number).toBe('109');
    expect(HELPLINES.map((h) => h.number)).toEqual(['109', '1577-0199', '1388', '119', '112']);
  });

  it('온기 외부 링크', () => {
    expect(LINKS.onlineLetter).toBe('https://ongibox.co.kr/onlineongibox');
    expect(LINKS.subscribe).toBe('https://page.stibee.com/subscriptions/195023');
    expect(LINKS.about).toBe('https://ongibox.co.kr/aboutongibox');
    expect(LINKS.archiveApi).toBe('https://page.stibee.com/archives/195023/emails');
  });
});
