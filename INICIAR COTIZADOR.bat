@echo off
setlocal
title Cotizador Mundo Bordados
cd /d "%~dp0"
set "CODEX_PNPM=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
set "CODEX_NODE_BIN=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"

if exist "%CODEX_NODE_BIN%\node.exe" set "PATH=%CODEX_NODE_BIN%;%PATH%"

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:5173'"

if exist "%CODEX_PNPM%" (
  call "%CODEX_PNPM%" run dev
  goto :end
)

where pnpm >nul 2>nul
if %errorlevel%==0 (
  pnpm run dev
  goto :end
)

where npm >nul 2>nul
if %errorlevel%==0 (
  npm run dev
  goto :end
)

echo No se encontro Node.js. Instale Node.js y vuelva a intentarlo.
pause

:end
endlocal
