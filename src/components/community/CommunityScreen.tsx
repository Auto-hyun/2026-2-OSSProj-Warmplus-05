'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CaretRightIcon, HeartIcon, PencilSimpleIcon, PlantIcon } from '@phosphor-icons/react';
import { useAudio } from '@/components/audio/AudioProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Omok } from '@/components/omok/Omok';
import { Button, ButtonLink } from '@/components/ui/Button';
import { listPosts, PAGE_SIZE, type Post } from '@/lib/community';
import { cn } from '@/lib/cn';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { NeedsSupabase } from './NeedsSupabase';
import { PostCard } from './PostCard';

type Feed = { status: 'loading' } | { status: 'error' } | { status: 'ready'; posts: Post[]; more: boolean };

/** 글 분류: 배경음악이 붙은 글은 노래 나눔, 아니면 일상 이야기 */
type Filter = 'all' | 'daily' | 'music';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'daily', label: '일상 이야기' },
  { value: 'music', label: '노래 나눔' },
];

function matches(post: Post, filter: Filter): boolean {
  if (filter === 'daily') return !post.bgm;
  if (filter === 'music') return Boolean(post.bgm);
  return true;
}

/** 이야기 광장 (Figma): 다른 사람들의 오늘 이야기 */
export function CommunityScreen() {
  const supabase = useSupabase();
  const { current } = useAudio();
  const [feed, setFeed] = useState<Feed>({ status: 'loading' });
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');

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

  let body;
  if (supabase === null) body = <NeedsSupabase />;
  else if (supabase === undefined || feed.status === 'loading')
    body = (
      <div aria-label="글을 불러오는 중" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-[24px] bg-line/60" />
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
    body = (
      <div className="flex flex-col items-center rounded-[24px] border border-cream-line bg-surface px-5 py-8 text-center">
        <Omok pose="lie" height={60} />
        <p className="mt-4 font-bold text-cocoa-900">아직 올라온 이야기가 없어요</p>
        <ButtonLink href="/community/write" className="mt-5 w-full rounded-full! bg-leaf-600! text-white!">
          첫 글 쓰기
        </ButtonLink>
      </div>
    );
  else {
    const shown = feed.posts.filter((p) => matches(p, filter));
    body = (
      <>
        {shown.length === 0 ? (
          <p className="rounded-[24px] border border-dashed border-cream-line px-4 py-8 text-center text-sm text-taupe-500">이 분류의 글이 아직 없어요.</p>
        ) : (
          <ul className="space-y-3">
            {shown.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
        {feed.more && (
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore} className="w-full rounded-full! border-cream-line!">
            {loadingMore ? '불러오는 중…' : '더 보기'}
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title="커뮤니티" align="left" />
      <div className="space-y-4 px-4 pb-6">
        {/* 이야기 광장 소개 + 광장 그림 */}
        <section className="relative -mx-4 h-[150px] px-5 pt-2">
          <div className="relative z-10 max-w-[58%]">
            <h2 className="flex items-center gap-1.5 text-[25px] font-bold text-cocoa-900">
              이야기 광장
              <PlantIcon size={24} weight="duotone" className="text-leaf-600" aria-hidden />
            </h2>
            <p className="mt-1.5 text-[15px] font-bold text-cocoa-900">오늘의 마음을 나눠요.</p>
            <p className="mt-1.5 text-xs leading-relaxed text-taupe-500">
              작은 이야기들도 괜찮아요.
              <br />
              함께 나누면, 더 따뜻해져요.
            </p>
          </div>
          <Image src="/village/screens/plaza-hero.webp" alt="" width={523} height={342} preload sizes="240px" className="absolute -top-3 right-0 h-auto w-[232px] [mask-image:linear-gradient(to_right,transparent,#000_18%),linear-gradient(to_top,transparent,#000_18%)] [mask-composite:intersect]" />
        </section>

        {supabase && (
          <Link
            href="/community/write"
            className="flex items-center gap-4 rounded-[24px] border border-cream-line bg-surface px-5 py-4 shadow-[0_6px_18px_rgba(75,46,32,0.05)] transition-transform active:scale-[0.98]"
          >
            <HeartIcon size={32} weight="light" className="shrink-0 text-cocoa-900" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold text-cocoa-900">오늘, 나를 웃게 한 작은 순간은?</span>
              <span className="mt-0.5 block text-[13px] text-taupe-500">지금, 여러분의 이야기를 들려주세요.</span>
            </span>
            <CaretRightIcon size={18} className="shrink-0 text-taupe-500" aria-hidden />
          </Link>
        )}

        {supabase !== null && (
          <div role="group" aria-label="글 분류" className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'h-10 rounded-full px-4 text-sm font-semibold transition-colors',
                  filter === f.value ? 'bg-leaf-600 text-white' : 'border border-cream-line bg-surface text-cocoa-900 active:bg-black/5',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {body}
      </div>

      {/* 떠 있는 글쓰기 버튼 (재생 바가 뜨면 그 위로) */}
      {supabase && (
        <div
          className={cn(
            'pointer-events-none fixed inset-x-0 z-30 mx-auto flex max-w-[480px] justify-end px-4',
            current ? 'bottom-[calc(env(safe-area-inset-bottom)+156px)]' : 'bottom-[calc(env(safe-area-inset-bottom)+92px)]',
          )}
        >
          <Link
            href="/community/write"
            className="pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full bg-leaf-600 px-5 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(60,85,55,0.3)] transition-transform active:scale-95"
          >
            <PencilSimpleIcon size={18} aria-hidden />
            글쓰기
          </Link>
        </div>
      )}
    </>
  );
}
