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
    intro('hook', [say(0.1, 'EN hook line.', 'ES hook line.')]),
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

### The first second

On the early reels about 40 % of viewers left within the first second, so the first frame must
already carry something: the hook card shows the whole hook from frame 0 (no fade-in, unspoken
words dimmed, not hidden) and its line starts at 0.1 s. Never open on an empty background.

**Cold open (optional, under test).** `intro(id, [hookLine], min, { name, props })` plays that
animation from the first frame, usually the video's most striking picture, and lays the whole hook
over it in a dark panel under the stage, each word lighting up as it is spoken. First tried on
`wheres-the-ball-2` (control `wheres-the-ball-3`); make it the default only if the 1 s and 3 s
retention improve.

### Author avatar: cameos and outro

Optional. Put the author's cut-outs in `public/avatar/` as transparent PNGs named
`avatar-<pose>.png` (`amazed`, `sceptical`, `thinking`, `laughing`, `laptop`, `pointing`,
`neutral`) plus a round picture for the outro, and set `avatar: 'avatar/avatar-profile.png'` in
`src/settings.ts`. The outro then shows the avatar above the badge.

A cameo is listed in an anim scene's props:

```ts
anim('result', 'BarCompare', { bars: [...], cameos: [{ pose: 'amazed', at: [1, 'eight'], dur: 2.2 }] }, [...lines]),
```

`at` is a mark, `[line index in the scene, word]`, resolved to the moment that word is spoken
(from the TTS word timestamps; estimated before TTS), or plain scene seconds. The avatar pops up
from the bottom-left corner for `dur` seconds (default 2.4), standing on the bottom safe line
behind the caption box, so it never covers the stage; `side: 'right'` mirrors it, but the
platform's action rail sits there. Check every cameo in a still: the captions must stay readable
on top of it. Two or three per video, never on the intro or the outro.

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

**Generated images.** Most scenes should be drawn in code (SVG and CSS from the brand tokens).
Drawings (people as caricatures, objects, the author's avatar poses) and the scenes that truly need
a generated image come from an image model, usually the Codex CLI. Save them under `public/`, load
them with `staticFile()`, keep them inside the brand palette, and check the still.

## Assets with Codex

- **One call per asset**, in a folder holding the references, with stdin closed so it never waits
  for input: `codex exec -s workspace-write "<prompt>" < /dev/null`. Within a minute or two, check
  that it is producing output; several assets run well as parallel calls.
- **Style by reference.** Put the style references in the folder (`ref-style.png`, the avatar's
  identity sheet) and say what they are for: "DRAWING STYLE reference only", so the model copies
  the line and the shading and draws its own subject. Ask for transparent PNGs at the size the
  scene uses.
- **The author's avatar** keeps one identity across every pose: pass the identity sheet and ask for
  the new pose as "IDENTICAL character, changing ONLY <pose / outfit>". A small fix (an eye colour,
  a shade of the T-shirt) is a recolour with Pillow, which keeps everything else exactly as it was.
- **Stories** (1080×1920 images for a reel's story) keep the top third clear for the text the
  author adds in the app.
- **Show finished candidates.** Each option offered for a choice is rendered and ready to use as
  it is.

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

Two more checks before delivery:

- **Must show.** Each item of the script's Must show list appears on screen; note its timestamp.
- **Time to read.** Text on the stage stays long enough to be read (~3.5 words/s plus 1 s), and
  the stage carries something at every moment. `npm run lint` covers the library components;
  bespoke components with their own text are checked here.
