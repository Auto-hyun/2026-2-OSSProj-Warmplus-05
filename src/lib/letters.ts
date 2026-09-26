// 동기화 스크립트(tsx)에서도 쓰므로 '@/' 별칭 없이 상대 경로만 import 한다
import type { CategoryId } from '../data/categories';

/** 스티비 아카이브 JSON의 레터 한 편 */
export type RawEmail = {
  id: number;
  pid: number;
  subject: string;
  previewText: string;
  permanentLink: string;
  sentTime: string;
};

export type Letter = {
  id: number;
  pid: number;
  title: string;
  preview: string;
  /** stib.ee 영구 링크 (앱 안 iframe·새 탭 공용) */
  link: string;
  sentAt: string;
  category: CategoryId | 'uncategorized';
  /** '/letters/{id}.webp' — 없으면 기본 카드 */
  image?: string;
};

/**
 * 스티비 병합 태그($%name%$ = 구독자 별칭)가 빠지면서 생긴 어색한 문장을 정리한다.
 * "온기 온기님" → "온기님", 문장 첫머리·띄어쓰기 뒤에 홀로 남은 "님" → "온기님"
 */
export function cleanText(s: string): string {
  return s
    .replaceAll('$%name%$', ' ')
    .replace(/온기\s+온기님/g, '온기님')
    .replace(/(^|\s)님(?=\S)/g, '$1온기님')
    .replace(/\s+/g, ' ')
    .trim();
}

// 그림 이모지 + (변형 선택자 | 피부색 | ZWJ로 이어진 이모지)
const EMOJI = /\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}]|\u200D\p{Extended_Pictographic})*/gu;

/** 제목 속 마지막 그림 이모지 (기본 카드에 크게 보여줄 용도) */
export function extractEmoji(title: string): string | null {
  const matches = title.match(EMOJI);
  return matches ? matches[matches.length - 1] : null;
}

export function toLetter(raw: RawEmail): Letter {
  return {
    id: raw.id,
    pid: raw.pid,
    title: cleanText(raw.subject),
    preview: cleanText(raw.previewText),
    link: raw.permanentLink,
    sentAt: raw.sentTime,
    category: 'uncategorized',
  };
}

const bySentDesc = (a: Letter, b: Letter) => Date.parse(b.sentAt) - Date.parse(a.sentAt);

/**
 * 스티비에서 새로 받은 목록과 기존 JSON을 합친다.
 * - 기존 레터: 분류·그림은 유지, 제목·미리보기·링크·발행일은 최신으로
 * - 새 레터: 미분류로 추가 → added
 * - 원본 아카이브에서 빠진 레터: 우리도 뺀다(공개 동의가 철회됐을 수 있음) → removed
 */
export function mergeLetters(
  existing: Letter[],
  fetched: RawEmail[],
): { letters: Letter[]; added: Letter[]; removed: Letter[] } {
  const known = new Map(existing.map((l) => [l.id, l]));
  const fetchedIds = new Set(fetched.map((r) => r.id));
  const added: Letter[] = [];
  const letters = fetched.map((raw) => {
    const fresh = toLetter(raw);
    const prev = known.get(raw.id);
    if (!prev) {
      added.push(fresh);
      return fresh;
    }
    return { ...fresh, category: prev.category, ...(prev.image ? { image: prev.image } : {}) };
  });
  const removed = existing.filter((l) => !fetchedIds.has(l.id));
  return { letters: letters.sort(bySentDesc), added, removed };
}

/** 원본에서 레터가 이보다 많이 줄었으면 스티비 쪽 문제일 수 있어 멈춘다 */
const MIN_KEEP_RATIO = 0.9;

function isRawEmail(v: unknown): v is RawEmail {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === 'number' &&
    typeof e.pid === 'number' &&
    typeof e.subject === 'string' &&
    typeof e.previewText === 'string' &&
    typeof e.permanentLink === 'string' &&
    typeof e.sentTime === 'string'
  );
}

/**
 * 스티비에서 받은 목록을 저장하기 전에 확인한다. 응답 형식이 바뀌었거나 비어 있으면
 * 그대로 합쳤을 때 기존 레터(분류·그림 포함)가 모두 지워지므로 거부한다.
 */
export function checkArchive(
  data: unknown,
  existingCount: number,
): { ok: true; emails: RawEmail[] } | { ok: false; reason: string } {
  if (!Array.isArray(data) || data.length === 0) return { ok: false, reason: '레터 목록이 비어 있거나 형식이 달라요.' };
  if (!data.every(isRawEmail)) return { ok: false, reason: '레터 항목의 형식이 예전과 달라요.' };
  if (data.length < existingCount * MIN_KEEP_RATIO) {
    return { ok: false, reason: `레터가 ${existingCount}편에서 ${data.length}편으로 너무 많이 줄었어요.` };
  }
  return { ok: true, emails: data };
}

/** 'all'이면 전체, 아니면 그 카테고리만. 최신순 */
export function filterLetters(letters: Letter[], category: CategoryId | 'all'): Letter[] {
  const picked = category === 'all' ? [...letters] : letters.filter((l) => l.category === category);
  return picked.sort(bySentDesc);
}
