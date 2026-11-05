# Fact-check — benchmaxing series video (EN), 2026-11-05

Sources: P1 = `benchmaxing`, P2 = `no-benchmaxing-found`, P3 = `the-task-not-the-model` (personal-website, EN).

| Claim | Where | Article sentence |
|---|---|---|
| Benchmark winners may not do better work | hook, story | P1: "better benchmark results do not necessarily feel like a more intelligent model, or one that does better work." |
| "I tested it three times" | hook | P1 probes, P2 (variants + agentic), P3 (real tasks): three articles, three tests |
| Benchmarks are exams for AI models: same problems for everyone, a score, a ranking | bench | P1 title "Winning the Exam Is Not Doing Better Work"; P1: "What it means to optimize for the exam"; P2: "The variants test asks whether a score on one exam transfers to an equivalent exam." (general framing; no figure) |
| Opus 5 beat Fable on some rankings; working with it didn't feel better to me | story | P1: "With Opus 5, I have experienced ... better benchmark results do not necessarily feel like a more intelligent model, or one that does better work. Some tables even put it above Fable, which clashes with my experience." |
| Benchmaxing = trained for the exam; tuning a model to win the exam, not to do better work | name | P1: "I use *benchmaxing* to mean directing model optimization, or the selection of reported results, towards maximizing evaluation scores." |
| Twin questions, same method, new numbers | twins | P2: "Each public item gets a variant that uses the same method but has different numbers and a different answer." |
| None of the seven stumbled on the twins | twins | P2: "No model met the criterion." / "no model that drops on unseen variants" |
| Each model ran its own agents; six of seven got everything right | agents | P2: "a conductor managing its own subagents"; "Six of seven perfect, on every field and every trap" |
| 45/45, the seventh out of time (on screen) | agents | P2 table: 45/45 for six; Qwen "timeout" |
| My tests were exams too; task + answer key; real work has neither | catch | P2: "These two tests are benchmarks too."; "a fully specified task, the rules written in a file, a JSON at the end and a key to grade it against"; "Real work does not come with a key." |
| Dropped the key; nineteen real requests; my corrections as the measure | setup | P3: "So this time I did not write a key ... took nineteen things I had actually asked an agent to do, and used my own corrections as the measure." |
| Three blind judges from two labs | judges | P3: "Three blind judges from two labs." |
| Six models about three corrections per task; DeepSeek four (2.7–3.4; 4.0 on screen) | finding | P3: "With the Claude judges the six need between 2.7 and 3.4 deducible corrections per task and DeepSeek 4.0" |
| None got it right on its own; "accepted as is: 8 of 266" | nobody | P3: "Nobody got it right by itself, either. Of 266 verdicts ..., the Claude judges would have accepted a result as it was only 8 times" |
| The task mattered far more; same tasks easy/hard for everyone; heatmap values | task | P3: "which task it was explains at least ten times more of the variation than which model did it"; "The same tasks were easy or hard for everyone."; figure 2 values |
| Asked a question → answered and stopped; every model did it | question | P3: "On those seven, 40 of 49 sessions answered and stopped"; "Every model did it." |
| Chat example (bug list, "Want me to fix them?") | question | P3: "DeepSeek on the chat bugs had written a good diagnosis with file and line for each bug, and then, even after "go ahead", asked whether I wanted it to fix them." (bug titles illustrative) |
| 40 of 49; 15/84 (on screen) | question2 | P3: "40 of 49 sessions answered and stopped ...; on the other twelve, 15 of 84." |
| Opus: same corrections as Fable (2.9 / 3.0); touches more things nobody asked for | opus | P3: "Here they need the same steering: 2.9 against 3.0 corrections per task by the Claude judges"; "also touches more things nobody asked for than Fable does" |
| Over months, extra changes make code harder to maintain | opus | P3 (added 2026-11-05 from Javier): "Over months on the same codebase, a model that keeps touching files outside the request makes the code harder to maintain and can quietly alter the documentation." |
| Model mattered less than the task and how I asked | verdict | P3: "What separates a good session from a bad one is mostly which task I brought, how clearly I asked for it and how much of what I wanted lived only in my head." |
| Ask for the change | close | P3: "A question gets an answer: if I want the change, I should ask for the change." |
