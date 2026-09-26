import Link from 'next/link';
import type { Mission } from '@/data/missions';

/** 홈에서 오늘의 미션으로 바로 가는 카드 */
export function TodayMissionShortcut({ mission, done }: { mission: Mission; done: boolean }) {
  return (
    <Link href="/mission" className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 active:bg-black/[0.02]">
      <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-yellow-100 text-2xl">
        {mission.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-ink-400">오늘의 미션</span>
        <span className="block truncate text-[15px] font-semibold text-ink-900">{mission.title}</span>
      </span>
      {done ? (
        <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-brown-600">완료</span>
      ) : (
        <span className="shrink-0 text-sm font-semibold text-brown-600">하러 가기</span>
      )}
    </Link>
  );
}
