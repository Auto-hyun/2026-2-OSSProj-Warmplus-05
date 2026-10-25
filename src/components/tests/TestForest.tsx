'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { CaretRightIcon } from '@phosphor-icons/react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TESTS, UPCOMING_TESTS, type TestCategory } from '@/data/tests';
import { cn } from '@/lib/cn';

const FILTERS: { value: TestCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'light', label: '가볍게' },
  { value: 'reflect', label: '나를 돌아보기' },
];

/** 마음 테스트 숲 (Figma): 숲 그림, 분류 칩, 테스트 목록. 누르면 /tests/[id]에서 진행 */
export function TestForest() {
  const [filter, setFilter] = useState<TestCategory | 'all'>('all');
  const shown = (t: { category: TestCategory }) => filter === 'all' || t.category === filter;
  const tests = TESTS.filter(shown);
  const upcoming = UPCOMING_TESTS.filter(shown);

  return (
    <>
      <PageHeader title="마음 테스트 숲" />
      <Image src="/village/screens/forest-hero.webp" alt="" width={882} height={470} preload sizes="480px" className="-mt-2 h-auto w-full" />
      <div className="px-4 pb-4">
        <h2 className="mt-1 text-center text-[23px] font-bold text-cocoa-900">오늘의 나를 만나보세요.</h2>
        <p className="mt-1 text-center text-sm text-taupe-500">정답 없이, 마음이 가는 대로.</p>

        <div role="group" aria-label="테스트 분류" className="mt-4 flex justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'h-8 min-w-[66px] rounded-full px-4 text-[13px] font-bold transition-colors',
                filter === f.value ? 'bg-leaf-600 text-white' : 'border border-cream-line bg-surface text-cocoa-900 active:bg-black/5',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {tests.length + upcoming.length === 0 ? (
          <p className="mt-5 rounded-[24px] border border-dashed border-cream-line px-4 py-8 text-center text-sm text-taupe-500">이 분류의 테스트는 준비 중이에요.</p>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {tests.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tests/${t.id}`}
                  className="flex items-center gap-4 rounded-[18px] border border-cream-line bg-surface p-2.5 pr-3 transition-transform active:scale-[0.98]"
                >
                  <Image src={t.thumb} alt="" width={234} height={180} className="h-[80px] w-[104px] shrink-0 rounded-2xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-[17px] leading-snug font-bold text-cocoa-900">{t.title}</span>
                    <span className="mt-1 block text-[13px] text-taupe-500">
                      {t.minutes}분 · {t.tag}
                    </span>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-cream-line text-cocoa-900">
                    <CaretRightIcon size={18} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
            {upcoming.map((t) => (
              <li key={t.title} className="flex items-center gap-4 rounded-[18px] border border-cream-line bg-surface p-2.5 pr-3">
                <Image src={t.thumb} alt="" width={234} height={180} className="h-[80px] w-[104px] shrink-0 rounded-2xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-[17px] leading-snug font-bold text-cocoa-900">{t.title}</span>
                  <span className="mt-1 block text-[13px] text-taupe-500">
                    {t.minutes}분 · {t.tag}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-taupe-500">준비 중</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-center text-xs text-taupe-500">나를 알아가는 가벼운 콘텐츠예요.</p>
      </div>
    </>
  );
}
