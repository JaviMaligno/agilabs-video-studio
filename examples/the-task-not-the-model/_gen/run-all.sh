#!/bin/bash
cd "$(dirname "$0")"
running=0
while IFS=$'\t' read -r name size subj; do
  ./run-one.sh "$name" "$size" "$subj" &
  running=$((running+1))
  if [ $running -ge 5 ]; then wait -n; running=$((running-1)); fi
done < assets.tsv
wait
echo ALLDONE >> logs/done.txt
