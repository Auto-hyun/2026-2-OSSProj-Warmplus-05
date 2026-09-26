'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BellSimpleIcon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { isCategoryId } from '@/data/categories';
import { LINKS } from '@/data/links';
import lettersData from '@/data/letters.json';
import { filterLetters, type Letter } from '@/lib/letters';
import { CategoryChips } from './CategoryChips';
import { LetterGrid } from './LetterGrid';

const ALL = lettersData as Letter[];

/** 온기레터 아카이브: 카테고리 칩(주소 ?category=로 유지) + 2열 카드 */
export function LettersScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const requested = params.get('category');
  const category = isCategoryId(requested) ? requested : 'all';
  const letters = filterLetters(ALL, category);

  return (
    <>
      <AppBar
        title="온기레터"
        right={
          <a
            href={LINKS.subscribe}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="온기레터 구독하기"
            className="grid size-11 place-items-center rounded-full text-ink-900 active:bg-black/5"
          >
            <BellSimpleIcon size={24} aria-hidden />
          </a>
        }
      />
      <p className="px-5 text-sm text-ink-600">익명의 고민과 손편지 답장을 모았어요 · {ALL.length}편</p>
      <div className="sticky top-[calc(env(safe-area-inset-top)+56px)] z-20 bg-bg/90 py-3 backdrop-blur-md">
        <CategoryChips
          value={category}
          onChange={(next) => router.replace(next === 'all' ? '/letters' : `/letters?category=${next}`, { scroll: false })}
        />
      </div>
      <div className="px-5 pt-1">
        <LetterGrid letters={letters} />
      </div>
    </>
  );
}
