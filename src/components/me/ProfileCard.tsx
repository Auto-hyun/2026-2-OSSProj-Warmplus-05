'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { PencilSimpleIcon, XIcon } from '@phosphor-icons/react';
import { BirthForm } from '@/components/home/BirthForm';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { NICKNAME_MAX } from '@/lib/storage/store';
import { useApp, useStore } from '@/lib/storage/useApp';

/** 프로필 카드 (Figma): 이름·한 줄 소개. 연필 버튼으로 커뮤니티 이름과 생일 정보를 바꾼다 */
export function ProfileCard() {
  const profile = useApp((s) => s.profile);
  const store = useStore();
  const [editing, setEditing] = useState<'menu' | 'name' | 'birth' | null>(null);
  const [name, setName] = useState('');

  if (!profile) return <div className="h-[120px] rounded-[24px] bg-surface/60" />;

  function saveName(e: FormEvent) {
    e.preventDefault();
    if (store.setNickname(name).ok) setEditing(null);
    else toast(`이름은 1~${NICKNAME_MAX}자로 적어 주세요.`, { tone: 'error' });
  }

  const birth = profile.birth;

  return (
    <section aria-label="내 정보" className="rounded-[18px] border border-cream-line bg-surface px-4 py-3">
      <div className="flex items-center gap-4">
        <Image src="/village/screens/profile.webp" alt="" width={212} height={212} preload className="size-[94px] shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[22px] font-bold text-cocoa-900">{profile.nickname ?? '이름을 정해 주세요'}</p>
          <p className="mt-0.5 text-sm text-taupe-500">오늘도 내 마음을 차곡차곡</p>
        </div>
        <button
          type="button"
          aria-label={editing ? '고치기 닫기' : '내 정보 고치기'}
          aria-expanded={editing !== null}
          onClick={() => setEditing(editing ? null : 'menu')}
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-cream-line bg-bg text-taupe-500 active:bg-black/5"
        >
          {editing ? <XIcon size={18} aria-hidden /> : <PencilSimpleIcon size={18} aria-hidden />}
        </button>
      </div>

      {editing === 'menu' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setName(profile.nickname ?? '');
              setEditing('name');
            }}
            className="h-10 rounded-full! border-cream-line! text-sm"
          >
            이름 바꾸기
          </Button>
          <Button variant="secondary" onClick={() => setEditing('birth')} className="h-10 rounded-full! border-cream-line! text-sm">
            생일 정보 바꾸기
          </Button>
        </div>
      )}

      {editing === 'name' && (
        <form onSubmit={saveName} className="mt-4 space-y-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink-600">커뮤니티에서 쓸 이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${NICKNAME_MAX}자까지`}
              className="h-12 w-full rounded-2xl border border-cream-line bg-surface px-4 text-[15px] text-cocoa-900"
            />
          </label>
          <p className="text-xs text-ink-400">이미 올린 글의 이름은 바뀌지 않아요.</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)} className="flex-1 rounded-full! border-cream-line!">
              취소
            </Button>
            <Button type="submit" className="flex-1 rounded-full! bg-leaf-600! text-white!">
              저장
            </Button>
          </div>
        </form>
      )}

      {editing === 'birth' && (
        <div className="mt-4">
          <BirthForm initial={birth} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
        </div>
      )}
    </section>
  );
}
