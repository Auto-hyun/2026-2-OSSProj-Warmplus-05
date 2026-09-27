import type { SkyKind } from '@/data/intro';

/** "지금 내 마음의 창밖" 선택지 그림 */
export function IntroSky({ kind }: { kind: SkyKind }) {
  const frame = (opacity: number) => (
    <>
      <rect x="58" y="0" width="4" height="84" fill="#fff" opacity={opacity} />
      <rect x="0" y="40" width="120" height="4" fill="#fff" opacity={opacity} />
    </>
  );
  return (
    <svg viewBox="0 0 120 84" aria-hidden>
      {kind === 'sun' && (
        <>
          <rect width="120" height="84" fill="#cfe9fb" />
          <circle cx="84" cy="28" r="14" fill="#f7d749" />
          <rect x="0" y="66" width="120" height="18" fill="#bfe3b0" />
          {frame(0.9)}
        </>
      )}
      {kind === 'part' && (
        <>
          <rect width="120" height="84" fill="#d8e9f3" />
          <circle cx="86" cy="26" r="12" fill="#f7d749" />
          <g fill="#fff">
            <ellipse cx="38" cy="30" rx="20" ry="9" />
            <ellipse cx="50" cy="24" rx="12" ry="9" />
          </g>
          <rect x="0" y="66" width="120" height="18" fill="#c7ddb8" />
          {frame(0.9)}
        </>
      )}
      {kind === 'cloud' && (
        <>
          <rect width="120" height="84" fill="#d9dde2" />
          <g fill="#f4f5f7">
            <ellipse cx="34" cy="26" rx="22" ry="10" />
            <ellipse cx="46" cy="20" rx="13" ry="10" />
            <ellipse cx="88" cy="36" rx="22" ry="9" />
            <ellipse cx="98" cy="30" rx="12" ry="9" />
          </g>
          <rect x="0" y="66" width="120" height="18" fill="#c5cbc0" />
          {frame(0.8)}
        </>
      )}
      {kind === 'rain' && (
        <>
          <rect width="120" height="84" fill="#a9b3bf" />
          <g fill="#8f9aa7">
            <ellipse cx="36" cy="18" rx="24" ry="10" />
            <ellipse cx="86" cy="14" rx="24" ry="10" />
          </g>
          <g stroke="#e6edf5" strokeWidth="2" strokeLinecap="round">
            <path d="M20 34l-4 10M40 38l-4 10M62 32l-4 10M84 36l-4 10M104 32l-4 10M30 54l-4 10M72 56l-4 10M96 58l-4 10" />
          </g>
          <rect x="0" y="72" width="120" height="12" fill="#9aa596" />
          {frame(0.6)}
        </>
      )}
    </svg>
  );
}
