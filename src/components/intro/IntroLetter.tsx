'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { ARRIVE_LINES } from '@/data/intro';
import { HELPLINES } from '@/data/helplines';
import { cn } from '@/lib/cn';
import { formatDotDate } from '@/lib/date';
import { josa } from '@/lib/josa';
import type { IntroResult } from '@/lib/intro';
import { extractEmoji, type Letter } from '@/lib/letters';
import styles from './intro.module.css';
import { prefersReducedMotion } from './motion';
import { Pose } from './Pose';

type Props = {
  /** 지은 새 이름 */
  name: string;
  result: IntroResult;
  letter: Letter;
  bagged: boolean;
  onBag: () => void;
};

/** 5. 먼저 도착한 편지: 온기레터에 실린 실제 고민과 답장 구절, 그리고 오목이 가방 */
export function IntroLetter({ name, result, letter, bagged, onBag }: Props) {
  const worry = useRef<HTMLElement>(null);
  const reply = useRef<HTMLElement>(null);
  const bagBird = useRef<HTMLImageElement>(null);
  // 화면에 들어왔는지 알 수 없는 브라우저면 처음부터 펼쳐 둔다
  const [open, setOpen] = useState(() => {
    const unfolded = typeof IntersectionObserver === 'undefined';
    return { worry: unfolded, reply: unfolded };
  });
  const [bounce, setBounce] = useState(0);
  /** 편지가 가방으로 날아가는 중 (그동안 다시 누르지 못하게) */
  const [sending, setSending] = useState(false);

  // 편지가 화면에 들어오면 한 번 펼친다
  useEffect(() => {
    const papers: [keyof typeof open, HTMLElement | null][] = [
      ['worry', worry.current],
      ['reply', reply.current],
    ];
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const key = papers.find(([, el]) => el === entry.target)?.[0];
          if (key) setOpen((prev) => ({ ...prev, [key]: true }));
          observer.unobserve(entry.target);
        }),
      { threshold: 0.25 },
    );
    papers.forEach(([, el]) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [letter.id]);

  async function bag() {
    if (bagged || sending) return;
    setSending(true);
    const from = reply.current?.getBoundingClientRect();
    const to = bagBird.current?.getBoundingClientRect();
    if (!prefersReducedMotion() && from && to && typeof document.body.animate === 'function') {
      // 편지 봉투가 오목이 가방으로 날아간다
      const env = document.createElement('div');
      env.className = styles.flyenv;
      document.body.appendChild(env);
      const sx = from.left + from.width / 2 - 30;
      const sy = Math.max(from.top + 40, 20);
      const ex = to.left + to.width * 0.22;
      const ey = to.top + to.height * 0.62;
      await env.animate(
        [
          {
            transform: `translate(${sx}px,${sy}px) scale(1.6) rotate(-6deg)`,
            opacity: 0,
          },
          {
            transform: `translate(${(sx + ex) / 2}px,${Math.min(sy, ey) - 80}px) scale(1.1) rotate(8deg)`,
            opacity: 1,
            offset: 0.5,
          },
          {
            transform: `translate(${ex}px,${ey}px) scale(.4) rotate(0deg)`,
            opacity: 0.2,
          },
        ],
        { duration: 900, easing: 'cubic-bezier(.3,.7,.3,1)' },
      ).finished;
      env.remove();
    }
    setBounce((n) => n + 1);
    onBag();
  }

  const stamp = extractEmoji(letter.title) ?? '💌';
  const title = letter.title.replace(stamp, '').trim();

  return (
    <section className={styles.letterSec} aria-label="먼저 도착한 편지">
      <div className={styles.arrive}>
        <Pose pose="book" />
        <p>{ARRIVE_LINES[result.tier]}</p>
      </div>

      <article ref={worry} className={cn(styles.paper, !open.worry && styles.fold)}>
        <div className={styles.stamp} aria-hidden>
          {stamp}
        </div>
        <p className={styles.ph}>온기우편함에 도착했던 고민 편지</p>
        <h3>{title}</h3>
        <p className={styles.meta}>온기레터 · {formatDotDate(letter.sentAt)}</p>
      </article>
      <article ref={reply} className={cn(styles.paper, styles.replyPaper, !open.reply && styles.fold)}>
        <p className={styles.ph}>그리고 이 편지에 도착한 손편지 답장 중에서</p>
        <p className={styles.body}>{letter.preview}</p>
        <p className={styles.sign}>온기우체부 드림</p>
        <a href={`/letters/${letter.id}`} target="_blank" rel="noopener noreferrer" className={styles.readAll}>
          편지 전체 읽기
          <ArrowUpRightIcon size={16} aria-hidden />
        </a>
      </article>
      <p className={styles.note}>
        이 편지는 온기레터에 실린 실제 고민과 답장이에요. 비슷한 고민에 온기우체부가 보낸 답장을 끝까지 읽어 보세요.
      </p>

      {result.tier === 3 && (
        <div className={styles.care}>
          <p>
            오늘 마음이 많이 무거워 보여서 {josa(name, '이/가')} 하나 더 챙겨왔어. 편지는 답장까지 시간이 걸리니까, 지금 바로 누군가와
            이야기하고 싶다면 여기로 연락해도 돼.
          </p>
          {HELPLINES.slice(0, 2).map((line) => (
            <a key={line.number} href={`tel:${line.number.replace(/[^0-9]/g, '')}`}>
              <span>
                {line.name} ({line.note})
              </span>
              <b>{line.number}</b>
            </a>
          ))}
        </div>
      )}

      <div className={styles.bag}>
        <p className={styles.bagQ}>
          이 편지, {name} 가방에 <br />
          담아둘까?
        </p>
        <Pose
          key={bounce}
          ref={bagBird}
          pose="mailman"
          className={cn(styles.bagBird, bounce > 0 && styles.bounce)}
          alt={`가방을 멘 우체부 ${name}`}
        />
        <button type="button" className={styles.primary} onClick={bag} disabled={bagged || sending}>
          {bagged ? '가방에 담았어요' : '가방에 담아두기'}
        </button>
      </div>
    </section>
  );
}
