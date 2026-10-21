# Proved, Certified, Swept, Sampled — article video (EN) · script draft v1.0

Article: proved-certified-swept-sampled (javieraguilar.ai, EN, `pubDate` 2026-10-10; read from
`origin/main` of personal-website). Vertical 9:16, target **~82 s** (ceiling 85 s), 209 spoken
words including the outro. ES column left empty (EN-only for now). Voice: the template default.

Companion to the *Count the Rings* video (`examples/count-the-rings`): same paper, same ring-in-a-pan
drawing style for the one moment the rings appear (scene 9), so the two read as a pair.

## Central visual: four tiles that look the same until you lift the tick

One square **region** (the domain a claim talks about) is drawn four times, side by side as four
tiles, each with the same serif sentence and the same green tick on top. Lifting the tick shows
what is actually underneath, and the four are not alike:

- **PROVED**: the region filled solid, a single pen stroke across it (a written argument; small
  sub-label "Lean can re-check it").
- **BOX-CERTIFIED**: the region tiled edge to edge by small boxes, every box filled.
- **GRID-SWEPT**: a regular lattice of dots, dark gaps between them.
- **SAMPLED**: a random scatter of dots, larger dark gaps.

That is the metaphor the whole video hangs on: **same tick, different coverage**. The certificate
story then zooms into the BOX-CERTIFIED tile and finds the one box where the tick is green for the
wrong reason (the tolerance band), and the close turns the same four tiles into software (test,
property test, type, careful read) under one CI green.

The mechanism animation is `ToleranceBand` (scene 9): a margin curve that touches zero at exactly
one point, and a red ε-band (drawn hugely exaggerated) that swallows the stretch around that touch,
so the near-tangent boxes flip green. Everywhere else the band is invisible and harmless: the test
is wrong only where the question is delicate.

