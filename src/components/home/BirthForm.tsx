'use client';

import { useState, type FormEvent } from 'react';
import { CaretRightIcon } from '@phosphor-icons/react';
import { isValidDayKey, todayKey } from '@/lib/date';
import type { Birth } from '@/lib/fortune';
import { useStore } from '@/lib/storage/useApp';

type Props = {
  initial: Birth | null;
  onDone?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
};

/** 생년월일(필수)과 태어난 시각(모르면 비움). 이 기기에만 저장한다. 오하아사·마이페이지에서 같이 쓴다 */
export function BirthForm({ initial, onDone, onCancel, submitLabel = '저장' }: Props) {
  const store = useStore();
  const [date, setDate] = useState(initial?.date ?? '');
  const [time, setTime] = useState(initial?.time ?? '');
  const [unknownTime, setUnknownTime] = useState(initial ? initial.time === null : false);
  const max = todayKey();
  const valid = isValidDayKey(date) && date <= max && date >= '1900-01-01' && (unknownTime || /^\d{2}:\d{2}$/.test(time));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    store.setBirth({ date, time: unknownTime ? null : time });
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-cocoa-900">생년월일</span>
        <input
          type="date"
          required
          min="1900-01-01"
          max={max}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-[42px] w-full min-w-0 rounded-2xl border border-cream-line bg-bg px-4 text-[15px] text-cocoa-900"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-cocoa-900">태어난 시각</span>
        <input
          type="time"
          value={unknownTime ? '' : time}
          disabled={unknownTime}
          required={!unknownTime}
          onChange={(e) => setTime(e.target.value)}
          className="h-[42px] w-full min-w-0 rounded-2xl border border-cream-line bg-bg px-4 text-[15px] text-cocoa-900 disabled:bg-cream disabled:text-taupe-500"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-cocoa-900">
        <input type="checkbox" checked={unknownTime} onChange={(e) => setUnknownTime(e.target.checked)} className="size-5 accent-leaf-600" />
        태어난 시각을 몰라요
      </label>
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="h-12 rounded-full border border-cream-line bg-surface px-5 text-[15px] font-bold text-cocoa-900 active:bg-black/5">
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-leaf-600 text-[16px] font-bold text-white transition-transform active:scale-[0.98] disabled:bg-line disabled:text-ink-400"
        >
          {submitLabel}
          <CaretRightIcon size={16} aria-hidden />
        </button>
      </div>
    </form>
  );
}
