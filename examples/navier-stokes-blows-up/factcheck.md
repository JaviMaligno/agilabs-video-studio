# Fact-check: Navier–Stokes Blows Up (EN vertical) · draft v1.2 (approved)

Source: `src/content/blog/en/navier-stokes-blows-up.md` on `main` (personal-website, last
change 1588971). Every spoken claim and every number or label shown on screen, with the
article sentence it rests on. Visuals that are illustrative (the push pulses, the swarm, the
skater, the flares, the particle dissolve, the gauge) are not claims and are listed at the end.

## Narration

| # | Claim (spoken) | Where | Article sentence |
|---|---|---|---|
| 1 | "A fluid at rest. A smooth push. Its speed goes to infinity." | hook | "a smooth fluid, starting from rest under a smooth external force, whose speed grows without bound while its total energy stays finite"; "the fluid that starts at rest under that force is smooth for all times before 1, has bounded kinetic energy throughout, and has a maximum speed that goes to infinity as time approaches 1" |
| 2 | "OpenAI proved it can happen, with some 10,000 agents." | swarm | "On 8 September OpenAI published a proof that the three-dimensional incompressible Navier–Stokes equations can develop a singularity in finite time"; "Concurrent agents in the Navier–Stokes group: on the order of 10,000"; figure: "~10,000 agents on every Millennium problem"; takeaway: "a ten-thousand-agent swarm". "Some 10,000" stands for "on the order of 10,000" (same hedge, not a count). |
| 3 | "You've seen the shape: water going down a drain." | drain | "Anyone who has watched water go down a drain can read the shape of it." |
| 4 | "It spirals in and spins up, like a skater pulling in their arms." | skater | "The construction is a vortex that spirals inward while stretching along its axis."; "Pull it inward and it spins faster. This is the skater pulling in their arms" |
| 5 | "It leaves along the axis: the core stretches and thins." | stretch | "The fluid spiralling toward the axis leaves along it, upward on one side of a dividing plane and downward on the other. The core stretches while it thins"; "Stretching a spinning tube along its axis thins it and, by the first point, spins it up." |
| 6 | "Its radius shrinks like the square root of the time left." | collapse | "the core of the vortex has a radius that shrinks like the square root of the time left"; "The radius shrinks as the square root of the time left" |
| 7 | "Its peak speed has no ceiling." | collapse | "a peak speed that grows slightly faster than one over that square root"; "whose speed grows without bound"; "a maximum speed that goes to infinity as time approaches 1" |
| 8 | "Intuitive to read. Not to prove." | balance | "Intuitive to read; not to prove." (verbatim, punctuation adapted) |
| 9 | "Long before the end, the core is narrower than air's mean free path." | zoom | "Long before the time left reaches zero, the core is narrower than the mean free path of air molecules" |
| 10 | "The equations don't predict an infinitely fast fluid." | dissolve | "The equations do not predict an infinitely fast fluid." |
| 11 | "They predict their own boundary." | edge | "They predict their own boundary." |
| 12 | "My reading: for wings, weather or blood flow, nothing changes." | edge | "Everything they are used for, aircraft design, weather forecasting, blood flow, relies on that continuum picture"; "Who does this affect? Almost nobody who uses them."; takeaway: "Nothing changes for the people who use the equations."; "nothing in a wing, a hurricane, or an artery supplies it". v1.1 puts the body's hedge back: "My reading is that the practical consequence for the overwhelming majority of fluid mechanics is nil" (it is the article's own first-person reading, so the line is no stronger than the body and no weaker than the takeaway). |
| 13 | "It needs that push. A fluid left alone? Still open." | grid | "C and D ask whether a fluid pushed by a smooth force can; now it can."; "A and B ask whether a fluid left alone can break down; nobody knows that yet."; "the question most people mean by it, whether a fluid with no one pushing it can blow up, is exactly as open as it was last week" |
| 14 | "It took ninety years and a machine to write it down, and about a minute to explain." | closer | Verbatim, the article's last line (takeaways, "The shape was always there."): "It took ninety years and a machine to write it down, and about a minute to explain." "Ninety years" rests on "ninety years after Leray"; "a machine" on the AI-produced proof. |
| 15 | (none: the outro is a silent card in v1.2) | outro | — |

## Numbers and labels on screen

