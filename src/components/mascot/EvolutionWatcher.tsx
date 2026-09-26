'use client';

import { usePathname, useRouter } from 'next/navigation';
import { shouldCelebrate } from '@/lib/progress';
import { realStage } from '@/lib/storage/selectors';
import { useOngi, useStore } from '@/lib/storage/useOngi';
import { EvolutionModal } from './EvolutionModal';

/** 실제 단계가 마지막으로 본 단계보다 높아지면 진화 연출을 띄운다 */
export function EvolutionWatcher() {
  const info = useOngi((s) => ({ real: realStage(s), lastSeen: s.profile.lastSeenStage, name: s.profile.birdName }));
  const store = useStore();
  const router = useRouter();
  const pathname = usePathname();

  if (!info) return null;

  function close() {
    store.setLastSeenStage(info!.real);
    if (pathname !== '/') router.push('/');
  }

  return (
    <EvolutionModal
      open={shouldCelebrate(info.lastSeen, info.real)}
      from={info.lastSeen}
      to={info.real}
      name={info.name}
      onClose={close}
    />
  );
}