| # | Narration (EN, caption text) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | These four claims print the same way. | | **Cold open:** four stacked cards on the dark stage, each with the same serif sentence ("The inequality holds on the whole domain.") and the same green tick, landing one after another, perfectly identical. | intro over bespoke `CoverageTiles` (mode `same`) | "All four print the same way: a sentence in a serif font that sounds true." |
| 1 | All four say the inequality holds on the whole domain. | | *(added 2026-10-21: read the card)* The voice reads the card so nobody needs a silent pause to read it. As it is spoken the four card sentences light up one after another (soft sway, scale ~1.03, accent border), from "four" to "whole domain"; the four green ticks beat together on "holds". Then ~1.2 s held, everything readable, before the dip out. Captioned normally, below the cards. | `CoverageTiles` (mode `same`) | "All four print the same way: a sentence in a serif font that sounds true." |
| 1b | I wrote a sixty-page paper on packing rings in a frying pan. | | *(added 2026-10-21: story)* A stack of pages fans out, centred; on the front page the five-rings-in-a-pan figure ("Fig. 1") draws in on "rings"; tag "60-page preprint" on "sixty". | bespoke: `StoryPaper` | "My last preprint — the one about packing nested rings in a frying pan — is sixty pages in which all four appear" |
| 1b | Some claims are proved. Others: a computer check, or just samples. | | *(added 2026-10-21: story)* The page slides left; three claim lines on it, each with the same green tick. Beside each, under "what backs it", its backing pops in on its word: "written proof" (pen stroke) · "computer check" (box grid) · "samples" (dot scatter). | `StoryPaper` | "It can have a written proof. … a certificate that ran exact rational arithmetic over an entire region … Or it can have "I sampled ten million configurations and none of them broke it"." |
| 1b | In print, they all look the same. They're not worth the same. | | *(added 2026-10-21: story)* On "print" the backing slides away behind the page: only three identical ticks, pulsing together on "same". On "worth" the backing returns, each with a weight bar, strongest first (proof longest, samples shortest; schematic). Dip into the four cards. | `StoryPaper` | "All four print the same way: a sentence in a serif font that sounds true. And the fourth is worth a great deal less than the first" |
| 2 | One: a written proof. | | The ticks lift one per beat; under card 1 the region is filled solid with one pen stroke across it; sub-label "written proof · Lean can re-check it". | bespoke: `CoverageTiles` (mode `lift`) | "It can have a written proof. It can have a theorem the Lean kernel has checked."; hero alt: "Proved: a written proof, the machine can only recheck it." |
| 2 | One: exact arithmetic, box by box. | | Card 2: the region tiles into small boxes, each one filling in turn; sub-label "exact rational arithmetic". | `CoverageTiles` (mode `lift`) | "a certificate that ran exact rational arithmetic over an entire region and never once used a floating-point number"; hero alt: "Box-certified: exact rational arithmetic over the whole domain." |
| 2 | One: a grid, silent in between. | | Card 3: a regular lattice of dots; the dark gaps between them pulse once on "silent". | `CoverageTiles` (mode `lift`) | Hero alt: "Grid-swept: checked on a mesh, silent between the points." |
| 2 | And one: ten million samples, none broke it. | | Card 4: a random scatter of dots raining in (counter on the card ticking to "10,000,000"), bigger dark gaps. All four ticks drop back on: still identical. | `CoverageTiles` (mode `lift`) | "Or it can have "I sampled ten million configurations and none of them broke it"." |
| 3 | So in my last preprint, every claim carries a label. | | A stamp lands on each card, one per beat after "label": **PROVED** · **BOX-CERTIFIED** · **GRID-SWEPT** · **SAMPLED**. Small tag top-left: "60-page preprint". Line under the cards, unvoiced: "a label per claim, not a tick for the paper". | `CoverageTiles` (mode `stamp`) | "So every claim in it carries an **epistemic label** saying which one it is: `proved`, `box-certified`, `grid-swept` or `sampled`. Not a green tick for the paper. A label per claim"; "sixty pages in which all four appear" |
| 4 | What convinced me: a certificate that lied to me three times. | | The BOX-CERTIFIED card grows to fill the stage; the other three slide out. A small tally appears in the corner: **refuted: 0**. | `CoverageTiles` (mode `focus`) | "It was a certificate that lied to me three times, and the specific way it lied." |
| 5 | It had to check one lemma over a whole region. | | Above the region, a mini pan with five rings (the quintet), its sliders moving; the region is labelled "4-D parameter domain · one slice shown". The region subdivides into boxes, each ticking green in a wave. | bespoke: `CoverageTiles` (mode `boxes`) + mini pan | "closing it needs a statement of the form: *over this whole four-dimensional domain of parameters, this configuration does not fit.*"; "subdivide the domain into boxes, evaluate at each box" |
| 6 | A separate model got only the statement, told to break it. | | A plain outlined reviewer chip (no name, no logo) slides in from the right. A single card with only the statement travels to it; a red "break it" tag on the arrow back to the region. | `FlowDiagram` (vertical: statement → reviewer → certificate, last edge labelled "break it") | "An adversarial reviewer — a separate model, given the statement and told to break it" |
| 7 | Version one fell at once: part of it was only sampled. | | Stamp **REFUTED** on the region (tally → 1). Three chips pop: "no Lipschitz bound between mesh points", "LP with tolerances", "one inequality: sampled". The last chip is highlighted and carries the **SAMPLED** stamp from scene 3. | bespoke: `CoverageTiles` (mode `refute`) | "refuted it in one pass … The meshes had no Lipschitz bound … The linear program ran with tolerances. And one of the required inequalities was not certified at all; it had been *sampled*." |
| 8 | Version two was exact, except for one tolerance: 1e-12. | | The boxes rebuild with fraction marks on their corners ("exact arithmetic"); one small chip settles on the acceptance test: **ε = 1e-12**. | `CoverageTiles` (mode `v2`) | "The second version was written rational-directed: exact arithmetic on the corners, no floating-point comparisons in the acceptance test."; "The second version still had one tolerance in it: `1e-12`." |
| 9 | The lemma turns on one point, where the rings touch exactly. | | **The mechanism.** Zoom into one box. The stage splits: top, the mini pan, rings sliding until they touch (contact glints); bottom, a plot of *margin* against one parameter, a curve rising to touch the zero line at a single point labelled **φ · golden point**. | bespoke: `ToleranceBand` (mode `touch`) | "the configuration the whole lemma turns on is the golden point, where the parameters all equal $\varphi$. And at that point the configuration is **exactly tangent**. The rings touch." |
| 9 | There, the margin is zero. | | The touch point glows; a tag "margin = 0" snaps onto it. | `ToleranceBand` (mode `touch`) | "The feasibility margin there is not small: it is zero." |
| 9 | At zero, a tolerance isn't a small error. It changes the answer. | | A red band labelled **ε** (tag: "drawn ×10¹¹ — real ε = 1e-12") grows around the zero line. The short stretch of curve just under zero, inside the band, flips from red to green; the boxes under it flip to green ticks. Outside the band, nothing changes. | `ToleranceBand` (mode `band`) | "At a point where the margin is zero, a tolerance does not introduce a small error. It changes the answer. The $\varepsilon$-thick acceptance band swallows the tangency" |
| 9 | Wrong only where the question is delicate, and still green. | | Pull back to the whole region: every box green, including the one at φ, which pulses; tag **"green run"**. A dim note on the rest of the region: "ε harmless here". | `ToleranceBand` (mode `pullback`) | "Everywhere else in the domain the tolerance is harmless … the test is wrong only where the question is delicate, and it is silent about it. Nothing crashes. … You get a green run" |
| 10 | The lemma is true. But that certificate was not evidence. | | **Verdict card.** Top row: "Lemma: true ✓ (the final certificate proves it)". Below, the green-run region with a stamp across it: **NOT EVIDENCE** (on "evidence"). Unvoiced sub-line: "it reported its own tolerance band, not the geometry". Tally → 2. | bespoke: `ToleranceBand` (mode `verdict`) | "The tolerance did not make the lemma false — the lemma is true, and the final certificate proves it. What the tolerance did was make the certificate *not evidence*. It had been reporting a property of its own acceptance band rather than a property of the geometry." |
| 11 | Three refutations later, version four is the one I'd sign. | | Four panels in a row: **v1 ✗** "sampled inside" · **v2 ✗** "ε at the tangency" · **v3 ✗** "trusted a float library" · **v4 ✓**. Tally ends at **refuted: 3**. Under v4: "zero tolerances · zero exclusions · no floating-point fact assumed". Footnote, small, held to the end: "the paper's v2 proves the main theorem another way; this certificate still holds, but no longer carries it". | `StatGrid` (4 tiles) + footnote overlay | "It refuted me three times on one lemma, and the fourth version is the only one I would put my name to."; "The result closes the domain with zero tolerances, zero exclusions, and no floating-point fact assumed anywhere."; "The third version … still leaned on `mpmath`"; "the paper's second version proves the global threshold by a different and much shorter route … The certificate is still correct … It is simply not load-bearing any more" |
| 12 | The same reviewer caught a claim I'd marked proved. | | A horizontal axis "α"; a long **PROVED** stamp spans all of it. A red reviewer marker drops at **α = 1**. | bespoke: `LabelRange` | "The same adversarial pass … found the thing I had not declared: a claim marked *proved*" |
| 12 | It was only proved for part of its range. | | The stamp slides right and shrinks to cover only **α ≥ 1**; the left half turns to a hatched gap with **"α < 1: no argument"**. | `LabelRange` | "that was only proved for $\alpha \ge 1$. For $\alpha < 1$ the argument simply was not there." |
| 13 | A wrong label is worse than a weak one, because it's trusted. | | The sentence writes itself, "wrong" and "trusted" in the accent. A dim SAMPLED stamp sits beside it, harmless. | `KeyQuote` | Heading "A wrong label is worse than a weak one"; "A `proved` label on a claim that holds in half its range is dangerous precisely because it is trusted"; "A `sampled` label is not dangerous." |
| 14 | Tests, types, a careful read: CI paints them all the same green. | | The four tiles of scene 1 return, relabelled for software: "a test at the inputs you chose ≈ sampled" · "property test ≈ grid-swept" · "type ≈ box-certified" · "careful read ≈ proved, when it fits in a head". On "same green" all four ticks turn one identical CI green. | `CoverageTiles` (mode `software`) | "Your test suite, your type checker, your property-based tests and the one careful read-through you did on a Sunday are four different kinds of evidence … and CI paints all of them the same green. A passing test is `sampled` … A property test … is closer to `grid-swept` … A type is nearer `box-certified` … the read-through is the only one that is ever `proved`" |
| 15 | Label the claim, not the system. | | The ticks lift once more and each tile keeps its own stamp; the line lands under them. | `KeyQuote` | "**Label the claim, not the system.**" |
| 16 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Proved, Certified, Swept, Sampled". Credit line: "Certificates and verification reports: open source (calamares)". | outro | — |

