# Being Wrong Can Be Free — series video (EN) · script draft v1.2

Series: being-wrong-can-be-free (long post, 2026-09-15) + the-bug-nobody-can-reach (short post,
2026-09-17), javieraguilar.ai, EN. Vertical 9:16, target ~70 s, 154 words (179 as voiced, digits read out).
Data on screen: the ring instrument drawn to scale (inner radius 3.5, outer 5.0) and, in one
scene, the 3D doughnut (solid torus) control; trajectories
from the open code-world-models simulator where they can be extracted, otherwise illustrative.
ES column empty (EN-only for now).

Article keys used in the Source column: **[L]** = being-wrong-can-be-free (long),
**[S]** = the-bug-nobody-can-reach (short).

## Changes from feedback (v1.1 → v1.2)

- **Higher-dimensional case added** (Javier: "tenemos también los de más dimensiones, los
  añadiría a la lista"): new scene 10, the 3D doughnut (solid torus floating between robot and
  target), as a pseudo-3D animation (`TorusStage`). Numbers checked against both articles:
  route through the hole `0.019`, route into the tube `0.898`.
- **Length:** target raised from ~57 s to ~70 s (179 voiced words, ceiling 75 s). The only trim
  is "to four decimals" in scene 8 (the digit roll on screen keeps it); old scenes 10-12 are
  renumbered 11-13. The "Alternative scene" build note is removed (now in the cut).
- Paths and torus poses stay illustrative; only the two costs are data.

## Central visual metaphor: where the light reaches

The whole video is one top-down map on the dark brand background: a white robot dot, a gold
star (the high-value spot) and a rose ring (the fence) around it. Everything the robot can
actually reach is painted as **light**: a soft indigo glow that floods outward from the robot
and stops wherever the real fence stops it. Everything else stays dark. The model's mistakes
are drawn as a translucent overlay on top of the map, and the rule the video teaches is
visual: **a mistake in the dark costs nothing; the moment the light reaches it, it turns
red.**

Three beats on the same map carry the story:

1. **The dark inside.** The model paints the ring's interior as a filled disc. The light never
   gets past the rim, so the wrong region sits in the dark: uncatchable and free.
2. **The door in front.** A blind model (no fence at all) drives into the rim every step; then
   a door opens in the ring exactly where the robot is heading, the light pours through, and
   the cost meter collapses.
3. **The door behind.** The ring rotates, the same door ends up behind the star, the light is
   stopped at the rim again, and the meter swings back to the closed-ring value, digit for
   digit.

