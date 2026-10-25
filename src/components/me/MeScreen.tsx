'use client';

import { useState } from 'react';
import { ClipboardTextIcon, MusicNotesSimpleIcon, PencilSimpleIcon, type Icon } from '@phosphor-icons/react';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';
import { JarBanner } from './JarBanner';
import { MyPosts } from './MyPosts';
import { MySongs } from './MySongs';
import { MyTests } from './MyTests';
import { ProfileCard } from './ProfileCard';

type Tab = 'songs' | 'tests' | 'posts';

const TABS: { value: Tab; label: string; Icon: Icon }[] = [
  { value: 'songs', label: '내 노래', Icon: MusicNotesSimpleIcon },
  { value: 'tests', label: '테스트', Icon: ClipboardTextIcon },
  { value: 'posts', label: '내가 쓴 글', Icon: PencilSimpleIcon },
];

/** 마이페이지 (Figma): 프로필, 이번 마음 병, 내 노래 · 테스트 · 내가 쓴 글 */
export function MeScreen() {
  const [tab, setTab] = useState<Tab>('songs');

  return (
    <>
      <PageHeader title="마이페이지" home={false} />
      <div className="space-y-3 px-3.5">
        <ProfileCard />
        <JarBanner />

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
