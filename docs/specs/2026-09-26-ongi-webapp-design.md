# 온기 웹앱 v1 설계 스펙

- 작성일: 2026-09-26
- 팀: 동국대 2026-2 오픈소스SW프로젝트 5팀 Warm+ (사단법인 온기 협업)
- 상태: v1 설계 확정 (④ 온기레터·⑤ 나의 온기·⑥ 데이터 저장은 추후 팀 검토·수정 예정)

---

## 0. 배경과 목표

온기우편함은 "익명으로 고민을 보내주시면 손편지로 답장을 전해드리는" 비영리단체다. 이 웹앱은
1. 일상의 가벼운 고민도 편하게 털어놓을 수 있는 공간을 만들고
2. 우울감·외로움을 느끼는 사람에게 하루의 작은 활기를 주며
3. 온기우편함·온기레터를 온라인으로 알리는 것을 목표로 한다.

**1차(v1) 목표: 시연 우선, 확장 가능하게.** 발표·온기 측 시연이 가능한 수준으로 전체 흐름을 완성하되,
나중에 서버·계정·실제 LLM API를 붙이기 쉽게 데이터 계층과 LLM 연결부를 분리한다.

### 성공 기준 (시연 시나리오)
1. 휴대폰 브라우저에서 떠 있는 캡슐형 탭 바로 4개 탭을 이동할 수 있다.
2. 홈에서 오늘의 질문을 보고 → 대화방에서 목업 답장을 받는다. 위기 표현을 입력하면 도움 기관 카드가 뜬다.
3. 미션을 완료하면 캘린더에 도장이 찍히고, 누적 기준에 도달하면 진화 연출 후 홈의 마스코트가 바뀐다.
4. 온기레터 164편을 카테고리별로 필터링하고, 카드를 눌러 원문을 앱 안에서 읽는다.
5. 나의 온기에서 성장 현황·마음 기록·온기 연결 링크를 본다.
6. 시연 모드로 진화·날짜 이동을 즉시 보여줄 수 있다.
7. 새로고침·재접속해도 기록이 유지된다(같은 기기·브라우저).

### 비범위 (v1에서 하지 않음)
- 로그인·서버 DB (기기 저장만)
- 실제 LLM API 연동 (연결 자리와 말투 프롬프트만 준비, 연동은 팀이 추후 진행)
- 푸시 알림, LLM 파인튜닝, 신규 레터 자동 분류, Vercel 배포 설정

---

## 1. 기술 스택

| 항목 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 스타일 | Tailwind CSS v4 (CSS `@theme` 토큰) |
| 아이콘 | `@phosphor-icons/react` (regular/fill 두 벌 → 선택 탭은 fill) |
| 글꼴 | Pretendard Variable (`next/font/local`, npm `pretendard`) |
| 상태·저장 | 자체 경량 스토어(`useSyncExternalStore`) + 저장 어댑터(localStorage / 메모리) |
| 테스트 | Vitest + Testing Library (jsdom) |
| PWA | `app/manifest.ts` + 최소 서비스 워커(`public/sw.js`, 프로덕션에서만 등록). 화면은 네트워크 우선(성공 응답만 저장), 마스코트·아이콘·최적화 이미지는 저장본 표시 후 뒤에서 갱신 |
| 패키지 매니저 | npm |
| 배포 | Vercel (팀이 설정) |

---

## 2. 화면 구조와 공통 UI (섹션 ①, 승인됨)

### 2.1 탭과 경로
| 탭 | 라벨 | 아이콘(Phosphor) | 경로 |
|---|---|---|---|
| 1 | 홈 | `House` | `/` |
| 2 | 미션 | `Footprints` | `/mission` |
| 3 | 온기레터 | `EnvelopeSimple` | `/letters` |
| 4 | 나의 온기 | `User` | `/me` |

- 전체 화면(탭 바 숨김): 대화방 `/chat`, 레터 상세 `/letters/[id]`
- 앱 이름은 임시로 "온기" (팀이 확정 시 교체)

