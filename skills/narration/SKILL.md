---
name: narration
description: Voice the narration of an article explainer video - Cartesia TTS with word timestamps (key lookup, voice ids, model), the local Kokoro fallback, pronunciation tips for numbers and symbols, choosing a Spanish voice, and the audio QA thresholds (clipping, garbled lines, -16 LUFS). Use when running or debugging npm run tts / npm run audio-qa, or when the narration sounds wrong.
---

# Narration

`npm run tts` voices every line of `src/timeline.ts` into `public/audio/<lang>/<key>.wav`, with
Cartesia's word timestamps in `<key>.words.json`, and rewrites `src/audio.generated.ts` with the
real line lengths. Lines are cached by engine, voice, model, speed and text: only new or edited
lines are voiced again. `npm run tts -- en` or `-- es` limits it to one language.

## Cartesia setup

- Settings live in `video.config.mjs` (`tts`): model `sonic-3.6-2026-08-27`, speed `1`.
- EN voice: `5568a7df-e5ab-4442-9fae-2e9ba1b15ad8` (en-GB).
- `CARTESIA_API_KEY` is looked up in this order:
  1. the environment;
  2. `.env` in the video folder (gitignored; copy `.env.example`);
  3. `~/Documents/repos/.env`.
- Never print the key, echo it, or commit it. Check that it exists without showing it, for
  example `test -n "$CARTESIA_API_KEY" && echo set`.

## Engines and the Kokoro fallback

`tts.engine` in `video.config.mjs`:

- `auto` (default): Cartesia when a key is found and the service answers; otherwise the whole
  language is voiced with Kokoro (local, free) and a warning is printed. A language is never a
  mix of two voices: if Cartesia drops out half way, the whole language is redone with Kokoro,
  and the next run with Cartesia back redoes it again.
- `cartesia`: fail instead of falling back.
- `kokoro`: stay offline. Voices: `af_bella` (EN), `ef_dora` (ES). Kokoro gives no word
  timestamps, so captions are timed proportionally.

A warning about Kokoro in the output means the video does not have the Cartesia voice: say so
when handing the video over.

## Spanish voice

`voices.es` is `null` until a Spanish version is made. Pick a Spanish voice from the Cartesia
voice library, listen to a sample line from the script, record its id in `video.config.mjs`
(`es: { id: '<voice-id>', language: 'es' }`), and add `'es'` to `SETTINGS.voices` (and to
`SETTINGS.subtitles` if Spanish captions are wanted).

## Pronunciation

The TTS reads the narration text. Captions show the written words; when the spoken words do not
match the written ones one to one, the captions fall back to proportional timing and still show
the written text. So:

- Write the line the way the article writes it ("14/20", "83 %", "p = 0.0018") when the TTS
  reads it correctly.
- When it does not, write the spoken form in the narration ("fourteen out of twenty",
  "eighty-three percent", "gpt five point six") and keep the written form on screen in the
  component (`display`, `value`, `label`). Check that the caption still reads well; if the
  caption must show the written form, prefer moving the number into the component.
- Slashes, version strings, file names and acronyms are the usual trouble. Listen to each line
  that has one.

## Audio QA

`npm run audio-qa` (writes `out/audio-qa.md`):

- normalises every line to the same loudness (once per file version);
- flags a line as **clipped** when its source peak reaches -0.1 dBFS;
- flags a line as **too long** when it lasts more than **1.6x** its estimate from the text
  length: a sign of garbled or repeated speech. Listen to every flagged line and re-voice it
  (edit the text slightly, or delete its wav) if it is wrong;
- after `npm run render`, measures each mix in `out/` against **-16 LUFS integrated, ±1 LU**
  (true peak -1.5 dBTP) and exits 1 when one is off target.

After narrating, run `npm run lint` again: real lengths replace the estimates and can push the
video off its target length or a caption over 17 characters/s.

## Music bed

A soft bed is generated locally (`npm run music`, made automatically by `npm run render` when
missing; needs python3 with numpy, or `uv`). It is ducked to 30 % of its volume while a line
plays. Set `SETTINGS.music` to `null` for no music.
