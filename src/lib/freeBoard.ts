'use client';

import { useSyncExternalStore } from 'react';

/**
 * 자유게시판 (샘플): 서버 없이 이 기기(localStorage)에만 저장한다.
 * 다른 사람 글은 아래 SAMPLE_POSTS로 흉내 낸다. 나중에 Supabase 게시판으로 바꿀 자리
 */

export const FREE_TITLE_MAX = 40;
export const FREE_CONTENT_MAX = 1000;
export const FREE_BOARD_KEY = 'omok:free-board:v1';

export type FreePost = {
  id: string;
  nickname: string;
  title: string;
  content: string;
  createdAt: string;
  /** 같이 들을 내 노래 (노래 만들기에서 넘어오면 붙는다) */
  bgm: FreeBgm | null;
  /** 내가 이 기기에서 쓴 글 (지울 수 있다) */
  mine: boolean;
};

export type FreeBgm = { title: string; url: string };

export type NewFreePost = { nickname: string; title: string; content: string; bgm?: FreeBgm | null };

function isBgm(v: unknown): v is FreeBgm {
  return typeof v === 'object' && v !== null && typeof (v as FreeBgm).title === 'string' && typeof (v as FreeBgm).url === 'string';
}

/** 처음부터 보이는 샘플 글. 시간은 지금 기준 몇 분 전 */
const SAMPLE_POSTS: { minutesAgo: number; nickname: string; title: string; content: string }[] = [
  { minutesAgo: 25, nickname: '포근한 하루', title: '오늘 날씨 너무 좋지 않아요?', content: '점심 먹고 잠깐 산책했는데 햇살이 정말 따뜻했어요.\n다들 잠깐이라도 바깥 공기 마셔 보세요 🌿' },
  { minutesAgo: 180, nickname: '하늘좋아', title: '잠 안 올 때 듣는 노래 추천해 주세요', content: '요즘 자꾸 늦게 잠들어서요. 잔잔한 노래 있으면 알려 주세요!' },
  { minutesAgo: 60 * 26, nickname: '말랑구름', title: '시험 끝났어요', content: '한 달 동안 준비한 시험이 드디어 끝났어요. 결과는 모르겠지만 오늘은 그냥 푹 쉬려고요.' },
];

const length = (s: string) => Array.from(s.trim()).length;

/** 올릴 수 있는 글인지. 문제가 있으면 이유를, 괜찮으면 null */
export function validateFreePost(post: NewFreePost): string | null {
  if (length(post.nickname) < 1) return '이름을 적어 주세요.';
  if (length(post.title) < 1) return '제목을 적어 주세요.';
  if (length(post.title) > FREE_TITLE_MAX) return `제목은 ${FREE_TITLE_MAX}자까지예요.`;
  if (length(post.content) < 1) return '내용을 적어 주세요.';
  if (length(post.content) > FREE_CONTENT_MAX) return `내용은 ${FREE_CONTENT_MAX}자까지예요.`;
  return null;
}

/** 저장된 문자열을 내 글 목록으로. 깨졌거나 모양이 다르면 빈 목록 */
export function parseFreePosts(raw: string | null): FreePost[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (p): p is FreePost =>
          typeof p === 'object' &&
          p !== null &&
          typeof p.id === 'string' &&
          typeof p.nickname === 'string' &&
          typeof p.title === 'string' &&
          typeof p.content === 'string' &&
          typeof p.createdAt === 'string',
      )
      .map((p) => ({ ...p, bgm: isBgm(p.bgm) ? { title: p.bgm.title, url: p.bgm.url } : null, mine: true }));
  } catch {
    return [];
  }
}

/** 내 글과 샘플 글을 합쳐 최신 글부터 */
export function mergeWithSamples(mine: FreePost[], now: Date = new Date()): FreePost[] {
  const samples = SAMPLE_POSTS.map((s, i) => ({
    id: `sample-${i}`,
    nickname: s.nickname,
    title: s.title,
    content: s.content,
    createdAt: new Date(now.getTime() - s.minutesAgo * 60_000).toISOString(),
    bgm: null,
    mine: false,
  }));
  return [...mine, ...samples].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ── 브라우저 저장소 (useSyncExternalStore로 구독) ──

const listeners = new Set<() => void>();
let cache: { raw: string | null; posts: FreePost[] } | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(FREE_BOARD_KEY);
  } catch {
    return null;
  }
}

function snapshot(): FreePost[] {
  const raw = readRaw();
  if (!cache || cache.raw !== raw) cache = { raw, posts: mergeWithSamples(parseFreePosts(raw)) };
  return cache.posts;
}

function writeMine(posts: FreePost[]) {
  try {
    const stored = posts.map((p) => ({ id: p.id, nickname: p.nickname, title: p.title, content: p.content, createdAt: p.createdAt, bgm: p.bgm }));
    localStorage.setItem(FREE_BOARD_KEY, JSON.stringify(stored));
  } catch {
    throw new Error('이 브라우저에서는 글을 저장할 수 없어요.');
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === FREE_BOARD_KEY && listener();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** 자유게시판 글 목록 (최신 글부터). 서버 렌더·하이드레이션 전에는 undefined */
export function useFreePosts(): FreePost[] | undefined {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}

/** 새 글을 이 기기에 저장한다. 올릴 수 없으면 이유를 담아 throw */
export function addFreePost(post: NewFreePost): FreePost {
  const problem = validateFreePost(post);
  if (problem) throw new Error(problem);
  const created: FreePost = {
    id: crypto.randomUUID(),
    nickname: post.nickname.trim(),
    title: post.title.trim(),
    content: post.content.trim(),
    createdAt: new Date().toISOString(),
    bgm: post.bgm ?? null,
    mine: true,
  };
  writeMine([created, ...parseFreePosts(readRaw())]);
  return created;
}

/** 내가 쓴 글을 지운다 */
export function removeFreePost(id: string) {
  writeMine(parseFreePosts(readRaw()).filter((p) => p.id !== id));
}
