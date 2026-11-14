import { AuthImplicitGrantRedirectError, type SupabaseClient, type User } from '@supabase/supabase-js';
import { accountOf, signOutHere, startKakaoLogin } from './kakao';

const REDIRECT = 'http://localhost:3000/me';

function user(fields: Partial<User>): User {
  return { id: 'u1', aud: 'authenticated', created_at: '', app_metadata: {}, user_metadata: {}, ...fields } as User;
}

const anonymous = user({ is_anonymous: true, identities: [] });
const kakaoUser = user({
  is_anonymous: false,
  identities: [{ id: 'k1', user_id: 'u1', provider: 'kakao', identity_id: 'i1', identity_data: { name: '포근한 하루' } }],
});

function fakeSupabase({ initError = null as Error | null } = {}) {
  const auth = {
    initialize: vi.fn(async () => ({ error: initError })),
    signInWithOAuth: vi.fn(async () => ({ data: {}, error: null as Error | null })),
    signOut: vi.fn(async () => ({ error: null as Error | null })),
  };
  return { client: { auth } as unknown as SupabaseClient, auth };
}

function urlError(error: string, code: string) {
  return new AuthImplicitGrantRedirectError('카카오에서 돌아온 주소에 오류', { error, code });
}

beforeEach(() => {
  window.history.replaceState(null, '', '/me');
});

describe('accountOf', () => {
  it('세션이 없으면 손님', () => {
    expect(accountOf(null)).toEqual({ kind: 'guest', anonymous: false });
  });

  it('글쓰기용 익명 계정도 손님 (로그인 전에 쓴 글이 옮겨지지 않는다고 알려야 해서 표시)', () => {
    expect(accountOf(anonymous)).toEqual({ kind: 'guest', anonymous: true });
  });

  it('카카오 계정이면 카카오 닉네임을 보여 준다', () => {
    expect(accountOf(kakaoUser)).toEqual({ kind: 'kakao', nickname: '포근한 하루' });
  });

  it('닉네임을 받지 못했으면 이름 없이 카카오 계정', () => {
    const noName = user({ identities: [{ ...kakaoUser.identities![0], identity_data: {} }] });
    expect(accountOf(noName)).toEqual({ kind: 'kakao', nickname: null });
  });
});

describe('startKakaoLogin', () => {
  it('익명 계정과 상관없이 카카오 계정으로 로그인한다 (이메일을 주지 않아도 된다)', async () => {
    const { client, auth } = fakeSupabase();
    await startKakaoLogin(client, REDIRECT);
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'kakao', options: { redirectTo: REDIRECT } });
  });

  it('Supabase가 거절하면 오류를 던진다 (예: 카카오 제공자가 꺼져 있음)', async () => {
    const { client, auth } = fakeSupabase();
    auth.signInWithOAuth.mockResolvedValueOnce({ data: {}, error: new Error('Unsupported provider') });
    await expect(startKakaoLogin(client, REDIRECT)).rejects.toThrow('Unsupported provider');
  });
});

describe('finishKakaoLogin', () => {
  /** 결과는 페이지를 한 번 열 때 한 번만 알리므로, 새 페이지를 연 것처럼 모듈을 새로 불러온다 */
  async function freshPage() {
    vi.resetModules();
    return (await import('./kakao')).finishKakaoLogin;
  }

  it('카카오에서 돌아온 게 아니거나 로그인에 성공했으면 알릴 것이 없다', async () => {
    const finish = await freshPage();
    expect(await finish(fakeSupabase().client)).toBe('none');
  });

  it('카카오 동의 화면에서 취소하면 canceled, 주소의 오류는 지운다', async () => {
    window.history.replaceState(null, '', '/me#error=access_denied&error_description=User+denied');
    const finish = await freshPage();
    expect(await finish(fakeSupabase({ initError: urlError('access_denied', 'unspecified_code') }).client)).toBe('canceled');
    expect(window.location.hash).toBe('');
  });

  it('그 밖의 오류는 failed', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    window.history.replaceState(null, '', '/me#error=server_error&error_code=unexpected_failure');
    const finish = await freshPage();
    expect(await finish(fakeSupabase({ initError: urlError('server_error', 'unexpected_failure') }).client)).toBe('failed');
    expect(window.location.hash).toBe('');
  });

  it('카카오 주소와 상관없는 초기화 오류는 무시한다', async () => {
    const finish = await freshPage();
    expect(await finish(fakeSupabase({ initError: new Error('network') }).client)).toBe('none');
  });

  it('같은 페이지에서 여러 번 불러도 한 번만 알린다 (개발 모드 effect 두 번, 다른 화면에 갔다 돌아올 때)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const finish = await freshPage();
    const { client } = fakeSupabase({ initError: urlError('server_error', 'unexpected_failure') });

    const results = await Promise.all([finish(client), finish(client)]);
    expect(results.sort()).toEqual(['failed', 'none']);
    expect(await finish(client)).toBe('none');
  });
});

describe('signOutHere', () => {
  it('이 기기에서만 로그아웃한다 (다른 기기 로그인은 유지)', async () => {
    const { client, auth } = fakeSupabase();
    await signOutHere(client);
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });
});
