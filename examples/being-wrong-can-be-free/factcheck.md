# Fact-check: Being Wrong Can Be Free (EN vertical) · draft v1.2

Sources (personal-website, `src/content/blog/en/`):

- **[L]** `being-wrong-can-be-free.md` (long post, pubDate 2026-09-15)
- **[S]** `the-bug-nobody-can-reach.md` (short post, pubDate 2026-09-17)

Every spoken claim and every number or claim shown on screen, with the article sentence it rests
on. Visuals that are illustrative (the reach glow, how the robot moves, the zoom-out map) are not
claims and are listed at the end.

## Narration

| # | Claim (spoken) | Where | Article sentence |
|---|---|---|---|
| 1 | "An AI-written world model got a whole region wrong." | hook | [S] "A model of the world can be flatly wrong about a whole region"; [S] "A language model is handed the physics and asked to write the simulator the planner will use" |
| 1 | "No test can catch it." | hook | [S] "**No test can catch it.** Not "we got unlucky", not "you would need more samples". There is a proof."; [L] "**unfalsifiable by any sampling gate.** Not "unlikely to be caught" — there is a proof, and it needs no assumption about sample size or tolerance." |
| 1 | "Cost: exactly nothing." | hook | [S] "pass every test you can write, and cost you exactly nothing — provably."; [S] "**It costs nothing.**" |
| 2 | "A robot wants a high-value spot inside a fence that stops it on contact." | setup | [S] "A small robot on a plane. Somewhere on that plane there is a band it must not cross — a fence around a high-value spot it would otherwise drive straight at."; [S] "The fence stops the robot on contact"; [L] "an annular band [...] that freezes the mover the instant it touches" |
| 3 | "The model wrote a filled disc. Wrong shape," | gauge | [S] "Close the band fully — a complete ring around the spot — and here is what the model writes: not a ring, but a filled disc. The whole interior marked as forbidden, when in truth only the rim is. Wrong about the shape of the world, not by a millimetre but categorically." |
| 3 | "but no run from outside gets in." | gauge | [S] "The fence stops the robot on contact, so no run that starts outside can ever end up inside"; [L] "no rollout that starts outside can ever be inside the hole" |
| 4 | ~~"No test can tell."~~ (cut in the build, see note D) | twin | [S] "therefore no observation that any test could ever make distinguishes the filled disc from the truth." |
| 4 | "The planner acts identically." | twin | [S] "The planner trusting the filled disc picks the same action at every step as a planner holding the true map: same route, same result, same contacts, run for run, seed for seed. Not approximately — identically."; [L] "Paired-seed MPC episodes confirm it exactly, not approximately." |
| 5 | "A second model omits the fence" | blind | [S] "That was one kind of wrong model [...] Here is the other"; [S] "a model that simply does not know the fence is there at all. It is the common case: the description omitted the fence, the test runs never happened to touch it, so the code came back without it." ([L] calls it "the blind artifact") |
| 5 | "1.116" (closed fence on the route) | blind | [S] "Now the fence *is* on the route. [...] Cost: **1.116**"; [S] "Cost: **1.116** again, to four decimals the same as the fully closed fence."; [L] figure caption: "the synthesized artifacts from 1.116 to 0.348 at the knee" |
| 5 | "worse than acting at random" | blind | [S] "Cost: **1.116** — worse than acting at random, because the model is not merely uninformative, it is actively promising a route that does not exist."; scale: [S] "**Zero means the wrong model costs nothing. One means you might as well have acted at random. Above one means the model actively steered you somewhere worse than random.**" |
| 6 | "Open a door on its route." | doorFront | [S] "cut a gap in the fence wide enough to drive through, and put that gap **in front of** the robot, on the way it already wanted to go." |
| 6 | "At a tenth of a radian, danger collapses." | doorFront | [L] linkedinSummary: "Open a channel in the band the planner can actually drive through — 0.1 radians, about a third of its own step — and the exploitation collapses: 1.116 with the band closed, 0.348 at that width, 0.029 once the channel is wide."; [L] description: "Then I opened a 0.1-radian door in that region and the danger collapsed"; [L] "There is a knee, and it sits exactly where the channel becomes wide enough for a step to fit through: at $\gamma = 0.1$ the gap's arc is about 0.35 world-units, comparable to the planner's own step. The synthesis arm reproduces the collapse on its own exploited blind artifacts [...]: 0.348 at the knee, 0.029 by $\gamma = 0.6$." See note A. |
| 7 | "Wide open: 0.029." | doorFront | [L] linkedinSummary: "0.029 once the channel is wide"; [L] "**Facing the start**, where the planner drives: at $\gamma = 0.6$ the blind artifact's play cost is 0.029."; [S] "Same model. Same blindness. Same missing clause in the code. Cost: **0.029**. Almost nothing" |
| 8 | "Rotate that same door behind the goal: 1.116 again." | doorBack | [L] "**Hidden behind the lode**, where no plan ever goes: at the same $\gamma = 0.6$, the same gap, the same first Betti number of zero, it is 1.116"; [S] "put the same gap — identical width [...] — round the back, where no route ever goes. Cost: **1.116** again"; [S] figure caption: "The same blind model in two worlds that differ by a rotation." |
| 9 | "Same mistake, same shape of hole. Only reach changed." | split | [S] linkedinSummary: "Same code, same mistake, same shape of hole. Only reach changed."; [S] "Same model, same mistake, same shape of hole. One number is 0.029 and the other is 1.116, and the only thing separating them is whether the robot's own path crosses the gap." |
| 10 | "In 3D you can go around." | torus | [S] "So the paper runs the case where going around is genuinely possible: a doughnut-shaped region floating in three-dimensional space, between the robot and its target. Nothing is sealed off — there is an explicit route that goes around it without touching it at all."; [L] "a solid torus in $\mathbb{R}^3$ placed between start and lode, which does not separate space at all. An explicit path goes around it and reaches the far side without ever touching it." |
| 10 | "Route through the doughnut's hole: 0.019." | torus | [S] "Move it so the route threads the hole instead and the cost is **0.019**"; [L] "Put the *hole* on the start–lode axis, so the plan threads it, and the blind model's play cost is 0.019." |
| 10 | "Into its tube: 0.898." | torus | [S] "Put the doughnut so the planned route runs into its solid part and the cost is **0.898**."; [L] "Move the *tube* onto that axis, so the plan clips it, and it is 0.898"; [L] figure caption: "the same object, moved so the route runs into the tube, and it costs 0.898" |
| 10 | "Being on the path is what costs you." | torus | [S] "Being on the path is what costs you, whether or not the thing encloses anything."; [L] "**Danger is path-relative**: an omission on the path is exploited whether or not it encloses anything." |
| 11 | "Does a plan cross where my model is wrong? That decides the cost." | zoomOut | [S] "**Does a plan cross the place where my model is wrong?** This decides what the error costs."; [L] "*does a plan cross it?* decides the cost"; [L] "Which flips the question you should be asking. Not "is the model right?" but **"does the place where it is wrong intersect the operative reach of whatever is planning against it?"**"; [S] "**Does a plan cross the place where my model is wrong?** This decides what the error costs." |
| 12 | "Where nothing goes, it's free today." | zoomOut | [S] "**Where is my model wrong in a way nothing I run ever visits?** That part is free today" |
| 12 | "No test will tell me when that stops." | zoomOut | [S] "— and it is also invisible to every test I have, so I will not be told when it stops being free." |
| 13 | "More at javieraguilar.ai" | outro | — |

