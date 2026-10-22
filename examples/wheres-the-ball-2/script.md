# Where's the Ball? Part 2 — article video (EN) · script draft v1.0

Article: wheres-the-ball-2 (javieraguilar.ai, EN, `pubDate` 2026-07-27; read from
`origin/main:src/content/blog/en/wheres-the-ball-2.md` of personal-website). Numbers cross-checked
against the public experiment repo `JaviMaligno/wheres-the-ball` (the article's `repoUrl`;
local copy `docs/nivel-2-cierre.md`, `docs/nivel-2-asimetria-mecanismo.md`). Vertical 9:16,
target ~98 s (ceiling 105 s), 263 counted words. ES column left empty (EN-only for now).
Voice: the template default, Javier's cloned voice. No work material involved: public tracking
data (Metrica, SkillCorner, NBA SportVU), nothing to anonymise.

Series note: part 2 of the series. The first video (`examples/wheres-the-ball`) already told the
part-1 setup and the "look where they're heading" / still-ball insight; this one does **not**
repeat that. It reuses its visual language: the top-down pitch from `PitchPlayback`, players as
dots in `accentText` vs `text`, the ball hidden behind a pulsing "?", the AI guess markers.
Its own subject is the article's three findings: the **2×2 grid** (who reads × what gets read),
**the camera lies** (−0.58 vs +0.83) and **the two-sport asymmetry** (velocity scale).

## Central visual: the reader grid

One picture carries the main result. A **2×2 grid** fills the stage:

- **rows = who reads**: top row `Trained for this task` (a small chip "60 kB" on the tracks cell,
  "small vision net" on the pixels cell); bottom row `Frontier AI · zero-shot` (the GPT / Opus
  markers from the first video);
- **columns = what gets read**: left `TV pixels` (a broadcast frame with the ball painted out,
  "?" where it was); right `Player tracks` (the same moment as dots with one-second trails, no
  pixels).

Above the grid, a fixed **question band**: `Hard cases · ball far from the centre` and the test
`Beats pointing at the middle?`. Each cell gets a small meter with a dashed **50 % line**
("coin flip"); the cell's figure fills the meter and stamps in. The verdict is the grid turning
into its own answer: the top row lights up in the accent gradient, the bottom row dims, a big
bracket on the rows reads **training**, and a struck-through bracket on the columns reads
**input**. That is the article's "the row, not the column" made physical.

Two bespoke companions carry the other findings:

- **`CameraFlip`**: the top-down pitch with a broadcast **camera frame** (a rounded rectangle)
  that chases a fast ball; inside the frame the ball sits at one edge and the player mass at
  the other. Pulling out to the full pitch flips the sign of a correlation dial.
- **`SportScale`**: a basketball court and a football pitch side by side, both normalized to the
  same box; identical runners, but the court's velocity arrows are 3–4× longer. Two transfer
  arrows (✓ / ✗); removing the arrows makes both ✓.

