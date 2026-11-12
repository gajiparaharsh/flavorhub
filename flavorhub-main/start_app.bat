@echo off
TITLE FlavorHub Launcher
echo ==================================================
echo        FlavorHub Full Stack Application
echo ==================================================
echo.

echo [1/2] Starting Backend Server...
echo Directory: ./backend
echo Command: npm run dev
start "FlavorHub Backend" /d backend cmd /k "npm run dev"

echo.
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul
echo.

echo [2/2] Starting Frontend Server...
echo Directory: ./
echo Command: npm run dev
start "FlavorHub Frontend" cmd /k "npm run dev"

echo.
echo ==================================================
echo        Servers are running!
echo ==================================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend UI:  http://localhost:8080
echo.
echo NOTE: Do not close the popped-up command windows.
echo To stop servers, close those windows or press Ctrl+C in them.
echo.
pause
