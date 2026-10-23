import type { ReactNode } from 'react';
import { MusicNoteIcon } from '@phosphor-icons/react';
import { PlayButton } from '@/components/audio/PlayButton';
import type { Post } from '@/lib/community';
import { timeAgo } from '@/lib/date';

/** 커뮤니티 글 한 개: 이름·시간, 오목이가 건넨 주제, 내용, 배경음악 */
export function PostCard({ post, right }: { post: Post; right?: ReactNode }) {
  return (
    <article className="rounded-3xl border border-line bg-surface p-4">
      <header className="flex items-center gap-2">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-yellow-100 text-sm font-bold text-brown-600">
          {Array.from(post.nickname)[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{post.nickname}</p>
          <p className="text-xs text-ink-400">
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </p>
        </div>
        {right}
      </header>
      {post.topic && (
        <p className="mt-3 inline-block rounded-xl bg-bg px-3 py-1.5 text-[13px] text-ink-600">
          <span className="font-semibold text-brown-600">오목이의 질문</span> {post.topic}
        </p>
      )}
      <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
      {post.bgm && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-bg p-2 pr-3">
          <PlayButton track={{ title: post.bgm.title, url: post.bgm.url }} size="sm" />
          <MusicNoteIcon size={16} className="shrink-0 text-ink-400" aria-hidden />
          <p className="min-w-0 truncate text-sm font-medium">{post.bgm.title}</p>
        </div>
      )}
    </article>
  );
}
