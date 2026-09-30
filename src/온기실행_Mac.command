#!/bin/bash
# 온기 웹앱 실행 (macOS) — Finder에서 이 파일을 더블클릭하세요.
# 처음 한 번은 필요한 패키지를 설치하고, 준비되면 브라우저가 자동으로 열려요.
# 끄려면 열린 터미널 창에서 Ctrl+C 를 누르거나 창을 닫으세요.

cd "$(dirname "$0")" || exit 1

pause_and_exit() {
  echo
  read -r -n 1 -s -p "아무 키나 누르면 창을 닫아요..."
  exit "${1:-1}"
}

# nvm으로 설치한 Node는 셸 설정을 거쳐야 보일 수 있어서 한 번 더 찾아본다
if ! command -v npm >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js가 설치되어 있지 않아요."
  echo "https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 더블클릭해 주세요."
  pause_and_exit 1
fi

if [ ! -d node_modules ]; then
  echo "처음 실행이라 필요한 파일을 설치하고 있어요. (1~2분 걸려요)"
  npm install || { echo "설치에 실패했어요. 인터넷 연결을 확인해 주세요."; pause_and_exit 1; }
fi

# 이 폴더의 온기 서버가 이미 켜져 있으면 새로 켜지 않고 그 화면을 연다.
# (Next.js 16은 한 폴더에 개발 서버를 하나만 허락해서, 두 번째 서버는 켜지자마자 꺼진다)
LOCK=.next/dev/lock
if [ -f "$LOCK" ]; then
  RUNNING_PID=$(sed -n 's/.*"pid":\([0-9]*\).*/\1/p' "$LOCK")
  RUNNING_URL=$(sed -n 's/.*"appUrl":"\([^"]*\)".*/\1/p' "$LOCK")
  if [ -n "$RUNNING_PID" ] && [ -n "$RUNNING_URL" ] && ps -p "$RUNNING_PID" -o command= | grep -q next; then
    echo "온기가 이미 켜져 있어요. 새로 켜지 않고 그 화면을 열게요 → $RUNNING_URL"
    open "$RUNNING_URL"
    pause_and_exit 0
  fi
fi

# 3000번부터 비어 있는 포트를 찾는다
PORT=3000
while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT + 1)); done
URL="http://localhost:$PORT"

# 서버가 응답하면 브라우저를 연다 (최대 90초 기다림)
(
  for _ in $(seq 1 90); do
    if curl -s -o /dev/null "$URL"; then
      open "$URL"
      break
    fi
    sleep 1
  done
) &
OPENER=$!

echo "온기를 실행합니다 → $URL"
echo "끄려면 이 창에서 Ctrl+C 를 누르세요."
npm run dev -- --port "$PORT"
STATUS=$?
kill "$OPENER" 2>/dev/null
# Ctrl+C(130)로 끈 게 아니면 창이 바로 닫히지 않게 멈춰서 오류를 보여준다
if [ "$STATUS" -ne 0 ] && [ "$STATUS" -ne 130 ]; then
  echo
  echo "서버가 멈췄어요. 위에 나온 오류 내용을 확인해 주세요."
  pause_and_exit "$STATUS"
fi
