@echo off
echo ==============================================
echo  Starting BookBridge FastAPI Backend Server
echo ==============================================
cd /d "%~dp0backend"
if exist "..\venv\Scripts\python.exe" (
    ..\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else if exist "..\env\Scripts\python.exe" (
    ..\env\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)
pause