### 2.2 탭 바 (현재 당근 앱 스타일 참고)
- 화면 하단에서 떠 있는 **반투명 캡슐 바**: 좌우 16px 여백, 하단 `safe-area + 12px`, 높이 64px,
  `rounded-full`, 흰색 75% + `backdrop-blur`, 옅은 테두리·그림자
- 항목: 아이콘 24px 위 + 라벨 11px 아래
- **선택**: fill 아이콘 + 진한 글씨(`ink-900`) + 연노랑(`#FFF4CC`) 알약 배경
- **비선택**: regular 아이콘 + 회갈색 글씨(`ink-400`)
- `aria-current="page"`로 현재 탭 표시

### 2.3 상단 바
- 당근처럼 제목 왼쪽 정렬(20px, bold), 오른쪽 아이콘. 스크롤 시 배경 블러로 고정.

### 2.4 디자인 토큰
| 토큰 | 값 | 쓰임 |
|---|---|---|
| `bg` | `#FDFAF5` | 앱 바탕 (마스코트 시안 배경과 동일) |
| `surface` | `#FFFFFF` | 카드, 시트 |
| `yellow-500` | `#F7D749` | 주요 버튼(글씨는 `ink-900`), 진행 바 |
| `yellow-100` | `#FFF4CC` | 선택 탭 배경, 내 말풍선 |
| `brown-600` | `#85601E` | 강조 텍스트, 링크 |
| `ink-900` | `#2F2B28` | 본문 |
| `ink-600` | `#6B655F` | 보조 텍스트 |
| `ink-400` | `#A39D96` | 비활성 |
| `line` | `#EFE9DF` | 구분선, 테두리 |

**"짜치지 않게" 원칙**: 노랑은 화면의 10~15% 포인트로만. 노란 글씨·형광·그라데이션 금지.
여백 넉넉, 모서리 16~20px, 그림자는 아주 옅게. 글꼴은 Pretendard 하나.

### 2.5 레이아웃
- 모바일 우선. PC에서는 가운데 480px 폭 컬럼(`MobileShell`).
- `prefers-reduced-motion`이면 마스코트·연출 애니메이션 정지.

---

## 3. 홈(탭 1) + 대화 (섹션 ②, 승인됨)

### 3.1 홈 화면 구성 (위→아래)
1. 상단 바 "온기"
2. 날짜(KST, 예: "9월 26일 토요일")
3. 오늘의 질문 말풍선
4. 마스코트(현재 단계, 대형, 애니메이션) + 이름 + 단계명
5. "다음 성장까지 미션 N개" 미니 진행 바 → `/mission` (5단계면 "뱁새가 다 자랐어요!")
6. 메인 버튼 "편하게 털어놓기" (오늘 대화가 있으면 "이어서 이야기하기") → `/chat`
7. 오늘의 미션 바로가기 카드 (이모지·제목·완료 여부) → `/mission`

### 3.2 오늘의 질문
- `src/data/questions.ts`에 부담 없는 질문 약 60개 (작성 시 톤이 이어지지 않게 섞어서 배치)
- `questions[dayIndex % N]` — 같은 날엔 모두 같은 질문. `dayIndex`는 기준일(2026-01-01)부터 KST 날짜 차이.

### 3.3 마스코트
- 이름 기본값 "뱁새" (나의 온기에서 변경 가능)
- 단계 데이터(`stages.ts`): 번호, 이름, 설명(마스코트 시안 문구), 이미지, 필요 누적 미션 수
- 애니메이션: 1단계는 윗껍질이 들썩(§9.1), 2~5단계는 숨 쉬듯 살짝 커졌다 작아짐(3s). 탭하면 폴짝 + 짧은 한마디.

### 3.4 대화방 `/chat`
- **하루 1대화**: 날짜 키로 저장. 같은 날 재진입 시 이어짐.
- 지난 대화: `/chat?date=YYYY-MM-DD` 읽기 전용(입력창 없음, "지난 대화예요" 안내).
- 첫 메시지 = 오늘의 질문(뱁새). 사용자 메시지가 없을 때만 **빠른 답 버튼** 3개:
  "잘 모르겠어요" / "그냥 좀 지쳤어요" / "좋은 일이 있었어요" (누르면 그대로 전송)
