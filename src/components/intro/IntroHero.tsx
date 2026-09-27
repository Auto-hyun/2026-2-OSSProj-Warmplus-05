'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './intro.module.css';
import { ease, lerp, sceneProgress, seg, useScrollFrame } from './motion';
import { Pose } from './Pose';

/** 1. 편지 도착: 스크롤하면 오목이가 날아와 봉투를 열고, 카드가 앞으로 나온다 */
export function IntroHero({ name }: { name: string }) {
  const scene = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const peek = useRef<HTMLImageElement>(null);
  const fly = useRef<HTMLImageElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const perch = useRef<HTMLImageElement>(null);

  useScrollFrame(() => {
    const els = [scene, copy, hint, peek, fly, wrap, back, front, flap, seal, card, perch].map((r) => r.current);
    if (els.some((el) => !el)) return;
    const p = sceneProgress(scene.current!);
    const W = Math.min(window.innerWidth, 480);
    const H = window.innerHeight;

    copy.current!.style.opacity = String(1 - seg(p, 0.03, 0.13));
    copy.current!.style.transform = `translateY(${-30 * seg(p, 0.03, 0.13)}px)`;
    hint.current!.style.opacity = String(1 - seg(p, 0.02, 0.08));
    peek.current!.style.transform = `translateX(${110 * seg(p, 0.02, 0.09)}%)`;

    const f = ease(seg(p, 0.06, 0.28));
    fly.current!.style.opacity = String(p < 0.06 ? 0 : 1 - seg(p, 0.28, 0.32));
    fly.current!.style.transform = `translate(${lerp(W * 0.7, 0, f)}px, ${lerp(-H * 0.5, H * 0.06, f) + Math.sin(f * Math.PI * 3) * 14}px) rotate(${lerp(-16, 0, f)}deg) scale(${lerp(0.45, 1, f)})`;

    const a = ease(seg(p, 0.28, 0.34));
    wrap.current!.style.opacity = String(a);
    wrap.current!.style.transform = `translateY(${lerp(-40, 0, a)}px) scale(${lerp(0.55, 1, a)})`;

    const open = seg(p, 0.38, 0.5);
    const leave = ease(seg(p, 0.72, 0.88));
    flap.current!.style.transform = `translateY(${160 * leave}px) perspective(700px) rotateX(${180 * open}deg)`;
    flap.current!.style.zIndex = open > 0.5 ? '1' : '4';
    seal.current!.style.opacity = String(1 - seg(p, 0.36, 0.4));
    seal.current!.style.transform = `scale(${1 + 0.3 * seg(p, 0.36, 0.4)})`;

    const pull = ease(seg(p, 0.52, 0.68));
    const forward = ease(seg(p, 0.7, 0.86));
    card.current!.style.zIndex = forward > 0 ? '6' : '2';
    card.current!.style.transform = `translateY(${-150 * pull + 108 * forward}px) scale(${lerp(1, 1.2, forward)}) rotate(${lerp(0, -1.5, forward)}deg)`;
    for (const el of [back.current!, front.current!, flap.current!]) el.style.opacity = String(1 - leave);
    back.current!.style.transform = front.current!.style.transform = `translateY(${160 * leave}px)`;

    perch.current!.style.opacity = String(seg(p, 0.31, 0.35));
    const hop = ease(seg(p, 0.54, 0.68));
    const land = ease(seg(p, 0.72, 0.88));
    const envTop = 0.58 * H - 98;
    const base = 0.5 * H - 59;
    const y1 = envTop + 6 - base;
    const y2 = envTop - 132 - base;
    const y3 = envTop - 58 - base;
    const py = lerp(lerp(y1, y2, hop), y3, land) - 22 * Math.sin(hop * Math.PI) - 16 * Math.sin(land * Math.PI);
    perch.current!.style.transform = `translate(${lerp(0, 30, land)}px, ${py}px) rotate(${lerp(0, 6, land)}deg)`;
  });

  return (
    <section ref={scene} className={cn(styles.scene, styles.hero)} aria-label={`${name}의 편지 도착`}>
      <div className={styles.stage}>
        <div ref={copy} className={styles.heroCopy}>
          {/* 줄바꿈 앞 공백: 화면 읽기 프로그램이 줄을 붙여 읽지 않게 */}
          <h1>
            똑똑, <br />
            오늘 당신에게 <br />
            도착한 게 있어요.
          </h1>
          <p>천천히 아래로 내려서 받아보세요.</p>
        </div>
        <Pose ref={peek} pose="peek" className={styles.peek} eager />
        <Pose ref={fly} pose="fly" className={styles.flybird} eager />
        <div ref={wrap} className={styles.envwrap}>
          <div ref={back} className={styles.envBack} />
          <div ref={card} className={styles.card}>
            <div className={styles.to}>To. 오늘의 당신</div>
            <div className={styles.big}>
              요즘 마음, <br />
              괜찮았어요?
            </div>
            <p className={styles.small}>잘 모르겠다면, 3분만 같이 돌아봐요.</p>
            <div className={styles.from}>from. {name}</div>
          </div>
          <div ref={front} className={styles.envFront}>
            <svg viewBox="0 0 300 196" preserveAspectRatio="none" aria-hidden>
              <path d="M0 12 Q0 0 12 0 L150 112 L288 0 Q300 0 300 12 V184 Q300 196 288 196 H12 Q0 196 0 184 Z" fill="var(--env)" />
              <path d="M4 190 L150 92 L296 190" fill="none" stroke="var(--env-edge)" strokeWidth="1.5" opacity=".7" />
            </svg>
          </div>
          <div ref={flap} className={styles.flap}>
            <svg viewBox="0 0 300 122" preserveAspectRatio="none" aria-hidden>
              <path
                d="M12 0 H288 Q300 0 292 9 L162 114 Q150 124 138 114 L8 9 Q0 0 12 0 Z"
                fill="var(--env-2)"
                stroke="var(--env-edge)"
                strokeWidth="1.2"
              />
            </svg>
          </div>
          <div ref={seal} className={styles.seal}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z" fill="#f08a8a" />
            </svg>
          </div>
        </div>
        <Pose ref={perch} pose="wings" className={styles.perch} />
        <div ref={hint} className={styles.hint}>
          <b aria-hidden>↓</b>스크롤
        </div>
      </div>
    </section>
  );
}
