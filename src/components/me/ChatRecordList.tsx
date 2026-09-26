import Link from 'next/link';
import { CaretRightIcon } from '@phosphor-icons/react/ssr';
import { formatKoreanDate, type DayKey } from '@/lib/date';
import type { ChatDay } from '@/lib/storage/types';

type Props = { chats: Record<DayKey, ChatDay>; today: DayKey };

/** 마음 기록: 내 생각을 얘기한 날의 대화 목록 (최신순). 누르면 그날 대화를 다시 읽는다 */
export function ChatRecordList({ chats, today }: Props) {
  const days = Object.entries(chats)
    .map(([date, day]) => ({ date, day, first: day.messages.find((m) => m.role === 'user')?.content }))
    .filter((entry): entry is typeof entry & { first: string } => Boolean(entry.first))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (days.length === 0) {
    return <p className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-ink-400">아직 나눈 이야기가 없어요.</p>;
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface">
      {days.map(({ date, day, first }) => (
        <li key={date}>
          <Link href={`/chat?date=${date}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02]">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-400">
                {formatKoreanDate(date)}
                {date === today && ' · 오늘'}
              </p>
              <p className="mt-0.5 truncate text-[15px] font-medium text-ink-900">{first}</p>
              <p className="mt-0.5 truncate text-xs text-ink-600">Q. {day.question}</p>
            </div>
            <CaretRightIcon size={16} className="shrink-0 text-ink-400" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
