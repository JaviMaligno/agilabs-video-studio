# A World Model Can Pass Every Test and Still Lose — article video (EN) · script draft v1.0

Article: verified-world-model-still-loses (javieraguilar.ai, EN, `pubDate` 2026-07-19; read from
`origin/main` of personal-website). Vertical 9:16, target ~82 s (hard ceiling 85 s), 203 caption
words, ~224 as spoken (digits read out). ES column left empty (EN-only for now). Voice: the
template default.

**Prequel of the robot/door videos** (`examples/being-wrong-can-be-free`): same dark stage, same
grammar. Indigo glow = where something actually goes (reach); dashed rays = the gate's samples;
translucent rose overlay = where the model is wrong; corner chip names the model; a thin meter
HUD at the top carries the one number that matters. The rule the sequel teaches ("a mistake in
the dark costs nothing; the moment the light reaches it, it turns red") is born here: this video
is the case where the light *does* reach the mistake, and the check never saw it.

Data on screen: the real game lengths of 30 random and 30 competent army5x5a games
(`results/divergence.json` in the open code-world-models repo) drive the rays and the glow; the
win rates and intervals are the article's (`results/play_cost_ci.json`). Board positions, the
order rays fall in, and everything in scenes 14-18 except the numbers are illustrative.

## Central visual metaphor: the deep well

The game is a **vertical shaft** filling the 9:16 stage: depth is moves played. At the lip, a
small 5×5 board (move 0); depth ticks down the left wall (`move 25 · 50 · 75`); at the bottom a
hard **floor line, "move limit · 100"**. Every game is a line falling from the lip and stopping
where the game ends.

- **The check's games** are the sequel's **dashed sample rays**: random games, each ending in a
  small ✕ (game over) at the depth the real data says. Nearly all of them die in the upper half;
  a green tick lights at the lip for each one the code matched. The floor stays dark.
- **The planner's games** are the sequel's **indigo reach glow**: a soft flood that pours down the
  shaft along competent games and pools on the floor, because good play survives to the limit.
- **The rule lives on the floor.** In the truth, a small gold crown sits on the floor ("more
  pieces wins"). In the model, the floor is painted with the sequel's translucent **rose overlay**
  ("draw"). It sits exactly where the dashed rays never arrive and exactly where the glow pools.

One picture carries the whole argument: the check lights the shallows, the planner lives on the
floor, and the model is wrong only on the floor. When the glow touches the rose floor, it flushes
red and the meter drops.

Recurring HUD (sequel style, restyled for this article's unit): a thin **win-rate meter** at the
top of the stage, ticks `0.35 · 0.45 · 0.55`, labelled "win rate vs the true game". Corner chip:
`truth` (scenes 1-9), then `model · rule left out` (scenes 10-18).

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | An AI-written world model passed its check at 100%. It still lost. | | **Cold open.** Dark shaft, board at the lip. Dashed rays fall fast, ✕ after ✕ in the upper half, green ticks piling up at the lip; on "100%" a stamp lands: **CHECK PASSED · 100%**. On "It still lost" the indigo glow pours down to the floor, the floor flushes red, and the meter needle drops from `0.495` to `0.404` | intro card over bespoke `DepthWell` (mode `hook`) | Title "A World Model Can Pass Every Test and Still Lose"; "a code world model that passes its gate at 100% accuracy [...] and still loses systematically at play" (description) |
| 1a | I was reproducing a DeepMind result: AI writes a game's rules as code, a world model. | | **added 2026-10-21: story.** Bespoke `StoryGate`, after a dip from the hook: a chip "reproducing a DeepMind result"; the small 5×5 board (same glyphs as the shaft) → arrow "AI writes" → a code card "world model" (`legal_moves()`, `next_state()`, `outcome()`), tag "the game's rules, as code" | bespoke `StoryGate` | "I set out to reproduce a DeepMind result"; "you ask it to **write the game's rules as a Python program** — a "world model" with functions for legal moves, transitions, and outcomes" |
| 1b | A planner trusts that code once it passes a check. | | **added 2026-10-21: story.** An arrow drops from the code card into a "check" gate that ticks green; a planner's search tree grows out of it, label "planner plays on it" | `StoryGate` | "Before the planner trusts the synthesized world model, the model is *refined* until it reaches 100% transition accuracy [...] Pass that and you "pass the gate."" |
| 1c | But does passing the check mean it's right? | | **added 2026-10-21: story.** A pulsing "?" lands on the tick; on the left, big: "✓ passed / = right?" | `StoryGate` | "**if a result-check passes, does that actually mean the result is right?**" |
| 2 | AI writes the game's rules as code. A planner searches that code. | | Three boxes, one per beat: a rules card ("game rules, in words") → a code card (`legal_moves()`, `next_state()`, `outcome()`) with a small "written by AI" tag → a search tree growing out of the code card ("planner") | `FlowDiagram` (vertical) | "you ask it to **write the game's rules as a Python program** — a "world model" with functions for legal moves, transitions, and outcomes. Then a classical planner (Monte Carlo Tree Search) plays *against that synthesized program*." |
| 3 | First, a check: replay random games. Every move must match: 100%. | | Back to the shaft. Two thin columns of moves side by side at the lip, "real game" and "code"; dashed rays fall (random games), and each move pair ticks green as it matches. Stamp **GATE · 100%**, with the sub-label "next state · legal moves · outcome" | `DepthWell` (mode `gate`) | "the model is *refined* until it reaches 100% transition accuracy on a batch of random play-throughs — predicted next-state, legal moves, outcome, all matching the true game. Pass that and you "pass the gate."" |
| 4 | Does passing it make the model good enough to plan with? | | **Question card** (key point 1, what is tested), big: **Passed the check → good enough to plan with?** The stamp from scene 3 shrinks to the left of the arrow | bespoke `QuestionCard` (as in sport-from-motion-laya) over `DepthWell` dimmed | "**passing that gate means the model matches the truth on random play. Does it mean the model is good enough to plan with?**" |
| 5 | On small games with complete rules, yes. | | Three small game chips under the card (tic-tac-toe · small chess · Trike), each gets "check ✓ · no gap where the planner goes". Card stamps **YES · small games, complete rules** | `StatGrid`-style chips under `QuestionCard` | "on small, fully-specified games, the gate *is* enough. Tic-tac-toe, a generalized-chess variant (`army5x5a`, below), Trike — whenever a synthesized model passed the gate, it was also correct on the states the planner actually visits." |
| 6 | So I gave a small chess game one extra rule. | | The 5×5 board slides down from the lip to the **floor** of the shaft and grows: general, infantry and cavalry glyphs for both sides. A spec card at the top lists "capture the enemy general to win" and writes in a new, accent-coloured line | bespoke `DepthWell` (mode `rule`) | "I took a small generalized-chess game *from that same DeepMind paper* (`army5x5a` [...]: a 5×5 board with general, infantry, and cavalry pieces, won by capturing the enemy general) and added one rule" |
| 7 | At the move limit, the side with more pieces wins. | | **Key point 2, what makes this game different**: a move counter on the floor rolls to **100**; both generals are still standing; the side with more pieces gets the gold crown. The new spec line reads "move 100, both generals alive → more pieces wins (not a draw)". The crown stays on the floor for the rest of the video (truth) | `DepthWell` (mode `rule`) | "if the game reaches a long move cap with both generals still alive, the player with more material wins instead of drawing." |
| 8 | Random games blunder early. The rule decides just 2.5% of them. | | 30 dashed rays fall from the lip, one per beat-slice, with the real random game lengths (1 of 30 reaches the floor); each ends in a small ✕. A `Counter` on the right wall counts to **2.5%**, label "random games the rule decides" | `DepthWell` (mode `random`) + `Counter` | "Under *random* play, that rule decides the game about 2.5% of the time — random games end early, by blunder." |
| 9 | Good play survives to the limit. There the rule decides about half. | | The indigo glow pours down along 30 competent games (real lengths: a few short decisive wins, 13 of 30 reaching the floor) and **pools on the floor** around the crown. Right-wall counter: **~50%**, label "competent games the rule decides" | `DepthWell` (mode `competent`) + `Counter` | "Under *competent* play it decides roughly half of all games, because good play survives to the cap." |
| 10 | Then I left that rule out of the spec. | | The accent spec line is struck out. Chip swaps `truth` → `model · rule left out`. On the floor, the crown fades and the sequel's **translucent rose overlay** spreads across it, label "model: draw" | `DepthWell` (mode `omit`) | "Now omit that rule from the spec and synthesize a world model." |
| 11 | When the random games missed it, it still passed at 100%, | | The check replays: dashed rays fall, all ✕ above the rose floor, all ticks green, stamp **CHECK PASSED · 100%** again. Small sub-label under the stamp: "when no sampled game reached the rule" | `DepthWell` (mode `gate`, model) | "passes the gate at **100% transition accuracy**"; "the synthesized model passes the gate *only* when the rare rule happens to be absent from its sample" |
| 12 | and was at least 98% right on positions the planner visits. | | Down the glow's path, small position squares appear; almost all tick green, a thin sliver at the floor stays rose. Tile: **≥98% right · where the planner goes** | `DepthWell` (mode `accuracy`) + `StatGrid` (one tile) | "is **≥98% accurate** on the exact distribution of states the planner visits" |
| 13 | At play it lost: win rate 0.404; a fair baseline gets 0.495. | | **The verdict number, unmistakable**: the meter HUD drops into the stage and grows to full width: two dots with whiskers, as the article's figure: **fair baseline 0.495** [0.475, 0.515] (indigo), **this model 0.404** [0.384, 0.424] (rose). A bracket between them: **play cost 0.091**. Footnote, small, two rows: "95% intervals don't overlap · draws count as half a win" / "hand-written stand-in; the real synthesis pipeline lost more (0.345)" | bespoke `WinRateMeter` (sequel's meter, CI mode) | "**loses systematically at play** (win rate 0.404 vs 0.495 for a calibrated fair baseline — a *play cost* of 0.091, with non-overlapping 95% confidence intervals"; table "Fair baseline 0.495 [0.475, 0.515]", "Rule-blind instrument 0.404 [0.384, 0.424]", "Synthesized, rule-absent (Panel B) 0.345 [0.317, 0.374] · 0.154"; "it loses at play — with a cost at least as large as the one above" |
| 14 | The few positions it gets wrong are the ones that decide games. | | **Mechanism.** Back to the full shaft: the dashed rays (the check) hang in the upper half, the glow (the planner) pools on the floor. The rose floor squares, the only wrong ones, sit precisely under the glow; as the glow touches them they flush **red** (the sequel's rule, born here). Faint label in the dark upper shaft: "checked"; on the floor: "decides games" | `DepthWell` (mode `mechanism`) | "The handful of states it gets wrong are exactly the ones that decide games. Averages hide it — the error is *diluted* away by all the ordinary positions it gets right." |
| 15 | Verdict: it passed the check, yet wasn't good enough to plan with. | | **Key point 3, the verdict.** The question card from scene 4 returns: **Passed the check → good enough to plan with?** The left side keeps its ✓ **PASSED**; the right side stamps **NOT ENOUGH ✗** in rose, small sub-label "on this game" | `QuestionCard` (mode `verdict`) | "**if a result-check passes, does that actually mean the result is right?** The answer, it turns out, is "not necessarily""; "Prediction accuracy and play-adequacy come apart, cleanly and reproducibly." |
| 16 | Even with the rule in its examples, it stayed blind to it. | | Example cards with crowned floor positions fly into the code card one after another ("examples · fresh data each pass"); the code card's floor stays rose. Small counter "refinement passes: 6", tag "rule in the data ✓ · rule in the code ✗" | `DepthWell` (mode `repair`) | "the synthesized model stays rule-blind even when the rule is present in its training trajectories with near-certainty [...] after six refinement passes the model still hasn't encoded it"; "the model faithfully encodes rules it is *told*, and does not reliably infer rules it is only *shown*." |
| 17 | A check vouches for a model where you sample, not where it's used. | | Split labels on the shaft: the upper half, where the dashed rays end, lights a soft green "where you sample"; the floor, where the glow pools, reads "where it's used". "sample" and "used" in the accent | `KeyQuote` over `DepthWell` still | "It certifies the model exactly where your samples land, and competent behaviour systematically lands somewhere else"; "measure adequacy **on the distribution it will actually be used on**, not on a convenient random one." |
| 18 | So test where it's used, and put the rule in the spec. | | A ray now falls along the glow to the floor and ticks the floor (test where it's used); the struck-out spec line is written back in, the rose floor turns back to the gold crown and the chip returns to `truth`. No meter and no number in this scene: the article reports no result for the repaired spec | `DepthWell` (mode `fix`) | "measure adequacy **on the distribution it will actually be used on**"; "And when correctness depends on a rule, put the rule in the spec — don't hope the system infers it." |
| 19 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, "A World Model Can Pass Every Test and Still Lose". Credit line: "Game lengths and results: code-world-models (open repo) · preprint arXiv:2607.14169" | outro | — |

**Word count (EN):** 12 + 12 + 11 + 11 + 7 + 10 + 10 + 11 + 12 + 9 + 11 + 11 + 12 + 12 + 12 + 12
+ 13 + 12 + 3 = **203 caption words**. Spoken, with the digits read out ("a hundred percent",
"two and a half percent", "ninety-eight percent", "point four oh four", "point four nine five")
and the URL, about **224 words: ~80 s of speech at 2.8 words/s, ~82-84 s with scene breaths**.
Set `targetSeconds: 82` (lint allows ±20 %), hard ceiling 85 s.

**Word count with the story (added 2026-10-21: story):** + 16 + 10 + 8 = **237 caption words**
(story lines voiced at 5.68 + 2.88 + 2.48 s; story scene ~12.9 s; voiced cut 101.1 s).

**Caption speed** (estimated at 2.8 spoken words/s): every line ≤16 chars/s. Fastest: scene 5
("On small games with complete rules, yes.", 40 chars, ~16.0) and scene 9 (~15.6). Scene 13 is the
slowest to say (18 spoken words for 12 caption words) and reads at ~9 chars/s, which gives the
viewer time on the two numbers. If the voiced scene 5 comes in faster, add a 0.3 s hold rather
than rewording.

**If the voiced cut runs past 85 s, cut in this order** (never touch scenes 4, 7, 13, 15):
1. Scene 16's narration (−12): keep its visual silent for ~1.5 s; the "put the rule in the spec"
   line in scene 18 still lands.
2. Scene 2, second sentence → "A planner searches it." (−2).
3. Scene 3, "replay random games." (−3): the dashed rays carry it.

## Notes for the build

- **`DepthWell` (bespoke, carries the whole video).** Pure `frameState` + render split, built on
  the sequel's `ReachMap` layers so the two videos read as one series (same dashed-ray style,
  same indigo glow, same rose overlay, same corner chip, same spark-free calm motion).
  - **shaft**: vertical, inside the stage (y 280-1280), ~600 px wide, depth linear in moves 0-100;
    left-wall ticks `25 · 50 · 75`; floor line "move limit · 100".
  - **samples**: dashed rays, one per random game, lengths = `random_lengths` of army5x5a in
    `results/divergence.json` (30 games, mean 32 moves, 1 of 30 reaching 100). Small horizontal
    jitter so they fan rather than overlap; ✕ at each end; a green tick at the lip per ray in
    `gate` modes.
  - **reach glow**: soft indigo field along `competent_lengths` (30 games, mean 52, 13 of 30
    reaching 100), accumulating on the floor. It must read at phone size.
  - **floor**: truth = gold crown + "more pieces wins"; model = translucent rose overlay
    "draw"; in `mechanism` the overlay squares under the glow flush to solid red.
  - **board**: 5×5, general / infantry / cavalry glyphs drawn from brand tokens (no chess-set
    imagery); positions illustrative.
  - **spec card**: two rules in words; the material-at-cap line in the accent; struck out in
    `omit`, rewritten in `fix`.
  - modes: `hook`, `gate`, `rule`, `random`, `competent`, `omit`, `accuracy`, `mechanism`,
    `repair`, `fix`.
- **`WinRateMeter` (bespoke, scene 13; also the small HUD in scenes 1 and 18).** The sequel's
  meter restyled as the article's own CI figure: x axis 0.35-0.55, two rows (fair / this model),
  dot + whiskers + value label, gap bracket "play cost 0.091". Values exactly as the article
  writes them; never an interpolated number on screen when the needle rests.
- **`QuestionCard`**: reuse the sport-from-motion-laya question card with a stamp slot (YES /
  NOT ENOUGH ✗).
- **Real data extraction (CPU only, no model calls):** a small `scripts/extract-lengths.py` that
  reads `results/divergence.json` from `code-world-models@origin/main` and writes
  `public/lengths.json` (`random`, `competent`, army5x5a only). Commit the JSON, not the repo.
- **Which numbers belong where (see factcheck.md):**
  - `100%` = gate transition accuracy of the rule-omitting model, when its sample misses the rule.
  - `≥98%` = state accuracy on the distribution the planner visits.
  - `2.5%` = random games the rule decides (76 of 3000). Not the 5.2% that merely reach the cap.
  - `~50%` = competent games the rule decides (the article's "roughly half").
  - `0.495` / `0.404` / `0.091` = Panel A (fair baseline / hand-written rule-blind stand-in /
    play cost), win rates counting draws as half. `0.345` = Panel B, the synthesized pipeline,
    shown only in the footnote.
  - Not used: the danger law and its curve, the seed-clustered CI [0.065, 0.117], Beacon and the
    belief-side results, the coverage bound. All in the article.
- **Spoken forms:** "100%" → "a hundred percent"; "2.5%" → "two and a half percent"; "98%" →
  "ninety-eight percent"; "0.404" → "point four oh four"; "0.495" → "point four nine five";
  "AI-written" as written. Captions keep the article's digits.
- **Words to keep on screen** (labels, not captions): `CHECK PASSED · 100%`, `GATE · 100%`,
  `real game` / `code`, `move limit · 100`, `more pieces wins`, `model: draw`, `truth`,
  `model · rule left out`, `≥98% right · where the planner goes`, `fair baseline 0.495`,
  `this model 0.404`, `play cost 0.091`, `where you sample` / `where it's used`. No "CWM",
  "MCTS", "transition accuracy" or "army5x5a" on screen; the jargon stays in the article.
- **Left out on purpose:** the danger law (`danger = play_cost × (1 − rarity)^N`), the
  "no learner can recover it" theorem, Beacon and the poker results, DAgger details, the
  coverage bound. A natural sequel hook is the robot/door video, which picks up exactly where
  scene 14 ends; no voiced pointer to it (the outro card is the template's).
- **Illustrative, not claims:** board positions, the order and jitter of rays, the shape of the
  glow, the position squares in scene 12 (only the ≥98% is data), the example cards and counter
  in scene 16 (only "six" is data), the "test where it's used" ray and the floor turning gold again in
  scene 18 (no repaired-spec result is claimed: the article reports none; the paper's
  complete-rules control is near parity, 0.471, but the video shows no number there).
- ES cut: pending (EN-only for now).
