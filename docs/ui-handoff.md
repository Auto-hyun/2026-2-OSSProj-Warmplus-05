# UI 디자인 안내서 (수아용)

> **3줄 요약**
> 1. `src/components/` 안의 **생김새**(배치·색·그림·애니메이션)는 마음껏 바꿔도 돼. 그림은 `src/public/`에 추가하면 돼.
> 2. `src/lib/`, `src/data/`, `src/app/api/`와 각 화면의 **기능 호출**(아래 표의 "꼭 남길 것")은 그대로 둬야 해.
> 3. 다 바꾼 뒤 `cd src && npm test` · `npm run lint` · `npx tsc --noEmit` 세 개가 통과하면 기능은 안 깨진 거야.

---

## 1. 원칙: 어디를 바꿔도 되나

| 구분 | 위치 | 내용 |
| --- | --- | --- |
| ✅ 바꿔도 됨 | `src/components/**` | 태그 구조, `className`(Tailwind), 배치, 색, 아이콘, 그림, 애니메이션, 화면에 보이는 문구 |
| ✅ 바꿔도 됨 | `src/public/` | 새 그림 추가 (예: `public/map/island.webp`, `public/moods/joy.webp`) |
| ✅ 추가 가능 | `src/app/globals.css` | 새 색 변수·새 `@keyframes` 추가. 기존 변수 이름(`--color-yellow-500` 등)은 여러 화면이 쓰니 이름 바꾸기·삭제는 하지 말기 |
| ⛔ 건드리지 않기 | `src/lib/**` | 저장, 유리병 계산, 노래 요청, 커뮤니티, 오목이 대화 로직 |
| ⛔ 건드리지 않기 | `src/data/**` | 감정 7종, 테스트 문항, 단어, 운세 문구. 문구를 바꾸고 싶으면 현준에게 말하기 |
| ⛔ 건드리지 않기 | `src/app/api/**` | 서버 기능 (대화, 노래) |
| ⛔ 건드리지 않기 | `src/app/**/page.tsx`, `layout.tsx` | 화면 파일과 컴포넌트를 연결만 하는 곳. 바꿔야 하면 현준에게 |
| ⛔ 남겨 두기 | 컴포넌트 안의 기능 줄 | `store.○○()` 호출, `useApp((s) => ...)` 셀렉터, `fetch(...)`, `router.○○()`, 링크 주소(`href`), 컴포넌트가 받는 값(props) 이름과 모양 |

### 컴포넌트 안에서 지켜야 할 것

| 규칙 | 이유 |
| --- | --- |
| 파일 맨 위 `'use client';`는 지우지 않기 | 이게 없으면 버튼·저장이 동작하지 않아 |
| `useApp(...)` 결과가 `undefined`일 때 처리하는 줄은 남기기 (예: `if (!jar) return null;`, `<div className="h-28" />` 같은 빈 자리) | 첫 화면이 그려질 때는 기기 저장값을 아직 못 읽어서 `undefined`야. 빈 자리 모양은 바꿔도 되지만 분기는 필요해 |
| 단어 방울 버튼의 `aria-pressed`와 버튼 글자(단어 이름) 유지 | `WordCloud.test.tsx`가 이걸로 "3개까지 고르기"를 확인해 |
| `OmokTalk`의 대답 버튼은 `href`가 있으면 링크, 없으면 버튼으로 유지, 버튼 글자 = `label` | `OmokTalk.test.tsx`가 확인해 |
| 새 Next.js 기능(이미지, 링크 외)을 쓰기 전엔 `src/AGENTS.md` 참고 | Next.js 16은 예전 버전과 쓰는 법이 달라. `node_modules/next/dist/docs/`에 설명이 있어 |

### 기능이 안 깨졌는지 확인하는 법 (`src` 폴더에서)

| 명령 | 확인하는 것 |
| --- | --- |
| `npm test` | 기능 시험 전체 (Supabase 연결 시험은 자동으로 건너뜀) |
| `npm run lint` | 코드 규칙 위반 |
| `npx tsc --noEmit` | props 이름·모양이 맞는지 (타입 오류) |

---

## 2. 화면별 표