| # | Narration (EN, caption text) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | A model small enough to email finds the hidden ball where frontier AI can't. | | **Hook, 0-3 s.** Intro card, words lighting up. Behind it, faint: the pitch with the ball hidden ("?"); a tiny glowing chip `60 kB` vs a large greyed `Frontier AI` badge. | intro | Description: "A tiny network trained on my laptop solves the hidden-ball cases that frontier VLMs can't"; "a model small enough to email can extract it." |
| 2 | In part one, I erased the ball from football footage and kept the players. | | **Story.** `PitchPlayback` (from part 1): players move, ball hidden behind the pulsing "?". Small tag top-left "Part 1". | `PitchPlayback` (reused, ball hidden) | "[Part 1] … their guesses about a hidden football" |
| 3 | Frontier AI did no better than pointing at the middle of the screen. | | **Story.** A broadcast camera frame draws over the pitch; the AI guess markers drift to its centre and sit on a crosshair labelled "the middle". The real ball flashes in far away, at the frame's edge. | `PitchPlayback` + camera frame overlay | "on the cases that matter, balls genuinely far from the center of the frame, none of them reliably beat the dumbest possible strategy: point at the middle and trust the camera operator." |
| 4 | Maybe that's impossible. Maybe the players don't give the ball away. | | **Story.** Ball hides again; the players fade to grey outlines; a big "?" over the pitch with the tag "enough information?". | `PitchPlayback` (players dimmed) | "Maybe the hard cases are just *hard* — maybe the players' positions don't contain enough information to find an off-center ball, and I'd been asking the models to do the impossible." |
| 5 | So I tested exactly that. | | **Story.** The "?" turns into a checkbox; dip into the grid. | `PitchPlayback` → transition | "So I tested that directly." |
| 6 | Two kinds of reader, small nets trained for this one task, and frontier AI. | | **Key moment 1 (what is tested).** `ReaderGrid` builds: the two row labels appear one per clause, `Trained for this task` (chips `60 kB` and `small vision net`) and `Frontier AI · zero-shot`. | bespoke: `ReaderGrid` (mode `rows`) | "One axis is *who reads*: a tiny specialist trained for exactly this, or a frontier generalist."; "About 14,000 parameters, roughly 60 kB of weights, a few minutes of CPU on my laptop."; "a small off-the-shelf vision network (a ResNet-18) fine-tuned on seven thousand broadcast frames with the ball erased" |
| 7 | Two inputs, the TV pixels or the player tracks underneath. | | The columns appear: `TV pixels` (frame, ball painted out, "?") and `Player tracks` (dots with one-second trails). Tag under the tracks column: "also given to frontier AI, as text". | `ReaderGrid` (mode `columns`) | "The other is *what gets read*: the broadcast pixels, or the player tracks underneath them."; "once on the **exact same one-second tracks the tiny net saw, serialized as plain-text coordinates**" |
| 8 | The hard cases, balls far from the centre. Does a guess beat pointing at the middle? | | The question band drops in: `Hard cases · ball far from the centre` / `Beats pointing at the middle?`. Each cell grows an empty meter with a dashed 50 % line, "coin flip". | `ReaderGrid` (mode `question`) | "The two trained models beat the camera bias on off-center balls"; "none of them reliably beat the dumbest possible strategy: point at the middle" |
| 9 | The trained models did. 82% of the time from tracks, 74% from pixels. | | **Key moment 2 (the number).** Top row: tracks meter fills to **82%**, then pixels to **74%**, both well past the 50 % line, accent gradient, ✓ stamps. | `ReaderGrid` (mode `fill`, row 1) | "The two trained models beat the camera bias on off-center balls — **82%** from the tracks, **74%** from the pixels." |
| 10 | Frontier AI didn't. 53% on pixels, a coin flip. | | Bottom row, pixels cell: meter stops on the line at **53%**; a small coin flips beside it. | `ReaderGrid` (mode `fill`, row 2) | "The frontier models don't, from either input: 53% on pixels (statistically a coin flip)" |
| 11 | On the very same tracks, as text, 35 to 38%. Below chance. | | Bottom row, tracks cell: meter stops **under** the line at **35–38%**; tag "below chance". The cell shows the frontier guess sliding toward the player mass (the trap of the next section). | `ReaderGrid` (mode `fill`, row 2) | "and 35–38% — *below* chance — on the tracks themselves" |
| 12 | Those tracks are ground truth, a ceiling, and on easy balls the big models were more precise. | | Two footnote chips slide under the grid: "tracks = ground truth · a ceiling" and "easy, centred balls: frontier more precise (0.147 vs 0.195–0.210 median error)". | `ReaderGrid` (footnotes) | "The tracks column uses *ground-truth* tracking, so it's an information ceiling. And on the easy, centered items the zero-shot VLMs still post better global medians (0.147 vs 0.195–0.210): pixel-precision where the camera has already done the work." |
| 13 | So the information is there. Training matters. The input barely does. | | **Key moment 3 (the verdict).** Top row lights up, bottom dims; a bracket on the rows stamps **training**, a struck bracket on the columns stamps **input**. Then the line holds as a `KeyQuote`, "Training" and "barely" in the accent. | `ReaderGrid` (mode `verdict`) → `KeyQuote` | "Is the information missing? No — the tracks column extracts it."; Takeaway: "**Training matters; the input barely does.**"; "general game knowledge doesn't substitute for task-specific inference." |
| 14 | On TV, "the ball is near the players" is a trap. | | `CameraFlip` opens: top-down pitch; tag "the ball is near the players" with a warning outline. | bespoke: `CameraFlip` (mode `setup`) | "why is naive geometry so useless in broadcast frames? The centroid of the players — "the ball is where the crowd is" — isn't just uninformative in image space."; "Broadcast geometry is a trap." |
| 15 | An off-centre ball is usually flying ahead, players trailing, and the camera chases it. | | A long pass: the ball (visible here, it is the explanation) flies ahead, the dots trail; the camera frame slides after the ball, so inside the frame the ball sits at one edge and the player mass at the other. | `CameraFlip` (mode `chase`) | "When a ball is off-center, it's usually because it's moving fast — a long pass, a clearance — running *ahead* of the play while the players trail behind. Project that onto a camera that chases the ball and the geometry inverts." |
| 16 | On screen, the players' centre and the ball correlate at −0.58. On the pitch, +0.83. | | Correlation dial beside the frame needles to **−0.58** (label "on screen"); the frame lifts away to the full pitch and the needle swings to **+0.83** ("on the pitch"). | `CameraFlip` (mode `flip`) | "It's *anti*-correlated with the ball (−0.58)"; "compute the same centroid in field coordinates — and the correlation flips to +0.83." |
| 17 | The camera flips the sign. | | Big line over the dial: "Same statistic. The camera flips its sign." | `CameraFlip` (stamp) | "Same statistic, same matches; the camera flips its sign." |
| 18 | Then I trained the same net on basketball. | | **Transfer part.** `SportScale` opens: football pitch left, basketball court right, the same tiny net chip between them. Tag "NBA tracking". | bespoke: `SportScale` (mode `sports`) | "I trained the same architecture on soccer (Metrica and SkillCorner tracking data) and on basketball (NBA SportVU), and crossed them." |
| 19 | Basketball to football worked, with no football at all. Football to basketball failed. | | Arrow court → pitch draws with ✓ ("never saw a football match"); arrow pitch → court draws broken, ✗ ("worse than an untrained centroid"). | `SportScale` (mode `transfer`) | "Soccer→basketball fails: worse than an *untrained* centroid. But basketball→soccer *works*: 0.17 median error, beating soccer's own geometric baselines without ever seeing a football match." |
| 20 | The culprit is speed. On the small court, players move 3–4× faster in the model's units. | | Both fields scale into the same normalized box; identical runners get velocity arrows, the court's 3–4× longer. Tag "same box, different speed scale". | `SportScale` (mode `scale`) | "The real culprit is **velocity scale**."; "in the normalized coordinates the model reads, players move three to four times faster in basketball." |
| 21 | Take velocity out, and positions transfer both ways. | | Arrows fade from both fields (dots only); the broken arrow mends, both arrows ✓. Tag "positions only". | `SportScale` (mode `positions`) | "Strip each player down to *positions only*, discarding the velocity channel, and the asymmetry vanishes — positions transfer symmetrically both ways" |
| 22 | Knowing the game, for these models, means knowing what to do with motion. | | **Closing verdict.** `KeyQuote`, "motion" in the accent; behind it, faint, the pitch dots with their arrows. | `KeyQuote` | ""Knowing the game," for this family of models, turns out to mean something narrow and specific: knowing what to do with motion." |
| 23 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, "Where's the Ball? · Part 2". Credit line "Tracking: Metrica · SkillCorner · NBA SportVU". | outro | — |

