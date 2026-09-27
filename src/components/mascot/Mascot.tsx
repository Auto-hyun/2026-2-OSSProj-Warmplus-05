'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getStage, type StageNo } from '@/data/stages';
import { cn } from '@/lib/cn';
import { josa } from '@/lib/josa';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';

const SIZE_PX = { sm: 40, md: 96, lg: 208 } as const;
type Size = keyof typeof SIZE_PX;

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

  const body = (
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
