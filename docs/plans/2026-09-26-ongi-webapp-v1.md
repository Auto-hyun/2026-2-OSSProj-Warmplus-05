# 온기 웹앱 v1 Implementation Plan

> 작업은 Task 순서대로 진행하고, 각 단계는 체크박스(`- [ ]`)로 표시한다.
> 기능 코드는 테스트를 먼저 쓰고(실패 확인) → 구현 → 통과 확인 순서로 만든다.

**Goal:** 당근식 떠 있는 탭 바를 가진 모바일 웹앱(홈·대화 / 1일 1미션·진화 / 온기레터 아카이브 / 나의 온기)을 시연 가능한 수준으로 완성한다.

**Architecture:** Next.js 16 App Router 단일 프로젝트. 모든 사용자 데이터는 클라이언트 경량 스토어(`useSyncExternalStore`) + 저장 어댑터(localStorage/메모리)에 두고, 서버는 `/api/chat` 한 개(LLM 연결부 뒤 목업 구현)만 가진다. 콘텐츠(질문·미션·단계·카테고리·레터)는 `src/data`의 정적 데이터다.

**Tech Stack:** Next.js 16.3, React 19, TypeScript, Tailwind CSS v4, `@phosphor-icons/react`, `pretendard`, Vitest + Testing Library(jsdom), tsx(스크립트), Python PIL(에셋 가공용 로컬 스크립트, 저장소 밖).

**Spec:** `docs/specs/2026-09-26-ongi-webapp-design.md`

## Global Constraints

- 색 토큰: bg `#FDFAF5`, surface `#FFFFFF`, yellow-500 `#F7D749`, yellow-100 `#FFF4CC`, brown-600 `#85601E`, ink-900 `#2F2B28`, ink-600 `#6B655F`, ink-400 `#A39D96`, line `#EFE9DF`
- 노란 글씨·형광·그라데이션 금지, 노랑은 포인트(10~15%)로만, 글꼴은 Pretendard 하나
- 모바일 우선, PC는 가운데 480px 컬럼, 터치 영역 44px 이상, `prefers-reduced-motion` 대응
- 날짜는 항상 `Asia/Seoul` 기준 `YYYY-MM-DD`(DayKey), 기준일 `2026-01-01`
- 진화 기준 누적 미션: 1단계 0 / 2단계 3 / 3단계 7 / 4단계 15 / 5단계 30 (누적, 되돌아가지 않음)
- 대화: 사용자 메시지 최대 1,000자, 요청 메시지 최대 40개, 클라이언트는 질문 + 최근 20개만 전송
- 위기 도움 번호: 109(자살예방상담, 24시간), 1577-0199(정신건강위기상담, 24시간), 1388(청소년상담, 24시간), 112/119(긴급)
- 외부 링크: 고민편지 `https://ongibox.co.kr/onlineongibox`, 구독 `https://page.stibee.com/subscriptions/195023`, 온기 소개 `https://ongibox.co.kr/aboutongibox`, 레터 API `https://page.stibee.com/archives/195023/emails`
- 저장 키: `ongi:v1` (백업 `ongi:v1:backup`)
- 코드 주석·UI 문구는 한국어, 식별자는 영어

## Review Focus

1. **자정 전후 시간대** — 한국 00:30(UTC 전날 15:30)에 열면 "오늘"은 한국 날짜여야 한다 → Task 2 테스트 `todayKey(new Date('2026-09-25T15:30:00Z')) === '2026-09-26'`
2. **저장소 사용 불가·손상** — 사파리 사생활 보호 모드(localStorage 예외)나 깨진 JSON에서도 앱이 죽지 않고 기본 상태로 시작해야 한다 → Task 5 테스트(예외 던지는 storage → 메모리 어댑터, 깨진 JSON → 백업 후 기본 상태)
3. **완료 버튼 연타** — 같은 날 두 번 완료해도 1개만 기록되어야 한다 → Task 5 테스트 `completeMission` 2회 → 누적 1
4. **아주 긴 대화·긴 입력** — 1,001자 입력은 400, 60개 메시지 대화는 클라이언트가 21개(질문+20)로 잘라 보낸다 → Task 6·10 테스트
5. **띄어쓰기·관용 표현이 섞인 위기 표현** — "죽고 싶어요"/"죽고싶다"는 감지, "배고파 죽겠다"/"유서 깊은 곳"은 미감지 → Task 6 테스트
6. (보너스) **빌드 시점 날짜 고정** — 정적 프리렌더 때 서버 날짜가 박히면 안 된다 → 날짜·질문·미션은 `useToday()`(하이드레이션 후에만 값)로만 계산, 하이드레이션 전엔 스켈레톤 (Task 5 `useOngi` 반환 `undefined` 테스트)

---

## 파일 구조 (책임 단위)

```
src/
  app/
    layout.tsx               # 폰트·메타·뷰포트·SW 등록
    globals.css              # Tailwind v4 + @theme 토큰 + 공용 keyframes
    manifest.ts              # PWA 매니페스트
    not-found.tsx
    (tabs)/layout.tsx        # MobileShell + TabBar + 하단 여백
    (tabs)/page.tsx          # 홈
    (tabs)/mission/page.tsx
    (tabs)/letters/page.tsx
    (tabs)/me/page.tsx
    chat/page.tsx            # 대화방(전체 화면)
    letters/[id]/page.tsx    # 레터 상세(전체 화면, iframe)
    api/chat/route.ts        # LLM 연결부 호출
  components/
    layout/  MobileShell.tsx, TabBar.tsx, AppBar.tsx, ServiceWorkerRegister.tsx
    ui/      Button.tsx, BottomSheet.tsx, ConfirmDialog.tsx, ProgressBar.tsx, HelplineCard.tsx, Skeleton.tsx
    mascot/  Mascot.tsx, EvolutionModal.tsx, EvolutionWatcher.tsx
    home/    QuestionBubble.tsx, TodayMissionShortcut.tsx, GrowthLine.tsx
    chat/    ChatRoom.tsx, MessageBubble.tsx, QuickReplies.tsx, BridgeCard.tsx, ChatNotice.tsx
    mission/ TodayMissionCard.tsx, CompleteSheet.tsx, MissionCalendar.tsx, DayDetailSheet.tsx
    letters/ CategoryChips.tsx, LetterCard.tsx, LetterGrid.tsx
    me/      ProfileCard.tsx, StatsTiles.tsx, GrowthAlbum.tsx, ChatRecordList.tsx, OngiLinks.tsx, SettingsSection.tsx
    demo/    DemoPanel.tsx
  lib/
    date.ts, random.ts, progress.ts, safety.ts, letters.ts, chat-client.ts
    llm/     types.ts, validate.ts, provider.ts, mock.ts, persona.ts
    storage/ types.ts, adapters.ts, store.ts, selectors.ts, useOngi.ts
  data/
    questions.ts, missions.ts, stages.ts, categories.ts, links.ts, helplines.ts, letters.json
scripts/
  sync-letters.ts
public/
  mascot/stage-{1..5}.png, icons/icon-{192,512}.png, icons/maskable-512.png, letters/*.webp, sw.js
vitest.config.ts, vitest.setup.ts, .env.example
```

테스트 파일은 대상 옆에 `*.test.ts(x)`로 둔다.

