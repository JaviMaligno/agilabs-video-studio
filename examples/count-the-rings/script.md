# Count the Rings or Sear the Squid — article video (EN) · script draft v1.2

Article: count-the-rings (javieraguilar.ai, EN). Vertical 9:16, target ~56 s (hard cap 60 s), 134 written words (~140 spoken).
Data on screen: the article's own worked instances (exact radii, pan sizes and widths), drawn to
scale; one illustrative instance for the placement scene. No external data, no maths on screen.
Real cooking: photoreal frames generated with Codex (`public/cooking/`), animated in Remotion.

## Changes from feedback (v1.1 → v1.2)

Javier asked for (a) clear animations of rings being **placed** in the pan and (b) at least one
scene of **really cooking squid**. Warm colours are allowed for the cooking.

- **Real cooking, bookending the video.** Three photoreal top-down frames, generated with the
  Codex CLI image tool (`codex exec -i <ref> -` with an edit prompt, each frame edited from the
  previous one so the pan, stovetop and ring positions stay registered: frame-to-frame MAE on the
  stovetop and handle ≈ 0.6-1.2 %, so cross-fades are clean): `pan-empty.png` (hot carbon-steel
  pan, shimmering oil), `rings-raw.png` (seven raw rings, one small ring flat inside the big
  ring's hole), `rings-seared.png` (same rings, golden-brown, oil bubbling). All 1024x1536,
  scaled to cover 1080x1920. **Scene 1** is now the real pan: push-in on the empty hot pan,
  the raw rings drop in one by one (photoreal placement, nest included), sizzle starts, browning
  begins on "most squid seared", then a match cut dissolves the photo into the diagram pan.
  **Scene 11** returns to the real pan and finishes the browning while the closing question sits
  on screen: the dinner the whole video argued about is ready.
- **Placement made explicit everywhere.** Every ring now enters by a visible move from a counter
  strip below the pan: lift, arc over the rim, drop with a shrinking shadow, small bounce, settle
  (slide into its final spot), plus a warm sizzle puff on contact. The nest (scene 3) is the
  slowest and largest version: the small ring drops *through* the hole, wobbles, slides to its
  resting spot inside. Scenes 4-5, 8, 9 and 10 reuse the same move; full spec in the build notes.
- **Narration:** one line changed (scene 1, "Drop squid rings in a pan.", from the article's
  first sentence), +1 word. Every other line, number and source is unchanged. Sear glow in the
  diagram may now be warm amber to continue the photo (see build notes).

## Central visual metaphor: the pan from above

The whole video is one frying pan seen from above on the dark stage. Squid rings drop into it
one by one, each with its hole visible. The part of a ring that touches the pan **glows** (the
"sear"), so the viewer *sees* seared area instead of reading it. Two small dials sit above the
pan the whole time: **RINGS** (a count) and **SEARED** (a glow meter with the article's number).
The tension of the video is that the two dials want different pans.

The mechanism shot is the **nest**: a small ring drops *through the hole* of a big ring and lands
flat on the metal, its own glow lighting up untouched. A ring is an obstacle and a container at
once; that one motion is what makes the problem real.

Secondary motif: **split pan**. Two pans side by side, same rings on the counter, two different
choices, the dials disagreeing (scenes 4-5, 8, 10).

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Drop squid rings in a pan. Most rings, or most squid seared? | **Real cooking (photoreal).** 0.6 s lead-in before the voice: `pan-empty.png`, slow push-in (scale 1.00 → 1.06), oil shimmer (subtle displacement), faint heat haze. On "Drop squid rings": the seven raw rings land one by one (~0.35 s apart), each revealed from `rings-raw.png` through its own mask, entering at scale 1.15 with a soft shadow that tightens as it lands, a tiny bounce, a ring of oil ripple and 6-10 warm spark/droplet particles; the small ring lands last, *inside* the big ring's hole. Steam wisps start rising. On "most squid seared?": browning begins, cross-fade `rings-raw` → `rings-seared` to ~35 %, bubbling oil particles intensify. Last 0.5 s: match cut, the photo dims and desaturates while the drawn `RingPan` fades in registered on the same pan circle, the photo rings turning into annuli with the sear glow. The two dials (RINGS, SEARED) appear and tick up | bespoke: `CookingShot` (photo frames + particles) → `RingPan` (mode `drop`) | "Drop a handful of squid rings into a frying pan and you have already made a decision"; "You can lay them out so that as many rings as possible are in the pan. Or you can lay them out so that as much squid as possible is touching hot metal, which is the thing that actually cooks." |
| 2 | Sounds like one instruction twice. It isn't. | The pan splits into two pans; the dial labels slide apart, RINGS over the left pan, SEARED over the right | `RingPan` (mode `split`) | "Those sound like the same instruction phrased twice. They are not" |
| 3 | A ring has a hole: a small enough ring drops inside and still touches the pan. | Close-up: a big ring sits in the pan; a small ring lifts off the counter strip, arcs over the rim, hovers above the big ring (shadow wide and soft), then drops *through* its hole: scale 1.3 → 1, shadow shrinks to a tight contact line, a small wobble, and it slides a little to its resting spot on the metal inside. Warm sizzle puff on contact; its glow lights up in full (no dimming), the big ring's glow untouched. Slow (~2 s for the drop alone), the money shot | `RingPan` (mode `nest`) | "a ring has a hole. A small enough ring drops inside the hole of a larger one and sits flat on the pan, touching metal exactly as much as it would have on its own." |
| 4 | Three small rings side by side: three rings, about 69.7 of area. | Real instance, to scale: pan radius 10, width 1, rings on the counter 9.0, 4.2, 4.2, 4.2. The four rings wait on a counter strip under the two pans. Left pan: the three 4.2 rings are placed one after another (lift, arc, drop, bounce, slide into the side-by-side triangle), the RINGS dial clicking 1, 2, 3 on each landing. Dials: RINGS 3, SEARED ≈ 69.7 | `RingPan` (mode `compare`, left) | "If you want rings on the pan, take the three 4.2s: they fit side by side, N = 3, and they sear about 69.7." |
| 5 | The big one with a small one inside: two rings, about 76.7. | Right pan: the 9.0 is placed (it nearly fills the pan, a heavier, slower drop), then one 4.2 drops into its hole with the scene 3 nest move, shorter. Dials: RINGS 2, SEARED ≈ 76.7; the right pan's glow visibly brighter overall | `RingPan` (mode `compare`, right) | "If you want squid cooked, take the 9.0 and drop one 4.2 into its hole: only N = 2, but about 76.7 of contact area." |
| 6 | Three rings or more dinner. Not both. | Both pans held side by side; the winning dial on each side pulses (RINGS left, SEARED right) | `RingPan` (mode `compare`, hold) | "Three rings or more dinner. Not both." |
| 7 | But if every ring is bigger than all the smaller ones combined, | New set on the counter, by size: 9.95, 5.0, 4.3, 0.6. Each ring's smaller siblings appear as ghost outlines laid end to end along its diameter, a size check rather than a placement (with width 4.8 none of them nests), and the row comes up short of the edge, one check per ring (✓ ✓ ✓). Label "each ring > all smaller ones together" | bespoke: `RingPan` (mode `superincreasing`) | "Call the radii superincreasing when every ring is bigger than all the smaller ones put together" |
| 8 | one layout wins on area and a family of similar goals. Not on count. | Real instance (pan 10, width 4.8). Left: the greedy pan, 9.95 with the 5.0 nested, SEARED dial full, plus small tags "area", "radii", "perimeters" lighting up beside it. Right: 5.0, 4.3 and 0.6 in a row across the pan, RINGS 3 vs 2, the RINGS dial on the left stays dim | `RingPan` (mode `compare`) | "it simultaneously maximises ... for every positive, strictly increasing, superadditive v. Contact area is one such v. So is the sum of radii, and the sum of perimeters."; "Count itself is not rescued"; "The greedy takes {9.95, 5.0}: two rings, optimal area ... Meanwhile {5.0, 4.3, 0.6} packs in a row in the pan for three." |
| 9 | And where you put each ring stops mattering: tightest spot, roomiest, random, same result. | Three small pans in a row labelled TIGHTEST · ROOMIEST · RANDOM, same superincreasing set (illustrative). Rings are placed largest first, all three pans in sync: each ring hovers, its candidate containers outline briefly, it slides over the one its rule picks and drops in, so each pan picks differently (into a hole vs onto open metal), but the same rings end up in all three and the three SEARED dials land on the same value. Last beat: the round pans morph into a rectangular griddle and a sphere outline, the rings stay put; tag "any pan shape" | bespoke: `RingPan` (mode `oblivious`) | "Every descending greedy is optimal, with an arbitrary rule for choosing which container to drop each ring into. Best fit — the tightest container that will take it. Worst fit — the roomiest. Random. Adversarial. They all place exactly the same lex-max set."; "A round pan, a rectangular griddle, tubes and spherical shells nested in three dimensions ... are all covered verbatim" |
| 10 | Drop the condition and that still holds up to three rings. At four, it breaks. | Real instance: pan 15, width 0.3, rings 10, 5, 4.9, 4.8. Two pans. TIGHTEST: the 5 nests in the 10's hole, the 4.9 goes to the pan, the 4.8 hovers, tries the hole and the open metal in turn (a short slide to each, bumping back off), finds nowhere, red cross. ROOMIEST: 10 and 5 tangent in the pan, 4.9 and 4.8 filling the 10's hole exactly. RINGS 3 vs 4 | `RingPan` (mode `edge`) | "With arbitrary radii and no superincreasing hypothesis at all, every descending greedy on at most three rings still lands on the lex-max set."; "Best fit gets three rings. Worst fit gets four."; "It holds unconditionally at three and fails at four." |
| 11 | What am I actually maximising? That question decides the answer. | **Real cooking again (photoreal).** Reverse match cut: the drawn pan dissolves back into the photo, picking up where scene 1 left the browning (~35 %) and finishing it, cross-fade to 100 % `rings-seared.png` over the line; slow push-in (1.06 → 1.12), steam wisps and bubbling-oil particles, a few warm droplets popping. The two dials, RINGS and SEARED, small at the top with a "?" between them; the quote sits in the lower third on a dark scrim so it reads over the photo | `KeyQuote` over `CookingShot` (mode `finish`) | "'what am I actually maximising?' is not a philosophical warm-up question. It is the question that decides the answer." |
| 12 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, "Count the Rings or Sear the Squid" | outro | — |

**Word count (EN):** 12 + 7 + 16 + 12 + 12 + 7 + 12 + 14 + 14 + 15 + 10 + 3 = **134 words**
(v1.2: scene 1 +1 word). Spoken, the two decimals add 3 words each ("sixty-nine point seven"),
so ~140 spoken words: **about 54-58.5 s** (2.6-2.4 words/s), plus the 0.6 s sizzle lead-in of
scene 1: **≤ 59.1 s at the slow end**, inside the 60 s cap. Set `targetSeconds` to ~56. If a
take runs long, shorten the lead-in first, never add pauses. Caption speed at 2.4 words/s: every
narrated line 9.4-15.4 chars/s (max: scenes 9 and 11 at 15.4), under 17. The outro card
(24 chars) needs ≥ 1.5 s on screen to stay under 17 chars/s; run `npm run lint` once scaffolded.

## Notes for the build

- **`RingPan` (bespoke)**: one component, pure `frameState` + render split as in
  `examples/wheres-the-ball` (`PitchPlayback`). Draws 1-3 pans (circle or, in the `oblivious`
  morph, rectangle/sphere outline) and rings as annuli with outer radius r and hole r - w, in
  pan units scaled to the stage. Seared surface = the annulus, filled with the accent gradient
  and a soft glow; the pan is muted metal from `C`. Rings animate along a drop path (fall,
  small bounce, settle) to precomputed centres. Modes: `drop`, `split`, `nest`, `compare`,
  `superincreasing`, `oblivious`, `edge`. Dials (RINGS integer, SEARED with the article's
  rounded figure as a `display` string) are part of the component, not a separate `Counter`,
  so the numbers stay secondary to the pan.
- **Geometry, all from the article** (put in a committed `src/data/instances.ts`; positions
  computed once by a small script, not by hand, so no overlaps):
  - Minimal divergence: R = 10, w = 1, radii {9.0, 4.2, 4.2, 4.2}. Left: three 4.2s side by side
    (fits: three-circle threshold 0.4641 R = 4.641 > 4.2). Right: 9.0 with one 4.2 in its hole
    (hole 8). Areas recomputed from the article's formula: 3 a(4.2) = 69.74, a(9) + a(4.2) =
    76.65, matching "about 69.7" / "about 76.7".
  - Count not rescued: R = 10, w = 4.8, radii {9.95, 5.0, 4.3, 0.6}. Greedy: 9.95 with 5.0 in its
    hole (hole 5.15). Count optimum: 5.0, 4.3, 0.6 in a row (sum of diameters = 19.8 ≤ 20).
    Superincreasing check for scene 7: 5.0 > 4.3 + 0.6; 9.95 > 5.0 + 4.3 + 0.6 = 9.9; 4.3 > 0.6.
  - Four-ring edge: R = 15, w = 0.3, radii {10, 5, 4.9, 4.8}, hole of the 10 = 9.7. Worst fit:
    10 + 5 tangent in the pan, 4.9 + 4.8 filling the hole. Best fit: 5 in the hole, 4.9 in the
    pan, 4.8 left out. Use the article figure (`/blog/count-the-rings-fig-3-en.png`) as the
    layout reference.
  - Placement scene (scene 9): **illustrative**, not from the article. Any superincreasing set
    with thin rings where containers genuinely compete, e.g. R = 10, w = 1, radii
    {6, 2.8, 1.3, 0.6, 0.25} (6 > 4.95, 2.8 > 2.15, 1.3 > 0.85, 0.6 > 0.25). The theorem says
    the rules place the same *set*, not the same positions: the three pans must end with the
    same rings in, different layouts allowed, same SEARED value. Verify each layout with the
    position script (every ring inside its container, siblings disjoint).
    v1.1 review note: with R = 10 all five rings of this set fit, so "the same set" is simply
    "all of them" and only the layouts differ. That is valid and reads fine; if a sharper beat
    is wanted (one ring left out in all three pans, the same one), pick a tighter
    superincreasing instance and verify it with the same script.
- **Seared numbers are unit-less** (the article writes "about 69.7 of contact area"). Show
  "≈ 69.7" / "≈ 76.7" under SEARED; no units. Scenes 8-10 show no area numbers, only ring counts.
- **Spoken forms**: "69.7" → "sixty-nine point seven"; "76.7" → "seventy-six point seven".
  "javieraguilar.ai" as usual.
- **Sear colour** (v1.2): Javier allowed warm colours for the cooking. The photoreal scenes are
  warm by nature; the diagram's sear glow becomes a warm amber→orange so the match cuts between
  photo and diagram read as the same pan. UI (dials, labels, captions, outro) stays on brand.
- **`CookingShot` (bespoke, v1.2)**: renders the three Codex frames from
  `public/cooking/` as `<Img>` layers, all
  registered (same pan, same ring positions), `objectFit: cover` into 1080x1920 (1024x1536 →
  scale 1.25 = 1280x1920, ~100 px cropped each side: the pan rim is trimmed slightly, all seven
  rings stay in frame; the pan centre sits at y ≈ 45 %, leaving the lower third for captions).
  Layers, bottom to top: `pan-empty`; `rings-raw` revealed per ring through masks; `rings-seared`
  on top with an opacity driven by a `brown` value (0 → 0.35 in scene 1, 0.35 → 1 in scene 11).
  Per-ring masks: measure each ring's centre and outer/inner radius once on `rings-raw.png`
  (seven rings; the large ring left of centre with the small one in its hole) and store them in
  `src/data/cookingRings.ts`; the big ring's mask is an annulus so the nested small ring can land
  separately. Drop animation per ring: mask opacity 0 → 1 with the layer at scale 1.15 → 1
  around the ring centre (spring, slight overshoot), a blurred dark ellipse shadow from wide/soft
  to tight, then an oil ripple (expanding thin ring, fading) and 6-10 warm particles. Sizzle and
  steam are procedural particles (seeded, deterministic per frame): bubbles hugging each ring's
  edge, steam wisps as soft white blurred blobs drifting up and fading. Camera: a slow push-in
  only, no shake. Optional: a short sizzle SFX under the music, ducked under the voice.
- **Placement move (shared by `RingPan` in every scene that adds a ring)**: rings start on a
  counter strip under the pan(s), sorted by size. Move = lift (0.15 s, scale 1 → 1.1, shadow
  grows) → arc over the rim to above the target (0.35 s, ease-in-out) → drop (0.25 s, scale
  1.1 → 1, shadow shrinks to a contact line) → bounce (one small overshoot) → settle (slide the
  last few px to the precomputed centre). On contact: warm sizzle puff and the ring's sear glow
  ramps up over 0.3 s; the RINGS dial increments on the landing frame, the SEARED dial eases up
  to the new value. The nest (scenes 3 and 5) adds a hover over the hole and a wobble; a refused
  placement (scene 10) slides to a container, bumps back with a short shake, and ends in the
  red cross. Positions still come from the position script, so a placed ring never overlaps.
- Visuals are chosen for impact, not as a literal replay of the paper: the drop physics, the
  dials, the shape morph and the scene 9 instance are illustrative; the rigour lives in the
  article, the preprint and the repo. Narration and every number on screen stay faithful to
  the article.
- **No maths on screen**: no ρ, φ, formulas or "lex-max". The condition is shown as rings rolled
  out along a diameter; "superincreasing" is not said.
- **Left out of v1 (each a possible swap)**:
  - *The twins* (+~18 words): "No smarter rule fixes it: two pans look identical at the
    decisive moment and need opposite moves." Strong visual (two identical pans, the 5 hovering,
    then the hidden remaining rings revealed: 9.49 vs 9.50 against a 9.495 hole). Could replace
    scene 11 if the close feels soft; the video would then end on the sharpest result.
  - *The golden ratio threshold* and "three largest fit ⇒ all fit": too mathematical for 50 s.
  - *The idealisation* (real rings ride up on each other): not narrated; the drawing never
    shows overlap, consistent with the rigid model.
- **Credit line in the outro** (optional): "Preprint: Greedy Packing of Nested Rings
  (arXiv 2609.15554)". No external data to credit.
- ES cut: pending (EN-only for now).