**Word count (EN, as spoken):** 7 + (10, added 2026-10-21: read the card) + (12 + 11 + 12, added 2026-10-21: story) + 4 + 6 + 6 + 8 + 10 + 11 + 10 + 11 + 11 + 13 + 11 + 5 + 12 +
10 + 10 + 10 + 9 + 9 + 12 + 12 + 6 + 7 = **255 words** (245 before reading the card, 210 before the story) (with "1e-12" spoken as "ten to the minus
twelve", outro as "javier aguilar dot A I"), about 75 s of speech at ~2.8 words/s, **~82-84 s**
with line gaps and the outro hold. Under the 85 s ceiling, but close.

If the TTS render runs over 85 s, trim holds first, then cut in this order (never scenes 8-10, the
mechanism and the verdict):
1. Scene 14 narration → "CI paints them all the same green." (−6); the tile labels carry the four
   kinds. Do not paraphrase "a careful read" as "reviews": the article says read-through.
2. Scene 6: drop "only" (−1); scene 3: "my last preprint" → "my preprint" (−1).
3. Scene 2: "And one:" → "One:" (−1).

**Captions** (estimate at 2.8 words/s): every line ≤ 16.5 chars/s (highest: scene 9 "Wrong only
where the question is delicate, and still green." 16.5; scene 11 16.2; scene 10 16.0). Scene 8 is
written "1e-12" in the caption with the spoken form "ten to the minus twelve", so it reads at
~11.8 chars/s. `npm run lint` after TTS is the gate.

## Spoken numbers (complete list)

| Spoken | Scene | Why it stays in the voice |
|---|---|---|
| "four" (claims) | 1 | Sets up the four kinds of evidence; round. |
| "ten million" | 2 | The article's own example of sampling; round. |
| "three times" / "three refutations" | 4, 11 | The count the story is built on. |
| "ten to the minus twelve" | 8 | The tolerance itself; the one number that carries the mechanism. |
| "zero" (margin) | 9 | The point of the mechanism. |
| "version one / two / four" | 7, 8, 11 | Version names, not results. |

No table is read aloud. `1.4 × 10⁻⁴`, `1/φ³`, α ≥ 1 and the v4 details appear only on screen
(α ≥ 1) or not at all (see factcheck).

## Notes for the build

- **`CoverageTiles` (bespoke, the spine).** Four square tiles of one region, each a different
  coverage pattern drawn in code (solid + stroke, box tiling, lattice, seeded random scatter), a
  serif sentence card and a tick on top. Modes: `same`, `lift`, `stamp`, `focus`, `boxes`,
  `refute`, `v2`, `software`. Stamps use the brand accent for PROVED/BOX-CERTIFIED and muted tones
  for GRID-SWEPT/SAMPLED, the same as the article's hero ladder (proved strongest, sampled
  weakest). The four patterns must read at phone size: lattice gaps and scatter gaps visibly dark.
- **`ToleranceBand` (bespoke, the mechanism).** Top: mini pan with five rings (reuse the
  `count-the-rings` ring drawing), sliding to a touch at the golden point. Bottom: margin vs one
  parameter, schematic (as the article's figure 1 is schematic): a curve touching the zero line at
  one point φ. The ε band is drawn enormously exaggerated, with the "drawn ×10¹¹" tag so nobody
  reads its width as data. **The visual shows near-tangent points inside the band being counted as
  zero and turning green; it does not put an "exact: does not fit" label on the touch point
  itself** (see the article issue in `factcheck.md`). Modes: `touch`, `band`, `pullback`,
  `verdict`.
- **`LabelRange` (bespoke, small).** One axis, one long stamp that slides and shrinks to α ≥ 1,
  hatched gap with "α < 1: no argument". No other numbers.
- **Reviewer chip**: generic outline ("separate model"), no model name or maker logo: the article
  does not name it. The only brand on cards, poster and metadata is AGILabs.
- **Numbers on screen, exactly as the article writes them**: "60-page preprint", "10,000,000"
  (article: "ten million"), "ε = 1e-12", "margin = 0", "φ", "refuted: 0 → 1 → 2 → 3",
  "v1 · v2 · v3 · v4", "α = 1", "α ≥ 1", "α < 1". Not shown: 1.4 × 10⁻⁴, 1/φ³, the Tribonacci
  result, 29 decimal places, 11,973 boxes (repo only, not in the article).
- **Spoken forms**: "1e-12" → "ten to the minus twelve"; "javieraguilar.ai" → "javier aguilar dot
  A I"; "CI" → "C I"; "φ" is never spoken.
- Visuals are chosen for impact, not as a literal replay: the four coverage patterns, the pan
  sliders, the band width, the box waves and the tally are stylised; the rigour lives in the
  article, the paper and the repo. Narration and every number stay faithful to the article.
- ES cut: pending (EN-only for now).
