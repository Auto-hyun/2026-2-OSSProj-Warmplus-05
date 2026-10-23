# 오목이 — 사운드 테라피 웹앱

지금 내 기분과 감정을 노래로. 오목이가 감정에 맞는 연주곡을 만들어 주는 웹앱이에요.

| 탭 | 하는 일 |
|---|---|
| 오목이 | 오목이가 심리테스트를 권해요. 아래에는 생년월일과 태어난 시각으로 보는 오하아사(오늘의 12별자리 순위, 운세와 조언, 럭키 아이템·컬러)가 있어요 |
| 노래 만들기 | 심리테스트 유형으로, 또는 지금 감정에 맞는 단어(최대 3개)로 Suno에게 가사 없는 곡을 맡겨요 |
| 커뮤니티 | 오늘 있었던 일을 내가 만든 노래와 함께 올려요. 글쓰기에서는 오목이가 주제를 하나씩 건네요 |
| 마이페이지 | 내 심리테스트 유형, 만든 노래, 쓴 글을 모아 보고 지울 수 있어요 |

**처음이라면 [직접_해야_할_일.md](직접_해야_할_일.md)부터 봐 주세요.** Supabase 연결, Suno 충전, 배포 방법이 있어요.

## 폴더

- `src/`: 웹앱 (Next.js 16, Tailwind CSS 4, Supabase)
  - `app/`: 화면과 API (`api/songs`: 작곡 맡기기와 상태 확인)
  - `components/`: 화면 부품 (탭별 폴더)
  - `data/`: 심리테스트, 감정 단어, 음악 스타일, 운세 문구, 커뮤니티 주제
  - `lib/`: 운세 계산, 작곡 요청(Suno/샘플), 기기 저장, 커뮤니티
  - `supabase/migrations/`: 커뮤니티 DB와 노래 저장소 설정 SQL
  - `public/omok/`: 오목이 그림, `public/samples/`: 샘플 곡 모드용 곡

## 실행

```bash
cd src
npm install
npm run dev      # http://localhost:3000 (휴대폰 화면 크기로 보면 좋아요)
npm test         # 단위·화면 테스트 (Vitest)
npm run build    # 배포용 빌드
```

- 설정은 `src/.env.local`에 있어요 (예시는 `src/.env.example`).
- 작곡은 기본이 **샘플 곡 모드**예요. 미리 넣어 둔 곡으로 흐름만 보여 줘서 돈이 들지 않아요. `MUSIC_PROVIDER=suno`로 바꾸면 sunoapi.org로 실제 작곡해요.
- 커뮤니티를 내 컴퓨터에서 시험하려면 Docker를 켜고 `cd src && supabase start`를 실행해요. 그다음 출력된 URL과 키를 `.env.local`에 넣어요.
- Supabase에 붙여 보는 시험(평소에는 건너뜀):

  ```bash
  SUPABASE_TEST_URL=http://127.0.0.1:54321 SUPABASE_TEST_KEY=<publishable key> SUPABASE_TEST_SECRET=<secret key> npx vitest run integration
  ```