**Word count (EN): 263** (14 + 14 + 13 + 11 + 5 + 14 + 10 + 16 + 13 + 9 + 12 + 17 + 11 + 11 + 14
+ 16 + 5 + 8 + 13 + 16 + 8 + 13 + 3; numbers counted as spoken, URL as 3). At Javier's
~2.8 words/s that is ~94 s of speech, **~98-104 s** with line gaps and card holds at the
~0.38-0.4 s per word all-in the built examples measured. Set `targetSeconds: 98`.

**Captions** (estimate at 2.8 words/s; `npm run lint` after TTS is the gate). Densest by
characters: scene 12 (93 chars over ~6 s, ~15.5 cps), scene 16 (~85 chars, numbers spoken long,
~13 cps), scene 8 (84 chars, ~14.7 cps), scene 20 (~87 chars, ~15 cps). None should pass 17.

If the TTS runs over 105 s, cut in this order (never scenes 2-5, 6-8, 9-11, 13, 22):
1. Scene 12 → silent: the two footnote chips stay on screen ~2 s with no narration (−17).
   The hedges stay on screen, so the claim does not get stronger.
2. Scene 14 merged into 15: "On TV, an off-centre ball usually flies ahead, and the camera
   chases it." (−11)
3. Scene 17 → silent stamp (−5).

