import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

/** 브라우저용 Supabase. 환경 변수가 없으면(또는 서버 렌더 중이면) null */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}

/** 지금 이 기기의 익명 계정 id. 아직 없으면 null */
export async function currentUserId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * 글을 쓰려면 계정이 필요해서, 처음 쓸 때 로그인 없이 익명 계정을 만든다 (Supabase anonymous sign-in).
 * 계정은 이 브라우저에 저장된다: 브라우저 기록을 지우면 내가 쓴 글을 지울 수 없게 된다.
 */
export async function ensureUserId(supabase: SupabaseClient): Promise<string> {
  const existing = await currentUserId(supabase);
  if (existing) return existing;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) throw new Error('익명 계정을 만들지 못했어요.');
  return data.user.id;
}
