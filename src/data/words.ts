import type { MoodId } from './moods';
import type { MoodFamily } from './music';

/** 노래 만들기 > 감정 단어로: 지금 감정에 맞는 단어를 고르면 그 분위기의 곡을 만든다 */
export type EmotionWord = {
  id: string;
  label: string;
  family: MoodFamily;
  /** 7가지 감정 중 어디에 속하는지 (샘플 곡을 고를 때 이 감정의 곡에서 고른다) */
  mood: MoodId;
  /** 갈래 기본 스타일에 더하는 느낌 (Suno style) */
  style: string;
};

export const MAX_WORDS = 3;

export const WORDS: readonly EmotionWord[] = [
  { id: 'sadness', label: '슬픔', family: 'sad', mood: 'sad', style: 'sorrowful' },
  { id: 'gloom', label: '우울', family: 'sad', mood: 'sad', style: 'heavy hearted, minor key' },
  { id: 'lonely', label: '외로움', family: 'sad', mood: 'sad', style: 'lonely, sparse arrangement' },
  { id: 'longing', label: '그리움', family: 'sad', mood: 'sad', style: 'nostalgic, longing' },
  { id: 'hurt', label: '서운함', family: 'sad', mood: 'sad', style: 'wistful' },
  { id: 'empty', label: '허전함', family: 'sad', mood: 'sad', style: 'hollow, distant echoes' },

  { id: 'stress', label: '스트레스', family: 'stress', mood: 'anxious', style: 'tension that unwinds' },
  { id: 'anger', label: '화남', family: 'stress', mood: 'angry', style: 'driving rhythm that cools down' },
  { id: 'stuffy', label: '답답함', family: 'stress', mood: 'angry', style: 'opening up, breath of fresh air' },
  { id: 'anxiety', label: '불안', family: 'stress', mood: 'anxious', style: 'reassuring, grounding bass' },
  { id: 'annoyed', label: '짜증', family: 'stress', mood: 'angry', style: 'playful release' },
  { id: 'tired', label: '지침', family: 'stress', mood: 'tired', style: 'soothing, restful ending' },

  { id: 'happy', label: '행복', family: 'happy', mood: 'joy', style: 'joyful' },
  { id: 'excited', label: '신남', family: 'happy', mood: 'joy', style: 'energetic, upbeat' },
  { id: 'flutter', label: '설렘', family: 'happy', mood: 'flutter', style: 'sparkling, light bells, heart fluttering' },
  { id: 'proud', label: '뿌듯함', family: 'happy', mood: 'joy', style: 'triumphant, warm brass' },
  { id: 'thankful', label: '감사', family: 'happy', mood: 'joy', style: 'heartwarming' },
  { id: 'love', label: '사랑', family: 'happy', mood: 'flutter', style: 'romantic, sweet' },

  { id: 'peace', label: '평온', family: 'calm', mood: 'calm', style: 'peaceful' },
  { id: 'cozy', label: '포근함', family: 'calm', mood: 'calm', style: 'cozy, warm felt piano' },
  { id: 'drowsy', label: '나른함', family: 'calm', mood: 'tired', style: 'lazy afternoon, lo-fi' },
  { id: 'spaced', label: '멍함', family: 'calm', mood: 'tired', style: 'dreamy, floating' },
  { id: 'relief', label: '안도', family: 'calm', mood: 'calm', style: 'relieved, gentle sigh' },
  { id: 'calmness', label: '담담함', family: 'calm', mood: 'calm', style: 'steady, understated' },
];

export function getWord(id: string): EmotionWord | undefined {
  return WORDS.find((w) => w.id === id);
}