| On screen | Where | Article sentence |
|---|---|---|
| Title "Navier–Stokes blows up" | hook | Article title "Navier–Stokes Blows Up, and the Blow-up Is a Vortex You Can Picture" |
| Gauge needle to "∞" | hook, collapse | "a maximum speed that goes to infinity as time approaches 1" |
| "~10,000 agents · ~88 h" | swarm | Figure: "~10,000 agents on every Millennium problem", "Sep 5 · 88 h"; table: "on the order of 10,000", "about 88 hours (1 to 5 September)" |
| "τ = time left", clock toward "t = 1" | collapse, balance | Figure: "τ = time left before the singularity", "t₃ → 1"; "smooth for all times before 1" |
| Snapshots "t₁", "t₂", "t₃" | collapse | Figure labels "t₁", "t₂", "t₃ → 1" |
| "radius ∝ τ^1/2" | collapse | Figure: "radius ∝ τ^1/2"; "radius that shrinks like the square root of the time left" |
| "peak speed ∝ τ^−1/2−h" | collapse | Figure: "peak speed ∝ τ^−1/2−h" |
| "core energy → 0" | collapse | Figure: "core energy ∝ τ^1/2−3h → 0"; v1 said bare "energy → 0", which could be read as contradicting "bounded kinetic energy throughout"; "the core's kinetic energy actually *decreases* to zero as the singularity approaches" |
| "h < 1/100" | balance | Figure: "h < 1/100"; "with exponent below one hundredth" |
| Scale bar "mean free path of air molecules" | zoom | "the core is narrower than the mean free path of air molecules" |
| Icons wing / cloud / artery | edge | "aircraft design, weather forecasting, blood flow"; "nothing in a wing, a hurricane, or an artery supplies it" |
| Labels "pushed by a smooth force · proved"; "left alone · still open" (v1.1: grid tiles replaced by the vortex with the force on / off) | unforced | Grid figure: "C proved · Sep 2026", "D proved · Sep 2026 (follows from C)", "A still open", "B still open"; caption: "A and B ask whether a fluid left alone can break down ... C and D ask whether a fluid pushed by a smooth force can; now it can." |
| Outro "Navier–Stokes Blows Up" · credit "Route opened in Madrid by Córdoba & Martínez-Zoroa · Proof: OpenAI (paper + Lean formalization) · Vortex drawn from the paper's leading-order flow" (v1.2: the Madrid credit is no longer spoken, it leads the card) | outro | Section heading "The route was opened in Madrid"; "Diego Córdoba, at the Institute for Mathematical Sciences in Madrid, and Luis Martínez-Zoroa, at CUNEF University, have been building forced blow-ups"; "The proof comes as a 166-page paper and a Lean formalization"; figure caption: "Threads integrated from the paper's leading-order field" |

## Illustrative, not claims

- **The vortex threads** are integrated from the leading-order (Burgers-type) field that the
  article's figure script uses, not traced from the paper's figure; the axial stretching is
  exaggerated, as in the article's and the paper's schematics ("at the true exponent the
  difference would be invisible"). Thread count, colours (brand indigo/violet instead of the
  article's teal/amber) and camera angle are stylistic.
- **The push** is drawn as soft oscillating pulses, a nod to "spatially oscillatory pulses",
  not a depiction of the actual force field.
- **The swarm** is ~1,500-3,000 drawn dots standing for "on the order of 10,000" agents; the
  agents did not literally "draw" the vortex. Message flickers are decorative.
- **The skater** inset and its arm span tied to the core radius are an analogy the article
  makes ("This is the skater pulling in their arms"), not a physical model.
- **The flares that cancel** in row 8 stand for "the divergences must cancel"; they do not
  depict the paper's four diverging terms or its order-by-order corrections.
- **The particle dissolve** shows the continuum picture failing ("you would have to track the
  particles one by one"); particle sizes, spacing and the zoom scale are not to scale.
- **The gauge** has no numeric scale; only its needle leaving the dial is meant.
- **The force switching off** in row 13 (v1.1) illustrates "a fluid left alone"; the ghosted
  vortex with a "?" is not a claim that an unforced flow would or would not blow up.
- **The closer scene** (v1.2: calm vortex + skater holding still) is a visual rest under the
  last line, not a claim.

## Changes from feedback (v1.1 → v1.2)

- Row 14 replaced by the article's last line (verbatim, checked against `main`); row 15 is no
  longer spoken.
- Ladder (`FlowDiagram`) labels removed from the on-screen table: the scene is dropped. The
  Madrid credit (Córdoba & Martínez-Zoroa) now leads the outro credit line, with its sources.
- Rows 2, 5 and 13 trimmed (wording shortened only; sources unchanged): "a swarm of",
  "spins faster" and "though" removed. Total 139 words.
