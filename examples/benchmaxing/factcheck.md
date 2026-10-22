# Fact-check: Benchmaxing (EN vertical) · v1.0

Source: `src/content/blog/en/benchmaxing.md` on `origin/main` of personal-website (pubDate
2026-09-16). The article's `repoUrl` (`JaviMaligno/benchmaxing-probes`) is not cloned under
`~/Documents/repos`, so no repo cross-check was possible: every claim is traced to the article
text only. External studies (GSM1k, The Leaderboard Illusion, METR, ClawArena-Team, Anthropic's
Opus 5 note) are reported as the article reports them; their links were not re-read.
Scope: every spoken line, and every number or text shown on screen. Visuals are illustrative.

## Narration

| # | Claim (spoken) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "A higher benchmark score doesn't always feel like a better model." | "better benchmark results do not necessarily feel like a more intelligent model, or one that does better work." | OK. "doesn't always" = "do not necessarily". Weaker than the title, as the body is. |
| 2 | "With Opus 5 I felt that. So did people I talk to." | "With Opus 5, I have experienced something that people I speak to directly have also described" | OK. |
| 3 | "Some tables even put it above Fable. My experience said otherwise." | "Some tables even put it above Fable, which clashes with my experience." | OK. |
| 4 | "Was it optimised for the exam? I wanted to test, not assume." | "It also deserves a test that can contradict it. If an article starts by treating it as established that Anthropic optimized the exam at the expense of real work, I have chosen the answer before examining the evidence." | OK. |
| 5 | "That suspicion has a name. Benchmaxing." | "review what is documented about **benchmaxing**"; definition section | OK. "suspicion" = the article's "What remains of the suspicion". |
| 6 | "Optimising a model, or which results you report, to maximise scores." | "I use *benchmaxing* to mean directing model optimization, or the selection of reported results, towards maximizing evaluation scores." | OK, the article's definition shortened. |
| 7 | "Exam prep can teach the subject, or just the format." | "Preparing for an exam can teach the subject. It can also teach recognition of questions, mastery of a format, or how to please the grader." | OK. On-screen footnote: "a higher score alone demonstrates neither fraud nor a lack of intelligence". |
| 8 | "At least three different things hide behind it." | "At least three different phenomena need separating." | OK. |
| 9 | "One. Give models fresh problems, like the test's." | "GSM1k introduced new problems comparable to GSM8k" | OK. Method described as the article does (no "maths": the article does not say it). |
| 10 | "Several model families dropped. Many frontier models held up." | "found accuracy drops and signs of overfitting in several model families. But it also found little evidence of overfitting in many frontier models, and generalization in all the models evaluated." | OK. "held up" = "little evidence of overfitting". |
| 11 | "Two. Llama 4's headline arena score came from an experimental chat version." | "Meta highlighted an LMArena Elo of 1417 and specified that it belonged to an experimental chat version." | OK. The card says Meta stated it, so nothing implies concealment. |
| 12 | "And one study found 27 private Meta variants tested before it." | "The Leaderboard Illusion documented private testing and selective disclosure, identifying 27 private Meta variants before Llama 4." | OK. "tested" = "documented private testing". |
| 13 | "Three. Skip the test and measure the work." | "**The gap between the metric and the work.**"; "It shows why productivity needs direct measurement." | OK. |
| 14 | "Developers using early-2025 AI tools took 19% longer," | "In a randomized METR study, 16 experienced developers completed 246 tasks: allowing early-2025 AI tools increased completion time by 19%" | OK. "took 19% longer" = completion time +19%. |
| 15 | "while believing they had saved time." | "although participants believed they had saved time." | OK. |
| 16 | "That was early tools, not today's models." | "Repeating the 19% as a description of current models would misread that evidence."; "This does not demonstrate benchmaxing or describe all AI-assisted programming." | OK. The follow-up's unreliability (Feb 2026 update) is on screen, attributed to the follow-up study, as the article does. |
| 17 | "A score describes the conditions it was run under." | "A score describes those conditions; it does not automatically describe an everyday conversation." | OK. |
| 18 | "One Opus 5 score is an internal run, averaged over five attempts." | "Its Frontier-Bench note specifies an internal run, a particular environment, mean reward over five attempts per task, and Opus 4.8 as a fallback for safety blocks." | OK. "One score" = Frontier-Bench (named on screen). "averaged" = "mean reward". |
| 19 | "I feel the gap when managing other agents, and its announced benchmarks don't measure that." | "Where I notice the difference most is not in a bounded answer. It is in multitasking and in managing flows of agents"; "None of the benchmarks in the announcement measures a model managing other agents" | OK. Silent tag: ClawArena-Team "Fable 5 leads its twelve models with a subagent-management score of 60.0%"; "Opus 5 is absent: the paper was submitted on 30 June 2026 and Opus 5 shipped on 24 July." |
| 20 | "So I ran a small pilot. Five cases per model." | "The set contains **five cases per model**"; "There was one valid run per model and case."; "the entire exercise is exploratory." | OK. One run each and "exploratory" on screen. |
| 21 | "Two cases had one rule. Never send the same thing twice." | "For the next two cases I made the priority explicit: **never produce the external effect twice, even if an uncertain operation remains blocked**." | OK. "send" = produce the external effect (the race figure: "A resumes and sends"). |
| 22 | "Both relied on a time check before retrying." | "But both retained authorized retries while the old worker could still be alive, relying on a local deadline check and a time margin." | OK. |
| 23 | "But a worker can check, then pause." | "A checks that it may still send, then pauses immediately afterwards." | OK. |
| 24 | "Another sends, the provider forgets, and the first sends again." | "B takes over, sends, and finishes. The provider's record of the key expires. A resumes and sends what it had already decided to send. The provider produces the effect again." | OK. "the provider forgets" = record of the key expires (labelled on screen). Quote "negligible, not impossible" verbatim (Fable); "Opus left the same gap". |
| 25 | "On permissions and data analysis, they tied." | "On permissions, both resolved the eight core decisions"; "On data analysis, both performed the requested calculations and rejected the misleading comparison"; "Those cases did not separate the models on the core criteria." | OK. "tied" on the core criteria; grid footnote "Covered does not mean perfection or general performance." |
| 26 | "Five cases are a probe, not an answer." (revision 2026-10-22, replaces the verdict line; line 27 deleted) | "run a small set of probes with Opus 5 and Fable 5"; "The set contains **five cases per model**"; "so the entire exercise is exploratory." | OK. "probe" is the article's own word; "not an answer" is no stronger than "exploratory" and "These tests do not turn it into a demonstration…". |
| 28 | "The research gives good reasons to take it seriously." | "The literature gives good reasons to take benchmaxing seriously." | OK. |
| 29 | "But the further a test sits from my work, the more it needs checking." | "The further its evaluation sits from my work, the more that transfer needs checking." | OK. |
| 30a | "Was Opus 5 benchmaxed? That's the question worth keeping open." (new close, 2026-10-22) | "That perception deserves investigation. It also deserves a test that can contradict it."; "**These tests do not turn it into a demonstration that Opus 5 has been benchmaxed**"; "My initial perception remains a valid experience."; "The pilot requires greater precision when applying it to a particular model." | OK. Leaves the question open, as the article does: neither confirmed nor ruled out. |
| 30 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Scene | Source |
|---|---|---|
| Table card `Opus 5` above `Fable 5` | 3 | "Some tables even put it above Fable" |
| "GSM1k", "new problems comparable to GSM8k" | 9 | Verbatim |
| "drops, signs of overfitting" / "little evidence in many frontier models" | 10 | Verbatim (shortened); family bars illustrative, no values |
| "LMArena · Llama 4 · Elo 1417", "experimental chat version (Meta stated it)" | 11 | "Meta highlighted an LMArena Elo of 1417 and specified that it belonged to an experimental chat version." |
| "27 private variants", "only the selected result is visible", chip "The Leaderboard Illusion" | 12 | Verbatim |
| "randomised trial · 16 developers · 246 tasks" | 13 | "randomized METR study, 16 experienced developers completed 246 tasks" |
| "+19%", "with early-2025 AI tools" | 14 | Verbatim |
| "saved time ✓" thought bubble | 15 | "participants believed they had saved time" |
| "the 2026 follow-up's signal was judged unreliable · not a proof of benchmaxing" | 16 | "The February 2026 update also identified selection biases in the follow-up study and considered its signal unreliable."; "This does not demonstrate benchmaxing" |
| "Frontier-Bench · internal run · particular environment · mean reward over 5 attempts per task · Opus 4.8 fallback for safety blocks" | 18 | Verbatim |
| "not in the announced benchmarks"; silent tag "Fable 5 leads, 60.0% · Opus 5 shipped after it" | 19 | "None of the benchmarks in the announcement measures a model managing other agents"; ClawArena-Team sentences |
| Grid labels "Incomplete" ×2, "Guarantee fails" ×2, "Covered" ×4; "one run per model and case · synthetic · exploratory" | 20, 25 | The article's first figure and its caption; "The cases were synthetic"; "exploratory" |
| Race stops "A checks then pauses · B sends and finishes · Key record expires · A resumes and sends", "Effect 1", "Effect 2" | 23-24 | The article's second figure, verbatim |
| "negligible, not impossible" | 24 | Verbatim (Fable's answer) |
| Card "a probe" · "five cases · one run each · exploratory" (no stamps) | 26 | "a small set of probes"; "five cases per model"; "There was one valid run per model and case."; "exploratory" |
| "check the transfer" | 29 | "the more that transfer needs checking" |
| "?" over the bridge; cards "a table" (`Opus 5` above `Fable 5`) and "my experience" (flipped) | 30a | "Some tables even put it above Fable, which clashes with my experience." |

## Article issues and doubts found

1. **Title vs body.** The title "Winning the Exam Is Not Doing Better Work" is categorical; the
   body says "do not necessarily". The video follows the body (hook: "doesn't always").
2. **No repo cross-check.** `benchmaxing-probes` is not local; pilot details (five cases, one
   run each, the grid labels) rest on the article alone.
3. **External figures not re-verified.** 1417, 27, 16 / 246 / 19%, 60.0% and the dates (30 June /
   24 July 2026) are as the article reports them; the linked papers and posts were not re-read.
   ClawArena-Team (arXiv 2606.31174) is only a silent tag, so the voice does not depend on it.
4. **"Five cases per model" vs the grid's four rows.** The article's figure merges D2/D2b into
   one row, so the grid has four rows for five cases. The video says "five cases" and draws the
   article's four-row figure; worth a small "D2/D2b" tag on that row to avoid a visible mismatch.
5. **Method caveat.** Cases and the qualitative review were prepared with an assistant, "neither
   independent nor blind". The video only shows "exploratory"; the voice makes no comparative
   claim stronger than "they tied" and "both left the gap", which the article states directly.
6. **Opus 5's Frontier-Bench fallback.** "Opus 4.8 as a fallback for safety blocks" is reported
   as Anthropic's note says; on screen only, not voiced.