- 말풍선: 뱁새 = 흰색(왼쪽, 작은 아바타), 나 = 연노랑(오른쪽)
- 입력: 여러 줄, 최대 1,000자, 빈 입력 전송 불가
- 답장은 스트리밍 표시(첫 글자 전 "···" 표시)
- 처음 진입 시 1회 안내: "뱁새는 전문 상담사가 아니에요. 마음이 많이 힘들 땐 전문가의 도움을 받아주세요."

### 3.5 대화 API
- `POST /api/chat`
  - 요청: `{ messages: { role: 'user' | 'assistant'; content: string }[] }` (첫 메시지는 질문)
  - 클라이언트는 **질문 + 최근 20개 메시지**만 보낸다(대화가 길어져도 검증 한도 안에 들도록)
  - 검증: 메시지 1~40개, 마지막은 `user`, 각 `user` 메시지 1~1,000자 → 위반 시 `400 { error }`
  - 정상: `200 text/plain; charset=utf-8` 스트림
  - 위기 감지: `200 application/json { type: 'safety', message }` (모델 호출 안 함)
  - 모델 오류: `502 { error }`
- **LLM 연결부** (`src/lib/llm/`)
  ```ts
  interface LLMProvider {
    streamReply(input: { system: string; messages: ChatMessage[] }): AsyncIterable<string>;
  }
  ```
  - `getProvider()`가 `process.env.LLM_PROVIDER`(기본 `mock`)로 구현체 선택
  - `MockProvider`: 키워드 묶음(지침·외로움·불안·슬픔·화남·기쁨·기본)별 "공감 → 되짚기 → 부드러운 질문" 템플릿 2~3개 중 선택, 2~3글자씩 약 25ms 간격 스트리밍
  - 실제 LLM 구현체: **v1에서 만들지 않음.** 팀이 추후 같은 인터페이스로 추가 → `.env`에 `LLM_PROVIDER`와 해당 API 키 설정
  - `persona.ts`: 뱁새 시스템 프롬프트(지금 작성). "온기님" 호칭, 존댓말, 2~4문장, 공감 먼저,
    섣부른 조언·판단·진단 금지, 질문은 한 번에 하나, 가벼운 톤, 위기 신호 시 전문기관 안내, 의료·법률 자문 금지

### 3.6 안전장치 (필수)
- 서버가 **모델 호출 전** 마지막 사용자 메시지를 `detectCrisis()`로 검사
  - 공백·문장부호·ㅋㅎㅠㅜ 제거 후 패턴 매칭: 자살, 자해, 죽고싶, 죽고만싶, 죽어버리고싶, 죽어버릴, 죽을래, 죽을까, 죽어야,
    살기싫, 살고싶지, 그만살고싶, 살아서뭐해, 살아서뭐하, 살이유가없, 사라지고싶, 사라져버리고싶, 없어지고싶, 없어져버리고싶,
    극단적선택, 목숨을끊, 손목을긋, 뛰어내리고싶, 뛰어내릴, 목을매, 유서를
  - 놓치는 것보다 도움 카드를 한 번 더 보여주는 쪽이 안전하므로 애매한 표현은 감지하는 쪽으로 둔다
  - "배고파 죽겠다" 같은 관용 표현은 잡지 않도록 `죽겠` 계열은 제외
- 감지 시 고정 위로 메시지 + **도움받을 수 있는 곳 카드**(`HelplineCard`):
  - 자살예방상담전화 **109** (24시간)
  - 정신건강위기상담 **1577-0199** (24시간)
  - 청소년상담 **1388** (24시간)
  - 긴급 **112 / 119**
  - 각 항목 `tel:` 링크
- 키워드 방식의 한계(오탐·미탐)는 v1에서 감수. 실제 LLM 연동 시 시스템 프롬프트 지침과 병행.

### 3.7 온기우편함 연결
- 오늘 대화에서 사용자 메시지가 3개 이상이 되면, 대화 하단에 **1회** 카드:
  "이 이야기, 손편지로 답장받고 싶다면?" → `https://ongibox.co.kr/onlineongibox` (새 탭)
- 표시 여부는 대화 데이터(`bridgeShown`)에 저장