---

### Task 1: 프로젝트 뼈대 + 도구 + 디자인 토큰

**Files:**
- Create: Next.js 기본 파일 일체, `vitest.config.ts`, `vitest.setup.ts`, `.env.example`, `src/app/globals.css`(교체), `src/app/layout.tsx`(교체), `src/lib/sanity.test.ts`(검증 후 삭제)
- Modify: `README.md`(실행 방법 섹션 추가), `.gitignore`(Next 기본)

**Interfaces:**
- Produces: `@/*` → `src/*` 경로 별칭, Tailwind 토큰 클래스(`bg-bg`, `bg-surface`, `bg-yellow-500`, `bg-yellow-100`, `text-brown-600`, `text-ink-900/600/400`, `border-line`), 폰트 변수 `--font-pretendard`, `npm test`(vitest run)

- [ ] **Step 1: 임시 폴더에서 create-next-app 실행 후 저장소 루트로 복사** (저장소에 README.md가 있어 직접 생성 불가)
  ```bash
  cd $TMP && npx create-next-app@16.3.6 ongi --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
  rsync -a --exclude .git --exclude README.md --exclude node_modules $TMP/ongi/ $REPO/ && cd $REPO && npm install
  ```
  (옵션 이름이 버전에 따라 다르면 `npx create-next-app@16.3.6 --help`로 확인 후 동일 의미로 실행)
- [ ] **Step 2: 의존성 추가**
  ```bash
  npm i @phosphor-icons/react pretendard
  npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths tsx
  ```
- [ ] **Step 3: Vitest 설정**
  ```ts
  // vitest.config.ts
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';
  import tsconfigPaths from 'vite-tsconfig-paths';
  export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], globals: true, css: false },
  });
  ```
  ```ts
  // vitest.setup.ts
  import '@testing-library/jest-dom/vitest';
  ```
  `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"sync:letters": "tsx scripts/sync-letters.ts"`
- [ ] **Step 4: 토큰·기본 스타일** — `globals.css`
  ```css
  @import "tailwindcss";
  @theme {
    --color-bg: #FDFAF5; --color-surface: #FFFFFF;
    --color-yellow-500: #F7D749; --color-yellow-100: #FFF4CC;
    --color-brown-600: #85601E;
    --color-ink-900: #2F2B28; --color-ink-600: #6B655F; --color-ink-400: #A39D96;
    --color-line: #EFE9DF;
    --font-sans: var(--font-pretendard), system-ui, sans-serif;
  }
  html, body { background: var(--color-bg); color: var(--color-ink-900); }
  body { -webkit-tap-highlight-color: transparent; word-break: keep-all; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  ```
- [ ] **Step 5: 루트 레이아웃** — `layout.tsx`: `next/font/local`로 `node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2` 로드(`variable: '--font-pretendard'`, `display: 'swap'`), `lang="ko"`, `metadata`(title "온기", description), `viewport`(`themeColor: '#FDFAF5'`, `viewportFit: 'cover'`, `width: 'device-width'`, `initialScale: 1`)
- [ ] **Step 6: 기본 페이지 정리** — create-next-app 기본 `page.tsx`·`page.module.css`·기본 SVG 제거(홈은 Task 7에서 `(tabs)/page.tsx`로 생성). 임시로 `src/app/page.tsx` 삭제 전 빌드 확인을 위해 `(tabs)/page.tsx`에 "온기" 텍스트만 둔다.
- [ ] **Step 7: `.env.example`**
  ```
  # LLM 연결부: mock(기본) | 추후 팀이 실제 LLM 구현체를 추가하면 그 이름
  LLM_PROVIDER=mock
  # (실제 LLM을 연동할 때 해당 API 키를 추가)
  ```