공통: 모든 화면은 `MobileShell`(폭 480px 휴대폰 칸) 안에 들어가. 경로는 모두 `src/` 기준.

| 화면 (주소) | 파일 | 지금 보이는 것 | 꼭 남길 기능 호출 | 쓸 수 있는 데이터 | 디자인 교체 포인트 |
| --- | --- | --- | --- | --- | --- |
| **홈** (`/`) | `components/home/HomeScreen.tsx`, `OmokRoom.tsx`, `FortuneSection.tsx`, `BirthForm.tsx` | 오목이 집 2.5D 장면(뒤에서 앞으로: 벽·아치 창 → 기억 선반 3단 → 원근 바닥 → 받침대 위 오늘의 유리병 → 러그 위 오목이와 말풍선(누르면 `/chat`) → 흐린 잎사귀·구슬), 위에 "오목이 집"+날짜, 오늘의 테스트 유리 카드 → 아래로 오하아사. 시안: `docs/mockups/home-2.5d.html` | `useApp(() => todayKey())`, `useApp((s) => shelfMoods(s.moods, SHELF_SLOTS))`, `useApp((s) => currentJar(s.moods).entries.length)`, `useApp((s) => s.chat.messages.length > 0)`, `<Link href="/chat">`, `useApp((s) => s.profile.birth)`, `store.setBirth({ date, time })` | 선반 구슬 = 다 찬 병들의 기록(앞 선반이 최근, 빈 자리는 옅은 유리), 오늘 감정 색(앞 흐린 구슬), 대화 여부(말풍선 문구), 생일·운세 | 벽·바닥·선반 그림, 오목이(감정 캐릭터로 교체), 유리병 그림, 이동 연출. 가로 위치는 기준 폭 390px에 대한 %(`pct()`) |
| **오늘의 마음 날씨 테스트** (`/today`) | `components/jar/DailyQuizScreen.tsx` (홈 입구 카드는 `jar/DailyMoodQuiz.tsx`) | 3문항 진행 막대 + 질문 + 선택지 4개 → 결과(날씨 이모지, 날씨 이름, 감정 이름, 구슬 색 동그라미, "홈에서 유리병 보기", "다시 해 보기") | `quizForDay(day)`, `dailyResult(next)`, `store.recordMood(result_, { source: 'daily', testId: quiz.id })`, 입구 카드의 `useApp((s) => s.moods.find((m) => m.day === todayKey()))` | 오늘 세트 `quiz.title`·`quiz.questions`, 결과 감정의 `emoji`·`weather`·`label`·`color` | 질문 넘어가는 연출, 결과 화면 날씨 그림, 구슬이 병으로 들어가는 연출 |
| **지도** (`/map`) | `components/map/MapScreen.tsx` | 노란 섬 모양 SVG + 점선 길 위에 장소 카드 6개(오목이 집, 노래 공방, 마음 테스트 숲, 이야기 광장, 온스트리밍 TOP100, 온기 우체국). 뒤 두 곳은 누르면 "준비 중" 알림 | `PLACES`의 `href` 값 (`/`, `/create`, `` `/tests/${TESTS[0].id}` ``, `/community`), 주소 없는 곳의 `toast('준비 중')` | 장소 이름·아이콘·주소 | 섬 그림 전체(지금 SVG 자리), 장소 위치(지금 2열 지그재그), 장소별 건물 그림, 장소로 들어가는 연출 |
| **노래 공방** (`/create`) | `components/create/CreateScreen.tsx`, `TestMethod.tsx`, `WordMethod.tsx`, `WordCloud.tsx`, `Composing.tsx`, `Outcome.tsx`, `SongRow.tsx` | 방법 고르기 카드 2개(심리테스트로 / 감정 단어로) → 테스트 결과 카드 또는 육각형 단어 방울(최대 3개) → 작곡 중(오목이가 흔들리고 음표가 떠오름, 경과 시간) → 완성 곡 목록, "이 노래와 함께 글쓰기", "새 노래 만들기" | `startSong(source)`, `store.addPending({ taskId, title, source, mode })`, `songRequestFor(...)`, `useApp((s) => s.pending[0] ?? null)`, `useApp((s) => s.outcome)`, `useApp((s) => s.tests[0] ?? null)`, `useApp((s) => s.songs)`, `store.dismissOutcome()`, 링크 `/create?method=test`·`/create?method=words`·`` `/community/write?song=...` ``, `onCompose(...)` props | 단어 `w.label`·`w.family`, 갈래 색 `FAMILIES[...].tint`, 곡 `title`·`audioUrl`·`duration`·`mode`, 작곡 중 곡 `pending.title`·`startedAt` | 공방 배경, 방법 카드 그림, 단어 방울 모양, 작곡 중 연출, 완성 화면. 상단 바 제목은 지금 "노래 만들기" |
| **이야기 광장** (`/community`) | `components/community/CommunityScreen.tsx`, `PostCard.tsx`, `NeedsSupabase.tsx` | 글 목록(이름 첫 글자 동그라미, 시간, 오목이의 질문, 내용, 배경음악 재생), 불러오는 중 회색 상자 3개, 오류·빈 목록 화면, 오른쪽 위 노란 연필 버튼, "더 보기" | `useSupabase()`, `listPosts(supabase)`, `listPosts(supabase, 마지막 글 createdAt)`, 링크 `/community/write` | 글 `nickname`·`topic`·`content`·`bgm`·`createdAt`, `timeAgo(...)` | 광장 배경, 글 카드 모양, 빈 목록·오류 화면 그림. 상단 바 제목은 지금 "커뮤니티" |
| **글쓰기** (`/community/write`) | `components/community/WriteScreen.tsx`, `BgmPicker.tsx` | 오목이가 주제 제안(이걸로 쓸래 / 다른 주제) → 이름 입력 또는 "○○ 이름으로 올려요" → 본문(500자 세기) → 배경음악 고르기(내 노래 목록, 미리 듣기) → 위 "올리기" 버튼 | `createPost(supabase, { nickname, topic, content, bgm })`, `store.setNickname(nickname)`, `router.replace('/community')`, `useApp((s) => s.profile.nickname)`, `useApp((s) => s.songs)`, `useApp(() => true)`, `params.get('song')`, `CONTENT_MAX`·`NICKNAME_MAX` 검사 | 주제 목록 `TOPICS`, 저장된 이름, 내 노래 | 주제 말풍선, 입력칸, 배경음악 고르기 카드 모양 |
| **심리테스트** (`/tests/[testId]`, 지금은 `/tests/example`) | `components/tests/TestScreen.tsx` | 시작 화면(오목이, 이모지, 제목, 문항 수, "시작하기") → 진행 막대 + 질문 + 선택지 + "이전 문항" → 결과(유형 이모지·이름·요약·설명, 어울리는 음악, "이 유형으로 노래 만들기", "테스트 다시 하기") | `resultFor(test, next)`, `store.saveTestResult(test.id, result.id, result.mood)`, `router.replace(...?result=...)`, `useSearchParams().get('result')`, 링크 `` `/create?method=test&test=${test.id}&result=${result.id}` `` | 테스트 `title`·`subtitle`·`emoji`·`questions`, 결과 `name`·`emoji`·`summary`·`description`, `FAMILIES[result.music.family]` | 테스트별 연출·애니메이션, 결과 카드(공유하기 좋은 모양), 시작 화면 그림 |
| **오목이 대화** (`/chat`) | `components/chat/ChatScreen.tsx` | 안내 문구(기기에만 저장, 109 안내) → 첫 인사 말풍선 → 대화 말풍선(내 말 노랑, 오목이 흰색, 위기 답변은 빨간 테두리) → "오목이가 생각 중…" → 아래 입력창 + 보내기, 오른쪽 위 "대화 지우기 / 정말 지우기" | `fetch('/api/chat', ...)`, `fetch('/api/chat/note', ...)`, `buildChatContext(getBrowserStore().getState())`, `store.addChatMessage(...)`, `store.setOmokNote(...)`, `store.clearChat()`, `useApp((s) => s.chat.messages)` | 메시지 `role`·`text`·`crisis` | 말풍선 모양, 오목이 프로필 그림, 생각 중 표시(점 세 개 `omok-dot` 애니메이션이 준비돼 있음), 입력창 |
| **마이페이지** (`/me`) | `components/me/MeScreen.tsx`, `ProfileCard.tsx`, `MyTests.tsx`, `MySongs.tsx`, `MyPosts.tsx` (+ `jar/JarShelf.tsx`) | 내 정보 카드(이름, 생일·별자리, 이름 바꾸기·생일 바꾸기) → 나의 유리병 → 나의 심리테스트 유형(누르면 결과 다시 보기) → 내가 만든 노래(재생·지우기) → 내가 쓴 글(지우기) | `useApp((s) => s.profile)`, `store.setNickname(name)`, `useApp((s) => s.tests)`, `useApp((s) => s.songs)`, `store.removeSong(song.id)`, `audio.stop()`, `listMyPosts(supabase)`, `deletePost(supabase, post.id)`, 링크 `` `/tests/${test.id}?result=${result.id}` `` | 이름, 생일, `zodiacOf(...)`, 테스트 기록, 노래, 내 글 | 프로필 카드, 섹션 배치, 목록 카드 모양 |
| **하단 탭 바 · 상단 바** (모든 탭 화면) | `components/layout/TabBar.tsx`, `AppBar.tsx`, `MobileShell.tsx` | 탭 바: 아래 떠 있는 반투명 캡슐, "지도로 가기"·"마이페이지" 2개 (`/create`, `/community`에서도 지도 탭이 켜짐). 상단 바: 왼쪽 오목이 홈 버튼 또는 뒤로 버튼, 제목, `/create`·`/community`에서는 오른쪽 "지도로" 버튼 | `TABS`의 `href`, `MAP_PLACES`와 `isActive(...)`, `usePathname()`, `router.back()` / `router.push(backHref!)`, props `title`·`right`·`backHref` | 지금 주소 | 탭 바 모양·아이콘, 홈 버튼 아이콘(지금 새 아이콘, 오목이 그림으로 바꿀 수 있음). 탭 화면 아래 여백(`pb-44`)은 `app/(tabs)/layout.tsx`에 있으니 탭 바 높이를 바꾸면 현준에게 알려 줘 |
| **유리병** (홈 병 · 마이페이지 선반) | `components/jar/MoodJar.tsx`, `components/jar/JarShelf.tsx` | 홈: SVG 유리병, 기록한 날마다 감정 색 구슬이 아래부터 쌓이고(5개·4개 번갈아), 오늘 구슬은 위에서 떨어짐(`jar-drop`), 아래 "n/21". 선반: 다 찬 병마다 "n번째 병 · 기간", 가장 많았던 날씨, 감정별 개수 | `useApp((s) => currentJar(s.moods))`, `useApp((s) => fullJars(s.moods))`, `summarize(jar)`, `JAR_SIZE`, props `className` | 병 `jar.entries`(각 `day`·`mood`), 요약 `s.number`·`s.from`·`s.to`·`s.top`·`s.counts` | 병 그림, 구슬(감정 캐릭터 구슬로 교체 가능), 떨어지는 연출, 선반 모양 |

