# AGENTS.md

온기 오픈소스SW 프로젝트의 배포용 앱 "오목이 사운드 테라피". 팀원(동현)이 만든 `Auto-hyun/omok_soundtherapy`가 기본 틀이고, 현준은 `hj` 브랜치에서 작업한다.
작업 전에 `docs/spec.md`를 읽는다. 웹앱 코드는 `src/`에 있고, `src/AGENTS.md`(Next.js 16 규칙)도 따른다.

## 규칙
- 설명은 한국어로
- 이 폴더 밖의 파일은 수정하지 않는다
- 기존 구조(탭·폴더·데이터 형식)를 우선 따르고, 내용은 `docs/spec.md`의 결정으로 채운다
- `docs/spec.md` 결정표는 사람이 확정한 내용만 적는다. 제안은 따로 보고하고 직접 고치지 않는다
- 노래는 샘플 모드(미리 만든 곡 풀)로 제공한다. sunoapi.org 등 Suno 대행 API 호출(`MUSIC_PROVIDER=suno`, `samples:suno` 스크립트)은 쓰지 않는다
- git commit/push는 하지 않는다 (사람이 확인 후 진행)
- 작업이 끝나면 만든/바꾼 파일 목록과 확인 방법(`cd src && npm test`, `npm run dev`)을 짧게 보고
