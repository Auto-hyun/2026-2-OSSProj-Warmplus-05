/** 마음 마을 지도 데이터: 지도 화면(MapScreen)과 홈→지도 전환(VillageTransition)이 같은 구도를 쓰도록 한곳에 둔다 */

/** 지도 배경(public/village/village-map.webp, '지도개정버전') 원본 크기. 아래 좌표는 모두 이 그림 기준 px라 화면 폭이 달라도 구도가 유지된다 */
export const MAP_W = 941;
export const MAP_H = 1672;
/** 화면이 그림보다 짧으면 위쪽 하늘을 이만큼까지 잘라 낸다 (그 이상 짧으면 그림 전체가 작아진다) */
const SKY_CROP = 0.12;
/** 그림 맨 위 하늘색: 키 큰 휴대폰에서 그림 위로 남는 자리를 이 색으로 이어 칠한다 */
export const SKY = '#d3d4ea';

/** 지도 상자 크기: 화면 아래에 붙여 폭에 맞추고, 화면이 짧으면 위 하늘을 SKY_CROP까지 잘라 낸 뒤 그래도 모자라면 작아진다 */
export const MAP_BOX_STYLE = {
  aspectRatio: `${MAP_W} / ${MAP_H}`,
  width: `min(100%, calc(100dvh * ${MAP_W / MAP_H / (1 - SKY_CROP)}))`,
} as const;

export type Place = {
  name: string;
  /** 없으면 준비 중 */
  href?: string;
  /** public/village 그림과 원본 크기 */
  src: string;
  size: [number, number];
  /** 그림 왼쪽 위(x, y)와 폭 (배경 기준 px). 위치는 '온기_지도' 시안을 따른다 */
  at: { x: number; y: number; w: number };
};

export const PLACES: Place[] = [
  { name: '오목이 집', href: '/', src: 'house', size: [600, 646], at: { x: 290, y: 55, w: 320 } },
  { name: '마음 테스트 숲', href: '/tests', src: 'test-forest', size: [600, 596], at: { x: 620, y: 345, w: 305 } },
  { name: '노래 공방', href: '/create', src: 'workshop', size: [600, 534], at: { x: 285, y: 565, w: 380 } },
  { name: '이야기 광장', href: '/community', src: 'plaza', size: [600, 532], at: { x: 40, y: 885, w: 325 } },
  { name: '온스트리밍 TOP100', src: 'stage', size: [600, 522], at: { x: 595, y: 950, w: 295 } },
  { name: '온기 우체국', src: 'post-office', size: [600, 496], at: { x: 55, y: 1275, w: 345 } },
];

export const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** 장소 그림의 지도 상자 기준 위치 (CSS) */
export const placeStyle = (p: Place) => ({ left: pct(p.at.x, MAP_W), top: pct(p.at.y, MAP_H), width: pct(p.at.w, MAP_W) });

/**
 * 홈에서 문을 지나 지도로 막 도착했는지. 전환이 끝나는 순간 표시해 두면,
 * 지도 화면이 그 직후에 열릴 때 제목이 부드럽게 나오고 건물이 살짝 통통 튄다 (바로 들어온 경우엔 그냥 보인다)
 */
let arrivedAt = 0;
export function markVillageArrival() {
  arrivedAt = Date.now();
}
export function justArrivedInVillage() {
  return Date.now() - arrivedAt < 1500;
}
