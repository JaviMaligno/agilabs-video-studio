# Fact-check: The Wall and the Circle (EN vertical) · draft v1.1 (independent review)

Source: `src/content/blog/en/infer-the-rule-in-one-dimension.md` on `origin/main`
(personal-website, published 2026-08-30), plus committed result files in
`JaviMaligno/code-world-models` for the real artifacts and contact points used as visuals.
Every spoken claim and every number or claim shown on screen, with the sentence it rests on.

## Narration

| # | Claim (spoken) | Article sentence | Status |
|---|---|---|---|
| 1 | "I left a wall out of the spec. The model put it back." | "The spec handed to the LLM pins the integrator exactly and simply **omits the wall clause**."; "a current model *does* infer the omitted rule from a handful of examples" | OK |
| 2 | "A circle? Not once." | "on two-dimensional regions it recovers it in none of 156 mode-containing draws"; "It isn't 'never' — it's 'not once in the evidence I have'" | OK: deliberately "not once", not "never" (the article rejects "never") |
| 3 | "An LLM writes the physics a planner trusts." | "A planner does random-shooting MPC against a synthesized Python model of the physics. The spec handed to the LLM ... simply **omits the wall clause**." | OK |
| 4 | "From a handful of contacts, it wrote the true rule back." | "When the wall *does* appear in the training sample — often just a handful of contact transitions — GPT-5.x ... writes the true global rule"; "The rule, with the right constant, valid everywhere." | OK |
| 5 | "It did that in 105 of 111 attempts." | "Across the two one-dimensional instruments (the cart's position clamp and a pendulum's angular stop) it did this in **105 of 111 mode-containing synthesis draws**."; description: "repairs an omitted 1D rule in 105 of 111 attempts" | OK, with a nuance: 105/111 pools the cart and the pendulum; the narration follows the article's own description. On screen "1D rules: wall, stop". |
| 6 | "Then I gave the rule one more dimension: a circle that stops the mover." | "Then give the same rule one more dimension"; "two **circular regions** painted on it, and a rule that freezes the mover the moment it enters one" | OK ("stops" = freezes; the plane has two discs, the video focuses on the near one) |
| 7 | "Repair fell to 0 of 156." | Figure: "2D rule (disc, square) 0 / 156 draws"; summary: "Repair collapsed to 0 of 156." | OK. The 156 pool discs and squares while line 6 has just introduced "a circle": the on-screen label "2D regions: disc, square" (added in v1.1) keeps it from reading as discs only |
| 8 | "Mostly, it wrote a wall instead: right place, wrong shape." | "The **dominant** failure is **dimensional reduction**: the disc becomes a half-plane at the right location and the wrong shape — a 1D threshold, the thing that worked on the cart" | OK: "mostly" = "dominant"; "wall" = half-plane / 1D threshold |
| 9 | "Eight fixes: a better prompt, flat edges, more evidence. None worked." | "I ran eight interventions"; "None of them restores repair."; "it doesn't get better with a stronger prompt, more budget, flatter geometry, or more evidence — I tried all four." | OK, with a nuance: one of the eight (the band) "is recorded rather than counted"; shown on screen as "not counted" |
| 10 | "With enough evidence, three lines of least squares find the circle every time. The model: none." | "a plain algebraic least-squares circle fit — three lines of linear algebra"; "I can dose the evidence until that fit succeeds on every single sample."; caption: "the synthesizer recovers it on none, at every dose" | OK: "with enough evidence" carries the dose; at the default evidence it is 12 of 20 (shown on the ticker) |
| 11 | "Tell it where the circle is: it infers the radius exactly, 20 of 20." | "Given the region's form **and** its centres, with only the radius withheld — one unknown number — the synthesizer infers it **exactly in 20 of 20 seeds**" | OK ("where" = centres; the form is given too) |
| 12 | "Only the shape: zero." | "Given the form **alone**, centres withheld: **0 of 20**." | OK |
| 13 | "Learning the rule from data is a one-dimensional bet. Anything with a shape, you still have to specify." | "'the model will figure it out from the data' is a bet you can only make in one dimension. Everything with a shape, you still have to specify." | OK (paraphrase of the first half; second half near verbatim) |
| 14 | "More at javieraguilar.ai" | — | — |

## Numbers and claims on screen

