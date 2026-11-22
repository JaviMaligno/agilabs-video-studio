# The Riemann hypothesis has a proof nobody has read — long explainer for YouTube (EN) · script v0.2 (v0.1 after two cold reads; changes below)

Article: riemann-hypothesis-proof (javieraguilar.ai, EN, scheduled for 2026-11-24).
Concept video, landscape 16:9 (1920x1080), ~9-10 min, with YouTube chapters. EN only (ES column
empty). Spine: the approved short (`script.md`, rows 1-13), whose lines are reused in chapters
0, 6 and 8. The proof is Levent Alpöge's, working with Claude; what he says is attributed to him.
First person only for the author's own view and his Atiyah memory (rows 5, 13, 53, 59).

## Premise

- **Hook:** "Math is dead." That is what people said the week a machine-checked proof of the
  Riemann hypothesis appeared, and nobody has read it.
- **What it is about (for a cold viewer):** a mathematician working with an AI posted a proof of
  the most famous open problem in maths; computers checked it in a day; no person has read it.
  What was checked, what the idea is, who did what, and why "math is dead" points the wrong way.
- **Verdict:** correct and understood have come apart; understanding is behind, and AI is how it
  catches up. Choosing what is worth proving and explaining why it is true are now the scarce part.
- **Retention:** the people chapters (4-5) come before the mathematics (6-7), so the strongest
  moment (the two proofs side by side) lands at ~5:40, not at minute 7. Chapter 4 plants "a 1969
  trick missing one ingredient"; chapter 7 pays it. The hook's "fits in one sentence" is paid in 6.
- **Must show:** the stack of files with "read by: 0"; the checklist with five green rows and two
  amber ones; the one-sentence idea as a drawing (a number capped by its size, packed with primes);
  the real prime curve inside its band (data from the article's script); the chain whose two costs
  meet at √x; the trail: the overlooked sheet picked from a pile, the robot running ahead, the
  author drawing his own proof; the second mathematician with the hand-written manuscript; the two
  proofs side by side (checked/not understood vs understood/not checked); the map climbing towards
  the summit and stopping short.

## Visual world (shared with the short)

The short's trail at night, re-illustrated (Codex, AGILabs cast style): a generic cartoon
mathematician walking a mountain trail, the violet robot (the model), a mountain made of stacked
pages (the unread proof), a pile of papers with one glowing sheet, a second mathematician with a
thick hand-written manuscript, small mapmaker figures. Chapters 1-3 and 6-7 (the explanatory ones) leave
the mountain for a "blackboard" stage (dark slate, chalk-like lines in brand colours); chapters 4,
5 and 8 are on the trail. The author's avatar appears only as a cameo in row 13 (the Atiyah
memory) and in the outro.

## Chapters (YouTube)

0:00 Intro · 0:58 1 · What was claimed · 1:56 2 · Proved before · 2:50 3 · A proof nobody has read · 4:07 4 · Who did what · 4:59 5 · The other proof · 5:53 6 · The idea in one sentence · 7:35 7 · Where the square root comes from · 8:48 8 · Is maths dead? (timestamps estimated from word counts;
recomputed after TTS)

