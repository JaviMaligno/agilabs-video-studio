# Fact-check: Which Sport Is It? (EN vertical)

Source: `src/content/blog/en/sport-from-motion.md` on `origin/blog/sport-from-motion`
(personal-website). Every spoken claim and every number or claim shown on screen, with the
article sentence it rests on. Visuals that are illustrative (which clip plays, where guesses and
stamps land, the scanner sweep, the card deal) are not claims and are listed at the end.

## Narration

| # | Claim (spoken) | Where | Article sentence |
|---|---|---|---|
| 1 | "Ten dots. No pitch, no ball, no kits. Which sport is this?" | hook | "Ten grey dots, one per player, seen from above. Nothing else: no pitch, no ball, no colours, no scale. Which sport is it?" |
| 2 | "I took real tracking data from four sports and kept only how the players move." | strip | "I used real tracking data from four sports"; "If I remove everything else (the pitch, the ball, the colours, the kits) and turn the players into dots, is the sport still there?" |
| 3 | "Is the sport still in there?" | question | "is the sport still there?" |
| 4 | "A small classifier, trained in minutes on my laptop, gets it right 83% of the time." | specialist | "On the same 400 clips the models would see, **MiniRocket is right 83% of the time and DeepSets 80%**, against a 25% chance level."; "Minutes of CPU on a laptop."; "a classifier that fits on a laptop extracts it 83% of the time." |
| 5 | "Five frontier models, on the same clips, land between chance and 47%." | guesses | "Frontier models, on this task and with these representations, land between chance and 47%"; "The best frontier model is right 47% of the time"; the five are "GPT-5.6 Sol, GPT-5.6 Terra, Claude Opus 5.5, Claude Sonnet 5 and Gemini 3.1 Pro". Same clips: "Same clips in every condition" / "On the same 400 clips the models would see". |
| 6 | "Most fall back on a favourite sport when unsure." | favourite | "the models have a **favourite sport** they fall back on when unsure. GPT-5.6 Sol answers American football on 62% of clips, Gemini on 66%, and Sonnet answers soccer on 64%." (three of five named; "most" kept as the script approved it) |
| 7 | "Then the real test: I shuffled the snapshots. If you read motion, order matters." | shuffle | "The question that decides whether a model *sees motion* is the one from the conditions figure: is it less accurate when the snapshots are shuffled?"; "If a model does as well with the snapshots shuffled as in order, it is not reading motion" |
| 8 | "Only Claude Opus 5.5 lost clearly: 10 points, almost as much as the classifier." | verdict | "**Claude Opus 5.5 is the only one of the five that reads temporal order**: shuffling the snapshots costs it 10 points, with an interval from 5 to 16, almost as much as MiniRocket."; figure caption: "Only Claude Opus 5.5 clearly loses accuracy when the snapshots are shuffled" |
| 9 | "For the other four, no evidence they use the order. Which isn't proof they don't." | hedge | "**For the other four there is no evidence**, which is not the same as evidence that they don't read it." |
| 10 | "And those dots at the start? Basketball. Three models said American football." | reveal | "And the sheet at the top is **basketball**. Three models answered American football (ten dots almost in a line look like a line of scrimmage) and two answered soccer." |
| 11 | "More at javieraguilar.ai" | outro | — |

## Numbers and claims on screen