### 같이 쓰는 부품

| 부품 | 파일 | 바꿀 때 참고 |
| --- | --- | --- |
| 오목이 그림 | `components/omok/Omok.tsx` | 그림은 `public/omok/*.webp` 11장(branch, hello, music, question, smile, heart, peek, search, book, lie, wings). 새 포즈는 그림을 넣고 `POSES`에 `이름: [가로, 세로]` 한 줄 추가 |
| 오목이 말풍선 | `components/omok/OmokTalk.tsx` | 큰 모양(`lg`)·작은 모양(`sm`). props `line`·`replies`·`pose`·`size`·`height`·`omokHref` 유지 |
| 버튼 | `components/ui/Button.tsx` | `primary`·`secondary`·`ghost` 세 가지. 여기 모양을 바꾸면 앱 전체 버튼이 바뀜 |
| 알림 | `components/ui/Toast.tsx` | 화면 위에 잠깐 뜨는 알림 모양 |
| 빈 목록 | `components/ui/Empty.tsx` | 점선 상자 |
| 재생 | `components/audio/PlayButton.tsx`, `MiniPlayer.tsx` | 재생 버튼, 아래 떠 있는 재생 바. `useAudio()`의 `toggle`·`stop` 호출 유지 |

### 디자인 토큰 (`src/app/globals.css`)

