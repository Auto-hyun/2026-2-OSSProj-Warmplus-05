import type { MoodFamily } from '@/data/music';

/** 무엇으로 노래를 만들었는지: 심리테스트 유형 또는 고른 감정 단어 */
export type SongSource = { kind: 'test'; testId: string; resultId: string } | { kind: 'words'; words: string[] };

/** 작곡을 맡길 내용 (Suno에 그대로 보낸다) */
export type SongRequest = { title: string; style: string; family: MoodFamily };

/** 'sample': 미리 넣어 둔 샘플 곡으로 흉내 / 'suno': sunoapi.org로 실제 작곡 */
export type MusicMode = 'sample' | 'suno';

export type Track = {
  id: string;
  audioUrl: string;
  /** 초. 모르면 null */
  duration: number | null;
  /** 우리 저장소로 옮기지 못한 Suno 파일: 2주쯤 뒤 사라진다 */
  temporary: boolean;
};

export type TaskStatus =
  | { state: 'composing' }
  | { state: 'done'; tracks: Track[] }
  | { state: 'failed'; reason: string };