| # | Ch | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | 0 | "Math is dead." I read that a lot this week. | Frame 0: the stack of files still piling up across the wide stage, the hook over it | intro on bespoke `FileStack` (mode `loom`, landscape) | "## \"Math is dead\""; "I have read that sentence a lot this week" |
| 2 | 0 | On the twentieth of November, a mathematician called Levent Alpöge, who works at Anthropic, the company that makes Claude, posted a four-page note. It said: "I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis." | A drawn four-page note on a desk; the quoted sentence highlights line by line | bespoke `NotePage` | "On Friday 20 November, Levent Alpöge, a number theorist who works at Anthropic, posted a four-page note"; "\"I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis.\"" |
| 3 | 0 | The proof wasn't in the note. A footnote linked to it: code in Lean, a language where a computer checks every step of a proof, like a spell-checker for maths. | The footnote unspools into links that drop into the file stack | `NotePage` → `FileStack` | "The proof itself is not in the note. It is in a footnote: fourteen links to an archive of Lean code, the language in which a program can check a mathematical proof step by step." |
| 4 | 0 | By the end of that day, people with nothing to do with him had run the checkers, and the checkers said yes. Nobody has read it. | The stack counted (175,187 Lean files), scanned by the checker; "read by: 0" | `FileStack` (mode `count`) | "By the end of that Friday, people who had nothing to do with the author had compiled the archive, and the checkers had accepted it."; "## A proof nobody has read" |
| 5 | 0 | In this video: why anyone took it seriously, what the humans did, and the idea at its heart, which fits in one sentence. Because I think "math is dead" points the wrong way. | The mountain of stacked pages at night; the eight chapter stops light up along the trail | bespoke `Trail` (mode `overview`, landscape) | "the parts I find most interesting do not fit in a headline"; "I think it is the opposite of what happened" |
| 6 | 1 | The Riemann hypothesis is the most famous open problem in mathematics: a hundred and sixty-seven years old, with a million-dollar prize. | Chapter card "1 · What was claimed"; blackboard stage; "1859", a prize medal drawn | chapter card + bespoke `Board` | "The Riemann hypothesis is the best-known open problem in mathematics. It is 167 years old, it is one of the seven Millennium Prize problems" |
| 7 | 1 | In one line, it says the prime numbers are spread as evenly as they possibly could be. | A number line; the primes light up as dots, thinning out to the right | bespoke `PrimeLine` | "it says, in one line, that the prime numbers are spread as evenly as they possibly could be" |
| 8 | 1 | Near a million, about one number in fourteen is prime. In the thousand numbers after a million, that guess gives seventy-two primes. There are seventy-five. | Zoom on 1,000,000-1,001,000: counter "expected 72", then the real dots counted to "75" | `PrimeLine` + `Counter` | "roughly one number in fourteen should be prime; among the thousand numbers that follow 1,000,000 the estimate gives 72 primes, and there are 75" |
| 9 | 1 | The guess is never exact. The hypothesis is about how far off it can drift: by not much more than the square root of how far you've counted. | The gap between guess and count drawn as a ribbon; "≈ √x" label | `PrimeLine` | "If every zero has real part 1/2, every wave has an amplitude proportional to √y"; "for x ≥ 2657, the count of primes up to x differs from Gauss's estimate li(x) by less than √x · log x / 8π" |
| 10 | 1 | Riemann tied that drift to one function, the zeta function, and the points where it equals zero. The hypothesis says those zeros all sit on one line. Every zero ever computed is on it, but computing them can never prove it. | The strip with the middle line; the first ten zeros drop onto it; a dashed pair off the line flickers and fades | bespoke `CriticalLine` | "the fine detail of that pattern is controlled by a single function, the zeta function ζ(s) ... The hypothesis is that they all sit exactly in the middle of it"; "Every zero ever computed is on it."; "Computing zeros, however many, can never prove the hypothesis" |
| 11 | 2 | And it had been "proved" before. Many times. | Chapter card "2 · Proved before"; a pile of old letters and papers, each stamped with a year | chapter card + bespoke `ClaimPile` | "Announced proofs of the Riemann hypothesis are a genre, and almost none of them is taken seriously for more than a day." |
| 12 | 2 | In 1885, Thomas Stieltjes wrote to a colleague that he'd proved something that would imply it. He never published a proof. Many others have tried since. | An 1885 letter in an envelope; "proof?" left blank | `ClaimPile` | "The oldest goes back to 1885, when Thomas Stieltjes wrote to Charles Hermite that he had proved a bound which would have implied the hypothesis. He never published a proof."; "the preprint servers receive a steady supply of short papers titled some variant of \"A proof of the Riemann hypothesis\"" |
| 13 | 2 | In 2018, Michael Atiyah, one of the most decorated mathematicians alive, claimed a proof at a conference. I was studying maths at university then. Nobody around me took it seriously, not even for an afternoon. | A lecture stage, "Heidelberg 2018"; the author's avatar in a lecture hall seat, shrugging (cameo) | `ClaimPile` + cameo | "At the Heidelberg Laureate Forum in 2018, one of the most decorated mathematicians alive ... claimed to have solved it"; "I was studying mathematics at university at the time, and what I remember is that nobody around me took it seriously, not even for an afternoon." |
| 14 | 2 | Nobody was unkind. A claim that big, on a short argument and a great name, just wasn't worth stopping to check. | The pile dims | `ClaimPile` | "Nobody was unkind about it. Everyone simply knew that a claim of this size, resting on a short argument and a great name, was not something you had to stop and check." |
| 15 | 2 | This time, nobody had to believe anything. Anyone with a big enough computer could test it, against a statement other people had written. The reaction went from "who has the time?" to "run it." | The file stack slides in beside the pile; two speech bubbles swap: "who has the time?" → "run it" | `ClaimPile` → `FileStack` | "This one did not ask anyone to believe anything. It came with an object that anyone with a large enough computer could test, against a statement the author had not written. That changed the default response from \"probably wrong, who has the time\" to \"run it\"" |
| 16 | 3 | So what did they run? | Chapter card "3 · A proof nobody has read"; the stack, wide | chapter card + `FileStack` | "## A proof nobody has read" |
| 17 | 3 | Over a hundred and seventy-five thousand files. Seventeen million lines. Written out for people, the author reckons, over a quarter of a million pages. | Tiles: "175,187 Lean files", "17.4 million lines, no comments", "over 250,000 pages, by the author's count"; a paper tower rising past the frame | `StatGrid` + bespoke paper tower | "Lean files: 175,187"; "Lines: 17.4 million, with no comments"; "The same argument written out for people: over 250,000 pages, by the author's count" |
| 18 | 3 | He did generate that long version, and chose not to post it. In his words, it would have been "some massive unreadable travesty of slop." | The tower topples into a bin; quote on screen | `KeyQuote` | "Alpöge did generate the long document, and decided against posting it: in his words it would have been \"some massive unreadable travesty of slop\"" |
| 19 | 3 | So everything rests on the checker, and people attacked the checking from every side. | A small program box (the checker) beside the stack; a checklist draws in, seven empty rows | bespoke `Checklist` | "So the claim rests on the checker, and the first thing the community did was attack the checking from every side it could think of." |
| 20 | 3 | Does it compile? Every file. Does it prove the right statement? It proves the exact version the Lean community had written down long before, so it can't have proved something easier under the same name. | Rows 1-2 tick green | `Checklist` | "All 175,187 modules, zero errors"; "the statement was written by other people, before the proof existed, so the proof cannot have quietly proved something easier under the same name" |
| 21 | 3 | Anything hidden in the assumptions? No, only the three basic rules every Lean proof starts from. Could the checker have a bug? A second checker, written independently, accepts it too. | Rows 3-4 tick green | `Checklist` | "Only Lean's three standard axioms. No hidden hypothesis about primes or zeros."; "A second kernel, written independently in Rust, accepts the full proof." |
| 22 | 3 | Others rebuilt it and got the same result. All in about a day. | Row 5 ticks; "about a day" stamped across the five green rows | `Checklist` | "Independent rebuilds by other people"; "Everything a machine can settle was settled in about a day." |
| 23 | 3 | Two rows stay open: a proof a person can read, and mathematicians who understand why it's true. A machine can say that it follows. It can't say why. | Rows 6-7 stay amber, "not yet" | `Checklist` | "Is there a proof a person can read? Not yet."; "Do mathematicians understand why it is true? Not yet."; "A kernel certifies that the theorem follows from the axioms. It does not say why." |
| 24 | 4 | So who did what? | Chapter card "4 · Who did what"; the trail and the walker | chapter card + `Trail` (mode `open`) | "## Who did what" |
| 25 | 4 | Alpöge had planned his whole career around this problem. | The trail behind the walker stretches far back, with small year marks | `Trail` (mode `past`) | "A mathematician who had planned his whole career around this problem set the direction"; "Alpöge writes that the problem was his secret plan since his student days" |
| 26 | 4 | His clue was a paper almost nobody discussed, in a pile of machine-written papers a rival lab, OpenAI, had released in October. | A pile of sheets; one glows faintly at the bottom and is picked up | `Trail` (mode `pick`) | "In October, OpenAI published several hundred machine-written manuscripts"; "a direct descendant of a neighbouring paper that almost nobody discussed" |
| 27 | 4 | He recognised in it the skeleton of a 1969 trick by Sergei Stepanov, missing one ingredient. Picking that paper out of the pile is taste, and nobody automated it. | The sheet unfolds into the first stretch of trail | `Trail` (mode `unfold`) | "he \"immediately recognized it as Stepanov without multiplicity\""; "What his proof adds is the multiplicity, through the chain of lifts"; "That is taste, and it is the part no one automated." (linkedinSummary) |
| 28 | 4 | He set the route. Then, in his words, "Claude began to leave me in awe." The decisive stretch is in an area where he says he's "out of my element." The model is an internal one; you can't run it. | The robot runs up the steep stretch; the walker stops | `Trail` (mode `outrun`) | "\"guided us to the right situation analogous to that toy setting, and then Claude began to leave me in awe\""; "where he says he is \"out of my element\""; "Tao describes it as \"an internal AI model\", so ... this is not something you can run" |
| 29 | 4 | Now his job is to understand his own proof, and write it properly. | The walker starts drawing the steep stretch on a sheet | `Trail` (mode `draw`) | "The author says he intends \"to write it properly\""; "He also says he cannot yet explain the last stretch, and that understanding it is the work that starts now." |
| 30 | 5 | The same afternoon, a second proof appeared. | Chapter card "5 · The other proof"; a second figure arrives on a path of its own, carrying a thick hand-written manuscript | chapter card + `Trail` (mode `second`) | "## The other proof, the same afternoon"; "Hours later ... posted a human proof of the same theorem" |
| 31 | 5 | A draft by Alessandro Masullo. Twelve years of work, all human, no AI. His message to discouraged mathematicians: "We are still here. We are very much alive." | Quote on screen beside the figure | `Trail` (mode `second`) + quote | "a draft by Alessandro Masullo"; "\"It is all human, with no AI\""; "the work took twelve years"; "\"we are still here. We are very much alive. We are not going anywhere.\"" |
| 32 | 5 | Within hours, people reported problems in it, found with the help of AI. It was already being revised, and nobody vouches for it yet. | Small sticky notes land on the manuscript; "major revision" stamp | `Trail` (mode `second`) | "several people had reported problems in the draft, found with the help of AI models"; "the paper is \"undergoing major revision\""; he made "no claim as to the correctness of the proof strategy" |
| 33 | 5 | Put the two side by side. One proof has been checked completely, and understood by nobody. The other was written to be understood, and checked by nobody. | Split screen: the file stack (✓ checked · ✗ understood) / the manuscript (✓ written for people · ✗ checked) | bespoke `TwoProofs` | "One proof has been checked completely and understood by nobody. The other was written to be understood and has been checked by nobody." |
| 34 | 5 | Until this year, those two came together. The only way to check a proof was to understand it. | The two halves slide together into one sheet, then apart | `TwoProofs` | "Until this year those two properties came together, because the only way to check a proof was to understand it." |
| 35 | 5 | And the million dollars? Not yet. The prize needs publication, a two-year wait, and mathematicians accepting it. | The prize medal from chapter 1 behind glass; three empty checkboxes: "published", "two years", "accepted" | `TwoProofs` (coda) | "The Clay Mathematics Institute requires publication in a qualifying outlet, a wait of two years, and general acceptance by the mathematical community. An archive that no one has read is, for now, none of those." |
| 36 | 6 | Back to the proof itself. Here's the surprise: the idea at the heart of all those lines fits in one sentence. | Chapter card "6 · The idea in one sentence" | chapter card | "## The idea, in one sentence" |
| 37 | 6 | A whole number divisible by many primes cannot be small. | The sentence, large, on the blackboard | `KeyQuote` | "A whole number that is divisible by many primes cannot be small." |
| 38 | 6 | Every prime that divides a number takes up some of its size. So a number of known size has room for only so many prime factors. That's a ceiling on a count of primes. | A number drawn as a box with a lid at its size; prime blocks (2, 3, 5, 7...) pack in until the lid stops them; label "a ceiling on a count of primes" | bespoke `PrimeBox` | "Every prime power dividing N contributes to its size, so if you add up log p over all the prime powers that divide N, you cannot exceed log N."; "That is an upper bound on a count of primes." |
| 39 | 6 | It's the oldest trick there is. Chebyshev used it in 1850, with the factorial, and got the first proof of roughly how many primes there are. | "1850"; the box becomes "a!" (1 × 2 × 3 × ...), packed | `PrimeBox` | "This is not a new trick. It is the oldest one. In 1850 Chebyshev applied it to the factorial ... Out came the first proof that the number of primes up to x has the order of magnitude x/log x." |
| 40 | 6 | The factorial isn't divisible enough to go further. The new proof uses a much more divisible number, whose size can be computed exactly. | A second box, far more tightly packed, glows | `PrimeBox` | "The factorial is not divisible enough to give more than that. The announced proof runs the same principle with a much more divisible number."; "its size can be computed exactly" |
| 41 | 6 | Why does a ceiling help? Each zero adds a wave to the count of primes, and if the zeros are all on the line, every wave stays small. You can watch the waves with nothing but a list of primes: count them up to ten million, subtract what you expect, and shrink it by the square root. | The real curve draws from left to right, x from 10 to 10,000,000 on a log axis | bespoke `PrimeCurve` (real data) | "Riemann's formula says that each zero of ζ contributes a wave to the count of primes"; "If every zero has real part 1/2, every wave has an amplitude proportional to √y"; "You can watch this with nothing but a list of primes. Take a weighted count of the primes up to y, subtract the amount you expect, and divide by √y"; "computed for y from ten to ten million" |
| 42 | 6 | It wobbles, but it never leaves a narrow band. The hypothesis says it stays inside forever. | The band fades in, labelled "what the hypothesis allows: ±0.0462"; the curve stays inside, a marker at its peak "highest it gets: 0.023" | `PrimeCurve` | "The hypothesis is the statement that this curve stays inside a band forever."; "the curve never exceeds 0.023, half the width of the band the hypothesis allows" |
| 43 | 6 | And a wave that grew too big would swing up as well as down, so it would break through the top. That's why a ceiling, over long stretches, is enough. | Only the top edge of the band stays lit; a hypothetical bigger wave (dashed) would poke through it, and is rejected | `PrimeCurve` | "you do not need both sides of the band. A wave goes up as well as down. If you can show the count stays below the ceiling across long stretches, there is no room for a louder wave, because a louder wave would have poked through." |
| 44 | 6 | A picture like this is evidence, not proof. The proof has to hold for every number, forever. | Caption card over the curve | `PrimeCurve` | "A picture like this is evidence, not proof; the proof has to hold for every y." |
| 45 | 7 | That still doesn't give the square root. The second idea does. | Chapter card "7 · Where the square root comes from" | chapter card | "That, alone, does not give the square root. The second idea does" |
| 46 | 7 | Remember Stepanov's trick? In 1969 it gave a much simpler proof of a twin of the hypothesis, in a simpler world, already proved in the 1940s. The missing ingredient is something like derivatives, and whole numbers have none. | A small curve with points; "1940s" with a heavy toolbox, then "Stepanov, 1969" with a pencil; a derivative sign bounces off a whole number | bespoke `Board` | "That twin was proved by André Weil in the 1940s with heavy machinery, and then again, starting in 1969, by Sergei Stepanov with almost none."; "multiplicity \"is hard to find over the integers, corresponding to something like differentiating whole numbers\"" |
| 47 | 7 | Alpöge's substitute is a chain: a construction applied again and again, each time making the number more divisible. A longer chain gives a sharper ceiling. | A chain draws link by link; a falling curve "what a short chain loses" | bespoke `ChainTradeoff` | "What his proof adds is the multiplicity, through the chain of lifts"; "apply it once and you gain a certain amount of divisibility, apply it m times in a row and you gain it m times over"; "One shrinks as the chain gets longer, like x/m: more multiplicity, sharper bound." |
| 48 | 7 | But every link also adds a little error. Too short, and the ceiling is blunt. Too long, and the errors pile up. | A rising line "what every link costs"; the total dips and rises | `ChainTradeoff` | "The other grows with the chain, like m: every link adds its own loss. The best you can do is make them equal." |
| 49 | 7 | The best length is where the two meet: the square root. And the square root is exactly what the hypothesis needs. | The minimum lights at "m = √x"; the ribbon from row 9 ("≈ √x") echoes | `ChainTradeoff` | "x/m equals m when m is √x, and the error is then of size √x. That is the square root of the Riemann hypothesis" |
| 50 | 7 | In the note, that suggestion, a chain as long as the square root, is credited to Claude. Alpöge adds: "And yet, what else could it be?" | Quote card; the violet robot holding a small "√" | `KeyQuote` | "In the note, the suggestion to take a chain of length √X is credited to Claude."; "(And yet, what else could it be?)" |
| 51 | 7 | Under that simple idea sits a huge amount of modern number theory, rebuilt from scratch. That's where most of the seventeen million lines go. | The blackboard idea sits on top of the mountain of stacked pages; pull back | `Trail` (mode `mountain`) | "It rests on a formal reconstruction of a large part of the Langlands programme, which is where most of the seventeen million lines go."; "A Lean proof cannot cite anything Mathlib does not contain, so the archive carries its own formal construction of them." |
| 52 | 8 | So, is mathematics dead? | Chapter card "8 · Is maths dead?"; back to the trail | chapter card + `Trail` | "## \"Math is dead\"" |
| 53 | 8 | I think it's the opposite, for three reasons. First, look how many people are watching. A problem about the zeros of a function was front-page news. | Many small figures arrive at the foot of the mountain | `Trail` (mode `crowd`) | "Three reasons, in increasing order of importance. The first is simply how many people are looking. A problem about the zeros of a function was front-page news" |
| 54 | 8 | Second, AI isn't only solving. It's helping us understand. Within a day there was a public map of the proof, drawn with AI. Volunteers and their models have already cut the core of the proof by about a quarter. Mostly housekeeping so far, but the work has started. | The mapmakers draw a map of the unread stretch; a small leaderboard ticks "−26.6%" | `Trail` (mode `map`) | "Within a day of the announcement there was a public map of the proof's architecture ... all produced with AI assistance."; "The proof itself is already a quarter smaller, shrunk by volunteers and their models on a public leaderboard."; "the core of the proof 26.6% smaller than the original" |
| 55 | 8 | Understanding is behind. AI is how it catches up. | The map climbs towards the light and stays short of it | `Trail` (mode `catchup`) | "Understanding is the part that is behind, and AI is the main reason it will not stay behind for long." |
| 56 | 8 | Third, what it opens. When trying a route costs weeks instead of a career, far more routes get tried. And the bigger questions are still open. | New forks branch off the trail in every direction | `Trail` (mode `forks`) | "partly because trying it by hand would have cost a career. When exploring a route costs weeks, far more routes, tools and connections get explored. The questions do not run out: the wider forms of the hypothesis are still open" |
| 57 | 8 | What has ended is narrower: the idea that being first to find a proof is the main thing a mathematician is for. | A small "first!" flag at the summit fades | `Trail` (mode `forks`) | "What has ended is something narrower: the idea that being the first to find a proof is the main thing a mathematician is for." |
| 58 | 8 | Choosing what's worth proving, and explaining why it's true, were always most of the job. Now they're the scarce part. | The walker's chosen sheet and his drawing of the proof glow | `Trail` (mode `forks`) | "Choosing what is worth proving, recognising that a toy case hides the real one, and explaining why something is true were always most of the job. They are now the scarce part." |
| 59 | 8 | My view: mathematics is more alive than it has ever been. | Pull back: the whole trail, crowded, with new forks opening | `Trail` (mode `closer`) | "My view is that mathematics is more alive than it has ever been." |
| 60 | — | (no narration) | Outro: AGILabs badge, javieraguilar.ai, title, credit "Proof: Levent Alpöge with Claude · Human draft: Alessandro Masullo · Independent checks: A. Sutherland and the Lean community"; author's avatar small; YouTube end-screen space | outro | names as in the article |

