# Where's the Ball? Part 3 — It Was Geometry All Along — article video (EN) · script draft v1.0

Article: wheres-the-ball-3 (javieraguilar.ai, EN, `pubDate` 2026-07-29; read from
`origin/main:src/content/blog/en/wheres-the-ball-3.md` of personal-website). Vertical 9:16,
target ~105 s (ceiling 110 s), 276 counted words incl. outro. ES column left empty (EN-only for
now). Voice: the template default, Javier's cloned voice.

Data: every figure from the article text, cross-checked against the article's `repoUrl`
(`JaviMaligno/wheres-the-ball`, local copy): `results/nivel3/geometry.json`,
`docs/nivel-3-fase-0.md`, `docs/nivel-3-tda.md`, `docs/nivel-3-informacional.md`. Tracking data
is public (Metrica Sports, SkillCorner, NBA SportVU); no work material, nothing to anonymise.

Series note: part 3 of 4. Reuse the series' visual language from `examples/wheres-the-ball`
(`PitchPlayback`: top-down pitch in brand colours, player dots, velocity arrows, hidden ball,
"?" marker, centroid marker gliding onto the ball). Parts 1-2 are told only as the two-line
story (frontier models failed, a small network cracked it); no VLM benchmark, no transfer
study, no coin-flip number.

## Central visual: the black box, opened three times

A small dark **box** labelled **"60 kB"** sits at the edge of the pitch. It points a glowing
marker at the hidden ball, and nobody knows why. The video opens it **three times**, and each
opening is a **drawer** with its own test and its own stamp, the only legend the viewer needs:

1. **Geometry** drawer: ten labelled chips fall out (centre, fastest runner, spread, convergence
   point...). A **skill ruler** shows how much of the box they reproduce. Stamp **92%**.
2. **Topology** drawer: a ring of players with an empty hole and a "ball?" inside it, a rule card
   pinned on top ("must beat geometry"). Stamp **NOTHING**.
3. **Confidence** drawer: the box's single marker becomes a **cloud** (its spread of guesses). On
   a tangled ball the cloud sits on the ball; on a loose ball it shrinks, tightens, and sits in
   the wrong place. Stamp **BLIND SPOT**.

The mechanism is shown on the pitch, not described: velocity arrows on every player merge into
**one weighted average** that glides onto the hidden ball. That one marker is the whole verdict.

