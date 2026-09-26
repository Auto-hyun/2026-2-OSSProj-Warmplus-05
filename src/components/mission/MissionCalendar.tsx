'use client';

import { CaretLeftIcon, CaretRightIcon, FootprintsIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { monthGrid, type DayKey } from '@/lib/date';
import type { MissionRecord } from '@/lib/storage/types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  year: number;
  month: number;
  today: DayKey;
  records: Record<DayKey, MissionRecord>;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPickDay: (key: DayKey) => void;
};

/** 월별 미션 달력. 완료한 날엔 발자국 도장, 못 한 날은 아무 표시 없이 비워 둔다 */
export function MissionCalendar({ year, month, today, records, canGoNext, onPrev, onNext, onPickDay }: Props) {
  const cells = monthGrid(year, month);

  return (
    <section aria-label="미션 캘린더">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink-900">
          {year}년 {month}월
        </h2>
        <div className="-mr-2 flex">
          <button type="button" aria-label="이전 달" onClick={onPrev} className="grid size-11 place-items-center rounded-full text-ink-600 active:bg-black/5">
            <CaretLeftIcon size={18} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="다음 달"
            onClick={onNext}
            disabled={!canGoNext}
            className="grid size-11 place-items-center rounded-full text-ink-600 active:bg-black/5 disabled:opacity-30"
          >
            <CaretRightIcon size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-xs text-ink-400">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-1.5">
        {cells.map((key, i) => {
          if (!key) return <span key={`empty-${i}`} />;
          const day = Number(key.slice(8));
          const done = Boolean(records[key]);
          const isToday = key === today;
          const future = key > today;
          const label = `${month}월 ${day}일${done ? ', 미션 완료' : ''}${isToday ? ', 오늘' : ''}`;
          const circle = cn(
            'mx-auto grid size-9 place-items-center rounded-full',
            done ? 'bg-yellow-500 text-ink-900' : future ? 'text-ink-400/60' : 'text-ink-600',
            isToday && 'ring-2 ring-brown-600/45 ring-offset-2 ring-offset-bg',
          );
          const inner = done ? <FootprintsIcon size={18} weight="fill" aria-hidden /> : <span className="text-sm">{day}</span>;

          return done ? (
            <button
              key={key}
              type="button"
              aria-label={label}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => onPickDay(key)}
              className="flex flex-col items-center gap-0.5"
            >
              <span className={circle}>{inner}</span>
              <span aria-hidden className="text-[10px] text-ink-400">
                {day}
              </span>
            </button>
          ) : (
            <div key={key} aria-label={label} aria-current={isToday ? 'date' : undefined} className="flex flex-col items-center gap-0.5">
              <span className={circle}>{inner}</span>
              <span aria-hidden className="text-[10px] text-transparent">
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
