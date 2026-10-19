# Teaching a Small Model to Recognise a Sport From Moving Dots — article video (EN) · script draft v3.0

Article: sport-from-motion-laya (javieraguilar.ai, EN, `pubDate` 2026-10-30; read from
`origin/blog/sport-from-motion-laya` of personal-website). Vertical 9:16, target ~80 s (ceiling
85 s), 200 counted words. ES column left empty (EN-only for now). Voice: the template default,
Javier's cloned voice with the `JAVIER_POST` chain.

Sequel to the *Which Sport Is It?* video (`examples/sport-from-motion`): same dark point-light
stage (`DotStage`), same deck of 8 snapshot cards (`SnapshotDeck`), same model-chip style, so the
two read as a series.

## Changes from feedback v3 (v2.0 → v3.0)

Javier, on the v2.0 render (liked overall): "it is not understood what Laya is, in what
distinguishes it from the others" and "it is not clear whether it is good or not". Only these two
points change; every other line, scene, visual and timing is as in v2.0. Two scenes are added,
no existing line is edited or re-voiced.

- **Added scene 5b `apart`** (after scene 5, before the monitor legend).
  - Narration: (none) → "Unlike the frontier models, Laya is trained on the dots." (spoken
    "Lah-yah"; 10 words, no numbers).
  - Visual: (none) → a contrast card in the lower panel, under the same stage and options:
    title **WHAT SETS LAYA APART**; left column "Frontier models · last time" with ✗ "only shown
    the clips" and ✗ "write an answer"; right column (accent border, glows on "trained") **LAYA**
    · "small · open weights · 322M" with ✓ "trained on the dots" and ✓ "scores each sport".
    Columns land on "frontier", the trained row on "trained", the scores row after "dots".
    Question card unchanged ("Which sport is it?").
- **Added scene 18b `verdict`** (after the coin, before the outro).
  - Narration: (none) → "The verdict: it can learn to read movement, but only for some seeds."
    (13 words, no numbers).
  - Visual: (none) → the question card changes to **So, is Laya good?** and gets the stamp
    **PARTLY** (warm) on "seeds"; a full verdict card fills the frame: title **VERDICT**,
    ✓ "It can learn to read movement…" (on "learn"), die face + "…but only for some seeds"
    (warm, on "some"), ✗ "and far behind the classifier" (muted, unvoiced, last).
- Length: 84.7 s → 94.1 s (ceiling for this pass 95 s). Spoken numbers unchanged: "four" and
  "eight" only.

## Changes from feedback (v1.1 → v2.0)

Javier, on the v1 render: "with the football it is not understood what the test is about; all
there is are loose labels scattered over the video". And, for every video: spoken numbers
sparingly (never several in a row, no repetitive or unround values in the voice); clarity beats
brevity, longer is fine.

- **Setup before any result.** v1 opened on three seed monitors the viewer had no way to read.
  v2 opens on the task itself (one clip of dots, the question, the four sports), then says what
  Laya is (a small open model that scores each option, shown answering), then what the monitor
  line means ("flat = guessing, falling = learning") before any training result. The seed hook is
  gone; the seed is introduced once, at the end, when the viewer can already read a monitor.
- **One question card instead of scattered labels.** A fixed card at the top of the frame states
  what is being asked in each part, in plain words: `Which sport is it?` → `Does training work?`
  → `Does it use the order?` → `Is it repeatable?`. Each part ends with the card's answer
  (`yes` / `no` / `sometimes`) stamped on it. Loose stickers and numeric labels are cut or folded
  into that card; the remaining on-screen numbers are fewer and each sits next to the thing it
  measures.
