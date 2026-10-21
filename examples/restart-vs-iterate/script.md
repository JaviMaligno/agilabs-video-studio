# Let the Loop Iterate — article video (EN) · script draft v1.0

Article: restart-vs-iterate (javieraguilar.ai, EN, `pubDate` 2026-07-17, **corrected 2026-07-19**:
finding 4 reframed with the matched-subset counterfactual; this script follows the corrected text
on `origin/main`). Vertical 9:16, target **~82 s** (ceiling 85 s), 206 spoken words. ES column
left empty (EN-only for now). Voice: the template default.

Data on screen: the article's table and counts, re-checked against the experiment's per-round
artifacts (`JaviMaligno/CooperBench`, branch `experiment/restart-loop`, `logs/R-*`); the tower
lanes replay real per-round failing-test counts of single runs (see "Data for the visuals").

## Central visual metaphor: the code tower

The agent's working tree is a **tower of code blocks** standing on a dark stage. Under it, a thin
**test strip**: one light per test that matters, teal = passing, rose = failing, with a small
"failing: N" readout. Rose blocks in the tower are the code the failing tests point at. A round
counter (four pips) sits above the tower.

Everything the experiment compares is something you do to that tower between rounds:

- **Iterate**: the tower stays; a hand swaps the rose blocks out one at a time, and the strip turns
  teal light by light.
- **Restart**: the tower collapses to the floor and is rebuilt from nothing; the rose blocks come
  back in new places, the strip never clears.
- **The restart button**: a big round button with a three-position **scope dial**
  (*one file · a folder · everything*). Turned to *one file*, it acts like a **scalpel**: one block
  slides out and a clean one slides in. Turned to *everything*, it is a **wrecking ball**: the
  whole tower goes. "Scalpel vs. wrecking ball" is the article's own image.

