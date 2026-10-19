# Fact-check: Count the Rings or Sear the Squid (EN vertical) · v1.2

v1.2 (feedback: placement animations + real cooking): scene 1 narration changed to "Drop squid
rings in a pan." + the unchanged question, sourced below; the photoreal cooking frames (scenes 1
and 11) and the placement moves are illustrative, listed at the end. No number changed.

Source: `src/content/blog/en/count-the-rings.md` (personal-website, published 2026-10-03). Every
spoken claim and every number or claim shown on screen, with the article sentence it rests on.
Visuals that are illustrative (drop physics, dials, the scene 9 instance, the shape morph) are
not claims and are listed at the end.

## Narration

| # | Claim (spoken) | Where | Article sentence |
|---|---|---|---|
| 1 | "Drop squid rings in a pan. Most rings, or most squid seared?" | hook (photoreal pan) | "Drop a handful of squid rings into a frying pan and you have already made a decision, whether or not you noticed making it." (v1.2, first sentence); "You can lay them out so that as many rings as possible are in the pan. Or you can lay them out so that as much squid as possible is touching hot metal, which is the thing that actually cooks." |
| 2 | "Sounds like one instruction twice. It isn't." | split | "Those sound like the same instruction phrased twice. They are not" |
| 3 | "A ring has a hole: a small enough ring drops inside and still touches the pan." | nest | "a ring has a hole. A small enough ring drops inside the hole of a larger one and sits flat on the pan, touching metal exactly as much as it would have on its own." (v1.1: was "a smaller ring fits inside", which overstated it; a ring merely smaller than the big one need not fit the hole. Now "small enough", as the article) |
| 4 | "Three small rings side by side: three rings, about 69.7 of area." | compare L | "If you want rings on the pan, take the three 4.2s: they fit side by side, $N = 3$, and they sear about $69.7$."; fig. alt: "three rings but only about 69.7 units of area" |
| 5 | "The big one with a small one inside: two rings, about 76.7." | compare R | "If you want squid cooked, take the 9.0 and drop one 4.2 into its hole: only $N = 2$, but about $76.7$ of contact area." |
| 6 | "Three rings or more dinner. Not both." | hold | "Three rings or more dinner. Not both." (verbatim) |
| 7 | "But if every ring is bigger than all the smaller ones combined," | condition | "Call the radii **superincreasing** when every ring is bigger than all the smaller ones put together" |
| 8 | "one layout wins on area and a family of similar goals. Not on count." | dominance | "Under superincreasing radii, the descending greedy ... produces the lexicographically maximal feasible set ... it simultaneously maximises [the sum of v] for *every* positive, strictly increasing, superadditive $v$. Contact area is one such $v$. So is the sum of radii, and the sum of perimeters. All of them at once, by the same arrangement."; "Count itself is *not* rescued" |
| 9 | "And where you put each ring stops mattering: tightest spot, roomiest, random, same result." | oblivious | "Every descending greedy is optimal, with an **arbitrary** rule for choosing which container to drop each ring into. Best fit — the tightest container that will take it. Worst fit — the roomiest. Random. Adversarial. They all place exactly the same lex-max set." |
| 10 | "Drop the condition and that still holds up to three rings. At four, it breaks." | edge | "With *arbitrary* radii and no superincreasing hypothesis at all, every descending greedy on **at most three rings** still lands on the lex-max set."; "Four are."; "So placement obliviousness is sharp. It holds unconditionally at three and fails at four." |
| 11 | "What am I actually maximising? That question decides the answer." | close | "\"what am I actually maximising?\" is not a philosophical warm-up question. It is the question that decides the answer." |
| 12 | "More at javieraguilar.ai" | outro | — |

## Numbers and claims on screen

