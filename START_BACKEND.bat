@echo off
echo ========================================
echo   PODIUM PAL - Starting Backend Server
echo ========================================
echo.
cd backend
echo Checking Python dependencies...
python -c "import fastapi; import google.generativeai; print('✓ All dependencies installed')"
echo.
echo Starting FastAPI server on http://localhost:8000
echo Press CTRL+C to stop
echo.
python main.py
pause
