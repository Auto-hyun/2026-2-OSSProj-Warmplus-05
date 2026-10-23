'use client';

import { useState, type FormEvent } from 'react';
import { isValidDayKey, todayKey } from '@/lib/date';
import type { Birth } from '@/lib/fortune';
import { useStore } from '@/lib/storage/useApp';

type Props = {
  initial: Birth | null;
  onDone?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
};

/** 생년월일(필수)과 태어난 시각(모르면 비움). 이 기기에만 저장한다 */
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
    <form onSubmit={submit} className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <label className="block min-w-0">
          <span className="mb-1 block text-xs font-semibold text-ink-600">생년월일</span>
          <input
            type="date"
            required
            min="1900-01-01"
            max={max}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-[15px]"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-xs font-semibold text-ink-600">태어난 시각</span>
          <input
            type="time"
            value={unknownTime ? '' : time}
            disabled={unknownTime}
            required={!unknownTime}
            onChange={(e) => setTime(e.target.value)}
            className="h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-[15px] disabled:bg-bg disabled:text-ink-400"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex flex-1 items-center gap-1.5 text-sm text-ink-600">
          <input type="checkbox" checked={unknownTime} onChange={(e) => setUnknownTime(e.target.checked)} className="size-4 accent-ink-900" />
          시각을 몰라요
        </label>
        {onCancel && (
          <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-line bg-surface px-4 text-sm font-bold active:bg-black/5">
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={!valid}
          className="h-10 rounded-xl bg-yellow-500 px-5 text-sm font-bold text-ink-900 active:brightness-95 disabled:bg-line disabled:text-ink-400"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
