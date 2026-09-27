export type StageNo = 1 | 2 | 3 | 4 | 5;

export type Stage = {
  no: StageNo;
  name: string;
  description: string;
  /** 이 단계가 되기 위해 필요한 누적 미션 수 */
  minMissions: number;
  image: string;
  /** 그림 속 얼굴 중심(가로·세로 %). 대화 프로필에서 얼굴이 동그라미 가운데 오도록 확대할 때 쓴다 */
  face: { x: number; y: number };
};

/**
 * 오목이 성장 단계. 진화 기준(minMissions)은 여기서만 바꾼다.
 * 그림은 2026-09-27 새 진화 그림(손그림체)에서 잘라낸 것 — 그림을 바꿀 땐 경로(v2 → v3)도 바꿔야
 * 브라우저·이미지 최적화 캐시(기본 4시간)에 옛 그림이 남지 않는다.
 */
export const STAGES: readonly Stage[] = [
  { no: 1, name: '알', description: '아직 세상에 나오지 않은 작은 마음', minMissions: 0, image: '/mascot/v2/stage-1.png', face: { x: 50, y: 61 } },
  { no: 2, name: '아기새', description: '세상을 조심히 바라보는 조심스러운 마음', minMissions: 3, image: '/mascot/v2/stage-2.png', face: { x: 54, y: 66 } },
  { no: 3, name: '편지 오목이', description: '용기를 내어 마음을 전하는 마음', minMissions: 7, image: '/mascot/v2/stage-3.png', face: { x: 56, y: 65 } },
  { no: 4, name: '우체부 오목이', description: '누군가에게 달려가는 마음', minMissions: 15, image: '/mascot/v2/stage-4.png', face: { x: 67, y: 66 } },
  { no: 5, name: '온기 오목이', description: '마음을 주고받으며 더 따뜻해진 오목이', minMissions: 30, image: '/mascot/v2/stage-5.png', face: { x: 53, y: 61 } },
];

export function getStage(no: StageNo): Stage {
  return STAGES[no - 1];
}
