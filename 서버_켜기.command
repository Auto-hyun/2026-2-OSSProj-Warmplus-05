#!/bin/zsh
# 더블클릭하면 오목이 dev 서버를 켜고, 준비되면 브라우저로 http://localhost:3000 을 연다.
# 끌 때는 이 터미널 창에서 Ctrl + C

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")/src" || exit 1

# 서버가 응답하면 브라우저 열기
(until curl -s -o /dev/null http://localhost:3000; do sleep 1; done; open http://localhost:3000) &

npm run dev
