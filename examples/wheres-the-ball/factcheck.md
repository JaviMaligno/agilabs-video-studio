# Fact-check: Where's the Ball? series video (EN)

Sources: `src/content/blog/en/wheres-the-ball.md` (P1), `wheres-the-ball-2.md` (P2),
`wheres-the-ball-3.md` (P3), `wheres-the-ball-4.md` (P4), personal-website `main`.
Scope: narration and the numbers/claims on screen. The pitch visuals are illustrative (real
Metrica Sports open tracking data, replayed freely; guess, net and centroid markers placed for
clarity), as allowed by the article-video skill.

| Claim | Where | Article sentence (quoted) |
|---|---|---|
| "I erased the ball from the pitch and kept only the players." | narration, scene 1; chip "The ball: erased" | P1: "For each frame I **removed the ball** with LaMa inpainting" |
| "From the stands, you usually can." | narration, scene 2 | P1: "Watch a football match from the top row of the stadium, where the ball is a barely-visible speck, and something curious happens: you usually know where it is anyway." |
| "I wanted to know if frontier AI models could too." | narration, scene 2; chip "Frontier AI guesses"; markers GPT / Opus / Sonnet | P1: "I wanted to know whether a generalist vision-language model has that same intuition." / "The models: **GPT-5.4**, **Claude Opus 4.8**, **Claude Sonnet 4.6**" |
| "balls far from the centre of the frame ... no better than a coin flip"; on screen **53%** + coin, label "Frontier AI on off-centre balls" | narration + counter, scene 3 | P2: "The frontier models don't, from either input: 53% on pixels (statistically a coin flip)" (context: "beat the camera bias on off-center balls") |
| "a sixty-kilobyte network on my laptop"; on screen "60 kB net" | narration + net marker, scene 4 | P2: "About 14,000 parameters, roughly 60 kB of weights, a few minutes of CPU on my laptop." |
| "It beat that bias eighty-two percent of the time."; on screen **82%**, label "60 kB net beats the camera bias" | narration + counter, scene 4 | P2: "The two trained models beat the camera bias on off-center balls — **82%** from the tracks" |
| "look where the running players are heading"; chip "Where they're heading" | narration, scene 5 | P3: "the signal is in the *motion*, in where the running mass is heading" |
| "One weighted average explains most of what it learned."; chip "Velocity-weighted centroid" | narration, scene 6 | P3: "Ball localization isn't a deep pattern — it's mostly one number: the velocity-weighted centroid" / "Ten interpretable features recover **92%** of that gap in soccer" |
| "the hardest ball to find isn't the one in flight. It's the one standing still."; chip "Ball still: under 2 m/s" | narration + chip, scene 7 | P4: "The hardest ball to locate is the one that's barely moving at all: settled, under 2 m/s" / "Not the ball in flight — the settled ball, under 2 m/s, is where the specialist's error is highest." |
| "No motion, no signal." | narration + KeyQuote, scene 8 | P4: section heading "## No motion, no signal" |
| "Where's the Ball?, a four-part series" | narration + outro | Four articles: P1 to P4 ("Where's the Ball? Part 4 — When Nothing Moves") |
| "Tracking data: Metrica Sports" | pitch corner + outro | Data credit for the replayed sequence (Metrica Sports open sample data, Sample_Game_1) |

Notes:
- 53% and 82% are shown exactly as the article writes them (no decimals, `%`).
- "eighty-two percent of the time" paraphrases "beat the camera bias on off-center balls — 82%"
  (the share of off-centre items where the model beats the centre-of-frame bias); approved
  wording in the script, same strength as the article.
- "60 kB" matches P2's "roughly 60 kB of weights" and the series' own "A 60 kB net".
