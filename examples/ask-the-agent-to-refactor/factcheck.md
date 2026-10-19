# Fact-check: Ask the agent to refactor. Writing the rule isn't enough (draft v1.1, reviewed)

Source: `src/content/blog/en/ask-the-agent-to-refactor.md` on `origin/blog/ask-the-agent-to-refactor`
(pubDate 2026-10-19; not yet merged to `main` when checked, 2026-10-19). Scope: narration and the
numbers/text on screen. Visuals are illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "Codex merged three copies of a rule. Tests passed. The step failed." | "It searches, writes *"I found three midpoint calculations"*, moves all three into one shared function, runs the tests, and reports […] The tests pass. The step fails." | OK. "merged" = "moves all three into one shared function"; "a rule" = the midpoint calculation of the "is between" business rule. Last two sentences near-verbatim. |
| 2 | "There was a fourth copy. Its search never matched it." | "There was a fourth copy. The budget template computed the same midpoint, written differently (`Math.round(num1 + num2) / 2`), and Codex's search never matched it." | OK, near-verbatim. Not generalised: the article adds "In five of eight chains it never opened that file"; the video does not claim it always missed. |
| 3 | "Matt Pocock says to use more abstractions and harsh lint." | Tweet: "we should use MORE abstractions in the AI age. You can use them (combined with harsh lint rules)" | OK. Paraphrase of the quoted tweet; credit by name as the article does. |
| 4 | "Can the agent be the designer?" | "if the code is already repeated, can the agent be the one who designs the abstraction?" | OK. The "already repeated" condition is shown on screen (scattered copies). |
| 5 | "I gave three agents real budgeting code: 384 task chains." | "`loot-core`, the core of the open-source budgeting app Actual, about 48k lines of TypeScript"; "Claude Code with Sonnet 5.5 and with Haiku 5.5, and Codex with GPT-6 Luna"; "That makes 384 chains and 1,632 steps." | OK. 384 = 4 arms × 3 agents × 4 areas × 8 chains (fig. 1 caption: "3 agents × 4 code areas × 8 chains per arm"). |
| 6 | "Three levers: a written rule, a duplication lint, or just asking for the refactor." | "RG, the written rule […] RL, the harsh lint. `yarn lint` runs a duplication check (jscpd) […] RC, the directed refactor." | OK. "just asking" echoes "Asking for the refactor" (description); RC is a T0 step, shown on screen. |
| 7 | "The rule and the lint helped one agent of three." | Description: "A written rule and a duplication lint helped one agent out of three."; "For Codex and Haiku, the rule and the lint do nothing measurable." | OK, the article's own sentence. Caveat kept off-screen: with the Sol cross-judge the lint's gain for Sonnet shrinks (1.13 → 0.43 in the areas where it sees copies) while the rule still helps (p = 0.02). The line stays at the article's level of claim. |
| 8 | "Codex sometimes told the lint to skip its code." (+ tag "in 4 steps") | "With Codex it produced something else. In four steps it marked the code so the checker would skip it: `// jscpd:ignore-start …`" | OK. "sometimes" + "in 4 steps" tag bounds it; the other dodges (stretching a function with flags, reshaped copies) are not narrated. |
| 9 | "Only asking for the refactor lifted all three, if modestly." | "The refactor request (amber) is the only lever that raises all three agents, by 0.35 to 0.47 points (p ≈ 0.02 each, the same direction in 11 of 12 code areas)."; "Only the refactor request moves all three." | OK. "Only" = "the only lever that raises all three". "if modestly" carries the hedges: 0.35–0.47 points on a 1–5 scale; "On its own, each agent's refactor effect is around p = 0.02 and would not survive correction" (but same direction in 11 of 12 areas); Haiku "starts close to the ceiling". Also holds with the Sol cross-judge (+0.34, +0.25, +0.28). |
| 10 | "What it bought was mostly search: going to find every copy." | Description: "what it buys is search more than design"; "that sentence sends it looking for every copy. A rule change doesn't." | OK. "mostly" = "more than design". Mechanism stated for Codex in the traces; the visual shows it in the Codex lane. |
| 11 | "Then one edit reached every copy, even in a file it never opened." | "Once the copies sit behind one function, the next rule change reaches all of them with one edit, including the budget template, without the agent ever opening that file." | OK. Describes the mechanism, not every chain: the article reports two remaining misses (one refactor never found the template copy). |
| 12 | "Codex's missed copies fell from 33% to 12%." | "With the repeated code and no lever, Codex misses a copy at a rule step in 33% of cases […] After its own refactor, it misses 12%" | OK. Same rounding. Denominator ("at a rule step", 64 rule steps per arm) not narrated. Correct-step rate (59% → 70%) not used. |
| 13 | "Don't just write the rule. Ask for the refactor, and name what must survive." | Title: "Ask the agent to refactor. Writing the rule isn't enough"; "ask the agent for it as a task, not as a rule. Name the area, say it should live in one place, and say which differences must survive." | OK. "name what must survive" = "say which differences must survive". |
| 14 | "More at javieraguilar.ai." | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Chip "3" (copies found), "tests ✓" | 1 | "I found three midpoint calculations"; "The tests pass." | |
| `Math.round((num1 + num2) / 2)` vs `Math.round(num1 + num2) / 2` | 2 | Article quotes the template form; the other form is the real code in the experiment's diff (`study3/codex/RC/Z2/0/T0.patch`, minus-lines in `forecast-schedules.ts` and `schedules/app.ts`) | Variable names simplified from `amountValue.num1` etc. to `num1`/`num2`, as the article does. |
| Quote "use MORE abstractions … (combined with harsh lint rules)", "Matt Pocock" | 3 | Tweet as quoted in the article | Text attribution only, no platform UI. |
| Lane chips "Sonnet 5.5", "GPT-6 Luna", "Haiku 5.5"; "384 chains"; pips T1-T4 (+ T0) | 5-6 | "Sonnet 5.5 […] Haiku 5.5, and Codex with GPT-6 Luna"; "384 chains"; "Each chain has four steps"; "a step T0" | |
| Sticky note "Do not copy logic…" on `AGENTS.md` | 6 | RG rule quoted in the article | Cropped. |
| Speech chip "make it live in one place" | 6, 13 | "asks for it to live in one place" | Paraphrase of the T0 request. |
| "1 / 3" lane chip; one lane partly folds, two don't | 7 | "helped one agent out of three" | Illustrative fold amounts. |
| Tape `// jscpd:ignore-start`, tag "in 4 steps" | 8 | Verbatim code token; "In four steps" | |
| "+0.35 to +0.47 of 5" (small corner chip) | 9 | "by 0.35 to 0.47 points" | Judged maintainability, 1–5 scale. Kept small: evidence for "modestly". |
| Faint diff lines `- Math.round(…)` / `+ getScheduledAmount(…)` | 10 | Codex's real T0 diff (Z2, chain 0) | Real code from an open-source repo; decorative, unreadable at speed. That chain is illustrative of "a refactor", not claimed to be the hook's chain. |
| "33%" → "12%" | 12 | "33% of cases […] it misses 12%" | Shown as a pulse strobe with chips, not a chart. Recomputed from data (see below). |
| Closed `schedule-template.ts` card with "never opened" lock | 11 | "without the agent ever opening that file" | |
| A notch kept inside the folded card ("keep: …") | 13 | "say which differences must survive" | Illustrative. |

