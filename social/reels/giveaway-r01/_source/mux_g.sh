#!/bin/bash
# mux_g.sh <frames_dir> <out.mp4>: music bed (music.mp3, Quick News Beat) normalised to about -16 LUFS, 0.4s fade in, 1.8s fade out, 20s
set -e
ffmpeg -v error -y -i music.mp3 -af "atrim=0:20,afade=t=in:d=0.4,afade=t=out:st=18.2:d=1.8,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 bed_tmp.wav
ffmpeg -v error -y -framerate 30 -i $1/%04d.png -i bed_tmp.wav -map 0:v -map 1:a -t 20 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart $2
rm -f bed_tmp.wav
echo "$2 done"