### 3.8 오류 처리
- 답장 실패 → 해당 사용자 말풍선에 "다시 보내기"
- 오프라인 → 상단 안내 "인터넷 연결을 확인해 주세요"

---

## 4. 미션(탭 2) + 캘린더 + 진화 (섹션 ③, 승인됨)

### 4.1 미션 목록
- `src/data/missions.ts`: 약 40개, 테마 5개(몸 / 바깥 / 연결 / 마음 / 작은 기쁨)
- 각 항목: `id`, `emoji`, `title`, `description`(한 줄), `theme`

### 4.2 오늘의 미션 선정
- 설치 시 생성한 `installId`의 해시를 시드로 미션 목록을 한 번 섞음(결정적 셔플)
- 오늘의 미션 = `shuffled[dayIndex % N]` → N일 동안 반복 없음
- **다른 미션**: 하루 1회. `shuffled[(dayIndex + ⌊N/2⌋) % N]`로 교체, 교체 기록 저장
- 오늘 미션만 완료 가능. 과거 날짜 소급 완료 불가.
- 완료 창을 연 채 자정이 지나면 기록하지 않고 "자정이 지나 날짜가 바뀌었어요" 안내 → 새 날짜의 미션을 보여준다

### 4.3 완료 흐름
1. "완료했어요" → 바텀시트 "어땠나요? (선택)" 한 줄 메모(최대 100자) + [완료] 버튼, 닫기(X)로 취소
2. [완료] → 기록 저장(되돌리기 없음) → "잘했어요!" 반응
3. 단계가 올라가면 진화 연출(§4.5)

### 4.4 캘린더
- 월 단위, `<` `>`로 이동. 완료한 날 = 노란 원 안 발자국 도장, 오늘 = 테두리 강조, 미래 = 흐리게
- 완료한 날 탭 → 그날 미션·메모 시트
- **못 한 날은 빈칸** (빨간 표시·"놓쳤어요" 문구 금지)
- 요약: "이번 달 N일 · 누적 N개", 오늘 미완료 시 "오늘 못 해도 괜찮아요. 내일 또 만나요."

### 4.5 진화 규칙
- **누적** 완료 수 기준, 한번 오른 단계는 내려가지 않음(완료 취소 기능이 없으므로 자연히 보장)

| 단계 | 이름 | 필요 누적 미션 | 설명(시안 문구) |
|---|---|---|---|
| 1 | 알 (부화 전) | 0 | 살짝 갈라진 알 안에서 반짝이는 눈만 보여요. |
| 2 | 아기 뱁새 (부화 중) | 3 | 알 껍질을 쓴 채 세상을 처음 보는 귀여운 아기 뱁새! |
| 3 | 어린 뱁새 | 7 | 알 껍질을 벗고 조금 더 자란 뱁새예요. |
| 4 | 청소년 뱁새 | 15 | 깃털이 더 풍성해지고 조금 더 단단해진 모습이에요. |
| 5 | 성체 뱁새 | 30 | 이제 완전한 뱁새! 언제나 곁에 있을 거예요. |

- 기준값은 `src/data/stages.ts` 한 곳에서 수정
- 진화 감지: 현재 단계 > `profile.lastSeenStage`이면 **전체 화면 축하 연출**
  ("뱁새가 자랐어요!" → 이전 모습이 새 모습으로 전환 → 단계명·설명 → "홈에서 만나기"), 이후 `lastSeenStage` 갱신

### 4.6 시연 모드
- 진입: URL `?demo=1` 또는 나의 온기의 버전 정보 5회 탭 (설정에 저장, 다시 끌 수 있음)
- 화면 좌하단 작은 조작판:
  - [미션 +1]: 기록이 없는 가장 최근 과거 날짜에 가짜 완료 추가 → 기준 도달 시 진화 연출
  - [단계 1~5]: 표시 단계만 강제(`stageOverride`, 연출 없음). 진화 감지는 항상 실제 누적 수 기준
  - [날짜 +1일] / [날짜 되돌리기]: `dayOffset`으로 "오늘"을 이동 → 질문·미션·캘린더 변화 확인
  - [기록 초기화], [시연 모드 끄기]

