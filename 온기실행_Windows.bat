@echo off
chcp 65001 >nul
rem 온기 웹앱 실행 (Windows) - 이 파일을 더블클릭하세요.
rem 처음 한 번은 필요한 패키지를 설치하고, 준비되면 브라우저가 자동으로 열려요.
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js가 설치되어 있지 않아요.
  echo https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 더블클릭해 주세요.
  pause
  exit /b 1
)

if not exist node_modules (
  echo 처음 실행이라 필요한 파일을 설치하고 있어요. ^(1~2분 걸려요^)
  call npm install
  if errorlevel 1 (
    echo 설치에 실패했어요. 인터넷 연결을 확인해 주세요.
    pause
    exit /b 1
  )
)

rem 서버가 응답하면 브라우저를 연다 (최대 90초 기다림)
start "" /min powershell -NoProfile -Command "for($i=0;$i -lt 90;$i++){try{Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000' -TimeoutSec 2 | Out-Null; Start-Process 'http://localhost:3000'; break}catch{Start-Sleep 1}}"

echo 온기를 실행합니다 -^> http://localhost:3000
echo 끄려면 이 창에서 Ctrl+C 를 누르세요.
call npm run dev -- --port 3000
pause
