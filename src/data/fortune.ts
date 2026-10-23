/**
 * 오하아사(일본 아사히방송 아침 프로그램의 별자리 순위)처럼 보는 오늘의 운세.
 * 방송처럼 순위마다 운세 한 줄, 조언 한 줄, 럭키 아이템이 나온다.
 * - 순위·운세·조언: 날짜와 별자리로 정해져 같은 별자리면 모두 같다
 * - 럭키 아이템·컬러: 생년월일, 태어난 시각, 날짜로 사람마다 다르게 고른다
 */

export type Zodiac = {
  id: string;
  name: string;
  emoji: string;
  /** 시작 날짜 [월, 일]. 다음 별자리 시작 전날까지 */
  from: [number, number];
};

/** 1월 1일부터 순서대로 (염소자리는 해를 넘겨 12월 22일에 다시 시작) */
export const ZODIACS: readonly Zodiac[] = [
  { id: 'capricorn', name: '염소자리', emoji: '♑', from: [12, 22] },
  { id: 'aquarius', name: '물병자리', emoji: '♒', from: [1, 20] },
  { id: 'pisces', name: '물고기자리', emoji: '♓', from: [2, 19] },
  { id: 'aries', name: '양자리', emoji: '♈', from: [3, 21] },
  { id: 'taurus', name: '황소자리', emoji: '♉', from: [4, 20] },
  { id: 'gemini', name: '쌍둥이자리', emoji: '♊', from: [5, 21] },
  { id: 'cancer', name: '게자리', emoji: '♋', from: [6, 22] },
  { id: 'leo', name: '사자자리', emoji: '♌', from: [7, 23] },
  { id: 'virgo', name: '처녀자리', emoji: '♍', from: [8, 23] },
  { id: 'libra', name: '천칭자리', emoji: '♎', from: [9, 23] },
  { id: 'scorpio', name: '전갈자리', emoji: '♏', from: [10, 23] },
  { id: 'sagittarius', name: '사수자리', emoji: '♐', from: [11, 22] },
];

export type LuckyColor = { name: string; hex: string };

export const COLORS: readonly LuckyColor[] = [
  { name: '라벤더', hex: '#B9A7E0' },
  { name: '민트', hex: '#9ED9C4' },
  { name: '레몬', hex: '#F6E27A' },
  { name: '코랄', hex: '#F4A08A' },
  { name: '하늘색', hex: '#9CCBEB' },
  { name: '연두', hex: '#B9DB8C' },
  { name: '복숭아', hex: '#F7C4A5' },
  { name: '남색', hex: '#3E4F86' },
  { name: '버건디', hex: '#8E3B4E' },
  { name: '크림', hex: '#F3E7C9' },
  { name: '올리브', hex: '#8F9A5B' },
  { name: '벚꽃색', hex: '#F5C6D6' },
  { name: '하늘보라', hex: '#A8B5E8' },
  { name: '오렌지', hex: '#F39A4C' },
  { name: '구름 회색', hex: '#B7BCC4' },
  { name: '숲초록', hex: '#3F7A5A' },
  { name: '모래색', hex: '#D9C2A0' },
  { name: '청록', hex: '#3AA6A0' },
  { name: '노을빛', hex: '#F08A6C' },
  { name: '밤하늘', hex: '#5B5BA8' },
];

export type LuckyItem = { name: string; emoji: string };

export const ITEMS: readonly LuckyItem[] = [
  { name: '이어폰', emoji: '🎧' },
  { name: '머그컵', emoji: '☕' },
  { name: '연필', emoji: '✏️' },
  { name: '우산', emoji: '☂️' },
  { name: '사과', emoji: '🍎' },
  { name: '귤', emoji: '🍊' },
  { name: '초콜릿', emoji: '🍫' },
  { name: '쿠키', emoji: '🍪' },
  { name: '튤립', emoji: '🌷' },
  { name: '양말', emoji: '🧦' },
  { name: '모자', emoji: '🧢' },
  { name: '안경', emoji: '👓' },
  { name: '열쇠', emoji: '🔑' },
  { name: '카메라', emoji: '📷' },
  { name: '소설책', emoji: '📖' },
  { name: '편지', emoji: '💌' },
  { name: '리본', emoji: '🎀' },
  { name: '풍선', emoji: '🎈' },
  { name: '식빵', emoji: '🍞' },
  { name: '딸기', emoji: '🍓' },
  { name: '우유', emoji: '🥛' },
  { name: '손거울', emoji: '🪞' },
  { name: '동전', emoji: '🪙' },
  { name: '운동화', emoji: '👟' },
  { name: '목도리', emoji: '🧣' },
  { name: '향초', emoji: '🕯️' },
  { name: '화분', emoji: '🪴' },
  { name: '주먹밥', emoji: '🍙' },
  { name: 'CD', emoji: '💿' },
  { name: '일기장', emoji: '📔' },
  { name: '달력', emoji: '📅' },
  { name: '보석', emoji: '💎' },
];

/** 순위 구간별 운세(luck)와 조언(advice). 꼴찌인 날엔 오목이가 힘을 준다 */
export const TIERS: readonly { maxRank: number; label: string; luck: readonly string[]; advice: readonly string[] }[] = [
  {
    maxRank: 1,
    label: '최고의 날',
    luck: ['뭘 해도 술술 풀리는 날', '반가운 소식이 날아와요', '기다리던 기회가 찾아와요', '하루 종일 기분이 반짝반짝'],
    advice: ['미뤄 둔 일을 시작해 봐요', '먼저 연락하면 좋은 일이 생겨요', '하고 싶은 말은 오늘 꼭 해요', '좋은 기분을 주변에 나눠요'],
  },
  {
    maxRank: 4,
    label: '좋은 날',
    luck: ['기분 좋은 우연이 생겨요', '칭찬받을 일이 생길지도', '친구와의 수다에 행운이 있어요', '작은 선물을 받을 것 같아요'],
    advice: ['평소와 다른 길로 가 봐요', '웃는 얼굴이 행운의 열쇠', '새로운 노래를 들어 봐요', '고마운 사람에게 인사를 건네요'],
  },
  {
    maxRank: 8,
    label: '무난한 날',
    luck: ['잔잔하게 흘러가는 하루', '하던 일이 차근차근 정리돼요', '평범함 속에 작은 재미가 있어요', '몸도 마음도 균형이 좋아요'],
    advice: ['내 속도를 지켜요', '잠깐 산책하면 기분이 좋아져요', '책상을 정리하면 운이 따라요', '물을 자주 마셔요'],
  },
  {
    maxRank: 11,
    label: '조심조심',
    luck: ['작은 실수가 생기기 쉬워요', '생각이 잘 정리되지 않는 날', '일이 기대만큼 진행되지 않아요', '말 한마디에 오해가 생길 수도'],
    advice: ['한 번 더 확인하면 괜찮아요', '잠깐 쉬었다 가요', '서두르지 말고 천천히', '말하기 전에 숨 한 번 고르기'],
  },
  {
    maxRank: 12,
    label: '쉬어 가는 날',
    luck: ['조금 지치기 쉬운 날', '일이 자꾸 꼬일 수 있어요', '마음이 쉽게 흔들리는 날'],
    advice: ['좋아하는 노래가 운을 돌려줘요', '따뜻한 음료로 마음을 달래요', '오늘은 일찍 푹 쉬어요'],
  },
];