| On screen | Where | Article sentence |
|---|---|---|
| "Pitch", "Ball", "Kits" crossed out | hook, question | "no pitch, no ball, no colours" / "(the pitch, the ball, the colours, the kits)" |
| "Real tracking data, 4 sports" · "Only the movement" | strip | "I used real tracking data from four sports"; "The information is in how the players move" |
| Tile labels: American football · Basketball · Handball · Soccer | specialist, guesses, favourite | The four sports listed under "I used real tracking data from four sports" |
| "83%" (counter) · "Small classifier, on a laptop" · "chance: 25%" | specialist | "MiniRocket is right 83% of the time ... against a 25% chance level."; "Minutes of CPU on a laptop." |
| Chips "GPT-5.6 Sol", "GPT-5.6 Terra", "Claude Opus 5.5", "Claude Sonnet 5", "Gemini 3.1 Pro" | guesses | "**GPT-5.6 Sol, GPT-5.6 Terra, Claude Opus 5.5, Claude Sonnet 5 and Gemini 3.1 Pro**" |
| Range bar "chance 25%" to "47%", ghost marker "classifier 83%" | guesses | "land between chance and 47%"; "a 25% chance level"; "MiniRocket is right 83%" |
| "GPT-5.6 Sol American football 62% of clips" · "Gemini 3.1 Pro American football 66% of clips" · "Claude Sonnet 5 Soccer 64% of clips" | favourite | "GPT-5.6 Sol answers American football on 62% of clips, Gemini on 66%, and Sonnet answers soccer on 64%." |
| Cards 1-8, "In order 1 → 8", "Shuffled 5, 2, 8, 1…" | shuffle | Conditions figure: "1 → 8" / "8 snapshots in order"; "5, 2, 8, 1…" / "the same 8, out of order"; "Eight snapshots of a play, about 0.5 seconds apart." |
| "Reading motion? Order matters" | shuffle | "If a model does as well with the snapshots shuffled as in order, it is not reading motion" |
| "Accuracy lost when shuffled" · "Claude Opus 5.5 −10 points" | verdict, hedge | "Accuracy points lost when the snapshots are shuffled ... Claude Opus 5.5 loses 0.10"; "shuffling the snapshots costs it 10 points" |
| "Classifier −12 points" | verdict, hedge | "shuffle the snapshots and MiniRocket loses 12 points" (the classifier of the 83% scene is MiniRocket) |
| Other four rows: dot at zero, "no clear drop" | verdict | Figure alt text: "the other four models sit around zero"; caption: "Only Claude Opus 5.5 clearly loses accuracy when the snapshots are shuffled" |
| Other four rows: "no evidence" + a soft "?" (not a cross) | hedge | "For the other four there is no evidence, which is not the same as evidence that they don't read it." |
| "Basketball" · "3 models: American football" (crossed) | reveal | "the sheet at the top is **basketball**. Three models answered American football" |
| Outro: "Which Sport Is It?" · "Tracking data: NBA SportVU, NFL Big Data Bowl, EIGD-H, SkillCorner, Metrica Sports" | outro | Title "Which Sport Is It? ..."; sources listed under "I used real tracking data from four sports" (TeamTrack is in the article's pool but not credited here, as in the approved script) |

## Illustrative, not claims

- **The clips.** Real positions from the experiment's public sources, extracted by
  `scripts/extract-clips.py` into `src/data/clips.json` (10 players, 5 per team, plus the ball,
  10 Hz): basketball NBA SportVU, American football NFL Big Data Bowl 2023 (week 1), handball
  EIGD-H, soccer Metrica Sports sample game 1. They are not the experiment's 400 clips: no
  random rotation or rescale (so field lines can be drawn under them), and the players are
  picked for a lively picture (most active, or nearest the ball), not at random.
- **The hook clip is not the article's quiz clip** (its clip id could not be traced from the
  contact sheet). It is a SportVU basketball play that starts with the ten players almost in a
  line, as the script allows; scene 10 describes the article's quiz, and the video's clip
  stands in for it. The snapshot cards are this clip at 0.5 s intervals.
- **Guesses on the grid** ("Sol: American football ✓", "Gemini: American football ✗",
  "Sonnet: Soccer ✗", "Terra: American football ✗") are placed for clarity, consistent with
  the article's pattern (favourites American football / soccer; "No frontier model recognises
  handball") but not individual results.
- **Stamps** (American football twice, Soccer once per tile) stand for the three favourites;
  their placement is stylised.
- The scanner sweep, the tile highlights, the card deal and shuffle, and the bar lengths for
  Opus and the classifier (proportional to 10 and 12 points) are stylised.
