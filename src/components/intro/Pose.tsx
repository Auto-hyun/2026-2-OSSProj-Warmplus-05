import Image from 'next/image';
import type { Ref } from 'react';
import { POSE_SIZE, poseSrc, type IntroPose } from '@/data/intro';

type Props = {
  pose: IntroPose;
  alt?: string;
  className?: string;
  eager?: boolean;
  ref?: Ref<HTMLImageElement>;
};

/** 오목이 포즈 그림 (작은 webp라 최적화 없이 그대로 쓴다) */
export function Pose({ pose, alt = '', className, eager = false, ref }: Props) {
  const [width, height] = POSE_SIZE[pose];
  return (
    <Image
      ref={ref}
      src={poseSrc(pose)}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      className={className}
    />
  );
}