| On screen | Where | Source |
|---|---|---|
| Code `if x2 >= 8.0:` / `return [8.0, 0.0]` | 4 | Article snippet, verbatim |
| "105 / 111" · "1D rules: wall, stop" | 5 | "105 of 111 mode-containing synthesis draws"; figure label "1D rule (wall, stop)" |
| "0 / 156" · "2D regions: disc, square" | 7 | Figure: "0 / 156 draws", label "2D rule (disc, square)" |
| Code `if x >= 2.0:` / `return [x, y, 0.0, 0.0]` | 8 | Real artifact: `results/continuous_synthesis_patch2d_large_k3_7.json`, incomplete arm, seed 10000 (verified in this session). Illustrates "the disc becomes a half-plane at the right location" |
| Real contact sparks (21, ~111°) | 8, 10 | `results/region_fit_baseline.json` row seed 10000: 21 contacts, landing arc 110.96° (re-read in review; default-arm median 110.65°, which the article's figure axis rounds to 111°). Illustrative positions; the article itself only gives the 111° axis |
| Eight cards: "Region-first prompt, 3× budget 0/40", "Square, flat edges 0/40", "Second model family 0/3", "Band in one coordinate — not counted", "Variable named 0/40", "Stops inside 0/40", "Clamped to boundary 0/40", "Wider coverage 0/40" | 9 | Article table (rows and values verbatim, labels shortened); "The fourth is recorded rather than counted" |
| Square card's pen draws a disc on square sparks | 9 | "It failed in a mirror image of the disc: artifacts wrote *discs* on square evidence." |
| "111° → 129° → 185°", least squares "12 → 16 → 20 / 20", model "0 / 20" at each | 10 | Article figure (axis 111°, 129°, 185°; points 12, 16, 20; synthesizer 0); `region_fit_baseline.json` `dose_arms`: 12/16/20, median arcs 110.7/128.9/185.0 |
| "centre given" · "20 / 20" · `# radius inferred from the provided transitions` | 11 | "infers it **exactly in 20 of 20 seeds**"; "One artifact even comments 'radius inferred from the provided transitions'" (real artifact comment found in `..._hint-radius.json`) |
| "shape only" · "0 / 20" | 12 | "Given the form **alone**, centres withheld: **0 of 20**." |
| Key phrase "one dimension" | 13 | "a bet you can only make in one dimension" |
| Chip "LLM" (no model name; dropped "GPT-5.x" in v1.1) | 3 | "The spec handed to the LLM" |
| Outro title | 14 | Article title |

## Illustrative, not claims

- The rail, the cart's motion, the handful of sparks at the wall in scene 4 (illustrative count; the article's "four rows
  out of 3,200" is about the linear fit, so the video no longer cites it),
  the healing animation, the 111- and 156-icon grids, the planner chip, the eight cards' pen
  strokes, the pin and the final spec card are stylised.
- Scene 8 shows one real artifact (seed 10000) as representative of the dominant failure; other
  artifacts fit hulls or invent zones ("Others fit the convex hull ... or invent a zone around the
  reward landmarks"), not shown.
- The least-squares ring in scene 10 is fitted per dose step on seed 10000's sparks; the
  12 → 16 → 20 tickers are the 20-sample totals.

## Not verified / open

- I did not re-run the extraction for the dose arms (seed 10000 at `start_arc_deg` 120 and 240):
  the exact spark positions there are for the build script, the totals are from the committed
  JSON.
- 105/111 pools two 1D instruments (cart and pendulum) while the narration frames it as the
  wall: same framing as the article's description, flagged for Javier.

## v1.1 review (independent)

- Re-checked every spoken line and on-screen number against `origin/main`; all match. Changed:
  scene 3 lost "I left out the wall." (repeat of the hook, brings the count to 140), scene 7
  gains the label "2D regions: disc, square", scene 4 no longer ties its spark count to the
  article's "four rows", line 11 tightened, model chip dropped.
- Re-verified in the repo: seed 10000 artifact `if x >= 2.0:` / `return [x, y, 0.0, 0.0]` in
  `continuous_synthesis_patch2d_large_k3_7.json`; the comment "radius inferred from the provided
  transitions" in `..._hint-radius.json`; `dose_arms.default.n_recovering_both` = 12 and seed
  10000's 21 contacts over 110.96°.
- Kept on purpose: "Not once" (the article rejects "never"), "None worked" for the eight with
  the band card stamped "not counted" (the article's own summary says "None of them restores
  repair"), 105/111 framed as the wall with the "wall, stop" label (the article's description
  does the same), one artifact as representative of the dominant failure (illustrative;
  "dominant" is the article's word and 12 of 20 incomplete-arm artifacts threshold at x = 2.0).

## Build notes (render, 2026-10-19)

- Sparks and least-squares rings come from `scripts/extract-rule-field.py` (read-only over
  code-world-models), written to `src/data/ruleField.ts`. Default arm: seed 10000 (21 landings,
  110.96°, the reduction artifact's seed). At seed 10000 the dose arms do not widen (arc120 →
  192°, arc240 → 120°), so each dose arm uses the seed whose landing arc is closest to the arm
  median: arc120 seed 200000 (131.4°), arc240 seed 30000 (181.2°). On-screen chips keep the
  article's medians, "111°, 129°, 185°"; the tickers are the committed arm totals 12 / 16 / 20.
- Caption of line 11 uses a dash ("Tell it where the circle is — it infers…") instead of the
  script's colon, so the cue does not break after four words (lint, 17 chars/s). Words unchanged;
  the TTS reads the spoken form. Line 10 has a TTS-only pause after "evidence" (same words).
- Spec card in scene 13 (`circle(centre=(3, 0), R=1.0)`) uses the experiment's real near-disc
  geometry (PatchField2D defaults); illustrative of "you still have to specify".
- Review pass (2026-10-19): caption-only punctuation changes, words unchanged: line 10 caption
  "With enough evidence… three lines…" (cue breaks at the TTS pause, not "three / lines"), line 11
  "…exactly: 20 of 20." (the count is its own cue instead of "20 / of 20"). Visual-only: the hook
  and closing circle now break off at two-thirds (215° drawn, was 250°), and the dose tickers, the
  "wrong shape" pill and the right-hand intervention drawings moved clear of the platform action
  rail. No on-screen number changed.
