# The Wall and the Circle — article video (EN) · script draft v1.1 (independent review)

Article: infer-the-rule-in-one-dimension ("An LLM Can Infer the Rule You Forgot — in One
Dimension", javieraguilar.ai, EN, published 2026-08-30). Vertical 9:16, target ~58-62 s,
140 spoken words (top of the 75-140 range, over the 45 s default: the story needs both
halves and the positive control). ES column left empty (EN-only).
Data on screen: the article's figures, plus real artifacts and contact points from the
experiment repo (`JaviMaligno/code-world-models`, `results/` committed JSON), see build notes.

## Central visual metaphor: the wall that heals, the circle that never closes

One dark plane, one glowing **pen** (the synthesizer). Every rule in the video is a line the pen
has to draw from evidence, and the evidence is always the same thing: small accent **sparks**
where the mover hit something the spec never mentioned.

- **The wall heals.** A cart slides on a rail toward a gap in a dashed, ghost wall at 8.0. A
  handful of sparks flash at the gap; the pen runs straight down through them and the dashed
  wall **knits shut** into a solid, glowing bar, along its *whole* height, not only where the
  sparks were (global rule, not a patch). The code line `if x2 >= 8.0:` types under it.
- **The circle never closes.** A ghost circle sits on the plane. Sparks land on its west arc
  (real landings, ~111° of the circle). The pen starts at the sparks, curves... and then
  **straightens**: it draws a vertical wall tangent to the circle, `if x >= 2.0:`. The circle's
  outline stays a dashed, open arc with a gap that never fills, however many times the video
  comes back to it.
- **Payoff.** Only when a **pin** drops on the circle's centre (the hint) does the pen sweep a
  full ring and the circle finally closes, exactly. Pull the pin and the ring dissolves.

Everything the viewer needs is in that contrast: a line it can heal, a shape it cannot close,
and the one thing (where) that closes it.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | I left a wall out of the spec. The model put it back. | | Split stage. Top half: a rail with a dashed ghost wall; sparks flash, the pen runs down, the wall **heals** into a solid glowing bar (fast, ~2 s). Bottom half: the ghost circle, pen circling at its edge | bespoke: `RuleField` (mode `hook`) | "move from board games to continuous control, and a current model *does* infer the omitted rule from a handful of examples"; "the spec ... simply **omits the wall clause**" |
| 2 | A circle? Not once. | | Bottom half: the pen tries to close the circle, the outline gets two-thirds round and **breaks off**; the dashed gap pulses. Top wall stays solid | `RuleField` (mode `hook`) | "Then give the same rule one more dimension and the whole capability disappears"; "It isn't 'never' — it's 'not once in the evidence I have'" |
| 3 | An LLM writes the physics a planner trusts. | | Full stage: a chip "LLM" (no model name on screen) writes a small code card `step(state, action)`; an arrow to a "planner" chip; the planner's cart slides on the rail. The wall clause in the spec card is struck through and the wall becomes the dashed ghost again | bespoke: `RuleField` (mode `setup`) | "A planner does random-shooting MPC against a synthesized Python model of the physics. The spec handed to the LLM pins the integrator exactly and simply **omits the wall clause**." |
| 4 | From a handful of contacts, it wrote the true rule back. | | A handful of sparks (five, illustrative count) flash at the gap; the pen heals the wall along its whole height; code types under it: `if x2 >= 8.0:` / `return [8.0, 0.0]`, the `8.0` lit in accent ("right constant") | `RuleField` (mode `heal`) | "often just a handful of contact transitions — GPT-5.x doesn't stay blind and doesn't fit a curve. It reads the failing transitions and writes the true global rule"; "Not a local patch around the observed contacts. The rule, with the right constant, valid everywhere." |
| 5 | It did that in 105 of 111 attempts. | | The healed wall shrinks to a small tile; a ring of 111 tiny wall icons fills, 105 heal solid, 6 stay dashed. Counter "105 / 111"; small label "1D rules: wall, stop" | `RuleField` (mode `tally`) + `Counter` | "Across the two one-dimensional instruments (the cart's position clamp and a pendulum's angular stop) it did this in **105 of 111 mode-containing synthesis draws**." |
| 6 | Then I gave the rule one more dimension: a circle that stops the mover. | | Camera tilts from the rail to a plane. A mover's trails sweep across it; two ghost discs; a trail entering the near disc **freezes** at its edge | `RuleField` (mode `plane`) | "a mover on a plane, two **circular regions** painted on it, and a rule that freezes the mover the moment it enters one. Same pipeline, same gate, same tolerance, same models." |
| 7 | Repair fell to 0 of 156. | | 156 tiny circle icons, every one an open dashed arc; counter "0 / 156" in the warning tone; small label "2D regions: disc, square" (the 156 pool both shapes, as the article's figure says) | `RuleField` (mode `tally`) + `Counter` | "on two-dimensional regions it recovers it in none of 156 mode-containing draws" (figure caption); "Repair collapsed to 0 of 156" (summary) |
| 8 | Mostly, it wrote a wall instead: right place, wrong shape. | | **The mechanism shot.** Real sparks (21 landings, seed 10000) on the west arc of the near disc. The pen starts along them, then straightens into a vertical line at x = 2, tangent to the circle, extending top to bottom of the plane. Code under it, from the real artifact: `if x >= 2.0:` / `return [x, y, 0.0, 0.0]`. The circle stays a dashed open arc | bespoke: `RuleField` (mode `reduce`) | "The dominant failure is **dimensional reduction**: the disc becomes a half-plane at the right location and the wrong shape — a 1D threshold, the thing that worked on the cart, applied to a rule that isn't one." |
| 9 | Eight fixes: a better prompt, flat edges, more evidence. None worked. | | Eight attempt cards fan out over the plane, one per intervention (labels from the table: "Region-first prompt, 3× budget", "Square, flat edges", "Second model family", "Band in one coordinate", "Variable named", "Stops inside", "Clamped to boundary", "Wider coverage"). Each card's pen tries the circle; each ends open, stamped "0/40" (0/3 on the model-family card; the band card stamped "not counted" in grey). On "flat edges" the square card's pen draws a *circle* on square sparks, the mirror image | `RuleField` (mode `interventions`) | "I ran eight interventions, each aimed at one candidate cause"; "None of them restores repair."; table: Region-first prompt, 3× budget 0/40; Axis-aligned square, flat edges 0/40; second model family 0/3; band 0/40 (recorded, not counted); variable named 0/40; stops inside 0/40; clamped 0/40; wider coverage 0/40; "artifacts wrote *discs* on square evidence" |
| 10 | With enough evidence, three lines of least squares find the circle every time. The model: none. | | Back to the single plane. The spark arc **widens** in three steps (111° → 129° → 185°); a thin indigo ring (least-squares fit) snaps tighter each step and locks onto the circle on "every time" (ticker 12 → 16 → 20 / 20). Beside it the pen keeps drawing the same straight wall; its ticker stays "0 / 20" at every step | `RuleField` (mode `dose`) | "I can dose the evidence until that fit succeeds on every single sample."; figure: least squares 12 → 16 → 20/20 at 111°, 129°, 185°, synthesizer 0/20 at each; "the synthesizer recovers it on none, at every dose" |
| 11 | Tell it where the circle is: it infers the radius exactly, 20 of 20. | | A **pin** drops on the circle's centre (label "centre given"). The pen sweeps a full ring from the pin and the circle **closes**, exact, solid accent. Comment from the real artifact fades in, small: `# radius inferred from the provided transitions`. Ticker "20 / 20" | `RuleField` (mode `pin`) | "Given the region's form **and** its centres, with only the radius withheld — one unknown number — the synthesizer infers it **exactly in 20 of 20 seeds**"; "One artifact even comments 'radius inferred from the provided transitions'." |
| 12 | Only the shape: zero. | | The pin lifts away (label "shape only"); the ring dissolves back into the dashed open arc. Ticker "0 / 20" | `RuleField` (mode `pin`, unpinned) | "Given the form **alone**, centres withheld: **0 of 20**." |
| 13 | Learning the rule from data is a one-dimensional bet. Anything with a shape, you still have to specify. | | Final split, mirroring the hook: top, the healed wall glowing; bottom, the open circle. On "you still have to specify" a spec card slides in and its line writes the circle in full; the circle closes. Key phrase in the accent: "one dimension" | `KeyQuote` over `RuleField` (mode `split`) | "**coverage of the boundary is the whole game, and 'the model will figure it out from the data' is a bet you can only make in one dimension.** Everything with a shape, you still have to specify." |
| 14 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, "An LLM Can Infer the Rule You Forgot — in One Dimension" | outro | — |

**Word count (EN):** 13 + 4 + 8 + 11 + 8 + 14 + 6 + 10 + 11 + 16 + 14 + 4 + 18 + 3 =
**140 words** (caption text). Spoken forms ("a hundred and five of a hundred and eleven", "zero
of a hundred and fifty-six") make it ~148 spoken words: about 53 s of speech at Javier's
~2.8 words/s, **≈58-62 s** with the 0.35 s line gaps and 0.8 s scene tails. Densest captions:
line 10 (95 chars) and line 13 (103 chars), ~14-16 chars/s once the punctuation pauses are in;
re-check both with `npm run lint` after TTS. If the render runs past ~65 s, cut "Mostly," in
line 8 and "Then" in line 6 before touching any number line; never cut "With enough evidence,"
in line 10 (without it "every time" overstates: at the default evidence the fit is 12 of 20).

v1.1 changes: cut "I left out the wall." (repeated the hook; 146 → 140 words), line 11 tightened
by one word, scene 4's spark count no longer attributed to the article's "four rows" (that
sentence is about the linear fit), scene 7 labelled "2D regions: disc, square", model chip
dropped (decision below).

## Notes for the build

- **`RuleField` (bespoke)**: one dark plane drawn from brand tokens, with a glowing pen whose
  stroke is a pure `frameState` path (progress along a polyline/arc), spark particles at contact
  points, ghost (dashed, muted) and solid (accent gradient) outlines, a code strip at the bottom
  of the stage, and small tickers. Modes: `hook` (split rail/plane), `setup`, `heal`, `tally`,
  `plane`, `reduce`, `interventions`, `dose`, `pin`, `split`. The "heal" is the wall's dash gaps
  closing from the spark outward along the whole height; the "never closes" is the circle's dash
  pattern stopping short with a pulsing gap. Can borrow the pure `frameState` + render split from
  `examples/wheres-the-ball` (`PitchPlayback`).
- **Data to extract** (one small script, e.g. `scripts/extract-rule-field.py`, writing a
  committed `src/data/rule-field.json`), all from `/Users/javieraguilarmartin1/Documents/repos/code-world-models`:
  - **Plane geometry**: `src/cwm/continuous/envs.py` `PatchField2D` defaults: discs at (3, 0)
    and (7, 0), R = 1.0, lodes at (−6, 0) and (12, 0).
  - **Sparks for scenes 8 and 10**: contact landings inside the near disc, recomputed exactly as
    `scripts/region_fit_baseline.py` `measure_arm` does (`collect_transitions(env, 40,
    seed=10000)`, keep `contact` steps landing inside `p1`). Seed 10000 has 21 landings over
    ~111° (row in `results/region_fit_baseline.json`). For the dose steps use the same seed with
    `start_arc_deg` = 120 and 240 (arms `arc120`, `arc240`: median arcs 128.9° and 185.0°).
  - **Least-squares ring**: `circle_fit(land)` from the same script per dose step (the ring's
    centre/radius per step, so it visibly tightens). The 12 → 16 → 20 tickers are the arm
    totals (`dose_arms.*.n_recovering_both`), not per-seed.
  - **The wall the model wrote** (scene 8): `results/continuous_synthesis_patch2d_large_k3_7.json`,
    cell `arm == "incomplete"`, `seed == 10000`: `if x >= 2.0: return [x, y, 0.0, 0.0]` (gate
    rejected it at 0.93, which the video does not need to show). 12 of the 20 incomplete-arm
    artifacts in that file write a threshold at exactly x = 2.0 (`x >= 2.0`, `x2 > 2.0`,
    `x < 2.0 <= x2`), a 13th at `x > 1.8`: the disc's west tangent.
  - **The cart rule** (scene 4): the article's own snippet `if x2 >= 8.0: return [8.0, 0.0]`
    (same clamp as in `results/continuous_synthesis_large_xwall8.json`).
  - **Radius comment** (scene 11): `results/continuous_synthesis_patch2d_large_k3_7_hint-radius.json`,
    cell 0: `# Shared sticky-patch radius inferred from the provided transitions.`; on screen
    shortened to the article's quote.
- **Illustrative, not literal**: the rail is drawn with the wall at 8.0 but the cart's motion,
  the handful of sparks in scene 4, the 111/156 icon grids, the eight cards' pens and the planner
  chip are stylised; the rigour lives in the article and the repo. The 1D tally (105/111) pools
  the cart's clamp and the pendulum's stop; the label "1D rules: wall, stop" keeps that honest
  without a second animation.
- **Numbers on screen, exactly as the article writes them**: "105 / 111" (label "1D rules: wall, stop"), "0 / 156" (label "2D regions: disc, square"), "0/40"
  (×7) and "0/3", "12 → 16 → 20 / 20" with "111°, 129°, 185°", "0 / 20" (synthesizer at every
  dose), "20 / 20" (radius given the centre), "0 / 20" (form alone), `8.0`, `x >= 2.0`.
- **Model name**: decided in v1.1: no model chip. The article names "GPT-5.x", but the video's
  point is the wall/circle contrast, not the vendor, and the only brand on screen stays AGILabs.
  The chip reads "LLM"; narration says "the model".
- **Spoken forms**: "105 of 111" → "a hundred and five of a hundred and eleven"; "0 of 156" →
  "zero of a hundred and fifty-six"; "20 of 20" → "twenty of twenty"; "LLM" → "L L M".
- **Credits (outro, small)**: "Data: code-world-models (open code and results)". No dataset
  credits needed: everything is the experiment's own simulation.
- **Alternatives (not in v1)**: (a) the "verified and wrong" coda: four 1D repairs that also
  invent a second stop the samples can't refute, accepted at 1.000; one of four caught by an
  independent gate (+~18 words, strong but a third thread); (b) the danger shot: a wall-blind
  planner "pinned at the wall in every episode", return ≈ 0.02 vs 17.77 (could replace scene 3's
  second sentence if Javier wants the stakes on screen).
- ES cut: pending (EN-only for now).
