# Fact-check: Where's the Ball? Part 2 (EN)

Source: `src/content/blog/en/wheres-the-ball-2.md` on personal-website `origin/main`
(pubDate 2026-07-27). Cross-checked against the public repo `JaviMaligno/wheres-the-ball`
(local: `docs/nivel-2-cierre.md`, `docs/nivel-2-asimetria-mecanismo.md`). Scope: narration and
every number or claim on screen. Pitch, camera and court visuals are illustrative.

| Claim (video) | Where | Article sentence (quoted) |
|---|---|---|
| "A model small enough to email finds the hidden ball where frontier AI can't." | hook, scene 1 | Description: "A tiny network trained on my laptop solves the hidden-ball cases that frontier VLMs can't"; body: "the information is there, and a model small enough to email can extract it." |
| "In part one, I erased the ball from football footage and kept the players." | scene 2 | "[Part 1] ended on a sober note. Frontier vision-language models … their guesses about a hidden football …"; Part 1 (series): "For each frame I removed the ball" |
| "Frontier AI did no better than pointing at the middle of the screen." | scene 3 | "on the cases that matter, balls genuinely far from the center of the frame, none of them reliably beat the dumbest possible strategy: point at the middle and trust the camera operator." |
| "Maybe that's impossible. Maybe the players don't give the ball away." | scene 4 | "Maybe the hard cases are just *hard* — maybe the players' positions don't contain enough information to find an off-center ball, and I'd been asking the models to do the impossible." |
| "So I tested exactly that." | scene 5 | "So I tested that directly." |
| "Two kinds of reader, small nets trained for this one task, and frontier AI." chips `60 kB`, `small vision net` | scene 6 | "One axis is *who reads*: a tiny specialist trained for exactly this, or a frontier generalist."; "About 14,000 parameters, roughly 60 kB of weights"; "a small off-the-shelf vision network (a ResNet-18) fine-tuned on seven thousand broadcast frames with the ball erased by inpainting" |
| "Two inputs, the TV pixels or the player tracks underneath." tag "also given to frontier AI, as text" | scene 7 | "The other is *what gets read*: the broadcast pixels, or the player tracks underneath them."; "once on the **exact same one-second tracks the tiny net saw, serialized as plain-text coordinates**" |
| "The hard cases, balls far from the centre. Does a guess beat pointing at the middle?" | scene 8 | "The two trained models beat the camera bias on off-center balls"; "point at the middle and trust the camera operator" |
| "The trained models did. 82% of the time from tracks, 74% from pixels." | scene 9 | "The two trained models beat the camera bias on off-center balls — **82%** from the tracks, **74%** from the pixels." (repo: 28/34 off-centre items for the tracks net) |
| "Frontier AI didn't. 53% on pixels, a coin flip." | scene 10 | "The frontier models don't, from either input: 53% on pixels (statistically a coin flip)" |
| "On the very same tracks, as text, 35 to 38%. Below chance." on screen `35–38%` | scene 11 | "and 35–38% — *below* chance — on the tracks themselves" (repo: GPT 35 %, Opus 38 %) |
| "Those tracks are ground truth, a ceiling, and on easy balls the big models were more precise."; chip `0.147 vs 0.195–0.210` | scene 12 | "The tracks column uses *ground-truth* tracking, so it's an information ceiling. And on the easy, centered items the zero-shot VLMs still post better global medians (0.147 vs 0.195–0.210)" |
| "So the information is there. Training matters. The input barely does." | scene 13 | "Is the information missing? No — the tracks column extracts it."; Takeaway heading: "**Training matters; the input barely does.**" |
| Brackets "training" lit / "input" struck | scene 13 visual | "What separates the columns of that chart isn't the input at all; it's the row: **trained versus zero-shot.**" |
| "On TV, 'the ball is near the players' is a trap." | scene 14 | "The centroid of the players — "the ball is where the crowd is" — isn't just uninformative in image space."; Takeaway: "**Broadcast geometry is a trap.**" |
| "An off-centre ball is usually flying ahead, players trailing, and the camera chases it." | scene 15 | "When a ball is off-center, it's usually because it's moving fast — a long pass, a clearance — running *ahead* of the play while the players trail behind. Project that onto a camera that chases the ball and the geometry inverts." |
| "On screen, the players' centre and the ball correlate at −0.58. On the pitch, +0.83." | scene 16 | "It's *anti*-correlated with the ball (−0.58)"; "compute the same centroid in field coordinates — and the correlation flips to +0.83." |
| "The camera flips the sign." | scene 17 | "Same statistic, same matches; the camera flips its sign." |
| "Then I trained the same net on basketball." tag "NBA tracking" | scene 18 | "I trained the same architecture on soccer (Metrica and SkillCorner tracking data) and on basketball (NBA SportVU), and crossed them." |
| "Basketball to football worked, with no football at all. Football to basketball failed." | scene 19 | "Soccer→basketball fails: worse than an *untrained* centroid. But basketball→soccer *works*: 0.17 median error, beating soccer's own geometric baselines without ever seeing a football match." |
| "The culprit is speed. On the small court, players move 3–4× faster in the model's units." | scene 20 | "The real culprit is **velocity scale**."; "in the normalized coordinates the model reads, players move three to four times faster in basketball."; Takeaway: "the two sports live 3–4× apart on the normalized velocity scale" |
| "Take velocity out, and positions transfer both ways." | scene 21 | "Strip each player down to *positions only*, discarding the velocity channel, and the asymmetry vanishes — positions transfer symmetrically both ways" |
| "Knowing the game, for these models, means knowing what to do with motion." | scene 22 | ""Knowing the game," for this family of models, turns out to mean something narrow and specific: knowing what to do with motion." |
| Credit "Tracking: Metrica · SkillCorner · NBA SportVU" | outro | Footer: "Player tracking from SoccerNet-Tracking, Metrica Sports, SkillCorner, and the NBA SportVU 2015-16 logs" |

