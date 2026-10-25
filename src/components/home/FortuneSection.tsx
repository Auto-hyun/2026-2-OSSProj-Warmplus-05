'use client';

import { useState } from 'react';
import { CaretDownIcon, SunIcon } from '@phosphor-icons/react';
import { todayKey } from '@/lib/date';
import { fortuneFor, zodiacRanking, type Birth } from '@/lib/fortune';
import { cn } from '@/lib/cn';
import { useApp } from '@/lib/storage/useApp';
import { BirthForm } from './BirthForm';

/** 오하아사: 생년월일·태어난 시각을 받으면 오늘의 별자리 순위, 운세, 럭키 아이템을 보여 준다 (Figma 카드 모양) */
export function FortuneSection() {
  const birth = useApp((s) => s.profile.birth);
  const [editing, setEditing] = useState(false);

  if (birth === undefined) return <div className="h-80 rounded-[24px] bg-surface/60" />;

  // 생일을 아직 모르거나 바꾸는 중: 생일 입력 카드
  if (!birth || editing) {
    return (
      <section aria-labelledby="fortune-title" className="rounded-[24px] border border-cream-line bg-surface p-[18px]">
        <div className="mb-4 flex items-start gap-3">
          <SunIcon size={34} weight="light" className="shrink-0 text-[#c9a46b]" aria-hidden />
          <div>
            <h2 id="fortune-title" className="text-lg font-bold text-cocoa-900">
              생일 정보를 알려주세요
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-taupe-500">정확한 별자리 풀이를 위해 생년월일과
              <br />
              태어난 시각을 입력해 주세요.</p>
          </div>
        </div>
        <BirthForm
          initial={birth}
          submitLabel="오늘의 순위 보기"
          onDone={() => setEditing(false)}
          onCancel={birth ? () => setEditing(false) : undefined}
        />
        <p className="mt-4 text-center text-xs text-taupe-500">재미로 즐기는 오늘의 별자리 콘텐츠예요.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="fortune-title" className="rounded-[24px] border border-cream-line bg-surface p-4 shadow-[0_6px_18px_rgba(75,46,32,0.05)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="fortune-title" className="text-lg font-bold text-cocoa-900">
          오늘의 별자리 순위
        </h2>
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-taupe-500 underline underline-offset-2">
          생일 바꾸기
        </button>
      </div>
      <FortuneCard birth={birth} />
    </section>
  );
}

function FortuneCard({ birth }: { birth: Birth }) {
  const today = todayKey();
  const f = fortuneFor(birth, today);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-4 rounded-2xl bg-cream p-4">
        <p className="w-14 shrink-0 text-center text-4xl font-extrabold">
          {f.rank}
          <span className="text-base font-bold">위</span>
        </p>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-leaf-600">
            {f.zodiac.emoji} {f.zodiac.name} · {f.rankLabel}
          </p>
          <p className="mt-1 font-bold">{f.luck}</p>
          <p className="text-[15px] text-ink-600">{f.advice}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2.5 rounded-2xl border border-cream-line px-3 py-2.5">
          <span className="text-2xl" aria-hidden>
            {f.item.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ink-400">럭키 아이템</p>
            <p className="truncate font-bold">{f.item.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-cream-line px-3 py-2.5">
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
                z.id === f.zodiac.id ? 'bg-cream font-bold' : 'text-taupe-500',
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
