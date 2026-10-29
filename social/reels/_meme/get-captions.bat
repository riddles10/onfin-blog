@echo off
rem Step 1 (Windows): download English captions only for every video in clip-urls.txt, then zip them.
rem Needs yt-dlp:  winget install yt-dlp.yt-dlp
cd /d "%~dp0"
yt-dlp --skip-download --write-auto-subs --write-subs --sub-langs "en.*" --sub-format vtt --sleep-requests 1 --download-archive captions-done.txt -o "captions/%%(id)s" -a clip-urls.txt
powershell -NoProfile -Command "Compress-Archive -Path captions\* -DestinationPath captions.zip -Force"
echo.
echo Done. Send captions.zip to Claude.
pause
