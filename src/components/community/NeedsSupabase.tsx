import { Omok } from '@/components/omok/Omok';

/** Supabase 환경 변수가 없을 때 (개발 중). 배포에서는 보이지 않아야 한다 */
export function NeedsSupabase() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-8 text-center">
      <Omok pose="peek" height={110} />
      <p className="mt-4 font-bold">커뮤니티가 아직 연결되지 않았어요</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        다른 사람과 글을 나누려면 Supabase 연결이 필요해요.
        <br />
        README의 &lsquo;직접 해야 할 일&rsquo;을 따라 환경 변수를 넣어 주세요.
      </p>
    </div>
  );
}
