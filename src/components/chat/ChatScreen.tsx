'use client';

import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import { isValidDayKey } from '@/lib/date';
import { questionFor } from '@/lib/progress';
import { useOngi, useToday } from '@/lib/storage/useOngi';
import { ChatRoom } from './ChatRoom';

/** /chat → 오늘 대화, /chat?date=YYYY-MM-DD → 그날 대화(오늘이 아니면 읽기 전용) */
export function ChatScreen() {
  const params = useSearchParams();
  const today = useToday();
  const chats = useOngi((s) => s.chats);

  if (!today || !chats) {
    return (
      <div className="space-y-3 p-4 pt-20">
        <Skeleton className="h-16 w-3/4" />
      </div>
    );
  }

  const requested = params.get('date');
  const date = requested && isValidDayKey(requested) ? requested : today;
  const question = chats[date]?.question ?? questionFor(date);
  return <ChatRoom key={date} date={date} question={question} readOnly={date !== today} />;
}
