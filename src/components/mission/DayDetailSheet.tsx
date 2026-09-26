'use client';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { getMission } from '@/data/missions';
import type { DayKey } from '@/lib/date';
import type { MissionRecord } from '@/lib/storage/types';

type Props = {
  dayKey: DayKey | null;
  record?: MissionRecord;
  onClose: () => void;
};

/** 캘린더에서 완료한 날을 누르면 그날의 미션과 메모를 보여준다 */
export function DayDetailSheet({ dayKey, record, onClose }: Props) {
  const open = Boolean(dayKey && record);
  const mission = record ? getMission(record.missionId) : undefined;
  const [, m, d] = (dayKey ?? '0-0-0').split('-').map(Number);

  return (
    <BottomSheet open={open} onClose={onClose} title={`${m}월 ${d}일의 미션`}>
      {record && (
        <div className="pb-2">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-900">
            <span aria-hidden className="text-xl">
              {mission?.emoji ?? '👣'}
            </span>
            {mission?.title ?? '미션'}
          </p>
          <p className="mt-3 rounded-2xl bg-bg px-4 py-3 text-sm leading-relaxed text-ink-600">
            {record.note ? `“${record.note}”` : '메모 없이 완료했어요.'}
          </p>
          {record.demo && <p className="mt-2 text-xs text-ink-400">시연 모드로 추가한 기록이에요.</p>}
        </div>
      )}
    </BottomSheet>
  );
}
