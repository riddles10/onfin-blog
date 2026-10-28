#!/bin/bash
# mux.sh <lang>: voiceover (-14 LUFS) + Suno bed at 20% volume, looped with a 3s crossfade, 2s fade out, onto the rendered frames
set -e
l=$1; D=$(python3 -c "import json;print(json.loads(open('ep01_$l.js').read()[len('window.EP='):-1])['dur'])")
ffmpeg -v error -y -i music.mp3 -i music.mp3 -filter_complex "[0:a][1:a]acrossfade=d=3:c1=tri:c2=tri,atrim=0:$D,afade=t=out:st=$(python3 -c "print($D-2)"):d=2,volume=0.2[m]" -map "[m]" -ar 48000 bed_$l.wav
ffmpeg -v error -y -i vo_$l.mp3 -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 von_$l.wav
ffmpeg -v error -y -i von_$l.wav -i bed_$l.wav -filter_complex "[0:a]apad[v];[v][1:a]amix=inputs=2:duration=longest:normalize=0,atrim=0:$D,alimiter=limit=0.89[a]" -map "[a]" -ar 48000 mix_$l.wav
ffmpeg -v error -y -framerate 30 -i frames_$l/%04d.png -i mix_$l.wav -map 0:v -map 1:a -t $D -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart onfin-myth01-$l.mp4
echo "$l done $D"
