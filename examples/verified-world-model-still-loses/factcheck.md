# Fact-check: A World Model Can Pass Every Test and Still Lose (EN vertical) · draft v1.0

Source: personal-website `origin/main:src/content/blog/en/verified-world-model-still-loses.md`
(pubDate 2026-07-19). Data cross-checked against the open repo `code-world-models@origin/main`:
`docs/paper/main.tex`, `results/play_cost_ci.json`, `results/play_cost_synth_mini.json`,
`results/divergence.json`, `docs/specs/2026-06-25-cwm-rare-rule-gap-design.md`.

Every spoken claim and every number or claim shown on screen, with the article sentence it rests
on. Illustrative visuals are listed at the end.

## Narration

| # | Claim (spoken) | Where | Article sentence |
|---|---|---|---|
| 1 | "An AI-written world model passed its check at 100%." | hook | description: "a code world model that passes its gate at 100% accuracy"; "passes the gate at **100% transition accuracy**" |
| 1 | "It still lost." | hook | title "A World Model Can Pass Every Test and Still Lose"; "and yet **loses systematically at play**" |
| 2 | "AI writes the game's rules as code. A planner searches that code." | setup | "you ask it to **write the game's rules as a Python program** [...] Then a classical planner (Monte Carlo Tree Search) plays *against that synthesized program*." |
| 3 | "First, a check: replay random games. Every move must match: 100%." | gate | "the model is *refined* until it reaches 100% transition accuracy on a batch of random play-throughs — predicted next-state, legal moves, outcome, all matching the true game." |
| 4 | "Does passing it make the model good enough to plan with?" | question | "**passing that gate means the model matches the truth on random play. Does it mean the model is good enough to plan with?**" |
| 5 | "On small games with complete rules, yes." | null | "on small, fully-specified games, the gate *is* enough. [...] whenever a synthesized model passed the gate, it was also correct on the states the planner actually visits. No gap." |
| 6 | "So I gave a small chess game one extra rule." | rule | "I took a small generalized-chess game *from that same DeepMind paper* (`army5x5a` [...]) and added one rule" |
| 7 | "At the move limit, the side with more pieces wins." | rule | "if the game reaches a long move cap with both generals still alive, the player with more material wins instead of drawing." (paper: "the player with more pieces wins"; cap = 100 plies) |
| 8 | "Random games blunder early." | random | "random games end early, by blunder." See note C. |
| 8 | "The rule decides just 2.5% of them." | random | "Under *random* play, that rule decides the game about 2.5% of the time" (paper: r = 0.0253, 76 of 3000 random games) |
| 9 | "Good play survives to the limit. There the rule decides about half." | competent | "Under *competent* play it decides roughly half of all games, because good play survives to the cap." See note C. |
| 10 | "Then I left that rule out of the spec." | omit | "Now omit that rule from the spec and synthesize a world model." |
| 11 | "When the random games missed it, it still passed at 100%," | gate | "passes the gate at **100% transition accuracy**"; "the synthesized model passes the gate *only* when the rare rule happens to be absent from its sample". See note A. |
| 12 | "and was at least 98% right on positions the planner visits." | accuracy | "is **≥98% accurate** on the exact distribution of states the planner visits" |
| 13 | "At play it lost: win rate 0.404; a fair baseline gets 0.495." | meter | "(win rate 0.404 vs 0.495 for a calibrated fair baseline — a *play cost* of 0.091, with non-overlapping 95% confidence intervals" ; data: `play_cost_ci.json` fair 0.49479, blind 0.40375. See notes A, B. |
| 14 | "The few positions it gets wrong are the ones that decide games." | mechanism | "The handful of states it gets wrong are exactly the ones that decide games." |
| 15 | "Verdict: it passed the check, yet wasn't good enough to plan with." | verdict | "**if a result-check passes, does that actually mean the result is right?** The answer, it turns out, is "not necessarily""; "Prediction accuracy and play-adequacy come apart, cleanly and reproducibly." Scoped to this game by scene 5 ("on small games with complete rules, yes") and the on-screen "on this game". |
| 16 | "Even with the rule in its examples, it stayed blind to it." | repair | "Can you *repair* the gap by feeding the model examples of the rule? [...] It doesn't work. Across the board, the synthesized model stays rule-blind even when the rule is present in its training trajectories with near-certainty" |
| 17 | "A check vouches for a model where you sample, not where it's used." | lesson | "It certifies the model exactly where your samples land, and competent behaviour systematically lands somewhere else"; "measure adequacy **on the distribution it will actually be used on**, not on a convenient random one." |
| 18 | "So test where it's used, and put the rule in the spec." | lesson | "measure adequacy **on the distribution it will actually be used on**"; "And when correctness depends on a rule, put the rule in the spec — don't hope the system infers it."; "complete the specification before you synthesize." |
| 19 | "More at javieraguilar.ai" | outro | — |

