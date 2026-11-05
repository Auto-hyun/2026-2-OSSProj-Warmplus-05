'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { OmokTalk } from '@/components/omok/OmokTalk';
import { toast } from '@/components/ui/Toast';
import { TOPICS } from '@/data/topics';
import { CONTENT_MAX, createPost } from '@/lib/community';
import { pickableSongs } from '@/lib/songs';
import { NICKNAME_MAX } from '@/lib/storage/store';
import { useApp, useStore } from '@/lib/storage/useApp';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { BgmPicker } from './BgmPicker';
import { NeedsSupabase } from './NeedsSupabase';

const length = (s: string) => Array.from(s.trim()).length;

function otherTopic(current: number): number {
  const next = Math.floor(Math.random() * (TOPICS.length - 1));
  return next >= current ? next + 1 : next;
}

/** 글쓰기: 오목이가 주제를 하나씩 건네고, 내 노래를 배경음악으로 붙일 수 있다 */
export function WriteScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = useSupabase();
  const store = useStore();
  const savedName = useApp((s) => s.profile.nickname);
  // 주제는 무작위라 서버 렌더와 다를 수 있어서, 하이드레이션 뒤에 보여 준다
  const hydrated = useApp(() => true);
  const [topicIndex, setTopicIndex] = useState(() => Math.floor(Math.random() * TOPICS.length));
  const [accepted, setAccepted] = useState(false);
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [bgmId, setBgmId] = useState<string | null>(params.get('song'));
  const songs = useApp(pickableSongs);
  // 지운 노래 등 없는 곡이면 배경음악 없이
  const bgm = songs?.find((s) => s.id === bgmId) ?? null;
  const [sending, setSending] = useState(false);

  const topic = TOPICS[topicIndex];
  const askName = savedName === null || editingName;
  const nickname = askName ? name.trim() : (savedName ?? '');
  const valid = length(nickname) >= 1 && length(nickname) <= NICKNAME_MAX && length(content) >= 1 && length(content) <= CONTENT_MAX;

  async function submit() {
    if (!supabase || !valid || sending) return;
    setSending(true);
    try {
      if (askName) store.setNickname(nickname);
      await createPost(supabase, {
        nickname,
        topic: accepted ? topic : null,
        content: content.trim(),
        bgm: bgm && { title: bgm.title, url: bgm.audioUrl },
      });
      toast('이야기를 올렸어요!');
      router.replace('/community');
    } catch (error) {
      toast(error instanceof Error ? error.message : '글을 올리지 못했어요.', { tone: 'error' });
      setSending(false);
    }
  }

  const sendButton = (
    <button
      type="button"
      onClick={submit}
      disabled={!valid || sending || !supabase}
      className="h-10 rounded-full bg-yellow-500 px-4 text-sm font-bold text-ink-900 active:brightness-95 disabled:bg-line disabled:text-ink-400"
    >
      {sending ? '올리는 중…' : '올리기'}
    </button>
  );

  if (supabase === null) {
    return (
      <>
        <AppBar title="글쓰기" backHref="/community" />
        <div className="px-4">
          <NeedsSupabase />
        </div>
      </>
    );
  }

  return (
    <>
      <AppBar title="글쓰기" backHref="/community" right={sendButton} />
      <div className="space-y-5 px-4 pb-32">
        {hydrated && !accepted && (
          <OmokTalk
            size="sm"
            pose="book"
            line={`이런 이야기는 어때? “${topic}”`}
            replies={[
              { label: '이걸로 쓸래', primary: true, onSelect: () => setAccepted(true) },
              { label: '다른 주제', onSelect: () => setTopicIndex(otherTopic(topicIndex)) },
            ]}
          />
        )}

        <section className="space-y-2">
          {askName ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-600">커뮤니티에서 쓸 이름</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NICKNAME_MAX * 2}
                placeholder={`${NICKNAME_MAX}자까지`}
                className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[15px]"
              />
            </label>
          ) : (
            <p className="text-sm text-ink-600">
              <b className="text-ink-900">{savedName}</b> 이름으로 올려요 ·{' '}
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
          )}

          {accepted && (
            <p className="flex items-start gap-2 rounded-xl bg-yellow-100 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-brown-600">오목이의 질문</span> {topic}
              </span>
              <button type="button" onClick={() => setAccepted(false)} aria-label="주제 빼기" className="shrink-0 text-ink-400">
                <XIcon size={16} aria-hidden />
              </button>
            </p>
          )}

          <label className="block">
            <span className="sr-only">오늘의 이야기</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              placeholder="오늘 있었던 일을 들려주세요"
              className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed"
            />
          </label>
          <p className={length(content) > CONTENT_MAX ? 'text-right text-xs text-danger' : 'text-right text-xs text-ink-400'}>
            {length(content)}/{CONTENT_MAX}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink-600">배경음악</h2>
          {songs && songs.length > 0 ? (
            <BgmPicker songs={songs} value={bgm?.id ?? null} onChange={setBgmId} />
          ) : (
            <p className="rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink-600">
              아직 만든 노래가 없어요.{' '}
              <Link href="/create" className="font-semibold text-brown-600 underline underline-offset-2">
                노래 만들러 가기
              </Link>
            </p>
          )}
        </section>
      </div>
    </>
  );
}