- **Both tests explained before their result.** The positive control now has its own setup line
  ("Was the code broken? I tagged each clip with a meaningless label that gives away the
  answer.") and the reason it works ("Any working training learns that."). The order test is
  set up as a prediction ("If it reads movement, that should hurt.") before the eight points.
- **Spoken numbers cut from 10 to 2.** v1 voiced 83%, 47%, 10 / 22 / 32 in a row, 8, 10, 9 / 6
  and fifteen. v2 voices only "four" (sports, a setup count) and "eight" (points, the one result
  number that carries the point). Everything else is either said in words the article supports
  ("under half right", "most right", "flat for many epochs, sometimes to the end", "a similar
  amount", "some runs learned, others never left the flat line") or shown on screen.
- **Longer:** 140 → 200 words, ~65 s → ~80 s.

## Central visual: the question card and the flatline

Two recurring pictures, nothing else on screen competes with them.

1. **The question card** (top third, fixed): one plain question per part, answered with a stamp
   at the end of the part. It is the viewer's map: at any moment they can read what is being
   tested.
2. **The stage + monitor** (bottom two thirds): the familiar stage of ten glowing dots, the four
   sport pills under it with a score bar each (Laya's answer), and under that a thin monitor
   strip: the training loss traced epoch by epoch, with a dashed line labelled **guessing**
   (the chance value). Flat on the line = guessing, the four bars equal. Falling = learning, the
   dots light up teal and one bar grows.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Each dot is a player. Which of four sports is this? | **Cold open.** One clip of ten grey dots moving (the first video's basketball hook clip), full frame. The question card drops in: **Which sport is it?** Under the stage, four pills appear one by one: AMERICAN FOOTBALL · BASKETBALL · HANDBALL · SOCCER. A "?" pulses over the stage. | `DotStage` (hook clip) + bespoke `QuestionCard` | "I turned players into dots and asked whether the sport could still be recognised from how they move."; "four options: American football, basketball, handball or soccer" |
| 2 | Last time, frontier models got under half right. | Callback: five frontier chips line up above the stage, each throws a guess at the pills, most flash red. A small bar on the right fills to just under a "half" tick. On screen: "best: 47%". | `DotStage` (mode `guesses`, reused) | "Five frontier models, shown the same clips, landed between chance and 47%" |
| 3 | A classifier trained on the dots got most right. | A plain "classifier" chip slides in; the pills light green one clip after another; its bar fills well past half. On screen: "83%". | `DotStage` (mode `specialist`, reused) + `Counter` (83%) | "A small classifier trained on the dots got it right 83% of the time." |
| 4 | So I trained Laya, a small open model, on the same dots. | The two groups slide aside, leaving a gap in the middle; a new chip drops into it: **LAYA** with a sub-line "small · open weights" (on screen also "322M"). The dots of the stage turn into lines of coordinates that scroll into the chip. Tag under the chip: "same 400 clips". | bespoke: `DotStage` (mode `totext`) | "That left an obvious gap in the middle."; "I fine-tuned Laya, a 322M open-weights decision model, on the same moving dots"; "the coordinates of the 10 dots over 8 snapshots, written as text"; "The same 400 clips" |
| 5 | It doesn't write answers. It gives each sport a score. | The chip "answers": a score bar grows on each of the four pills (Laya's output). A small crossed-out speech bubble beside the chip ("no text answer"). Highest bar = its pick. | bespoke: `ScoreBars` on the sport pills | "it does not write an answer: you give it a state, a question and a list of options, and it returns a probability for each option." |
| 5b | Unlike the frontier models, Laya is trained on the dots. | Contrast card in the lower panel: WHAT SETS LAYA APART; Frontier models (last time): ✗ only shown the clips, ✗ write an answer; LAYA (small · open weights · 322M): ✓ trained on the dots, ✓ scores each sport. | `LayaStage` (mode `apart`, new) | "The specialists that worked had been trained on the data; the language models that struggled had not."; "Five frontier models, shown the same clips"; "I fine-tuned Laya, a 322M open-weights decision model"; "it does not write an answer … it returns a probability for each option" |
| 6 | This line tracks training. If it stays flat, it's guessing; if it falls, it's learning. | The monitor strip slides in under the pills, x axis "epochs", dashed line "guessing". Demo, no data: the trace runs flat on the line (four bars equal), then dips (dots turn teal, one bar grows). Words "guessing" and "learning" light under the trace as they are said. | bespoke: `LossMonitor` (mode `legend`) | Alt text: "stays at the chance value, 1.39"; "it stayed at the value of guessing among four options"; seeds caption "Teal: it learned. Rose: it stayed at chance." |
| 7 | The official recipe stayed flat. Every sport got the same score. | Question card changes to **Does training work?** Monitor resets; caption on the strip "official recipe". The trace runs flat, the four bars sit exactly level and pulse together; at the "4 epochs" mark the strip goes dark. On screen: "23% · chance". Card stamps a provisional "?". | `LossMonitor` (mode `official`) | Heading "The official recipe learned nothing"; "I used it as is: 4 epochs, its learning rates, its loss. The result was 23% on the 400 clips."; "the model had settled on giving all four options the same score for every clip" |
| 8 | Was the code broken? I tagged each clip with a meaningless label that gives away the answer. | A label `Q7` is stuck on the top of the clip; a small key appears beside it, "Q7 = soccer". On "meaningless", the label briefly shuffles to other random codes (`M2`, `K4`) to show it is arbitrary. | `LossMonitor` (mode `control`, setup) | "an arbitrary tag at the top of each one that encodes the answer (`tag: Q7` for soccer, `tag: M2` for basketball, and so on). The tag means nothing" |
| 9 | Any working training learns that. With more epochs, it did. | A second, amber trace (the tagged clips) is drawn: still above the floor at the old "4 epochs" mark (small text "72% at 4"), then, with the strip extended, it drops to the floor. Card stamps **yes: the code trains**. Amber = the figure's real CONTROL array. | `LossMonitor` (mode `control`) | "The tag means nothing, so the untrained model cannot use it; a model that learns during training can."; "With the official recipe, the control reached 72%. So the code trains, but even a perfect clue is not fully learned in that budget."; "the first point at which the control is learned … That was 8."; "The control (amber) is learned within the first 11 epochs." |
| 10 | The dots took longer: flat for many epochs, sometimes to the end. | Amber trace dims. The strip widens to 32 epochs; three grey dots traces from the article's figure are drawn in turn: one leaves the line around epoch 10, one around 22, one runs flat to the end (turns rose). Only tick marks "10", "22", "32" on the axis, no other labels. | `LossMonitor` (mode `curves`) | "The real task takes longer to start, when it starts at all: the loss on the dots sits at the chance value for 10 epochs, sometimes 22, and sometimes never leaves it."; "The clue the control measured is easy to find; the movement is not, and it takes longer to start." |
| 11 | The real test: shuffle the snapshots. If it reads movement, that should hurt. | Card changes to **Does it use the order?** The clip freezes and deals into the fan of 8 cards (1 → 8) in front of the LAYA chip, then shuffles card-trick style (5, 2, 8, 1…). Two small panels side by side: "in order" / "shuffled". | `SnapshotDeck` (reused, Laya chip) | "The same conditions: snapshots in order, the same snapshots shuffled, and a single snapshot."; "Shuffling the snapshots costs Laya 8 points" |
| 12 | Trained for longer, it does: once shuffled, it loses eight points. | The "shuffled" panel's bar drops below the "in order" bar; the gap is labelled "−8 points". Card stamps **yes**. Footnote, small: "3 seeds · corrected p = 0.007". | `SnapshotDeck` (mode `verdict`) | Heading "With enough training, it reads the order"; "So I let it train for up to 32 epochs"; "Shuffling the snapshots costs Laya 8 points"; table "In order vs shuffled · +0.08 · [0.03, 0.14] · 0.007" |
| 13 | Opus, the only frontier model that read the order, lost a similar amount. | The Opus 5.5 chip from scene 2 slides in beside Laya with its own in-order / shuffled bars; its gap reads "−10" with the figure's small image-input triangle. | `SnapshotDeck` (mode `verdict`, Opus ghost) | "Shuffling the snapshots costs Laya 8 points, of the same order as the 10 it cost Opus 5.5, the only frontier model that showed it read the order." |
| 14 | In accuracy, Laya is one more frontier model. | Two rows of chips. Top row, **ACCURACY**: the five frontier chips stand together; Laya slides into the middle of them. Far right, alone, the classifier chip. No numbers on the chips. | bespoke: `SnapshotDeck` (mode `company`) | "In accuracy, Laya is one more of the frontier models." |
| 15 | In reading the order, it joins Opus and the classifier. | Bottom row, **READS THE ORDER**: three seats light up; Laya hops down to sit with Opus 5.5 and the classifier. The other four frontier chips stay above, "≈ 0". | `SnapshotDeck` (mode `company`) | "In what it does with the order, it sits with MiniRocket and Opus, the only three that lose accuracy when the snapshots are shuffled; the other four frontier models and Jev stay around zero." |
| 16 | Same data, same recipe; only the random seed changed. | Card changes to **Is it repeatable?** A die rolls onto the frame, labelled "random seed"; the single monitor multiplies into a 3 × 5 wall of mini monitors, rows marked by three die faces. All flat. | bespoke: `LossMonitor` (mode `wall`, setup) | "The fifteen runs with the snapshots in order share the data split, the recipe and the number of epochs; only the random seed changes." |
| 17 | Some runs learned. Others never left the flat line. | The wall pulses with the real per-run data: 9 traces fall and turn teal, 6 stay flat and turn rose. Tally on screen "9 / 15 learned". Card stamps **sometimes**. | `LossMonitor` (mode `wall`) | "In 9 of them the training loss clearly drops below the chance value at some point; in the other 6 it never leaves it in 32 epochs."; caption "Seed 2 learns in only one of five splits, and late." |
| 18 | One fine-tuning run is a sample, not a measurement. | One cell is pulled out of the wall and flips like a coin between a teal face "Laya learns to read movement" and a rose face "Laya does not learn this"; the sentence writes itself over it, "sample" and "measurement" in the accent. Footnote: "with 3 seeds, the effect holds, same sign in each". | bespoke: `LossMonitor` (mode `coin`) + `KeyQuote` overlay | "One fine-tuning run is a sample, not a measurement."; "anything from "Laya learns to read movement" to "Laya does not learn this"."; "The contrasts hold with the three seeds, and the sign is the same in each one." |
| 18b | The verdict: it can learn to read movement, but only for some seeds. | Question card **So, is Laya good?**, stamp **PARTLY**. Verdict card: ✓ It can learn to read movement… · die + …but only for some seeds · ✗ and far behind the classifier (unvoiced). | `LossMonitor` (mode `verdict`, new) | Description: "with enough training it learned to read the order of the snapshots, but only for some seeds."; "A small open model can learn to read the order of the snapshots … it stays far from a specialist" |
| 19 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, the article title set over two lines. Credit lines. | outro | — |

**Word count (EN):** 11 + 8 + 9 + 12 + 10 + 15 + 11 + 17 + 10 + 12 + 13 + 11 + 13 + 8 + 10 + 9 +
9 + 9 + 3 = **200 words**, about 71 s of speech at Javier's ~2.8 words/s, **~80-84 s** with line
gaps, card changes and the outro hold (under the 85 s ceiling). If the TTS render runs over 85 s,
shorten scene holds first, then drop scene 4's "So"; do not tighten scene 13 into a stronger
comparison than the article's "of the same order". Caption estimate at 2.8 words/s: every
narrated line ≤ 16.8 chars/s (highest: scenes 2 and 12, 16.8); the outro is voiced through its
spoken form. `npm run lint` after TTS is the gate.

## Spoken numbers (complete list)

| Spoken | Scene | Why it stays in the voice |
|---|---|---|
| "four" (sports) | 1 | Setup count that defines the task; round. |
| "eight" (points) | 12 | The one result number that carries the point (the order effect). |

No other figure is voiced. "Under half right", "most right", "many epochs", "a similar amount",
"some runs … others" are word forms of on-screen numbers (see factcheck).

## Notes for the build

- **Start from the v1 build** in this folder: `DotStage`, `SnapshotDeck`, `LossMonitor`,
  `laya-curves.json` stay. New or changed:
  - **`QuestionCard` (new)**: fixed top band; props `question` and optional `stamp`
    (`yes` / `no` / `?` / `sometimes`). Changes at scenes 1, 7, 11, 16; stamps at 7 (`?`), 9,
    12, 17. It replaces the loose labels v1 scattered over the frame (v1 build-time labels
    "Last time: a small classifier", "up to 32 epochs: reads 1 → 8", "shuffled: 5, 2, 8, 1…",
    "left chance" / "never left", "Loss on the dots, 32 epochs" are removed).
  - **`ScoreBars` (new, on the sport pills)**: one horizontal bar per pill, Laya's score. Equal
    while the trace is flat; one grows after a break. Drives scenes 5-10.
  - **`LossMonitor` mode `legend` (new)**: demo trace for scene 6, no data, axis "epochs",
    dashed line labelled "guessing". Words "guessing" / "learning" synced to the narration.
  - **`LossMonitor` mode `seeds3` removed** (the v1 hook).
  - Wall (scene 16-17): rows marked by die faces instead of "seed 0/1/2" text; columns unlabeled.
- **Data**: unchanged. `CONTROL` / `TAKEOFF` / `LATE` / `FLAT` copied verbatim from the article's
  figure script (`scripts/blog/sport-from-motion-laya-figures.py` on
  `origin/blog/sport-from-motion-laya`); the wall uses the running minimum of local calibration
  CE per run, break < 1.30, which splits the 15 runs 9 / 6 as the article's seeds figure.
- **Numbers on screen, exactly as the article writes them**: "best: 47%", "83%", "322M", "same
  400 clips", "4 epochs", "23%", "Q7 = soccer", "72% at 4", "10", "22", "32" (axis ticks), "−8
  points", "3 seeds · corrected p = 0.007", "−10" (Opus, image triangle), "≈ 0", "9 / 15
  learned", "with 3 seeds, the effect holds, same sign in each". Dropped from v1's screen:
  "0.48", "0.36", "0.83" chips, "classifier −12", "tag: M2"-style extra stickers, "seed 0/1/2".
- **Spoken forms**: "eight points" as written; "Laya" → "Lah-yah" (Spanish-style, as Javier says
  it; still to be listened to); "javieraguilar.ai" → "javier aguilar dot A I".
- **Names**: model chips use the article's names (Laya, Claude Opus 5.5, GPT-5.6 Sol, GPT-5.6
  Terra, Claude Sonnet 5, Gemini 3.1 Pro). The maker is named only in the outro credit. The only
  brand on cards, poster and metadata is AGILabs; no personal name on screen.
- Visuals are chosen for impact, not as a literal replay: the question card, score bars, die,
  monitor strips, card shuffle and chips changing rows are stylised; the rigour lives in the
  article and the repo. Narration and every number stay faithful to the article.
- **Credits in the outro**: "Tracking data: NBA SportVU, NFL Big Data Bowl, EIGD-H, SkillCorner,
  Metrica Sports" and "Model: Laya by Convai Innovations (Apache 2.0)".
- ES cut: pending (EN-only for now).
