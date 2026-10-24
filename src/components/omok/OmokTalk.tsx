'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Omok, type Pose } from './Omok';

export type TalkReply = { label: string; href?: string; onSelect?: () => void; primary?: boolean };

type Props = {
  /** 오목이가 건네는 말 (한 마디) */
  line: string;
  /** 내 대답 버튼 */
  replies?: TalkReply[];
  pose?: Pose;
  /** lg: 가운데 큰 오목이 위에 말풍선, sm: 왼쪽 작은 오목이 옆에 말풍선 */
  size?: 'lg' | 'sm';
  /** lg일 때 오목이 그림 높이(px) */
  height?: number;
  /** lg일 때 오목이 그림을 누르면 갈 곳 (예: 대화) */
  omokHref?: string;
  className?: string;
};

/** 오목이가 말풍선으로 한 마디 건넨다. 대답 버튼을 붙일 수 있다 */
export function OmokTalk({ line, replies = [], pose = 'hello', size = 'lg', height = 110, omokHref, className }: Props) {
  const answers = replies.length > 0 && (
    <div className={cn('flex flex-wrap gap-2', size === 'lg' ? 'mt-4 justify-center' : 'mt-2.5 justify-end')}>
      {replies.map((reply) => {
        const style = cn(
          'inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors',
          reply.primary ? 'bg-yellow-500 text-ink-900 active:brightness-95' : 'border border-line bg-surface text-ink-900 active:bg-yellow-100',
        );
        return reply.href ? (
          <Link key={reply.label} href={reply.href} onClick={reply.onSelect} className={style}>
            {reply.label}
          </Link>
        ) : (
          <button key={reply.label} type="button" onClick={reply.onSelect} className={style}>
            {reply.label}
          </button>
        );
      })}
    </div>
  );

  if (size === 'sm') {
    return (
      <div className={cn('flex gap-2.5', className)}>
        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface">
          <Omok pose={pose} height={36} className="translate-y-0.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            key={line}
            aria-live="polite"
            className="animate-[omok-pop_0.2s_ease-out] rounded-2xl rounded-tl-md border border-line bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed"
          >
            {line}
          </p>
          {answers}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <p
        key={line}
        aria-live="polite"
        className="relative max-w-[320px] animate-[omok-pop_0.2s_ease-out] rounded-2xl border border-line bg-surface px-4 py-2.5 text-center text-[15px] leading-relaxed font-medium"
      >
        {line}
        <span aria-hidden className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r border-b border-line bg-surface" />
      </p>
      {omokHref ? (
        <Link href={omokHref} aria-label="오목이와 대화하기" className="mt-3 rounded-3xl active:scale-95 transition-transform">
          <Omok pose={pose} height={height} animated eager />
        </Link>
      ) : (
        <Omok pose={pose} height={height} animated eager decorative={false} className="mt-3" />
      )}
      {answers}
    </div>
  );
}
