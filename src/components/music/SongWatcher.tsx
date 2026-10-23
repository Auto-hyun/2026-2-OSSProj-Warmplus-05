'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from '@/components/ui/Toast';
import { particle } from '@/lib/josa';
import { checkSong } from '@/lib/music/client';
import { useApp, useStore } from '@/lib/storage/useApp';

const POLL_MS = { sample: 2000, suno: 5000 } as const;
/** 이만큼 지나도 안 끝나면 멈춘다 */
const GIVE_UP_MS = 10 * 60_000;

/**
 * 작곡을 맡겨 둔 곡이 끝났는지 주기적으로 확인한다. 화면을 옮기거나 새로고침해도
 * 기다리던 작업(pending)이 기기에 남아 있어 이어서 확인한다.
 */
export function SongWatcher() {
  const pending = useApp((s) => s.pending);
  const store = useStore();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  const ids = pending?.map((p) => p.taskId).join(',') ?? '';

  useEffect(() => {
    if (!pending || pending.length === 0) return;
    let stopped = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const task of pending) {
      const check = async () => {
        if (stopped) return;
        if (Date.now() - new Date(task.startedAt).getTime() > GIVE_UP_MS) {
          store.failPending(task.taskId, '작곡이 너무 오래 걸려서 멈췄어요. 다시 만들어 볼까요?');
          return;
        }
        try {
          const status = await checkSong(task.taskId);
          if (stopped) return;
          if (status.state === 'done') {
            store.completePending(task.taskId, status.tracks);
            // 노래 만들기 탭에 있으면 결과가 바로 보이니 알림은 다른 화면에 있을 때만
            if (pathRef.current !== '/create') {
              toast(`오목이가 '${task.title}'${particle(task.title, '을/를')} 완성했어요!`, { action: { label: '들어 보기', href: '/create' } });
            }
            return;
          }
          if (status.state === 'failed') {
            store.failPending(task.taskId, status.reason);
            toast(status.reason, { tone: 'error' });
            return;
          }
        } catch {
          // 잠깐의 네트워크 오류는 다음 확인 때 다시 시도한다
        }
        timers.push(setTimeout(check, POLL_MS[task.mode]));
      };
      timers.push(setTimeout(check, POLL_MS[task.mode]));
    }

    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
    };
    // 기다리는 작업 목록이 바뀔 때만 다시 시작한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  return null;
}
