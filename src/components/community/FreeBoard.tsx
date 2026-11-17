'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CaretRightIcon, MusicNotesSimpleIcon, PencilSimpleLineIcon, TrashIcon } from '@phosphor-icons/react';
import { PlayButton } from '@/components/audio/PlayButton';
import { Omok } from '@/components/omok/Omok';
import { Button } from '@/components/ui/Button';
import { FRIEND_TINTS, FriendAvatar, friendFor } from '@/components/ui/FriendAvatar';
import { toast } from '@/components/ui/Toast';
import { timeAgo } from '@/lib/date';
import { deleteFreePost, FREE_PAGE_SIZE, listFreePosts, type FreePost } from '@/lib/freeBoard';
import { currentUserId } from '@/lib/supabase/browser';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { NeedsSupabase } from './NeedsSupabase';

type Feed = { status: 'loading' } | { status: 'error' } | { status: 'ready'; posts: FreePost[]; more: boolean };

/** 자유게시판: 제목·내용 글 목록 (Supabase). 내 글은 지울 수 있다 */
export function FreeBoard() {
  const supabase = useSupabase();
  const [feed, setFeed] = useState<Feed>({ status: 'loading' });
  const [myId, setMyId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    Promise.all([listFreePosts(supabase), currentUserId(supabase)])
      .then(([posts, id]) => {
        if (cancelled) return;
        setMyId(id);
        setFeed({ status: 'ready', posts, more: posts.length === FREE_PAGE_SIZE });
      })
      .catch(() => !cancelled && setFeed({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [supabase, attempt]);

  async function loadMore() {
    if (!supabase || feed.status !== 'ready' || loadingMore) return;
    setLoadingMore(true);
    try {
      const older = await listFreePosts(supabase, feed.posts[feed.posts.length - 1].createdAt);
      setFeed({ status: 'ready', posts: [...feed.posts, ...older], more: older.length === FREE_PAGE_SIZE });
    } catch {
      // 버튼이 그대로 남아 다시 누를 수 있다
    } finally {
      setLoadingMore(false);
    }
  }

  async function remove(post: FreePost) {
    if (!supabase || !window.confirm('이 글을 지울까요?')) return;
    try {
      await deleteFreePost(supabase, post.id);
      setFeed((f) => (f.status === 'ready' ? { ...f, posts: f.posts.filter((p) => p.id !== post.id) } : f));
      toast('글을 지웠어요.');
    } catch (error) {
      toast(error instanceof Error ? error.message : '글을 지우지 못했어요.', { tone: 'error' });
    }
  }

  let body;
  if (supabase === null) body = <NeedsSupabase />;
  else if (supabase === undefined || feed.status === 'loading')
    body = (
      <div aria-label="글을 불러오는 중" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-[24px] bg-line/60" />
        ))}
      </div>
    );
  else if (feed.status === 'error')
    body = (
      <div className="flex flex-col items-center rounded-[24px] border border-cream-line bg-surface px-5 py-8 text-center">
        <Omok pose="search" height={90} />
        <p className="mt-4 font-bold text-cocoa-900">글을 불러오지 못했어요</p>
        <Button
          variant="secondary"
          onClick={() => {
            setFeed({ status: 'loading' });
            setAttempt((n) => n + 1);
          }}
          className="mt-4"
        >
          다시 불러오기
        </Button>
      </div>
    );
  else if (feed.posts.length === 0)
    body = <p className="rounded-[24px] border border-dashed border-cream-line px-4 py-8 text-center text-sm text-taupe-500">아직 올라온 글이 없어요. 첫 글을 남겨 보세요.</p>;
  else
    body = (
      <>
        <ul className="space-y-3">
          {feed.posts.map((post) => (
            <li key={post.id}>
              <FreePostCard post={post} mine={post.userId === myId} onDelete={() => remove(post)} />
            </li>
          ))}
        </ul>
        {feed.more && (
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore} className="w-full rounded-full! border-cream-line!">
            {loadingMore ? '불러오는 중…' : '더 보기'}
          </Button>
        )}
      </>
    );

  return (
    <div className="space-y-3">
      <Link
        href="/community/free/write"
        className="flex items-center gap-4 rounded-[24px] border border-cream-line bg-surface px-5 py-4 shadow-[0_6px_18px_rgba(75,46,32,0.05)] transition-transform active:scale-[0.98]"
      >
        <PencilSimpleLineIcon size={30} weight="light" className="shrink-0 text-cocoa-900" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold text-cocoa-900">무엇이든 자유롭게 적어 보세요</span>
          <span className="mt-0.5 block text-[13px] text-taupe-500">고민, 일상, 추천 무엇이든 괜찮아요.</span>
        </span>
        <CaretRightIcon size={18} className="shrink-0 text-taupe-500" aria-hidden />
      </Link>
      {body}
    </div>
  );
}

/** 글 한 개: 이름·시간, 제목, 내용 (길면 접었다 펼친다), 같이 들을 노래. 내 글은 지울 수 있다 */
export function FreePostCard({ post, mine, onDelete }: { post: FreePost; mine: boolean; onDelete?: () => void }) {
  const friend = friendFor(post.nickname);
  const [open, setOpen] = useState(false);
  const long = post.content.length > 120 || post.content.split('\n').length > 4;

  return (
    <article className="rounded-[24px] border border-cream-line bg-surface p-4 shadow-[0_6px_18px_rgba(75,46,32,0.05)]">
      <header className="flex items-center gap-3">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full" style={{ background: FRIEND_TINTS[friend] }}>
          <FriendAvatar friend={friend} size={36} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-cocoa-900">{post.nickname}</span>
            {mine && <span className="shrink-0 rounded-md bg-leaf-600/15 px-1.5 py-0.5 text-[11px] font-semibold text-leaf-600">내 글</span>}
          </p>
          <p className="text-xs text-taupe-500">
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </p>
        </div>
        {mine && onDelete && (
          <button
            type="button"
            aria-label="내 글 지우기"
            onClick={onDelete}
            className="grid size-9 shrink-0 place-items-center rounded-full text-taupe-500 active:bg-black/5"
          >
            <TrashIcon size={18} aria-hidden />
          </button>
        )}
      </header>
      <h3 className="mt-3 text-[16px] leading-snug font-bold break-words text-cocoa-900">{post.title}</h3>
      <p className={`mt-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-cocoa-900 ${long && !open ? 'line-clamp-4' : ''}`}>{post.content}</p>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-1 text-[13px] font-semibold text-leaf-600">
          {open ? '접기' : '더 보기'}
        </button>
      )}
      {post.bgm && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-cream-line p-2.5">
          <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-600/15 text-leaf-600">
            <MusicNotesSimpleIcon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-cocoa-900">{post.bgm.title}</p>
            <p className="text-xs text-taupe-500">같이 듣는 노래</p>
          </div>
          <PlayButton track={{ title: post.bgm.title, url: post.bgm.url }} size="sm" tone="soft" />
        </div>
      )}
    </article>
  );
}
