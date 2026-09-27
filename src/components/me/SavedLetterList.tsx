import Link from 'next/link';
import { CaretRightIcon } from '@phosphor-icons/react/ssr';
import lettersData from '@/data/letters.json';
import { formatDotDate } from '@/lib/date';
import { extractEmoji, type Letter } from '@/lib/letters';

const LETTERS = lettersData as Letter[];

/** 오목이 가방 속 편지: 시작 화면에서 담은 온기레터 (최근 것이 앞) */
export function SavedLetterList({ ids }: { ids: number[] }) {
  const letters = ids.map((id) => LETTERS.find((l) => l.id === id)).filter((l): l is Letter => Boolean(l));
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface">
      {letters.map((letter) => (
        <li key={letter.id}>
          <Link href={`/letters/${letter.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02]">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-100 text-xl">
              {extractEmoji(letter.title) ?? '💌'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium text-ink-900">{letter.title}</span>
              <span className="block text-xs text-ink-400">온기레터 · {formatDotDate(letter.sentAt)}</span>
            </span>
            <CaretRightIcon size={16} className="shrink-0 text-ink-400" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