A fixed **question band** at the top names each part: `What is it computing?` → `1 · geometry` →
`2 · topology` → `3 · does it know when it's wrong?` → `Verdict`.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | My little ball-finding AI is most sure of itself exactly where it's most wrong. | | **Cold open.** Pitch, players running, ball hidden. The box's marker becomes a small, tight, bright cloud (label "very sure"). On "most wrong" the real ball flashes in far away, a dashed miss line draws between them; stamp **most sure · most wrong**. | bespoke: `ConfidenceCloud` (mode `hook`) over `PitchPlayback` | "It is most sure of itself exactly where it is most wrong"; description: "the model turns out to be overconfident on exactly the cases it gets wrong." |
| 2 | I erase the ball from football tracking data and keep only the players and their movement. | | **Story.** Same pitch, calm: the ball fades out; only the dots remain, short motion trails behind each. Tag "real tracking data · ball removed". | `PitchPlayback` (ball hidden) | "It read the players' positions and velocities and pointed, with decent accuracy, at a ball it had never been shown." |
| 3 | A tiny network of about 60 kilobytes cracked cases that frontier AI models couldn't. | | **Story.** Three muted "frontier AI" guess markers drop and scatter, a grey ✗ by them; then the **box "60 kB"** slides in at the touchline and its accent marker snaps near the ball's spot. | `PitchPlayback` (guess markers) + bespoke `BlackBox` (mode `enter`) | "Part 2 ended with a small network — about 60 kilobytes of weights — cracking the hidden-ball cases that frontier vision-language models couldn't." |
| 4 | But it's a black box. It gives an answer, not an explanation. | | **Story.** Zoom on the box: closed lid, a "?" on its face; an arrow from it to the pitch labelled "answer", a blank slot labelled "why?". | `BlackBox` (mode `closed`) | "a network that works is still a black box. It gives you an answer, not an explanation." |
| 5 | So I opened it three ways. What is it really computing? | | **Key moment 1 (what is tested).** Question band drops in: **What is it computing?** Three drawers outline on the box: geometry · topology · confidence. | `BlackBox` (mode `drawers`) | "**what is that little box actually computing?**"; "I spent Level 3 trying to open the box three ways." |
| 6 | First, about ten numbers a coach could name, like the players' centre or the fastest runner. | | Band: **1 · geometry**. Drawer 1 opens; ten chips tumble onto the pitch, each drawing its point: centre, speed-weighted centre, fastest player, densest cluster, team spread, closest opponents, convergence point. "centre" and "fastest runner" light on their words. | bespoke: `FeatureChips` over `PitchPlayback` | "I wrote about ten: the centroid of the players, the centroid weighted by how fast each player is moving, the fastest player's position, the densest cluster, the spread of each team, the midpoint of the closest pair of opponents, a "convergence point"" |
| 7 | A simple tree on those numbers recovers 92% of what the network adds over a plain average. | | **Skill ruler.** A horizontal ruler: left tick "plain average", right tick "the 60 kB net". The span between them glows: "what the net adds". A bar labelled "10 numbers + a tree" grows to **92%** (football). | bespoke: `SkillRuler` (football) | "fed to a plain gradient-boosted tree"; "The gap between a naive centroid baseline and the trained deep net is the "skill" the network learned. Ten interpretable features recover **92%** of that gap in soccer" |
| 8 | And in basketball, it even slightly beats the network. | | A second ruler (basketball court icon); its bar overshoots the right tick to **112%**. Small tag "this small net". | `SkillRuler` (basketball) | "and in basketball they slightly *beat* the deep net (112%)" |
| 9 | One number does most of it. The average position, with fast runners counting more. | | Back to the pitch: velocity arrows on every player, fast ones brighter and thicker; they merge into **one marker** that glides onto the hidden ball (ball flashes in under it). Side panel: importance bars, "speed-weighted centre" towering over the rest (no values; tag "error rise when shuffled"). The "convergence point" chip dims, silent tag "the elegant one barely helped". | `PitchPlayback` (velocity-weighted centroid) + bespoke `FeatureChips` (importance) | "one dominates the rest by an order of magnitude"; "The **velocity-weighted centroid** — the average player position, but with the fast-moving players counting more — carries the localization on its own."; "the "convergence point" […] barely moves the needle." |
| 10 | Second, topology. Maybe the ball sits in a hole, inside a ring of players. | | Band: **2 · topology**. Drawer 2 opens. Players freeze; lines join them into a ring; the empty space inside fills with a soft circle labelled "the biggest hole"; a "ball?" marker drops into it. | bespoke: `HoleTest` (mode `ring`) | "a ball in open play often sits inside a *hole* in the configuration — a ring of players around empty space — and topology is exactly the mathematics of holes." |
| 11 | My rule, set in advance. It only counts if it beats plain geometry. | | A rule card pins over the ring, dated before the run: **"Topology only counts if it beats geometry."** | `HoleTest` (mode `rule`) | "I set one rule before running anything, to keep myself honest: **topology only counts if it beats its geometric counterpart.**" |
| 12 | It didn't. Alone, it fell far behind geometry. Added to it, it changed nothing. | | Error bars, "lower is better": geometry **0.111** (accent), topology **0.258**; then a third bar "geometry + topology" lands level with geometry, tag "= geometry alone". Stamp on drawer 2: **NOTHING**. | `BarCompare` (3 bars) | "Topological features on their own land far behind plain geometry (0.258 vs 0.111 in soccer"; "geometry-plus-topology matches geometry alone, and when I shuffle the entire topological block the error barely twitches" |
| 13 | The ball isn't in the crowd's shape. It's where the crowd is moving. | | Split: left, the ring and its hole fade (no ball there); right, the arrows and the weighted marker sit on the ball. | `HoleTest` (mode `contrast`) | "The ball's position isn't a property of the *shape* of the player cloud; it's a property of where the mass is and where it's moving." |
| 14 | Third, I made the network say how sure it is. | | Band: **3 · does it know when it's wrong?** Drawer 3 opens. The box's single marker spreads into a **cloud** of guesses: "one point → a spread of guesses". | bespoke: `ConfidenceCloud` (mode `cloud`) | "I swapped the network's single-point output for a mixture density head: instead of one guess, it predicts a full probability distribution over where the ball might be." |
| 15 | On average, the more unsure it says it is, the bigger its error. Weakly, but consistently. | | Staircase: five bars "most confident → least confident", actual error rising step by step (no values). Tag **corr +0.20**, small "weak". | `ConfidenceCloud` (mode `calibration`) | "bin the predictions from most-confident to least, and the actual error climbs monotonically"; "the model knows when it doesn't know. Weakly (the correlation is a modest +0.20), but consistently." |
| 16 | I expected balls tangled in a crowd to be hardest. It's the opposite. | | Two mini-pitches. Left "tangled": players converging, arrows pointing at the ball; my guess card "hardest?" crossed out. The weighted marker lands on the ball. | `ConfidenceCloud` (mode `tangled`) | "I'd expected the ball to be *hardest* to pin down when it's tangled in a crowd of players, and easiest when it's loose in open space. It's the opposite. Tangled play is the *easy* case" |
| 17 | A loose ball, with players trailing behind it, has about 20% more error. | | Right "loose": ball ahead in open space, players running after it; the weighted marker lags behind; miss line, tag **≈ 20% more error**. | `ConfidenceCloud` (mode `loose`) | "A loose ball, with players trailing behind it, is genuinely harder — about 20% more error." |
| 18 | And on those, it claims less uncertainty. It's most sure exactly where it's most wrong. | | **Key moment 2 (what makes it different).** On the loose pitch, the cloud *shrinks* and brightens while the miss line grows. Two gauges: error ↑, confidence ↑. Stamp on drawer 3: **BLIND SPOT**. Optional silent tag: "the same hard cases as Part 1". | `ConfidenceCloud` (mode `blindspot`) | "on those harder loose balls, the model declares *lower* uncertainty. Its error goes up while its confidence goes up. It is most sure of itself exactly where it is most wrong" |
| 19 | So the verdict. It was mostly geometry, one weighted average of where the runners are heading. | | **Key moment 3 (verdict).** Band: **Verdict**. Full pitch: all arrows merge into the one weighted marker on the ball. The box beside it opens flat: inside, just that marker. Stamp **MOSTLY GEOMETRY**. | `PitchPlayback` + `BlackBox` (mode `verdict`) | "**The black box was reading geometry.** […] it's mostly one number: the velocity-weighted centroid, "where the running mass is heading.""; "it's *geometry* — a coach's instinct for where the play is heading, written as one weighted average." |
| 20 | Topology added nothing. And the model can't tell when the ball slips loose. | | The three drawers line up with their stamps: **92%** ✓ · **NOTHING** · **BLIND SPOT**. The ball slides loose into open space; the tight cloud stays behind, confident and wrong. | `BlackBox` (mode `stamps`) + `ConfidenceCloud` | "**Topology added nothing.**"; "neither of them, it turns out, can tell you when the ball has slipped loose into space and they've quietly lost the thread." |
| 21 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Where's the Ball? Part 3". Credit line "Tracking data: Metrica Sports · SkillCorner · NBA SportVU". | outro | — |

