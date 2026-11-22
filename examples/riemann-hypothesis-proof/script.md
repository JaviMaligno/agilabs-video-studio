# The Riemann hypothesis has a proof nobody has read — article video (EN) · script v0.5 (v0.3 approved by the author, 2026-11-22; v0.4 = v0.3 after the cold read and lint; v0.5 = new ending at the author's request, see "v0.5" below)

Article: riemann-hypothesis-proof (javieraguilar.ai, EN, scheduled for 2026-11-24).
Vertical 9:16, about 60 s. Format: **concept**: what the humans did in the week of the proof,
and why "math is dead" points the wrong way. This article explains Alpöge and Claude's result,
not an experiment of mine: the proof is never presented as mine, and what the author says is
attributed to him ("he says so himself"). First person only for my own view (rows 1 and 12).
ES cut: pending.

Status: built, narrated (Cartesia, the author's cloned EN voice) and rendered. The cold read
(`reel-viewer` + `reel-expert`) ran before the build; see "Cold read and changes since v0.3".

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
| 1 | "Math is dead." I read that a lot this week. | Cold open: the stack of files still piling up, the hook over it (no strike-through: it gave the verdict away) | intro (cold open on `FileStack`, mode `loom`) | "## \"Math is dead\""; "I have read that sentence a lot this week" |
| 2 | A mathematician, working with an AI model, published a proof of the Riemann hypothesis. Machines checked it in about a day. Nobody has read it. | The stack counted (175,187 Lean files), scanned by the checker; "read by: 0" | bespoke `FileStack` (mode `count`) | "I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis."; "Lean files: 175,187"; "Everything a machine can check was checked within about a day"; "## A proof nobody has read" |
| 3 | But look at what the humans did. | Camera leaves the stack and finds the trail and the walker | bespoke `Trail` (mode `open`) | "**A human chose the route and the model finished it.**" |
| 4 | The author had planned his whole career around this problem. | The trail behind the walker stretches far back, with small year marks | `Trail` (mode `past`) | "A mathematician who had planned his whole career around this problem set the direction" |
| 5 | His clue was a paper almost nobody discussed, in a pile a rival lab had published. | A pile of sheets; one glows faintly at the bottom and is picked up | `Trail` (mode `pick`) | "a direct descendant of a neighbouring paper that almost nobody discussed"; "a mathematician at the other lab found the thread that mattered in the part nobody was talking about" |
| 6 | That is taste. Nobody automated it. | The sheet unfolds into the first stretch of trail | `Trail` (mode `unfold`) | "OpenAI's \"quiet inclusion of the Siegel argument\", he writes, \"showed great taste\""; "Choosing what is worth proving... were always most of the job." |
| 7 | Then the model went where he couldn't follow. He says so himself. | The small light runs up the steep stretch; the walker stops | `Trail` (mode `outrun`) | "by his own account the model outran him at the end"; "where he says he is \"out of my element\"" |
| 8 | Now his job is to understand his own proof. | The walker starts drawing the steep stretch on a sheet | `Trail` (mode `draw`) | "He also says he cannot yet explain the last stretch, and that understanding it is the work that starts now." |
| 9 | The same afternoon, a mathematician with twelve years of work and no AI published his draft. "We are still here." | A second figure arrives carrying a thick hand-written manuscript; quote on screen | `Trail` (mode `second`) + quote | "the work took twelve years"; "\"It is all human, with no AI\""; "\"we are still here. We are very much alive. We are not going anywhere.\"" |
| 10 | Within a day there was a public map of the proof, drawn with AI. | Many small figures arrive; a map of the unread stretch fills in | `Trail` (mode `map`) | "Within a day of the announcement there was a public map of the proof's architecture... all produced with AI assistance." |
| 11 | Understanding is behind. AI is how it catches up. | The map climbs towards the light and stays short of it | `Trail` (mode `catchup`) | "Understanding is the part that is behind, and AI is the main reason it will not stay behind for long." |
| 12 | My view: mathematics is more alive than it has ever been. | Pull back: the whole trail, crowded, with new forks opening | `Trail` (mode `closer`) | "My view is that mathematics is more alive than it has ever been." |
| 13 | (no narration) | Outro card: AGILabs badge, javieraguilar.ai, title, credit "Proof: Levent Alpöge with Claude · Human draft: Alessandro Masullo · Independent checks: A. Sutherland and the Lean community" | outro | names as in the article |

**Word count (EN):** about 150 spoken words, around 60 s at 2.5 words/s plus the silent outro.
No cap to hit: cut only lines that repeat.

## Cold read and changes since v0.3

Both readers ran on v0.3 (independent sessions; the viewer saw only the numbered narration with
the visuals in brackets, the expert also a factual summary of the article).

- **reel-viewer:** retold the video correctly; best line "Now his job is to understand his own
  proof"; non-obvious takeaway: a man has to study his own proof. Lost at "the model" in row 7
  (the AI had not been introduced), at row 9 ("a draft of what?") and at rows 6 and 11 as
  abstract. Scroll point: row 5. Red flags: the struck-through title with a "?" gives the answer
  away; rows 9-10 read as a second story.
- **reel-expert:** the point survives. Flagged: row 2 never says an AI was involved; row 6
  ("Nobody automated it") stronger than the article's body; row 9 leaves out that the human draft
  is unchecked and under revision; the visual of row 11 (the map reaching the light) contradicts
  "understanding is behind"; the second figure should not arrive at the same summit.

What changed:

| Row | Before (v0.3) | After (v0.4) | Why |
|---|---|---|---|
| 2 (narration) | A proof of the Riemann hypothesis was published. | A mathematician, working with an AI model, published a proof of the Riemann hypothesis. | Both readers: "the model" of row 7 came from nowhere. No stronger than the article ("I believe I have, working with Claude, discovered a proof"). |
| 9 (narration) | one sentence in one take | the same words in two takes: "The same afternoon," / "a mathematician with twelve years of work and no AI published his draft." | Lint: spoken in one go, the first caption ran at 18.7 chars/s (limit 17). No word changed. |
| 1 (visual) | phrase struck through with a "?" | cold open on the stack, no strike-through | Viewer: it gave the verdict away; and a text-only frame 0. |
| 9 (visual) | second figure arrives at the same trail | arrives on a path of its own, away from the summit | Expert: its route is unverified and is not the same proof. |
| 11 (visual) | the map reaches the light | the map climbs towards the light and stops short | Expert: "understanding is behind". |

Kept as approved, with the reason: row 6 ("That is taste. Nobody automated it.") follows the
article's own `linkedinSummary` ("That is taste, and it is the part no one automated."); row 9's
status is carried by the word "draft" and the outro credit "Human draft", not by a new line; the
viewer's wider suggestions (explain the hypothesis, name the author, cut the second
mathematician) would rewrite an approved script and are left to the author.

