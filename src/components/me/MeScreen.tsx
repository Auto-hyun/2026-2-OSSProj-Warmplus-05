'use client';

import type { ReactNode } from 'react';
import { JarShelf } from '@/components/jar/JarShelf';
import { AppBar } from '@/components/layout/AppBar';
import { MyPosts } from './MyPosts';
import { MySongs } from './MySongs';
import { MyTests } from './MyTests';
import { ProfileCard } from './ProfileCard';

/** 탭 4: 내 이름·생일, 심리테스트 유형, 만든 노래, 쓴 글 */
export function MeScreen() {
  return (
    <>
      <AppBar title="마이페이지" />
      <div className="space-y-6 px-4">
        <ProfileCard />
        <Section title="나의 유리병">
          <JarShelf />
        </Section>
        <Section title="나의 심리테스트 유형">
          <MyTests />
        </Section>
        <Section title="내가 만든 노래">
          <MySongs />
        </Section>
        <Section title="내가 쓴 글">
          <MyPosts />
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
