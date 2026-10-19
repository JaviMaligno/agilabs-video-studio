# Teaching a Small Model to Recognise a Sport From Moving Dots — article video (EN) · script draft v1.1 (reviewed)

Article: sport-from-motion-laya (javieraguilar.ai, EN, `pubDate` 2026-10-30; read from
`origin/blog/sport-from-motion-laya` of personal-website). Vertical 9:16, target ~65 s (ceiling
70 s), 140 counted words, ~148 as spoken. ES column left empty (EN-only for now). Voice: Javier's
cloned voice.

Sequel to the *Which Sport Is It?* video (`examples/sport-from-motion`): same dark point-light
stage (`DotStage`), same deck of 8 snapshot cards (`SnapshotDeck`), same model-chip style, so the
two read as a series. Scene 2 is an explicit callback to that video.

## Central visual metaphor: the flatline

Fine-tuning is drawn as a **heart monitor**. Under the familiar stage of ten glowing dots runs a
thin monitor strip: the training loss, traced left to right, epoch by epoch, with a dashed
horizontal line labelled **chance**. A model that has not learned anything is a **flatline**: the
trace sits on the chance line and, above it, the four sport pills (AMERICAN FOOTBALL ·
BASKETBALL · HANDBALL · SOCCER) glow exactly equally, "the same score for every option". A model
that starts learning is a **pulse**: the trace breaks downward off the chance line, and the dots
light up in the accent colour while one pill brightens over the others.

Three moments carry the story, and all three are this one picture:

1. **The official recipe is cut off too early**: the monitor is switched off at epoch 4 while the
   trace is still flat.
2. **The positive control** (an amber trace, the clip wearing a `tag: Q7` sticker) drops to zero
   fast, while the dots' trace stays flat: the machine works, the movement is just slow to start.
3. **The seed**: the hook and the climax show the same patient on three, then fifteen, monitors.
   Same data, same recipe; only the seed differs. Some pulse, some stay flat.