The video's question card (top band) carries the map: **Start over?** → **Same budget. What
changes?** → **Who won?** → **Who knew what to throw away?** → verdict.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | Your coding agent is stuck. Should it start over? | | **Cold open.** One code tower, three blocks rose, test strip half rose. A hand patches a block; it turns rose again; the tower wobbles. Question card drops in: **Start over?** A big restart button pulses beside the tower. | intro + bespoke `CodeTower` (mode `hook`) | "when a coding agent's attempt is going badly, don't keep patching the sinking ship" |
| 2 | Andrej Karpathy put it as: let the loop restart. | | The phrase *let the loop restart* writes itself across the top, attributed small "agent folklore · Andrej Karpathy's phrasing". On "restart" the button is pressed: the tower collapses and starts rebuilding. | `KeyQuote` over `CodeTower` | "There's a piece of agent folklore, crystallized by Andrej Karpathy as *"let the loop restart"*: … throw the attempt away and let it start fresh." |
| 3 | I built a loop on real code: write a feature, see the tests, try again. | | A circular loop draws itself around the tower: **write** → **test** (the strip lights up) → **feedback** (a small card "2 failing" flies to the agent) → back to **write**. Tag under the stage: "29 features · 5 real codebases · 2 models". | bespoke `CodeTower` (mode `loop`) | "29 single-feature tasks across 5 real repositories, two model tiers"; "a **loop with a visible evaluator** … shows the agent the results (pass/fail counts plus the failing tests' output); then comes the next round" |
| 4 | Four rounds, same budget. All I changed was what happens in between. | | **Key card: what is tested.** Four round pips in a row, each with an identical small coin stack ("same budget"). The gaps between the pips light up in the accent with a bracket: **only this changes**. Card: **Same budget. What changes?** | `CodeTower` (mode `rules`) | "up to **K = 4 rounds**"; "Every policy gets the same K, the same per-round compute caps, and the *same feedback format* — so the only variable is what happens **between** rounds" |
| 5 | Iterate: keep the code, read the failures, and patch. | | Three lanes appear, each with its own tower. Lane 1 **ITERATE** plays: tower stays, rose blocks swapped one by one; strip readout **failing: 4 → 1 → 0** ✓ over rounds 1-3 (real run). | `CodeTower` (mode `lanes`, lane 1) | "**ITERATE** — the classic loop: code and context accumulate; the agent patches its own work with the test results in hand." |
| 6 | Restart: wipe it all and start clean every round. | | Lane 2 **RESTART** plays the same feature: each round the tower collapses and rebuilds; rose blocks land in new spots; readout **3 → 3 → 4 → 3**, ✗ after round 4 (real run). | `CodeTower` (mode `lanes`, lane 2) | "**RESTART-FRESH** — the literal Karpathy reading: each round starts from a clean checkout with a fresh context. No memory of prior attempts." |
| 7 | Or a restart button: the agent picks when, and how much to throw away. | | **Key card: what makes this arm different.** Lane 3 **BUTTON**: the restart button lands beside its tower; the scope dial clicks through *one file · a folder · everything*. Label: "agent's choice · costs nothing". | `CodeTower` (mode `lanes`, lane 3) | "**AGENT-DECIDES** — … the agent holds an explicit **restart tool with scope** — `restart(file \| directory \| all-my-work)` — presented as a legitimate, cost-free option. It chooses when to discard and *how much*." |
| 8 | Iterating won. My stronger model solved 86% of features; clean restarts, 69%. | | Card: **Who won?** Lanes 1-2 turn into two tall bars (strong model, gpt-5.4): **86%** (accent) vs **69%**. Footnote: "3 seeds · 17–2 · p = 0.001". | `BarCompare` (lanes → bars) | Table: "iterate … 86% [79–90]"; "restart-fresh … 69% [69–69]"; "gpt-5.4 iterate wins 17–2 over restart-fresh (p=0.001)" |
| 9 | The weaker model leaned the same way. | | A smaller pair of bars below (gpt-5.4-mini): **74%** vs **63%**, muted, tag "leans · p = 0.078". | `BarCompare` (second row) | "mini leans the same way (15–6, p=0.078)"; table "74% [72–76] … 63% [62–66]" |
| 10 | With the button, the strong model reached 91%, its best. | | Lane 3's bar rises past the iterate bar: **91%**. | `BarCompare` (third bar) | "Agent-decides tops both tiers (91% for gpt-5.4, its best; 75% for mini)." |
| 11 | It didn't hurt, but its edge over iterating isn't proven. | | A bracket between the 91% and 86% bars, dashed: "8–4 · p = 0.39 · not significant". | `BarCompare` (bracket) | "Against pure iterate the edge is not significant (8–4, p=0.39) — so read it conservatively: the bulk of the value is in iterating; the restart *option* adds a plausible-but-unproven bonus and costs nothing." |
| 12 | The difference: how each model used it. | | Card: **Who knew what to throw away?** Bars clear; the frame splits: left **STRONG** (gpt-5.4), right **WEAK** (gpt-5.4-mini), each with a tower and a restart button. | bespoke `ScalpelVsWreckingBall` (setup) | "**The capability marker is restart *style***" |
| 13 | The strong one restarted rarely, and usually just one file. | | Left side: 7 small restart ticks appear; 5 turn into a **scalpel** that slides out a single block, 2 into a full wipe. Readout "7 restarts · 5 one file". | `ScalpelVsWreckingBall` (left) | "the strong model restarted **rarely and surgically** (7 restarts, 5 file-scoped, **3 of 4** restarted feature-runs solved)" |
| 14 | On 4 features iterating never solved, it rescued 3. A hint, not proof. | | Four feature chips under the left tower. Row "iterate": all four rose, **0/4**. Row "with the button": three turn teal, **3/4**. Small dashed stamp **n = 4 · a hint**. | `ScalpelVsWreckingBall` (left, payoff) | "Those same 4 features solve **0/4 under iterate**; the scoped restart turned three of them into wins. … at n=4 it's directional (exact p≈0.25), not significant." |
| 15 | The weak one restarted a lot, and mostly wiped it all. | | Right side: restart ticks rain down to **34**; most become a **wrecking ball** that swings through the whole tower, again and again. Readout "34 restarts · 23 everything". | `ScalpelVsWreckingBall` (right) | "the weak model restarted **often and destructively** (34 restarts, 23 of them `scope=all`, only **1 of 14** restarted feature-runs solved)" |
| 16 | Iterating failed nearly all of those too: the wipe-outs were a symptom, not the cause. | | Fourteen feature chips under the right tower. Row "with the button": **1/14** teal. Row "iterate": **2/14** teal. All the other chips were already rose before the ball swung: a label **already lost** sweeps across them. The ball fades; stamp **symptom, not cause**. | `ScalpelVsWreckingBall` (right, payoff) | "Those same 14 features solve just **2/14 under iterate** … Broad restarts didn't destroy winnable work; the agent razed everything *because* the feature was already lost."; "the weak tier's broad restart is the *signature* of an agent that has already lost, not the mechanism of its loss" |
| 17 | The verdict, on these tasks: keep the code and iterate. | | **Verdict card**, full frame. Title **VERDICT**. Line 1 lands with a stamp: ✓ **Keep the code. Iterate.** Small under it: "existing codebases · 4 rounds · tests visible". | bespoke `VerdictCard` | "*in the regime I measured* — feature-sized tasks on existing codebases, four rounds, tests visible — restart-as-resampling loses to iteration"; "Default to **iterate with visible tests**" |
| 18 | Restart only if you know what to throw away. | | Line 2 lands: the scalpel icon + **Restart only if you know what to throw away.** | `VerdictCard` | Title: "Restarting Only Pays If You Know What to Throw Away"; "the restart that *does* pay is scoped, informed, and rare" |
| 19 | Here, only the stronger model knew. | | Line 3: the two tower icons, strong one with a teal check, weak one greyed. | `VerdictCard` | "If you add a restart affordance, expect **only your stronger models to wield it well**"; "it's the strong tier's scoped restart that actually pays" |
| 20 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Let the Loop Iterate". | outro | — |

