import type { SupabaseClient } from '@supabase/supabase-js';
import { currentUserId, ensureUserId } from '@/lib/supabase/browser';

/**
 * 자유게시판: 제목·내용 글 (Supabase free_posts). 누구나 읽고, 로그인 없이 익명 계정으로도 쓴다.
 * 권한은 Supabase RLS가 지킨다: 내 계정으로만 쓰고, 내 글만 지운다
 */
export const FREE_TITLE_MAX = 40;
export const FREE_CONTENT_MAX = 1000;
export const FREE_PAGE_SIZE = 20;

export type FreeBgm = { title: string; url: string };

export type FreePost = {
  id: string;
  userId: string;
  nickname: string;
  title: string;
  content: string;
  /** 같이 들을 노래 (노래 만들기에서 넘어오면 붙는다) */
  bgm: FreeBgm | null;
  createdAt: string;
};

export type NewFreePost = { nickname: string; title: string; content: string; bgm?: FreeBgm | null };

type FreePostRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  content: string;
  bgm_title: string | null;
  bgm_url: string | null;
  created_at: string;
};

const COLUMNS = 'id, user_id, nickname, title, content, bgm_title, bgm_url, created_at';

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

function toFreePost(row: FreePostRow): FreePost {
  return {
    id: row.id,
    userId: row.user_id,
    nickname: row.nickname,
    title: row.title,
    content: row.content,
    bgm: row.bgm_title && row.bgm_url ? { title: row.bgm_title, url: row.bgm_url } : null,
    createdAt: row.created_at,
  };
}

/** 최신 글부터 FREE_PAGE_SIZE개. before를 주면 그보다 오래된 글 */
export async function listFreePosts(supabase: SupabaseClient, before?: string): Promise<FreePost[]> {
  let query = supabase.from('free_posts').select(COLUMNS).order('created_at', { ascending: false }).limit(FREE_PAGE_SIZE);
  if (before) query = query.lt('created_at', before);
  const { data, error } = await query;
  if (error) throw new Error('글을 불러오지 못했어요.');
  return (data as FreePostRow[]).map(toFreePost);
}

/** 내 계정(익명 또는 카카오)으로 쓴 글. 계정이 없으면 빈 목록 */
export async function listMyFreePosts(supabase: SupabaseClient): Promise<FreePost[]> {
  const userId = await currentUserId(supabase);
  if (!userId) return [];
  const { data, error } = await supabase.from('free_posts').select(COLUMNS).eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error('내가 쓴 글을 불러오지 못했어요.');
  return (data as FreePostRow[]).map(toFreePost);
}

/** 글 올리기. 올릴 수 없는 글이면 서버에 보내기 전에 이유를 담아 throw */
export async function createFreePost(supabase: SupabaseClient, post: NewFreePost): Promise<FreePost> {
  const problem = validateFreePost(post);
  if (problem) throw new Error(problem);
  await ensureUserId(supabase);
  const { data, error } = await supabase
    .from('free_posts')
    .insert({
      nickname: post.nickname.trim(),
      title: post.title.trim(),
      content: post.content.trim(),
      bgm_title: post.bgm?.title ?? null,
      bgm_url: post.bgm?.url ?? null,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error('글을 올리지 못했어요. 잠시 뒤에 다시 해 주세요.');
  return toFreePost(data as FreePostRow);
}

export async function deleteFreePost(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('free_posts').delete().eq('id', id);
  if (error) throw new Error('글을 지우지 못했어요.');
}
