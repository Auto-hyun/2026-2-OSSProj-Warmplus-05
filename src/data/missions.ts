export type MissionTheme = 'body' | 'outside' | 'connect' | 'mind' | 'joy';

export type Mission = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  theme: MissionTheme;
};

export const MISSION_THEME_LABEL: Record<MissionTheme, string> = {
  body: '몸',
  outside: '바깥',
  connect: '연결',
  mind: '마음',
  joy: '작은 기쁨',
};

/** 하루의 활기를 불어넣는 가벼운 1일 1미션 (테마별 8개) */
export const MISSIONS: readonly Mission[] = [
  // 몸
  { id: 'walk-10', emoji: '👣', title: '산책 10분 하기', description: '가까운 골목 한 바퀴도 좋아요.', theme: 'body' },
  { id: 'stretch-5', emoji: '🙆', title: '스트레칭 5분 하기', description: '목과 어깨를 천천히 풀어봐요.', theme: 'body' },
  { id: 'water-slow', emoji: '💧', title: '물 한 잔 천천히 마시기', description: '한 모금씩, 몸이 깨어나는 걸 느껴봐요.', theme: 'body' },
  { id: 'stairs', emoji: '🪜', title: '계단으로 한 층 오르기', description: '조금 숨이 차도 괜찮아요.', theme: 'body' },
  { id: 'deep-breath', emoji: '🌬️', title: '깊게 숨 쉬기 10번', description: '들이쉬고, 천천히 내쉬어요.', theme: 'body' },
  { id: 'early-sleep', emoji: '🛌', title: '평소보다 30분 일찍 눕기', description: '오늘은 휴대폰을 조금 일찍 내려놔요.', theme: 'body' },
  { id: 'warm-meal', emoji: '🍚', title: '따뜻한 한 끼 챙겨 먹기', description: '간단해도 괜찮아요, 따뜻하게만.', theme: 'body' },
  { id: 'shower-refresh', emoji: '🚿', title: '개운하게 씻기', description: '따뜻한 물로 하루를 한번 씻어내요.', theme: 'body' },
  // 바깥
  { id: 'cafe-visit', emoji: '☕', title: '카페 가기', description: '좋아하는 음료 한 잔과 잠깐의 여유를.', theme: 'outside' },
  { id: 'sunlight-5', emoji: '🌤️', title: '햇볕 5분 쬐기', description: '창가나 문 앞도 좋아요.', theme: 'outside' },
  { id: 'new-alley', emoji: '🗺️', title: '안 가본 골목 걸어보기', description: '동네의 새로운 모습을 찾아봐요.', theme: 'outside' },
  { id: 'park-bench', emoji: '🌳', title: '공원 벤치에 앉아보기', description: '잠깐 앉아 주변 소리를 들어봐요.', theme: 'outside' },
  { id: 'window-open', emoji: '🪟', title: '창문 열고 환기하기', description: '바깥 공기를 방 안으로 들여요.', theme: 'outside' },
  { id: 'bakery-visit', emoji: '🥐', title: '동네 빵집 들르기', description: '끌리는 빵 하나 골라봐요.', theme: 'outside' },
  { id: 'bookstore-visit', emoji: '📚', title: '서점이나 도서관 둘러보기', description: '제목만 구경해도 충분해요.', theme: 'outside' },
  { id: 'convenience-walk', emoji: '🏪', title: '산책 겸 편의점 다녀오기', description: '좋아하는 간식 하나 사 와요.', theme: 'outside' },
  // 연결
  { id: 'hello-text', emoji: '💬', title: '친구에게 안부 문자 보내기', description: '"잘 지내?" 한마디면 충분해요.', theme: 'connect' },
  { id: 'call-family', emoji: '📞', title: '가족에게 전화하기', description: '짧은 통화도 마음을 데워줘요.', theme: 'connect' },
  { id: 'thanks-note', emoji: '💌', title: '고마운 사람에게 한 줄 남기기', description: '작은 고마움도 전해봐요.', theme: 'connect' },
  { id: 'greet-first', emoji: '👋', title: '먼저 인사 건네기', description: '이웃, 점원, 동료 누구든요.', theme: 'connect' },
  { id: 'share-photo', emoji: '📷', title: '좋았던 사진 한 장 공유하기', description: '누군가와 오늘을 나눠봐요.', theme: 'connect' },
  { id: 'compliment', emoji: '🌼', title: '누군가 칭찬하기', description: '진심을 담은 한마디를 건네요.', theme: 'connect' },
  { id: 'old-friend', emoji: '🔗', title: '오랜만인 사람에게 연락하기', description: '떠오른 김에 가볍게 인사해요.', theme: 'connect' },
  { id: 'care-living', emoji: '🪴', title: '반려동물이나 식물 돌보기', description: '작은 생명과 눈을 맞춰봐요.', theme: 'connect' },
  // 마음
  { id: 'gratitude-one', emoji: '🙏', title: '고마운 일 1개 적기', description: '아주 사소한 것도 좋아요.', theme: 'mind' },
  { id: 'three-songs', emoji: '🎧', title: '좋아하는 노래 3곡 듣기', description: '오늘의 기분에 맞는 노래로요.', theme: 'mind' },
  { id: 'blank-5', emoji: '☁️', title: '5분 동안 멍때리기', description: '아무것도 하지 않아도 괜찮아요.', theme: 'mind' },
  { id: 'feeling-word', emoji: '✏️', title: '오늘 기분을 한 단어로 적기', description: '정답은 없어요.', theme: 'mind' },
  { id: 'self-praise', emoji: '🏅', title: '나를 칭찬하는 말 하나 적기', description: '오늘 해낸 작은 일도요.', theme: 'mind' },
  { id: 'phone-free-30', emoji: '📵', title: '30분 휴대폰 내려놓기', description: '잠깐 화면에서 멀어져봐요.', theme: 'mind' },
  { id: 'read-pages', emoji: '📖', title: '책 5쪽 읽기', description: '좋아하는 문장을 하나 찾아봐요.', theme: 'mind' },
  { id: 'worry-note', emoji: '🗒️', title: '걱정 하나 종이에 적어두기', description: '적어두면 마음이 조금 가벼워져요.', theme: 'mind' },
  // 작은 기쁨
  { id: 'favorite-snack', emoji: '🍪', title: '좋아하는 간식 먹기', description: '오늘은 나를 위한 간식 시간.', theme: 'joy' },
  { id: 'sky-photo', emoji: '📸', title: '하늘 사진 찍기', description: '오늘의 하늘은 어떤 색인가요?', theme: 'joy' },
  { id: 'make-bed', emoji: '🛏️', title: '이불 개기', description: '정돈된 침대가 하루를 반겨줘요.', theme: 'joy' },
  { id: 'desk-tidy', emoji: '🧹', title: '책상 5분 정리하기', description: '딱 5분만, 눈에 보이는 곳부터.', theme: 'joy' },
  { id: 'flower-look', emoji: '🌷', title: '꽃이나 나무 구경하기', description: '길가의 작은 꽃도 좋아요.', theme: 'joy' },
  { id: 'cozy-drink', emoji: '🍵', title: '따뜻한 차 한 잔 마시기', description: '두 손으로 컵을 감싸봐요.', theme: 'joy' },
  { id: 'old-photos', emoji: '🖼️', title: '예전 사진 구경하기', description: '웃음이 나는 사진을 찾아봐요.', theme: 'joy' },
  { id: 'dance-song', emoji: '💃', title: '신나는 노래에 몸 흔들기', description: '딱 한 곡만, 아무도 안 봐요.', theme: 'joy' },
];

const byId = new Map(MISSIONS.map((m) => [m.id, m]));

export function getMission(id: string): Mission | undefined {
  return byId.get(id);
}