## Numbers and claims on screen

| On screen | Where | Article sentence |
|---|---|---|
| Ring drawn to scale, inner 3.5 / outer 5.0, star at the centre | all map scenes | [L] "an annular band — inner radius 3.5, outer radius 5.0"; [L] "Inside the ring's hole sits a high-reward "lode" the planner would love to visit."; [L] figure caption: "The instrument, drawn to scale" |
| Red filled disc over the ring | 1, 3 | [S] "not a ring, but a filled disc. The whole interior marked as forbidden" |
| Dashed sample rays all ending at the rim; "never sampled" inside | 3 | [L] figure caption: "Every rollout that starts outside is stopped at the rim, so the sampled transitions are identical under both models; the two differ only inside the hole, which is exactly where no rollout can be." |
| Twin `truth` / `model` trails overlapping exactly; meter at `0` | 4 | [S] "same route, same result, same contacts, run for run, seed for seed. Not approximately — identically."; [S] "Zero means the wrong model costs nothing." |
| Meter ticks `0 · free`, `1 · random`, needle past 1 | 1, 4-8, 10 | [S] "Zero means the wrong model costs nothing. One means you might as well have acted at random. Above one means the model actively steered you somewhere worse than random." |
| `1.116` (closed, blind) | 5 | [S] "Cost: **1.116**"; [L] figure caption: "the synthesized artifacts from 1.116" |
| Dashed "promised route" through the ring | 5 | [S] "it is actively promising a route that does not exist." |
| Robot hits the rim and replans the same route | 5 | [S] "The planner drives confidently at the high-value spot, the real fence stops it dead, and it replans the same doomed route every step." |
| `γ = 0.1 rad` door facing the robot; a planner step "just fits" | 6 | [L] "at $\gamma = 0.1$ the gap's arc is about 0.35 world-units, comparable to the planner's own step."; [L] x-axis label: "channel width γ (radians)" |
| `0.348` | 6 | [L] "0.348 at the knee, 0.029 by $\gamma = 0.6$."; [L] figure caption: "the synthesized artifacts from 1.116 to 0.348 at the knee" |
| `γ = 0.6`, `0.029` | 7 | [L] "at $\gamma = 0.6$ the blind artifact's play cost is 0.029." |
| γ = 0.6 door rotated behind the star; `1.116` with the digits rolling in (carries "to four decimals", no longer spoken) | 8 | [L] "Hidden behind the lode [...] at the same $\gamma = 0.6$ [...] it is 1.116"; [L] figure caption: "Rotating that same channel behind the lode (rose) holds 1.116 at γ = 0.6 and γ = 1.2 — the closed band's own value, to four decimals." |
| Corner chip `model 1 · filled disc` → `model 2 · no fence` | 1-10 | [S] "Close the band fully [...] not a ring, but a filled disc"; [S] "a model that simply does not know the fence is there at all"; [S] "That was one kind of wrong model [...] Here is the other" |
| `same model · same mistake · same hole` | 9 | [S] "Same model, same mistake, same shape of hole."; [S] figure: "same model, same fence, same size of gap" |
| Front-door map `0.029` vs back-door map `1.116` | 9 | [S] "One number is 0.029 and the other is 1.116, and the only thing separating them is whether the robot's own path crosses the gap." |
| Solid torus floating between robot and star, in 3D | 10 | [S] "a doughnut-shaped region floating in three-dimensional space, between the robot and its target"; [L] "a solid torus in $\mathbb{R}^3$ placed between start and lode" |
| Cyan dashed arc over the torus, touching nothing | 10 | [S] figure caption: "The dashed path arcing over the top is the one that matters for the second half of the story: it reaches the goal without touching anything" |
| `through the hole` pose, `0.019` | 10 | [S] "Move it so the route threads the hole instead and the cost is **0.019**"; [L] figure caption: "Left: the planned route threads the torus's hole and the blind model costs 0.019." |
| `into the tube` pose, robot stopped by the tube, `0.898` just under the `1 · random` tick | 10 | [S] "Put the doughnut so the planned route runs into its solid part and the cost is **0.898**."; [S] figure caption: "on the right the same object has been moved so the route runs into it, and it costs nearly as much as acting at random." |
| Outro credit "Simulator, results and proofs: code-world-models (open repo)" | 12 | [L] "with the [code, result artifacts and Lean proofs open](https://github.com/JaviMaligno/code-world-models)" |