---

## 5. 온기레터(탭 3) (섹션 ④)

### 5.1 데이터
- 출처: 스티비 공개 JSON `https://page.stibee.com/archives/195023/emails` (164편, 2022-07 ~ 2026-08)
- 저장: `src/data/letters.json` (정적 스냅샷, 저장소에 커밋)
  ```ts
  type Letter = {
    id: number; pid: number;
    title: string; preview: string;
    link: string;          // stib.ee 영구 링크 (iframe·새 탭 공용)
    sentAt: string;        // ISO
    category: CategoryId | 'uncategorized';
    image?: string;        // '/letters/{id}.webp' (없으면 기본 카드)
  };
  ```
- **정리 규칙** (`cleanText`): 병합 태그 `$%name%$` 제거 후 "온기 온기님" → "온기님",
  문장 첫머리의 고립된 "님" → "온기님", 앞뒤 공백·연속 공백 정리
- 동기화 스크립트 `npm run sync:letters` (`scripts/sync-letters.ts`, tsx 실행):
  API 조회 → 정리 → 기존 JSON과 병합(`category`, `image` 보존) → 신규는 `uncategorized`로 추가하고 목록 출력
- **초기 분류**: 164편 전부 제목·미리보기(모호하면 본문 앞부분)를 읽고 수동 분류해 JSON에 기록

### 5.2 카테고리 (10개)
| id | 라벨 | 이모지 | 기본 카드 색 |
|---|---|---|---|
| `love` | 연애·사랑 | 💞 | `#FBE7E4` |
| `family` | 가족 | 🏠 | `#FDEBD3` |
| `relationship` | 친구·관계 | 🤝 | `#E8F1E4` |
| `career` | 진로·꿈 | 🧭 | `#E6EEF8` |
| `work` | 직장·일 | 💼 | `#EEE9F6` |
| `self` | 나·자존감 | 🌱 | `#F1F5E0` |
| `anxiety` | 불안·지침 | 🍃 | `#E6F0EE` |
| `loneliness` | 외로움·그리움 | 🌙 | `#E9E8F3` |
| `daily` | 일상·행복 | ☀️ | `#FFF3CF` |
| `news` | 온기 소식 | 💌 | `#F5EFE6` |

- `uncategorized`는 "전체"에서만 노출

### 5.3 화면
- 상단 바 "온기레터", 오른쪽 아이콘 → 구독 페이지 `https://page.stibee.com/subscriptions/195023` (새 탭)
- 소개 한 줄: "익명의 고민과 손편지 답장을 모았어요 · 164편"
- **카테고리 칩**(가로 스크롤): 전체 + 10개. 선택 = 진한 갈색 채움 + 흰 글씨, 비선택 = 흰 바탕 + 테두리.
  선택 상태는 URL `?category=love`로 유지(뒤로 가기 시 보존)
- **2열 카드 그리드** (첨부 레퍼런스 참고): 그림(4:3, 둥근 모서리) → 제목(15px, 2줄 말줄임) → [카테고리 태그] + 날짜(`YYYY.MM.DD`, 오른쪽)
- 정렬: 최신순 고정
- 그림이 없거나 로드 실패 → **기본 카드**: 카테고리 색 배경 + 제목 끝 이모지(없으면 카테고리 이모지) 크게

### 5.4 레터 상세 `/letters/[id]`
- 상단 바: 뒤로, "온기레터", 새 창 열기 아이콘
- 본문: 스티비 원문을 `iframe`으로 전체 높이 표시(스티비 공유 페이지는 iframe 차단 헤더 없음 — 2026-09-26 확인)
- 존재하지 않는 id → 404 안내

### 5.5 그림 제작 (우선 카테고리별 상위 5개만)
- 대상: 카테고리별 **최신순 5편** (최대 50장)
- 방식: 힉스필드 이미지 생성. **생성 전 예상 크레딧을 팀이 확인하고 승인한 뒤 진행**
- 스타일: 마스코트와 같은 3D 털뭉치 뱁새가 레터 주제에 맞는 소품·장면과 함께, 크림 배경(`#FDFAF5`), 부드러운 자연광, 글자 없음, 4:3
- 저장: `public/letters/{id}.webp` (800×600), JSON `image` 필드 기록

