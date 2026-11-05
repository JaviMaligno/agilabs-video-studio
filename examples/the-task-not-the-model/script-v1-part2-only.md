# No Benchmaxing Found, and the Vibes Still Count — script (v1, 2026-10-30)

Article: https://www.javieraguilar.ai/en/blog/no-benchmaxing-found/ (branch `blog/no-benchmaxing-found`
of personal-website, `src/content/blog/en/no-benchmaxing-found.md`; publishes 2026-12-02). EN only,
~85 s. Part 2 of `benchmaxing`: reuse that video's exam-paper / workbench look (`ExamBridge` in
`examples/benchmaxing`) so the two read as a series.

| Scene | Component | EN line | Visual | Source sentence |
|---|---|---|---|---|
| hook | intro (curious) | Is a model only good because it has seen the exam? / I tested it twice. Both tests found nothing. | Exam paper with a "#1" score bar; a magnifying glass sweeps it twice and finds nothing (two empty result tags) | "I ran both. Neither found anything." |
| story | bespoke ExamBridge-style (story) | A model tops the leaderboard. / Did it learn the subject, or memorise the questions? / Last time, I couldn't tell. | A robot climbs a podium "#1"; two thought bubbles: a book ("the subject") and a crib sheet ("the questions"); a "?" between them | "whether any of these models is benchmaxed needs a test that compares each model's score on public benchmark items with its score on fresh, equivalent variants" |
| twins | bespoke PairCards, cameo role (laptop) | So I gave every exam question a twin: / same method, new numbers, a new answer. | A public problem card; a twin card slides out beside it with different numbers, both stamped "same method"; answers differ | "Each public item gets a variant that uses the same method but has different numbers and a different answer." |
| logic | bespoke PairCards | A model that memorised the originals / should stumble on the twins. | A robot answers the original card ✓ instantly, then wobbles over the twin | "A model that has memorized the public items should lose more than the cohort when they are swapped out." |
| run | bespoke PairCards → grid (contemplative) | Seven models, two banks of competition maths. | Seven robots in a row (cast colours), a stack of card pairs in front of each | "seven models"; "The first bank had 120 pairs from AIME 2025 and level-5 MATH-500"; "a harder bank: 91 pairs from HMMT ... and CMIMC 2025" |
| finding1 | bespoke IntervalPlot (amazed) | None of them dropped more than the rest. | The article's figure redrawn: 7 dots with intervals per bank around a dashed zero line; a "worse on twins →" side stays empty; stamp "no signal" | "No model met the criterion."; "no difference survives the correction" |
| ceiling | bespoke IntervalPlot | Gemini solved almost everything, / so there was little room to see a drop. | Gemini's robot with "97.8% → 98.9%"; its bar pressed against a ceiling line | "Gemini ... is again the most accurate: 97.8% on the originals and 98.9% on the variants."; "for a model as close to the ceiling as Gemini, even the hard bank leaves little room to see anything" |
| bridge | bespoke (switch to workbench) | But my doubt was never about maths. / It was about managing a team of agents. | The exam paper slides away; the workbench slides in with one robot conducting small agent chips | "my suspicion about Opus 5 never lived in bounded answers, but in managing work through agents" |
| conductor | bespoke Conductor | So each model led its own subagents / through fifteen vendor folders, full of traps. | A conductor robot hands folders to five subagent robots; some folders carry small trap icons (a € sign, a crossed-out amendment, a "draft" sticky, a duplicate tag); the rulebook sits outside the folders | "a vendor renewal review with fifteen vendor folders"; "The traps are built so that delegation can fail." |
| finding2 | Counter / bespoke Conductor (amazed) | Six of seven got everything right. / The seventh ran out of time. | Six robots each get "45/45" ✓; the seventh holds a stopwatch past "60 min" | "Six of seven perfect, on every field and every trap"; "in the fifth a nested subagent was still adding up some 300 invoice lines by hand when the hour ran out" |
| process | StatGrid | What differed was how they worked: / five helpers or fifteen, eight and a half minutes or forty. | Four tiles: "5 or 15 subagents at once", "8.5 to 40 min" | "GLM and Kimi launched fifteen subagents at once, one per folder; the rest grouped the folders in fives."; "Wall time went from eight and a half minutes to forty." |
| catch | KeyQuote, cameo skeptical (skeptical) | And here is the catch: / my tests are exams too. | Big line: "My tests are exams too." | "These two tests are benchmarks too." |
| key | bespoke (exam vs real desk) | A written task, the rules in a file, an answer key. / Real work has none of that. | Left: tidy desk with task card, rulebook, answer key (all ticked); right: messy desk with sticky notes "maybe…", "what changed?", no key | "a fully specified task, the rules written in a file, a JSON at the end and a key to grade it against"; "Real work does not come with a key." |
| verdict | KeyQuote (confident 1.05) | Finding no benchmaxing says nothing / about working with a model for hours. / That's why the vibes still count. | Quote card, then stamp "vibes still count" | "finding no benchmaxing says nothing about it"; "That is the sense in which I still think vibes beat benchmarks." |
| next | bespoke (messy desk), cameo role | Maybe next: the same models on real, messy tasks. | The messy desk with the seven robots lined up in front of it | "That is where I would like to take this next, perhaps as a third part: the same seven models on tasks closer to real work, open-ended, underspecified and long" |
| outro | outro | More at javieraguilar.ai. | Outro with avatar | — |

## Must show
- The twin idea (same method, new numbers, new answer) as two cards side by side.
- The interval figure with nothing on the "worse on twins" side.
- The conductor with its subagents and the traps outside the folders.
- "45/45" for six models, and the seventh out of time.
- "My tests are exams too" as its own big moment.
- The tidy exam desk with an answer key against the messy real desk without one.

## Notes for the build
- Hedges kept from the article: "None of them dropped more than the rest" stands for "no difference
  survives the correction"; the ceiling line says Gemini left little room to see a drop; "Maybe next"
  keeps the article's "perhaps as a third part".
- No model names spoken except Gemini (the article names it for the ceiling). On screen, the seven
  robots may carry the public model names from the article.
- Cameos: role (laptop) at `twins`, skeptical at `catch`, role at `next`.
- Drawings (avatar style, transparent PNG, public/cast/): exam paper with score bar, crib sheet, book,
  magnifying glass, problem card pair, podium, workbench, vendor folders, trap icons (€ sign, struck
  amendment, "draft" sticky, duplicate tag), rulebook, answer key, stopwatch, tidy desk, messy desk
  with sticky notes. From the shared cast: robot-my-agent and the coloured robots.

EN words: ~205 → ~85 s at 2.5 w/s with pauses.

Cold-viewer check (first ~15 s): "a model is at the top of the leaderboard; did it actually learn or
did it memorise the exam? He tested it twice and found nothing." The situation is clear before any
method appears.