| On screen | Where | Article sentence |
|---|---|---|
| Glowing annulus = seared surface | all | "The area touching the pan is the annulus" |
| Pan radius 10, width 1, rings 9.0, 4.2, 4.2, 4.2 (drawn to scale) | compare (4-6) | "a pan of radius $10$, width $1$, and radii $\{9.0,\ 4.2,\ 4.2,\ 4.2\}$" |
| RINGS 3 · SEARED ≈ 69.7 | scene 4 | "they fit side by side, $N = 3$, and they sear about $69.7$" (recomputed: 3·a(4.2) = 69.74) |
| RINGS 2 · SEARED ≈ 76.7 | scene 5 | "only $N = 2$, but about $76.7$ of contact area" (recomputed: a(9) + a(4.2) = 76.65) |
| Rings 9.95, 5.0, 4.3, 0.6; smaller ones as ghost outlines end to end along each diameter (a size check, not a nesting: at width 4.8 none nests); "each ring > all smaller ones together" | scene 7 | "superincreasing radii 9.95, 5.0, 4.3 and 0.6" (fig. 5 alt text); "every ring is bigger than all the smaller ones put together" |
| Left pan 9.95 with 5.0 nested, SEARED full; right pan 5.0, 4.3, 0.6 in a row, RINGS 3 vs 2 | scene 8 | "The counterexample is a pan of radius $10$, width $4.8$, radii $\{9.95,\ 5.0,\ 4.3,\ 0.6\}$. The greedy takes $\{9.95,\ 5.0\}$: two rings, optimal area ... Meanwhile $\{5.0,\ 4.3,\ 0.6\}$ packs in a row in the pan for three." |
| Tags "area", "radii", "perimeters" | scene 8 | "Contact area is one such $v$. So is the sum of radii, and the sum of perimeters." |
| Labels TIGHTEST · ROOMIEST · RANDOM; same rings in all three pans; same SEARED value | scene 9 | "Best fit — the tightest container that will take it. Worst fit — the roomiest. Random. Adversarial. They all place exactly the same lex-max set." (same *set*; layouts may differ, and the visual lets them differ) |
| Round pan → rectangular griddle → sphere outline; "any pan shape" | scene 9 | "The theorem is stated and proved for an arbitrary compact container ... A round pan, a rectangular griddle, tubes and spherical shells nested in three dimensions ... are all covered verbatim, not by extension." |
| Pan radius 15, width 0.3, rings 10, 5, 4.9, 4.8 | scene 10 | "Pan of radius $15$, width $0.3$, radii $\{10,\ 5,\ 4.9,\ 4.8\}$." |
| TIGHTEST: 5 nested, 4.9 in pan, 4.8 red cross; RINGS 3 | scene 10 | "Now run best fit. Facing the 5, it prefers the snug container — the hole of the 10 — and nests it. That single reasonable-looking decision forces the 4.9 out into the pan, and once the 4.9 is in the pan, the 4.8 has nowhere left. Best fit gets three rings." |
| ROOMIEST: 10 and 5 tangent in pan, 4.9 and 4.8 filling the hole; RINGS 4 | scene 10 | "the 10 and the 5 are exactly tangent in the pan ($10 + 5 = 15$), and the 4.9 and 4.8 exactly fill the hole of the 10 ($4.9 + 4.8 = 9.7$, the hole radius)"; "Worst fit gets four." |
| Raw rings browning to seared in a real pan (photoreal, scenes 1 and 11) | scenes 1, 11 | "as much squid as possible is touching hot metal, which is the thing that actually cooks"; summary: "sear as much squid as possible — the thing that actually cooks" (the picture shows cooking, not a quantity) |
| "What am I actually maximising?" (KeyQuote) | scene 11 | "\"what am I actually maximising?\" is not a philosophical warm-up question." |

## Illustrative, not claims

- Drop physics, bounce, glow intensity, dial styling.
- v1.2 placement moves (lift, arc, drop, settle, sizzle puff, refused-placement bump): staging
  only; final positions still come from the article instances via the position script.
- v1.2 photoreal cooking frames (`public/cooking/pan-empty.png`, `rings-raw.png`,
  `rings-seared.png`): AI-generated with Codex, not photographs and not an article instance.
  Ring sizes and positions are arbitrary and carry no numbers; no dial value is shown over them
  except the scene 1 tick-up of the illustrative handful. The nested small ring and the
  no-overlap layout keep them consistent with the rigid model. Warm sear colour in the diagram
  is a style choice.
- Scene 1-2 rings: any small handful, not an article instance.
- Scene 9 instance (e.g. R = 10, w = 1, radii {6, 2.8, 1.3, 0.6, 0.25}): not in the article;
  chosen to be superincreasing so the visual is consistent with the theorem. Layouts must be
  geometrically valid and end with the same set of rings in all three pans.
- The shape morph shows a 2D rectangle and a sphere outline as stand-ins for "a rectangular
  griddle" and "spherical shells nested in three dimensions".

## Hedges kept / checked

- Scene 8 says "Not on count" because the article says "Count itself is *not* rescued". The
  article's description ("not only do the goals agree") is looser than its body; the script
  follows the body.
- Scene 10 "still holds up to three rings" (v1.1, was "for three rings"; the article says "at most three") refers to placement not mattering, as the article
  ("every descending greedy on at most three rings still lands on the lex-max set").
- No claim about real squid behaviour: the rigid model forbids rings riding on each other
  ("every result below is a result about the rigid model"); no visual shows overlap
  (checked v1.2: the seven generated rings in `rings-raw.png`/`rings-seared.png` are disjoint,
  the small one sits inside the big ring's hole without touching it).

## Build notes (v1.2 render)

- Scene 9 uses exactly R = 10, w = 1, radii {6, 2.8, 1.3, 0.6, 0.25} (with w = 1 the 0.6 and
  0.25 are discs). All three pans end with all five rings; layouts differ (tightest nests them
  matryoshka-style, roomiest spreads them on open metal, random mixes). SEARED meters land
  equal; no number is shown. Every final layout (scenes 3-10) is checked by
  `test/geometry.test.ts` (inside the pan, every pair disjoint or nested in a hole), and the
  same test recomputes 69.7 and 76.7 from the article's area formula.
- Scene 3 nest instance (illustrative): R = 10, big ring r 7 / w 1.3, small ring r 3 / w 1.3.
- SEARED dials in scenes 2, 3, 8, 9 show a meter only (no number); scene 2 shows RINGS 7 for
  the photo's handful (a count of what is on screen).
- Narration text unchanged; some lines are split in two at a sentence/colon boundary for a beat
  (hook, split, dominance, edge, close). Spoken forms: "sixty-nine point seven",
  "seventy-six point seven", "javier aguilar dot A I".
- Scenes 1 and 11 caption themselves (big word-by-word gradient reveal over the photo) instead
  of the caption box; the SRT carries every line.
