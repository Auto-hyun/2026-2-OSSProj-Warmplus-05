'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { JarShelf } from '@/components/jar/JarShelf';
import { currentJar } from '@/lib/jar';
import { useApp } from '@/lib/storage/useApp';

/** 마이페이지 마음 병 배너 (Figma): 유리병 그림 위에 지금 병 번호와 모은 날 수. 누르면 내 병들(구슬)을 펼친다 */
export function JarBanner() {
  const jar = useApp((s) => currentJar(s.moods));
  const [open, setOpen] = useState(false);
  if (!jar) return <div className="aspect-[362/224] rounded-[18px] bg-surface/60" />;

  return (
    <div>
      <section
        aria-label="이번 마음 병"
        className="relative aspect-[362/224] overflow-hidden rounded-[18px] px-[27px] pt-[30px]"
      >
        <Image src="/village/screens/jar-banner.webp" alt="" fill preload sizes="480px" className="object-cover" />
        <div className="relative z-10 max-w-[60%]">
          <h2 className="text-[23px] font-bold text-cocoa-900">{jar.number}번째 마음 병</h2>
          <p className="mt-0.5 text-[15px] text-cocoa-900">
            <b className="text-[20px] text-leaf-600">{jar.entries.length}일</b>의 마음을 모았어요.
          </p>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-leaf-600 px-5 text-sm font-bold text-white shadow-[0_6px_14px_rgba(60,85,55,0.25)] transition-transform active:scale-[0.98]"
          >
            {open ? '접기' : '내 마음 보러가기'}
            {open ? <CaretDownIcon size={16} aria-hidden /> : <CaretRightIcon size={16} aria-hidden />}
          </button>
        </div>
      </section>
      {open && (
        <div className="mt-3">
          <JarShelf />
        </div>
      )}
    </div>
  );
}
