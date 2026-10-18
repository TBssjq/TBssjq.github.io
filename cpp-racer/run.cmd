@echo off
chcp 65001 >nul
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] 未找到 python，无法启动本地服务器。
  echo         请改用:  npx --yes serve .
  pause
  exit /b 1
)

echo [RACE_ENGINE] http://localhost:8791/  (Ctrl+C 停止)
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep 2; Start-Process 'http://localhost:8791/'"
python -m http.server 8791
