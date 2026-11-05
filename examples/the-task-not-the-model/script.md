# Benchmaxing, parts 1–3: one video — script v2 (2026-11-05)

v3 (Javier, 2026-11-05): Opus touching more files hurts maintainability and docs over time (and annoys even in one task): added as the fourth line of `opus`, and to the article.

v2 (Javier's review): explain what a benchmark is (new scene `bench`), say what benchmaxing is (third line of `name`), and introduce the Opus 5 vs Fable perception in `story` so the later `opus` scene is set up.

Articles (EN, javieraguilar.ai):
- Part 1 `benchmaxing` (published 2026-09-16).
- Part 2 `no-benchmaxing-found` (publishes 2026-12-02).
- Part 3 `the-task-not-the-model` (publishes 2026-12-08; this video goes out with it).

Decision (Javier, 2026-10-30): no video for part 2 alone; one video for the series after part 3. Part 1
already has its own video (`examples/benchmaxing`), so this one recalls it in one beat and spends its time
on parts 2 and 3. EN only, vertical, ~100 s. Same exam-paper / workbench world as the part-1 video.

| Scene | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|
| hook | intro (curious) | Do the AI models that win benchmarks do better work? / I tested it three times. | | Hook card | P1: "better benchmark results do not necessarily feel like a more intelligent model, or one that does better work." P3: part 3 of the series |
| bench | bespoke SeriesRecap `bench` | Benchmarks are exams for AI models: / the same set of problems for everyone, a score, and a ranking. | | Three exam cards (maths, code, reasoning) get a score; a ranking board: 1 Opus 5, 2 Fable 5, 3 Gemini | P1 frames benchmarks as exams: title "Winning the Exam Is Not Doing Better Work"; "## What it means to optimize for the exam" |
| story | bespoke SeriesRecap `podium` | On some of those rankings, Opus 5 beat Fable. / But working with it, it didn't feel better to me. | | A robot climbs a podium with a "#1" score bar; beside it a desk where the same robot gets a "redo" sticky note | P1: "With Opus 5, I have experienced something that people I speak to directly have also described: better benchmark results do not necessarily feel like a more intelligent model, or one that does better work." |
| name | bespoke SeriesRecap `podium` (skeptical) | Was it trained for the exam? / That suspicion has a name: benchmaxing. / tuning a model to win the exam, not to do better work. | | A crib sheet slides under the robot's arm; the word BENCHMAXING stamps across | P1: "I use *benchmaxing* to mean directing model optimization, or the selection of reported results, towards maximizing evaluation scores." |
| twins | bespoke SeriesRecap `twins` | So I gave every exam question a twin: / same method, new numbers. / None of the seven models stumbled on the twins. | | An exam card, its twin slides out with different numbers ("same method"); seven robots answer both; a stamp "no drop" | P2: "Each public item gets a variant that uses the same method but has different numbers and a different answer."; "No model met the criterion." |
| agents | bespoke SeriesRecap `agents` | Then each model ran a team of its own agents. / Six of seven got everything right. | | A conductor robot hands folders to small helper robots; six robots get "45/45" ✓, the seventh holds a stopwatch | P2: "a conductor managing its own subagents"; "Six of seven perfect, on every field and every trap" |
| catch | bespoke SeriesRecap `desks` (skeptical) | But my tests were exams too: / a written task, and an answer key. / Real work has neither. | | Left: tidy desk with task card and answer key, ticked; right: messy desk with sticky notes, no key | P2: "These two tests are benchmarks too."; "a fully specified task, the rules written in a file, a JSON at the end and a key to grade it against"; "Real work does not come with a key." |
| setup | bespoke TaskBench `setup`, cameo laptop | So I dropped the key. / I took nineteen things I had really asked an agent to do, / and counted how many of my corrections each model needed. | | A request card ("can you look at them?", "go all in on i18n…") drops onto the messy desk; seven robots line up; behind the card, a stack of my correction sticky notes | P3: "So this time I did not write a key. I went back to the sessions on my own laptop, took nineteen things I had actually asked an agent to do, and used my own corrections as the measure." |
| judges | bespoke TaskBench `judges` | Three blind judges, from two labs, did the counting. | | Three judge figures with blindfolds and magnifiers (two teal, one amber chip: "Claude ×2", "OpenAI") read lettered results A–G | P3: "Three blind judges from two labs." |
| finding | bespoke TaskBench `piles` (amazed on line 2) | Six models needed about three corrections per task. / DeepSeek needed four. | | Under each robot a pile of sticky notes grows: six piles level (2.7–3.4), DeepSeek's taller in amber (4.0) | P3: "With the Claude judges the six need between 2.7 and 3.4 deducible corrections per task and DeepSeek 4.0" |
| nobody | bespoke TaskBench `piles` | And none of them got it right on its own. | | Over the piles, a stamp: "accepted as is: 8 of 266" | P3: "Nobody got it right by itself, either. Of 266 verdicts ..., the Claude judges would have accepted a result as it was only 8 times" |
| task | bespoke TaskHeatmap | What mattered far more was the task: / the same ones were easy, or hard, for everyone. | | The 19 × 7 grid fills row by row; rows change colour, columns look alike; a bracket "task ≫ model" | P3: "which task it was explains at least ten times more of the variation than which model did it"; "The same tasks were easy or hard for everyone." |
| question | bespoke QuestionChat | And when I asked a question, / every model answered it, and stopped. | | Chat: my bubble "we have a few chat bugs documented, can you look at them?"; the robot replies with a neat bug list and "Want me to fix them?" | P3: "Seven of the nineteen requests were phrased as questions"; "Every model did it."; "DeepSeek ... asked whether I wanted it to fix them." |
| question2 | bespoke QuestionChat (amazed), cameo amazed | Forty times out of forty-nine. | | Counter "40/49" on questions vs "15/84" on instructions | P3: "On those seven, 40 of 49 sessions answered and stopped, and needed the nudge to start; on the other twelve, 15 of 84." |
| opus | bespoke TaskBench `pair`, cameo laughing | And my old hunch about Opus? / Same corrections as Fable. / It just touches more things nobody asked for. / Over months, that is what makes code harder to maintain. | | Two robots (Opus, Fable) with equal piles (2.9 / 3.0); papers fly out around Opus | P3: "Here they need the same steering: 2.9 against 3.0 corrections per task"; "Opus ... touches more things nobody asked for than Fable does" |
| verdict | KeyQuote (confident 1.05) | On my work, the model mattered less than the task, / and how I asked for it. | | Quote card, "the task" and "how I asked" in the accent | P3: "What separates a good session from a bad one is mostly which task I brought, how clearly I asked for it and how much of what I wanted lived only in my head." |
| close | KeyQuote (confident) | If I want the change, I should ask for the change. | | Big line | P3: "A question gets an answer: if I want the change, I should ask for the change." |
| outro | outro | More at javieraguilar.ai. | | Outro with avatar | — |

## Must show
- The podium robot that doesn't feel better at the desk (part 1 in one picture).
- The twin cards (part 2) and the conductor with its helpers, six "45/45".
- The tidy exam desk with an answer key against the messy desk without one.
- My correction sticky notes as the measure, and the seven piles: six level, DeepSeek taller.
- The heatmap with rows changing and columns alike.
- "can you look at them?" → "Want me to fix them?", and 40/49.

## Notes for the build
- Hedges: "about three" for 2.7–3.4 (Claude judges); "four" for 4.0. "None of the seven models stumbled"
  stands for "No model met the criterion". "far more" for the variance split, without the percentages.
- Model names on screen: the seven robots carry their public names (Gemini, Opus, Fable, GLM, Kimi, Qwen,
  DeepSeek), as in the article. Spoken: DeepSeek, Opus, Fable only.
- Cameos: laptop at `setup` ("I took nineteen things"), amazed at `question2`, laughing at `opus`.
- Drawings (avatar style, transparent PNG, public/draw/): podium, crib sheet, desk-tidy (have); answer key,
  desk-messy, blind judge (blindfold + magnifier, no robot face needed), sticky-note pile, folder, stopwatch
  (from cast). Robots from the shared cast (public/cast/).

EN words: ~235 → ~100 s at 2.5 w/s with pauses.

Cold-viewer check (first ~15 s): "Do benchmark winners do better work? A model tops the leaderboard but working
with it doesn't feel better; maybe it was trained for the exam." The situation is clear before any method.
