import { CATEGORIES, type CategoryId } from '@/data/categories';
import { cn } from '@/lib/cn';

type Value = CategoryId | 'all';

const OPTIONS: { value: Value; label: string }[] = [{ value: 'all', label: '전체' }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.label }))];

/** 당근처럼 가로로 넘기는 카테고리 칩. 선택된 칩은 진한 갈색 */
export function CategoryChips({ value, onChange }: { value: Value; onChange: (value: Value) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              // 보이는 높이는 36px, 누르는 영역은 위아래로 넓혀 44px
              'relative h-9 shrink-0 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:-inset-y-1',
              selected ? 'border-brown-600 bg-brown-600 font-semibold text-white' : 'border-line bg-surface text-ink-600',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
