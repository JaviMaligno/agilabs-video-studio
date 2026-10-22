# Fact-check: Where's the Ball? Part 3 (EN vertical) · v1.0

Source: `src/content/blog/en/wheres-the-ball-3.md` on `origin/main` of personal-website (pubDate
2026-07-29). Cross-checked against the article's `repoUrl`, `JaviMaligno/wheres-the-ball` (local
copy): `results/nivel3/geometry.json`, `docs/nivel-3-fase-0.md` (geometry),
`docs/nivel-3-tda.md` (topology), `docs/nivel-3-informacional.md` (mixture density / blind spot).
Scope: every spoken line, and every number or text shown on screen. Visuals are illustrative.

## Narration

| # | Claim (spoken) | Article sentence | Repo check / verdict |
|---|---|---|---|
| 1 | "My little ball-finding AI is most sure of itself exactly where it's most wrong." | "It is most sure of itself exactly where it is most wrong"; description: "the model turns out to be overconfident on exactly the cases it gets wrong." | OK. The confident model is the same network with a mixture-density head ("I swapped the network's single-point output for a mixture density head"). Repo: MDN point error 0.0935, on par with the Level-2 point model. |
| 2 | "I erase the ball from football tracking data and keep only the players and their movement." | "It read the players' positions and velocities and pointed […] at a ball it had never been shown." | OK. Tracking data named in the footer (Metrica, SkillCorner). "football" = soccer, the article's main sport; basketball comes in scene 8. |
| 3 | "A tiny network of about 60 kilobytes cracked cases that frontier AI models couldn't." | "a small network — about 60 kilobytes of weights — cracking the hidden-ball cases that frontier vision-language models couldn't." | OK. "frontier AI models" = frontier vision-language models. |
| 4 | "But it's a black box. It gives an answer, not an explanation." | "a network that works is still a black box. It gives you an answer, not an explanation." | OK. |
| 5 | "So I opened it three ways. What is it really computing?" | "I spent Level 3 trying to open the box three ways."; "**what is that little box actually computing?**" | OK. |
| 6 | "First, about ten numbers a coach could name, like the players' centre or the fastest runner." | "a handful of hand-written geometric features — quantities a coach could name"; "I wrote about ten: the centroid of the players, […] the fastest player's position" | OK. Repo importance table lists 11 columns (incl. mean/max speed); "about ten" is the article's wording. |
| 7 | "A simple tree on those numbers recovers 92% of what the network adds over a plain average." | "fed to a plain gradient-boosted tree"; "The gap between a naive centroid baseline and the trained deep net is the "skill" the network learned. Ten interpretable features recover **92%** of that gap in soccer" | OK. "plain average" = naive centroid baseline. Repo: `geometry.json` soccer recovery 0.9189; fase-0 table geo 0.1115, deep 0.101, centroid 0.231. |
| 8 | "And in basketball, it even slightly beats the network." | "in basketball they slightly *beat* the deep net (112%)" | OK. Repo recovery 1.1247 (geo 0.1494 vs deep 0.158). Repo caveat: beats *this* small DeepSets baseline, not any deep model; on-screen tag "this small net". |
| 9 | "One number does most of it. The average position, with fast runners counting more." | "one dominates the rest by an order of magnitude"; "The **velocity-weighted centroid** — the average player position, but with the fast-moving players counting more — carries the localization on its own." | OK. Repo permutation importance: vel_centroid +0.203, next (fastest) +0.034, convergence point +0.006. Not voiced: values. |
| 10 | "Second, topology. Maybe the ball sits in a hole, inside a ring of players." | "a ball in open play often sits inside a *hole* in the configuration — a ring of players around empty space — and topology is exactly the mathematics of holes." | OK. |
| 11 | "My rule, set in advance. It only counts if it beats plain geometry." | "I set one rule before running anything, to keep myself honest: **topology only counts if it beats its geometric counterpart.**" | OK. Repo: "Regla fijada de antemano". |
| 12 | "It didn't. Alone, it fell far behind geometry. Added to it, it changed nothing." | "It doesn't clear the bar. Topological features on their own land far behind plain geometry (0.258 vs 0.111 in soccer"; "geometry-plus-topology matches geometry alone" | OK. Repo: tda-only 0.2580, geo-only 0.1106, geo+tda 0.1118, permuting the TDA block +0.0061. Deliberately not voiced: "barely better than the naive baseline" (article issue 1). |
| 13 | "The ball isn't in the crowd's shape. It's where the crowd is moving." | "The ball's position isn't a property of the *shape* of the player cloud; it's a property of where the mass is and where it's moving." | OK. |
| 14 | "Third, I made the network say how sure it is." | "I swapped the network's single-point output for a mixture density head: instead of one guess, it predicts a full probability distribution over where the ball might be." | OK. On screen "one point → a spread of guesses". |
| 15 | "On average, the more unsure it says it is, the bigger its error. Weakly, but consistently." | "The uncertainty it declares does track the error it makes — bin the predictions from most-confident to least, and the actual error climbs monotonically"; "Weakly (the correlation is a modest +0.20), but consistently." | OK. Repo quintiles 0.078 → 0.109, corr +0.20. |
| 16 | "I expected balls tangled in a crowd to be hardest. It's the opposite." | "I'd expected the ball to be *hardest* to pin down when it's tangled in a crowd of players […] It's the opposite. Tangled play is the *easy* case" | OK. |
| 17 | "A loose ball, with players trailing behind it, has about 20% more error." | "A loose ball, with players trailing behind it, is genuinely harder — about 20% more error." | OK. Repo: Q1 tangled 0.087 → Q4 loose 0.106 (+22 %). See article issue 3 on the repo's "+0.009". |
| 18 | "And on those, it claims less uncertainty. It's most sure exactly where it's most wrong." | "on those harder loose balls, the model declares *lower* uncertainty. Its error goes up while its confidence goes up. It is most sure of itself exactly where it is most wrong" | OK. Repo: declared std 0.081 (loose) vs 0.090 (tangled); corr(coupling, std) −0.17, CI [−0.19, −0.15]. Repo caveat: one seed, one held-out match (not in the article; the video adds no stronger claim). |
| 19 | "So the verdict. It was mostly geometry, one weighted average of where the runners are heading." | "**The black box was reading geometry.** […] it's mostly one number: the velocity-weighted centroid, "where the running mass is heading.""; "it's *geometry* — a coach's instinct for where the play is heading, written as one weighted average." | OK. "mostly" keeps the article's hedge ("(mostly) reading geometry"). |
| 20 | "Topology added nothing. And the model can't tell when the ball slips loose." | "**Topology added nothing.**"; "**The model is confidently wrong in one place.** It's globally calibrated, but overconfident on loose balls in open space"; "neither of them […] can tell you when the ball has slipped loose into space" | OK. Scene 15 already said it is globally calibrated, so "can't tell when the ball slips loose" is the article's scoped claim, not "never knows". |
| 21 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| "60 kB" on the box | 3-20 | "about 60 kilobytes of weights"; "a 60 kB network has it sharply" | |
| "real tracking data · ball removed" | 2 | Footer: Metrica Sports, SkillCorner, NBA SportVU | |
| Feature chips: centre, speed-weighted centre, fastest player, densest cluster, team spread, closest opponents, convergence point | 6 | "the centroid of the players, the centroid weighted by how fast each player is moving, the fastest player's position, the densest cluster, the spread of each team, the midpoint of the closest pair of opponents, a "convergence point"" | |
| Ruler "plain average" → "the 60 kB net", "what the net adds", "10 numbers + a tree" **92%** | 7 | "The gap between a naive centroid baseline and the trained deep net"; "92% of that gap in soccer" | |
| Basketball ruler **112%**, "this small net" | 8 | "(112%)" | Tag from repo caveat. |
| Importance bars without values, "error rise when shuffled", "the elegant one barely helped" | 9 | "by shuffling it and watching the error rise"; "one dominates the rest by an order of magnitude"; "barely moves the needle" | Bar heights may follow the repo ratios (0.203 vs ≤0.034), no labels. |
| Rule card "Topology only counts if it beats geometry." | 11 | Verbatim, shortened | |
| Error bars **0.111** · **0.258** · geometry + topology "= geometry alone", "lower is better" | 12 | "(0.258 vs 0.111 in soccer"; "geometry-plus-topology matches geometry alone" | Third bar drawn at ≈ 0.111 without its own number (article prints none). |
| "one point → a spread of guesses" | 14 | "instead of one guess, it predicts a full probability distribution" | |
| Five-step staircase, "corr +0.20", "weak" | 15 | "the actual error climbs monotonically"; "a modest +0.20" | No step values on screen. |
| "≈ 20% more error" | 17 | "about 20% more error" | |
| Stamps **92%** · **NOTHING** · **BLIND SPOT**; **most sure · most wrong**; **MOSTLY GEOMETRY** | 1, 12, 18-20 | Takeaways | |
| Optional tag "the same hard cases as Part 1" | 18 | "these are the same off-centre, fast-moving balls that the frontier models failed on back in Part 1" | See article issue 2; drop if in doubt. |
| Credit "Tracking data: Metrica Sports · SkillCorner · NBA SportVU" | 21 | Footer | NBA data "used for research only, not redistributed": the video draws stylised dots, no raw NBA frames. |

