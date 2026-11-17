'use client';

import { useState } from 'react';
import { ClipboardTextIcon, MusicNotesSimpleIcon, PencilSimpleIcon, type Icon } from '@phosphor-icons/react';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';
import { MyPosts } from './MyPosts';
import { MySongs } from './MySongs';
import { MyTests } from './MyTests';

type Tab = 'songs' | 'tests' | 'posts';

const TABS: { value: Tab; label: string; Icon: Icon }[] = [
  { value: 'songs', label: '내 노래', Icon: MusicNotesSimpleIcon },
  { value: 'tests', label: '테스트', Icon: ClipboardTextIcon },
  { value: 'posts', label: '내가 쓴 글', Icon: PencilSimpleIcon },
];

/** 내 기록 (홈 오른쪽 위 음표 버튼): 내 노래 · 테스트 · 내가 쓴 글. 프로필·계정은 지도 오른쪽 위, 마음 병은 홈 유리병으로 옮겼다 */
export function MeScreen() {
  const [tab, setTab] = useState<Tab>('songs');

  return (
    <>
      <PageHeader title="내 기록" back="/" />
      <div className="space-y-3 px-3.5">
        <div role="tablist" aria-label="내 기록" className="flex rounded-[17px] border border-cream-line bg-bg p-1">
          {TABS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="tab"
              id={`me-tab-${value}`}
              aria-selected={tab === value}
              aria-controls="me-panel"
              onClick={() => setTab(value)}
              className={cn(
                'inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[14px] text-[15px] font-bold transition-colors',
                tab === value ? 'bg-leaf-600 text-white' : 'text-taupe-500 active:bg-black/5',
              )}
            >
              <Icon size={18} aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id="me-panel" aria-labelledby={`me-tab-${tab}`}>
          {tab === 'songs' && <MySongs />}
          {tab === 'tests' && <MyTests />}
          {tab === 'posts' && <MyPosts />}
        </div>
      </div>
    </>
  );
}
