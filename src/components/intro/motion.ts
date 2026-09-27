'use client';

import { useEffect, useRef } from 'react';

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** p가 a~b 구간을 얼마나 지났는지 0~1 */
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** 키 큰 장면(섹션)을 스크롤로 얼마나 지나왔는지 0~1 */
export function sceneProgress(el: HTMLElement): number {
  const length = el.offsetHeight - window.innerHeight;
  return length > 0 ? clamp(-el.getBoundingClientRect().top / length) : 0;
}

/** 스크롤·창 크기가 바뀔 때 한 프레임에 한 번 부른다 (처음 한 번도) */
export function useScrollFrame(callback: () => void) {
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback;
  });
  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      latest.current();
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    run();
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      cancelAnimationFrame(frame);
    };
  }, []);
}