## Numbers and claims on screen

| On screen | Where | Source |
|---|---|---|
| `CHECK PASSED · 100%`, `GATE · 100%`, "next state · legal moves · outcome" | 1, 3, 11 | "100% transition accuracy on a batch of random play-throughs — predicted next-state, legal moves, outcome" |
| "when no sampled game reached the rule" | 11 | "passes the gate *only* when the rare rule happens to be absent from its sample" |
| Three game chips tic-tac-toe · small chess · Trike, "no gap where the planner goes" | 5 | "Tic-tac-toe, a generalized-chess variant (`army5x5a`, below), Trike — whenever a synthesized model passed the gate, it was also correct on the states the planner actually visits. No gap." |
| 5×5 board, general / infantry / cavalry | 6-7 | "a 5×5 board with general, infantry, and cavalry pieces, won by capturing the enemy general" |
| `move limit · 100` | all shaft scenes | article: "a long move cap"; paper: "if the game reaches the ply cap (100 plies) with both generals alive, the player with more pieces wins" |
| Ray lengths (30 random games, 1 reaches the floor) and glow (30 competent games, 13 reach the floor) | 1, 3, 8, 9, 11, 14 | `results/divergence.json`, army5x5a: random mean 32.1, 1/30 at 100; competent mean 51.8, 13/30 at 100 (paper: "43% of games run to the 100-ply cap versus 3% under random play (mean length 52 vs 32 plies)") |
| `2.5%` "random games the rule decides" | 8 | "decides the game about 2.5% of the time"; paper r = 0.0253 (76/3000) |
| `~50%` "competent games the rule decides" | 9 | "decides roughly half of all games" |
| Spec line struck out; chip `model · rule left out`; rose floor "model: draw" | 10-17 | "omit that rule from the spec"; base rules make a cap game a draw ("the player with more material wins instead of drawing") |
| `≥98% right · where the planner goes` | 12 | "is **≥98% accurate** on the exact distribution of states the planner visits" |
| `fair baseline 0.495 [0.475, 0.515]`, `this model 0.404 [0.384, 0.424]` | 13 | table: "Fair baseline (truth vs truth) 0.495 [0.475, 0.515]"; "Rule-blind instrument (Panel A) 0.404 [0.384, 0.424]" |
| `play cost 0.091` | 13 | "a *play cost* of 0.091"; "**play cost** is just the win rate the flaw gives up: the fair baseline's win rate minus the flawed model's" |
| "95% intervals don't overlap" | 13 | "with non-overlapping 95% confidence intervals"; figure caption: "The 95% intervals don't overlap — the 0.091 play cost isn't a sampling artifact." |
| "draws count as half a win" | 13 | Not in the article; from the data: fair W 780 / D 815 / L 805 of 2400 → (780 + 815/2) / 2400 = 0.4948; blind W 725 / D 488 / L 1187 → 0.4038. See note B. |
| "hand-written stand-in; the real synthesis pipeline lost more (0.345)" | 13 | "To be sure this wasn't an artifact of my hand-written stand-in, I also ran it end-to-end through the actual synthesis pipeline [...] it loses at play — with a cost at least as large as the one above."; table "Synthesized, rule-absent (Panel B) 0.345 [0.317, 0.374] · 0.154". See note A. |
| Wrong squares only on the floor, under the glow | 14 | "The handful of states it gets wrong are exactly the ones that decide games."; figure caption: "The deep region where competent play lives — and where the rare rule decides the game — is almost never reached, so the gate never tests it." |
| `NOT ENOUGH ✗ · on this game` | 15 | "Prediction accuracy and play-adequacy come apart"; scoped by the null result |
| "refinement passes: 6", "rule in the data ✓ · rule in the code ✗" | 16 | "the gate accuracy sits far below 1.0, meaning the rule *is* in the data, and after six refinement passes the model still hasn't encoded it" |
| `where you sample` / `where it's used` | 17 | "It certifies the model exactly where your samples land, and competent behaviour systematically lands somewhere else" |
| Credit: "code-world-models (open repo) · preprint arXiv:2607.14169" | 19 | "The code and full reproduction log are open"; "now on arXiv (arXiv:2607.14169)" |

