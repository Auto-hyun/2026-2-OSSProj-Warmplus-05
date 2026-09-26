'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getStage, type StageNo } from '@/data/stages';
import { cn } from '@/lib/cn';
import { josa } from '@/lib/josa';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';

const SIZE_PX = { sm: 40, md: 96, lg: 208 } as const;
type Size = keyof typeof SIZE_PX;

/*
 * 1단계 알: 같은 이미지를 금 간 지그재그 선을 따라 두 겹으로 나눈다.
 * - BASE: 틈(눈 포함)과 아랫껍질 → 고정
 * - LID: 윗껍질 → 위아래로 들썩
 * 좌표는 public/mascot/stage-1.png(512px)에서 측정한 값. 최종 에셋(윗껍질 분리본)을 받으면 교체한다.
 */
const LID_CLIP = 'polygon(0% 0%, 100% 0%, 100.00% 65.62%, 69.53% 65.62%, 69.14% 65.43%, 68.75% 65.04%, 68.36% 64.84%, 67.97% 64.45%, 67.58% 64.26%, 67.19% 63.87%, 66.80% 63.67%, 66.41% 63.28%, 66.02% 63.09%, 65.62% 63.28%, 65.23% 63.67%, 64.84% 64.06%, 64.45% 64.26%, 64.06% 64.65%, 63.67% 64.84%, 63.28% 65.04%, 62.89% 65.23%, 62.50% 65.43%, 62.11% 65.62%, 61.72% 65.62%, 61.33% 65.43%, 60.94% 65.23%, 60.55% 64.84%, 60.16% 64.65%, 59.77% 64.45%, 59.38% 64.06%, 58.98% 63.87%, 58.59% 63.67%, 58.20% 63.28%, 57.81% 62.89%, 57.42% 62.70%, 57.03% 62.30%, 56.64% 61.91%, 56.25% 61.72%, 55.86% 61.33%, 55.47% 61.13%, 55.08% 61.13%, 54.69% 61.33%, 54.30% 61.72%, 53.91% 61.91%, 53.52% 62.30%, 53.12% 62.50%, 52.73% 62.89%, 52.34% 63.09%, 51.95% 63.48%, 51.56% 63.67%, 51.17% 64.06%, 50.78% 64.06%, 50.39% 63.87%, 50.00% 63.67%, 49.61% 63.48%, 49.22% 63.09%, 48.83% 62.89%, 48.44% 62.70%, 48.05% 62.30%, 47.66% 62.11%, 47.27% 61.72%, 46.88% 61.33%, 46.48% 61.33%, 46.09% 61.52%, 45.70% 61.72%, 45.31% 62.11%, 44.92% 62.50%, 44.53% 62.89%, 44.14% 63.09%, 43.75% 63.48%, 43.36% 63.67%, 42.97% 64.06%, 42.58% 64.45%, 42.19% 64.65%, 41.80% 65.04%, 41.41% 65.23%, 41.02% 65.43%, 40.62% 65.43%, 40.23% 65.43%, 39.84% 65.23%, 39.45% 65.04%, 39.06% 64.65%, 38.67% 64.45%, 38.28% 64.26%, 37.89% 63.87%, 37.50% 63.67%, 37.11% 63.48%, 36.72% 63.09%, 36.33% 62.89%, 35.94% 63.09%, 35.55% 63.48%, 35.16% 63.67%, 34.77% 64.06%, 34.38% 64.26%, 33.98% 64.65%, 33.59% 64.84%, 33.20% 65.23%, 32.81% 65.43%, 32.42% 65.82%, 32.03% 65.82%, 31.64% 65.62%, 31.25% 65.43%, 30.86% 65.04%, 30.47% 64.65%, 30.08% 64.26%, 29.69% 63.87%, 29.30% 63.48%, 28.91% 63.48%, 28.52% 63.87%, 28.12% 64.26%, 27.73% 64.45%, 0.00% 64.45%)';
const BASE_CLIP = 'polygon(0.00% 64.45%, 27.73% 64.45%, 28.12% 64.26%, 28.52% 63.87%, 28.91% 63.48%, 29.30% 63.48%, 29.69% 63.87%, 30.08% 64.26%, 30.47% 64.65%, 30.86% 65.04%, 31.25% 65.43%, 31.64% 65.62%, 32.03% 65.82%, 32.42% 65.82%, 32.81% 65.43%, 33.20% 65.23%, 33.59% 64.84%, 33.98% 64.65%, 34.38% 64.26%, 34.77% 64.06%, 35.16% 63.67%, 35.55% 63.48%, 35.94% 63.09%, 36.33% 62.89%, 36.72% 63.09%, 37.11% 63.48%, 37.50% 63.67%, 37.89% 63.87%, 38.28% 64.26%, 38.67% 64.45%, 39.06% 64.65%, 39.45% 65.04%, 39.84% 65.23%, 40.23% 65.43%, 40.62% 65.43%, 41.02% 65.43%, 41.41% 65.23%, 41.80% 65.04%, 42.19% 64.65%, 42.58% 64.45%, 42.97% 64.06%, 43.36% 63.67%, 43.75% 63.48%, 44.14% 63.09%, 44.53% 62.89%, 44.92% 62.50%, 45.31% 62.11%, 45.70% 61.72%, 46.09% 61.52%, 46.48% 61.33%, 46.88% 61.33%, 47.27% 61.72%, 47.66% 62.11%, 48.05% 62.30%, 48.44% 62.70%, 48.83% 62.89%, 49.22% 63.09%, 49.61% 63.48%, 50.00% 63.67%, 50.39% 63.87%, 50.78% 64.06%, 51.17% 64.06%, 51.56% 63.67%, 51.95% 63.48%, 52.34% 63.09%, 52.73% 62.89%, 53.12% 62.50%, 53.52% 62.30%, 53.91% 61.91%, 54.30% 61.72%, 54.69% 61.33%, 55.08% 61.13%, 55.47% 61.13%, 55.86% 61.33%, 56.25% 61.72%, 56.64% 61.91%, 57.03% 62.30%, 57.42% 62.70%, 57.81% 62.89%, 58.20% 63.28%, 58.59% 63.67%, 58.98% 63.87%, 59.38% 64.06%, 59.77% 64.45%, 60.16% 64.65%, 60.55% 64.84%, 60.94% 65.23%, 61.33% 65.43%, 61.72% 65.62%, 62.11% 65.62%, 62.50% 65.43%, 62.89% 65.23%, 63.28% 65.04%, 63.67% 64.84%, 64.06% 64.65%, 64.45% 64.26%, 64.84% 64.06%, 65.23% 63.67%, 65.62% 63.28%, 66.02% 63.09%, 66.41% 63.28%, 66.80% 63.67%, 67.19% 63.87%, 67.58% 64.26%, 67.97% 64.45%, 68.36% 64.84%, 68.75% 65.04%, 69.14% 65.43%, 69.53% 65.62%, 100.00% 65.62%, 100% 100%, 0% 100%)';

