import type { DayKey } from '@/lib/date';
import type { StageNo } from '@/data/stages';

export type ChatRole = 'user' | 'assistant';

export type StoredMessage = {
  role: ChatRole;
  content: string;
  at: string;
  /** 위기 감지로 보낸 안내 메시지면 'safety' (도움 기관 카드를 함께 보여줌) */
  kind?: 'safety';
};

export type ChatDay = {
  question: string;
  messages: StoredMessage[];
  /** 온기우편함 연결 카드를 이미 보여줬는지 */
  bridgeShown: boolean;
};

export type MissionRecord = {
  missionId: string;
  note?: string;
  completedAt: string;
  /** 시연 모드로 추가한 기록 */
  demo?: boolean;
};

export type Settings = {
  demoMode: boolean;
  dayOffset: number;
  stageOverride: StageNo | null;
  seenChatNotice: boolean;
};

export type OngiState = {
  version: 1;
  profile: {
    installId: string;
    startedOn: DayKey;
    birdName: string;
    /** 처음 실행 때 이름 짓기를 마쳤는지 (건너뛰어도 true) */
    named: boolean;
    lastSeenStage: StageNo;
  };
  missions: {
    records: Record<DayKey, MissionRecord>;
    /** 날짜별로 교체한 미션 id */
    swaps: Record<DayKey, string>;
  };
  chats: Record<DayKey, ChatDay>;
  settings: Settings;
};

/** 상태를 어디에 저장할지. 나중에 서버 DB도 이 모양으로 교체한다 */
export interface StorageAdapter {
  readonly persistent: boolean;
  load(): OngiState | null;
  save(state: OngiState): void;
  /** 다른 곳(다른 탭)에서 저장된 값이 바뀌면 알려준다 */
  subscribe?(onChange: () => void): () => void;
}