**Word count (EN): 276** (14 + 16 + 14 + 12 + 11 + 16 + 17 + 9 + 14 + 14 + 13 + 14 + 13 + 10
+ 16 + 13 + 13 + 15 + 16 + 13 + 3). At Javier's ~2.8 words/s that is ~99 s of speech; at the
ratio the built examples measured (248 words → 100 s, 253 → 107 s) **~105-110 s** with line
gaps, drawer changes and the outro hold. Set `targetSeconds: 105`.

**Captions** (estimate at 2.8 words/s; `npm run lint` after TTS is the gate): every narrated
line ≤ 16.8 chars/s. Highest: scene 3 (16.8), scene 8 (16.8), scene 9 (16.4), scene 19 (16.4).
The outro is voiced through its spoken form.

**Cold-viewer check** (scenes 1-5 only, ~22 s): "He trained a tiny AI that finds a football
that has been erased from the match data using only the players' movement, it beat big AI
models, and now he opens it up to see what it is actually doing, and it turns out to be most
confident where it's wrong." Passes: the situation (ball erased, players only), what happened
before (frontier models failed, the tiny net cracked it) and the question (what is it
computing) are all said before any feature, number or method.

If the TTS render runs over 110 s, cut in this order (never scenes 1-5, 7, 12, 18-20):
1. Scene 8 → silent: the basketball ruler overshooting to 112% with no narration (−9).
2. Scene 13 → silent: the split picture alone (−13).
3. Scene 15 → "Overall, its doubt tracks its error, weakly." (−9); the staircase carries it.

