'use client';

import Image from 'next/image';
import { useState, useSyncExternalStore } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { ART_BUTTON, ArtIcon } from '@/components/ui/RoundButton';
import { cn } from '@/lib/cn';

const SEEN_KEY = 'village-guide-seen';

/** 마을을 도는 순서대로, 지도에 쓰는 장소 그림과 함께. 안내 없이도 흐름(마음 알기 → 노래 → 나누기)이 보이게 */
const STEPS = [
  { art: 'house', title: '오늘의 마음날씨', desc: '홈 위쪽에서 3문항으로 오늘 기분을 구슬로 기록해요.' },
  { art: 'friends', title: '오목이와 대화', desc: '홈의 감정 친구들을 누르면 언제든 이야기할 수 있어요.' },
  { art: 'test-forest', title: '마음 테스트 숲', desc: '재미있는 테스트로 내 마음을 더 알아봐요.' },
  { art: 'workshop', title: '노래 공방', desc: '기록한 마음과 테스트 결과가 나만의 노래가 돼요.' },
  { art: 'plaza', title: '이야기 광장', desc: '만든 노래와 함께 오늘의 이야기를 나눠요.' },
];

/**
 * 마음 마을 안내: 홈 왼쪽 위 ? 버튼으로 열어 보는 사용 안내.
 * auto면 처음 온 사람에게 한 번만 저절로도 열린다
 */
const noopSubscribe = () => () => {};

/** 처음 온 사람인지 (localStorage를 못 쓰면 본 것으로 친다. 서버 렌더와 첫 화면을 맞추기 위해 서버에선 false) */
function firstVisitInStorage(): boolean {
  try {
    return !localStorage.getItem(SEEN_KEY);
  } catch {
    return false;
  }
}

export function VillageGuide({ auto = false, className }: { auto?: boolean; className?: string }) {
  const [manual, setManual] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const firstVisit = useSyncExternalStore(noopSubscribe, firstVisitInStorage, () => false);
  const open = manual || (auto && firstVisit && !dismissed);

  function close() {
    setManual(false);
    setDismissed(true);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {}
  }

  return (
    <>
      <button type="button" aria-label="마음 마을 안내" onClick={() => setManual(true)} className={cn(ART_BUTTON, 'size-14', className)}>
        <ArtIcon name="guide" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="마음 마을 안내"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          onClick={close}
        >
          <div className="max-h-[85dvh] w-full max-w-[400px] overflow-y-auto rounded-3xl bg-bg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cocoa-900">마음 마을에 온 걸 환영해!</h2>
              <button type="button" aria-label="닫기" onClick={close} className="grid size-9 place-items-center rounded-xl text-taupe-500 active:bg-black/5">
                <XIcon size={20} aria-hidden />
              </button>
            </div>
            <p className="mt-1 text-sm text-taupe-500">이 순서로 돌아보면 좋아요.</p>
            <ol className="mt-4 space-y-2.5">
              {STEPS.map((step) => (
                <li key={step.title} className="flex items-center gap-3.5 rounded-2xl border border-cream-line bg-surface px-4 py-2.5">
                  <Image
                    src={`/village/${step.art}.webp`}
                    alt=""
                    width={120}
                    height={120}
                    draggable={false}
                    className="size-[58px] shrink-0 object-contain select-none [filter:drop-shadow(0_4px_6px_rgba(80,55,20,0.16))]"
                  />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-cocoa-900">{step.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-taupe-500">{step.desc}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Button onClick={close} className="mt-4 w-full">
              좋아, 둘러볼게!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