**Word count (EN):** 9 + 9 + 15 + 12 + 9 + 9 + 14 + 12 + 7 + 10 + 10 + 7 + 10 + 13 + 11 + 15 +
10 + 9 + 6 + 3 = **200 caption words**, **206 as spoken** (86%, 91% and the URL expanded):
about 74 s of speech at ~2.8 words/s, **~82 s** with line gaps, card changes and the outro hold.
Set `targetSeconds: 82`.

If the TTS render runs over 85 s, cut in this order (never scenes 4, 7, 14, 16-18):
1. Scene 19 (−6 words; the verdict card keeps the greyed weak tower silently).
2. Scene 12 (−7; the split frame and its card carry the turn).
3. Scene 9 narration (−7; the muted mini bars stay with their "leans" tag).

**Caption speed (estimate at 2.8 words/s):** every narrated line ≤ 16.6 chars/s (highest: scene 8,
16.6; scenes 5 and 13, 16.5). Scenes 8, 10 and 14 carry spoken forms. `npm run lint` after TTS is
the gate.

## Spoken numbers (complete list)

| Spoken | Scene | Why it stays in the voice |
|---|---|---|
| "four rounds" | 4 | Setup that defines the budget; round. |
| "eighty-six percent … sixty-nine" | 8 | The headline result, said once, as you would to a colleague. |
| "ninety-one percent" | 10 | The best cell; immediately hedged in scene 11. |
| "four … three" | 14 | The rescue count, the small n is the point of the hedge. |

No other figure is voiced. "Leaned the same way", "rarely", "a lot", "mostly", "nearly all" are
word forms of on-screen numbers (see factcheck). No p-value is spoken.

## Notes for the build

- **`CodeTower` (bespoke, the spine).** A stack of ~12 rounded code blocks (each a few faint
  monospace lines, no readable code), a test strip of ~6 lights under it with a "failing: N"
  readout, four round pips above. Modes: `hook`, `loop`, `rules`, `lanes` (three narrow towers
  side by side, ~290 px each inside the 936 px stage). State per frame: block colours, collapse
  progress (blocks fall with a short stagger and a soft bounce), rebuild progress, readout value.
  Rose blocks are illustrative of "the code the failing tests point at"; their number follows the
  run's failing count only loosely (the strip readout carries the exact value).
- **Restart button + scope dial.** One round button (accent ring) with a three-notch dial
  labelled *one file · a folder · everything* (the article's `file | directory | all-my-work`, in
  plain words). In scenes 13-16 the dial position decides the animation: *one file* → scalpel
  (one block slides out, a clean one slides in), *everything* → wrecking ball (whole tower
  collapses). *A folder* is shown on the dial but never animated: no restart in the logs used it.
