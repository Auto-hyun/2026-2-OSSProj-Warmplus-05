export type StageNo = 1 | 2 | 3 | 4 | 5;

export type Stage = {
  no: StageNo;
  name: string;
  description: string;
  /** 이 단계가 되기 위해 필요한 누적 미션 수 */
  minMissions: number;
  image: string;
};

/** 뱁새 성장 단계. 진화 기준(minMissions)은 여기서만 바꾼다 */
export const STAGES: readonly Stage[] = [
  { no: 1, name: '알 (부화 전)', description: '살짝 갈라진 알 안에서 반짝이는 눈만 보여요.', minMissions: 0, image: '/mascot/stage-1.png' },
  { no: 2, name: '아기 뱁새 (부화 중)', description: '알 껍질을 쓴 채 세상을 처음 보는 귀여운 아기 뱁새!', minMissions: 3, image: '/mascot/stage-2.png' },
  { no: 3, name: '어린 뱁새', description: '알 껍질을 벗고 조금 더 자란 뱁새예요.', minMissions: 7, image: '/mascot/stage-3.png' },
  { no: 4, name: '청소년 뱁새', description: '깃털이 더 풍성해지고 조금 더 단단해진 모습이에요.', minMissions: 15, image: '/mascot/stage-4.png' },
  { no: 5, name: '성체 뱁새', description: '이제 완전한 뱁새! 언제나 곁에 있을 거예요.', minMissions: 30, image: '/mascot/stage-5.png' },
];

export function getStage(no: StageNo): Stage {
  return STAGES[no - 1];
}