Then one beat leaves the flat map for the obvious objection ("in the real world I could go
around it"): **the doughnut.** The camera tilts up into 3D, a solid torus floats between robot
and star, a contact-free path arcs around it, and the cost still depends only on whether the
route crosses the solid part.

Recurring HUD: a thin horizontal **cost meter** at the top of the stage with three ticks,
`0 · free`, `1 · random`, and the needle allowed past 1 (the short post's scale). Numbers
support the map; they never take over the frame.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | An AI-written world model got a whole region wrong. No test can catch it. Cost: exactly nothing. | Black map. The rose ring and the gold star fade in; the robot dot sits to the left. On "whole region wrong" a translucent red **filled disc** (the model's version) slides over the ring and fills its hole. On "No test can catch it" a row of tiny sample ticks flashes green along the rim. On "exactly nothing" the cost meter drops in at the top and its needle sits on `0` | intro card over bespoke `ReachMap` (mode `hook`) | [S] "A model of the world can be flatly wrong about a whole region, pass every test you can write, and cost you exactly nothing — provably."; [S] "A language model is handed the physics and asked to write the simulator the planner will use" |
| 2 | A robot wants a high-value spot inside a fence that stops it on contact. | Overlay off. The robot drives straight at the star; the reach glow floods out behind it and **stops hard at the rim**; the robot freezes on contact with a small spark | bespoke `ReachMap` (mode `setup`) | [S] "A small robot on a plane. Somewhere on that plane there is a band it must not cross — a fence around a high-value spot it would otherwise drive straight at."; [L] "an annular band — inner radius 3.5, outer radius 5.0 — that freezes the mover the instant it touches" |
| 3 | The model wrote a filled disc. Wrong shape, but no run from outside gets in. | The red filled disc returns over the ring. A fan of dashed sample rollouts shoots in from every side; **every one of them stops at the rim**. The hole stays dark, untouched by any ray or by the glow; a faint label "never sampled" breathes inside it | bespoke `ReachMap` (mode `gauge`) | [S] "here is what the model writes: not a ring, but a filled disc. The whole interior marked as forbidden, when in truth only the rim is."; [S] "The fence stops the robot on contact, so no run that starts outside can ever end up inside" |
| 4 | No test can tell. The planner acts identically. | Two ghost robots, one labelled `truth`, one `model`, run from the same start. Their trails overlap pixel for pixel and both stop at the same point of the rim. Meter needle stays on `0` | bespoke `ReachMap` (mode `twin`) | [S] "therefore no observation that any test could ever make distinguishes the filled disc from the truth."; [S] "The planner trusting the filled disc picks the same action at every step as a planner holding the true map: same route, same result, same contacts, run for run, seed for seed. Not approximately — identically." |
| 5 | A second model omits the fence: 1.116, worse than acting at random. | A hard cut with a model chip swap so the switch reads with the sound off: the corner chip `model 1 · filled disc` (shown in scenes 1-4) slides out and `model 2 · no fence` slides in. The red overlay is wiped off; the model's map now shows open floor all the way to the star (a dashed "promised route" straight through the ring). The robot charges, hits the rim, replans the same route, hits again: a pulsing loop. The meter needle swings past the `1 · random` tick and lands on `1.116` | bespoke `ReachMap` (mode `blind`) | [S] "a model that simply does not know the fence is there at all"; [S] "Cost: **1.116** — worse than acting at random, because the model is not merely uninformative, it is actively promising a route that does not exist." |
| 6 | Open a door on its route. At a tenth of a radian, danger collapses. | **Bespoke centrepiece.** A gap cuts open in the ring on the robot's side, labelled `γ = 0.1 rad`. A ghost of one planner step appears beside it: it just fits. The glow leaks through the gap into the hole; the robot squeezes through on some tries. Meter falls from `1.116` to `0.348` | bespoke `ReachMap` (mode `doorFront`) | [L] "There is a knee, and it sits exactly where the channel becomes wide enough for a step to fit through: at $\gamma = 0.1$ the gap's arc is about 0.35 world-units, comparable to the planner's own step."; [L] "The synthesis arm reproduces the collapse on its own exploited blind artifacts [...]: 0.348 at the knee, 0.029 by $\gamma = 0.6$."; [L] linkedinSummary: "Open a channel in the band the planner can actually drive through — 0.1 radians, about a third of its own step — and the exploitation collapses: 1.116 with the band closed, 0.348 at that width, 0.029 once the channel is wide."; [S] "put that gap **in front of** the robot, on the way it already wanted to go" |
| 7 | Wide open: 0.029. | The door widens to `γ = 0.6`; the light floods the whole hole; the robot glides straight onto the star. Meter needle settles at `0.029`, almost on `0` | bespoke `ReachMap` (mode `doorFront`) | [L] "**Facing the start**, where the planner drives: at $\gamma = 0.6$ the blind artifact's play cost is 0.029."; [L] linkedinSummary: "0.029 once the channel is wide"; [S] "Same model. Same blindness. Same missing clause in the code. Cost: **0.029**." |
| 8 | Rotate that same door behind the goal: 1.116 again. | The ring turns 180° like a dial; the γ = 0.6 door slides round behind the star. The robot runs the same straight route and is stopped at the rim; the glow is cut off again and the hole goes dark. The meter swings back up and its digits roll into place one by one: `1.` `1` `1` `6` | bespoke `ReachMap` (mode `doorBack`) | [L] "**Hidden behind the lode**, where no plan ever goes: at the same $\gamma = 0.6$, the same gap, the same first Betti number of zero, it is 1.116 — which is also, to four decimals, what the band scores fully closed."; [S] "Cost: **1.116** again, to four decimals the same as the fully closed fence." |
| 9 | Same mistake, same shape of hole. Only reach changed. | Split stage: front-door map (`0.029`, lit) above, back-door map (`1.116`, dark) below. Three ticks appear between them: `same model`, `same mistake`, `same hole`. Then the only thing that differs lights up: the reach glow, bright in one, cut off in the other | bespoke `ReachMap` (mode `split`) | [S] linkedinSummary: "Same code, same mistake, same shape of hole. Only reach changed."; [S] "Same model, same mistake, same shape of hole. One number is 0.029 and the other is 1.116, and the only thing separating them is whether the robot's own path crosses the gap." |
| 10 | In 3D you can go around. Route through the doughnut's hole: 0.019. Into its tube: 0.898. Being on the path is what costs you. | **Bespoke 3D beat.** The flat map tilts back (camera pitches ~60°) so the plane becomes a floor in perspective; the ring fades out and a shaded indigo **solid torus** rises, floating between the robot and the star, slowly turning so its hole reads as a hole. On "go around" a thin cyan dashed arc swoops over the top of the torus from robot to star without touching it. On "through the doughnut's hole" the torus is oriented face-on to the route and the robot's straight path threads the hole cleanly onto the star; meter settles at `0.019`. On "Into its tube" the same torus slides sideways a little so the straight route now meets the tube: the robot hits it (spark, freeze), replans, hits again; the tube flushes red and the meter swings up to `0.898`, just under the `1 · random` tick. On "Being on the path" the cyan arc stays visible around the red tube: the way round existed all along. Chip stays `model 2 · no fence` | bespoke `TorusStage` (pseudo-3D) | [S] "So the paper runs the case where going around is genuinely possible: a doughnut-shaped region floating in three-dimensional space, between the robot and its target. Nothing is sealed off — there is an explicit route that goes around it without touching it at all."; [S] "Move it so the route threads the hole instead and the cost is **0.019**"; [S] "Put the doughnut so the planned route runs into its solid part and the cost is **0.898**."; [L] "Move the *tube* onto that axis, so the plan clips it, and it is 0.898"; [S] "Being on the path is what costs you, whether or not the thing encloses anything." |
| 11 | Does a plan cross where my model is wrong? That decides the cost. | Back to one map, zooming out: several translucent red patches (other places the model is wrong) scattered across a larger dark map; the robot's glow covers only part of it. Patches inside the glow pulse red, patches in the dark stay grey | bespoke `ReachMap` (mode `zoomOut`) | [L] "Which flips the question you should be asking. Not "is the model right?" but **"does the place where it is wrong intersect the operative reach of whatever is planning against it?"**"; [S] "**Does a plan cross the place where my model is wrong?** This decides what the error costs." |
| 12 | Where nothing goes, it's free today. No test will tell me when that stops. | A new goal star appears at the edge of the map; the robot's glow stretches toward it and, on "when that stops", swallows one of the grey patches, which turns red. No test tick fires | bespoke `ReachMap` (mode `zoomOut`, new goal) | [S] "**Where is my model wrong in a way nothing I run ever visits?** That part is free today — and it is also invisible to every test I have, so I will not be told when it stops being free."; [S] "**What would put a plan through it?** A new feature, a new goal, a shortcut someone adds next quarter." |
| 13 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, "Being Wrong Can Be Free". Small credit line (repo name only, no handle) | outro | — |

**Word count (EN):** 17 + 14 + 15 + 8 + 12 + 14 + 3 + 9 + 9 + 23 + 13 + 14 + 3 = **154 words** with
the outro, 151 without it. Voiced, the numbers are read out digit by digit ("one point one one
six", "zero point eight nine eight") and "3D" as "three D", which makes about 179 spoken words:
allow ~68-72 s with scene padding (hard ceiling 75 s). Caption speed peaks at ~16 chars/s
(scene 10, "Route through the doughnut's hole: 0.019."), under the 17 limit; split that caption
in two phrases if the voiced line comes in faster. Set `targetSeconds: 70` (lint allows ±20 %).
"To four decimals" in scene 8 is already cut (the digit roll on screen still carries it). If
the voiced cut still runs past 72 s, the next cut is "No test can tell." in scene 4 (the hook
already says it; the twin trails carry it on screen).

## Notes for the build

- **`ReachMap` (bespoke, carries the whole video).** One top-down 2D map, pure `frameState`
  + render split like `PitchPlayback` (wheres-the-ball) and `DotStage` (sport-from-motion).
  Layers, each independently fadeable:
  - **world**: rose annulus, inner radius 3.5, outer 5.0 (to scale), optional angular gap of
    width γ at a given orientation (`front` = facing the start, `back` = behind the lode);
    gold star at the centre (the lode); white robot dot outside the ring on the left.
  - **reach glow**: a soft indigo-violet field flooding from the robot's position, clipped by
    the true band (a flood fill or a precomputed reachable mask per configuration). This is
    the metaphor; it must read at phone size.
  - **model overlay**: translucent red filled disc (scene 1, 3) or a dashed "promised route"
    straight through the ring (scene 5); nothing for the truth.
  - **samples**: dashed rollout rays that all terminate on the rim (scene 3), as in the long
    post's `fig:gauge-unfalsifiable`.
  - **model chip**: small corner label, `model 1 · filled disc` (scenes 1-4) then
    `model 2 · no fence` (scenes 5-10), so the switch between the two wrong models reads
    without sound.
  - **robots**: one or two (truth / model) with short fading trails; contact = spark + freeze.
  - **cost meter HUD**: needle with ticks at 0 and 1 and room past 1; values shown exactly as
    the article writes them (`1.116`, `0.348`, `0.029`), animated between them, never a
    computed in-between number on screen when the needle rests.
  - modes: `hook`, `setup`, `gauge`, `twin`, `blind`, `doorFront`, `doorBack`, `split`,
    `zoomOut`.
- **`TorusStage` (bespoke, scene 10 only).** Pseudo-3D, no WebGL needed: a parametric torus
  (major radius R, minor radius r, e.g. R = 2r) sampled as a mesh of quads, projected with a
  simple perspective camera, painter-sorted and shaded by a fixed light (indigo body, lighter
  rim highlight), on the dark floor plane continued from `ReachMap` (grid lines in perspective
  sell the depth). The transition in is a camera pitch from top-down to ~60°, so it reads as the
  same world seen from the side. Elements: robot dot and star on the floor axis; a straight
  route line along the start-goal axis; a cyan dashed arc over the torus (the contact-free path
  from [S]'s figure); the torus in two poses, `threaded` (hole on the axis, face-on) and
  `clipped` (slid sideways so the tube sits on the axis), animated between them; contact =
  spark + freeze + tube tint to rose; the same cost meter HUD (`0.019` → `0.898`). Pure
  `frameState` + render, like `ReachMap`. All paths and poses are illustrative; the only data
  are the two numbers.
- **Which numbers belong where (check against factcheck.md):**
  - `1.116` = the blind (fence-omitting) synthesized artifacts with the band **closed**, and
    the same value with the gap hidden at γ = 0.6 (and 1.2). Not the filled-disc artifact: the
    filled disc costs nothing (identical play).
  - `0.348` = synthesized blind artifacts at the knee, γ = 0.1, door facing the start.
  - `0.029` = synthesized blind artifacts at γ = 0.6, door facing the start.
  - `0.019` / `0.898` = the blind model in the 3D solid-torus control: route threads the hole /
    route runs into the tube (same contact rarity, 0.0033, not shown on screen). Same blind
    model as scenes 5-9, so the chip stays `model 2 · no fence`.
  - Do **not** mix in the scripted dense sweep (0.999 closed, 0.139 at γ = 0.1): it is a
    different series; the video uses only the synthesized one so the three numbers are
    comparable.
  - The hidden-door comparison is at **γ = 0.6**, not 0.1: scene 8 rotates the wide door from
    scene 7, so "that same door" is the 0.6 one. The long post's frontmatter description
    ("opened a 0.1-radian door ... I hid the same door behind the goal") compresses this; the
    body is the authority.
- **Real data (optional, improves scenes 2, 5-8).** The ring instrument lives on the
  code-world-models branch `claude/paper-tres-topology-4w813y` (`ring2d` results, open-ring
  plans in `docs/superpowers/plans/2026-07-2{0,1}-*`). If the MPC episode traces for the truth
  planner and the blind model (closed / γ = 0.1 front / γ = 0.6 front / γ = 0.6 back) are saved
  or cheap to regenerate on CPU with the scripted blind model, extract one representative
  episode per configuration into a committed JSON (`scripts/extract-ring.py`, like
  wheres-the-ball's `extract-play.py`). Otherwise draw the paths illustratively: straight line
  at the lode, stop at the rim, repeated replans. No paid model calls are needed for this.
- **Illustrative, not claims:** the reach glow, the sample-tick row in the hook, how many tries
  the robot squeezes through at γ = 0.1, the "step fits" ghost, the zoom-out map with several
  red patches and the new goal in scenes 11-12, and everything in the 3D scene except its two
  numbers (torus proportions, camera move, the slide between poses, the arc's shape, the
  robot's bounces). The rigour lives in the articles and the repo.
- **Spoken forms:** "1.116" → "one point one one six"; "0.029" → "zero point zero two nine";
  "0.019" → "zero point zero one nine"; "0.898" → "zero point eight nine eight"; "3D" →
  "three D"; "AI-written" as written. Captions keep the article's digits.
- **Words to keep on screen** (labels, not captions): `truth`, `model`, `model 1 · filled disc`,
  `model 2 · no fence`, `γ = 0.1 rad`,
  `γ = 0.6`, `0 · free`, `1 · random`, `same model · same mistake · same hole`,
  `through the hole` / `into the tube` (scene 10 pose labels). No "Betti",
  "gauge" or "lode" on screen; the long post's jargon stays in the article.
- **Credit line in the outro:** "Simulator, results and proofs: code-world-models (open repo)". Repo name
  only: the GitHub handle is a personal name and stays off screen.
  No third-party data.
- **Left out on purpose:** the repair loop (903 artifacts, the two-ulp `sin` specimen), the
  sensor resolution limit and the pre-registered null (9 vs 2, p = 0.065), fences and the
  freedom patch, the n-dimensional shell (only the 3D torus is in). All in the long post.
- ES cut: pending (EN-only for now).