## Issues and doubts found

1. **"A basketball court is about a sixth the area of a football pitch" is wrong.** The repo
   gives the sizes: court 28×15 m (420 m²) vs pitch 105×68 m (7,140 m²), about **1/17 of the
   area** (roughly a quarter of the length). The 3–4× velocity gap the article reports matches
   the *linear* ratio, which is what normalized coordinates scale by. The video avoids the
   figure ("the small court"); the article sentence is worth fixing ("a quarter of the length,
   about a seventeenth of the area").
2. **"The asymmetry vanishes" is stronger than the repo.** In `nivel-2-asimetria-mecanismo.md`
   removing velocities roughly halves the absolute asymmetry (+0.162 → +0.091); it vanishes
   only in the ratio to in-domain error (+0.36 → −0.11), with one seed per variant. The video
   says only "positions transfer both ways", which is the article's own wording; no stronger.
3. Hook strength: "finds the hidden ball where frontier AI can't" follows the article's
   description ("solves the hidden-ball cases that frontier VLMs can't"); the concrete measure
   is beating the centre-of-frame baseline on off-centre items (82 % vs 53 %), shown in the grid.
4. The 35–38 % range covers two models (GPT 35 %, Opus 38 % in the repo); the article says
   "frontier models" without listing them in part 2, so the video labels the row "Frontier AI".
5. Not used: the pretraining section (12/13, p=0.002; 9/10, p=0.011; ~5 % after ~30 minutes),
   left out for length and because its story is the author's own overturned hypotheses.

## On-screen text added in the build (2026-10-21)

Checked against the article as corrected in personal-website PR #167
(`origin/fix/article-data-corrections-oct21`).

| On screen | Scene | Source |
|---|---|---|
| `82%` `74%` `53%` `35–38%` in the grid cells; meters on a dashed "coin flip" line at 50 % (the range fills to 36.5 and is shown only as `35–38%`, never counted through) | trained, frontier, astext | "82% from the tracks, 74% from the pixels"; "53% on pixels (statistically a coin flip)"; "35–38% — *below* chance" |
| Chips `60 kB net`, `small vision net`, `GPT · Opus`, `GPT · Opus · as text` | rows | "roughly 60 kB of weights"; "a small off-the-shelf vision network"; repo: GPT and Opus on the grid; "serialized as plain-text coordinates" |
| `Tracks = ground truth · a ceiling`; `Easy, centred balls: frontier more precise` / `0.147 vs 0.195–0.210 median error` | footnotes | "uses *ground-truth* tracking, so it's an information ceiling"; "better global medians (0.147 vs 0.195–0.210)" |
| `The information is there ✓`; `Training matters. The input barely does.`; column headers struck | verdict | "Is the information missing? No — the tracks column extracts it."; Takeaway "Training matters; the input barely does." |
| `−0.58 on screen`, `+0.83 on the pitch`, "players' centre vs ball"; `Same statistic. The camera flips its sign.` | flip, sign | "anti-correlated with the ball (−0.58)"; "flips to +0.83"; "Same statistic, same matches; the camera flips its sign." |
| `Basketball → Football ✓ never saw a football match`; `Football → Basketball ✗ worse than an untrained centroid` | transfer | "Soccer→basketball fails: worse than an *untrained* centroid. But basketball→soccer *works* … without ever seeing a football match." |
| Court drawn at true size next to the pitch (28×15 m vs 105×68 m: ~1/4 of the length, ~1/16 of the area); `same box, different speed scale`; `3–4× faster on the court, in the model's units` | basketball, speed | PR #167: "a basketball court (28×15 m) is about a quarter the length and width of a football pitch (105×68 m), so in the normalized coordinates the model reads, players move three to four times faster in basketball." |
| `Positions only: both ways ✓` with `The gap roughly halves; against each sport's own error, it vanishes.` | positions | PR #167: "the absolute gap roughly halves (+0.162 → +0.091 median error); measured against each sport's own in-domain error, it vanishes — positions transfer about symmetrically both ways". The voiced line ("positions transfer both ways") is the article's own wording and is not stronger; the softened qualifier is on screen. |

Doubt 2 above (velocity removal) is resolved by the PR's softened wording, which the screen carries.
