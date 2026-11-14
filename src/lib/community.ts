import type { SupabaseClient } from '@supabase/supabase-js';
import { currentUserId, ensureUserId } from '@/lib/supabase/browser';

export const CONTENT_MAX = 500;
export const PAGE_SIZE = 20;

export type Post = {
  id: string;
  userId: string;
  nickname: string;
  topic: string | null;
  content: string;
  bgm: { title: string; url: string } | null;
  createdAt: string;
};

type PostRow = {
  id: string;
  user_id: string;
  nickname: string;
  topic: string | null;
  content: string;
  bgm_title: string | null;
  bgm_url: string | null;
  created_at: string;
};

const COLUMNS = 'id, user_id, nickname, topic, content, bgm_title, bgm_url, created_at';

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    userId: row.user_id,
    nickname: row.nickname,
    topic: row.topic,
    content: row.content,
    bgm: row.bgm_title && row.bgm_url ? { title: row.bgm_title, url: row.bgm_url } : null,
    createdAt: row.created_at,
  };
}

/** 최신 글부터 PAGE_SIZE개. before를 주면 그보다 오래된 글 */
export async function listPosts(supabase: SupabaseClient, before?: string): Promise<Post[]> {
  let query = supabase.from('posts').select(COLUMNS).order('created_at', { ascending: false }).limit(PAGE_SIZE);
  if (before) query = query.lt('created_at', before);
  const { data, error } = await query;
  if (error) throw new Error('글을 불러오지 못했어요.');
  return (data as PostRow[]).map(toPost);
}

/** 내 계정(익명 또는 카카오)으로 쓴 글. 계정이 없으면 빈 목록 */
export async function listMyPosts(supabase: SupabaseClient): Promise<Post[]> {
  const userId = await currentUserId(supabase);
  if (!userId) return [];
  const { data, error } = await supabase.from('posts').select(COLUMNS).eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error('내가 쓴 글을 불러오지 못했어요.');
  return (data as PostRow[]).map(toPost);
}

export type NewPost = {
  nickname: string;
  topic: string | null;
  content: string;
  bgm: { title: string; url: string } | null;
};

export async function createPost(supabase: SupabaseClient, post: NewPost): Promise<Post> {
  await ensureUserId(supabase);
  const { data, error } = await supabase
    .from('posts')
    .insert({
      nickname: post.nickname,
      topic: post.topic,
      content: post.content,
      bgm_title: post.bgm?.title ?? null,
      bgm_url: post.bgm?.url ?? null,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error('글을 올리지 못했어요. 잠시 뒤에 다시 해 주세요.');
  return toPost(data as PostRow);
}

export async function deletePost(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error('글을 지우지 못했어요.');
}