---

## 6. 나의 온기(탭 4) (섹션 ⑤, 추후 수정 예정)

위→아래:
1. **프로필 카드**: 현재 단계 마스코트, 이름(연필 아이콘으로 변경, 최대 10자), "함께한 지 N일째", 단계명, 다음 단계까지 진행 바
2. **숫자 타일 3개**: 누적 미션 / 이번 달 미션 / 털어놓은 날
3. **성장 앨범**: 5단계 썸네일. 도달한 단계는 이미지·이름, 미도달은 흐린 실루엣 + "미션 N개"
4. **마음 기록**: 지난 대화 목록(최신순: 날짜·질문·첫 사용자 메시지 한 줄) → `/chat?date=…`
5. **온기와 함께하기** (모두 새 탭):
   - 손편지로 고민 보내기 → `https://ongibox.co.kr/onlineongibox`
   - 온기레터 구독하기 → `https://page.stibee.com/subscriptions/195023`
   - 온기 알아보기 → `https://ongibox.co.kr/aboutongibox`
6. **도움받을 수 있는 곳**: `HelplineCard` (대화방과 같은 컴포넌트)
7. **설정**: 기록 모두 지우기(확인 대화상자), 앱 정보 `v0.1.0`(5회 탭 → 시연 모드)

---

## 7. 데이터 저장 (섹션 ⑥)

### 7.1 상태 모양 (단일 키 `ongi:v1`)
```ts
type OngiState = {
  version: 1;
  profile: { installId: string; startedOn: DayKey; birdName: string; lastSeenStage: StageNo };
  missions: {
    records: Record<DayKey, { missionId: string; note?: string; completedAt: string; demo?: boolean }>;
    swaps: Record<DayKey, string>;        // 교체된 미션 id
  };
  chats: Record<DayKey, {
    question: string;
    messages: { role: 'user' | 'assistant'; content: string; at: string }[];
    bridgeShown: boolean;
  }>;
  settings: { demoMode: boolean; dayOffset: number; stageOverride: StageNo | null; seenChatNotice: boolean };
};
```
- 파생값(저장 안 함): 누적 완료 수, 현재 단계, 이번 달 완료 수, 털어놓은 날 수

### 7.2 구조
- `StorageAdapter { load(): OngiState | null; save(s: OngiState): void }`
  - `localStorageAdapter` (기본), `memoryAdapter` (localStorage 사용 불가 시 대체 + 1회 안내 "이 브라우저에서는 기록이 저장되지 않아요")
  - 추후 서버 DB는 새 어댑터로 교체
- `store.ts`: 상태 보관 + `subscribe/getSnapshot` + 액션 함수(`completeMission`, `swapMission`, `appendChatMessage`, `markBridgeShown`, `renameBird`, `setLastSeenStage`, `resetAll`, 시연 액션들)
- React 훅 `useOngi(selector)` = `useSyncExternalStore`. 서버 렌더 시에는 `hydrated=false` 스냅샷 → 스켈레톤 표시 후 클라이언트에서 로드
- 스키마 버전이 다르거나 JSON 파싱 실패 → 기본 상태로 시작(기존 값은 `ongi:v1:backup`에 보관)

### 7.3 날짜
- `todayKey()` = `Asia/Seoul` 기준 `YYYY-MM-DD` + 시연 `dayOffset`
- 화면을 켜둔 채 자정을 넘겨도 "오늘"이 바뀌도록, 한국 자정 타이머와 화면 복귀(visibilitychange·focus·pageshow) 때 날짜를 다시 계산
- `dayIndex(key)` = 2026-01-01 기준 경과 일수

---

## 8. 오류 처리·접근성
- 대화 실패: 다시 보내기 / 오프라인 안내
- 이미지 실패: 기본 카드로 대체
- 저장 불가: 메모리 모드 + 안내
- 없는 레터 id: 404 안내
- 접근성: 탭 `aria-current`, 버튼 라벨, 텍스트 대비(노란 글씨 금지), 터치 영역 44px 이상, 동작 줄이기 대응

---

