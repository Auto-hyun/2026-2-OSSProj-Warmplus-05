'use client';

import { Fragment, useRef, useState } from 'react';
import { INTRO_TOPICS, SEARCH_LINES } from '@/data/intro';
import { cn } from '@/lib/cn';
import styles from './intro.module.css';
import { ease, lerp, sceneProgress, seg, useScrollFrame } from './motion';
import { Pose } from './Pose';

const TAGS = INTRO_TOPICS.map((t) => `#${t.label}`);

/** 4. 편지함 뒤지기: 편지 선반이 흘러가고, 닮은 편지를 찾아낸다 */
export function IntroSearch({ name, topicLabel }: { name: string; topicLabel: string }) {
  const scene = useRef<HTMLElement>(null);
  const shelf = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const found = useRef<HTMLDivElement>(null);
  const bird = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState(0);
  const [gotIt, setGotIt] = useState(false);

  useScrollFrame(() => {
    if (!scene.current || !shelf.current || !row.current || !found.current || !bird.current) return;
    const p = sceneProgress(scene.current);
    const W = Math.min(window.innerWidth, 480);
    row.current.style.transform = `translateX(${-p * 1500 + W * 0.2}px)`;
    setPhase(p < 0.3 ? 0 : p < 0.7 ? 1 : 2);
    const f = ease(seg(p, 0.72, 0.86));
    found.current.style.opacity = String(f);
    shelf.current.style.opacity = String(1 - 0.85 * f);
    found.current.style.transform = `translateY(${lerp(80, 0, f)}px) scale(${lerp(0.5, 1, f)}) rotate(${lerp(-10, -3, f)}deg)`;
    bird.current.style.transform = `translateX(${Math.sin(p * Math.PI * 5) * 26 * (1 - f)}px) rotate(${Math.sin(p * Math.PI * 10) * 4 * (1 - f)}deg)`;
    setGotIt(f > 0.5);
  });

  return (
    <section ref={scene} data-intro-section="search" className={cn(styles.scene, styles.search)} aria-label="닮은 편지 찾는 중">
      <div className={cn(styles.stage, styles.searchStage)}>
        <p className={styles.searchText} aria-live="polite">
          {SEARCH_LINES[phase].map((text, i) => (
            <Fragment key={text}>
              {i > 0 && (
                <>
                  {' '}
                  <br />
                </>
              )}
              {text}
            </Fragment>
          ))}
        </p>
        <div ref={shelf} className={styles.shelf}>
          <div ref={row} className={styles.shelfRow}>
            {[...TAGS, ...TAGS, ...TAGS].map((tag, i) => (
              <div key={i} className={styles.mini}>
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div ref={found} className={styles.found}>
          <span className={styles.dot} aria-hidden>
            !
          </span>
          <span>#{topicLabel}</span>
        </div>
        <Pose ref={bird} pose={gotIt ? 'wings' : 'search'} className={styles.searchBird} alt={`돋보기로 편지를 찾는 ${name}`} />
      </div>
    </section>
  );
}
