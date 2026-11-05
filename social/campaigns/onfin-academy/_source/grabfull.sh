k=$1; S=$2; L=${k%%-*}; r=${k#*-}; C=${r%%-*}; P=${r#*-}
U=$(awk -v l=$L -v c=$C '$1==l && $2==c {print $3}' $S/chapters.txt); d=$(awk -v l=$L -v c=$C '$1==l && $2==c {print $3}' $S/durations.txt)
t=$(python3 -c "print($d*$P/100)")
for o in horizontal vertical; do ffmpeg -v error -y -ss $t -i $U/$o/0/index.m3u8 -frames:v 1 -q:v 2 $S/frames/full/$k-$o.jpg; done
