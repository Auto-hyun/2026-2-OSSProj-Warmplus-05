import type { Letter } from '@/lib/letters';
import { LetterCard } from './LetterCard';

export function LetterGrid({ letters }: { letters: Letter[] }) {
  if (letters.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-400">아직 이 카테고리의 레터가 없어요.</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6">
      {letters.map((letter) => (
        <li key={letter.id}>
          <LetterCard letter={letter} />
        </li>
      ))}
    </ul>
  );
}