**Word count (EN), as built:** 149 spoken words; 63.1 s with the silent outro.

## v0.5: the ending (author's notes, 2026-11-22)

The author: "My view" sounded unnatural, the lines broke the rhythm, and it was not clear why he
thinks mathematics is more alive than ever. Rows 11-12 rewritten from the article's three reasons,
reasons first and short, ending on the answer to the hook. Rows 1-10 unchanged.

| Row | Before (v0.4) | After (v0.5) | Source sentence |
|---|---|---|---|
| 11 | Understanding is behind. / AI is how it catches up. (two takes) | Understanding is behind, and AI is how it catches up. (one take) | linkedinSummary |
| 12a | My view: mathematics is more alive than it has ever been. | A problem about prime numbers made the front pages. | "A problem about the zeros of a function was front-page news" |
| 12b | | Trying a new route used to cost a career. | "trying it by hand would have cost a career" |
| 12c | | Now it costs weeks, so far more routes get tried. | "When exploring a route costs weeks, far more routes, tools and connections get explored" |
| 12d | | The real job was always picking what's worth proving, and explaining why it's true. | "Choosing what is worth proving ... and explaining why something is true were always most of the job" |
| 12e | | So no, math isn't dead. / I think it's more alive than ever. | "My view is that mathematics is more alive than it has ever been" |

Cold read of a first draft (viewer + expert): the expert flagged "What has ended is the race to be
first" (contradicts row 9, where two proofs appear the same afternoon; the article says the *idea*
that being first is the job ended), so it was cut; the viewer wanted the reasons before the
verdict, one per line, the hook answered last, and the robot at the summit not to be the last
image of the argument. Both applied. Open viewer notes on rows 2, 5, 9 and 10 (Lean, "a pile a
rival lab had published", who the second mathematician is, "a map of a proof") are outside what
the author asked to change and are left to him. As built: ~79 s.

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
- **The trail is a metaphor**, not footage of anything measured: say so in `factcheck.md`, not
  on screen.
- **Numbers on screen, exactly as the article writes them:** 175,187 and "twelve years" in the
  short; 1850, "ten million", ±0.0462 and √x only in the long cut. No token or agent counts: the article says they are not public.
- **Attribution:** rows 4-8 are the author's own account. Never "Claude proved"; the article
  says "a human chose the route and the model finished it", in the author's description.
- **Brand colours:** the article's figures use teal and amber; the video stays in brand colours
  as in the Navier–Stokes video.