| 이름 | 값 | 쓰임 |
| --- | --- | --- |
| `bg` | `#fdfaf5` | 앱 바탕 (오목이 그림 바탕과 같은 크림색) |
| `surface` | `#ffffff` | 카드 |
| `yellow-500` | `#f7d749` | 주요 버튼, 선택 표시 |
| `yellow-100` | `#fff4cc` | 선택 탭 배경, 내 말풍선 |
| `brown-600` | `#85601e` | 강조 글자, 링크 |
| `ink-900` / `ink-600` / `ink-400` | `#2f2b28` / `#6b655f` / `#a39d96` | 본문 / 보조 / 비활성 글자 |
| `line` | `#efe9df` | 구분선, 테두리 |
| `danger` | `#c4493c` | 오류 |

Tailwind에서 `bg-yellow-100`, `text-ink-600`처럼 쓰면 돼. 파일 안 메모에 "노랑은 포인트로만, 노란 글씨·형광·그라데이션 금지"라는 현재 규칙이 있어. 바꾸고 싶으면 팀에서 정하고 바꾸면 돼.

준비된 애니메이션: `omok-fade`(나타나기), `omok-pop`(톡 튀어나오기), `omok-breathe`(오목이 숨쉬기), `omok-hop`(폴짝), `omok-sway`(좌우 흔들기), `omok-note`(음표 떠오르기), `omok-dot`(점 세 개), `omok-bar`(재생 막대), `jar-drop`(구슬 떨어지기). 기기에서 "동작 줄이기"를 켜면 모든 애니메이션이 멈추게 되어 있어.

