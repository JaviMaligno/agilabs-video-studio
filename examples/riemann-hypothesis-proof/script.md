# The Riemann hypothesis has a proof nobody has read — article video (EN) · script draft v0.2 (not approved)

Article: riemann-hypothesis-proof (javieraguilar.ai, EN, draft, proposed for 2026-11-24).
Vertical 9:16, target ~58-62 s. Format: **concept** (the idea inside the proof), not a replay
of the news. This article explains Alpöge and Claude's result, not an experiment of mine: the
proof is never presented as mine, and what the author says is attributed to him ("the author
says"). ES cut: pending.

Status: script only. Not built, not narrated (no TTS key in the cloud session), and the cold
read (`reel-viewer` + `reel-expert`) has not been run yet. Build after the article is approved,
so the source sentences stop moving.

## Premise (v0.2: the human side first, as the author asked)

- **Hook:** "Math is dead." That is what people said the week a machine-checked proof of the
  Riemann hypothesis appeared.
- **What the video is about (for a cold viewer):** what the humans did in that story, and why it
  points the other way.
- **Verdict:** mathematics is more alive than ever; choosing what is worth proving and
  explaining why it is true are now the scarce part.
- **Must show:** the pile of papers with one overlooked sheet picked out (taste); the path that
  continues past the point where the author stops (the model outran him); the second, hand-written
  manuscript landing the same afternoon ("we are still here"); the map of the proof being drawn
  over the unread archive (understanding catching up); the crowd of people looking.

## Central visual metaphor: the trail

A single trail across the dark stage. A person walks it, choosing at each fork; at one fork they
pick up a sheet everyone else walked past. Further on the trail gets steep, a small light (the
model) runs ahead and the person stops, looking up at where it went. The rest of the video is
other people arriving at the same trail: one with a thick hand-written manuscript, then many,
drawing a map of the stretch nobody has walked.

Secondary motif: **the stack of files** (175,187 tiles, "read by: 0"), shown once, early, as the
thing the map is being drawn over.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | "Math is dead." I read that a lot this week. | Title card; the phrase typed, then struck through with a "?" | intro (hook card) | "## \"Math is dead\""; "I have read that sentence a lot this week" |
| 2 | A proof of the Riemann hypothesis was published. Machines checked it in about a day. Nobody has read it. | The stack of files scanned teal; counter "read by: 0" | bespoke `FileStack` | "Lean files: 175,187"; "Everything a machine can check was checked within about a day"; "## A proof nobody has read" |
| 3 | But look at what the humans did. | Camera leaves the stack and finds the trail and the walker | bespoke `Trail` (mode `open`) | "**A human chose the route and the model finished it.**" |
| 4 | The author had planned his whole career around this problem. | The trail behind the walker stretches far back, with small year marks | `Trail` (mode `past`) | "A mathematician who had planned his whole career around this problem set the direction" |
| 5 | His clue was a paper almost nobody discussed, in a pile a rival lab had published. | A pile of sheets; one glows faintly at the bottom and is picked up | `Trail` (mode `pick`) | "a direct descendant of a neighbouring paper that almost nobody discussed"; "a mathematician at the other lab found the thread that mattered in the part nobody was talking about" |
| 6 | That is taste. Nobody automated it. | The sheet unfolds into the first stretch of trail | `Trail` (mode `unfold`) | "OpenAI's \"quiet inclusion of the Siegel argument\", he writes, \"showed great taste\""; "Choosing what is worth proving... were always most of the job." |
| 7 | Then the model went where he couldn't follow. He says so himself. | The small light runs up the steep stretch; the walker stops | `Trail` (mode `outrun`) | "by his own account the model outran him at the end"; "where he says he is \"out of my element\"" |
| 8 | Now his job is to understand his own proof. | The walker starts drawing the steep stretch on a sheet | `Trail` (mode `draw`) | "He also says he cannot yet explain the last stretch, and that understanding it is the work that starts now." |
| 9 | The same afternoon, a mathematician with twelve years of work and no AI published his draft. "We are still here." | A second figure arrives carrying a thick hand-written manuscript; quote on screen | `Trail` (mode `second`) + quote | "the work took twelve years"; "\"It is all human, with no AI\""; "\"we are still here. We are very much alive. We are not going anywhere.\"" |
| 10 | Within a day there was a public map of the proof, drawn with AI. | Many small figures arrive; a map of the unread stretch fills in | `Trail` (mode `map`) | "Within a day of the announcement there was a public map of the proof's architecture... all produced with AI assistance." |
| 11 | Understanding is behind. AI is how it catches up. | The map reaches the light at the top | `Trail` (mode `catchup`) | "Understanding is the part that is behind, and AI is the main reason it will not stay behind for long." |
| 12 | My view: mathematics is more alive than it has ever been. | Pull back: the whole trail, crowded, with new forks opening | `Trail` (mode `closer`) | "My view is that mathematics is more alive than it has ever been." |
| 13 | (no narration) | Outro card: AGILabs badge, javieraguilar.ai, title, credit "Proof: Levent Alpöge with Claude · Human draft: Alessandro Masullo · Independent checks: A. Sutherland and the Lean community" | outro | names as in the article |

**Word count (EN):** about 150 spoken words; trim to the 140 cap in the cold read (rows 2 and 9
are the candidates).

## Long version (YouTube, landscape, ~6-8 min): outline only

Same spine, with room for the idea, kept non-technical. Chapters:

1. **"Math is dead"** (the short's hook) and what happened on 20 November.
2. **It had been "proved" before.** Stieltjes, de Branges, Atiyah in 2018 and why nobody stopped
   to check; why this time people ran it.
3. **A proof nobody has read.** The numbers, and the checklist: what a machine settles, what it
   does not.
4. **The idea in one sentence.** A number divisible by many primes cannot be small; Chebyshev,
   1850; the prime curve inside its band (real data).
5. **Where the square root comes from.** Only the trade-off picture: a longer chain bounds
   better, every link costs, they meet at √x. No theta lifts by name beyond one mention.
6. **Who did what.** Taste (the overlooked paper), the model outrunning the author, his own
   words.
7. **The human proof the same afternoon.** Checked-but-not-understood versus
   written-to-be-understood-but-not-checked.
8. **Is mathematics dead?** The three reasons, and what actually ended.

Leave out of both cuts: Iwasawa theory, Galois representations, the scope of GRH, the list of
conditional theorems (one line at most in the long cut).

## Notes for the build

- **Real data (long cut only):** `PrimeCurve` replays `(G(y) − log 2π)/√y` from
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
