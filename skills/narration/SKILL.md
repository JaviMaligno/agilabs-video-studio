---
name: narration
description: Voice the narration of an article explainer video - Cartesia TTS with word timestamps (key lookup, voice ids, model), the local Kokoro fallback, pronunciation tips for numbers and symbols, choosing a Spanish voice, and the audio QA thresholds (clipping, garbled lines, -16 LUFS). Use when running or debugging npm run tts / npm run audio-qa, or when the narration sounds wrong.
---

# Narration

`npm run tts` voices every line of `src/timeline.ts` into `public/audio/<lang>/<key>.wav`, with
Cartesia's word timestamps in `<key>.words.json`, and rewrites `src/audio.generated.ts` with the
real line lengths. Lines are cached by engine, voice, model, speed, emotion, text and the voice's `post` chain: only new or edited
lines are voiced again. `npm run tts -- en` or `-- es` limits it to one language.

## Cartesia setup

- Settings live in `video.config.mjs` (`tts`): model `sonic-3.6-2026-08-27`, speed `1`.
- **Emotion.** `tts.emotion: 'excited'` voices every English line with that Cartesia emotion
  (Javier chose it by ear over neutral, `enthusiastic` and `confident`). A line may override
  emotion and speed with its `tone`: `say(0, 'So the verdict.', '', undefined, { emotion:
  'confident', speed: 1.05 })`. Use only Cartesia's emotion list (`curious`, `amazed`,
  `surprised`, `confident`, `skeptical`, `contemplative`, `determined`, `triumphant`...), match it
  to what the words say, and keep speed within 1.0-1.08: `confident` at 1.1 sounded too fast.
  Emotions are English only; Spanish lines ignore them.
- EN voice: Javier's own cloned voice, `b7abe199-5f62-45fd-b77a-d12a1fe80a36`, with a `post`
  clean-up chain (below). Alternative stock voice: Quentin, `5568a7df-e5ab-4442-9fae-2e9ba1b15ad8`
  (en-GB), without `post`.
- `CARTESIA_API_KEY` is looked up in this order:
  1. the environment;
  2. `.env` in the video folder (gitignored; copy `.env.example`);
  3. `~/Documents/repos/.env`.
- Never print the key, echo it, or commit it. Check that it exists without showing it, for
  example `test -n "$CARTESIA_API_KEY" && echo set`.

## Post-processing (`post`)

Any voice in `video.config.mjs` (Cartesia `voices.<lang>` or `kokoro.voices.<lang>`) may carry
`post`: an ffmpeg `-af` chain that `npm run tts` applies to each line's WAV right after synthesis.
Javier's mic is weak, so his clone uses the approved "version B" chain (`JAVIER_POST` in
`video.config.mjs`): highpass 85 Hz, light `afftdn` denoise, -3.5 dB at 220 Hz, +5 dB at 3.2 kHz,
+4 dB high shelf at 8.5 kHz, gentle `acompressor`.

- The chain is part of the line cache: editing it re-voices (and re-processes) every line.
- It must keep each line's length, or the word timestamps drift: `atempo`, `silenceremove`,
  `atrim`, `apad`, `asetrate`... are refused, and the script fails if a line's length moves.
- No `loudnorm` needed: audio-qa normalises every line and the mix lands at -16 LUFS.
- To change voice: set `id` (and `post`, or drop it for a stock voice) and run `npm run tts`.

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

The TTS reads the narration text; the captions show the written text. When the TTS misreads
a number or symbol, give the line a **spoken form** as the fourth argument of `say`, and keep
the article's written form as the caption:

```ts
say(0.3, 'It solved 14/20 tasks.', 'Resolvió 14/20 tareas.', {
  en: 'It solved fourteen out of twenty tasks.',
  es: 'Resolvió catorce de veinte tareas.',
})
```

- The TTS voices the spoken form (and the cache re-voices the line when it changes); the line
  length comes from it.
- The caption shows the written text, timed proportionally over the line (word timestamps
  belong to the spoken words, so they are not used for that line).
- Write the line plainly ("14/20", "83 %", "p = 0.0018") and add a spoken form only when a
  listen shows the TTS gets it wrong.
- Slashes, version strings ("gpt-5.6"), file names and acronyms are the usual trouble. Listen to
  each line that has one.
- Colons: Javier's cloned voice makes the word before a colon rise like a question ("It said:"
  sounds like "It said?"), so `npm run tts` voices ": " as ". " by default (captions keep the
  colon; `tts.colonsAsStops: false` in `video.config.mjs` turns it off).

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
