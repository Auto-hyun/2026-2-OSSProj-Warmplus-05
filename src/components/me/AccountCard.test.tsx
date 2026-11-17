import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deleteMyRecords, forgetSyncedRecords, saveBeforeSignOut } from '@/lib/recordSync';
import { AccountCard } from './AccountCard';

const supabase = vi.hoisted(() => ({ current: null as unknown }));
vi.mock('@/lib/supabase/useSupabase', () => ({ useSupabase: () => supabase.current }));
vi.mock('@/lib/recordSync', () => ({ deleteMyRecords: vi.fn(async () => {}), forgetSyncedRecords: vi.fn(), saveBeforeSignOut: vi.fn(async () => true) }));

const KAKAO_USER = { id: 'u1', is_anonymous: false, identities: [{ provider: 'kakao', identity_data: { name: '포근한 하루' } }] };

const NOT_MOVED = '로그인 전에 이 기기에서 쓴 글은 카카오 계정으로 옮겨지지 않아요.';

function fakeSession(user: object | null) {
  const auth = {
    initialize: vi.fn(async () => ({ error: null })),
    getSession: vi.fn(async () => ({ data: { session: user ? { user } : null }, error: null })),
    signInWithOAuth: vi.fn(async () => ({ data: {}, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
  };
  supabase.current = { auth };
  return auth;
}

describe('AccountCard', () => {
  it('익명으로 글을 쓴 적이 있으면 글이 옮겨지지 않는다고 알리고, 누르면 카카오로 로그인한다', async () => {
    const auth = fakeSession({ id: 'u1', is_anonymous: true, identities: [] });
    render(<AccountCard />);

    await userEvent.click(await screen.findByRole('button', { name: '카카오 로그인' }));
    expect(screen.getByText(NOT_MOVED)).toBeInTheDocument();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'kakao', options: { redirectTo: `${window.location.origin}/me` } });
  });

  it('계정이 없으면 옮길 글 안내 없이 로그인 버튼만', async () => {
    fakeSession(null);
    render(<AccountCard />);

    expect(await screen.findByRole('button', { name: '카카오 로그인' })).toBeInTheDocument();
    expect(screen.queryByText(NOT_MOVED)).not.toBeInTheDocument();
  });

  it('카카오로 로그인했으면 닉네임과 로그아웃 버튼을 보여 준다', async () => {
    fakeSession(KAKAO_USER);
    render(<AccountCard />);

    expect(await screen.findByText('포근한 하루')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '카카오 로그인' })).not.toBeInTheDocument();
  });

  it('로그인 전: 로그인하면 기록이 계정에 저장된다고 알리고, 처리방침을 볼 수 있다', async () => {
    fakeSession(null);
    render(<AccountCard />);

    expect(await screen.findByText(/마음 기록·테스트 결과·저장한 노래가 계정에 저장/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '개인정보 처리방침' })).toHaveAttribute('href', '/privacy');
  });

  it('카카오 회원: 내 기록 지우기를 확인하면 계정과 이 기기의 기록을 지운다', async () => {
    fakeSession(KAKAO_USER);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AccountCard />);

    await userEvent.click(await screen.findByRole('button', { name: '내 기록 지우기' }));
    await waitFor(() => expect(deleteMyRecords).toHaveBeenCalledWith(supabase.current, expect.anything(), 'u1', expect.anything()));
    expect(screen.getByRole('link', { name: '개인정보 처리방침' })).toHaveAttribute('href', '/privacy');
    confirm.mockRestore();
  });

  it('카카오 회원: 확인하지 않으면 기록을 지우지 않는다', async () => {
    fakeSession(KAKAO_USER);
    vi.mocked(deleteMyRecords).mockClear();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<AccountCard />);

    await userEvent.click(await screen.findByRole('button', { name: '내 기록 지우기' }));
    expect(deleteMyRecords).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it('카카오 회원: 로그아웃하면 이 기기의 계정 기록을 지운다', async () => {
    const auth = fakeSession(KAKAO_USER);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    // 로그아웃 뒤 새로고침 (jsdom은 새로고침을 못 해서 가짜로)
    const location = window.location;
    vi.stubGlobal('location', { ...location, origin: location.origin, reload: vi.fn() });
    render(<AccountCard />);

    await userEvent.click(await screen.findByRole('button', { name: '로그아웃' }));
    await waitFor(() => expect(forgetSyncedRecords).toHaveBeenCalledWith(expect.anything(), expect.anything(), { force: true }));
    expect(saveBeforeSignOut).toHaveBeenCalled();
    expect(auth.signOut).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();
    vi.unstubAllGlobals();
    confirm.mockRestore();
  });

  it('카카오 회원: 계정에 못 올린 기록이 있으면 경고하고, 그만두면 로그아웃하지 않는다', async () => {
    const auth = fakeSession(KAKAO_USER);
    vi.mocked(saveBeforeSignOut).mockResolvedValueOnce(false);
    vi.mocked(forgetSyncedRecords).mockClear();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(true).mockReturnValueOnce(false);
    render(<AccountCard />);

    await userEvent.click(await screen.findByRole('button', { name: '로그아웃' }));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(2));
    expect(confirm.mock.calls[1][0]).toMatch('아직 계정에 올리지 못한 기록');
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(forgetSyncedRecords).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it('Supabase가 연결되지 않았으면 아무것도 그리지 않는다', () => {
    supabase.current = null;
    const { container } = render(<AccountCard />);
    expect(container).toBeEmptyDOMElement();
  });
});
