'use client';

import { getMood } from '@/data/moods';
import { fullJars, JAR_SIZE, summarize } from '@/lib/jar';
import { useApp } from '@/lib/storage/useApp';
import { Empty } from '@/components/ui/Empty';

/** 마이페이지: 다 찬 유리병들의 3주 기분 요약 (뼈대 UI) */
export function JarShelf() {
  const jars = useApp((s) => fullJars(s.moods));
  if (!jars) return null;
  if (jars.length === 0) return <Empty>유리병이 다 차면({JAR_SIZE}일) 여기에서 그동안의 마음 날씨를 볼 수 있어요</Empty>;

  return (
    <ul className="space-y-3">
      {jars.map((jar) => {
        const s = summarize(jar);
        return (
          <li key={s.number} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-bold">
              {s.number}번째 병 · {s.from} ~ {s.to}
            </p>
            {s.top && <p className="mt-1 text-sm text-ink-600">가장 많았던 날씨: {getMood(s.top).emoji} {getMood(s.top).weather}</p>}
            <p className="mt-2 text-sm">{s.counts.map((c) => `${getMood(c.mood).emoji} ${c.count}`).join('  ')}</p>
          </li>
        );
      })}
    </ul>
  );
}