## Notes

- **A. "At a tenth of a radian, danger collapses."** The long post itself uses this wording
  for γ = 0.1 in its linkedinSummary ("0.1 radians [...] and the exploitation collapses: 1.116
  with the band closed, 0.348 at that width, 0.029 once the channel is wide"), and the body puts
  the knee at γ = 0.1. The screen shows 0.348 there (not near zero) and 0.029 at γ = 0.6, so the
  collapse is shown as a big drop at the knee that finishes wide open. The scripted sweep (0.139
  at 0.1, ~0 from 0.15) is a different series and is not shown. Stricter fallback if Javier wants
  it: "At a tenth of a radian, the danger starts to collapse" (+2 words).
- **B. The hidden door is the γ = 0.6 one.** The long post's description says "I hid the same
  door behind the goal" right after the 0.1-radian door, but the body only reports the hidden
  channel at γ = 0.6 and 1.2 (1.116 both times). The video rotates the γ = 0.6 door, so "that
  same door ... 1.116 again" matches the body. No hidden-door number exists for γ = 0.1, and
  none is shown.
- **C. Two different wrong models.** The filled-disc artifact (scenes 1-4) is the one that is
  uncatchable and free. The blind artifact that omits the fence (scenes 5-9) is the one that
  costs 1.116 / 0.348 / 0.029 / 1.116. The narration keeps them apart ("Now a model blind to the
  fence"), as [S] does ("That was one kind of wrong model [...] Here is the other").
- **D. Series consistency.** All play-cost numbers on screen come from the synthesized blind
  artifacts ([L]: "in both model sizes and in the Claude relay"), the same series [S] quotes.
  The scripted dense sweep (0.999 closed, 0.139 at γ = 0.1) is not used.
- **E. "No test can catch it" in the hook** is about the filled disc on the closed ring only,
  which is what the hook shows. The torus control ([L], [S]) is where that guarantee
  disappears ([S] "**The guarantee does not.**"). Scene 10 (v1.2) only makes the cost claim
  (0.019 / 0.898) and never says the torus error is uncatchable or catchable, so it does not
  contradict the hook. Scene 12's "No test will tell me" is [S]'s own wording about regions
  nothing visits.
- **H. The torus numbers (v1.2).** Both articles give the same pair: route through the hole
  0.019, route into the tube 0.898, for the blind model, "at the same rarity (0.0033) and the
  same trivial topology" ([L]). The articles state 0.898 first; the video shows the hole first
  so the scene ends on the costly case, which is the point of the line. The 0.0033 rarity is
  not shown. The model is the same blind (fence-omitting) model as scenes 5-9, so the
  `model 2 · no fence` chip stays on. "Doughnut" is [S]'s word; "torus" stays off screen.
- **F. Scene 10 voice (v1.1).** v1 used the long post's second person ("Don't ask... Ask...").
  v1.1 uses the short post's own first-person question almost word for word ("Does a plan cross
  the place where my model is wrong? This decides what the error costs."), so the whole video
  is first person. It also saves three words.
- **G. Credit line.** The outro names the repo only (`code-world-models`), not the GitHub handle,
  to keep personal names off screen.

## Illustrative, not claims

- The reach glow, its colour and its shape (a visual reading of "reach"; the articles have no
  such field).
- The row of green sample ticks in the hook, the number of sample rays in scene 3 and their
  directions.
- How often the robot squeezes through the γ = 0.1 door; the "planner step" ghost beside it.
- The 180° dial rotation of the ring in scene 8 (the articles compare two configurations; the
  animation turns one into the other).
- The zoom-out map with several red patches and a new goal star (scenes 10-11): an
  illustration of [S]'s questions, not an experiment.
- Everything in the 3D scene except the two costs: torus proportions, camera tilt, the slide
  from one pose to the other (the articles compare two placements), the shape of the cyan arc,
  the robot's bounces off the tube.
- Robot paths, unless real MPC traces are extracted from code-world-models (see script.md
  build notes).

- **D. Build changes (v1.2 as rendered).** The voiced cut ran 76.1 s, past the 75 s ceiling, so
  "No test can tell." (scene 4) was cut, as the script's own length note allows; the hook keeps
  "No test can catch it." and the twin trails carry it on screen. Scene 10's line is voiced as
  two cues ("Route through the doughnut's hole:" / "0.019.") so the caption is not too fast;
  the words are unchanged. Torus numbers re-checked against both posts: route threads the hole
  0.019, route into the tube 0.898 ([S] line 170, [L] line 248). The hook headline phrases ("A
  whole region: wrong", "No test can catch it") restate the narration. Rendered length 73.2 s.
