# Where's the Ball? — series video (EN) · script draft v2

Series: wheres-the-ball (Parts 1–4, javieraguilar.ai). Vertical 9:16, target ~50 s, 118 spoken words.
Data on screen: real Metrica Sports open tracking data (credit on screen).

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | I erased the ball from the pitch and kept only the players. Can you tell where it is? | Top-down pitch, 22 dots from a real Metrica sequence moving; no ball. A pulsing "?" | bespoke: `PitchPlayback` (ball hidden) | P1: "For each frame I removed the ball" |
| 2 | From the stands, you usually can. I wanted to know if frontier AI models could too. | Same play continues; three AI "guess" markers (GPT · Opus · Sonnet, muted colours) drop onto the pitch | `PitchPlayback` + guess markers | P1: "I wanted to know whether a generalist vision-language model has that same intuition" |
| 3 | On the hard cases, balls far from the centre of the frame, they did no better than a coin flip. | The real ball flashes in far from all three markers; they scatter. Big "53%" + coin flipping | `PitchPlayback` (ball reveal) + `Counter` (53%) | P2: "53% on pixels (statistically a coin flip)" |
| 4 | Then I trained a sixty-kilobyte network on my laptop. It beat that bias eighty-two percent of the time. | A glowing accent marker ("60 kB net") snaps onto the ball; counter to "82%" in the accent gradient | `PitchPlayback` (net marker) + `Counter` (82%) | P2: "The two trained models beat the camera bias on off-center balls — 82% from the tracks"; "roughly 60 kB of weights, a few minutes of CPU on my laptop" |
| 5 | Its trick is almost embarrassingly simple: look where the running players are heading. | Back to the pitch: velocity arrows grow on each player; fast players brighter | `PitchPlayback` (velocity arrows) | P3: "the signal is in the *motion*, in where the running mass is heading" |
| 6 | One weighted average explains most of what it learned. | All arrows converge into one point that glides across the pitch and lands on the ball | `PitchPlayback` (centroid + ball reveal) | P3: "Ten interpretable features recover 92%… mostly one number: the velocity-weighted centroid" |
| 7 | Which means the hardest ball to find isn't the one in flight. It's the one standing still. | The play freezes: arrows shrink to nothing, the centroid marker wanders, a "?" returns over a still ball | `PitchPlayback` (still moment) | P4: "The hardest ball to find is the one standing still… under 2 m/s" |
| 8 | No motion, no signal. | Text slam on the frozen pitch | `KeyQuote` | P4: "Because motion is the whole signal." |
| 9 | Where's the Ball?, a four-part series at javieraguilar.ai. | Outro card: AGILabs badge, javieraguilar.ai, "Where's the Ball? · 4-part series" | outro | — |

## Notes for the build

- `PitchPlayback` (bespoke) draws a pitch in brand colours (lines in `muted`, teams in `accentText` vs `text`), plays a ~12 s window of Metrica Sample_Game_1 (or 2) chosen so the ball travels far from the player mass in shot 1–2 and is still at the end (shot 7). Data is pre-extracted by a script into a small JSON committed with the example (positions downsampled to 10 Hz; Metrica sample data is public with attribution).
- Visuals are chosen for impact, not as a literal replay of the experiment (rigor lives in the articles and the repo); narration and numbers stay faithful to the articles.
- Credit line in the outro: "Tracking data: Metrica Sports".
