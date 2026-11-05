'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { particle } from '@/lib/josa';
import type { PendingSong } from '@/lib/storage/types';

const NOTES = [
  { char: '♪', left: '22%', delay: '0s', drift: '-14px' },
  { char: '♫', left: '70%', delay: '0.7s', drift: '16px' },
  { char: '♩', left: '45%', delay: '1.4s', drift: '-6px' },
  { char: '♬', left: '82%', delay: '2.1s', drift: '10px' },
];

function elapsedLabel(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 작곡을 기다리는 화면. 완성 확인은 SongWatcher가 한다 */
export function Composing({ pending }: { pending: PendingSong }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center rounded-[24px] border border-cream-line bg-surface px-5 pt-6 pb-7 text-center">
      <div className="relative">
        {NOTES.map((n) => (
          <span
            key={n.char}
            aria-hidden
            className="absolute top-2 animate-[omok-note_2.8s_ease-out_infinite] text-2xl text-leaf-600 opacity-0"
            style={{ left: n.left, animationDelay: n.delay, ['--drift' as string]: n.drift }}
          >
            {n.char}
          </span>
        ))}
        <Image
          src="/village/composer/guitar.webp"
          alt=""
          width={170}
          height={170}
          preload
          className="size-[136px] origin-bottom motion-safe:animate-[omok-sway_1.6s_ease-in-out_infinite]"
        />
      </div>
      <p role="status" className="mt-3 text-base font-bold text-cocoa-900">
        ‘{pending.title}’{particle(pending.title, '을/를')} 만들고 있어요
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-taupe-500">
        {pending.mode === 'suno' ? '1~3분쯤 걸려요. 다른 탭에 다녀와도 돼요.' : '잠깐이면 돼요.'}
      </p>
      <p className="mt-4 text-[13px] text-taupe-500 tabular-nums">{elapsedLabel(now - new Date(pending.startedAt).getTime())}</p>
    </div>
  );
}
