---
name: explainer-animation
description: Build the scenes of an article explainer video in Remotion - write src/timeline.ts from an approved script, pick and configure animation components (Counter, BarCompare, FlowDiagram, KeyQuote, StatGrid), add a bespoke component with a tested frameState, keep to the vertical safe area and check rendered stills by eye. Use when composing, changing or debugging the scenes of a video made with this plugin.
---

# Explainer animation

A video is an ordered list of scenes in `src/timeline.ts`. Three kinds:

- `intro`: the hook card. Its first line is the hook, shown big, its words lighting up as they
  are spoken (it doubles as its own caption).
- `anim`: one animation component from the registry, synced to the scene's narration lines.
- `outro`: the closing card with the AGILabs badge, `javieraguilar.ai` and the article title
  from `SETTINGS.articleTitle`.

## Writing the timeline

```ts
import type { Cuts } from './types.ts';
import { L, anim, intro, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    intro('hook', [say(0.4, 'EN hook line.', 'ES hook line.')]),
    anim(
      'result',
      'BarCompare',
      { bars: [{ label: L('With the reason', 'Con el porqué'), value: 14, display: '14/20', highlight: true },
               { label: L('Without it', 'Sin él'), value: 4, display: '4/20' }], max: 20 },
      [say(0.3, 'First line.', 'Primera línea.'), say(0, 'Second line.', 'Segunda línea.')],
      { min: 4 },
    ),
    outro('outro', [say(0.4, 'More at javieraguilar.ai.', 'Más en javieraguilar.ai.')]),
  ],
});

export const VIDEOS = videos(build);
export const TIMELINE = VIDEOS.en.main;
```

- `say(at, en, es, spoken?)`: one narration line. `at` is the earliest scene second it may
  start; lines never overlap (0.35 s gap), and the scene lasts until its last line ends plus
  0.8 s, or `min`. `spoken` (`{ en?, es? }`) is what the TTS reads when it differs from the
  caption text (see `narration`).
- **Beats.** The start time of each line in a scene is a beat. Components play step *i* on beat
  *i* (bar *i* grows, node *i* appears, tile *i* pops), so write one line per step you want to
  reveal. Before TTS the beats come from a length estimate; after `npm run tts` they come from
  the real audio, so re-check stills after narrating.
- `L(en, es)`: a bilingual on-screen label. A plain string is used for both languages.
- Scene ids must be unique: line keys (`<scene>-01`, ...) name the audio files.
- `opts.chapter` on `anim` is stored on the scene but not drawn by any component yet.
- Run `npm run lint` after every change: length against `targetSeconds` (±20 %), caption cues
  under 0.8 s or over 17 characters/s, and component names missing from the registry.

## Component catalogue

All components receive `t`, `beats`, `dur`, `lang` and `vertical` from the scene; the props
below come from the timeline. Numbers shown on screen use the article's exact form: prefer
`display` / string `value` over computed text whenever the article writes "14/20", "0.0018"
or "83 %".

| Component | Use for | Props |
|---|---|---|
| `Counter` | One headline figure counting up, label underneath | `value: number`, `label: Label`, `prefix?`, `suffix?`, `decimals?` (0-8), `beat?` (index of the beat the count starts on, default 0) |
| `BarCompare` | 2-5 horizontal bars growing one per beat; the highlighted one in the accent gradient | `bars: { label: Label; value: number; display?: string; highlight?: boolean; at?: number }[]`, `max?` (scale top, default the largest value), `unit?` (appended when there is no `display`) |
| `FlowDiagram` | Boxes and arrows appearing in order; a `broken` edge is dashed and muted, with a gap | `nodes: { id; label: Label; at?: number }[]`, `edges: { from; to; label?: Label; broken?: boolean }[]`, `layout: 'vertical' \| 'horizontal'` (use `vertical` for the 9:16 cut) |
| `KeyQuote` | The key sentence, word by word, emphasised words in the accent with an underline | `text: Label`, `emphasis?: string[]` (words or phrases, matched ignoring case and punctuation), `beat?` |
| `StatGrid` | 2-4 figure tiles popping in one per beat | `stats: { value: string; label: Label; at?: number }[]` |

`at` on a bar, node or tile pins it to a scene second instead of its own beat. Steps without
a beat or `at` follow 0.6 s after the previous one. Every component is fitted so it finishes by
the scene end: the last frame always shows the finished state.

To see the whole library: `npm run studio` and open `Gallery-vertical`, or render stills of it.

## Adding a bespoke component

When the script flags a scene "bespoke":

1. **State first, with a test.** Write `src/anim/<Name>.state.ts` with the props type and a pure
   `frameState(props, t, beats, dur)` that returns plain numbers and strings. No Remotion or
   React imports there. Build it on `src/anim/steps.ts` (`sceneTime`, `stepTimes`, `fit`,
   `progress`, `beatAt`, `easeOutCubic`) so it is total: finite values at any `t`, progress
   fields within [0, 1], nothing visible before its first beat, the end state at `t = dur`.
2. Add a case to `CASES` in `test/anim.test.ts` (and a test of its own behaviour), then run
   `npm test`. It checks the state over `t < 0`, every beat, `dur` and past `dur`, with missing,
   late and very short beats.
3. **Draw it** in `src/anim/<Name>.tsx`: call `frameState`, draw inside `<Stage vertical={...}>`,
   use the brand tokens from `src/brand.ts` (`C`, `GRADIENT`, `alpha`) and Inter. No new
   colours or fonts.
4. **Register it** in `ANIMS` in `src/anim/index.ts`. Keep `ANIMS` a plain object literal of
   names: `npm run lint` reads them from the source.
5. Optionally add a sample to `src/Gallery.tsx`. If it is reusable, it belongs back in the
   plugin's template.

## Vertical safe area (1080x1920)

- Platform UI covers the top ~220 px and the bottom ~380 px; keep 72 px at the sides.
- Animations draw only inside the stage: from y = 280 (below the AGILabs badge) to y = 1280
  (above the two caption rows), 936 px wide. `Stage` / `stageOf()` give you that box.
- Captions sit below the stage, at most two rows of ~32 characters, within ~900 px.

## Stills: look at them

Render stills and **Read every PNG** before rendering the video. A clean lint or build does not
show overflow, clipped text or a wrong number.

```bash
npx remotion still src/index.ts Main-EN-vertical out/stills/f0150.png --frame=150
```

Take one still per scene once its last step has played, plus one every ~3 s (every 90 frames
at 30 fps). Check: AGILabs badge and nothing else as branding, nothing outside the safe area,
no text overflowing its box, every figure equal to the article, and the caption on screen
matching what the animation shows at that moment.
