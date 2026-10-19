# Fact-check: Teaching a Small Model to Recognise a Sport From Moving Dots (EN vertical) · v3.0

Source: `src/content/blog/en/sport-from-motion-laya.md` on `origin/blog/sport-from-motion-laya`
(personal-website), cross-checked against `docs/results-laya.md` in `JaviMaligno/sport-from-motion`
(`origin/main`, 5be89c9) and the local run files under `sport-from-motion/runs/laya/`. Every
spoken claim and every number or claim on screen, with the article sentence it rests on.
Illustrative visuals are listed at the end.

## Changes from feedback v3 (v2.0 → v3.0)

Two added scenes; no existing line changed. Each claim below rests on the article.

| Line / screen text | Article sentence | Note |
|---|---|---|
| Spoken 5b: "Unlike the frontier models, Laya is trained on the dots." | "The specialists that worked had been trained on the data; the language models that struggled had not. What happens if you take a language model, a small one, and train it on exactly what the specialists saw?"; "Five frontier models, shown the same clips" | The frontier models were shown the clips without training; Laya was fine-tuned on them. |
| Screen 5b: "Frontier models · last time": "only shown the clips", "write an answer" | "Five frontier models, shown the same clips, landed between chance and 47%"; "Like Jev, it does not write an answer" | "write an answer" is the contrast the article draws for Laya (it does not write one); the frontier models answered in text in the first article. |
| Screen 5b: "LAYA · small · open weights · 322M": "trained on the dots", "scores each sport" | "I fine-tuned Laya, a 322M open-weights decision model, on the same moving dots"; "it returns a probability for each option" | "scores" = probability per option, as in scene 5. No size claimed for the frontier models. |
| Spoken 18b: "The verdict: it can learn to read movement, but only for some seeds." | Description: "with enough training it learned to read the order of the snapshots, but only for some seeds."; "A small open model can learn to read the order of the snapshots"; "the same configuration learns or does not depending on the seed" | "read movement" = reading the order of the snapshots, as scene 11 frames it and as the article's own quote "Laya learns to read movement". |
| Screen 18b: question "So, is Laya good?", stamp "PARTLY" | Same as above | The stamp is the article's "can learn … but only for some seeds" in one word; not stronger than "learns or does not depending on the seed". |
| Screen 18b: "It can learn to read movement…", "…but only for some seeds", "and far behind the classifier" | As above; "it stays far from a specialist that works on the numbers directly"; "Laya is 48 points below MiniRocket" | The third line is on screen only (not voiced); "the classifier" = MiniRocket, as in scenes 3 and 15. Die face = illustrative, as the wall's. |

## Changes from feedback (v1.1 → v2.0)

- Narration rewritten so the task, the model, the monitor line and both tests are explained
  before any result (Javier: "it is not understood what the test is about"). New setup lines:
  scenes 1, 4, 5, 6, 8, 9, 11, 16.
- Spoken numbers reduced from ten (83%, 47%, 10, 22, 32, 8, 10, 9, 6, fifteen) to two: "four"
  (sports) and "eight" (points). The rest became word forms, each checked below against the
  article's number, or moved on screen.
- Loose labels replaced by one question card per part; on-screen numbers reduced (list at the
  end of the "on screen" table).
- Removed claims: the v1 seed hook (scene 1), "Opus lost ten" as a spoken number (now "a similar
  amount", which is the article's "of the same order"), "nine learned, six never did" spoken (now
  "some runs learned, others never left the flat line" + "9 / 15 learned" on screen).

## Spoken numbers (complete list)

| Spoken | Scene | Article sentence |
|---|---|---|
| "four" (sports) | 1 | "four options: American football, basketball, handball or soccer" |
| "eight" (points) | 12 | "Shuffling the snapshots costs Laya 8 points"; table "In order vs shuffled · +0.08" |

## Narration

