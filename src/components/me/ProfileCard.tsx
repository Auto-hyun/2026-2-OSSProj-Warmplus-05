'use client';

import { useState, type FormEvent } from 'react';
import { BirthForm } from '@/components/home/BirthForm';
import { Omok } from '@/components/omok/Omok';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { zodiacOf } from '@/lib/fortune';
import { NICKNAME_MAX } from '@/lib/storage/store';
import { useApp, useStore } from '@/lib/storage/useApp';

/** 커뮤니티 이름과 생일 정보 (둘 다 바꿀 수 있다) */
export function ProfileCard() {
  const profile = useApp((s) => s.profile);
  const store = useStore();
  const [editing, setEditing] = useState<'name' | 'birth' | null>(null);
  const [name, setName] = useState('');

  if (!profile) return <div className="h-36 rounded-3xl bg-surface/60" />;

  function saveName(e: FormEvent) {
    e.preventDefault();
    if (store.setNickname(name).ok) setEditing(null);
    else toast(`이름은 1~${NICKNAME_MAX}자로 적어 주세요.`, { tone: 'error' });
  }

  const birth = profile.birth;

  return (
    <section aria-label="내 정보" className="rounded-3xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-14 shrink-0 place-items-center rounded-full bg-yellow-100">
          <Omok pose="smile" height={34} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{profile.nickname ?? '이름을 정해 주세요'}</p>
          <p className="text-sm text-ink-600">
            {birth
              ? `${birth.date.replaceAll('-', '.')}${birth.time ? ` ${birth.time}` : ''} · ${zodiacOf(birth.date).name}`
              : '생일 정보가 없어요'}
          </p>
        </div>
      </div>

      {editing === null && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setName(profile.nickname ?? '');
              setEditing('name');
            }}
            className="h-10 text-sm"
          >
            이름 바꾸기
          </Button>
          <Button variant="secondary" onClick={() => setEditing('birth')} className="h-10 text-sm">
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
              className="h-12 w-full rounded-2xl border border-line bg-bg px-4 text-[15px]"
            />
          </label>
          <p className="text-xs text-ink-400">이미 올린 글의 이름은 바뀌지 않아요.</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1">
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
