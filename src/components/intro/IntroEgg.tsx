'use client';

import { INTRO_TOPICS } from '@/data/intro';
import { LINKS } from '@/data/links';
import type { IntroResult } from '@/lib/intro';
import { josa } from '@/lib/josa';
import { useOngi } from '@/lib/storage/useOngi';
import styles from './intro.module.css';
import { Pose } from './Pose';

const TIER_NAME = {
  1: '가벼움: 편지만 전달',
  2: '보통: 편지와 작은 미션 제안',
  3: '세심히: 편지와 24시간 도움 기관 함께 안내',
} as const;

type Props = {
  /** 지은 새 이름 */
  name: string;
  result: IntroResult;
  onStart: () => void;
  onRestart: () => void;
};

/** 6. 편지를 가방에 담고 나면: 작은 알에서 시작하는 나만의 새와 앱으로 */
export function IntroEgg({ name, result, onStart, onRestart }: Props) {
  const demoMode = useOngi((s) => s.settings.demoMode);
  const topic = INTRO_TOPICS.find((t) => t.id === result.topic);
  const withName = josa(name, '과/와');

  return (
    <section data-intro-section="egg" className={styles.eggSec} aria-labelledby="intro-egg-title">
      <Pose pose="egg" className={styles.egg} alt="둥지 속 알" />
      <h2 id="intro-egg-title">
        이제 매일 <br />
        {withName} 만나요
      </h2>
      <p>
        {josa(name, '은/는')} 작은 알에서 시작해요. <br />
        오늘의 질문과 미션으로 함께 자라요.
      </p>
      <button type="button" className={styles.primary} onClick={onStart}>
        {withName} 시작하기
      </button>

      <a className={styles.mailbox} href={LINKS.onlineLetter} target="_blank" rel="noopener noreferrer">
        <Pose pose="mailbox" />
        <p>
          <b>마음을 더 꺼내고 싶은 날이 오면</b>그땐 진짜 손편지로 보내봐요. 온기우편함에 넣으면 온기우체부가 손으로 답장을 써서 보내줘요.
        </p>
      </a>

      {demoMode && (
        <details className={styles.demo}>
          <summary>시연용 메모 · 내부 분류 결과</summary>
          <dl>
            <dt>주제 태그</dt>
            <dd>#{topic?.label}</dd>
            <dt>마음 점수</dt>
            <dd>{result.score} / 15</dd>
            <dt>안내 단계</dt>
            <dd>{TIER_NAME[result.tier]}</dd>
          </dl>
          <div>사용자 화면에는 라벨로 보여주지 않고, 편지 매칭과 안전 안내 여부를 정하는 데만 써요.</div>
        </details>
      )}
      <button type="button" className={styles.ghost} onClick={onRestart}>
        처음부터 다시 보기
      </button>
    </section>
  );
}
