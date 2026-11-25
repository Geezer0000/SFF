@echo off
setlocal

:: Check if server is already responding on port 5173
powershell -NoProfile -Command "try { $r = [System.Net.WebRequest]::Create('http://localhost:5173/'); $r.Timeout = 1200; $resp = $r.GetResponse(); $resp.Close(); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo Starting ProSchweiz Scorecard server...
    start /min cmd.exe /c "cd /d c:\SFF\frontend && npm run dev -- --host localhost --port 5173"
    timeout /t 2 /nobreak >nul
)

:: Launch in Google Chrome
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:5173/"
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:5173/"
) else (
    start "" "http://localhost:5173/"
)

exit /b 0