| # | Claim (spoken) | Article sentence | Note |
|---|---|---|---|
| 1 | "Each dot is a player. Which of four sports is this?" | "I turned players into dots and asked whether the sport could still be recognised from how they move."; "four options: American football, basketball, handball or soccer" | Setup; faithful. |
| 2 | "Last time, frontier models got under half right." | "Five frontier models, shown the same clips, landed between chance and 47%" | Best is 47% < 50%, so every one is under half. Word form of the range; "best: 47%" on screen. |
| 3 | "A classifier trained on the dots got most right." | "A small classifier trained on the dots got it right 83% of the time." | 83% = most; number on screen. |
| 4 | "So I trained Laya, a small open model, on the same dots." | "I fine-tuned Laya, a 322M open-weights decision model, on the same moving dots the frontier models failed on."; "a language model, a small one" | "small open model" = "322M open-weights". "trained" = fine-tuned (the article uses both). |
| 5 | "It doesn't write answers. It gives each sport a score." | "it does not write an answer: you give it a state, a question and a list of options, and it returns a probability for each option." | "score" = probability; same wording as the article's "the same score for every clip". |
| 6 | "This line tracks training. If it stays flat, it's guessing; if it falls, it's learning." | "it stayed at the value of guessing among four options"; alt text "stays at the chance value, 1.39"; "In 9 of them the training loss clearly drops below the chance value"; seeds caption "Teal: it learned. Rose: it stayed at chance." | The line is the training loss (article's curves figure); flat at the chance value = guessing, dropping below it = learned, as the article's own teal/rose reading. Legend demo, no data. |
| 7 | "The official recipe stayed flat. Every sport got the same score." | Heading "The official recipe learned nothing"; "the model had settled on giving all four options the same score for every clip, whatever the dots were doing."; caption "The official recipe stops at 4." | Faithful. |
| 8 | "Was the code broken? I tagged each clip with a meaningless label that gives away the answer." | "A model can end up at chance because there is nothing to learn, because the code is broken, or because it was not trained for long enough"; "an arbitrary tag at the top of each one that encodes the answer … The tag means nothing" | "meaningless label" = "arbitrary tag … means nothing". |
| 9 | "Any working training learns that. With more epochs, it did." | "The tag means nothing, so the untrained model cannot use it; a model that learns during training can."; "With the official recipe, the control reached 72%. So the code trains, but even a perfect clue is not fully learned in that budget."; "the first point at which the control is learned (≥ 95% …). That was 8." | "With more epochs" keeps v1.1's fix: at 4 epochs the control was only partly learned (72%, on screen); it is learned at 8. |
| 10 | "The dots took longer: flat for many epochs, sometimes to the end." | Caption: "the loss on the dots sits at the chance value for 10 epochs, sometimes 22, and sometimes never leaves it."; alt text "a third stays at the chance value, 1.39, for all 32 epochs." | "many epochs" = 10 / 22 (axis ticks on screen); "to the end" = all 32 epochs of the run, not "forever". |
| 11 | "The real test: shuffle the snapshots. If it reads movement, that should hurt." | "The same conditions: snapshots in order, the same snapshots shuffled"; "The second row is the one I was after."; "extracts something from the coordinates written as text that depends on time, not only on where the players are." | "The real test" = "the one I was after". The prediction is the article's own logic (order effect = depends on time). |
| 12 | "Trained for longer, it does: once shuffled, it loses eight points." | Heading "With enough training, it reads the order"; "So I let it train for up to 32 epochs"; "Shuffling the snapshots costs Laya 8 points" | Seed caveat follows in 16-18. |
| 13 | "Opus, the only frontier model that read the order, lost a similar amount." | "of the same order as the 10 it cost Opus 5.5, the only frontier model that showed it read the order." | "a similar amount" = "of the same order"; no stronger comparison. "read the order" = "showed it read the order". |
| 14 | "In accuracy, Laya is one more frontier model." | "In accuracy, Laya is one more of the frontier models." | Visual puts Laya among the chips, not above Opus. |
| 15 | "In reading the order, it joins Opus and the classifier." | "In what it does with the order, it sits with MiniRocket and Opus, the only three that lose accuracy when the snapshots are shuffled" | "the classifier" = MiniRocket, as in scene 3. |
| 16 | "Same data, same recipe; only the random seed changed." | "The fifteen runs with the snapshots in order share the data split, the recipe and the number of epochs; only the random seed changes." | Faithful. |
| 17 | "Some runs learned. Others never left the flat line." | "In 9 of them the training loss clearly drops below the chance value at some point; in the other 6 it never leaves it in 32 epochs." | 9 / 15 on screen. "never left the flat line" = "never leaves it in 32 epochs" (the line ends at 32). |
| 18 | "One fine-tuning run is a sample, not a measurement." | "**One fine-tuning run is a sample, not a measurement.**" | Verbatim. |
| 19 | "More at javieraguilar.ai" | — | — |

## Numbers and claims on screen

| On screen | Where | Article sentence |
|---|---|---|
| Question card: "Which sport is it?" / "Does training work?" / "Does it use the order?" / "Is it repeatable?" | 1, 7, 11, 16 | Framing of the article's sections ("The official recipe learned nothing", "With enough training, it reads the order", "Same data, same recipe, different seed"). |
| Stamps "?" (7), "yes" (9), "yes" (12), "sometimes" (17) | 7-17 | "So the code trains"; "With enough training, it reads the order"; "Here the same configuration learns or does not depending on the seed." |
| Four pills AMERICAN FOOTBALL · BASKETBALL · HANDBALL · SOCCER | 1 | "four options: American football, basketball, handball or soccer" |
| "best: 47%"; five frontier chips | 2 | "landed between chance and 47%" |
| "83%" | 3 | "got it right 83% of the time" |
| "LAYA", "small · open weights · 322M", "trained on the same 400 clips"; coordinates scrolling as text | 4 | "322 million parameters"; "open-weights decision model"; "The same 400 clips"; "the coordinates of the 10 dots over 8 snapshots, written as text" (layout illustrative) |
| Score bar per pill; crossed-out speech bubble | 5 | "it does not write an answer … it returns a probability for each option" |
| Monitor: axis "epochs", dashed line "guessing" | 6-17 | "the value of guessing among four options"; alt text "the chance value, 1.39" |
| "official recipe", "4 epochs", "23% · chance", bars level | 7 | "4 epochs, its learning rates, its loss. The result was 23% on the 400 clips."; "Untouched, Laya gets 24% of the clips right, which is chance."; "the same score for every clip" |
| "tag: M2", "M2 = basketball"; label briefly cycling through "Q7", "K4" before settling on M2 | 8 | "(`tag: Q7` for soccer, `tag: M2` for basketball, and so on)". The stage clip is basketball, so its tag is M2 (build change from the script's "Q7 = soccer"). "K4" is an illustrative arbitrary code (stylised, not claimed as one of the article's tags). |
| Amber trace, "72% at 4", falls to the floor | 9 | "the control reached 72%"; "That was 8."; "learned within the first 11 epochs"; real CONTROL array |
| Axis ticks "10", "22", "32"; one trace turns rose | 10 | Caption and alt text (above); real TAKEOFF / LATE / FLAT arrays |
| Cards "1 → 8", shuffled "5, 2, 8, 1…"; panels "in order" / "shuffled" | 11 | "snapshots in order, the same snapshots shuffled"; 8 snapshots per clip |
| "−8 points"; "3 seeds · corrected p = 0.007" | 12 | "costs Laya 8 points"; "With three seeds"; table "+0.08 · [0.03, 0.14] · 0.007" |
| Opus 5.5 chip, "−10" with image-input triangle | 13 | "the 10 it cost Opus 5.5"; alt text "Opus 0.10"; figure caption "triangles [read] as an image" |
| Rows ACCURACY / READS THE ORDER; Laya among frontier chips; classifier alone; other four "≈ 0" | 14-15 | "one more of the frontier models"; "the only three that lose accuracy when the snapshots are shuffled; the other four frontier models and Jev stay around zero." (Jev not shown) |
| Die "random seed"; 3 × 5 wall, three die-face rows | 16 | "only the random seed changes"; three seeds × five splits |
| 9 teal / 6 rose, seed 2 teal only in its last split and late; "9 / 15 learned" | 17 | "In 9 of them … in the other 6 …"; "Seed 2 learns in only one of five splits, and late." |
| Coin faces "Laya learns to read movement" / "Laya does not learn this"; quote; "with 3 seeds, the effect holds, same sign in each" | 18 | Quoted verbatim; "The contrasts hold with the three seeds, and the sign is the same in each one." |
| Credits "Tracking data: NBA SportVU, NFL Big Data Bowl, EIGD-H, SkillCorner, Metrica Sports"; "Model: Laya by Convai Innovations (Apache 2.0)" | outro | "an open-weights decision model from Convai Innovations, released under Apache 2.0"; same 400 clips as the first article |

Removed from v1's screen: "0.48", "0.36", "0.83" chips, "classifier −12", "tag: M2" sticker,
"seed 0/1/2" text, "Last time: a small classifier", "up to 32 epochs: reads 1 → 8",
"left chance" / "never left", "Loss on the dots, 32 epochs".

## Cross-checks against the repo

- Results doc (`docs/results-laya.md`, §3) matches the article: `order` +0.08 [0.03; 0.14],
  p_holm 0.007; `motion` 0.36 [0.31; 0.41]; 9/15 `motion` runs take off; seed 2 split 4 chosen
  epoch 32, test 0.47.
- Opus 5.5's 10-point order effect is the **image** cell (results doc "Opus 5.5 en imagen
  (+0,10)"; figure script `ORDER` tags it `image`). The video shows it with the figure's image
  triangle and puts no Opus accuracy on screen, so text and image numbers are never mixed.
- Curve data: `scripts/blog/sport-from-motion-laya-figures.py` (personal-website,
  `origin/blog/sport-from-motion-laya`) hard-codes the article figure's training CE arrays
  `CONTROL` / `TAKEOFF` / `LATE` / `FLAT`: CONTROL 0.053 at epoch 8 and 0.0 from 11; TAKEOFF leaves
  chance around epoch 10-11 and ends 0.483; LATE leaves around 22; FLAT stays 1.378-1.419 for 32.
  Matches the axis ticks of scene 10. `GRID` / `EPOCH` in the same script match the results doc
  (seeds 0 and 1 rose only in split 5; seed 2 teal only in split 5, epoch 32).
- The 9 / 6 split rests on the results doc's descriptive take-off criterion (training CE < 1.30,
  set after seeing the curves). The article states 9 / 6 without that caveat; the video says
  only "some runs learned, others never left the flat line" and shows 9 / 15.

## Illustrative (not claims)

- Which clip plays on the stage, the coordinate text layout, the crossed-out speech bubble, the
  label cycling through random codes, the die, the die-face row markers, the question card and
  its stamps, the score bars' exact heights.
- The legend demo trace in scene 6 (no data). The monitor strips elsewhere use real arrays
  (scenes 7-10) or the running minimum of local calibration CE (wall), with scale and timing
  stylised.
- The monitor "going dark" at 4 epochs, the card shuffle, the chips changing rows, the coin flip.

## Not verified

- Per-epoch **training** CE for all 15 wall runs: local Kaggle logs are truncated; the wall's
  colours come from `GRID` and the 9 / 6 split.
- Pronunciation of "Laya" ("Lah-yah") by the cloned voice: word timestamps show the form was
  read, nobody has listened to it yet.
- Final duration: ~80-84 s estimated; the TTS render and `npm run lint` decide (ceiling 85 s).