- [ ] **Step 8: README에 실행 방법 추가** (`npm install` → `npm run dev` → http://localhost:3000, `npm test`, `npm run sync:letters`, 스펙·계획 문서 링크)
- [ ] **Step 9: 검증** — `src/lib/sanity.test.ts`(`expect(1+1).toBe(2)`) 작성 → `npm test` PASS → 파일 삭제, `npm run build` 성공, `npm run lint` 오류 0

---

### Task 2: 날짜·난수 유틸

**Files:**
- Create: `src/lib/date.ts`, `src/lib/date.test.ts`, `src/lib/random.ts`, `src/lib/random.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type DayKey = string; // 'YYYY-MM-DD'
  export const EPOCH_DAY: DayKey; // '2026-01-01'
  export function todayKey(now?: Date, dayOffset?: number): DayKey;       // KST
  export function addDays(key: DayKey, n: number): DayKey;
  export function dayIndex(key: DayKey): number;                          // EPOCH_DAY부터 경과 일수
  export function daysBetween(from: DayKey, to: DayKey): number;          // to - from
  export function formatKoreanDate(key: DayKey): string;                  // '9월 26일 금요일'
  export function formatDotDate(iso: string): string;                     // KST 'YYYY.MM.DD'
  export function monthGrid(year: number, month: number): (DayKey | null)[]; // month 1~12, 일요일 시작, 앞칸 null, 길이 7의 배수
  export function isSameMonth(key: DayKey, year: number, month: number): boolean;

  export function hashString(s: string): number;                          // FNV-1a 32bit unsigned
  export function mulberry32(seed: number): () => number;                 // [0,1)
  export function seededShuffle<T>(items: readonly T[], seed: number): T[]; // 원본 불변
  ```

- [ ] **Step 1: 실패 테스트 작성** — 필수 케이스:
  - `todayKey(new Date('2026-09-25T15:30:00Z'))` → `'2026-09-26'` (Review Focus 1)
  - `todayKey(new Date('2026-09-25T14:59:59Z'))` → `'2026-09-25'`
  - `todayKey(new Date('2026-09-25T15:30:00Z'), 2)` → `'2026-09-28'`
  - `addDays('2026-02-28', 1)` → `'2026-03-01'`, `addDays('2026-01-01', -1)` → `'2025-12-31'`
  - `dayIndex('2026-01-01')` → 0, `dayIndex('2026-09-26')` → 268
  - `daysBetween('2026-09-20', '2026-09-26')` → 6
  - `formatKoreanDate('2026-09-26')` → `'9월 26일 토요일'` (2026-09-26은 토요일)
  - `formatDotDate('2026-08-28T20:00:01+09:00')` → `'2026.08.28'`
  - `monthGrid(2026, 9)`: 2026-09-01은 화요일 → 앞 null 2개, `grid[2] === '2026-09-01'`, 길이 35, 마지막 non-null `'2026-09-30'`
  - `hashString('abc')`가 매번 같은 값, `hashString('abc') !== hashString('abd')`
  - `seededShuffle([1..10], 42)`: 같은 시드 → 같은 결과, 원소 집합 동일, 원본 배열 불변, 다른 시드 → 다른 순서
- [ ] **Step 2: 실행해 실패 확인** — `npx vitest run src/lib/date.test.ts src/lib/random.test.ts` → FAIL(모듈 없음)
- [ ] **Step 3: 구현** — KST 변환은 `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' })`. DayKey 연산은 `Date.UTC(y, m-1, d)` 기반 정수 일수로 처리(시간대 영향 제거). 요일은 `['일','월','화','수','목','금','토'][new Date(Date.UTC(y,m-1,d)).getUTCDay()]`.
- [ ] **Step 4: 통과 확인** — 같은 명령 PASS

---

### Task 3: 콘텐츠 데이터 (질문·미션·단계·카테고리·링크·도움 번호)

**Files:**
- Create: `src/data/questions.ts`, `src/data/missions.ts`, `src/data/stages.ts`, `src/data/categories.ts`, `src/data/links.ts`, `src/data/helplines.ts`, `src/data/data.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const QUESTIONS: readonly string[]; // 60개 이상, 중복 없음, 모두 '?'로 끝남
  export type MissionTheme = 'body' | 'outside' | 'connect' | 'mind' | 'joy';
  export type Mission = { id: string; emoji: string; title: string; description: string; theme: MissionTheme };
  export const MISSIONS: readonly Mission[]; // 40개 이상, id 고유(kebab-case), 테마별 6개 이상
  export const MISSION_THEME_LABEL: Record<MissionTheme, string>; // 몸/바깥/연결/마음/작은 기쁨
  export function getMission(id: string): Mission | undefined;

  export type StageNo = 1 | 2 | 3 | 4 | 5;
  export type Stage = { no: StageNo; name: string; description: string; minMissions: number; image: string };
  export const STAGES: readonly Stage[]; // minMissions [0,3,7,15,30], image '/mascot/stage-N.png'
  export function getStage(no: StageNo): Stage;

  export type CategoryId = 'love'|'family'|'relationship'|'career'|'work'|'self'|'anxiety'|'loneliness'|'daily'|'news';
  export type Category = { id: CategoryId; label: string; emoji: string; tint: string };
  export const CATEGORIES: readonly Category[]; // 스펙 §5.2 표 그대로(순서 동일)
  export function getCategory(id: CategoryId): Category;
  export function isCategoryId(v: unknown): v is CategoryId;

  export const LINKS: { onlineLetter; subscribe; about; archiveApi } (as const, Global Constraints 값)
  export type Helpline = { name: string; number: string; note: string };
  export const HELPLINES: readonly Helpline[]; // 109, 1577-0199, 1388, 112/119 순
  ```
- 단계 이름·설명은 스펙 §4.5 표 문구 그대로.

- [ ] **Step 1: 실패 테스트** — `data.test.ts`: QUESTIONS 길이 ≥ 60·중복 없음·`?`로 끝남 / MISSIONS 길이 ≥ 40·id 고유·kebab-case 정규식·테마별 ≥ 6·title ≤ 20자 / STAGES minMissions `[0,3,7,15,30]` 엄격 증가·no 1~5 / CATEGORIES 10개·id 고유 / HELPLINES 첫 항목 number `'109'`
- [ ] **Step 2: 실패 확인** — `npx vitest run src/data` FAIL
- [ ] **Step 3: 데이터 작성** — 질문 60개(마음 날씨·작은 기쁨·요즘의 나·관계·쉼·감사 등 가벼운 주제, 연속 날짜에 비슷한 주제가 몰리지 않게 섞어서), 미션 40개(테마당 8개: 예 몸-산책 10분·스트레칭 5분·물 한 잔 천천히, 바깥-카페 가기·햇볕 5분·안 가본 골목 걷기, 연결-안부 문자·가족에게 전화·고마운 사람에게 한 줄, 마음-고마운 일 1개 적기·좋아하는 노래 3곡·5분 멍때리기, 작은 기쁨-좋아하는 간식·하늘 사진·이불 개기·책상 5분 정리)
- [ ] **Step 4: 통과 확인** — `npx vitest run src/data` PASS

---

### Task 4: 진행 로직 (단계·오늘의 질문·오늘의 미션)

**Files:**
- Create: `src/lib/progress.ts`, `src/lib/progress.test.ts`

**Interfaces:**
- Consumes: `dayIndex`, `hashString`, `seededShuffle`, `QUESTIONS`, `MISSIONS`, `STAGES`
- Produces:
  ```ts
  export function stageForCount(count: number): StageNo;
  export function nextStageInfo(count: number): { current: StageNo; next: StageNo | null; remaining: number; ratio: number }; // ratio 0~1 (현재 단계 구간 내 진행률), 5단계면 next null·remaining 0·ratio 1
  export function questionFor(key: DayKey): string;               // QUESTIONS[dayIndex % N] (음수 인덱스 보정)
  export function missionScheduleFor(installId: string): Mission[]; // seededShuffle(MISSIONS, hashString(installId))
  export function missionFor(installId: string, key: DayKey, swappedId?: string): Mission; // swappedId 있으면 그 미션
  export function swapCandidateFor(installId: string, key: DayKey): Mission; // schedule[(i + floor(N/2)) % N]
  export function shouldCelebrate(lastSeen: StageNo, current: StageNo): boolean; // current > lastSeen
  ```

- [ ] **Step 1: 실패 테스트** — `stageForCount`: 0→1, 2→1, 3→2, 6→2, 7→3, 14→3, 15→4, 29→4, 30→5, 100→5 / `nextStageInfo(5)` → `{current:2,next:3,remaining:2,ratio:0.5}` / `nextStageInfo(30)` → `{current:5,next:null,remaining:0,ratio:1}` / `questionFor` 연속 2일 다른 질문·같은 날 같은 값·`'2025-12-31'`(음수 인덱스)도 정상 / `missionFor` 같은 installId·날짜 → 같은 미션, 연속 N일(MISSIONS.length) 중복 없음 / `swapCandidateFor(...).id !== missionFor(...).id` / `missionFor(id, key, 'walk-10')`는 walk-10 / `shouldCelebrate(1,2)` true, `(2,2)` false, `(3,2)` false
- [ ] **Step 2: 실패 확인** — `npx vitest run src/lib/progress.test.ts` FAIL
- [ ] **Step 3: 구현**
- [ ] **Step 4: 통과 확인** — PASS

---

### Task 5: 저장 계층 + 스토어 + 훅

**Files:**
- Create: `src/lib/storage/types.ts`, `adapters.ts`, `store.ts`, `selectors.ts`, `useOngi.ts`, `adapters.test.ts`, `store.test.ts`, `selectors.test.ts`, `useOngi.test.tsx`

**Interfaces:**
- Consumes: `todayKey`, `addDays`, `dayIndex`, `isSameMonth`, `missionFor`, `swapCandidateFor`, `stageForCount`, `StageNo`
- Produces:
  ```ts
  // types.ts — 스펙 §7.1의 OngiState 그대로 + 아래 보조 타입
  export type ChatRole = 'user' | 'assistant';
  export type StoredMessage = { role: ChatRole; content: string; at: string };
  export type ChatDay = { question: string; messages: StoredMessage[]; bridgeShown: boolean };
  export type MissionRecord = { missionId: string; note?: string; completedAt: string; demo?: boolean };
  export interface StorageAdapter { readonly persistent: boolean; load(): OngiState | null; save(state: OngiState): void; }

  // adapters.ts
  export const STORAGE_KEY = 'ongi:v1'; export const BACKUP_KEY = 'ongi:v1:backup';
  export function createDefaultState(now: Date, installId?: string): OngiState; // birdName '뱁새', lastSeenStage 1, settings 전부 기본(false/0/null)
  export function parseState(raw: string | null): OngiState | null;           // JSON 파싱 + version===1 + 필수 키 확인, 실패 null
  export function createLocalStorageAdapter(storage?: Storage): StorageAdapter | null; // setItem/removeItem 시험 실패 시 null
  export function createMemoryAdapter(initial?: OngiState | null): StorageAdapter;   // persistent=false

  // store.ts
  export type OngiStore = {
    getState(): OngiState;
    subscribe(listener: () => void): () => void;
    todayKey(): DayKey;                                        // 시계 + settings.dayOffset
    completeMission(input?: { note?: string }): { ok: boolean }; // 오늘 이미 완료면 ok:false, note 100자 자르기
    swapMission(): { ok: boolean };                            // 오늘 이미 교체/완료면 ok:false
    appendChatMessage(key: DayKey, question: string, msg: { role: ChatRole; content: string }): void; // ChatDay 없으면 생성
    markBridgeShown(key: DayKey): void;
    renameBird(name: string): { ok: boolean };                 // trim 후 1~10자만 허용
    setLastSeenStage(stage: StageNo): void;
    markChatNoticeSeen(): void;
    resetAll(): void;                                          // installId 유지, 나머지 기본값
    demo: {
      setEnabled(on: boolean): void;
      addCompletion(): void;          // 오늘 이전에서 기록 없는 가장 최근 날짜에 demo:true 기록 (그 날짜의 missionFor 미션)
      shiftDay(delta: number): void;  // dayOffset += delta
      resetDay(): void;               // dayOffset = 0
      setStageOverride(stage: StageNo | null): void;
    };
  };
  export function createStore(adapter: StorageAdapter, clock?: () => Date): OngiStore;
  // load 실패(null) 시: 원문이 있으면 BACKUP_KEY에 보관(localStorage 어댑터 한정) 후 createDefaultState

  // selectors.ts
  export function completedCount(s: OngiState): number;
  export function realStage(s: OngiState): StageNo;           // stageForCount(completedCount)
  export function displayStage(s: OngiState): StageNo;        // settings.stageOverride ?? realStage
  export function monthCompletedCount(s: OngiState, year: number, month: number): number;
  export function talkedDaysCount(s: OngiState): number;      // user 메시지 1개 이상인 날 수
  export function daysTogether(s: OngiState, today: DayKey): number; // daysBetween(startedOn, today) + 1

  // useOngi.ts ('use client')
  export function getBrowserStore(): OngiStore;              // 싱글턴. localStorage 어댑터 실패 시 메모리 어댑터
  export function useOngi<T>(selector: (s: OngiState) => T): T | undefined; // 서버/하이드레이션 전 undefined
  export function useStore(): OngiStore;
  export function useToday(): DayKey | undefined;            // 하이드레이션 후 store.todayKey()
  export function useIsPersistent(): boolean | undefined;
  ```

- [ ] **Step 1: 실패 테스트**
  - adapters: `parseState('not json')` null / `parseState(JSON.stringify({version:2}))` null / 기본 상태 round-trip / `setItem`이 throw하는 가짜 Storage → `createLocalStorageAdapter` null (Review Focus 2)
  - store(메모리 어댑터 + 고정 시계 `2026-09-26T01:00:00Z`): `completeMission()` 2회 → 두 번째 ok:false, `completedCount` 1 (Review Focus 3) / note 150자 → 100자 저장 / `swapMission()` 후 `missions.swaps['2026-09-26']` = `swapCandidateFor` id, 두 번째 swap ok:false, 교체 후 완료 시 기록 missionId = 교체 미션 / `appendChatMessage`로 ChatDay 생성·누적 / `renameBird('  ')` ok:false, `renameBird('가나다라마바사아자차카')`(11자) ok:false, `renameBird(' 콩이 ')` → '콩이' / `demo.addCompletion()` 3회 → 2026-09-25, 24, 23에 demo 기록 / `demo.shiftDay(1)` 후 `todayKey()` '2026-09-27' / `resetAll()` 후 installId 동일·기록 0 / 구독자 호출 확인
  - 깨진 JSON이 저장된 localStorage(가짜 Storage 객체) → `createStore(createLocalStorageAdapter(fake)!)` 기본 상태 + `fake.getItem(BACKUP_KEY)` = 원문 (Review Focus 2)
  - selectors: 기록 5개 → `realStage` 2, `stageOverride:4` → `displayStage` 4·`realStage` 2 / `monthCompletedCount` 월 경계 / `talkedDaysCount`는 assistant만 있는 날 제외 / `daysTogether(startedOn=오늘)` 1
  - useOngi: `renderHook`에서 첫 렌더 후(effect 이후) 값 존재, `renderToString`에서는 `undefined` (Review Focus 6)
- [ ] **Step 2: 실패 확인** — `npx vitest run src/lib/storage` FAIL
- [ ] **Step 3: 구현** — 상태 변경은 항상 새 객체로 교체 → `adapter.save` → 리스너 호출. `useOngi`는 `useSyncExternalStore(subscribe, getSnapshot, () => undefined)` + 선택 결과 참조 안정화(`useRef`로 직전 결과 비교). `installId`는 `crypto.randomUUID()`.
- [ ] **Step 4: 통과 확인** — PASS

---

### Task 6: 안전장치 + LLM 연결부 + `/api/chat`

**Files:**
- Create: `src/lib/safety.ts`, `src/lib/safety.test.ts`, `src/lib/llm/types.ts`, `validate.ts`, `provider.ts`, `mock.ts`, `persona.ts`, `validate.test.ts`, `mock.test.ts`, `src/app/api/chat/route.ts`, `src/app/api/chat/route.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function detectCrisis(text: string): boolean;   // 공백 제거 후 스펙 §3.6 패턴
  export const SAFETY_MESSAGE: string;                    // 고정 위로 문구

  export type ChatMessage = { role: 'user' | 'assistant'; content: string };
  export interface LLMProvider { streamReply(input: { system: string; messages: ChatMessage[] }): AsyncIterable<string>; }
  export const MAX_USER_CHARS = 1000; export const MAX_MESSAGES = 40;
  export function validateChatRequest(body: unknown): { ok: true; messages: ChatMessage[] } | { ok: false; error: string };
  export function getProvider(env?: Record<string, string | undefined>): LLMProvider; // 'mock'·미설정 → mock, 그 외 → Error('지원하지 않는 LLM_PROVIDER')
  export type MockBucket = 'tired' | 'lonely' | 'anxious' | 'sad' | 'angry' | 'happy' | 'default';
  export function pickBucket(text: string): MockBucket;
  export function createMockProvider(opts?: { delayMs?: number; random?: () => number }): LLMProvider;
  export const PERSONA_PROMPT: string;
  // route.ts
  export async function POST(req: Request): Promise<Response>;
  ```

- [ ] **Step 1: 실패 테스트**
  - safety: 감지 — "죽고 싶어요", "요즘 죽고싶다는 생각", "자해를 했어", "사라지고 싶어", "살기 싫어", "극단적 선택" / 미감지 — "배고파 죽겠다", "피곤해 죽겠어", "유서 깊은 동네에 갔어", "일을 끝내고 싶어", "" (Review Focus 5)
  - validate: 정상 통과 / body가 배열 아님 → error / 마지막이 assistant → error / user 1,001자 → error (Review Focus 4) / 41개 → error / role 이상값 → error / 빈 user → error
  - mock: `pickBucket('너무 피곤해')` tired, `'외로워'` lonely, `'불안해'` anxious, `'속상해'` sad, `'짜증나'` angry, `'좋은 일이 있었어요'` happy, `'음'` default / `createMockProvider({delayMs:0})` 스트림을 모두 이으면 비어있지 않은 문자열이고 '?'를 포함
  - route: `POST`에 1,001자 → 400 JSON / "죽고 싶어" → 200 `application/json` `{type:'safety'}` / 정상 → 200 `text/plain` 본문 비어있지 않음 / JSON 아닌 body → 400 (테스트에서 `process.env.LLM_PROVIDER='mock'`, `MOCK_DELAY_MS=0`)
- [ ] **Step 2: 실패 확인** — `npx vitest run src/lib/safety.test.ts src/lib/llm src/app/api` FAIL
- [ ] **Step 3: 구현** — route는 `ReadableStream` + `TextEncoder`로 청크 전달, 헤더 `Content-Type: text/plain; charset=utf-8`, `Cache-Control: no-store`. 모델 오류 시 스트림 시작 전이면 502 JSON. mock 지연은 `Number(process.env.MOCK_DELAY_MS ?? 25)`. `persona.ts`는 스펙 §3.5 규칙을 한국어 시스템 프롬프트로 작성(호칭·존댓말·2~4문장·공감 먼저·조언/판단/진단 금지·질문 하나·위기 시 109 안내·의료/법률 자문 금지·온기우편함은 대화가 충분히 이어졌을 때만 가볍게 소개).
- [ ] **Step 4: 통과 확인** — PASS

---

### Task 7: 앱 셸 (MobileShell·TabBar·AppBar·UI 기본 부품)

**Files:**
- Create: `src/components/layout/MobileShell.tsx`, `TabBar.tsx`, `TabBar.test.tsx`, `AppBar.tsx`, `StorageNotice.tsx`, `src/components/ui/Button.tsx`, `BottomSheet.tsx`, `ConfirmDialog.tsx`, `ProgressBar.tsx`, `HelplineCard.tsx`, `Skeleton.tsx`, `src/app/(tabs)/layout.tsx`, `(tabs)/page.tsx`·`mission/page.tsx`·`letters/page.tsx`·`me/page.tsx`(각 AppBar만 있는 임시 화면)

**Interfaces:**
- Consumes: `HELPLINES`
- Produces:
  ```tsx
  <MobileShell>{children}</MobileShell>                  // max-w-[480px] mx-auto min-h-dvh bg-bg
  <TabBar />                                              // usePathname으로 활성 탭, '/'는 정확히 일치, 나머지는 startsWith
  <AppBar title: string; right?: ReactNode; onBack?: () => void; backHref?: string />
  <Button variant: 'primary'|'secondary'|'ghost'; size?: 'md'|'lg'; full?: boolean; ...button props />
  <BottomSheet open: boolean; onClose: () => void; title?: string>{children}</BottomSheet> // 배경 탭·ESC로 닫힘, role="dialog"
  <ConfirmDialog open; title; description?; confirmLabel; onConfirm; onCancel />
  <ProgressBar value: number /* 0~1 */; label?: string />
  <HelplineCard />                                        // HELPLINES 목록 + tel: 링크
  <Skeleton className? />
  <StorageNotice />                                       // useIsPersistent()===false면 상단 1줄 안내 "이 브라우저에서는 기록이 저장되지 않아요"
  ```
- 탭 정의 배열(라벨·경로·아이콘): `[{label:'홈',href:'/',icon:House},{label:'미션',href:'/mission',icon:Footprints},{label:'온기레터',href:'/letters',icon:EnvelopeSimple},{label:'나의 온기',href:'/me',icon:User}]`

- [ ] **Step 1: 실패 테스트** — `TabBar.test.tsx`: `next/navigation`의 `usePathname`을 `vi.mock`으로 `'/letters'` 반환 → '온기레터' 링크에 `aria-current="page"`, '홈'에는 없음 / `'/'` → '홈'만 current / `'/mission'` → '미션'만
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 구현** — TabBar: `fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pointer-events-none` 래퍼 안에 `pointer-events-auto h-16 rounded-full bg-white/75 backdrop-blur-xl border border-black/5 shadow-[0_8px_24px_rgba(47,43,40,0.12)] flex p-1.5`. 항목 `flex-1 rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px]`, 활성 `bg-yellow-100 text-ink-900 font-semibold` + `weight="fill"`, 비활성 `text-ink-400` + `weight="regular"`, 아이콘 24px. `(tabs)/layout.tsx`: MobileShell + StorageNotice + `<main className="pb-28">` + TabBar. AppBar: `sticky top-0 z-30 h-14 px-4 flex items-center bg-bg/85 backdrop-blur` 제목 `text-xl font-bold`, pt safe-area.
- [ ] **Step 4: 통과 확인 + 수동 확인** — `npm test` PASS, `npm run dev` 후 390px 뷰포트에서 탭 이동 확인

---

### Task 8: 마스코트 에셋 + `Mascot` + 진화 연출

**Files:**
- Create: `$TMP/crop_mascot.py`(저장소 밖 임시 스크립트), `public/mascot/stage-1.png`~`stage-5.png`, `src/components/mascot/Mascot.tsx`, `EvolutionModal.tsx`, `EvolutionWatcher.tsx`, `EvolutionModal.test.tsx`
- Modify: `src/app/globals.css`(keyframes 추가), `src/app/(tabs)/layout.tsx`(EvolutionWatcher 장착)

**Interfaces:**
- Consumes: `STAGES`, `getStage`, `shouldCelebrate`, `useOngi`, `useStore`, `realStage`
- Produces:
  ```tsx
  <Mascot stage: StageNo; size: 'sm' | 'md' | 'lg'; animated?: boolean; interactive?: boolean /* 탭 시 폴짝+말풍선 */ />
  // sm 40px, md 96px, lg 208px (정사각형)
  <EvolutionModal from: StageNo; to: StageNo; open: boolean; onClose: () => void />
  <EvolutionWatcher />  // realStage > lastSeenStage면 모달 표시 → 닫을 때 setLastSeenStage(realStage)
  ```

- [ ] **Step 1: 에셋 자르기** — 팀 마스코트 시안(5단계 합성 이미지, 1712×664)에서 배경색(`#FDFAF5` ±6)과 다른 픽셀의 열 분포로 새 5마리의 x 범위를 찾고, y는 라벨 알약(노란 원형 배경) 위쪽까지로 제한 → 각 새를 정사각형(여백 포함, 가로 중심·바닥 정렬) 캔버스 배경 `#FDFAF5`에 배치 → 512×512 PNG 저장. 결과를 이미지로 열어 5장 모두 잘림 없는지 육안 확인
- [ ] **Step 2: 1단계 분할 좌표 측정** — `stage-1.png`에서 금 간 틈(어두운 띠)과 눈 영역의 y 범위·지그재그 꼭짓점을 픽셀 분석으로 구해 `clip-path: polygon()` 백분율 좌표 3세트(윗껍질 / 틈 / 아랫껍질) 산출, 결과 이미지를 합성해 확인
- [ ] **Step 3: 실패 테스트** — `EvolutionModal.test.tsx`: `open` + `to=2` → "뱁새가 자랐어요!"와 `getStage(2).name`·`description` 표시, "홈에서 만나기" 클릭 → `onClose` 호출 / `open=false` → 아무것도 렌더 안 함
- [ ] **Step 4: 실패 확인**
- [ ] **Step 5: 구현** — keyframes: `ongi-breathe`(scale 1→1.03, 3s), `ongi-hop`(translateY 0→-10px→0, 0.45s), `ongi-lid`(윗껍질 translateY 0→-7px + rotate -4deg → 0, 2.4s, 60~75% 구간에서 들썩), `ongi-pop`(진화 시 scale .6→1). 1단계: 같은 이미지 3겹(`clip-path`) + 틈 뒤 어두운 타원(`#3B2F2A`). 이미지 `next/image`(unoptimized 아님, `priority` lg일 때), `alt`는 단계명. interactive 탭 시 랜덤 한마디(5개 중) 1.8초 말풍선.
- [ ] **Step 6: 통과 확인** — PASS + 개발 서버에서 5단계 모두 표시·1단계 들썩 확인(임시로 `?demo=1`은 Task 15 전이므로 스토리 확인용 `/dev/mascot` 없이 홈에서 stageOverride를 콘솔로 바꿔 확인)

---

### Task 9: 홈 화면

**Files:**
- Create: `src/components/home/QuestionBubble.tsx`, `GrowthLine.tsx`, `TodayMissionShortcut.tsx`, `src/components/home/home.test.tsx`
- Modify: `src/app/(tabs)/page.tsx`

**Interfaces:**
- Consumes: `useToday`, `useOngi`, `questionFor`, `missionFor`, `displayStage`, `realStage`, `completedCount`, `nextStageInfo`, `formatKoreanDate`, `Mascot`, `ProgressBar`, `Button`, `Skeleton`
- Produces: `<QuestionBubble question: string />`, `<GrowthLine count: number />`, `<TodayMissionShortcut mission: Mission; done: boolean />`

- [ ] **Step 1: 실패 테스트** — `GrowthLine`: count 5 → "다음 성장까지 미션 2개", count 30 → "뱁새가 다 자랐어요!" / `TodayMissionShortcut`: done=false → "하러 가기", done=true → "완료"
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 구현** — 스펙 §3.1 순서. 하이드레이션 전(`useToday()===undefined`)엔 Skeleton. CTA 문구: 오늘 ChatDay에 user 메시지 있으면 "이어서 이야기하기", 아니면 "편하게 털어놓기" → `/chat`. GrowthLine·Shortcut은 `/mission` 링크.
- [ ] **Step 4: 통과 확인 + 390px 스크린샷 확인**

---

### Task 10: 대화방

**Files:**
- Create: `src/lib/chat-client.ts`, `src/lib/chat-client.test.ts`, `src/components/chat/ChatRoom.tsx`, `MessageBubble.tsx`, `QuickReplies.tsx`, `BridgeCard.tsx`, `ChatNotice.tsx`, `src/app/chat/page.tsx`

**Interfaces:**
- Consumes: `/api/chat`, `useStore`, `useOngi`, `useToday`, `questionFor`, `HelplineCard`, `LINKS`, `SAFETY_MESSAGE`(표시는 서버 응답 message 사용)
- Produces:
  ```ts
  export const QUICK_REPLIES: readonly string[]; // ['잘 모르겠어요','그냥 좀 지쳤어요','좋은 일이 있었어요']
  export function buildRequestMessages(question: string, messages: StoredMessage[], limit?: number): ChatMessage[]; // [assistant 질문, ...최근 limit(20)개]
  export type ReplyResult = { type: 'text'; text: string } | { type: 'safety'; message: string };
  export async function requestReply(messages: ChatMessage[], onChunk: (text: string) => void, fetchImpl?: typeof fetch): Promise<ReplyResult>; // 비정상 status → throw
  export const BRIDGE_AFTER_USER_MESSAGES = 3;
  ```
  ```tsx
  <ChatRoom date: DayKey; readOnly: boolean />
  <MessageBubble role: ChatRole; content: string; pending?: boolean; failed?: boolean; onRetry?: () => void />
  <QuickReplies onPick: (text: string) => void />
  <BridgeCard />  <ChatNotice onClose />
  ```
- 안전 응답은 채팅 기록에 assistant 메시지로 `message`를 저장하고, 해당 메시지 아래에 HelplineCard를 붙인다(메시지 내용이 SAFETY_MESSAGE와 같으면 카드 표시).

- [ ] **Step 1: 실패 테스트** — `buildRequestMessages('Q', 60개)` → 길이 21, 첫 항목 `{role:'assistant',content:'Q'}`, 마지막 = 60번째 (Review Focus 4) / `requestReply` 가짜 fetch: text/plain 스트림 청크 2개 → onChunk 2회·text 결합 / application/json safety → `{type:'safety'}` / 502 → throw
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 구현** — `chat/page.tsx`: `useSearchParams`의 `date`가 오늘과 다르면 readOnly(Suspense 경계로 감싸기). 전송 흐름: user 메시지 저장 → pending 말풍선("···") → `requestReply` 스트리밍 표시 → 완료 시 assistant 저장. 실패 시 user 말풍선 failed + "다시 보내기"(같은 요청 재시도). 빠른 답은 user 메시지 0개일 때만. user 메시지 수 ≥ 3이고 `bridgeShown=false`면 BridgeCard 표시 후 `markBridgeShown`. `seenChatNotice=false`면 ChatNotice 표시 후 `markChatNoticeSeen`. 오프라인(`navigator.onLine===false`/`offline` 이벤트) 안내 띠. 입력창 `maxLength={1000}`, 빈 값 전송 버튼 비활성, 하단 safe-area.
- [ ] **Step 4: 통과 확인 + 수동 확인** — 빠른 답 → 목업 답장 스트리밍, "죽고 싶어" → 도움 카드, 새로고침 후 대화 유지, `/chat?date=이전날짜` 읽기 전용

---

### Task 11: 미션 탭

**Files:**
- Create: `src/components/mission/TodayMissionCard.tsx`, `CompleteSheet.tsx`, `MissionCalendar.tsx`, `DayDetailSheet.tsx`, `mission.test.tsx`
- Modify: `src/app/(tabs)/mission/page.tsx`

**Interfaces:**
- Consumes: `useStore`, `useOngi`, `useToday`, `missionFor`, `getMission`, `monthGrid`, `isSameMonth`, `monthCompletedCount`, `completedCount`, `nextStageInfo`, `getStage`, `BottomSheet`, `ProgressBar`, `Button`
- Produces:
  ```tsx
  <TodayMissionCard mission: Mission; done: boolean; note?: string; canSwap: boolean; onComplete: () => void; onSwap: () => void />
  <CompleteSheet open; mission: Mission; onClose; onSubmit: (note: string) => void />   // note maxLength 100
  <MissionCalendar year; month; today: DayKey; records: Record<DayKey, MissionRecord>; onPrev; onNext; onPickDay: (key: DayKey) => void />
  <DayDetailSheet open; dayKey: DayKey | null; record?: MissionRecord; onClose />
  ```

- [ ] **Step 1: 실패 테스트** — `TodayMissionCard` "완료했어요" 클릭 → onComplete / done=true → 완료 문구·버튼 없음 / `CompleteSheet`에 메모 입력 후 "완료" → onSubmit('메모') / `MissionCalendar` 2026-09, records에 '2026-09-03' → 3일 셀에 `aria-label`에 "완료" 포함, 기록 없는 날은 "완료" 없음·빨간 표시 없음
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 구현** — 페이지: 오늘의 미션 카드(교체 1회: `missions.swaps[today]` 없고 미완료일 때만 canSwap) → 완료 시트 → `completeMission({note})` → 토스트 "잘했어요! 뱁새가 기뻐해요"(2초) → 진화는 EvolutionWatcher가 처리. 캘린더 월 이동 상태는 페이지 로컬 state(기본 = 오늘의 연·월). 요약 "이번 달 N일 · 누적 N개", 오늘 미완료 시 "오늘 못 해도 괜찮아요. 내일 또 만나요.", 하단 성장 바(`getStage(current).name` + ProgressBar + 남은 개수).
- [ ] **Step 4: 통과 확인 + 수동 확인** — 완료 → 캘린더 도장 → 3번째 완료(시연 모드 이전엔 dayOffset을 콘솔로) 시 진화 모달

---

### Task 12: 온기레터 데이터 (정리·병합·동기화·초기 분류)

**Files:**
- Create: `src/lib/letters.ts`, `src/lib/letters.test.ts`, `scripts/sync-letters.ts`, `src/data/letters.json`
- (분류 작업용 임시 파일은 저장소 밖 임시 폴더에만)

**Interfaces:**
- Consumes: `CategoryId`, `isCategoryId`, `LINKS.archiveApi` (letters.ts는 스크립트에서도 쓰므로 `@/` 별칭 없이 상대 경로만 import)
- Produces:
  ```ts
  export type RawEmail = { id: number; pid: number; subject: string; previewText: string; permanentLink: string; sentTime: string };
  export type Letter = { id: number; pid: number; title: string; preview: string; link: string; sentAt: string; category: CategoryId | 'uncategorized'; image?: string };
  export function cleanText(s: string): string;
  export function toLetter(raw: RawEmail): Letter;                 // category 'uncategorized'
  export function mergeLetters(existing: Letter[], fetched: RawEmail[]): { letters: Letter[]; added: Letter[] }; // 기존 category·image 보존, 텍스트는 최신으로 갱신, sentAt 내림차순
  export function extractEmoji(title: string): string | null;      // 제목 속 마지막 그림 이모지(\p{Extended_Pictographic} + 변형 선택자)
  export function filterLetters(letters: Letter[], category: CategoryId | 'all'): Letter[]; // 'all'은 전체, 최신순
  ```
- `letters.json`은 `Letter[]` 164개, 모든 항목 `category`가 10개 id 중 하나

- [ ] **Step 1: 실패 테스트** — `cleanText('$%name%$ 온기님, 안녕')` → `'온기님, 안녕'` / `cleanText('오늘 하루도 한 발자국 나아간 온기 온기님께💌')` → `'오늘 하루도 한 발자국 나아간 온기님께💌'` / `cleanText('💛 님은 언제 \'온기\'를 느끼시나요?')` → `"💛 온기님은 언제 '온기'를 느끼시나요?"` / `cleanText('  두   칸  ')` → `'두 칸'` / `cleanText('님, 소중한 사람과의')` → `'온기님, 소중한 사람과의'` / `extractEmoji('해야 할 일을 자꾸만 미루게 돼요 📝')` → `'📝'`, `extractEmoji('☀️ 좋아')` → `'☀️'`, 이모지 없음 → null / `mergeLetters`: 기존 category 'love' 보존·신규는 uncategorized로 added에 포함·정렬 / `filterLetters(…, 'love')`는 love만 최신순
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 구현** — `scripts/sync-letters.ts`: fetch → `mergeLetters` → `src/data/letters.json` 저장(2칸 들여쓰기) → added 목록과 uncategorized 개수 출력.
- [ ] **Step 4: 초기 데이터 생성 + 분류** — `npm run sync:letters`로 164편 생성 → 임시 폴더에 `pid|제목|미리보기` 목록 출력 → 164편을 스펙 §5.2 기준으로 분류한 `pid → category` 매핑을 작성해 JSON에 반영(분류 기준: 고민의 주된 대상. 월말 정리·결산·100번째 편지·연말 인사·광고 = news) → 카테고리별 개수 출력(각 5개 이상인지 확인)
- [ ] **Step 5: 검증 테스트 추가** — `letters.test.ts`에 실제 JSON 검사: 길이 ≥ 164, id 고유, uncategorized 0, 모든 카테고리 5개 이상 → PASS

---

### Task 13: 온기레터 화면 + 상세

**Files:**
- Create: `src/components/letters/CategoryChips.tsx`, `LetterCard.tsx`, `LetterGrid.tsx`, `letters-ui.test.tsx`, `src/app/letters/[id]/page.tsx`
- Modify: `src/app/(tabs)/letters/page.tsx`

**Interfaces:**
- Consumes: `letters.json`, `filterLetters`, `extractEmoji`, `CATEGORIES`, `getCategory`, `isCategoryId`, `formatDotDate`, `LINKS`
- Produces:
  ```tsx
  <CategoryChips value: CategoryId | 'all'; onChange: (v: CategoryId | 'all') => void />
  <LetterCard letter: Letter />        // Link → /letters/{id}; image 없음/onError → 기본 카드(카테고리 tint + extractEmoji ?? 카테고리 emoji)
  <LetterGrid letters: Letter[] />     // 2열 grid gap-x-3 gap-y-5
  ```

- [ ] **Step 1: 실패 테스트** — CategoryChips: 11개 버튼(전체+10), value 'love' → '연애·사랑'에 `aria-pressed="true"` / 클릭 → onChange('family') / LetterCard: image 없는 레터 → 제목 이모지가 기본 카드에 표시, 제목·카테고리 라벨·`YYYY.MM.DD` 표시, 링크 href `/letters/{id}`
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 구현** — 목록 페이지는 클라이언트 컴포넌트에서 `useSearchParams`로 `category` 읽기(잘못된 값 → all), 변경 시 `router.replace('/letters?category=…', {scroll:false})`, Suspense 경계. AppBar 오른쪽 구독 아이콘(`BellSimple`) → `LINKS.subscribe` 새 탭. 소개 문구 "익명의 고민과 손편지 답장을 모았어요 · {총 개수}편". 칩 선택 = `bg-brown-600 text-white`, 비선택 = `bg-surface border border-line text-ink-600`. 카드: 이미지 `aspect-[4/3] rounded-2xl overflow-hidden`, 제목 `text-[15px] font-semibold line-clamp-2`, 메타 행 카테고리 태그(`text-[11px] border border-line rounded px-1.5`) + 날짜(`text-xs text-ink-400`). 상세: `generateStaticParams`로 164개 정적 생성, 없는 id → `notFound()`, AppBar(뒤로 → `/letters`, 새 창 아이콘 → link) + `iframe`(`src=link`, `title=제목`, 높이 `calc(100dvh - 56px)`, `border-0 w-full`), 탭 바 없음.
- [ ] **Step 4: 통과 확인 + 수동 확인** — 칩 전환·뒤로 가기 후 필터 유지·상세 iframe 로드

---

### Task 14: 나의 온기

**Files:**
- Create: `src/components/me/ProfileCard.tsx`, `StatsTiles.tsx`, `GrowthAlbum.tsx`, `ChatRecordList.tsx`, `OngiLinks.tsx`, `SettingsSection.tsx`, `me.test.tsx`
- Modify: `src/app/(tabs)/me/page.tsx`

**Interfaces:**
- Consumes: `useOngi`, `useStore`, `useToday`, 셀렉터 전부, `nextStageInfo`, `STAGES`, `Mascot`, `ProgressBar`, `HelplineCard`, `ConfirmDialog`, `BottomSheet`, `LINKS`
- Produces:
  ```tsx
  <ProfileCard birdName; stage: StageNo; count: number; daysTogether: number; onRename: (name: string) => { ok: boolean } />
  <StatsTiles total: number; thisMonth: number; talkedDays: number />
  <GrowthAlbum reached: StageNo />     // reached 이하 공개, 초과는 흐린 실루엣 + "미션 N개"
  <ChatRecordList chats: Record<DayKey, ChatDay>; today: DayKey />  // user 메시지 있는 날만, 최신순, 링크 /chat?date=
  <OngiLinks />  <SettingsSection onReset: () => void; onVersionTap: () => void; version: string />
  ```

- [ ] **Step 1: 실패 테스트** — GrowthAlbum reached=2 → 1·2단계 이름 보임, 3단계는 "미션 7개" / ChatRecordList: user 메시지 없는 날 제외, 최신순, 첫 사용자 메시지 한 줄 / SettingsSection: 버전 5회 클릭 → onVersionTap 5회 / "기록 모두 지우기" → ConfirmDialog → 확인 시 onReset
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 구현** — 페이지는 스펙 §6 순서. 이름 변경은 BottomSheet(입력 maxLength 10, 실패 시 "1~10자로 지어주세요"). 버전 5회 탭(2초 이내 연속) → `demo.setEnabled(!demoMode)` + 토스트("시연 모드를 켰어요/껐어요"). 초기화 후 홈으로 이동.
- [ ] **Step 4: 통과 확인 + 수동 확인**

---

### Task 15: 시연 모드 조작판

**Files:**
- Create: `src/components/demo/DemoPanel.tsx`, `DemoPanel.test.tsx`
- Modify: `src/app/(tabs)/layout.tsx` (조작판은 탭 화면에만 장착, `?demo=1` 감지는 DemoPanel 내부)

**Interfaces:**
- Consumes: `useStore`, `useOngi`, `realStage`, `completedCount`
- Produces: `<DemoPanel />` — `?demo=1`이면 마운트 시 `demo.setEnabled(true)`. demoMode일 때만 좌하단(탭 바 위) 접이식 패널: [미션 +1] [단계 1~5 / 해제] [날짜 +1일] [날짜 되돌리기] [기록 초기화] [끄기], 현재 "누적 N · 실제 N단계 · 오늘 YYYY-MM-DD" 표시

- [ ] **Step 1: 실패 테스트** — demoMode false → 렌더 없음 / true → "미션 +1" 클릭 시 누적 +1 / "단계 4" 클릭 → stageOverride 4
- [ ] **Step 2: 실패 확인**
- [ ] **Step 3: 구현**
- [ ] **Step 4: 통과 확인 + 수동 확인** — `?demo=1` → +1 세 번 → 진화 모달, 날짜 +1일 → 질문·미션 변경

---

### Task 16: PWA (매니페스트·아이콘·서비스 워커)

**Files:**
- Create: `src/app/manifest.ts`, `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png`, `public/sw.js`, `src/components/layout/ServiceWorkerRegister.tsx`, `src/app/not-found.tsx`, `src/app/icon.png`(파비콘), `src/app/apple-icon.png`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: 매니페스트(`name:'온기'`, `short_name:'온기'`, `start_url:'/'`, `display:'standalone'`, `background_color`/`theme_color:'#FDFAF5'`, 아이콘 3종), SW(설치 시 `/` 프리캐시, 내비게이션 = 네트워크 우선·실패 시 캐시, `/_next/static`·`/mascot`·`/letters`·`/icons` = 캐시 우선, `/api` 제외), 등록은 `process.env.NODE_ENV === 'production'`에서만

- [ ] **Step 1: 아이콘 생성** — 5단계 이미지를 `#FDFAF5` 정사각 캔버스 중앙에 배치(maskable은 안전 영역 80%) → PIL로 3종 + 파비콘 생성, 육안 확인
- [ ] **Step 2: 구현** — manifest.ts, sw.js, ServiceWorkerRegister(`useEffect`에서 `navigator.serviceWorker.register('/sw.js')`), not-found("페이지를 찾을 수 없어요" + 홈 링크)
- [ ] **Step 3: 검증** — `npm run build && npm start` → `/manifest.webmanifest` 200, 브라우저 콘솔에 SW 등록 오류 없음

---

### Task 17: 통합 QA + 마무리

**Files:**
- Modify: 발견된 문제의 해당 파일, `README.md`(필요 시)

- [ ] **Step 1: 전체 검증** — `npm test` 전부 PASS, `npm run lint` 오류 0, `npm run build` 성공
- [ ] **Step 2: 모바일 뷰포트 QA** — 390×844로 홈 / 대화(빠른 답·위기 카드·브리지 카드) / 미션(완료·캘린더·진화) / 온기레터(칩·상세) / 나의 온기(이름 변경·앨범·기록·초기화) / 시연 모드 스크린샷 확인, PC 폭(1280)에서 가운데 480px 확인
- [ ] **Step 3: 디자인 점검** — 노란 글씨 없음, 노랑 비중, 대비, 터치 영역, 동작 줄이기 시 애니메이션 정지
- [ ] **Step 4: 발견 문제 수정 후 1~3 재실행**

---

### Task 18 (팀 승인 필요): 레터 그림 50장 생성

**Files:**
- Create: `public/letters/{id}.webp` (최대 50개)
- Modify: `src/data/letters.json`(`image` 필드)

- [ ] **Step 1: 대상 목록** — 카테고리별 최신 5편 추출(제목·미리보기) → 장면 설명 50개 작성(마스코트 3D 털뭉치 뱁새 + 주제 소품/장면, 크림 배경 `#FDFAF5`, 부드러운 자연광, 글자 없음, 4:3)
- [ ] **Step 2: 비용 확인** — 힉스필드 잔여 크레딧·모델별 예상 비용 조회 → **팀에 장수·예상 크레딧을 공유하고 승인받기** (승인 전 생성 금지)
- [ ] **Step 3: 참고 이미지 업로드** — 마스코트 시안을 참고 이미지로 업로드(업로드는 직접 진행)
- [ ] **Step 4: 생성** — 1~2장 시험 생성 → 팀 확인 → 나머지 일괄 생성
- [ ] **Step 5: 변환·반영** — 800×600 webp 변환 → `public/letters/{id}.webp` → JSON `image` 기록 → 화면 확인
