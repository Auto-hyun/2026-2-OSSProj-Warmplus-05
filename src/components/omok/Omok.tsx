import Image from 'next/image';
import { cn } from '@/lib/cn';

/** public/omok에 있는 오목이 그림 (가로, 세로 px) */
const POSES = {
  branch: [429, 281], // 나뭇가지에 앉은 오목이 (홈)
  hello: [169, 204],
  music: [198, 163], // 음표와 함께
  question: [162, 198],
  smile: [228, 168],
  heart: [179, 199],
  peek: [127, 205],
  search: [229, 158],
  book: [173, 162],
  lie: [228, 107],
  wings: [186, 193],
} as const;

export type Pose = keyof typeof POSES;

type Props = {
  pose: Pose;
  /** 보여 줄 높이(px). 폭은 그림 비율대로 */
  height: number;
  /** 숨쉬기 애니메이션 */
  animated?: boolean;
  /** 장식용이면 대체 텍스트를 비운다 */
  decorative?: boolean;
  className?: string;
  /** 첫 화면 큰 그림이면 먼저 받는다 */
  eager?: boolean;
};

export function Omok({ pose, height, animated = false, decorative = true, className, eager }: Props) {
  const [w, h] = POSES[pose];
  const width = Math.round((w / h) * height);
  return (
    <Image
      src={`/omok/${pose}.webp`}
      alt={decorative ? '' : '오목이'}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      draggable={false}
      // 기본 스타일(height: auto)이 크기를 바꾸지 않게 폭·높이를 고정한다
      style={{ width, height }}
      className={cn('max-w-none select-none', animated && 'origin-bottom animate-[omok-breathe_3.2s_ease-in-out_infinite]', className)}
    />
  );
}
