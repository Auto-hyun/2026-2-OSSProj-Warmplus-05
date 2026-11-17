import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/browser';
import { createTracker, DEVICE_KEY, deviceIdFrom, track } from './events';

vi.mock('@/lib/supabase/browser', () => ({ getSupabase: vi.fn() }));

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function memoryStorage() {
  const items = new Map<string, string>();
  return { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value) };
}

describe('기기 id', () => {
  it('처음엔 만들어 저장하고, 다음부터 같은 id를 쓴다', () => {
    const storage = memoryStorage();
    const id = deviceIdFrom(storage);
    expect(id).toMatch(UUID);
    expect(storage.getItem(DEVICE_KEY)).toBe(id);
    expect(deviceIdFrom(storage)).toBe(id);
  });

  it('저장소를 못 쓰면 이번 방문 동안 같은 id를 쓴다', () => {
    const broken = {
      getItem: () => {
        throw new Error('막힘');
      },
      setItem: () => {
        throw new Error('막힘');
      },
    };
    const id = deviceIdFrom(broken);
    expect(id).toMatch(UUID);
    expect(deviceIdFrom(null)).toBe(id);
  });
});

describe('이용 기록 보내기', () => {
  it('기기 id, 기록 이름, 내용을 보낸다', () => {
    const sent: unknown[] = [];
    const send = createTracker(
      (row) => {
        sent.push(row);
        return Promise.resolve();
      },
      () => 'device-1',
    );
    send('test_complete', { testId: 'mind-sound', resultId: 'c' });
    send('page_view');
    expect(sent).toEqual([
      { device_id: 'device-1', name: 'test_complete', props: { testId: 'mind-sound', resultId: 'c' } },
      { device_id: 'device-1', name: 'page_view', props: {} },
    ]);
  });

  it('보내기에 실패해도 앱에 오류를 내지 않는다', async () => {
    const rejected = createTracker(() => Promise.reject(new Error('네트워크 끊김')), () => 'd');
    const thrown = createTracker(() => {
      throw new Error('클라이언트 없음');
    }, () => 'd');
    expect(() => rejected('chat_send')).not.toThrow();
    expect(() => thrown('chat_send')).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});

describe('track', () => {
  const insert = vi.fn(() => Promise.resolve({ error: null }));
  beforeEach(() => {
    insert.mockClear();
    vi.mocked(getSupabase).mockReturnValue({ from: () => ({ insert }) } as unknown as SupabaseClient);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('개발 서버에서는 남기지 않는다 (운영 KPI에 섞이지 않게)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    track('page_view', { path: '/' });
    expect(insert).not.toHaveBeenCalled();
  });

  it('배포본에서는 events 테이블에 남긴다', () => {
    vi.stubEnv('NODE_ENV', 'production');
    track('page_view', { path: '/' });
    expect(insert).toHaveBeenCalledWith({ device_id: expect.stringMatching(UUID), name: 'page_view', props: { path: '/' } });
  });
});
