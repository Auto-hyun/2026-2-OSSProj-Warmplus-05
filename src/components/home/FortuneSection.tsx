'use client';

import { useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import { todayKey } from '@/lib/date';
import { fortuneFor, zodiacRanking, type Birth } from '@/lib/fortune';
import { cn } from '@/lib/cn';
import { useApp } from '@/lib/storage/useApp';
import { BirthForm } from './BirthForm';

/** 오하아사: 생년월일·태어난 시각을 받으면 오늘의 별자리 순위, 운세, 럭키 아이템을 보여 준다 */
export function FortuneSection() {
  const birth = useApp((s) => s.profile.birth);
  const [editing, setEditing] = useState(false);

  if (birth === undefined) return <div className="h-40 rounded-3xl bg-surface/60" />;

  const showForm = !birth || editing;
  return (
    <section aria-labelledby="fortune-title" className="rounded-3xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="fortune-title" className="text-lg font-bold">
          오하아사 <span className="text-sm font-medium text-ink-400">오늘의 별자리 순위</span>
        </h2>
        {birth && !editing && (
          <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-ink-400 underline underline-offset-2">
            생일 바꾸기
          </button>
        )}
      </div>
      {showForm ? (
        <BirthForm
          initial={birth}
          submitLabel="순위 보기"
          onDone={() => setEditing(false)}
          onCancel={birth ? () => setEditing(false) : undefined}
        />
      ) : (
        <FortuneCard birth={birth} />
      )}
    </section>
  );
}

function FortuneCard({ birth }: { birth: Birth }) {
  const today = todayKey();
  const f = fortuneFor(birth, today);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-4 rounded-2xl bg-yellow-100 p-4">
        <p className="w-14 shrink-0 text-center text-4xl font-extrabold">
          {f.rank}
          <span className="text-base font-bold">위</span>
        </p>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brown-600">
            {f.zodiac.emoji} {f.zodiac.name} · {f.rankLabel}
          </p>
          <p className="mt-1 font-bold">{f.luck}</p>
          <p className="text-[15px] text-ink-600">{f.advice}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2.5 rounded-2xl border border-line px-3 py-2.5">
          <span className="text-2xl" aria-hidden>
            {f.item.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ink-400">럭키 아이템</p>
            <p className="truncate font-bold">{f.item.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-line px-3 py-2.5">
          <span aria-hidden className="size-7 shrink-0 rounded-full border border-black/5" style={{ backgroundColor: f.color.hex }} />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ink-400">럭키 컬러</p>
            <p className="truncate font-bold">{f.color.name}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center gap-1 py-1 text-sm font-semibold text-ink-600"
      >
        전체 순위
        <CaretDownIcon size={14} weight="bold" className={cn('transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <ol className="grid animate-[omok-fade_0.2s_ease-out] grid-flow-col grid-cols-2 grid-rows-6 gap-x-2 gap-y-1">
          {zodiacRanking(today).map((z, i) => (
            <li
              key={z.id}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm',
                z.id === f.zodiac.id ? 'bg-yellow-100 font-bold' : 'text-ink-600',
              )}
            >
              <span className="w-5 text-right font-bold tabular-nums">{i + 1}</span>
              <span aria-hidden>{z.emoji}</span>
              {z.name}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
