import type { ReactNode } from 'react';
import { PlayButton } from '@/components/audio/PlayButton';
import { FRIEND_TINTS, FriendAvatar, friendFor } from '@/components/ui/FriendAvatar';
import type { Post } from '@/lib/community';
import { timeAgo } from '@/lib/date';

/** 커뮤니티 글 한 개 (Figma 카드): 이름·시간, 오목이가 건넨 주제, 내용, 배경음악 */
export function PostCard({ post, right }: { post: Post; right?: ReactNode }) {
  const friend = friendFor(post.nickname);
  const bgmFriend = post.bgm && friendFor(post.bgm.title);

  return (
    <article className="rounded-[24px] border border-cream-line bg-surface p-4 shadow-[0_6px_18px_rgba(75,46,32,0.05)]">
      <header className="flex items-center gap-3">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full" style={{ background: FRIEND_TINTS[friend] }}>
          <FriendAvatar friend={friend} size={40} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-cocoa-900">{post.nickname}</p>
          <p className="text-xs text-taupe-500">
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </p>
        </div>
        {right}
      </header>
      {post.topic && (
        <p className="mt-3 inline-block rounded-xl bg-cream px-3 py-1.5 text-[13px] text-taupe-500">
          <span className="font-semibold text-leaf-600">오목이의 질문</span> {post.topic}
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-cocoa-900">{post.content}</p>
      {post.bgm && bgmFriend && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-cream-line p-2.5">
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: FRIEND_TINTS[bgmFriend] }}>
            <FriendAvatar friend={bgmFriend} size={38} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-cocoa-900">{post.bgm.title}</p>
            <p className="text-xs text-taupe-500">배경음악</p>
          </div>
          <PlayButton track={{ title: post.bgm.title, url: post.bgm.url }} size="sm" tone="line" />
        </div>
      )}
    </article>
  );
}