## Notes

- **A. Three different arms, kept apart.** (1) The *synthesized* rule-omitting model is what
  passes the gate at 100% (when its sample misses the rule) and is ≥98% state-accurate.
  (2) The 0.404 win rate / 0.091 play cost belong to the *hand-written, play-equivalent
  stand-in* (paper: "The rule-blind agent is hand-written base army5x5a"; the article's table
  calls it "Rule-blind instrument (Panel A)"). (3) The synthesized pipeline end-to-end loses
  more: 0.345, play cost 0.154 (Panel B). The article's own bullet list joins (1) and (2) as
  "a world model that..."; the video follows the article in the narration and discloses the
  stand-in and Panel B in scene 13's footnote, so no spoken number is attributed to the wrong
  arm. "When the random games missed it" (scene 11) carries the article's hedge that the
  synthesized model passes only when the rule is absent from its sample (9 of 20 seeds in
  Panel B; at N = 40 and r = 0.0253 the miss probability is (1 − r)^40 ≈ 0.36).
- **B. "Win rate" counts draws as half.** Verified in `play_cost_ci.json`. The narration never
  says "won 40% of its games" (actual outright wins are 725/2400 ≈ 30%); it says "win rate 0.404",
  the article's term, and the footnote states the convention.
- **C. "Blunder early" / "about half".** The article's wording. Data nuance: in
  `divergence.json` the *median* length is the same for random and competent army5x5a games
  (28 vs 28); what separates them is the cap-hit rate (1/30 vs 13/30) and the mean (32 vs 52).
  The video draws the real lengths, so the screen shows exactly that (most random rays end
  shallow, a few run long; competent games split into short wins and floor-reaching games).
  "About half" comes from the design spec's 12 of 24 MCTS-vs-MCTS games; see article issue 3.
- **D. Hook "AI-written".** The model is synthesized by an LLM (paper: GPT-5.4-mini in Panel B).
  No model name on screen; the article does not name it either.
- **E. Scope of the verdict.** Scene 5 (the null: small, fully-specified games pass and play
  fine) is voiced so the verdict reads as "not necessarily", as the article concludes, not as
  "the gate never works".

## Issues found in the article vs its data (not used in the video; for Javier)