- **`ScalpelVsWreckingBall` (bespoke, the mechanism of finding 4).** Split frame, two towers. Left:
  7 restart ticks, 5 drawn as scalpel cuts and 2 as full wipes (the real split), then the 4
  feature chips (iterate 0/4 → with button 3/4). **Of the 3 rescues, 2 came from file-scoped
  restarts and 1 from a full wipe** (see factcheck → "Article vs data"); draw the chip rescue
  without tying each chip to a scalpel. Right: 34 ticks, 23 wrecking-ball swings and 11 scalpel
  cuts, then 14 chips: 1/14 with the button, 2/14 under iterate, "already lost" across the rest.
- **`VerdictCard` (bespoke, small).** Full-frame card, three lines landing one per beat, stamp on
  line 1, scalpel icon on line 2, two tower icons on line 3. Same look as the verdict card in
  `sport-from-motion-laya` (scene 18b) so the series reads consistently.
- **Bars (scenes 8-11).** Standard `BarCompare` re-skinned so the bars grow out of the lanes'
  towers (the tower shrinks into the base of its bar). Strong row: 86% (accent), 69%, then 91%;
  weak row muted, smaller: 74%, 63%. `display` strings exactly as the article: "86%", "69%",
  "91%", "74%", "63%". Restart-informed (69% / 79%, one seed) is **not shown** (see factcheck).
- **Numbers on screen, exactly as the article writes them:** "29 features · 5 real codebases ·
  2 models", "4 rounds", "86%", "69%", "3 seeds · 17–2 · p = 0.001", "74%", "63%", "p = 0.078",
  "91%", "8–4 · p = 0.39 · not significant", "7 restarts · 5 one file", "0/4", "3/4", "n = 4",
  "34 restarts · 23 everything", "1/14", "2/14". Lane readouts "4 → 1 → 0" and "3 → 3 → 4 → 3"
  are real single-run failing-test counts, labelled "one real run" in small type.
- **Names:** model labels as the article: gpt-5.4 (strong) and gpt-5.4-mini (weak). Andrej
  Karpathy is named in narration and on the quote line as the article does; no photo, no logo.
  The benchmark's repositories are public open-source projects, but none is named on screen:
  features are plain chips. The only brand on cards, poster and metadata is AGILabs.
- **Spoken forms:** "86%" → "eighty-six percent"; "69%" → "sixty-nine"; "91%" → "ninety-one
  percent"; "On 4 features … rescued 3" → "On four features … rescued three";
  "javieraguilar.ai" → "javier aguilar dot A I".
- Visuals are chosen for impact, not as a literal replay: the tower, blocks, scalpel and wrecking
  ball are stylised; the lanes replay one real run each, the bars and chips are the article's
  aggregates. The rigour lives in the article and the repo. Narration and every number stay
  faithful to the article.
- **Credits in the outro:** "Tasks: CooperBench-derived · code: github.com/JaviMaligno/CooperBench".
- ES cut: pending (EN-only for now).

## Data for the visuals (from `logs/`, branch `experiment/restart-loop`)

Re-computed from `result.json` + `round_*/decision.json` (scope of each restart) with the
article's run names (`R-{large,mini}-{policy}[-s2|-s3]`):

| What | Value | Matches article |
|---|---|---|
| Strong (large) agent-decides restarts | 7 (file 5, all 2), on 4 feature-runs, 3 solved | yes |
| Same 4 feature-runs under iterate | 0 / 4 solved | yes |
| Weak (mini) agent-decides restarts | 34 (all 23, file 11), on 14 feature-runs, 1 solved | yes |
| Same 14 feature-runs under iterate | 2 / 14 solved | yes |
| Lane 1 (iterate), one run: large, seed 3, a click feature | failing per round 4 → 1 → 0, solved in round 3 | real run |
| Lane 2 (restart), same feature and seed | failing per round 3 → 3 → 4 → 3, unsolved | real run |
| Scalpel example (optional for scene 13): large, seed 1, a chi feature | one-file restarts in rounds 3 and 4; failing 2 → 4 → 4 → 0, solved; iterate on the same run 4 → 4 → 3 → 4, unsolved | real run |
| Wrecking-ball example (optional for scene 15): mini, seed 1, a chi feature | three `all` restarts; failing 3 → 3 → 3 → 3, unsolved; iterate also unsolved | real run |
