'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PencilSimpleLineIcon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { Omok } from '@/components/omok/Omok';
import { Button, ButtonLink } from '@/components/ui/Button';
import { listPosts, PAGE_SIZE, type Post } from '@/lib/community';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { NeedsSupabase } from './NeedsSupabase';
import { PostCard } from './PostCard';

type Feed = { status: 'loading' } | { status: 'error' } | { status: 'ready'; posts: Post[]; more: boolean };

/** 탭 3: 다른 사람들의 오늘 이야기 */
export function CommunityScreen() {
  const supabase = useSupabase();
  const [feed, setFeed] = useState<Feed>({ status: 'loading' });
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    listPosts(supabase)
      .then((posts) => !cancelled && setFeed({ status: 'ready', posts, more: posts.length === PAGE_SIZE }))
      .catch(() => !cancelled && setFeed({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [supabase, attempt]);

  async function loadMore() {
    if (!supabase || feed.status !== 'ready' || loadingMore) return;
    setLoadingMore(true);
    try {
      const older = await listPosts(supabase, feed.posts[feed.posts.length - 1].createdAt);
      setFeed({ status: 'ready', posts: [...feed.posts, ...older], more: older.length === PAGE_SIZE });
    } catch {
      // 버튼이 그대로 남아 다시 누를 수 있다
    } finally {
      setLoadingMore(false);
    }
  }

  const writeButton = (
    <Link
      href="/community/write"
      aria-label="글쓰기"
      className="grid size-11 place-items-center rounded-full bg-yellow-500 text-ink-900 active:brightness-95"
    >
      <PencilSimpleLineIcon size={22} weight="bold" aria-hidden />
    </Link>
  );

  let body;
  if (supabase === null) body = <NeedsSupabase />;
  else if (supabase === undefined || feed.status === 'loading')
    body = (
      <div aria-label="글을 불러오는 중" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-3xl bg-line/60" />
        ))}
      </div>
    );
  else if (feed.status === 'error')
    body = (
      <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-8 text-center">
        <Omok pose="search" height={90} />
        <p className="mt-4 font-bold">글을 불러오지 못했어요</p>
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
    body = (
      <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-8 text-center">
        <Omok pose="lie" height={60} />
        <p className="mt-4 font-bold">아직 올라온 이야기가 없어요</p>
        <ButtonLink href="/community/write" className="mt-5 w-full">
          첫 글 쓰기
        </ButtonLink>
      </div>
    );
  else
    body = (
      <>
        <ul className="space-y-3">
          {feed.posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
        {feed.more && (
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore} className="w-full">
            {loadingMore ? '불러오는 중…' : '더 보기'}
          </Button>
        )}
      </>
    );

  return (
    <>
      <AppBar title="커뮤니티" right={supabase && writeButton} />
      <div className="space-y-3 px-4">
        {body}
      </div>
    </>
  );
}