Secondary motif, carried over from the first video: the **deck of 8 snapshots** being shuffled,
now in front of the Laya chip, which visibly dims (the shuffle costs it accuracy), next to the
ghost markers of Opus 5.5 and the classifier.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Same model, same dots, same recipe. Whether it learned depended on the seed. | **Cold open, 0-3 s.** Three stacked mini-stages, each the same basketball clip of ten glowing dots (the hook clip of the first video), each with its own monitor strip below, tagged `seed 0` · `seed 1` · `seed 2`. All three traces run flat on the chance line. On "depended on the seed", two traces break downward (pulse, dots light up teal) and the third keeps running flat (rose, dots stay grey). Real outcome: split 1 (fold 0) of seeds 0, 1, 2 (test 0.50 / 0.47 / 0.25; seed 2 never leaves chance there). Trace shapes may reuse the article figure's TAKEOFF / FLAT arrays (illustrative). | bespoke: `LossMonitor` (mode `seeds3`) over `DotStage` tiles | "The fifteen runs with the snapshots in order share the data split, the recipe and the number of epochs; only the random seed changes."; "Here the same configuration learns or does not depending on the seed." |
| 2 | Last time, a classifier was right 83% of the time. | Callback to the first video: the 2×2 grid of four sports as grey dots, the accent scanner sweep, sport labels snapping under each tile, counter "83%". | `DotStage` (mode `specialist`, reused from sport-from-motion) + `Counter` (83%) | "A small classifier trained on the dots got it right 83% of the time." |
| 2b | Frontier models: between chance and 47%. | The five frontier chips drop in above the tiles (reused `guesses` mode: their guesses mostly flash red), with the first video's range bar "chance ··· 47%". This is the gap the rest of the video fills. | `DotStage` (mode `guesses`, reused) | "Five frontier models, shown the same clips, landed between chance and 47%" |
| 3 | I fine-tuned Laya, a small open model, on the same data. | The chips fade up and out; the grid collapses to one tile. The dots dissolve into columns of coordinates (`x, y` per dot, 8 snapshots) that scroll as text into a new chip, **LAYA · 322M · open weights**. Under the chip, the four sport pills appear (its answer is a score per option). Tiny tag: "same folds · same 400 clips". | bespoke: `DotStage` (mode `totext`) | "I fine-tuned Laya, a 322M open-weights decision model, on the same moving dots" (description); "you give it a state, a question and a list of options, and it returns a probability for each option"; "the coordinates of the 10 dots over 8 snapshots, written as text"; "The same folds."; "The same 400 clips" |
| 4 | The official recipe learned nothing. Every sport got the same score. | The monitor strip slides in under the stage. The trace runs flat on the chance line for epochs 1-4; the four pills glow identically and pulse together; at epoch 4 the strip is cut (a "4 epochs" marker, the monitor goes dark). Result chip: "23%". | bespoke: `LossMonitor` (mode `official`) | "I used it as is: 4 epochs, its learning rates, its loss. The result was 23% on the 400 clips. Looking inside, the model had settled on giving all four options the same score for every clip, whatever the dots were doing." |
| 5 | A meaningless tag giving away the answer? With more epochs, it learned that. | A sticker `tag: Q7` slaps onto the clip; a small legend "Q7 = soccer". Monitor restarts with two traces. The **amber control** trace is already falling but crosses the old "4" cut mark still above the floor (small tag "72% at 4 epochs"); on "with more epochs" it dives to the floor ("8" marker: learned), flat at zero by 11. The grey dots trace stays on the chance line throughout. Amber = the figure's real CONTROL array. | `LossMonitor` (mode `control`) | "with an arbitrary tag at the top of each one that encodes the answer (`tag: Q7` for soccer, `tag: M2` for basketball, and so on). The tag means nothing"; "With the official recipe, the control reached 72%. So the code trains, but even a perfect clue is not fully learned in that budget."; "the number of epochs became the first point at which the control is learned … That was 8."; "The control (amber) is learned within the first 11 epochs." |
| 5b | The dots take longer to start. | The camera follows the flat grey trace on past epoch 11; the amber trace dims. | `LossMonitor` (mode `control`) | "The clue the control measured is easy to find; the movement is not, and it takes longer to start." |
| 6 | The loss sat at chance for 10 epochs, sometimes 22, sometimes all 32. | Monitor widens to 32 epochs, three dots traces drawn in turn from the article's curves figure (its real TAKEOFF / LATE / FLAT arrays): one breaks off the chance line at epoch 10 (marker "10") and ends at 0.48; one breaks at 22 (marker "22"); one runs flat to 32 (marker "32", rose). Each break lights its trace teal. | `LossMonitor` (mode `curves`) | Figure caption: "the loss on the dots sits at the chance value for 10 epochs, sometimes 22, and sometimes never leaves it."; alt text: "one motion run starts falling at epoch 10 and ends at 0.48; another starts only at epoch 22; a third stays at the chance value, 1.39, for all 32 epochs." |
| 7 | Trained for longer, it reads the order: | Back to the series motif: the clip freezes and deals into the fan of 8 cards (1 → 8) in front of the LAYA chip; the chip glows teal. | `SnapshotDeck` (reused, Laya chip) | Heading: "With enough training, it reads the order"; "So I let it train for up to 32 epochs and, for each split, kept the epoch that did best on that held-out slice of training, never on the test clips." |
| 7b | shuffled, it loses 8 points. Opus lost 10. | The deck shuffles card-trick style (5, 2, 8, 1…); the Laya chip dims and "−8 points" ticks off. Beside it, the ghost chips from the first video: "Opus 5.5 −10" (with the small triangle glyph the article's figure uses for image input), "classifier −12". Footnote: "3 seeds · corrected p = 0.007". | `SnapshotDeck` (mode `verdict`, Laya + ghosts) | "Shuffling the snapshots costs Laya 8 points, of the same order as the 10 it cost Opus 5.5, the only frontier model that showed it read the order."; table: "In order vs shuffled · +0.08 · [0.03, 0.14] · 0.007"; alt text: "MiniRocket 0.12, Opus 0.10 and fine-tuned Laya 0.08 lose clearly" |
| 8 | In accuracy, Laya is one more frontier model. | Two "tables" (rows of chips). Top row, ACCURACY: the five frontier chips stand together; the Laya chip ("0.36") slides into the middle of them. Far to the right, alone, the classifier chip "0.83". | bespoke: `SnapshotDeck` (mode `company`) | "In accuracy, Laya is one more of the frontier models."; "Laya is 48 points below MiniRocket (0.83)"; "with the snapshots in order Laya reaches 0.36" |
| 8b | On the order test, it joins Opus and the classifier. | Bottom row, READS THE ORDER: three seats light up; the Laya chip hops down to sit with "Opus 5.5" and "classifier". The other four frontier chips stay above, "≈ 0". | `SnapshotDeck` (mode `company`) | "In what it does with the order, it sits with MiniRocket and Opus, the only three that lose accuracy when the snapshots are shuffled; the other four frontier models and Jev stay around zero." |
| 9 | Fifteen runs, only the seed changed: 9 learned, 6 never did. | The climax: a 3 × 5 wall of mini monitors (rows `seed 0/1/2`, columns `split 1-5`), all flat, then pulsing one by one with the real per-run data: 9 traces break down and turn teal, 6 stay flat and turn rose. Seeds 0 and 1: teal in splits 1-4, rose in split 5. Seed 2: rose except its last cell, which pulses only at the very end (epoch 32). Tally "9 / 15". | bespoke: `LossMonitor` (mode `wall`) | "In 9 of them the training loss clearly drops below the chance value at some point; in the other 6 it never leaves it in 32 epochs."; seeds figure caption: "Seed 2 learns in only one of five splits, and late." |
| 10 | One fine-tuning run is a sample, not a measurement. | **The coin flip.** One cell is pulled out of the wall and enlarged to a single stage + monitor; it flips like a coin between a teal face stamped "Laya learns to read movement" and a rose face stamped "Laya does not learn this". It lands on edge; the sentence writes itself word by word over it, "sample" and "measurement" in the accent. Small footnote: "with 3 seeds, the effect holds, same sign in each". | bespoke: `LossMonitor` (mode `coin`) + `KeyQuote` overlay | "One fine-tuning run is a sample, not a measurement."; "if I had trained a single model, the conclusion would have depended on which seed I happened to use: anything from "Laya learns to read movement" to "Laya does not learn this"."; "The contrasts hold with the three seeds, and the sign is the same in each one." |
| 11 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, the article title "Teaching a Small Model to Recognise a Sport From Moving Dots" set over two lines (kept in full so it matches what viewers search for on the site). Credit lines. | outro | — |

**Word count (EN):** 13 + 10 + 6 + 11 + 12 + 13 + 6 + 13 + 7 + 8 + 8 + 10 + 11 + 9 + 3 =
**140 words** (~148 as spoken, numbers spelled out), about 53 s of speech at Javier's ~2.8
words/s, **~64-66 s** with line gaps and scene holds (under the 70 s ceiling). Caption estimate at
2.8 words/s: every line ≤ 16.5 chars/s (highest: scene 1 and scene 5, ~16.4); v1's scene 4 and
scene 8 lines were ~17.3 at this rate and were rewritten. `npm run lint` after TTS is the gate.

## Notes for the build

- **Start from `examples/sport-from-motion`** (copy the project): `DotStage`, `SnapshotDeck`,
  `fields.tsx`, the clock/`layout` blending in `timeline.ts`, `scripts/extract-clips.py` and its
  `src/data/clips.json` are reused as they are. The hook clip of the first video (the basketball
  play) is the clip on every stage here, so the series has one recurring image.
- **`LossMonitor` (bespoke, new; the central component)**: a monitor strip under a stage (or a
  grid of mini stages) drawing a training-loss trace epoch by epoch, x = epoch 1-32, y = loss,
  with a dashed "chance" line at ln 4 ≈ 1.39. A trace is "flat" (grey, then rose at the end) or
  "pulses" (breaks below the line, turns teal, and lights the dots of its stage in the accent).
  Modes: `seeds3` (hook), `official` (cut at epoch 4), `control` (amber control trace + grey
  dots trace), `curves` (three traces at 10 / 22 / never), `wall` (3 × 5 grid), `coin` (one
  cell enlarged, flipping between its teal and rose faces under the closing quote). Pure `frameState` + render split as in `DotStage`. The four sport pills under
  the stage take their glow from the trace: equal while flat, one brighter after the break.
- **`DotStage` mode `totext` (bespoke addition)**: dots dissolving into scrolling coordinate text
  feeding the LAYA chip. Text is illustrative (format "x, y" per dot per snapshot), not Laya's
  literal prompt.
- **`SnapshotDeck` modes**: `verdict` reused with the Laya chip in front and two ghost chips;
  new `company` mode (two rows of chips, Laya chip moving between them, chips carry only the
  numbers listed below).
- **Data to extract** (commit as `src/data/laya-curves.json`):
  - Per-run curves for the 15 `motion` runs of the main configuration (seeds 0-2 × splits 0-4):
    `calib_curve[].calib_ce` per epoch, in
    `sport-from-motion/runs/laya/es-s{seed}/out/laya-ft-es-s{seed}__motion__fold{f}.info.json`
    (all 15 present locally, 32 epochs each; checked: minima split cleanly into 9 runs below ~1.30
    and 6 at ~1.35-1.39, the same 9/6 as the article). The article's curves figure plots
    **training** cross-entropy; per-epoch training CE is in the Kaggle logs
    (`runs/laya/es-s*/sfm-laya-es-s*.log`, lines `epoch N/32 loss … ce …`), but the local logs are
    truncated (14 of 32 epochs found for seed 2). Use training CE if the full logs can be pulled,
    otherwise the calibration CE as an illustrative trace: the monitor is a picture, not a plot.
  - **Scene 5 and 6 curves: found.** The article's curves figure is generated by
    `scripts/blog/sport-from-motion-laya-figures.py` on `origin/blog/sport-from-motion-laya` of
    personal-website, which hard-codes the per-epoch **training** cross-entropy (from the Kaggle
    logs) as four 32-value arrays: `CONTROL` (amber; 0.053 at epoch 8, 0.0 from epoch 11),
    `TAKEOFF` (leaves ~1.386 at epoch 10-11, ends 0.483), `LATE` (leaves at ~22, ends 1.131) and
    `FLAT` (1.378-1.419 for all 32). Copy those arrays verbatim into `laya-curves.json`; markers
    on screen use exactly "10", "22", "32" and "0.48". The same script holds `GRID` (per-cell test
    accuracy) and `EPOCH` (chosen epoch) for the wall.
  - Seed wall colours (scene 9) follow the article's seeds figure: teal = learned, rose = stayed
    at chance. Per-split test accuracy (for reference, not shown): seed 0 `0.50 0.42 0.53 0.46
    0.22`, seed 1 `0.47 0.38 0.53 0.41 0.22`, seed 2 `0.25 0.20 0.24 0.23 0.47` (chosen epoch 32
    in seed 2, split 4), from `docs/results-laya.md`.
- **Numbers on screen, exactly as the article writes them**: "83%", "322M", "same 400 clips",
  "4 epochs", "23%", "tag: Q7" / "Q7 = soccer", "72% at 4 epochs", "8", "11" (control), "chance ··· 47%", "10", "22", "32", "0.48" (optional
  trace end label), "−8 points", "Opus 5.5 −10", "classifier −12" (see factcheck), "3 seeds ·
  corrected p = 0.007", "0.36", "0.83", "≈ 0", "9 / 15". Accuracies in scene 8 use the article's
  0.xx form, not percentages; the 83% of scene 2 keeps the % form because the article writes it
  that way in that sentence.
- **No numbers on the other frontier chips** in scene 8 (keeps the scene readable and avoids
  mixing text and image results). The only frontier figure on screen is the range "chance ··· 47%"
  in scene 2b, quoted from the article's opening paragraph.
- **Spoken forms**: "83%" → "eighty-three percent"; "10 / 22 / 32" → "ten / twenty-two /
  thirty-two"; "8 points" → "eight points"; "Opus lost 10" → "Opus lost ten"; "9 learned, 6 never did" → "nine learned, six never did"; "47%" → "forty-seven percent"; "Laya" →
  check the clone once against how Javier says it and give a spoken form only if it differs;
  "javieraguilar.ai" → "javier aguilar dot A I".
- **Names**: model chips use the article's names (Laya, Claude Opus 5.5, GPT-5.6 Sol, GPT-5.6
  Terra, Claude Sonnet 5, Gemini 3.1 Pro). The maker is named only in the outro credit (attribution, as the article does). The only brand on
  cards, poster and metadata is AGILabs; no personal name on screen.
- Visuals are chosen for impact, not as a literal replay: the monitor strips, the stickers, the
  chips changing tables, the card shuffle and which clip plays are stylised; the rigour lives in
  the article and the repo. Narration and every number stay faithful to the article.
- **Credits in the outro**: "Tracking data: NBA SportVU, NFL Big Data Bowl, EIGD-H, SkillCorner,
  Metrica Sports" (same as the first video; the 400 clips are the same pool) and "Model: Laya by Convai
  Innovations (Apache 2.0)".
- **Alternative scene (not in v1, +~14 words)**: the issue Javier opened upstream ("Laya's
  official training tool does not include it yet, so I opened an issue proposing early stopping
  … and a warning when training stays at chance"): a small "early stop + flatline warning" badge
  stuck on the monitor after scene 6. Left out for length.
- ES cut: pending (EN-only for now).
