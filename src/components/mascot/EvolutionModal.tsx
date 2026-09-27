'use client';

import { useEffect, useState } from 'react';
import { getStage, type StageNo } from '@/data/stages';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/components/ui/useModal';
import { josa } from '@/lib/josa';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';
import { Mascot } from './Mascot';

type Props = {
  open: boolean;
  from: StageNo;
  to: StageNo;
  /** 지은 이름 */
  name?: string;
  onClose: () => void;
};

/** 오목이가 자랐을 때 보여주는 전체 화면 축하 연출: 이전 모습이 흔들리다 새 모습으로 바뀐다 */
export function EvolutionModal({ open, from, to, name = DEFAULT_BIRD_NAME, onClose }: Props) {
  if (!open) return null;
  // 열릴 때마다 새로 마운트해서 '흔들림 → 등장' 연출을 처음부터 다시 보여준다
  return <EvolutionScene key={`${from}-${to}`} from={from} to={to} name={name} onClose={onClose} />;
}

function EvolutionScene({ from, to, name, onClose }: Omit<Props, 'open'> & { name: string }) {
  const [grown, setGrown] = useState(false);
  const panelRef = useModal<HTMLDivElement>(true, onClose);

  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 1100);
    return () => clearTimeout(t);
  }, []);

  const stage = getStage(to);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evolution-title"
      tabIndex={-1}
      className="fixed inset-0 z-[60] mx-auto flex max-w-[480px] animate-[ongi-fade_0.3s_ease-out] flex-col items-center justify-center bg-bg px-8 text-center outline-none"
    >
      <p className="text-sm font-semibold text-brown-600">축하해요</p>
      <h2 id="evolution-title" className="mt-1 text-2xl font-bold text-ink-900">
        {josa(name, '이/가')} 자랐어요!
      </h2>
      <div className="mt-8 grid size-[208px] place-items-center">
        {grown ? (
          <div key="after" className="animate-[ongi-grow_0.6s_ease-out]">
            <Mascot stage={to} size="lg" decorative />
          </div>
        ) : (
          <div key="before" className="animate-[ongi-wiggle_1.1s_ease-in-out]">
            <Mascot stage={from} size="lg" animated={false} decorative />
          </div>
        )}
      </div>
      <p className="mt-6 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-ink-900">
        {stage.no}단계 · {stage.name}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{stage.description}</p>
      <Button size="lg" full className="mt-10 max-w-[320px]" onClick={onClose}>
        홈에서 만나기
      </Button>
    </div>
  );
}
