# Fact-check: Teaching a Small Model to Recognise a Sport From Moving Dots (EN vertical) · v1.1

Source: `src/content/blog/en/sport-from-motion-laya.md` on `origin/blog/sport-from-motion-laya`
(personal-website), cross-checked against `docs/results-laya.md` in `JaviMaligno/sport-from-motion`
(`origin/main`, 5be89c9) and the local run files under `sport-from-motion/runs/laya/`. Every
spoken claim and every number or claim on screen, with the article sentence it rests on.
Illustrative visuals are listed at the end.

## Narration

| # | Claim (spoken) | Article sentence | Note |
|---|---|---|---|
| 1 | "Same model, same dots, same recipe. Whether it learned depended on the seed." | "The fifteen runs with the snapshots in order share the data split, the recipe and the number of epochs; only the random seed changes."; "Here the same configuration learns or does not depending on the seed." | Faithful. |
| 2 | "Last time, a classifier was right 83% of the time." | "A small classifier trained on the dots got it right 83% of the time." | Same number. v1's "read these dots 83% of the time" was ambiguous (could mean it only read them 83% of the time); fixed. |
| 2b | "Frontier models: between chance and 47%." | "Five frontier models, shown the same clips, landed between chance and 47%" | Verbatim range; restores the gap the article sets up ("That left an obvious gap in the middle"), which scene 8 relies on. |
| 3 | "I fine-tuned Laya, a small open model, on the same data." | Description: "I fine-tuned Laya, a 322M open-weights decision model, on the same moving dots the frontier models failed on."; "What happens if you take a language model, a small one, and train it on exactly what the specialists saw?"; "The same folds."; "The same 400 clips" | "small open model" = "322M open-weights". |
| 4 | "The official recipe learned nothing. Every sport got the same score." | Heading "The official recipe learned nothing"; "the model had settled on giving all four options the same score for every clip, whatever the dots were doing." | Faithful. |
| 5 | "A meaningless tag giving away the answer? With more epochs, it learned that." | "an arbitrary tag at the top of each one that encodes the answer … The tag means nothing, so the untrained model cannot use it; a model that learns during training can."; "With the official recipe, the control reached 72%. So the code trains, but even a perfect clue is not fully learned in that budget."; "the first point at which the control is learned (≥ 95% …). That was 8."; "The control (amber) is learned within the first 11 epochs." | v1's "That, it learned" right after the official-recipe scene implied the control was learned in 4 epochs; it reached 72% there. Now "with more epochs" in narration and "72% at 4 epochs" on screen. |
| 5b | "The dots take longer to start." | "The clue the control measured is easy to find; the movement is not, and it takes longer to start." | Faithful. |
| 6 | "The loss sat at chance for 10 epochs, sometimes 22, sometimes all 32." | Caption: "the loss on the dots sits at the chance value for 10 epochs, sometimes 22, and sometimes never leaves it."; alt text: "a third stays at the chance value, 1.39, for all 32 epochs." | "all 32" = "never leaves it" within the 32-epoch budget. |
| 7 | "Trained for longer, it reads the order:" | Heading "With enough training, it reads the order"; "So I let it train for up to 32 epochs" | Hedge on seeds follows in scenes 9-10. |
| 7b | "shuffled, it loses 8 points. Opus lost 10." | "Shuffling the snapshots costs Laya 8 points, of the same order as the 10 it cost Opus 5.5, the only frontier model that showed it read the order." | Stated as two facts side by side, no stronger comparison than "of the same order". |
| 8 | "In accuracy, Laya is one more frontier model." | "In accuracy, Laya is one more of the frontier models."; "it is level with GPT-5.6 Sol (0.41), GPT-5.6 Terra (0.36), Claude Sonnet 5 (0.35) and Gemini 3.1 Pro (0.42): none of the differences is significant. Claude Opus 5.5 reads the text better (0.52, 16 points above Laya)." | Visual puts Laya among the chips, not above Opus. |
| 8b | "On the order test, it joins Opus and the classifier." | "In what it does with the order, it sits with MiniRocket and Opus, the only three that lose accuracy when the snapshots are shuffled; the other four frontier models and Jev stay around zero." | "the classifier" = MiniRocket, as in scene 2 and the first video. |
| 9 | "Fifteen runs, only the seed changed: 9 learned, 6 never did." | "The fifteen runs … only the random seed changes. In 9 of them the training loss clearly drops below the chance value at some point; in the other 6 it never leaves it in 32 epochs."; seeds figure caption "Teal: it learned. Rose: it stayed at chance." | "never did" = never learned = "never leaves it in 32 epochs" / caption "Rose: it stayed at chance". Digits as the article writes them. Results doc: 9/15 `motion` runs "despegan" (training CE < 1.30), criterion fixed after seeing the curves (descriptive). |
| 10 | "One fine-tuning run is a sample, not a measurement." | "**One fine-tuning run is a sample, not a measurement.**" | Verbatim. v1's scene 9b ("With one run, the answer would hang on the seed.") is cut as narration; its two stamps move into this scene's coin-flip visual. |
| 11 | "More at javieraguilar.ai" | — | — |

