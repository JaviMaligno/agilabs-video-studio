# The Riemann hypothesis has a proof nobody has read — article video (EN) · script draft v0.1 (not approved)

Article: riemann-hypothesis-proof (javieraguilar.ai, EN, draft, proposed for 2026-11-24).
Vertical 9:16, target ~58-62 s. Format: **concept** (the idea inside the proof), not a replay
of the news. This article explains Alpöge and Claude's result, not an experiment of mine: the
proof is never presented as mine, and what the author says is attributed to him ("the author
says"). ES cut: pending.

Status: script only. Not built, not narrated (no TTS key in the cloud session), and the cold
read (`reel-viewer` + `reel-expert`) has not been run yet. Build after the article is approved,
so the source sentences stop moving.

## Premise

- **Hook:** a proof of the most famous open problem in mathematics exists, and nobody has read it.
- **What the video is about (for a cold viewer):** the idea inside that proof is simple enough
  to say in a sentence, and old.
- **Verdict:** correct and understood have come apart: checked by machines in a day, understood
  by people not yet.
- **Must show:** the 175,187 files with "read by: 0"; the prime curve staying inside its band
  (real data); a number being divided by more and more primes and refusing to shrink; the chain
  whose two costs cross at √x; the closing split "checked ✓ / understood ○".

## Central visual metaphor: the curve under a ceiling

One amber curve, the real weighted prime count from the article's figure, runs left to right
inside a teal band for the whole middle of the video. Everything is told against it: a zero off
the line is a wave that swells until it breaks through the ceiling; the proof is a lid lowered
onto the curve from above; the chain of links is what holds the lid, and its length is tuned
until the lid sits at √x.

Secondary motif: **the stack of files**. A tall column of tiny file tiles (the archive) that a
scanner line sweeps bottom to top, turning each tile teal. A reader icon beside it stays empty.
It opens the video and returns, still, at the end.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | A proof of the Riemann hypothesis exists. Nobody has read it. | Title card over the stack of files rising out of frame; counter "read by: 0" | intro (hook card) over bespoke `FileStack` | Title: "The Riemann Hypothesis Has a Proof Nobody Has Read"; "## A proof nobody has read" |
| 2 | It is 175,187 files of code. Machines checked all of it in about a day. | Scanner line sweeps the stack, tiles turn teal; label "175,187 Lean files"; a small clock runs ~1 day | `FileStack` (mode `scan`) | "Lean files: 175,187"; "Everything a machine can check was checked within about a day, by independent people with independent tools." |
| 3 | The idea inside is old. A number divisible by many primes can't be small. | A big integer block; primes 2, 3, 5, 7, 11… clip onto it one by one as factors and the block visibly grows each time | bespoke `DivisibleNumber` | "A whole number that is divisible by many primes cannot be small."; "The central idea is old and simple." |
| 4 | Chebyshev used it in 1850, with factorials, to count primes. | The block becomes "a!"; a small "1850" stamp; the factors rearrange into a tally of primes | `DivisibleNumber` (mode `factorial`) | "In 1850 Chebyshev applied it to the factorial"; "Out came the first proof that the number of primes up to x has the order of magnitude x/log x." |
| 5 | The hypothesis says this curve of primes stays inside a band, forever. | The real curve draws itself inside the teal band; label "computed from the primes up to ten million" | bespoke `PrimeCurve` (real data) | "The hypothesis is the statement that this curve stays inside a band forever."; "Computed from the primes up to ten million" |
| 6 | A zero off the line would be a louder wave, and it would break out. | A ghost wave swells under the curve and pokes through the ceiling; the breach flashes amber | `PrimeCurve` (mode `breach`, illustrative) | "A zero off the line, at real part 0.8 say, would be a wave growing like y to the power 0.8, and sooner or later it would drown the others." |
| 7 | So a ceiling is enough. Stay below it, and there is no room for that wave. | A lid lowers onto the band from above; the ghost wave is squeezed out and fades | `PrimeCurve` (mode `lid`) | "If you can show the count stays *below* the ceiling across long stretches, there is no room for a louder wave" |
| 8 | The proof builds that ceiling with a chain. Longer chains bound better, but every link costs. | A chain grows link by link holding the lid; two meters beside it: "x/m" falling, "m" rising | bespoke `ChainBalance` | "One shrinks as the chain gets longer, like x/m: more multiplicity, sharper bound. The other grows with the chain, like m: every link adds its own loss." |
| 9 | Balance the two and you get the square root of x. | The two meters cross; the chain locks at "m = √x"; the lid settles exactly on the band edge | `ChainBalance` (mode `lock`) | "x/m equals m when m is √x, and the error is then of size √x. That is the square root of the Riemann hypothesis" |
| 10 | The author says Claude suggested that length. | Quote card, small: "Claude's suggested length of chain… was √X." — L. Alpöge | quote card | "In the note, the suggestion to take a chain of length √X is credited to Claude."; the quoted line of the note |
| 11 | He also says he can't yet explain the last stretch. | The chain's last links blur out of focus; a reader icon with a "?" | quote card (mode `blur`) | "He also says he cannot yet explain the last stretch, and that understanding it is the work that starts now." |
| 12 | Correct and understood have come apart. | Split screen: left "checked" fills teal; right "understood" stays an empty amber outline | bespoke `SplitVerdict` | "**Correct and understood have come apart.**" |
| 13 | Checked by machines in a day. Understood by people: not yet. | The file stack returns, fully teal, beside the still-empty reader icon | `FileStack` (mode `closer`) | "Everything a machine can settle was settled in about a day. The two rows at the bottom are the ones that take people, and time." |
| 14 | (no narration) | Outro card, ~2 s: AGILabs badge, javieraguilar.ai, title, credit "Proof: Levent Alpöge with Claude (Lean archive) · Independent checks: A. Sutherland and the Lean community · Curve computed from the primes" | outro | "Levent Alpöge, a number theorist who works at Anthropic"; "Andrew Sutherland's verification page" |

**Word count (EN):** about 150 spoken words, ~60 s at 2.5 words/s plus the silent outro. Over
the 140 cap by a few words: trim in the cold read (row 8 is the candidate) rather than now.

## Notes for the build

- **Real data:** `PrimeCurve` replays `(G(y) − log 2π)/√y` from
  `personal-website/scripts/figures/riemann-centred-prime-sum.py` (export ~2,000 points on the
  log grid to `src/data/prime-curve.json`). Band at ±0.0462, exactly as the article's figure.
  The breach in row 6 is illustrative and must look it (ghosted, dashed): say so in
  `factcheck.md`, not on screen.
- **Numbers on screen, exactly as the article writes them:** 175,187; 1850; "ten million";
  ±0.0462 if shown; √x. No token or agent counts: the article says they are not public.
- **Attribution:** rows 10-11 are the author's own account. Never "Claude proved"; the article
  says "a human chose the route and the model finished it", in the author's description.
- **Brand colours:** the article's figures use teal and amber; the video stays in brand colours
  as in the Navier–Stokes video.
