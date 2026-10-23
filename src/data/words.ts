import type { MoodFamily } from './music';

/** 노래 만들기 > 감정 단어로: 지금 감정에 맞는 단어를 고르면 그 분위기의 곡을 만든다 */
export type EmotionWord = {
  id: string;
  label: string;
  family: MoodFamily;
  /** 갈래 기본 스타일에 더하는 느낌 (Suno style) */
  style: string;
};

export const MAX_WORDS = 3;

export const WORDS: readonly EmotionWord[] = [
  { id: 'sadness', label: '슬픔', family: 'sad', style: 'sorrowful' },
  { id: 'gloom', label: '우울', family: 'sad', style: 'heavy hearted, minor key' },
  { id: 'lonely', label: '외로움', family: 'sad', style: 'lonely, sparse arrangement' },
  { id: 'longing', label: '그리움', family: 'sad', style: 'nostalgic, longing' },
  { id: 'hurt', label: '서운함', family: 'sad', style: 'wistful' },
  { id: 'empty', label: '허전함', family: 'sad', style: 'hollow, distant echoes' },

  { id: 'stress', label: '스트레스', family: 'stress', style: 'tension that unwinds' },
  { id: 'anger', label: '화남', family: 'stress', style: 'driving rhythm that cools down' },
  { id: 'stuffy', label: '답답함', family: 'stress', style: 'opening up, breath of fresh air' },
  { id: 'anxiety', label: '불안', family: 'stress', style: 'reassuring, grounding bass' },
  { id: 'annoyed', label: '짜증', family: 'stress', style: 'playful release' },
  { id: 'tired', label: '지침', family: 'stress', style: 'soothing, restful ending' },

  { id: 'happy', label: '행복', family: 'happy', style: 'joyful' },
  { id: 'excited', label: '신남', family: 'happy', style: 'energetic, upbeat' },
  { id: 'flutter', label: '설렘', family: 'happy', style: 'sparkling, light bells, heart fluttering' },
  { id: 'proud', label: '뿌듯함', family: 'happy', style: 'triumphant, warm brass' },
  { id: 'thankful', label: '감사', family: 'happy', style: 'heartwarming' },
  { id: 'love', label: '사랑', family: 'happy', style: 'romantic, sweet' },

  { id: 'peace', label: '평온', family: 'calm', style: 'peaceful' },
  { id: 'cozy', label: '포근함', family: 'calm', style: 'cozy, warm felt piano' },
  { id: 'drowsy', label: '나른함', family: 'calm', style: 'lazy afternoon, lo-fi' },
  { id: 'spaced', label: '멍함', family: 'calm', style: 'dreamy, floating' },
  { id: 'relief', label: '안도', family: 'calm', style: 'relieved, gentle sigh' },
  { id: 'calmness', label: '담담함', family: 'calm', style: 'steady, understated' },
];

export function getWord(id: string): EmotionWord | undefined {
  return WORDS.find((w) => w.id === id);
}