---

## 3. 감정 7종 (`src/data/moods.ts`)

유리병 구슬, 오늘의 마음 날씨, 심리테스트 결과가 모두 이 목록을 써. 이모지·색을 그림으로 바꿔도 **id는 그대로** 둬야 해 (저장된 기록이 id로 되어 있어).

| id | 감정 | 날씨 | 이모지 | 구슬 색 |
| --- | --- | --- | --- | --- |
| `joy` | 기쁨 | 맑음 | ☀️ | `#F7D749` |
| `flutter` | 설렘 | 봄바람 | 🌤️ | `#F4A7B9` |
| `calm` | 평온 | 잔잔한 구름 | 🌥️ | `#A8D5BA` |
| `tired` | 지침 | 안개 | 🌫️ | `#B8B2A7` |
| `sad` | 슬픔 | 비 | 🌧️ | `#8FA9D6` |
| `anxious` | 불안 | 바람 부는 날 | 🌪️ | `#B59FD6` |
| `angry` | 화남 | 천둥번개 | ⛈️ | `#E07A5F` |

화면에서는 `getMood(id)`로 한 감정의 `label`·`weather`·`emoji`·`color`를 꺼내 써. 감정별 그림을 쓰려면 `public/moods/joy.webp`처럼 **id를 파일 이름으로** 두면 `` `/moods/${mood.id}.webp` ``로 바로 연결할 수 있어.

---

## 4. 테스트할 때 팁

| 할 일 | 방법 |
| --- | --- |
| 앱 켜기 | `cd src` → `npm install`(처음 한 번) → `npm run dev` → `http://localhost:3000`. 브라우저 개발자 도구에서 휴대폰 크기로 보면 좋아 |
| 저장 기록 확인 | `http://localhost:3000/debug`. 이 기기에 저장된 기분 기록 수, 지금 병(n/21), 다 찬 병 수, 테스트 결과, 노래, 대화 줄 수를 표로 보여 줘. **개발 서버에서만 열리고 배포본에서는 404** |
| 유리병 채워 보기 | `/debug`의 "지난 20일 기분 채우기"(병 거의 참) 또는 "지난 45일 (병 2개)"(마이페이지 선반 확인용). 오늘 기록은 건드리지 않아 |
| 처음 상태로 | `/debug`의 "오목이 기억까지 지우기", "기분 기록 지우기", "전체 초기화" |
| 오늘 구슬 떨어지는 연출 보기 | `/today`에서 테스트를 끝내고 홈으로 오기 (같은 날 다시 하면 덮어써짐) |
| 노래 공방 | 기본이 샘플 곡 모드라 몇 초 만에 완성돼. 돈 안 들어 |
| 오목이 대화 | `src/.env.local`에 API 키가 없으면 정해진 말로 답해. 화면 확인엔 충분해 |
| 이야기 광장 | Supabase 설정이 없으면 "커뮤니티가 아직 연결되지 않았어요" 화면이 떠. 글 목록 화면을 봐야 하면 현준에게 설정값 받기 |

