import { getSupabase } from '@/lib/supabase/browser';

/**
 * 이용 기록 (KPI: 유입·체류·전환). Supabase events 테이블에 남기기만 하고, 읽기는 팀이 대시보드에서 한다.
 * 사람 대신 기기마다 만든 무작위 id로 구분하고, 메모·대화 같은 글 내용은 담지 않는다. 기록 목록은 docs/data.md
 */
export type EventName = 'page_view' | 'test_complete' | 'mood_record' | 'song_create' | 'song_save' | 'post_create' | 'chat_send' | 'login';
export type EventProps = Record<string, string | number | boolean>;
type EventRow = { device_id: string; name: EventName; props: EventProps };

export const DEVICE_KEY = 'omok:device-id';

/** 저장소를 못 쓰는 브라우저에서 이번 방문 동안 쓸 id */
let visitId: string | undefined;

/** 이 기기의 무작위 id. 처음 부르면 만들어 저장한다 */
export function deviceIdFrom(storage: Pick<Storage, 'getItem' | 'setItem'> | null): string {
  try {
    if (storage) {
      const saved = storage.getItem(DEVICE_KEY);
      if (saved) return saved;
      const id = crypto.randomUUID();
      storage.setItem(DEVICE_KEY, id);
      return id;
    }
  } catch {
    // 사파리 개인 정보 보호 모드처럼 저장소가 막힌 브라우저
  }
  return (visitId ??= crypto.randomUUID());
}

/** 기록 보내는 함수. 보내기에 실패해도 앱은 그대로 둔다 (KPI용이라 조용히 넘어간다) */
export function createTracker(send: (row: EventRow) => PromiseLike<unknown>, deviceId: () => string) {
  return (name: EventName, props: EventProps = {}): void => {
    try {
      Promise.resolve(send({ device_id: deviceId(), name, props })).catch(() => {});
    } catch {
      // 위와 같음
    }
  };
}

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 이용 기록 남기기. 배포본에서만 남긴다 (개발 서버에서 연 화면이 운영 KPI에 섞이지 않게) */
export function track(name: EventName, props?: EventProps): void {
  if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') return;
  const supabase = getSupabase();
  if (!supabase) return;
  createTracker((row) => supabase.from('events').insert(row), () => deviceIdFrom(browserStorage()))(name, props);
}