## Anonymisation

- No work material: the article's code is from Actual (open source, MIT), named in the article,
  and the experiment folder is public. File names (`schedule-template.ts` etc.) are Actual's.
- Provider names in the lint scene (SimpleFin, Fintegra, judge quote) are **not** used.
- No employer, client, ticket or personal name on screen; Pocock is credited as the article does.

## Not verified / open

- **Hook chain vs. arm.** The article does not say which arm the hook's chain belongs to (the
  "five of eight chains" suggests a no-lever or rule/lint arm). The video does not label it.
- **33% → 12% recomputed (review, 2026-10-19).** From `data/study3-steps.jsonl` on the blog branch,
  codex, `kind == "rule"`, 64 rule steps per arm, field `missed_copy_preexisting`: R 21/64 = 33%,
  RG 20/64 = 31%, RL 20/64 = 31%, RC 8/64 = 12%. Matches the article. Careful: the plain
  `missed_copy` field gives 42% → 22%, which is NOT the article's measure. Correct steps (T1-T4,
  128 per arm) also match: R 59%, RG 55%, RL 59%, RC 70%.
- **Real code snippets** come from a T0 diff (chain 0, Z2), not from the hook's chain; they are
  the same repeated code (every arm starts from variant R), so the lines are the ones the hook's
  Codex saw, but the visual is not a replay of that run.

## Build additions (labels added while building, 2026-10-19)

| On screen | Scene | Source / note |
|---|---|---|
| "the three it found" / "the template's copy" over the two code lines | 2 | "I found three midpoint calculations"; the template copy as the article writes it. |
| "1 / 3" + "agents helped"; "✓ helped" under Sonnet, "no change" under Luna and Haiku | 7 | "helped one agent out of three"; "For Codex and Haiku, the rule and the lint do nothing measurable." |
| "lint ✓" after the tape | 8 | Illustrative: the ignore marker gets the code past the checker ("so the checker would skip it"). |
| "maintainability score, per agent" under "+0.35 to +0.47 of 5" | 9 | Figure axis: "maintainability (1–5, Opus judge)"; "raises all three agents, by 0.35 to 0.47 points". |
| "4th copy found" | 10 | Illustrative of "sends it looking for every copy". |
| "never opened, still updated" | 11 | "reaches all of them with one edit, including the budget template, without the agent ever opening that file." |
| Tick rows: 3 of 9 red before, 1 of 8 red after; "33% → 12%", "Codex · rule steps that missed a copy" | 12 | Proportions illustrative (1/8 = 12.5%), figures exact: "misses a copy at a rule step in 33% of cases […] it misses 12%". |
| "keep: what must differ", "exception kept" | 13 | "say which differences must survive". Illustrative. |
| Outro credit "After an idea by Matt Pocock · code: Actual (open source, MIT)" | 14 | Approved in the script. |