**Word count (EN):** 1,372 spoken words: 9.1 min at 2.5 words/s, about 10 min with line gaps,
chapter cards and the outro. Over the outline's 6-8 min; the cold read did not flag length, only
the density of chapters 6-7. If it has to be shorter, cut in this order: row 47 (prize), the
Chebyshev row, the "evidence, not proof" row, and the "many others have tried since" sentence.

## Cold read and changes

Three `reel-viewer` runs (independent `claude -p --agent reel-viewer` sessions, only the numbered
narration with visuals) and one `reel-expert` run (script + the article) on v0.1.

- **reel-viewer, v0.1:** retold the story correctly; best line "One proof has been checked
  completely, and understood by nobody..." (then row 33); non-obvious takeaway: checking and
  understanding have split. Lost: "Lean" never explained, "zeros of one function", "the three
  standard ones", "a classical function", "a wave" arriving from nowhere, the chain ("costs
  what?"), "a quarter smaller" (the map or the proof?). Scroll point: v0.1 row 34 (Stepanov), would skip
  to "Who did what"; the people chapters were what it came for. Asked: the prize, Masullo's fate.
- **reel-expert, v0.1:** every number and quote matches. Flagged: Stepanov credited with Weil's
  theorem (row 34); Alpöge's Anthropic link never said, so "a rival lab" hangs, and the model is
  internal; "a quarter smaller" is the core, and mostly housekeeping (row 53); "undergoing major
  revision" read as the draft having fallen (row 48); "Stepanov without the chain" should be
  "without multiplicity"; stale row references in the notes.
