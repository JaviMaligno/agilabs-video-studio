#!/bin/bash
# Tiles out/stills/*.png into 3x2 contact sheets in out/sheets (for looking at stills quickly).
cd "$(dirname "$0")/.." && mkdir -p out/sheets && rm -f out/sheets/*.png
set -- out/stills/f*.png; n=0
while [ $# -gt 0 ]; do
  a=("$@"); args=(); cnt=0
  for f in "${a[@]:0:6}"; do args+=(-i "$f"); cnt=$((cnt+1)); done
  while [ $cnt -lt 6 ]; do args+=(-f lavfi -i "color=c=white:s=540x960:d=1"); cnt=$((cnt+1)); done
  ffmpeg -loglevel error -y "${args[@]}" -filter_complex "xstack=inputs=6:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0" -frames:v 1 out/sheets/s$(printf %02d $n).png
  n=$((n+1)); shift $(( $# < 6 ? $# : 6 ))
done
ls out/sheets