## 9. 에셋

### 9.1 마스코트 (팀 시안 기반)
- 원본: 팀이 만든 5단계 합성 이미지(1712×664, 배경 `#FDFAF5`)에서 단계별로 잘라 `public/mascot/stage-{1..5}.png`
  - 앱 배경을 시안 배경색과 같게 맞춰 배경 제거 없이 사용 (**임시 에셋**)
- 부리: 시안 그대로 짙은 색 (팀 결정)
- **1단계 들썩 애니메이션**: 같은 이미지를 CSS `clip-path`로 3겹(윗껍질 / 눈이 보이는 틈 / 아랫껍질)으로 나누고,
  틈 뒤에 어두운 속 영역을 깔아 윗껍질만 위아래로 들썩이게 함
- 최종 에셋(단계별 투명 PNG 1024px 이상, 1단계는 윗껍질·아랫껍질 분리본)을 받으면 파일만 교체
- 참고(선택): 4·5단계 차이가 작아 크기 차이 확대 또는 5단계 소품(온기우체부 가방 등) 추가 제안

### 9.2 PWA 아이콘
- 5단계 마스코트를 크림 배경 정사각형에 배치해 192·512px, maskable 버전 생성

---

## 10. 테스트 전략
- **단위(Vitest)**: KST 날짜 키·dayIndex, 오늘의 질문 선정, 결정적 셔플·미션 선정(N일 무반복)·교체,
  단계 계산·다음 단계까지 남은 수, 월별 통계, `detectCrisis`(양성·음성·관용표현), `MockProvider`(스트림·비어있지 않음),
  `/api/chat` 핸들러(검증 400, 위기 JSON, 정상 스트림), 레터 `cleanText`·병합, 스토어 액션·저장 어댑터(가짜 localStorage)
- **컴포넌트(Testing Library)**: 탭 바 선택 상태, 미션 완료 흐름(시트→완료→기록), 진화 연출 트리거
- **수동 QA**: 개발 서버를 모바일 뷰포트(390×844)로 띄워 탭별 화면·주요 흐름 스크린샷 확인

---

## 11. 폴더 구조
```
src/
  app/
    layout.tsx, globals.css, manifest.ts, not-found.tsx
    (tabs)/layout.tsx            # 탭 바 포함
    (tabs)/page.tsx              # 홈
    (tabs)/mission/page.tsx
    (tabs)/letters/page.tsx
    (tabs)/me/page.tsx
    chat/page.tsx
    letters/[id]/page.tsx
    api/chat/route.ts
  components/
    layout/   MobileShell, TabBar, AppBar
    ui/       Button, BottomSheet, ConfirmDialog, ProgressBar, HelplineCard
    mascot/   Mascot, EvolutionModal
    home/     QuestionBubble, TodayMissionShortcut
    chat/     ChatRoom, MessageBubble, QuickReplies, BridgeCard
    mission/  TodayMissionCard, CompleteSheet, MissionCalendar, DayDetailSheet
    letters/  CategoryChips, LetterCard, LetterGrid
    me/       ProfileCard, StatsTiles, GrowthAlbum, ChatRecordList, OngiLinks, SettingsSection
    demo/     DemoPanel
  lib/
    date.ts, random.ts, safety.ts, letters.ts, progress.ts
    llm/      types.ts, provider.ts, mock.ts, persona.ts
    storage/  types.ts, adapters.ts, store.ts, useOngi.ts
  data/
    questions.ts, missions.ts, stages.ts, categories.ts, links.ts, helplines.ts, letters.json
scripts/
  sync-letters.ts
public/
  mascot/, letters/, icons/, sw.js
```

---

## 12. 추후 과제 / 열린 항목
- 실제 LLM 연동: 같은 인터페이스의 구현체 추가(팀), 필요 시 위기 감지 보강
- 마스코트 최종 에셋 교체, 4·5단계 차별화
- 레터 그림: 나머지 레터 확대 생성, 신규 레터 분류 자동화(LLM 연동 후)
- 로그인·서버 DB(새 저장 어댑터), 여러 기기 동기화
- 앱 이름·마스코트 이름 확정, 배포(Vercel)
