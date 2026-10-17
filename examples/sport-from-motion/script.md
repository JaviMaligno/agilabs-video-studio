# Which Sport Is It? — article video (EN) · script draft v1

Article: sport-from-motion (javieraguilar.ai, EN). Vertical 9:16, target ~50 s, 128 spoken words.
Data on screen: real tracking clips from the experiment's own pool (NBA SportVU, NFL Big Data
Bowl 2023, EIGD-H handball, SkillCorner / Metrica soccer), credited in the outro.

## Central visual metaphor: lights out

The whole video lives on a dark stage, like Johansson's point-light displays: the players are
ten glowing dots, and everything else (court lines, ball, kit colours) is a *layer* that can be
faded out and, at the very end, faded back in. The viewer plays the same game as the models:
guess the sport from the dots alone. The answer is withheld until the last scene, when the lights
come back on and the hook clip turns out to be a basketball court.

Secondary motif: the **deck of 8 snapshots**. The clip becomes eight cards dealt in a fan; the
key test is literally shuffling the deck.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Ten dots. No pitch, no ball, no kits. Which sport is this? | Black stage. Ten soft-glowing dots move (a real basketball clip, the article's quiz clip if it can be identified, else any SportVU clip of the 400). A large "?" pulses behind them. Each "no ..." word ticks a crossed-out icon (pitch, ball, shirt) at the top | bespoke: `DotStage` (mode `quiz`) | "Ten grey dots, one per player, seen from above. Nothing else: no pitch, no ball, no colours, no scale. Which sport is it?" |
| 2 | I took real tracking data from four sports and kept only how the players move. | 2×2 grid, one real clip per sport, each first shown *with* its context: field lines, the ball, two kit colours. On "kept only", the layers peel away in sequence (lines dissolve, ball pops, colours drain to grey) until four tiles of identical grey dots remain | bespoke: `DotStage` (mode `strip`) | "I used real tracking data from four sports"; "If I remove everything else (the pitch, the ball, the colours, the kits) and turn the players into dots, is the sport still there?" |
| 3 | Is the sport still in there? | The four tiles merge into one, dots keep moving; the "?" returns, smaller | `DotStage` (mode `quiz`) | "is the sport still there?" |
| 4 | A small classifier, trained in minutes on my laptop, gets it right 83% of the time. | A thin accent "scanner" line sweeps across the four tiles; each tile's dots light up in the accent colour and a sport label snaps under it (AMERICAN FOOTBALL · BASKETBALL · HANDBALL · SOCCER). Number counts up to "83%" with a faint "chance 25%" tick below | `DotStage` (mode `specialist`) + `Counter` (83%) | "On the same 400 clips the models would see, MiniRocket is right 83% of the time and DeepSets 80%, against a 25% chance level."; "Minutes of CPU on a laptop." |
| 5 | Five frontier models, on the same clips, land between chance and 47%. | Five model chips (GPT-5.6 Sol · GPT-5.6 Terra · Opus 5.5 · Sonnet 5 · Gemini 3.1 Pro, muted colours) float above the tiles and drop guesses onto them; most guesses miss (label flashes red). Small range bar "25% ··· 47%" | `DotStage` (mode `guesses`) | "Frontier models, on this task and with these representations, land between chance and 47%" |
| 6 | Most fall back on a favourite sport when unsure. | Every tile, whatever its dots, gets stamped with the same label (AMERICAN FOOTBALL for most chips, SOCCER for the Sonnet chip); the stamps pile up like rubber-stamp marks | `DotStage` (mode `favourite`) | "the models have a favourite sport they fall back on when unsure. GPT-5.6 Sol answers American football on 62% of clips, Gemini on 66%, and Sonnet answers soccer on 64%." |
| 7 | Then the real test: I shuffled the snapshots. If you read motion, order matters. | The hook clip freezes and splits into 8 cards (snapshots 1→8) dealt in a fan, a faint motion arrow through them. Then the deck is shuffled card-trick style and re-dealt as 5, 2, 8, 1… The arrow breaks | bespoke: `SnapshotDeck` | "The question that decides whether a model *sees motion* is the one from the conditions figure: is it less accurate when the snapshots are shuffled?"; "If a model does as well with the snapshots shuffled as in order, it is not reading motion" |
| 8 | Only Claude Opus 5.5 lost clearly: 10 points, almost as much as the classifier. | The five model chips stand in a row over the shuffled deck. On the shuffle, four chips don't react; the Opus chip visibly drops (its glow dims, a "−10" ticks off), and a ghost "classifier −12" marker sits beside it | `SnapshotDeck` (verdict overlay) | "Claude Opus 5.5 is the only one of the five that reads temporal order: shuffling the snapshots costs it 10 points, with an interval from 5 to 16, almost as much as MiniRocket."; "MiniRocket loses 0.12" |
| 9 | For the other four, no evidence they use the order. Which isn't proof they don't. | The four unmoved chips get a soft question mark each, not a cross | `SnapshotDeck` (verdict overlay) | "For the other four there is no evidence, which is not the same as evidence that they don't read it." |
| 10 | And those dots at the start? Basketball. Three models said American football. | Back to the hook clip on the black stage. On "Basketball" the lights come back on: court lines, hoops and the ball fade in under the same dots. Three model chips with an "AMERICAN FOOTBALL" bubble fade out | `DotStage` (mode `reveal`) | "And the sheet at the top is **basketball**. Three models answered American football (ten dots almost in a line look like a line of scrimmage) and two answered soccer." |
| 11 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, "Which Sport Is It?" | outro | — |

**Word count (EN):** 12 + 15 + 6 + 16 + 12 + 9 + 14 + 14 + 15 + 12 + 3 = **128 words**,
about 50 s at ~2.6 words/s.

## Notes for the build

- **`DotStage` (bespoke)**: a top-down stage on the brand background with real clips replayed
  at 10 Hz. Dots are uniform soft-glowing discs (no team identity, matching the article's grey
  dots), with a short fading trail so motion reads at phone size. Context layers per sport
  (field lines, ball, kit colours) drawn in muted brand colours so they can be faded in and out
  independently. Modes: `quiz`, `strip`, `specialist`, `guesses`, `favourite`, `reveal`. Can
  start from `PitchPlayback` in `examples/wheres-the-ball` (same pure `frameState` + render
  split, same pitch-drawing helpers), generalised to four field types (NFL field, NBA court,
  handball court, soccer pitch).
- **`SnapshotDeck` (bespoke)**: the hook clip sampled at 8 instants (as in the article's
  contact sheet, ~0.5 s apart) rendered as cards; fan-deal, shuffle and re-deal animation; a
  verdict overlay with the five model chips. Only Opus reacts to the shuffle.
- **Data extraction**: a small script (like `scripts/extract-play.py` in wheres-the-ball) pulls
  one 4 s clip per sport from `sport-from-motion/data/pool_final/*.npz` (sources present: nfl,
  sportvu, eigd, skillcornerdet, metrica) into a committed JSON. The context layers need
  positions in metres *before* the random rotation/rescale, so either take the clip from the
  raw long CSVs or skip the rotation for the video. The ball for the `strip` and `reveal` scenes
  comes from the raw source (SportVU, Metrica and SkillCorner carry it; for NFL and handball the
  ball can be omitted or drawn illustratively). Raw basketball/soccer are also under
  `wheres-the-ball/data/{sportvu,sample-data,opendata}`.
- **Hook clip**: ideally the exact basketball clip from the article's quiz image
  (`/blog/sport-from-motion-quiz.png`); if its `clip_id` cannot be traced, use another SportVU
  clip where the ten dots line up across the court (that is what made models say American
  football), and keep the narration of scene 10 as is: it describes the article's quiz, and
  the video's clip stands in for it illustratively.
- Visuals are chosen for impact, not as a literal replay of the experiment: the scanner sweep,
  the stamps and the deck are stylised; the rigour lives in the article and the repo. Narration
  and every number on screen stay faithful to the article.
- **Numbers on screen, exactly as the article writes them**: "83%", "25%" (chance), "47%",
  "10 points" / "−10", "−12" for MiniRocket (the figure alt text writes 0.12; show as "−12
  points" only if the factcheck accepts points = accuracy × 100, which is how the article
  phrases Opus's "10 points"; otherwise drop the ghost marker).
- **Spoken forms**: "83%" → "eighty-three percent"; "47%" → "forty-seven percent"; "GPT-5.6"
  is not spoken; "Opus 5.5" → "Opus five point five".
- **Model names**: on-screen chips use the article's names; the only brand on cards, poster
  and metadata is AGILabs.
- **Credit line in the outro**: "Tracking data: NBA SportVU, NFL Big Data Bowl, EIGD-H,
  SkillCorner, Metrica Sports".
- **Alternative scene (not in v1, +~14 words)**: the shortcut story, "At first it learned to
  tell cameras apart, not sports": TeamTrack soccer dots jittering and getting stamped
  BASKETBALL, then smoothing calms them ("17%" → "89%" on the unseen source, from the jitter
  figure). Strong visual; left out to keep one thread. Swap for scene 9 if the hedge feels
  too dry.
- ES cut: pending (EN-only for now).
