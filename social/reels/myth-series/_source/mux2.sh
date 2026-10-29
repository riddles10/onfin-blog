#!/bin/bash
# mux2.sh <ep> <lang>: voiceover (-14 LUFS) + Suno bed at 20% volume (looped, 3s crossfade, 2s fade out) onto frames
set -e
e=$1; l=$2
D=$(python3 -c "import json;print(json.loads(open('ep${e}_$l.js',encoding='utf-8').read()[len('window.EP='):-1])['dur'])")
ffmpeg -v error -y -i music.mp3 -i music.mp3 -filter_complex "[0:a][1:a]acrossfade=d=3:c1=tri:c2=tri,atrim=0:$D,afade=t=out:st=$(python3 -c "print($D-2)"):d=2,volume=0.2[m]" -map "[m]" -ar 48000 bed${e}_$l.wav
ffmpeg -v error -y -i vo${e}_$l.mp3 -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 von${e}_$l.wav
ffmpeg -v error -y -i von${e}_$l.wav -i bed${e}_$l.wav -filter_complex "[0:a]apad[v];[v][1:a]amix=inputs=2:duration=longest:normalize=0,atrim=0:$D,alimiter=limit=0.89[a]" -map "[a]" -ar 48000 mix${e}_$l.wav
ffmpeg -v error -y -framerate 30 -i f${e}_$l/%04d.png -i mix${e}_$l.wav -map 0:v -map 1:a -t $D -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart onfin-myth$e-$l.mp4
rm -rf f${e}_$l bed${e}_$l.wav von${e}_$l.wav
echo "$e $l done $D"