- **reel-viewer, v0.2 (after the changes below):** scroll point moved to row 46 (~7:45, chapter
  7), retell complete including the two-proofs twist; still sees the ending coming.

| Row (v0.2) | Before (v0.1) | After (v0.2) | Why |
|---|---|---|---|
| 2 | "a mathematician called Levent Alpöge posted..." | "...Levent Alpöge, who works at Anthropic, the company that makes Claude, posted..." | Expert: "rival lab" hung; the article opens with it |
| 3 | "code that a computer can check, step by step" | "code in Lean, a language where a computer checks every step of a proof, like a spell-checker for maths" | Viewer: what is Lean? |
| 5 | six-item table of contents | three items | Viewer: stopped listening halfway |
| 10 | "the zeros of one function" | "one function, the zeta function, and the points where it equals zero" | Viewer: zeros of what? |
| 20-21 | "written down before the proof existed"; "the three standard ones" | adds "so it can't have proved something easier under the same name"; "the three basic rules every Lean proof starts from" | Viewer: why it matters; three what? |
| 27 | "Stepanov's trick, without the chain" | "the skeleton of a 1969 trick by Sergei Stepanov, missing one ingredient" | Expert: it was "without multiplicity"; also plants the question chapter 7 pays |
| 28 | — | "The model is an internal one; you can't run it." | Expert: the article says so; viewers will assume public Claude |
| 32 | "It is undergoing major revision." | "It was already being revised, and nobody vouches for it yet." | Expert: unjudged, not refuted |
| 35 (new) | — | the prize: "Not yet. The prize needs publication, a two-year wait, and mathematicians accepting it." | Viewer: the prize is raised in row 6 and never answered |
| 40 and 38 | "a much more divisible number, built from a classical function"; "So if you know a number is divisible by lots of primes..." | "whose size can be computed exactly"; "a number of known size has room for only so many prime factors" | Viewer: vague; mixed "primes dividing it" with "primes that exist" |
| 41, 43 | no waves before the curve; "a wave goes up as well as down" | "Each zero adds a wave to the count of primes..."; "a wave that grew too big would swing up as well as down, so it would break through the top" | Viewer and expert: "a wave" came from nowhere |
| 42 (visual) | ±0.0462 and 0.023 floating | labelled "what the hypothesis allows" / "highest it gets" | Viewer: numbers meant nothing |
| 46 | "Sergei Stepanov proved a twin of the hypothesis" | "Remember Stepanov's trick? In 1969 it gave a much simpler proof of a twin... already proved in the 1940s" | Expert: the twin is Weil's theorem; Stepanov re-proved it |
| 47, 48 | "Each link adds divisibility... every link costs something" | "a construction applied again and again, each time making the number more divisible... every link also adds a little error" | Viewer: a chain of what, costs what? |
| 54 | "made it about a quarter smaller" | "cut the core of the proof by about a quarter. Mostly housekeeping so far, but the work has started." | Expert: overstated; viewer: map or proof? |
| order | chapters 4-5 maths, 6-7 people | people (4-5) before maths (6-7) | Viewer: the parts it wanted were buried after the hardest maths |
| cut | de Branges row; the timing row (IPO) | removed | Length; the timing has no bearing on the verdict |

