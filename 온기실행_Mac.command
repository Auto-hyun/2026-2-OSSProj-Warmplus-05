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

echo "온기를 실행합니다 → $URL"
echo "끄려면 이 창에서 Ctrl+C 를 누르세요."
npm run dev -- --port "$PORT"
