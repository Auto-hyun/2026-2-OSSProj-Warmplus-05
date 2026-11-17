import { render, waitFor } from '@testing-library/react';
import { track } from '@/lib/events';
import { forgetSyncedRecords, startRecordSync } from '@/lib/recordSync';
import { getSupabase } from '@/lib/supabase/browser';
import { RecordSync } from './RecordSync';

vi.mock('@/lib/supabase/browser', () => ({ getSupabase: vi.fn() }));
vi.mock('@/lib/events', () => ({ track: vi.fn() }));
vi.mock('@/lib/recordSync', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/recordSync')>()),
  startRecordSync: vi.fn(),
  forgetSyncedRecords: vi.fn(),
}));

type AuthCallback = (event: string, session: { user: { id: string; is_anonymous: boolean } } | null) => void;

/** 로그인 상태 알림을 테스트에서 직접 보낼 수 있는 가짜 Supabase */
function fakeAuth() {
  let callback: AuthCallback = () => {};
  const unsubscribe = vi.fn();
  vi.mocked(getSupabase).mockReturnValue({
    auth: {
      onAuthStateChange: (cb: AuthCallback) => {
        callback = cb;
        return { data: { subscription: { unsubscribe } } };
      },
    },
  } as never);
  return { emit: (event: string, session: Parameters<AuthCallback>[1]) => callback(event, session), unsubscribe };
}

const sync = (firstHere: boolean) => ({ firstHere, idle: vi.fn(), stop: vi.fn(), deleteAll: vi.fn() });

describe('계정 기록 맞추기 (화면에 늘 붙어 있는 컴포넌트)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('카카오 회원이면 맞추기를 시작하고, 이 기기에서 처음이면 로그인 기록을 남긴다', async () => {
    vi.mocked(startRecordSync).mockResolvedValue(sync(true));
    const auth = fakeAuth();
    render(<RecordSync />);

    auth.emit('INITIAL_SESSION', { user: { id: 'u1', is_anonymous: false } });
    await waitFor(() => expect(startRecordSync).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'u1', expect.anything(), expect.any(Function)));
    await waitFor(() => expect(track).toHaveBeenCalledWith('login', { provider: 'kakao' }));
  });

  it('받아 오는 사이 로그아웃되면 시작하던 맞추기를 무효로 한다 (늦게 온 결과를 쓰지 않는다)', async () => {
    let finish: (value: ReturnType<typeof sync>) => void = () => {};
    vi.mocked(startRecordSync).mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const auth = fakeAuth();
    render(<RecordSync />);

    auth.emit('INITIAL_SESSION', { user: { id: 'u1', is_anonymous: false } });
    await waitFor(() => expect(startRecordSync).toHaveBeenCalled());
    const isCurrent = vi.mocked(startRecordSync).mock.calls[0][4]!;
    expect(isCurrent()).toBe(true);

    auth.emit('SIGNED_OUT', null);
    await waitFor(() => expect(isCurrent()).toBe(false));
    const late = sync(true);
    finish(late);
    await waitFor(() => expect(late.stop).toHaveBeenCalled());
    expect(track).not.toHaveBeenCalled();
  });

  it('익명 계정(글쓰기용)이면 맞추지 않는다', async () => {
    const auth = fakeAuth();
    render(<RecordSync />);

    auth.emit('SIGNED_IN', { user: { id: 'anon', is_anonymous: true } });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(startRecordSync).not.toHaveBeenCalled();
  });

  it('로그아웃 알림이 오면 이 기기의 계정 기록을 지운다', async () => {
    const auth = fakeAuth();
    render(<RecordSync />);

    auth.emit('SIGNED_OUT', null);
    await waitFor(() => expect(forgetSyncedRecords).toHaveBeenCalled());
  });

  it('화면에서 빠지면 로그인 알림 구독을 끊고 맞추기를 멈춘다', async () => {
    const running = sync(false);
    vi.mocked(startRecordSync).mockResolvedValue(running);
    const auth = fakeAuth();
    const { unmount } = render(<RecordSync />);

    auth.emit('INITIAL_SESSION', { user: { id: 'u1', is_anonymous: false } });
    await waitFor(() => expect(startRecordSync).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    unmount();
    expect(auth.unsubscribe).toHaveBeenCalled();
    expect(running.stop).toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});
