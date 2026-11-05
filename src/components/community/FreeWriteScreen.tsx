'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { toast } from '@/components/ui/Toast';
import { addFreePost, FREE_CONTENT_MAX, FREE_TITLE_MAX, validateFreePost } from '@/lib/freeBoard';
import { pickableSongs } from '@/lib/songs';
import { NICKNAME_MAX } from '@/lib/storage/store';
import { useApp, useStore } from '@/lib/storage/useApp';
import { BgmPicker } from './BgmPicker';

const length = (s: string) => Array.from(s.trim()).length;

/** 자유게시판 글쓰기 (샘플): 제목과 내용을 적어 이 기기에 저장한다. 내 노래를 같이 들을 곡으로 붙일 수 있다 (?song=) */
export function FreeWriteScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const songs = useApp(pickableSongs);
  const [bgmId, setBgmId] = useState<string | null>(params.get('song'));
  // 지운 노래 등 없는 곡이면 배경음악 없이
  const bgm = songs?.find((s) => s.id === bgmId) ?? null;
  const store = useStore();
  const savedName = useApp((s) => s.profile.nickname);
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const askName = savedName === null || editingName;
  const nickname = askName ? name.trim() : (savedName ?? '');
  const valid = validateFreePost({ nickname, title, content }) === null && length(nickname) <= NICKNAME_MAX;

  function submit() {
    if (!valid) return;
    try {
      if (askName) store.setNickname(nickname);
      addFreePost({ nickname, title, content, bgm: bgm && { title: bgm.title, url: bgm.audioUrl } });
      toast('글을 올렸어요!');
      router.replace('/community?board=free');
    } catch (error) {
      toast(error instanceof Error ? error.message : '글을 올리지 못했어요.', { tone: 'error' });
    }
  }

  const sendButton = (
    <button
      type="button"
      onClick={submit}
      disabled={!valid}
      className="h-10 rounded-full bg-leaf-600 px-4 text-sm font-bold text-white active:brightness-95 disabled:bg-line disabled:text-ink-400"
    >
      올리기
    </button>
  );

  return (
    <>
      <AppBar title="자유게시판 글쓰기" backHref="/community?board=free" right={sendButton} />
      <div className="space-y-4 px-4 pb-32">
        {savedName !== undefined &&
          (askName ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-cocoa-900">커뮤니티에서 쓸 이름</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NICKNAME_MAX * 2}
                placeholder={`${NICKNAME_MAX}자까지`}
                className="h-12 w-full rounded-2xl border border-cream-line bg-surface px-4 text-[15px] text-cocoa-900"
              />
            </label>
          ) : (
            <p className="text-sm text-taupe-500">
              <b className="text-cocoa-900">{savedName}</b> 이름으로 올려요 ·{' '}
              <button
                type="button"
                onClick={() => {
                  setName(savedName ?? '');
                  setEditingName(true);
                }}
                className="underline underline-offset-2"
              >
                바꾸기
              </button>
            </p>
          ))}

        <label className="block">
          <span className="sr-only">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={FREE_TITLE_MAX * 2}
            placeholder="제목"
            className="h-12 w-full rounded-2xl border border-cream-line bg-surface px-4 text-base font-bold text-cocoa-900"
          />
        </label>
        {length(title) > FREE_TITLE_MAX && <p className="-mt-2 text-right text-xs text-danger">제목은 {FREE_TITLE_MAX}자까지예요.</p>}

        <div>
          <label className="block">
            <span className="sr-only">내용</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="자유롭게 이야기를 적어 주세요"
              className="w-full resize-none rounded-2xl border border-cream-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-cocoa-900"
            />
          </label>
          <p className={length(content) > FREE_CONTENT_MAX ? 'text-right text-xs text-danger' : 'text-right text-xs text-taupe-500'}>
            {length(content)}/{FREE_CONTENT_MAX}
          </p>
        </div>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-cocoa-900">같이 들을 노래</h2>
          {songs && songs.length > 0 ? (
            <BgmPicker songs={songs} value={bgm?.id ?? null} onChange={setBgmId} />
          ) : (
            <p className="rounded-2xl border border-dashed border-cream-line px-4 py-4 text-sm text-taupe-500">
              아직 만든 노래가 없어요.{' '}
              <Link href="/create" className="font-semibold text-leaf-600 underline underline-offset-2">
                노래 만들러 가기
              </Link>
            </p>
          )}
        </section>

        <p className="rounded-2xl bg-cream px-4 py-3 text-[13px] leading-relaxed text-cocoa-900">
          샘플 게시판이에요. 글은 이 기기에만 저장되고 다른 사람에게는 보이지 않아요.
        </p>
      </div>
    </>
  );
}
