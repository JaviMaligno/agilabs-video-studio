# Fact-check: The Riemann Hypothesis Has a Proof Nobody Has Read (EN landscape, long cut) · script v0.3

Source: `src/content/blog/en/riemann-hypothesis-proof.md` (personal-website, scheduled for
2026-11-24). The narration of record is `src/timeline.ts`; `script.md` gives, row by row, the
article sentence each spoken claim rests on ("Source sentence" column), and its v0.3 sections list
every wording change after the TTS pass. This file covers what the script table does not: the
numbers and labels drawn on screen, the real data, and the checks run.

The proof is not the narrator's. First person only for the narrator's reading (row 1), his view
(rows 5, 52, 58) and his memory of the Atiyah claim (row 13). Never "Claude proved": the √ chain
suggestion, "began to leave me in awe" and "out of my element" are Alpöge's own account.

## Checks run

- **reel-expert, v0.2** (script + article): every number and quote matched; six fixes applied
  (see `script.md`, "Cold read and changes").
- **reel-expert, final narration** (125 lines after the caption trims, 2026-11-23): no blocking
  issues; two optional wordings applied (rows 20 and 39, see `script.md`).
- **reel-viewer**, three runs on v0.1-v0.2 (see `script.md`). Chapter 8 reuses the approved short's
  ending, which had its own viewer + expert read.

## Numbers and labels on screen

| Scene | On screen | Article sentence |
|---|---|---|
| note | "Levent Alpöge", "20 November", "Anthropic · makes Claude", the quoted sentence | "On Friday 20 November, Levent Alpöge, a number theorist who works at Anthropic, posted a four-page note"; "\"I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis.\"" |
| footnote | 14 links labelled "Lean" | "It is in a footnote: fourteen links to an archive of Lean code" |
| stack | "175,187 Lean files", "✓ checked by machine", "read by: 0" | "Lean files: 175,187"; "## A proof nobody has read" |
| claimed | "1859", "167 years", "$1,000,000", "about 1 in 14 is prime", "expected: 72", "actual: 75", "≈ √x" | "It is 167 years old, it is one of the seven Millennium Prize problems"; "roughly one number in fourteen should be prime; among the thousand numbers that follow 1,000,000 the estimate gives 72 primes, and there are 75". The 75 dots are computed in code (primes in 1,000,001-1,001,000). The drift chart is a sketch; its label says "at most ≈ √x". |
| zeros | first ten zeros at 14.13 … 49.77 on the line ½ | standard values of the zeros' imaginary parts; "The hypothesis is that they all sit exactly in the middle of it"; "Every zero ever computed is on it." |
| zeros (v0.4) | trivial zeros "−2, −4, −6, …" on a compressed negative axis (break mark), "from a simple factor", "all the others (real part 0 to 1)" | "Some of those zeros are uninteresting (the negative even integers). All the others lie in a vertical strip of the complex plane, between real part 0 and real part 1." "From a simple factor" / "barely touch the primes" is standard (the sine factor of the functional equation; their term in the explicit formula is tiny), not from the article. |
| history | "Stieltjes · 1885", "Heidelberg · 2018", "Atiyah" | "The oldest goes back to 1885, when Thomas Stieltjes wrote to Charles Hermite"; "At the Heidelberg Laureate Forum in 2018" |
| tower | "175,187 Lean files", "17.4 million lines, no comments", "over 250,000 pages, by the author's count" | "Lean files: 175,187"; "Lines: 17.4 million, with no comments"; "over 250,000 pages, by the author's count" |
| slop | "some massive unreadable travesty of slop" — Levent Alpöge | the article's quote |
| checks | seven rows; "only Lean's 3 basic rules"; "about a day"; rows 6-7 "not yet" | "Only Lean's three standard axioms."; "A second kernel, written independently in Rust, accepts the full proof."; "Everything a machine can settle was settled in about a day."; "Is there a proof a person can read? Not yet." |
| twoquote | "twelve years · all human · no AI", "We are still here. We are very much alive." — Alessandro Masullo | "\"It is all human, with no AI\""; "the work took twelve years"; "\"we are still here. We are very much alive. We are not going anywhere.\"" |
| revised | sticky notes, "MAJOR REVISION" stamp | the paper is "undergoing major revision"; problems "found with the help of AI models" |
| split | "✓ checked completely / ✗ understood by nobody"; "✓ written to be understood / ✗ checked by nobody"; prize checkboxes "published", "two-year wait", "accepted by mathematicians" | "One proof has been checked completely and understood by nobody. The other was written to be understood and has been checked by nobody."; "publication in a qualifying outlet, a wait of two years, and general acceptance" |
| idea | the sentence; blocks 2, 3, 5, 7, 11…; "1850 · Chebyshev"; "n! = 1 × 2 × 3 × …"; "order x / log x" | "A whole number that is divisible by many primes cannot be small."; "In 1850 Chebyshev applied it to the factorial ... the number of primes up to x has the order of magnitude x/log x" |
| waves | log axis 10 … 10,000,000; band "±0.0462"; "furthest it gets: 0.023" on the dip | real data from `scripts/prime-curve.py` (the article's own computation, `riemann-centred-prime-sum.py`): band 2 + γ − log 4π = 0.0462; extremes +0.0187 and −0.0227, so the article's "never exceeds 0.023 in absolute value" is the dip. The "louder wave" is drawn dashed and labelled hypothetical. |
| chain | "1940s · Weil", "1969 · Stepanov", "chain length m", "m = √x" | "That twin was proved by André Weil in the 1940s ... and then again, starting in 1969, by Sergei Stepanov"; "x/m equals m when m is √x" |
| chain (v0.4) | "curves over finite fields"; narration "already proved by Weil in the 1940s" | "The Riemann hypothesis has a twin for curves over finite fields ... That twin was proved by André Weil in the 1940s" |
| credit | "chain length √x", "suggested by Claude, as credited in the note"; "And yet, what else could it be?" | "In the note, the suggestion to take a chain of length √X is credited to Claude."; "(And yet, what else could it be?)" |
| mountain | "17.4 million lines of Lean" | "which is where most of the seventeen million lines go" |
| map | "public map · drawn with AI", "core of the proof −26.6%", "mostly housekeeping" | "Within a day ... a public map of the proof's architecture ... all produced with AI assistance"; "the core of the proof 26.6% smaller than the original" |

No token or agent counts anywhere: the article says they are not public.

## Metaphors (not footage of anything measured)

The trail, the mountain of pages, the boxes of prime blocks, the chain and the checker robot are
drawings of ideas, not data. The only plotted data is the prime curve (scene `waves`) and the
primes counted in `claimed`.