## Spoken numbers (complete list)

| Spoken | Scene | Why it stays in the voice |
|---|---|---|
| "eighty-two … seventy-four" | 9 | The trained row: the result. |
| "fifty-three … a coin flip" | 10 | Frontier on pixels; the article's own "coin flip". |
| "thirty-five to thirty-eight … below chance" | 11 | Frontier on the same tracks: what makes this different from part 1. |
| "minus zero point five eight … plus zero point eight three" | 16 | The camera finding; the sign flip is the point. |
| "three to four times" | 20 | The velocity-scale mismatch. |

On screen only: `60 kB`, `0.147 vs 0.195–0.210`, "ground truth · a ceiling".
Not used anywhere: "a sixth the area" (see factcheck), the pretraining figures (12/13, 9/10,
p-values, ~5 %, ~30 minutes), 0.17 / 0.174 median errors.

## Notes for the build

- **`ReaderGrid` (bespoke, the spine).** 2×2 grid inside the stage, row labels on the left,
  column headers on top, a fixed question band. Each cell: an icon (pixels = framed broadcast
  view with "?"; tracks = dots with short trails), a horizontal meter with a dashed 50 % line
  and the cell figure as a string (`'82%'`, `'74%'`, `'53%'`, `'35–38%'`; meter fills to 82, 74,
  53 and 36.5 for the range). Modes: `rows`, `columns`, `question`, `fill` (per row, one cell per
  beat), `footnotes`, `verdict` (row bracket "training" lit, column bracket "input" struck).
  Frontier markers labelled `GPT` and `Opus` only (the models the repo ran on the grid; the
  article says "frontier models"), no version numbers needed on screen.
- **`CameraFlip` (bespoke).** Reuses the pitch drawing from `PitchPlayback`; a scripted (not
  Metrica) long-pass moment: ball ahead, ten dots trailing, a rounded camera rectangle easing
  after the ball. Dial from −1 to +1 with two labelled needle stops (−0.58 "on screen", +0.83 "on
  the pitch"). Illustrative motion; only the two numbers are data.
- **`SportScale` (bespoke).** Football pitch (105×68 proportion) and basketball court (28×15
  proportion) drawn to true relative size first, then both scaled into one normalized box; the
  same runner pattern on each, arrows on the court 3–4× longer. Transfer arrows with ✓ / ✗ in
  brand colours (no red: the failure is a broken dashed muted arrow, as in `FlowDiagram`).
- **Ball visibility.** Hidden ("?") in scenes 1-5 and in the grid icons; shown only in
  `CameraFlip`, where the ball's position *is* the explanation.
- **Spoken forms:** "−0.58" → "minus zero point five eight"; "+0.83" → "plus zero point eight
  three"; "35 to 38%" → "thirty-five to thirty-eight percent"; "3–4×" → "three to four times";
  "javieraguilar.ai" → "javier aguilar dot A I". "kB" does not appear in narration.
- Visuals are chosen for impact, not as a literal replay of the experiment (rigour lives in the
  article and the repo); narration and numbers stay faithful to the article.

## Cold-viewer check

Hook + story only (scenes 1-5, ~20 s): "A model small enough to email finds the hidden ball where
frontier AI can't. In part one, I erased the ball from football footage and kept the players.
Frontier AI did no better than pointing at the middle of the screen. Maybe that's impossible.
Maybe the players don't give the ball away. So I tested exactly that."

What a cold viewer would say: *"He hid the ball in football footage, big AI models couldn't find
it any better than guessing the middle of the screen, so he checked whether the players'
positions even contain the answer, and a tiny trained model shows they do."* Passes: the real
situation, what went wrong and the question are all clear before any condition or number.
