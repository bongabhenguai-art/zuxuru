@echo off
setlocal
cd /d "%~dp0"
where ollama >nul 2>nul
if errorlevel 1 (
  echo Install Ollama first: https://ollama.com/download/windows
  pause
  exit /b 1
)
where python >nul 2>nul
if errorlevel 1 (
  echo Install Python first: https://www.python.org/downloads/windows/
  pause
  exit /b 1
)
ollama pull qwen3:1.7b
if errorlevel 1 (
  echo Open Ollama and try again. Model download needs internet.
  pause
  exit /b 1
)
python local_runner.py
if errorlevel 1 (
  echo Jarvis could not finish. Check that Ollama is running.
  pause
  exit /b 1
)
start "" "jarvis-local-report.md"
pause