const LINES_EGG = ['톡톡…', '꼼지락꼼지락', '(알 속에서 눈을 깜빡여요)'];
const LINES_BIRD = ['오늘도 와줘서 고마워요!', '천천히 해도 괜찮아요', '온기님 곁에 있을게요', '짹짹! 반가워요', '오늘 하루는 어땠어요?'];

type Props = {
  stage: StageNo;
  size: Size;
  /** 숨쉬기·뚜껑 들썩 애니메이션 */
  animated?: boolean;
  /** 누르면 폴짝 뛰며 한마디 */
  interactive?: boolean;
  /** 옆에 이름이 따로 있는 장식용이면 대체 텍스트를 비운다 */
  decorative?: boolean;
  /** 지은 이름 (누를 수 있을 때 버튼 이름에 쓴다) */
  name?: string;
  className?: string;
};

export function Mascot({
  stage,
  size,
  animated = true,
  interactive = false,
  decorative = false,
  name = DEFAULT_BIRD_NAME,
  className,
}: Props) {
  const [hopKey, setHopKey] = useState(0);
  const [line, setLine] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const info = getStage(stage);
  const px = SIZE_PX[size];
  const alt = decorative ? '' : info.name;

  function greet() {
    const lines = stage === 1 ? LINES_EGG : LINES_BIRD;
    setHopKey((k) => k + 1);
    setLine(lines[Math.floor(Math.random() * lines.length)]);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLine(null), 1800);
  }

  const body =
    stage === 1 ? (
      <Egg src={info.image} px={px} alt={alt} animated={animated} eager={size === 'lg'} />
    ) : (
      <Image
        src={info.image}
        alt={alt}
        width={px}
        height={px}
        loading={size === 'lg' ? 'eager' : 'lazy'}
        fetchPriority={size === 'lg' ? 'high' : undefined}
        draggable={false}
        className={cn('size-full select-none', animated && 'origin-bottom animate-[ongi-breathe_3.2s_ease-in-out_infinite]')}
      />
    );

  const figure = (
    <div key={hopKey} className={cn('size-full', hopKey > 0 && 'animate-[ongi-hop_0.5s_ease-out]')}>
      {body}
    </div>
  );

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: px, height: px }}>
      {line && (
        <p
          role="status"
          className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-full animate-[ongi-pop_0.2s_ease-out] rounded-2xl bg-surface px-3 py-1.5 text-sm font-medium whitespace-nowrap text-ink-900 shadow-[0_4px_16px_rgba(47,43,40,0.12)]"
        >
          {line}
        </p>
      )}
      {interactive ? (
        <button type="button" onClick={greet} aria-label={`${josa(name, '과/와')} 인사하기`} className="size-full rounded-full">
          {figure}
        </button>
      ) : (
        figure
      )}
    </div>
  );
}

function Egg({ src, px, alt, animated, eager }: { src: string; px: number; alt: string; animated: boolean; eager: boolean }) {
  return (
    <div className="relative size-full">
      {/* 뚜껑이 들리면 보이는 알 속 */}
      <div
        aria-hidden
        className="absolute"
        style={{
          left: '28.32%',
          width: '43.75%',
          top: '58.79%',
          height: '9.38%',
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, #3B2F2A 72%, rgba(59, 47, 42, 0) 100%)',
        }}
      />
      <Image
        src={src}
        alt={alt}
        width={px}
        height={px}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        draggable={false}
        className="absolute inset-0 size-full select-none"
        style={{ clipPath: BASE_CLIP }}
      />
      <Image
        src={src}
        alt=""
        aria-hidden
        width={px}
        height={px}
        loading={eager ? 'eager' : 'lazy'}
        draggable={false}
        className={cn('absolute inset-0 size-full select-none', animated && 'animate-[ongi-lid_2.8s_ease-in-out_infinite]')}
        style={{ clipPath: LID_CLIP, transformOrigin: '50% 66%' }}
      />
    </div>
  );
}
