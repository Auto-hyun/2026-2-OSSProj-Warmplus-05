'use client';

import { useEffect, useMemo, useRef, type PointerEvent } from 'react';
import { FAMILIES } from '@/data/music';
import type { EmotionWord } from '@/data/words';
import { cn } from '@/lib/cn';

/** 방울 지름, 방울 사이 간격, 둘레 여백(px) */
const SIZE = 76;
const STEP = SIZE + 10;
const PAD = 40;
/** 화면 가장자리에서 이 거리 안으로 들어오면 방울이 작아진다 */
const FALLOFF = SIZE;
const MIN_SCALE = 0.25;
const VIEW_HEIGHT = 380;

/** 육각 격자 좌표(axial). 가운데에서 시작해 바깥 고리로 돌며 n개 */
export function hexSpiral(n: number): { q: number; r: number }[] {
  const dirs = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ];
  const cells = [{ q: 0, r: 0 }];
  for (let ring = 1; cells.length < n; ring++) {
    let q = dirs[4][0] * ring;
    let r = dirs[4][1] * ring;
    for (const [dq, dr] of dirs) {
      for (let i = 0; i < ring; i++) {
        cells.push({ q, r });
        q += dq;
        r += dr;
      }
    }
  }
  return cells.slice(0, n);
}

function layout(count: number) {
  const points = hexSpiral(count).map(({ q, r }) => ({ x: STEP * (q + r / 2), y: STEP * (Math.sqrt(3) / 2) * r }));
  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const offset = PAD + SIZE / 2;
  return {
    points: points.map((p) => ({ x: p.x - minX + offset, y: p.y - minY + offset })),
    width: Math.max(...points.map((p) => p.x)) - minX + offset * 2,
    height: Math.max(...points.map((p) => p.y)) - minY + offset * 2,
  };
}

type Props = {
  words: readonly EmotionWord[];
  picked: string[];
  onToggle: (id: string) => void;
};

/** 애플워치 앱 화면처럼 육각으로 모인 단어 방울. 끌어서 둘러보고, 가장자리 방울은 작아진다 */
export function WordCloud({ words, picked, onToggle }: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  // 다시 그릴 때마다 새로 만들면 화면이 가운데로 되돌아간다
  const { points, width, height } = useMemo(() => layout(words.length), [words.length]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    let frame = 0;

    function update() {
      frame = 0;
      const w = view!.clientWidth;
      const h = view!.clientHeight;
      points.forEach((p, i) => {
        const cx = p.x - view!.scrollLeft;
        const cy = p.y - view!.scrollTop;
        const edge = Math.min(cx, w - cx, cy, h - cy);
        const scale = Math.min(1, Math.max(MIN_SCALE, edge / FALLOFF));
        const bubble = bubbleRefs.current[i];
        if (bubble) bubble.style.transform = `translate(-50%, -50%) scale(${scale})`;
      });
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    // 처음에는 가운데 방울이 화면 가운데에 오게
    view.scrollLeft = points[0].x - view.clientWidth / 2;
    view.scrollTop = points[0].y - view.clientHeight / 2;
    update();
    view.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      view.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [points]);

  // 터치는 브라우저 스크롤로 움직이고, 마우스는 끌어서 움직인다
  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    const view = viewRef.current!;
    drag.current = { x: e.clientX, y: e.clientY, left: view.scrollLeft, top: view.scrollTop, moved: false };
  }
  function onPointerMove(e: PointerEvent) {
    const d = drag.current;
    if (!d || e.buttons !== 1) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    viewRef.current!.scrollLeft = d.left - dx;
    viewRef.current!.scrollTop = d.top - dy;
  }

  return (
    <div
      ref={viewRef}
      role="group"
      aria-label="감정 단어"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => setTimeout(() => (drag.current = null))}
      onPointerLeave={() => (drag.current = null)}
      // 끌다가 놓을 때 방울이 눌리지 않게
      onClickCapture={(e) => {
        if (drag.current?.moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className="-mx-4 cursor-grab overflow-auto overscroll-contain select-none [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      style={{ height: VIEW_HEIGHT }}
    >
      <div className="relative" style={{ width, height }}>
        {words.map((w, i) => {
          const on = picked.includes(w.id);
          return (
            <button
              key={w.id}
              ref={(el) => {
                bubbleRefs.current[i] = el;
              }}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(w.id)}
              className={cn(
                'absolute grid place-items-center rounded-full text-[15px] font-semibold transition-colors',
                on ? 'bg-ink-900 text-white shadow-md' : 'border border-black/5 text-ink-900',
              )}
              style={{
                left: points[i].x,
                top: points[i].y,
                width: SIZE,
                height: SIZE,
                transform: 'translate(-50%, -50%)',
                backgroundColor: on ? undefined : FAMILIES[w.family].tint,
              }}
            >
              {w.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