## Article issues and doubts

1. **Topology alone vs the naive baseline (factual slip in the article).** The article says
   topology on its own is "barely better than the naive baseline" (0.258 in soccer). The repo's
   naive centroid baseline is **0.231** (`docs/nivel-3-fase-0.md`), and `docs/nivel-3-tda.md`
   gives tda-only a **−21 %** recovery in soccer: it is *worse* than the naive baseline, not
   barely better (in basketball it is better: 0.206 vs 0.227, 30 %). The video avoids the claim
   and says only "fell far behind geometry". Worth a one-word fix in the article ("no better
   than", or "worse than").
2. **"The same off-centre balls as Part 1"** is an interpretive link. Here "loose" means far from
   the velocity-weighted centroid; Part 1's hard cases were balls far from the centre of the
   camera frame. The repo asserts the link ("son los casos duros de las Partes 1-2") but does not
   measure the overlap. Not voiced; kept only as an optional on-screen tag.
3. **Repo-internal inconsistency, not in the article.** `nivel-3-informacional.md` gives the
   loose-vs-tangled gap as "+0.009, CI [0.007, 0.011]" while its own quartiles are 0.087 → 0.106
   (+0.019, +22 %). The article's "about 20% more error" matches the quartiles. No action for the
   video.
4. **Hedges the article leaves out.** The repo notes one seed and one held-out match for the
   blind spot, and that 112 % means beating *this* small deep baseline. The video adds "this
   small net" on screen and makes no claim stronger than the article.
5. **Feature count.** "about ten" / "Ten numbers" in the article; the repo's feature table has 11
   columns. Narration keeps "about ten".