## Numbers and claims on screen

| On screen | Where | Article sentence |
|---|---|---|
| "seed 0", "seed 1", "seed 2"; two traces pulse, one flat | 1 | "With three seeds"; seeds figure. Hook uses split 0 of each seed: local `calib_ce` minima 0.95 / 1.11 / 1.39, test accuracy 0.50 / 0.47 / 0.25 (results doc per-fold table), i.e. seeds 0 and 1 learned, seed 2 did not, matching the figure. |
| "83%"; four sport labels | 2 | "A small classifier trained on the dots got it right 83% of the time. Five frontier models…" |
| "LAYA · 322M · open weights"; four sport pills | 3 | "322 million parameters"; "open-weights decision model"; "four options: American football, basketball, handball or soccer" |
| "same folds · same 400 clips" | 3 | "**The same folds.**"; "**The same 400 clips** that the frontier models answered" |
| Coordinates scrolling as text | 3 | "the coordinates of the 10 dots over 8 snapshots, written as text" (layout of the text illustrative) |
| "chance" dashed line | 4-9 | "it stayed at the value of guessing among four options"; alt text: "the chance value, 1.39" |
| "4 epochs", "23%", equal pills | 4 | "4 epochs, its learning rates, its loss. The result was 23% on the 400 clips."; "the same score for every clip" |
| "chance ··· 47%" range bar; five frontier chips | 2b | "landed between chance and 47%" |
| "tag: Q7", "Q7 = soccer" | 5 | "(`tag: Q7` for soccer, `tag: M2` for basketball, and so on)" |
| "72% at 4 epochs"; "8" marker (learned) | 5 | "With the official recipe, the control reached 72%."; "That was 8." |
| Amber control trace at zero by epoch 11 | 5 | "The control (amber) is learned within the first 11 epochs."; alt text: "the arbitrary-tag control falls to zero by epoch 11" |
| Markers "10", "22", "32"; optional end label "0.48" | 6 | Alt text: "one motion run starts falling at epoch 10 and ends at 0.48; another starts only at epoch 22; a third stays at the chance value, 1.39, for all 32 epochs." |
| Cards "1 → 8", shuffled "5, 2, 8, 1…" | 7 | Series motif from the first video ("the same snapshots shuffled"; "The same conditions: snapshots in order, the same snapshots shuffled, and a single snapshot") |
| "−8 points" on the Laya chip | 7b | "Shuffling the snapshots costs Laya 8 points"; table "+0.08" |
| Ghost "Opus 5.5 −10" with image-input triangle | 7b | "the 10 it cost Opus 5.5"; alt text "Opus 0.10"; figure script `ORDER`: Opus 5.5 cell is `image`, and the caption says "triangles [read] as an image" |
| Ghost "classifier −12" | 7b | Alt text (compare figure): "MiniRocket 0.12, Opus 0.10 and fine-tuned Laya 0.08 lose clearly"; shown as points as in the first video's factcheck ("MiniRocket loses 12 points", first article). |
| "3 seeds · corrected p = 0.007" | 7b | "With three seeds, the four pre-registered contrasts: … In order vs shuffled · +0.08 · [0.03, 0.14] · 0.007" |
| Laya chip "0.36"; classifier chip "0.83"; frontier chips without numbers | 8 | "with the snapshots in order Laya reaches 0.36"; "Laya is 48 points below MiniRocket (0.83)" |
| Row "READS THE ORDER": Laya + Opus 5.5 + classifier; other four chips "≈ 0" | 8b | "the only three that lose accuracy when the snapshots are shuffled; the other four frontier models and Jev stay around zero." (Jev not shown) |
| 3 × 5 wall, "seed 0/1/2", "split 1-5", 9 teal / 6 rose, seed 2 teal only in the last split, late; "9 / 15" | 9 | "In 9 of them … in the other 6 …"; seeds alt text: "seeds 0 and 1 reach between 0.38 and 0.53 in four of their five folds; seed 2 stays between 0.20 and 0.25 in four folds and reaches 0.47 only in the last, at epoch 32."; caption "Seed 2 learns in only one of five splits, and late." |
| Stamps "Laya learns to read movement" / "Laya does not learn this" (coin flip) | 10 | Quoted verbatim from the article. |
| "with 3 seeds, the effect holds, same sign in each" | 10 | "The contrasts hold with the three seeds, and the sign is the same in each one." |
| "One fine-tuning run is a sample, not a measurement." | 10 | Verbatim. |
| Credits "Tracking data: NBA SportVU, NFL Big Data Bowl, EIGD-H, SkillCorner, Metrica Sports"; "Model: Laya by Convai Innovations (Apache 2.0)" | outro | "an open-weights decision model from Convai Innovations, released under Apache 2.0"; same 400 clips as the first article (its data credits); "The tracking data is not redistributed; each source has its own licence." |

