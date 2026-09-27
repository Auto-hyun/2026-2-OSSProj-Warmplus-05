'use client';

import { Fragment, useRef, useState } from 'react';
import { MEET_LINES } from '@/data/intro';
import { cn } from '@/lib/cn';
import { withBirdName } from '@/lib/intro';
import styles from './intro.module.css';
import { sceneProgress, useScrollFrame } from './motion';
import { Pose } from './Pose';

/** 2. 오목이와 인사: 스크롤하며 말풍선이 세 번 바뀐다 */
export function IntroMeet({ name }: { name: string }) {
  const scene = useRef<HTMLElement>(null);
  const bird = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState(0);

  useScrollFrame(() => {
    if (!scene.current) return;
    const p = sceneProgress(scene.current);
    setPhase(p < 0.34 ? 0 : p < 0.67 ? 1 : 2);
    if (bird.current) bird.current.style.transform = `translateY(${Math.sin(p * Math.PI * 6) * 6}px)`;
  });

  const line = MEET_LINES[phase];
  return (
    <section ref={scene} className={cn(styles.scene, styles.meet)} aria-label={`${name} 소개`}>
      <div className={cn(styles.stage, styles.meetStage)}>
        <div className={styles.bubble} aria-live="polite">
          {/* 문장이 바뀔 때마다 새로 그려 등장 연출을 다시 보여준다 */}
          <p key={phase}>
            {line.lines.map((text, i) => (
              <Fragment key={text}>
                {i > 0 && (
                  <>
                    {' '}
                    <br />
                  </>
                )}
                {withBirdName(text, name)}
              </Fragment>
            ))}
            <small>{line.sub}</small>
          </p>
        </div>
        <Pose ref={bird} pose={line.pose} className={styles.meetBird} alt={`흰머리오목눈이 ${name}`} />
        <div className={styles.meetName}>{name}</div>
        <div className={styles.pdots} aria-hidden>
          {MEET_LINES.map((_, k) => (
            <i key={k} className={k === phase ? styles.on : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}
