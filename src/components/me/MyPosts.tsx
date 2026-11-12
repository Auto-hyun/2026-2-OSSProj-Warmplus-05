'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TrashIcon } from '@phosphor-icons/react';
import { PostCard } from '@/components/community/PostCard';
import { toast } from '@/components/ui/Toast';
import { Empty } from '@/components/ui/Empty';
import { deletePost, listMyPosts, type Post } from '@/lib/community';
import { useSupabase } from '@/lib/supabase/useSupabase';

/** 내 계정(이 기기의 익명 계정, 또는 카카오로 로그인한 계정)으로 쓴 글. 지울 수 있다 */
export function MyPosts() {
  const supabase = useSupabase();
  const [posts, setPosts] = useState<Post[] | 'error' | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    listMyPosts(supabase)
      .then((list) => !cancelled && setPosts(list))
      .catch(() => !cancelled && setPosts('error'));
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (supabase === null) return <Empty>커뮤니티가 아직 연결되지 않았어요.</Empty>;
  if (supabase === undefined || posts === null) return <div className="h-24 animate-pulse rounded-3xl bg-line/60" />;
  if (posts === 'error') return <Empty>내가 쓴 글을 불러오지 못했어요.</Empty>;
  if (posts.length === 0) {
    return (
      <Empty>
        아직 쓴 글이 없어요.{' '}
        <Link href="/community/write" className="font-semibold text-leaf-600 underline underline-offset-2">
          글쓰러 가기
        </Link>
      </Empty>
    );
  }

  async function remove(post: Post) {
    if (!supabase || !window.confirm('이 글을 지울까요? 커뮤니티에서도 사라져요.')) return;
    try {
      await deletePost(supabase, post.id);
      setPosts((list) => (Array.isArray(list) ? list.filter((p) => p.id !== post.id) : list));
      toast('글을 지웠어요.');
    } catch (error) {
      toast(error instanceof Error ? error.message : '글을 지우지 못했어요.', { tone: 'error' });
    }
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard
            post={post}
            right={
              <button
                type="button"
                aria-label="글 지우기"
                onClick={() => remove(post)}
                className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 active:bg-black/5"
              >
                <TrashIcon size={18} aria-hidden />
              </button>
            }
          />
        </li>
      ))}
    </ul>
  );
}
