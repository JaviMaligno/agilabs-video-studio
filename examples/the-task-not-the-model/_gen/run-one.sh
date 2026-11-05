#!/bin/bash
# usage: run-one.sh name size subject
cd "$(dirname "$0")"
name="$1"; size="$2"; subj="$3"
prompt="Create ONE image file named ${name}.png in the current directory using your image_gen tool, then make sure it is saved exactly at ./${name}.png (copy it there if the tool saved it elsewhere). Canvas ${size}, PNG with a fully transparent alpha background (real alpha, no checkerboard, no backdrop, no ground shadow). Use ref-style.png and ref-object.png in this folder ONLY as DRAWING STYLE references: clean thin dark outlines, flat illustration with restrained soft shading, friendly polished look, subtle pale edge highlights so the object reads on a dark navy background. Do NOT draw the man or the stopwatch. Subject: ${subj}. The subject is centred, fills about 80% of the canvas, with clear margins. Absolutely no text, letters, words, numbers, logos, brand marks or watermark. When done, verify with python (PIL) that ./${name}.png exists, has mode RGBA and transparent corners; if the background is not transparent, remove it so the corners are alpha 0. Do not create any other files."
codex exec -s workspace-write "$prompt" < /dev/null > "logs/${name}.log" 2>&1
echo "exit $? ${name}" >> logs/done.txt
