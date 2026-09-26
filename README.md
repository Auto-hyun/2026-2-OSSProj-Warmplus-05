# 2026-2-OSSProj-Warmplus-05
동국대학교 2026 2학기 오픈소스소프트웨어프로젝트 5팀 Warm+ 레포지토리입니다.

## 온기 웹앱 실행 방법

### 더블클릭으로 실행
- **Mac**: `온기실행_Mac.command` 더블클릭 → 터미널 창이 열리고, 준비되면 브라우저가 자동으로 열려요.
- **Windows**: `온기실행_Windows.bat` 더블클릭
- 처음 한 번은 필요한 파일을 설치해요(1~2분). [Node.js](https://nodejs.org) LTS가 설치되어 있어야 해요.
- 끄려면 열린 창에서 `Ctrl+C`를 누르거나 창을 닫으세요.

### 터미널에서 실행

```bash
npm install          # 의존성 설치 (Node 20.9 이상, 권장 24)
npm run dev          # 개발 서버 → http://localhost:3000 (휴대폰 화면 크기로 보면 좋아요)
npm test             # 단위·컴포넌트 테스트 (Vitest)
npm run build        # 프로덕션 빌드
npm run sync:letters # 스티비에서 온기레터 목록을 다시 받아 src/data/letters.json 갱신
```

- 대화 기능은 기본적으로 목업 응답으로 동작해요. Claude 연동 방법은 `.env.example`을 참고하세요.
- 시연 모드: 주소 뒤에 `?demo=1`을 붙이면 미션 추가·단계 변경·날짜 이동 조작판이 나타나요.
- 설계 문서: `docs/superpowers/specs/2026-09-26-ongi-webapp-design.md`
- 구현 계획: `docs/superpowers/plans/2026-09-26-ongi-webapp-v1.md`
