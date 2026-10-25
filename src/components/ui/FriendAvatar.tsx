import Image from 'next/image';
import { cn } from '@/lib/cn';

/** public/village/friends에 있는 감정 친구 얼굴 (동그랗게 잘린 그림) */
export const FRIENDS = ['green', 'yellow', 'purple', 'blue', 'pink'] as const;
export type Friend = (typeof FRIENDS)[number];

/** 친구 그림 뒤에 까는 옅은 바탕색 */
export const FRIEND_TINTS: Record<Friend, string> = { green: '#e6f1e1', yellow: '#fbf0d6', purple: '#f1e6f6', blue: '#e3ecf8', pink: '#fbe6e6' };

/** 글쓴이 이름 등 같은 값이면 늘 같은 친구가 나오게 고른다 */
export function friendFor(seed: string): Friend {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.codePointAt(0)!) | 0;
  return FRIENDS[Math.abs(h) % FRIENDS.length];
}

export function FriendAvatar({ friend, size, className }: { friend: Friend; size: number; className?: string }) {
  return (
    <Image
      src={`/village/friends/${friend}.webp`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={cn('shrink-0 rounded-full select-none', className)}
      style={{ width: size, height: size }}
    />
  );
}