1. **Danger-law figure scale.** The figure's y axis runs 0-0.5 and the curve starts at 0.5, i.e.
   it is drawn with play_cost = 0.5 (Beacon's value), while the army5x5a rule's play cost is
   0.091 (the paper's danger table uses a round 0.12). At "our rule (2.5%)" the figure shows
   harm ≈ 0.18; the paper's own number at N = 40 is 0.043. The annotation "harm ≈ full play
   cost while the rule is too rare for a size-N gate to catch" also sits oddly next to the rule:
   at r = 0.0253, N = 40 the gate-miss factor is 0.36, so the rule is on the threshold's slope
   (the paper's "danger zone"), not on the plateau. The caption's "N = 40" matches the paper.
2. **Figure label "Rule-blind CWM" for 0.404.** That arm is the hand-written instrument, as the
   table below it says ("Rule-blind instrument (Panel A)"). The prose discloses it two
   paragraphs later; the figure label alone reads as the synthesized model.
3. **"Decides roughly half" of competent games** rests on 12 of 24 MCTS games (design spec).
   The later `divergence.json` run (30 games, 300 sims) has 13/30 = 43% of competent games even
   reaching the cap, and the rule only decides cap games with unequal material, so in that
   sample it decides at most 43%. Different budgets, small samples; "roughly" covers it, but the
   two measurements are not reconciled anywhere.
4. **"Random games end early, by blunder."** True of the cap-hit rate (3% vs 43%) and the mean
   (32 vs 52 moves), not of the median, which is 28 for both in `divergence.json` (the paper
   notes the median is unstable under the bimodal distribution). Fine as plain language.
5. **Adversarial belief check called future work.** The article says "What's still missing —
   and what I'd flag as future work — is an *adversarial* belief check". The paper on
   `code-world-models@origin/main` now has a section "Policy-guided and adversarial belief
   checks close the Beacon gap" with `results/beacon_adversarial_gate.json`. If that version is
   (or will be) the public preprint, the article's last section is out of date. Not in the video.

## Illustrative, not claims

- Board positions and glyphs; the order, jitter and timing of the rays (only their lengths are
  data); the shape and colour of the glow.
- The position squares in scene 12 (only "≥98%" is data); which squares flush red in scene 14.
- The example cards in scene 16 (only "six refinement passes" is data).
- Scene 18's ray along the glow and the floor turning gold again: an illustration of the
  article's advice, not a measured repair; no number is shown.
- The question-card stamps (YES / NOT ENOUGH) restate scenes 5 and 15.

## Build notes (v1.0 render)

On-screen wording added while building, each a restatement of a row above (no new claims):

- Spec card: "game rules · the spec", "capture the enemy general → win" and the accent rule
  "at move 100, both generals alive: / more pieces wins (not a draw)" (scene 7 row); struck out
  in scene 10, "✓ back in" in scene 18 (illustrative, no result claimed).
- Scene 7: "move 100 · both generals alive ✓" over the board (paper: cap = 100 plies).
- Scene 5 chips: "check ✓ · no gap ✓" per game (the null result row).
- Scene 13 subtitle "at play · dot = win rate · bar = 95% interval"; footnote prefixed "0.404:" so
  the stand-in disclosure attaches to the right number (note A).
- Scene 14 labels "checked" (upper shaft) / "decides games" (floor); scene 16 "model code",
  "move 100 → draw", "example" cards, "refinement passes: 0…6" (only six is data),
  "rule in the data ✓" / "rule in the code ✗"; scene 18 "tested where it's used" (the advice).
- Rays: the 30 random lengths in scenes 1, 3, 8, 14, 17; scene 11 replays the 29 that ended
  before the limit ("when no sampled game reached the rule"). Glow: the 30 competent lengths.
  Data in `src/data/lengths.ts`, written by `scripts/extract-lengths.py`.
- Spoken forms (TTS only): "a hundred percent", "two and a half percent", "ninety-eight
  percent", "point four oh four", "point four nine five", "javier aguilar dot A I"; scene 17 is
  voiced with an extra comma ("a model, where you sample") so its caption reads under 17 chars/s.
- Length: 87.8 s voiced (script target 82, ceiling 85; the task's cap is 90). No narration cut.
