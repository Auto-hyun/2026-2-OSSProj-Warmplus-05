'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CaretRightIcon, MusicNotesSimpleIcon, PencilSimpleLineIcon, TrashIcon } from '@phosphor-icons/react';
import { PlayButton } from '@/components/audio/PlayButton';
import { FRIEND_TINTS, FriendAvatar, friendFor } from '@/components/ui/FriendAvatar';
import { removeFreePost, useFreePosts, type FreePost } from '@/lib/freeBoard';
import { timeAgo } from '@/lib/date';

/** 자유게시판 (샘플): 제목·내용 글 목록. 글은 이 기기에만 저장된다 */
export function FreeBoard() {
  const posts = useFreePosts();

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

      {posts === undefined ? (
        <div aria-label="글을 불러오는 중" className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[24px] bg-line/60" />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <FreePostCard post={post} />
            </li>
          ))}
        </ul>
      )}

      <p className="pt-1 text-center text-xs text-taupe-500">샘플 게시판이라 글은 이 기기에만 저장돼요.</p>
    </div>
  );
}

/** 글 한 개: 이름·시간, 제목, 내용 (길면 접었다 펼친다), 같이 들을 노래. 내 글은 지울 수 있다 */
function FreePostCard({ post }: { post: FreePost }) {
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
            {post.mine && <span className="shrink-0 rounded-md bg-leaf-600/15 px-1.5 py-0.5 text-[11px] font-semibold text-leaf-600">내 글</span>}
          </p>
          <p className="text-xs text-taupe-500">
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </p>
        </div>
        {post.mine && (
          <button
            type="button"
            aria-label="내 글 지우기"
            onClick={() => window.confirm('이 글을 지울까요?') && removeFreePost(post.id)}
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
