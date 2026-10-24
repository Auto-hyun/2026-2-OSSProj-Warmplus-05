'use client';

import { EnvelopeIcon, MusicNotesPlusIcon, TrophyIcon, UsersThreeIcon, type Icon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { Button, ButtonLink } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const PLACES: { name: string; href?: string; Icon: Icon }[] = [
  { name: '노래 공방', href: '/create', Icon: MusicNotesPlusIcon },
  { name: '이야기 광장', href: '/community', Icon: UsersThreeIcon },
  { name: '온스트리밍 TOP100', Icon: TrophyIcon },
  { name: '온기 우체국', Icon: EnvelopeIcon },
];

/** 지도 위 장소에서 각 기능으로 들어간다. 배경은 나중에 그림으로 교체할 수 있다. */
export function MapScreen() {
  return (
    <>
      <AppBar title="지도" />
      <div className="space-y-4 px-4 pt-2">
        <p className="text-sm text-ink-600">마음이 가는 곳을 눌러 보세요.</p>
        <nav aria-label="지도 속 장소" className="relative isolate overflow-hidden rounded-[40px] border border-line bg-line/40">
          <svg aria-hidden="true" viewBox="0 0 400 480" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 -z-10 h-full w-full">
            <path
              d="M62 64C101 20 171 43 209 28C279 0 353 54 363 122C375 194 347 208 365 278C389 365 328 438 257 445C184 454 147 474 84 430C25 388 24 330 40 274C55 220 6 123 62 64Z"
              className="fill-yellow-100 stroke-line"
              strokeWidth="3"
            />
            <path
              d="M92 125C145 104 252 137 288 173S205 251 130 295S239 371 297 355"
              fill="none"
              className="stroke-surface"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="2 22"
            />
          </svg>
          <ul className="grid grid-cols-2 items-start gap-x-3 gap-y-10 px-3 py-12">
            {PLACES.map(({ name, href, Icon }, index) => {
              const content = (
                <>
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-brown-600">
                    <Icon size={28} weight="duotone" aria-hidden />
                  </span>
                  <span className="leading-snug">{name}</span>
                  {!href && <span className="text-xs font-medium text-ink-600">준비 중</span>}
                </>
              );
              const className = 'h-auto! min-h-36 w-full flex-col rounded-3xl px-2! py-4 text-sm! shadow-[0_4px_12px_rgba(47,43,40,0.06)]';

              return (
                <li key={name} className={index % 2 === 1 ? 'pt-8' : undefined}>
                  {href ? (
                    <ButtonLink href={href} variant="secondary" className={className}>
                      {content}
                    </ButtonLink>
                  ) : (
                    <Button variant="secondary" className={className} onClick={() => toast('준비 중')}>
                      {content}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
