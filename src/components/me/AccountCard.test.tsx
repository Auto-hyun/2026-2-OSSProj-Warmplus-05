import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountCard } from './AccountCard';

const supabase = vi.hoisted(() => ({ current: null as unknown }));
vi.mock('@/lib/supabase/useSupabase', () => ({ useSupabase: () => supabase.current }));

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
    fakeSession({ id: 'u1', is_anonymous: false, identities: [{ provider: 'kakao', identity_data: { name: '포근한 하루' } }] });
    render(<AccountCard />);

    expect(await screen.findByText('포근한 하루')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '카카오 로그인' })).not.toBeInTheDocument();
  });

  it('Supabase가 연결되지 않았으면 아무것도 그리지 않는다', () => {
    supabase.current = null;
    const { container } = render(<AccountCard />);
    expect(container).toBeEmptyDOMElement();
  });
});
