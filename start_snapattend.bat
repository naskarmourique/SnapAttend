@echo off
echo ===================================================
echo     SNAPATTEND - STARTUP SCRIPT
echo ===================================================
echo.
echo [1/2] Starting Backend API Server (Port 8000)...
echo       Wait for "Application startup complete" message.
start "SnapAttend Backend" cmd /k "cd backend && python main.py"

echo.
echo [2/2] Starting Frontend Application (Port 8080)...
echo       Installing dependencies if needed and launching.
start "SnapAttend Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo DONE! 
echo.
echo 1. Backend: http://localhost:8000/docs
echo 2. Frontend: http://localhost:8080
echo.
echo IMPORTANT: If the student list is empty on first load,
echo PLEASE WAIT 10 seconds for the backend models to 
echo finish loading, then click the "Refresh Data" button.
echo ===================================================
pause