## Spoken numbers (complete list)

| Spoken | Scene | Why |
|---|---|---|
| "about sixty kilobytes" | 3 | What makes the subject different: tiny, and it beat the frontier models. |
| "about ten" | 6 | Size of the hand-written feature set. |
| "ninety-two percent" | 7 | The headline result of test 1, said once. |
| "about twenty percent" | 17 | How much harder the loose ball is; sets up the blind spot. |

On screen only: 112%, 0.111, 0.258, corr +0.20.

## Notes for the build

- **`PitchPlayback` (reuse from `examples/wheres-the-ball`).** Same pitch, colours, dots,
  velocity arrows and weighted-centroid marker. Pick a Metrica window with one tangled and one
  loose moment (scenes 16-18) if possible; otherwise stylise. Visuals are illustrative.
- **`BlackBox` (bespoke, the spine).** A small box "60 kB" with three drawers (geometry ·
  topology · confidence), each opening on its beat and receiving a stamp. Modes: `enter`,
  `closed`, `drawers`, `verdict`, `stamps`. Stamps in brand palette only: ✓ gradient for 92%,
  muted grey for NOTHING, outlined accent for BLIND SPOT.
- **`SkillRuler` (bespoke, the key mechanism of test 1).** A ruler from "plain average" (0 %)
  to "the 60 kB net" (100 %); the "10 numbers + a tree" bar fills to 92 %, and on the basketball
  ruler overshoots the right tick to 112 %. Must make "share of the gap" readable without
  narration: the gap span is shaded and labelled "what the net adds".
- **`FeatureChips` (bespoke).** Chips with the article's feature names, each drawing its point on
  the pitch; importance bars without values (the article prints none): the speed-weighted centre
  an order of magnitude taller, the rest short, the convergence point dimmed.
- **`HoleTest` (bespoke).** Ring of players, shaded hole, "ball?" marker, rule card. Modes
  `ring`, `rule`, `contrast`. Illustrative: no persistence diagrams on screen.
- **`ConfidenceCloud` (bespoke, the finding).** The prediction as a soft cloud whose radius is the
  declared uncertainty. `calibration` = five-step staircase (no values; tag "corr +0.20").
  `tangled` vs `loose` = two mini-pitches; on `blindspot` the loose cloud shrinks while the miss
  line grows. The cloud sizes are illustrative; the direction (smaller cloud, bigger miss on loose
  balls) is the article's.
- **Numbers on screen, exactly as the article writes them:** "60 kB" (article: "about 60
  kilobytes", "a 60 kB network"), "92%", "112%", "0.258", "0.111", "corr +0.20", "≈ 20% more
  error". Not shown: the naive baseline's error (not in the article), any feature-importance value,
  the 0.081 / 0.090 spreads (repo only).
- **Spoken forms:** "javieraguilar.ai" → "javier aguilar dot A I". "92%" and "20%" to be checked
  on the first listen ("ninety-two percent", "twenty percent").
- **No "naive baseline" claim for topology.** The article says topology alone is "barely better
  than the naive baseline"; the repo shows it is worse in football (see factcheck → article
  issues). The narration says only "fell far behind geometry", which both agree on.
- Visuals are chosen for impact, not as a literal replay: the box, drawers, chips, ring and cloud
  are stylised; the rigour lives in the article and the repo. Narration and every number stay
  faithful to the article.
- ES cut: pending (EN-only for now).