---

## 5. 작업 방식

| 순서 | 할 일 |
| --- | --- |
| 1 | `git fetch` → `git switch hj` → `git pull` (현준 작업 브랜치 최신으로) |
| 2 | `git switch -c sua-ui` (내 브랜치 만들기) |
| 3 | 화면 바꾸기. 한 화면 끝날 때마다 `npm run dev`로 눈으로 확인 |
| 4 | 커밋 전에 `cd src && npm test` 통과 확인 (`npm run lint`, `npx tsc --noEmit`도 같이 하면 좋아) |
| 5 | `git push -u origin sua-ui` → GitHub에서 **`hj` 브랜치로** PR 만들기 (main 아님) |
| 6 | PR 설명에 바꾼 화면 이름과 캡처 붙이기. 기능 줄을 건드렸으면 어디인지 꼭 적기 |

---

## 6. 남은 디자인 과제

| 과제 | 근거 | 손댈 파일 |
| --- | --- | --- |
| 감정 오목이 7종 캐릭터 (내 감정의 친구가 홈 메인 캐릭터) | `docs/spec.md` 화면 구조 "홈" | `public/` 그림 + `home/OmokRoom.tsx`, `omok/Omok.tsx` |
| 지도 섬 그림, 장소별 건물 그림 | `docs/spec.md` 내비게이션 "처음엔 간단한 지도, 그림·이동 연출은 나중에 교체" | `map/MapScreen.tsx` |
| 지도 이동 연출 (홈에서 지도로, 지도에서 장소로) | `docs/spec.md` "지도 이동 버튼(전환 연출)" | `map/MapScreen.tsx`, `layout/TabBar.tsx` |
| 유리병 그림, 구슬 떨어지는 연출, 감정 캐릭터 구슬 | `docs/mood-jar.md` | `jar/MoodJar.tsx`, `jar/JarShelf.tsx` |
| 오늘의 마음 날씨 테스트 · 결과 화면 | `docs/mood-jar.md` 뼈대 화면 | `jar/DailyQuizScreen.tsx`, `jar/DailyMoodQuiz.tsx` |
| 심리테스트를 "우리 스타일 애니메이션"으로 | `docs/spec.md` 화면 구조 "심리테스트" | `tests/TestScreen.tsx` |
| 오목이 대화 화면 (지금 뼈대 UI) | `docs/omok-chat.md` | `chat/ChatScreen.tsx` |
| 온스트리밍 TOP100, 온기 우체국 장소 | `docs/spec.md` 지도 표 "나중" (기능 아직 없음, 지도 위 자리만) | `map/MapScreen.tsx` |

기능도 같이 필요해서 **현준과 먼저 맞춰야 하는 것**:

| 항목 | 이유 |
| --- | --- |
| 마음 날씨 결과에 감정 단어 4개 + "다른 날씨 보기" 버튼 | `docs/spec.md` 결정 4-1에 있지만 감정 단어 데이터가 아직 코드에 없음 |
| 오목이 대화 첫 화면의 "대화 내용이 Claude로 전송된다" 안내·동의 | `docs/omok-chat.md` 남은 일. 동의 저장 기능이 필요 |
| 유리병 한 줄 메모 칸 | `docs/mood-jar.md` "아직 안 정한 것" (데이터는 `note`로 받을 수 있음) |
| 화면 제목 바꾸기 ("노래 만들기"→"노래 공방", "커뮤니티"→"이야기 광장") | 문구라 바꿔도 되지만 이름이 아직 가안이라 팀 확인 후 |
