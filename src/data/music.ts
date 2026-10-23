/**
 * 감정 갈래별 기본 음악 스타일. Suno에 보내는 style 문장의 뼈대가 된다.
 * 감정을 억지로 바꾸지 않고 맞춰 준다: 슬플 땐 슬픈 곡, 스트레스엔 풀리는 곡, 행복할 땐 행복한 곡.
 */
export type MoodFamily = 'sad' | 'stress' | 'happy' | 'calm';

export type FamilyInfo = {
  id: MoodFamily;
  /** 갈래 이름 (심리테스트 결과 카드에 보인다) */
  label: string;
  /** 칩·카드 배경색 */
  tint: string;
  /** Suno style 문장 (영어가 더 잘 알아듣는다) */
  style: string;
};

export const FAMILIES: Record<MoodFamily, FamilyInfo> = {
  sad: {
    id: 'sad',
    label: '가라앉은 마음',
    tint: '#E4EAF6',
    style: 'slow tempo around 65 BPM, solo piano with soft strings, melancholic yet warm, gentle reverb, quiet and tender',
  },
  stress: {
    id: 'stress',
    label: '복잡한 마음',
    tint: '#ECE6F6',
    style:
      'starts tense and slowly releases, steady drums, warm synth pads, cathartic build into a relieved and uplifting resolution, around 90 BPM',
  },
  happy: {
    id: 'happy',
    label: '들뜬 마음',
    tint: '#FFF0D9',
    style: 'bright and bouncy, acoustic guitar, ukulele and light percussion, cheerful melody, around 115 BPM',
  },
  calm: {
    id: 'calm',
    label: '잔잔한 마음',
    tint: '#E6F2E6',
    style: 'ambient, soft piano and airy pads, nature-like textures, slow and spacious, around 70 BPM',
  },
};

/** 모든 곡에 공통으로 붙는 말: 가사 없는 힐링 연주곡 */
export const BASE_STYLE = 'instrumental, healing sound therapy music, no vocals';
/** 곡에 들어가지 않았으면 하는 것 */
export const NEGATIVE_TAGS = 'vocals, singing, lyrics, rap, harsh noise, distortion';
/** 곡 길이(초). Suno V6는 10~360초 */
export const SONG_SECONDS = 120;
