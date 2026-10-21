# Fact-check: Proved, Certified, Swept, Sampled (EN vertical) · v1.0

Source: `src/content/blog/en/proved-certified-swept-sampled.md` (personal-website, `origin/main`,
`pubDate` 2026-10-10). Every spoken claim and every number or claim shown on screen, with the
article sentence it rests on. Cross-checked against the experiment repo
(`JaviMaligno/calamares`, `origin/HEAD`: `code/quintetocert.py` docstring, commit `937a515`,
`paper/main.tex` §thm:gapwritten and the verification map). Visuals that are illustrative are
listed at the end. One problem in the article itself is listed in the last section.

## Narration

| # | Claim (spoken) | Where | Article sentence |
|---|---|---|---|
| 1 | "These four claims print the same way." | hook | "All four print the same way: a sentence in a serif font that sounds true." |
| 2 | "One: a written proof." | lift 1 | "It can have a written proof." |
| 2 | "One: exact arithmetic, box by box." | lift 2 | "a certificate that ran exact rational arithmetic over an entire region"; hero alt "Box-certified: exact rational arithmetic over the whole domain." |
| 2 | "One: a grid, silent in between." | lift 3 | hero alt "Grid-swept: checked on a mesh, silent between the points." |
| 2 | "And one: ten million samples, none broke it." | lift 4 | "Or it can have "I sampled ten million configurations and none of them broke it"." (the article's own illustrative example of sampling, used the same way here) |
| 3 | "So in my last preprint, every claim carries a label." | stamps | "My last preprint … So every claim in it carries an **epistemic label** saying which one it is" |
| 4 | "What convinced me: a certificate that lied to me three times." | focus | "This article is about what convinced me to be that pedantic. It was not a principle. It was a certificate that lied to me three times" |
| 5 | "It had to check one lemma over a whole region." | boxes | "One lemma in that paper concerns a quintet of rings, and closing it needs a statement of the form: *over this whole four-dimensional domain of parameters…*"; "That is exactly the kind of statement you certify computationally, because the domain is continuous" |
| 6 | "A separate model got only the statement, told to break it." | reviewer | "An adversarial reviewer — a separate model, given the statement and told to break it"; "one that gets the statement alone and is asked to break it" |
| 7 | "Version one fell at once: part of it was only sampled." | refute | "refuted it in one pass"; "And one of the required inequalities was not certified at all; it had been *sampled*." (repo commit `937a515`: "v1 refutado (mallas sin Lipschitz, LP con tolerancias, R3<=M muestreado)") |
| 8 | "Version two was exact, except for one tolerance: 1e-12." | v2 | "The second version was written rational-directed: exact arithmetic on the corners, no floating-point comparisons in the acceptance test."; "The second version still had one tolerance in it: `1e-12`. Not as a comparison, but as slack" ("exact" is the article's "exact arithmetic on the corners"; the tolerance is the exception the line names) |
| 9 | "The lemma turns on one point, where the rings touch exactly." | touch | "the configuration the whole lemma turns on is the golden point … at that point the configuration is **exactly tangent**. The rings touch." |
| 9 | "There, the margin is zero." | touch | "The feasibility margin there is not small: it is zero." |
| 9 | "At zero, a tolerance isn't a small error. It changes the answer." | band | "At a point where the margin is zero, a tolerance does not introduce a small error. It changes the answer." |
| 9 | "Wrong only where the question is delicate, and still green." | pullback | "the test is wrong only where the question is delicate, and it is silent about it. Nothing crashes. Nothing looks suspicious. You get a green run" |
| 10 | "The lemma is true. But that certificate was not evidence." | verdict | "the lemma is true, and the final certificate proves it. What the tolerance did was make the certificate *not evidence*." |
| 11 | "Three refutations later, version four is the one I'd sign." | versions | "It refuted me three times on one lemma, and the fourth version is the only one I would put my name to." ("sign" = "put my name to") |
| 12 | "The same reviewer caught a claim I'd marked proved." | range | "The same adversarial pass that killed my certificate also read a draft … Then it found the thing I had not declared: a claim marked *proved*" |
| 12 | "It was only proved for part of its range." | range | "that was only proved for $\alpha \ge 1$. For $\alpha < 1$ the argument simply was not there."; summary: "a claim of mine marked "proved" that was only proved for part of its range" (the video avoids the article's looser "holds in half its range": the claim was unproved, not shown false, for α < 1) |
| 13 | "A wrong label is worse than a weak one, because it's trusted." | quote | Heading "A wrong label is worse than a weak one"; "dangerous precisely because it is trusted"; summary: "a wrong label is worse than a weak one, because it is trusted." |
| 14 | "Tests, types, a careful read: CI paints them all the same green." | software | "Your test suite, your type checker, your property-based tests and the one careful read-through you did on a Sunday are four different kinds of evidence … and CI paints all of them the same green." |
| 15 | "Label the claim, not the system." | close | "**Label the claim, not the system.**" |
| 16 | "More at javieraguilar.ai" | outro | — |

## Numbers and claims on screen

| On screen | Where | Article sentence |
|---|---|---|
| Same serif sentence + same green tick ×4 | scene 1 | "All four print the same way: a sentence in a serif font that sounds true." (the sentence on the cards is a generic placeholder, not a claim from the paper) |
| "written proof · Lean can re-check it" | scene 2 | "It can have a theorem the Lean kernel has checked."; hero alt "the machine can only recheck it" |
| "exact rational arithmetic" | scene 2 | "exact rational arithmetic over an entire region" |
| "10,000,000" counter on the sampled card | scene 2 | "I sampled ten million configurations" |
| Stamps PROVED · BOX-CERTIFIED · GRID-SWEPT · SAMPLED, strongest to weakest | scene 3 | "`proved`, `box-certified`, `grid-swept` or `sampled`"; hero "A ladder of four labels" |
| "60-page preprint" | scene 3 | "is sixty pages in which all four appear" |
| "a label per claim, not a tick for the paper" | scene 3 | "Not a green tick for the paper. A label per claim" |
| "4-D parameter domain · one slice shown"; five rings in the mini pan | scene 5 | "this whole four-dimensional domain of parameters"; "concerns a quintet of rings" |
| Chips "no Lipschitz bound between mesh points" · "LP with tolerances" · "one inequality: sampled" | scene 7 | "The meshes had no Lipschitz bound … The linear program ran with tolerances. And one of the required inequalities was not certified at all; it had been *sampled*." |
| "ε = 1e-12" | scene 8 | "one tolerance in it: `1e-12`" |
| "φ · golden point"; "margin = 0" | scene 9 | "the golden point, where the parameters all equal $\varphi$"; "it is zero" |
| ε band, tagged "drawn ×10¹¹ — real ε = 1e-12" | scene 9 | "The $\varepsilon$-thick acceptance band swallows the tangency" (width exaggerated and declared; 1e-12 × 10¹¹ = 0.1 of the plot's unit) |
| Near-tangent stretch inside the band turns green; "green run"; "ε harmless here" elsewhere | scene 9 | "Everywhere else in the domain the tolerance is harmless"; "You get a green run"; repo `937a515`: "la tolerancia 1e-12 engrosaba la variedad tangente del punto aureo" (the tolerance thickened the tangent variety at the golden point) |
| "Lemma: true ✓ (the final certificate proves it)"; stamp NOT EVIDENCE; sub-line "it reported its own tolerance band, not the geometry" | scene 10 | "the lemma is true, and the final certificate proves it. What the tolerance did was make the certificate *not evidence*. It had been reporting a property of its own acceptance band rather than a property of the geometry." |
| v1 ✗ "sampled inside" · v2 ✗ "ε at the tangency" · v3 ✗ "trusted a float library" · v4 ✓; "refuted: 3" | scene 11 | fig. 2 alt: "v1: … one inequality merely sampled. v2: rational-directed and still refuted, because the 1e-12 tolerance thickened the tangent variety at the golden point. v3: … still leaning on mpmath. v4: rational series …"; "The third version … still leaned on `mpmath` … so it still rested on a floating-point library being right"; "It refuted me three times on one lemma" |
| "zero tolerances · zero exclusions · no floating-point fact assumed" | scene 11 | "The result closes the domain with zero tolerances, zero exclusions, and no floating-point fact assumed anywhere." |
| Footnote "the paper's v2 proves the main theorem another way; this certificate still holds, but no longer carries it" | scene 11 | "the paper's second version proves the global threshold by a different and much shorter route, so this quintet belongs to a programme of specialised cases that the global theorem no longer needs as a premise. The certificate is still correct … It is simply not load-bearing any more" |
| Axis α; PROVED stamp shrinking to "α ≥ 1"; hatched "α < 1: no argument" | scene 12 | "a claim marked *proved* that was only proved for $\alpha \ge 1$. For $\alpha < 1$ the argument simply was not there." |
| Dim SAMPLED stamp beside the quote | scene 13 | "A `sampled` label is not dangerous." |
| "a test at the inputs you chose ≈ sampled" · "property test ≈ grid-swept" · "type ≈ box-certified" · "careful read ≈ proved, when it fits in a head" | scene 14 | "A passing test is `sampled`: it says nothing happened at the inputs you chose. A property test with a generator is closer to `grid-swept` … A type is nearer `box-certified` … And the read-through is the only one that is ever `proved`, on the rare occasions the argument is small enough to hold in a head." ("≈" carries the article's "closer to" / "nearer") |
| Credit "Certificates and verification reports: open source (calamares)" | outro | "the [code, certificates and verification reports are open](https://github.com/JaviMaligno/calamares)" |

## Illustrative, not claims

- The four coverage patterns (solid + stroke, box tiling, lattice, random scatter): a picture of
  what each label covers, not data from the paper. Box and dot counts are arbitrary.
- The placeholder sentence on the cards (scene 1).
- Mini pan with five rings and the slider motion (scenes 5, 9): schematic, not the quintet's real
  radii or the golden configuration's geometry.
- The margin curve (scene 9): schematic, as the article's figure 1 says it is ("A schematic curve
  of feasibility margin against a configuration parameter"). The band width is exaggerated and
  tagged as such.
- The box waves, the tally animation and the reviewer chip's look. The reviewer is a separate
  model in the repo's history; the article does not name it and neither does the video.
- No work material appears: this is Javier's own research, nothing to anonymise.

## Not used (in the article, left out for length)

- The golden point closed algebraically (lower arc overshoots by $1.4 \times 10^{-4}$; stacked
  witness with margin $1/\varphi^3$ in $\mathbb{Q}[\sqrt5]$).
- v4's internals (alternating Lagrange remainder, one-ULP directed rounding, rational bounds on
  π, `math.asin` as an oracle that is not believed).
- "Exhausted by cost" regions.
- The positive direction: the derivative lemma confirmed (30 rational points, 29 decimal places,
  ~10 million adversarial points), the coordinate artefact and the Tribonacci closing constant.
- "Know where the tolerance is" and "let something adversarial read it" (the video keeps the third
  takeaway, "label the claim, not the system").

## Article vs data: issues found

1. **The direction of the tangency failure (fig. 1 and "The claim that looked certified").** The
   article states the lemma as "*this configuration does not fit*" and figure 1's alt says that at
   the tangent point "the exact answer is "does not fit", and the test with a tolerance answers
   "fits"". The repo says the opposite polarity: `quintetocert.py` certifies that witnesses **fit**
   over the whole domain (per-box certificates P1-P5 are fit witnesses; the trio "cabe en R_used en
   TODO el dominio"), and `paper/main.tex` calls the golden configuration "a **tangent-legal**
   witness": with closed inequalities, margin exactly 0 counts as fitting. So at the exact tangent
   point both the exact test and the ε-test answer "fits"; what the 1e-12 slack actually did
   (commit `937a515`: "la tolerancia 1e-12 engrosaba la variedad tangente del punto aureo") is
   accept configurations with slightly *negative* margin around the tangent variety. The article's
   core sentence ("at a point where the margin is zero … it changes the answer"; "the band swallows
   the tangency") survives as a description of the neighbourhood; the alt text and the
   "does not fit" lemma statement look inverted. The video avoids both: it never labels the touch
   point "does not fit" and shows near-tangent points inside the band turning green.
2. **"A ten-thousandth, at the one place where a `1e-12` band had been declaring victory."** The
   $1.4 \times 10^{-4}$ overshoot is the *mural* arrangement at the real corner (docstring: "el
   arco inferior suma pi + 1.4e-4"), eight orders of magnitude larger than the band; a 1e-12 band
   could not have accepted it. The sentence reads as if the band had been hiding that overshoot.
   Not used in the video.
3. Minor, paper vs code, not the article: `paper/main.tex` (thm:gapwritten proof, ~line 3900)
   still says the arcsines are "evaluated by high-precision arithmetic on exact rational
   arguments", which is v3's `mpmath` route; the code docstring and the article describe v4's pure
   rational series. Not used in the video.
4. Consistent: "refuted three times" (v1, v2, v3 refuted; v4 survives) matches the commit's
   "LA SAGA quintetocert v1->v4 (4 rondas de codex)"; the paper's verification map reads
   "4/4; whole domain, 11,973 boxes, tolerance-free rational acceptance" (11,973 is not in the
   article, so not on screen).

## Build notes (v1.0 build, on-screen wording added during the build)

| On screen | Where | Basis |
|---|---|---|
| Sub-label "checked on a mesh · silent between" on the grid-swept tile | scene 2 | hero alt: "Grid-swept: checked on a mesh, silent between the points." |
| "10,000,000 samples · none broke it" | scene 2 | "I sampled ten million configurations and none of them broke it" |
| "one lemma: five rings in a pan" next to the mini pan | scenes 5-6 | "One lemma in that paper concerns a quintet of rings"; the pan is the paper's frying pan ("packing nested rings in a frying pan") |
| Reviewer chip "reviewer · separate model", card "statement only", red "break it" | scene 6 | "a separate model, given the statement and told to break it" |
| "● exact arithmetic on the corners", "acceptance test" with the ε chip | scene 8 | "exact arithmetic on the corners, no floating-point comparisons in the acceptance test"; "one tolerance in it: `1e-12`" |
| Mechanism plot: "margin", "0", curve touching 0 at φ from above; a strip of 12 "boxes along one parameter · bar = each box's check"; the 4 bars nearest φ dip just below 0 (✗) and flip to ✓ once the ε band covers them; "ε harmless out here" | scene 9 | Schematic. Drawn so the picture matches the repo's polarity (factcheck issue 1): the band admits near-tangent checks slightly below zero ("la tolerancia 1e-12 engrosaba la variedad tangente del punto aureo"); "Everywhere else in the domain the tolerance is harmless". No "fits / does not fit" label anywhere. The curve comes down to touch zero instead of the article figure's curve rising from below, to avoid the inverted reading. |
| "ε band · drawn ×10¹¹ · real ε = 1e-12" | scene 9 | as above (1e-12 × 10¹¹ = 0.1 plot units = the drawn half-width) |
| "ε harmless elsewhere · wrong only at φ" under the green region (φ cell tagged) | scene 9 | "Everywhere else in the domain the tolerance is harmless"; "the test is wrong only where the question is delicate" |
| v4 row "the one I would sign" | scene 11 | "the fourth version is the only one I would put my name to" |
| "same reviewer · separate model" chip over the α axis | scene 12 | "The same adversarial pass … found … a claim marked *proved*" |
| "a sampled label is not dangerous →" beside the dim SAMPLED stamp | scene 13 | "A `sampled` label is not dangerous." |
| "CI passing" pill with one green tick per tile | scene 14 | "CI paints all of them the same green" |
