'use client';

import { ArrowsClockwiseIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { MISSION_THEME_LABEL, type Mission } from '@/data/missions';
import { josa } from '@/lib/josa';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';

type Props = {
  mission: Mission;
  done: boolean;
  note?: string;
  /** 지은 이름 */
  name?: string;
  canSwap: boolean;
  onComplete: () => void;
  onSwap: () => void;
};

export function TodayMissionCard({ mission, done, note, name = DEFAULT_BIRD_NAME, canSwap, onComplete, onSwap }: Props) {
  return (
    <section aria-label="오늘의 미션" className="rounded-3xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold text-brown-600">
        오늘의 미션 · {MISSION_THEME_LABEL[mission.theme]}
      </p>
      <div className="mt-3 flex items-center gap-3.5">
        <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-3xl">
          {mission.emoji}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink-900">{mission.title}</h2>
          <p className="mt-0.5 text-sm text-ink-600">{mission.description}</p>
        </div>
      </div>

      {done ? (
        <div className="mt-5 rounded-2xl bg-yellow-100 px-4 py-3">
          <p className="flex items-center gap-1.5 text-[15px] font-bold text-ink-900">
            <CheckCircleIcon size={20} weight="fill" className="text-brown-600" aria-hidden />
            오늘 미션 완료!
          </p>
          <p className="mt-1 text-[13px] text-ink-600">{note ? `“${note}”` : `${josa(name, '이/가')} 기뻐하고 있어요.`}</p>
        </div>
      ) : (
        <>
          <Button size="lg" full className="mt-5" onClick={onComplete}>
            완료했어요
          </Button>
          {canSwap && (
            <button
              type="button"
              onClick={onSwap}
              className="mx-auto mt-2 flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-600 active:bg-black/5"
            >
              <ArrowsClockwiseIcon size={15} aria-hidden />
              다른 미션으로 바꾸기
            </button>
          )}
        </>
      )}
    </section>
  );
}
