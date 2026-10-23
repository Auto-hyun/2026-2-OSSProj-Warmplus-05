import type { Birth } from '@/lib/fortune';
import type { MusicMode, SongSource } from '@/lib/music/types';

export type TestRecord = { testId: string; resultId: string; at: string };

/** 내가 만든 노래 (작곡 한 번에 2곡씩 생긴다) */
export type Song = {
  id: string;
  title: string;
  audioUrl: string;
  duration: number | null;
  /** Suno 쪽 주소라 2주쯤 뒤 사라지는 곡 */
  temporary: boolean;
  mode: MusicMode;
  source: SongSource;
  createdAt: string;
};

/** 작곡을 맡겨 두고 기다리는 중 */
export type PendingSong = {
  taskId: string;
  title: string;
  source: SongSource;
  mode: MusicMode;
  startedAt: string;
};

/** 노래 만들기 탭에 보여 줄 마지막 작곡 결과 (완성된 곡 또는 실패 이유). 확인하면 지운다 */
export type ComposeOutcome = { songIds: string[] } | { error: string };

/** 이 기기(브라우저)에만 저장하는 것들. 커뮤니티 글은 Supabase에 */
export type AppState = {
  version: 1;
  profile: {
    /** 커뮤니티에 보이는 이름 */
    nickname: string | null;
    birth: Birth | null;
    /** 오목이와 처음 인사를 나눴는지 (첫 방문 인사가 달라진다) */
    metOmok: boolean;
  };
  /** 최근 것이 앞 */
  tests: TestRecord[];
  /** 최근 것이 앞 */
  songs: Song[];
  pending: PendingSong[];
  outcome: ComposeOutcome | null;
};

export type StorageAdapter = {
  load(): AppState | null;
  save(state: AppState): void;
  /** 다른 탭에서 바꾼 기록 알림 */
  subscribe?(onChange: () => void): () => void;
};