Kept, with the reason: the "math is not dead" ending, which the viewer saw coming in all three
runs, is the article's own conclusion and the short's spine; the de Branges and IPO-timing facts
stay in the article. The reorder and the rows changed after the expert run (27, 38, 46) were
checked against the article by hand, not by a second expert run.

## Assets to generate (Codex, AGILabs cast style, transparent PNGs unless noted)

Shared with the short (generate once, reuse): mountain trail at night (landscape 1920x1080
background layer, plus the vertical one), mountain of stacked pages, generic cartoon mathematician
(walk, stop, look up, draw on a sheet), violet robot running uphill, pile of papers with one
glowing sheet, second mathematician carrying a thick hand-written manuscript, small mapmaker
figures (3-4 poses), crowd figures.

New for the long cut:

| Chapter | Asset |
|---|---|
| 0, 3 | file stack tiles reuse the code-drawn `FileStack`; a paper tower (stack of printed pages, tall) and a waste bin for the "slop" quote |
| 0 | a four-page printed note on a desk, top-down, with blank text lines (text set in code) |
| 1, 5 | blackboard / slate background, landscape, dark, chalk texture, empty |
| 1, 7 | a prize medal |
| 2 | old letter with envelope (1885), a thick worn folder, a conference lecture stage with lectern ("Heidelberg 2018" set in code) |
| 2 | author's avatar seated in a lecture hall, shrugging (cameo; identity sheet as reference) |
| 3 | a small "checker" machine (friendly box with a magnifier), in the cast style |
| 4 | a box with a lid, and prime "blocks" (numbered in code) |
| 5 | a small curve with points (finite-field "twin"), chalk style |
| 5 | chain links (one link PNG, repeated in code) |
| 5 | violet robot holding a card (√ set in code) |
| 7 | sticky notes; a "major revision" stamp (text in code) |
| 7 | the manuscript and the file stack as two half-portraits for the split screen |
| outro | author's avatar, small, for the outro |
| cover | YouTube thumbnail 1280x720: the walker at the foot of a mountain of pages at night, the robot's light far up, calm area left for the headline |

## Notes for the build

- **Real data:** `PrimeCurve` replays `(G(y) − log 2π)/√y` from
  `personal-website/scripts/figures/riemann-centred-prime-sum.py` (export ~2,000 points on the
  log grid to `src/data/prime-curve.json`). Band at ±0.0462 and the maximum 0.023, exactly as the
  article's figure.
- **The trail and the boxes are metaphors**, not footage of anything measured: say so in
  `factcheck.md`, not on screen.
- **Numbers on screen, exactly as the article writes them:** 175,187; 17.4 million; over 250,000
  pages; 72 / 75; 1850; 1885; 2018; 1969; ten million; ±0.0462; 0.023; √x; 26.6%; twelve years.
  No token or agent counts: the article says they are not public.
- **Attribution:** never "Claude proved". "Claude began to leave me in awe", "out of my element"
  and the √X suggestion are Alpöge's own account. Taste (row 27) follows the article's
  linkedinSummary.
- **Left out:** Iwasawa theory, Galois representations, the Langlands programme by name, the scope
  of GRH, theta lifts by name, the conditional-theorems list, Robin's inequality, the Euler and
  Navier–Stokes announcements.
