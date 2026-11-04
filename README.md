# 2026-2-OSSProj-Warmplus-05

동국대학교 2026년 2학기 오픈소스소프트웨어프로젝트 5팀 Warm+ 레포지토리입니다.

## 👋 팀원 소개

| 이름 | 전공 | 역할 |
|---|---|---|
| 조수아 (팀장) | 통계학과 (SWAI 연계전공) | 기획 · 디자인 · 콘텐츠 |
| 전동현 | 통계학과 (SWAI 연계전공) | 프론트엔드 · 서버 |
| 박현준 | 통계학과 (SWAI 연계전공) | 리서치 · 데이터 분석 · 안전 검증 |

## 📁 폴더 구성

- `src/`: 팀 프로젝트의 오픈소스 소프트웨어 (온사이드 아웃 웹앱, Next.js)
- `doc/`: 수행계획서 · 발표자료 · 회의록 등 제출 문서

---

## 🛠️ Tech

### Frameworks
![Next.js](.github/assets/badges/next_js.svg)
![React](.github/assets/badges/react.svg)
![TypeScript](.github/assets/badges/typescript.svg)
![Tailwind CSS](.github/assets/badges/tailwind_css.svg)

### Server · AI
![Vercel](.github/assets/badges/vercel.svg)
![Supabase](.github/assets/badges/supabase.svg)
![Claude API](.github/assets/badges/claude_api.svg)

### Tools
![Vitest](.github/assets/badges/vitest.svg)
![Testing Library](.github/assets/badges/testing_library.svg)
![GitHub](.github/assets/badges/github.svg)
![Notion](.github/assets/badges/notion.svg)
![Slack](.github/assets/badges/slack.svg)

---

## 1. 프로젝트 명

<img src="src/public/omok/hello.webp" alt="오목이" width="240">

**온사이드 아웃 🎵**: 지금 내 기분과 감정을 노래로. 오목이와 마음 날씨를 기록하고, 감정에 맞는 연주곡을 만나는 웹앱

협력 기관: 사단법인 온기 (카카오 테크포임팩트)

## 2. 프로젝트 소개

> 오목이와 함께 오늘의 마음 날씨를 기록하고, 심리테스트 유형이나 감정 단어로 나에게 어울리는 연주곡을 만나요. 오늘 있었던 일을 노래와 함께 나누고, 최근 마음 날씨를 기억하는 오목이에게 마음을 이야기할 수 있어요.

## 3. 주요 기능

| 공간 | 하는 일 |
|---|---|
| 🏡 오목이 집 | 세 가지 질문으로 오늘의 마음 날씨를 기록하고, 한 달의 마음 구슬을 유리병에 모아요 |
| 🗺️ 마음 마을 | 지도를 따라 노래 공방·마음 테스트 숲·이야기 광장으로 이동해요 |
| 🎵 노래 공방 | 심리테스트 유형이나 감정 단어 최대 3개로 나에게 어울리는 연주곡을 요청해요 |
| 🌳 마음 테스트 숲 | 가벼운 심리테스트로 나를 알아봐요. 지금은 문항을 준비하고 있어요 |
| 💬 이야기 광장 | 오늘 있었던 일을 노래와 함께 나눠요. 오목이가 글쓰기 주제도 건네요 |
| 🧶 오목이 대화 | 최근 마음 날씨를 기억하는 오목이에게 마음을 이야기해요 |
| 🍀 오하아사 | 오늘의 별자리 순위와 운세, 럭키 아이템·컬러를 재미로 확인해요 |
| 📚 마이페이지 | 지난 마음 기록과 테스트 결과, 노래, 내가 쓴 글을 모아 봐요 |

## 4. 웹앱 실행 방법

### 더블클릭으로 실행
- **Mac**: `서버_켜기.command` 더블클릭 → 터미널 창이 열리고, 준비되면 브라우저가 자동으로 열려요.
  - "확인되지 않은 개발자" 경고로 열리지 않으면 파일을 **우클릭(또는 control+클릭) → 열기**를 한 번 해 주세요. 다음부터는 더블클릭으로 열려요.
- 끄려면 열린 창에서 `Ctrl+C`를 누르거나 창을 닫으세요.

### 터미널에서 실행

```bash
cd src          # 웹앱 폴더로 이동
npm install     # 의존성 설치
npm run dev     # 개발 서버 → http://localhost:3000 (휴대폰 화면 크기로 보면 좋아요)
npm test        # 단위·화면 테스트 (Vitest)
npm run build   # 배포용 빌드
```

- **환경변수:** `src/.env.example`을 참고해 `src/.env.local`에 설정해요.
- **음악:** 기본은 비용 없이 흐름을 확인하는 샘플 곡 모드예요. 연동 정보를 설정하고 `MUSIC_PROVIDER=suno`로 바꾸면 sunoapi.org로 실제 작곡을 요청해요.
- **커뮤니티:** Docker를 켜고 `src/`에서 `supabase start`를 실행한 뒤, 출력된 URL과 키를 환경변수에 넣어요.

## 5. 알아두세요 🌱

- 개인 기록은 지금 사용하는 브라우저에 저장돼요. 다른 기기에서는 이어지지 않고, 브라우저 데이터를 지우면 사라질 수 있어요. 커뮤니티 글은 Supabase에 저장돼요.
- 오목이와 대화할 때는 답변에 필요한 메시지와 일부 기록이 Claude API로 전송돼요. 오목이는 마음을 표현하는 친구이며, 전문 상담이나 치료를 대신하지 않아요.
