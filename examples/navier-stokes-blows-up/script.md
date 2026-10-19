# Navier–Stokes Blows Up — article video (EN) · script draft v1.2 (approved)

Article: navier-stokes-blows-up (javieraguilar.ai, EN, published 2026-09-09). Vertical 9:16,
target ~54-58 s, 139 spoken words. This article explains OpenAI's result, not an experiment of
mine: the voice stays first person only where the article gives its own reading ("My reading
is...", row 12), and the proof is never presented as mine. ES cut: pending (EN-only for now).

Data on screen: no tracking or experiment data. The vortex threads are integrated from the
leading-order field the article's own figure script uses
(`personal-website/scripts/figures/navier-stokes-vortex-3d.py`), scaled with the paper's
exponents; everything else is drawn in code.

## Central visual metaphor: the drain that never stops tightening

The whole video is one vortex, seen slightly from above on the dark stage, like water going
down a drain. It starts as calm, almost still threads (the fluid at rest), gets a soft
oscillating push, and from then on only tightens: threads spiral inward (indigo) and leave
along the axis above and below a dividing plane (violet), the core thins faster than it
shortens, and a clock in the corner runs down the time left, `τ → 0`, toward the singular time
`t = 1`. A thin speed gauge beside it climbs and, at the end, its needle leaves the dial.

The twist comes when the camera follows the core in: at the bottom of the zoom the smooth
threads stop being lines and break into individual particles bouncing about. The fluid stops
being a fluid. That is the article's "edge": the equations do not predict an infinitely fast
fluid, they predict their own boundary.

Secondary motif: **the skater**. A minimal line silhouette of a skater pulling in their arms
sits beside the vortex for one beat (and returns, still, under the closer in v1.2), and its arm span shrinks in lock-step with the core
radius, so the viewer sees the same mechanism twice.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | A fluid at rest. A smooth push. Its speed goes to infinity. | Black stage, faint still threads (a fluid at rest). On "smooth push", soft oscillating pulses ripple in from the edges (the force). On "infinity", the threads whip into a spiral and the speed gauge's needle flicks to "∞". Title "Navier–Stokes blows up" large over the first ~2.5 s (it carries the hook before the narration reaches "infinity"), then shrinks to the top of the stage | intro (hook card) over bespoke `VortexCore` (mode `hook`) | "a smooth fluid, starting from rest under a smooth external force, whose speed grows without bound while its total energy stays finite"; "has a maximum speed that goes to infinity as time approaches 1" |
| 2 | OpenAI proved it can happen, with some 10,000 agents. | Thousands of tiny glowing dots (the agents) drift in a cloud, flicker as if messaging, then stream together and settle onto the vortex threads, drawing the spiral. Small label "~10,000 agents · ~88 h" | bespoke: `SwarmToVortex` | "OpenAI published a proof that the three-dimensional incompressible Navier–Stokes equations can develop a singularity in finite time"; "Concurrent agents in the Navier–Stokes group: on the order of 10,000"; figure: "~10,000 agents on every Millennium problem"; "a ten-thousand-agent swarm" |
| 3 | You've seen the shape: water going down a drain. | Camera tilts to look down the vortex: a drain-like funnel, threads circling a dark centre | `VortexCore` (mode `drain`) | "Anyone who has watched water go down a drain can read the shape of it." |
| 4 | It spirals in and spins up, like a skater pulling in their arms. | Indigo threads spiral inward and visibly speed up near the axis. Beside it, a line skater pulls in their arms; arm span shrinks in sync with the core radius | `VortexCore` (mode `skater`) + skater inset | "Pull it inward and it spins faster. This is the skater pulling in their arms" |
| 5 | It leaves along the axis: the core stretches and thins. | Violet threads shoot out along the axis, up on one side of the dividing plane and down on the other. The core is pulled long and thin, like spaghetti | `VortexCore` (mode `stretch`) | "The fluid spiralling toward the axis leaves along it, upward on one side of a dividing plane and downward on the other. The core stretches while it thins"; "Stretching a spinning tube along its axis thins it and, by the first point, spins it up." |
| 6 | Its radius shrinks like the square root of the time left. | Three ghosted snapshots t₁, t₂, t₃ of the core shrink in sequence (as in the article's figure). Clock "τ = time left" runs down; label "radius ∝ τ^1/2" | `VortexCore` (mode `collapse`) | "the core of the vortex has a radius that shrinks like the square root of the time left" |
| 7 | Its peak speed has no ceiling. | Speed gauge needle climbs past the top of its scale and leaves the dial; label "peak speed ∝ τ^−1/2−h". A faint "core energy → 0" ticks down underneath | `VortexCore` (mode `collapse`, gauge) | "a peak speed that grows slightly faster than one over that square root"; "whose speed grows without bound"; "the core's kinetic energy actually *decreases* to zero as the singularity approaches" |
| 8 | Intuitive to read. Not to prove. | Every on-screen arrow briefly flares (everything diverging), then the flares cancel to a calm glow; the clock keeps running. Small label "h < 1/100" | `VortexCore` (mode `balance`) | "Intuitive to read; not to prove."; "The part that is not intuitive, and that took the machine, is the balance."; "Everything in the equations diverges, and the divergences must cancel precisely enough to leave a smooth force behind."; "with exponent below one hundredth" |
| 9 | Long before the end, the core is narrower than air's mean free path. | Camera dives into the core. A scale bar labelled "mean free path of air molecules" appears; the core slips below it | bespoke: `ContinuumBreak` (zoom) | "Long before the time left reaches zero, the core is narrower than the mean free path of air molecules, the speed is past the speed of sound, and incompressibility... is already false." |
| 10 | The equations don't predict an infinitely fast fluid. | At the bottom of the zoom the smooth threads pixelate and break into discrete particles bouncing off each other | `ContinuumBreak` (dissolve) | "The equations do not predict an infinitely fast fluid." |
| 11 | They predict their own boundary. | Pull back: a thin ring marks where the threads end and the particles begin, the edge of the continuum | `ContinuumBreak` (edge) | "They predict their own boundary." |
| 12 | My reading: for wings, weather or blood flow, nothing changes. | Three small line icons (wing, cloud, artery) sit calmly outside the ring, untouched; the vortex keeps spinning far away | `ContinuumBreak` (edge) + icons | "Everything they are used for, aircraft design, weather forecasting, blood flow"; "Nothing changes for the people who use the equations."; "My reading is that the practical consequence for the overwhelming majority of fluid mechanics is nil" |
| 13 | It needs that push. A fluid left alone? Still open. | Back to the vortex. On "push", the oscillating force pulses light up around the core and visibly feed it (small label "pushed by a smooth force · proved"). On "left alone", the pulses switch off and the vortex freezes into a dashed, muted ghost with a slow-pulsing "?" over the core (label "left alone · still open") | `VortexCore` (mode `unforced`) | "C and D ask whether a fluid pushed by a smooth force can; now it can."; "A and B ask whether a fluid left alone can break down; nobody knows that yet."; "whether a fluid with no one pushing it can blow up, is exactly as open as it was last week" |
| 14 | It took ninety years and a machine to write it down, and about a minute to explain. | The ghosted vortex fades back to the full, calm drain seen from above; the skater inset returns beside it, arms pulled in, and both hold still on "explain". No labels (the line carries it). Two caption cues, split after "down," | `VortexCore` (mode `closer`) + skater inset | "It took ninety years and a machine to write it down, and about a minute to explain." (verbatim, the article's last line) |
| 15 | (no narration) | Outro card, held ~2 s, silent under music: AGILabs badge, javieraguilar.ai, "Navier–Stokes Blows Up", and the credit line "Route opened in Madrid by Córdoba & Martínez-Zoroa · Proof: OpenAI (paper + Lean formalization) · Vortex drawn from the paper's leading-order flow" | outro | Credit: "The route was opened in Madrid"; "Diego Córdoba, at the Institute for Mathematical Sciences in Madrid, and Luis Martínez-Zoroa, at CUNEF University, have been building forced blow-ups"; "The proof comes as a 166-page paper and a Lean formalization" |

**Word count (EN):** 12 + 9 + 9 + 13 + 10 + 11 + 6 + 6 + 13 + 8 + 5 + 10 + 10 + 17 + 0 =
**139 words** (v1.2 recount; "10,000" counted as one token, spoken "ten thousand"), about
58 s at ~2.4 words/s (~54 s at 2.6), plus the ~2 s silent outro card: total ≤ 60 s. One word
under the 140 cap.

Caption speed (v1.2 recount): at 2.4 words/s every cue is at or under 15.9 chars/s. At 2.6
words/s row 10 alone runs ~17.2 chars/s, over the limit: hold its cue ~0.2 s into the pause
before row 11 rather than cutting words (it is near-verbatim). Rows 11 and 12 sit at
~16.1-16.6 at 2.6. Row 14 (83 chars) runs ~12.7 chars/s but is long for one cue: split it into
two after "down,". The outro is a silent card, not a timed caption. Re-check with
`npm run lint` after TTS (row 2 will run slower spoken, "ten thousand").

## Notes for the build

- **`VortexCore` (bespoke, the protagonist)**: a 3/4-view vortex of ~40-60 threads drawn as
  SVG paths. Inflow threads in the indigo end of the gradient, axial outflow in the violet end
  (the article's figure uses teal and amber; the video stays in brand colours). Pure
  `frameState` with a continuous `tau` (time left) driving the scaling: radius ∝ τ^(1/2),
  height ∝ τ^(1/2−h), angular speed of the thread animation ∝ 1/radius. Modes: `hook`,
  `drain`, `skater`, `stretch`, `collapse`, `balance`, `unforced`, `closer`. Overlays: corner clock ("τ = time left",
  counting toward t = 1), speed gauge whose needle leaves the dial at the end of `collapse`,
  the optional ghost snapshots t₁/t₂/t₃.
- **Exaggerated stretching, on purpose**: at the true exponent (h < 1/100) radius and height
  would shrink indistinguishably. As in the article's figures (and the paper's own schematic),
  exaggerate h so the core visibly thins faster than it shortens. Say so in the factcheck, not
  on screen.
- **Real data to extract**: a small script (`scripts/extract-threads.py`) that reuses the
  field and integrator of `personal-website/scripts/figures/navier-stokes-vortex-3d.py`
  (u_r = −a r, u_z = 2 a z, u_θ = (Γ/r)(1 − e^(−a r²/2ν))), integrates N seed points and writes
  the trajectories (normalised cylindrical coordinates) to `src/data/threads.json`. The
  component only rescales them with `tau`. No other data.
- **`SwarmToVortex` (bespoke)**: ~1,500-3,000 drawn dots standing for the swarm (not literally
  10,000; the label carries the number), random walk with brief link flickers, then each dot
  eases onto a point sampled along the threads of `VortexCore` so the hand-off into scene 3 is
  seamless. The label "~10,000 agents · ~88 h" uses the article's figure form.
- **`ContinuumBreak` (bespoke)**: a zoom into the core in three beats: scale bar ("mean free
  path of air molecules") with the core sliding under it; the threads resampled into
  particles that switch from following the flow to bouncing (simple elastic jitter); pull back
  to a ring marking where the continuum ends, with the three usage icons outside it.
- **Skater inset**: a minimal line figure (no face, brand stroke), arms span tied to the
  core radius from the same `frameState`.
- **`unforced` scene (replaces the v1 `StatGrid`)**: a 2×2 grid of letters A-D meant nothing
  without the Clay framing and was the one text-tile scene. Instead the mechanism stays on
  screen: the force pulses (same drawing as the hook) feed the vortex, then switch off and the
  vortex goes to a dashed, muted ghost with a "?". Labels "pushed by a smooth force · proved" /
  "left alone · still open" (the grid caption's wording). The letters C/D and A/B are dropped
  from the screen; they are not spoken either.
- **`FlowDiagram` ladder: dropped in v1.2.** Row 14 is now the article's closer and the
  Madrid credit moved to the outro card, so the ladder scene (and the Alpöge & Buckmaster rung
  question) is gone.
- **Visuals are chosen for impact, not as a literal reconstruction**: the push pulses, the
  swarm settling onto the threads, the flares that cancel and the particle dissolve are
  stylised. The rigour lives in the article, the paper and the Lean files. Narration and every
  number or label on screen stay faithful to the article.
- **Numbers and labels on screen, exactly as the article writes them**: "~10,000 agents",
  "~88 h" (figure form; the table says "about 88 hours"), "radius ∝ τ^1/2", "peak speed ∝
  τ^−1/2−h", "h < 1/100", "t = 1", "τ = time left", "core energy → 0" (from "core energy ∝
  τ^(1/2−3h) → 0"). No speed values in m/s: the gauge has no numbers.
- **Spoken forms**: "10,000" → "ten thousand". Córdoba, Martínez-Zoroa and javieraguilar.ai
  are no longer spoken (v1.2): they appear only on the outro card.
- **Credit line in the outro** (v1.2, carries the Madrid credit that used to be spoken):
  "Route opened in Madrid by Córdoba & Martínez-Zoroa · Proof: OpenAI (paper + Lean
  formalization) · Vortex drawn from the paper's leading-order flow". Two lines on a phone if
  needed; the Madrid credit goes first.
- **No company material**: the article's dispute section (Alpöge, Buckmaster, Anthropic,
  Bubeck) is left out of the video on purpose; the only name spoken is OpenAI; Córdoba and
  Martínez-Zoroa are credited on the outro card.
- **Alternative hook (not in v1)**: "Navier–Stokes can blow up, and you can picture it." if the
  equations should be named aloud in the first 3 s (v1 only shows the title on screen).

## Changes from feedback (v1.1 → v1.2)

Javier approved the script and chose the alternative closer.

- **Row 14 is now the article's last line**, verbatim: "It took ninety years and a machine to
  write it down, and about a minute to explain." Narration ends there; the ladder scene
  (`FlowDiagram`) is dropped and `VortexCore` gets a `closer` mode (calm drain + skater).
- **Madrid credit moved to the outro card**: "Route opened in Madrid by Córdoba &
  Martínez-Zoroa" leads the credit line. The spoken "More at javieraguilar.ai" is dropped; the
  outro is a silent ~2 s card with the URL.
- **Trims to stay ≤ 140 words** (147 → 139): row 2 drops "a swarm of" (the swarm is on
  screen); row 5 drops "spins faster" (already said in row 4) → "stretches and thins"; row 13
  drops "though"; outro line not spoken (−3).

