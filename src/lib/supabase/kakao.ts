import { isAuthImplicitGrantRedirectError, type SupabaseClient, type User } from '@supabase/supabase-js';

/**
 * 카카오 로그인 (Supabase Auth의 kakao 제공자). 설정 순서는 docs/kakao-login.md
 * 글쓰기용 익명 계정과는 따로인 카카오 계정으로 로그인한다: 이메일을 주지 않아도 되는 대신,
 * 로그인 전에 이 기기에서 익명으로 쓴 글은 카카오 계정으로 옮겨지지 않는다.
 * (익명 계정에 이어 붙이는 방식은 Supabase가 인증된 이메일을 요구해서 쓰지 않는다)
 */

/** 마이페이지에 보여 줄 계정. anonymous: 글을 쓰며 생긴 익명 계정이 있다 */
export type Account = { kind: 'guest'; anonymous: boolean } | { kind: 'kakao'; nickname: string | null };

export function accountOf(user: User | null | undefined): Account {
  const kakao = user?.identities?.find((identity) => identity.provider === 'kakao');
  if (!user || user.is_anonymous || !kakao) return { kind: 'guest', anonymous: Boolean(user?.is_anonymous) };
  const data = { ...user.user_metadata, ...kakao.identity_data };
  const nickname = [data.name, data.full_name, data.preferred_username].find((v): v is string => typeof v === 'string' && v.trim() !== '');
  return { kind: 'kakao', nickname: nickname?.trim() ?? null };
}

/** 카카오 로그인 화면으로 보낸다. 실패하면 오류를 던진다 */
export async function startKakaoLogin(supabase: SupabaseClient, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo } });
  if (error) throw error;
}

export type KakaoReturn = 'none' | 'canceled' | 'failed';

let pending: Promise<KakaoReturn> | null = null;
let taken = false;

/**
 * 카카오에서 돌아온 결과. 성공하면 Supabase가 주소(#access_token=…)를 보고 세션을 저장하므로 알릴 것이 없다.
 * 페이지를 한 번 열 때 한 번만 알린다 (개발 모드의 effect 두 번 실행, 다른 화면에 갔다 돌아올 때는 'none')
 */
export async function finishKakaoLogin(supabase: SupabaseClient): Promise<KakaoReturn> {
  pending ??= handleReturn(supabase);
  const result = await pending;
  if (taken) return 'none';
  taken = true;
  return result;
}

async function handleReturn(supabase: SupabaseClient): Promise<KakaoReturn> {
  const { error } = await supabase.auth.initialize();
  if (!error || !isAuthImplicitGrantRedirectError(error)) return 'none';
  // 오류는 주소에 남아 있어서 지운다 (새로 고침해도 다시 알리지 않게)
  window.history.replaceState(window.history.state, '', window.location.pathname);
  if (error.details?.error === 'access_denied') return 'canceled';
  console.error('[kakao] 로그인 실패', error);
  return 'failed';
}

/** 이 기기에서만 로그아웃 (다른 기기의 로그인은 그대로) */
export async function signOutHere(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}