## Cross-checks against the repo

- Results doc (`docs/results-laya.md`, §3) matches the article: `order` +0.08 [0.03; 0.14],
  p_holm 0.007; `motion` 0.36 [0.31; 0.41]; per-seed `motion` 0.40 · 0.40 · 0.27; 9/15 `motion`
  runs take off in DL2; seed 2 split 4 chosen epoch 32, test 0.47.
- Local `info.json` files for the 15 DL2 `motion` runs: chosen epochs and test accuracies equal
  the results-doc table (e.g. seed 0 split 0: epoch 26, 0.50; seed 2 split 4: epoch 32, 0.47).
- Opus 5.5's 10-point order effect is the **image** cell (results doc "Opus 5.5 en imagen
  (+0,10)"; figure script `ORDER` tags it `image`), while Laya's accuracy is compared with Opus
  **on text** (0.52). The article's own sentence ("the 10 it cost Opus 5.5") and its compare figure
  (image cells for the frontier models on the right panel, triangles = image) are the source; the
  video follows them, puts no Opus accuracy on screen and marks the ghost chip with the figure's
  image triangle, so text and image numbers are never presented as one.
- Curve data: `scripts/blog/sport-from-motion-laya-figures.py` (personal-website,
  `origin/blog/sport-from-motion-laya`) hard-codes the article figure's training CE arrays
  `CONTROL` / `TAKEOFF` / `LATE` / `FLAT`: CONTROL 0.053 at epoch 8 and 0.0 from 11; TAKEOFF leaves
  chance around epoch 10-11 and ends 0.483; LATE leaves around 22; FLAT stays 1.378-1.419 for 32.
  Matches every on-screen marker. `GRID` / `EPOCH` in the same script match the results doc
  (seeds 0 and 1 rose only in split 5; seed 2 teal only in split 5, epoch 32).
- The 9 / 6 split rests on the results doc's descriptive take-off criterion (training CE < 1.30,
  set after seeing the curves). The article states 9 / 6 without that caveat; the video says
  exactly what the article says and adds nothing stronger.

## Illustrative (not claims)

- Which clip plays on the stages (the first video's basketball hook clip) and the coordinate text
  layout.
- The monitor strips: traces come from real per-run data where available (calibration CE locally;
  training CE if the full Kaggle logs are pulled), but scale, smoothing and the moment of each
  "pulse" are stylised. The amber control trace is drawn to the caption.
- The pills' glow, the dots lighting up when a trace pulses, the sticker, the monitor being
  "switched off" at epoch 4, the card shuffle, the chips changing rows, and the coin flip with its stamps in scene 10.

## Not verified

- Per-epoch **training** CE for all 15 wall runs (scene 9): local Kaggle logs are truncated; the
  wall's colours come from `GRID` and the 9 / 6 split, traces may use calibration CE as an
  illustration. (Scenes 5-6 are resolved: see the figure script above.)
- Pronunciation of "Laya" by the cloned voice.

## Build notes (render v1, 2026-10-19)

- Monitor data: `src/data/laya-curves.json`, built by `scripts/extract-laya-curves.py`.
  `CONTROL` / `TAKEOFF` / `LATE` / `FLAT` are copied verbatim from the article's figure script
  (scenes 4-6, coin faces). The hook and the wall use, per run, the running minimum of the local
  calibration cross-entropy (`calib_curve`), as an illustration of "left chance or not". Its
  break (< 1.30) splits the 15 runs exactly as the article's seeds figure does: 9 teal, 6 rose.
  The test suite checks this.
- On-screen text added at build time, each one traced to the article: "Last time: a small
  classifier" (scene 2), "on 400 clips" under 23%, "up to 32 epochs: reads 1 → 8" and "shuffled:
  5, 2, 8, 1…" (scene 7), "▲ image input" in the footnote (Opus's −10 is its image cell),
  "lose accuracy when shuffled" (scene 8b), "Loss on the dots, 32 epochs" and "left chance" /
  "never left" (scene 6).
- "Laya" is voiced through the spoken form "Lah-yah" (Spanish-style, as Javier says it). The
  word timestamps show that form was read, but nobody has listened to it yet.
