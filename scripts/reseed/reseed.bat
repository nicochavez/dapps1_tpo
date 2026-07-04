@echo off
REM Doble clic para resetear la base durante la demo.
cd /d "%~dp0"
if not exist node_modules ( echo Instalando dependencias... & call npm install )
node reseed.js
echo.
pause
