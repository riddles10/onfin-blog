#!/bin/bash
# Step 1 (Mac/Linux): download English captions only for every video in clip-urls.txt, then zip them.
# Needs yt-dlp:  brew install yt-dlp   (or: pip install -U yt-dlp)
cd "$(dirname "$0")"
yt-dlp --skip-download --write-auto-subs --write-subs --sub-langs "en.*" --sub-format vtt --sleep-requests 1 \
  --download-archive captions-done.txt -o "captions/%(id)s" -a clip-urls.txt
zip -qr captions.zip captions
echo "Done. Send captions.zip to Claude."
