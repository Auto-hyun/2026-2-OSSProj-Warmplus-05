'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategory } from '@/data/categories';
import { formatDotDate } from '@/lib/date';
import { extractEmoji, type Letter } from '@/lib/letters';

/** 그림 + 제목 + 카테고리 태그 + 날짜 카드. 그림이 없으면 카테고리 색 배경에 제목 이모지를 크게 */
export function LetterCard({ letter }: { letter: Letter }) {
  const [broken, setBroken] = useState(false);
  const category = letter.category === 'uncategorized' ? null : getCategory(letter.category);
  const showImage = Boolean(letter.image) && !broken;

  return (
    <Link href={`/letters/${letter.id}`} className="block active:opacity-80">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl"
        style={showImage ? undefined : { background: category?.tint ?? '#F5EFE6' }}
      >
        {showImage ? (
          <Image
            src={letter.image!}
            alt=""
            fill
            sizes="(max-width: 480px) 50vw, 240px"
            className="object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center text-5xl">
            {extractEmoji(letter.title) ?? category?.emoji ?? '💌'}
          </span>
        )}
      </div>
      <p className="mt-2.5 line-clamp-2 text-[15px] leading-snug font-semibold text-ink-900">{letter.title}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        {category && <span className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-600">{category.label}</span>}
        <span className="ml-auto text-xs text-ink-400">{formatDotDate(letter.sentAt)}</span>
      </div>
    </Link>
  );
}
