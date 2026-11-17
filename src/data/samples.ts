/**
 * 샘플 곡 목록: public/samples/{file}.mp3 하나마다 어떤 감정 단어로 만든 곡인지.
 * 곡을 고를 때 단어의 감정(7가지)·갈래로 묶는다 (lib/music/sample.ts).
 * 곡을 넣거나 빼면 여기도 고친다. 기존 파일 이름은 바꾸지 않는다 (저장한 노래·글 배경음악이 이 주소를 쓴다)
 */
export const SAMPLE_SONGS: readonly { file: string; word: string }[] = [
  // sad
  { file: 'sad-1', word: 'sadness' }, // 슬픔
  { file: 'sad-2', word: 'sadness' }, // 슬픔
  { file: 'sad-3', word: 'gloom' }, // 우울
  { file: 'sad-4', word: 'gloom' }, // 우울
  { file: 'sad-5', word: 'lonely' }, // 외로움
  { file: 'sad-6', word: 'lonely' }, // 외로움
  { file: 'sad-7', word: 'longing' }, // 그리움
  { file: 'sad-8', word: 'longing' }, // 그리움
  { file: 'sad-9', word: 'hurt' }, // 서운함
  { file: 'sad-10', word: 'hurt' }, // 서운함
  { file: 'sad-11', word: 'empty' }, // 허전함
  { file: 'sad-12', word: 'empty' }, // 허전함
  { file: 'sad-13', word: 'sadness' }, // 슬픔 (추가 1회차)
  { file: 'sad-14', word: 'sadness' }, // 슬픔 (추가 1회차)
  { file: 'sad-15', word: 'gloom' }, // 우울 (추가 1회차)
  { file: 'sad-16', word: 'gloom' }, // 우울 (추가 1회차)
  // stress
  { file: 'stress-1', word: 'stress' }, // 스트레스
  { file: 'stress-2', word: 'stress' }, // 스트레스
  { file: 'stress-3', word: 'anger' }, // 화남
  { file: 'stress-4', word: 'anger' }, // 화남
  { file: 'stress-5', word: 'stuffy' }, // 답답함
  { file: 'stress-6', word: 'stuffy' }, // 답답함
  { file: 'stress-7', word: 'anxiety' }, // 불안
  { file: 'stress-8', word: 'anxiety' }, // 불안
  { file: 'stress-9', word: 'annoyed' }, // 짜증
  { file: 'stress-10', word: 'annoyed' }, // 짜증
  { file: 'stress-11', word: 'tired' }, // 지침
  { file: 'stress-12', word: 'tired' }, // 지침
  { file: 'stress-13', word: 'stress' }, // 스트레스 (추가 1회차)
  { file: 'stress-14', word: 'stress' }, // 스트레스 (추가 1회차)
  { file: 'stress-15', word: 'stress' }, // 스트레스 (추가 2회차)
  { file: 'stress-16', word: 'stress' }, // 스트레스 (추가 2회차)
  { file: 'stress-17', word: 'stress' }, // 스트레스 (추가 3회차)
  { file: 'stress-18', word: 'stress' }, // 스트레스 (추가 3회차)
  { file: 'stress-19', word: 'anger' }, // 화남 (추가 1회차)
  { file: 'stress-20', word: 'anger' }, // 화남 (추가 1회차)
  { file: 'stress-21', word: 'anger' }, // 화남 (추가 2회차)
  { file: 'stress-22', word: 'anger' }, // 화남 (추가 2회차)
  { file: 'stress-23', word: 'stuffy' }, // 답답함 (추가 1회차)
  { file: 'stress-24', word: 'stuffy' }, // 답답함 (추가 1회차)
  { file: 'stress-25', word: 'anxiety' }, // 불안 (추가 1회차)
  { file: 'stress-26', word: 'anxiety' }, // 불안 (추가 1회차)
  { file: 'stress-27', word: 'anxiety' }, // 불안 (추가 2회차)
  { file: 'stress-28', word: 'anxiety' }, // 불안 (추가 2회차)
  { file: 'stress-29', word: 'anxiety' }, // 불안 (추가 3회차)
  { file: 'stress-30', word: 'anxiety' }, // 불안 (추가 3회차)
  { file: 'stress-31', word: 'annoyed' }, // 짜증 (추가 1회차)
  { file: 'stress-32', word: 'annoyed' }, // 짜증 (추가 1회차)
  { file: 'stress-33', word: 'annoyed' }, // 짜증 (추가 2회차)
  { file: 'stress-34', word: 'annoyed' }, // 짜증 (추가 2회차)
  { file: 'stress-35', word: 'tired' }, // 지침 (추가 1회차)
  { file: 'stress-36', word: 'tired' }, // 지침 (추가 1회차)
  { file: 'stress-37', word: 'tired' }, // 지침 (추가 2회차)
  { file: 'stress-38', word: 'tired' }, // 지침 (추가 2회차)
  // happy
  { file: 'happy-1', word: 'happy' }, // 행복
  { file: 'happy-2', word: 'happy' }, // 행복
  { file: 'happy-3', word: 'excited' }, // 신남
  { file: 'happy-4', word: 'excited' }, // 신남
  { file: 'happy-5', word: 'flutter' }, // 설렘
  { file: 'happy-6', word: 'flutter' }, // 설렘
  { file: 'happy-7', word: 'proud' }, // 뿌듯함
  { file: 'happy-8', word: 'proud' }, // 뿌듯함
  { file: 'happy-9', word: 'thankful' }, // 감사
  { file: 'happy-10', word: 'thankful' }, // 감사
  { file: 'happy-11', word: 'love' }, // 사랑
  { file: 'happy-12', word: 'love' }, // 사랑
  { file: 'happy-13', word: 'happy' }, // 행복 (추가 1회차)
  { file: 'happy-14', word: 'happy' }, // 행복 (추가 1회차)
  { file: 'happy-15', word: 'excited' }, // 신남 (추가 1회차)
  { file: 'happy-16', word: 'excited' }, // 신남 (추가 1회차)
  { file: 'happy-17', word: 'flutter' }, // 설렘 (추가 1회차)
  { file: 'happy-18', word: 'flutter' }, // 설렘 (추가 1회차)
  { file: 'happy-19', word: 'flutter' }, // 설렘 (추가 2회차)
  { file: 'happy-20', word: 'flutter' }, // 설렘 (추가 2회차)
  { file: 'happy-21', word: 'flutter' }, // 설렘 (추가 3회차)
  { file: 'happy-22', word: 'flutter' }, // 설렘 (추가 3회차)
  { file: 'happy-23', word: 'proud' }, // 뿌듯함 (추가 1회차)
  { file: 'happy-24', word: 'proud' }, // 뿌듯함 (추가 1회차)
  { file: 'happy-25', word: 'thankful' }, // 감사 (추가 1회차)
  { file: 'happy-26', word: 'thankful' }, // 감사 (추가 1회차)
  { file: 'happy-27', word: 'love' }, // 사랑 (추가 1회차)
  { file: 'happy-28', word: 'love' }, // 사랑 (추가 1회차)
  { file: 'happy-29', word: 'love' }, // 사랑 (추가 2회차)
  { file: 'happy-30', word: 'love' }, // 사랑 (추가 2회차)
  { file: 'happy-31', word: 'love' }, // 사랑 (추가 3회차)
  { file: 'happy-32', word: 'love' }, // 사랑 (추가 3회차)
  // calm
  { file: 'calm-1', word: 'peace' }, // 평온
  { file: 'calm-2', word: 'peace' }, // 평온
  { file: 'calm-3', word: 'cozy' }, // 포근함
  { file: 'calm-4', word: 'cozy' }, // 포근함
  { file: 'calm-5', word: 'drowsy' }, // 나른함
  { file: 'calm-6', word: 'drowsy' }, // 나른함
  { file: 'calm-7', word: 'spaced' }, // 멍함
  { file: 'calm-8', word: 'spaced' }, // 멍함
  { file: 'calm-9', word: 'relief' }, // 안도
  { file: 'calm-10', word: 'relief' }, // 안도
  { file: 'calm-11', word: 'calmness' }, // 담담함
  { file: 'calm-12', word: 'calmness' }, // 담담함
  { file: 'calm-13', word: 'peace' }, // 평온 (추가 1회차)
  { file: 'calm-14', word: 'peace' }, // 평온 (추가 1회차)
  { file: 'calm-15', word: 'cozy' }, // 포근함 (추가 1회차)
  { file: 'calm-16', word: 'cozy' }, // 포근함 (추가 1회차)
  { file: 'calm-17', word: 'drowsy' }, // 나른함 (추가 1회차)
  { file: 'calm-18', word: 'drowsy' }, // 나른함 (추가 1회차)
  { file: 'calm-19', word: 'drowsy' }, // 나른함 (추가 2회차)
  { file: 'calm-20', word: 'drowsy' }, // 나른함 (추가 2회차)
  { file: 'calm-21', word: 'spaced' }, // 멍함 (추가 1회차)
  { file: 'calm-22', word: 'spaced' }, // 멍함 (추가 1회차)
  { file: 'calm-23', word: 'relief' }, // 안도 (추가 1회차)
  { file: 'calm-24', word: 'relief' }, // 안도 (추가 1회차)
  { file: 'calm-25', word: 'calmness' }, // 담담함 (추가 1회차)
  { file: 'calm-26', word: 'calmness' }, // 담담함 (추가 1회차)
];
