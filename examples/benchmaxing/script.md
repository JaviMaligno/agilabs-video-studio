# Benchmaxing: Winning the Exam Is Not Doing Better Work — article video (EN) · script v1.1

**v1.1 (2026-10-22, Javier's review):** the ending is open, centred on the concept and the doubt.
Line 26 replaced (no verdict stamps), line 27 deleted, closing question 30a added. Rendered 139 s.

Article: benchmaxing (javieraguilar.ai, EN, `pubDate` 2026-09-16; read from
`origin/main:src/content/blog/en/benchmaxing.md` of personal-website). Vertical 9:16, target
~110 s (see length note), 288 counted words. ES column left empty (EN-only for now). Voice: the
template default, Javier's cloned voice.

**Angle (requested by Javier): the concept, not the pilot.** What benchmaxing is, how it can be
studied (the three phenomena the article separates, each with its study), which cases have been
documented (with the article's hedges), and why experience with a model can diverge from its
scores. The Opus 5 vs Fable 5 pilot is one honest beat near the end: a shared failure, ties, and
an intuition the probes did not confirm.

Data on screen: the article's own text and figures. The article's `repoUrl`
(`JaviMaligno/benchmaxing-probes`) is not cloned under `~/Documents/repos`, so nothing was
cross-checked against it; every figure comes from the article. No work material: the pilot cases
are synthetic (double charge, paused workers, permissions, data analysis); model and vendor names
are public. AGILabs is the only brand on cards.

## Central visual: the exam and the job, and the bridge between them

One picture carries the concept. Left, an **exam paper** with a big **score bar** that can climb
to a gold "#1" notch. Right, a **workbench**: a stack of real task cards (a bug, a plan, a team
of small agent chips). Between them, a **dashed bridge** labelled **does it transfer?** The
thickness of the bridge is the whole idea: training for the exam can thicken it (learning the
subject) or leave it a thread (learning the format), and the score bar climbs either way.

Each part of the video does something to that bridge:

- **Concept** (scenes 5-7): the score bar climbs twice, once with the bridge thickening ("the
  subject"), once with the bridge staying a thread ("the format"). Same score.
- **How it is studied** (scenes 8-16): three **probes** clip onto the picture, one per
  phenomenon, under a fixed top band "1 · 2 · 3": a fresh exam paper swapped in (familiarity), a
  stack of face-down cards behind the leaderboard (selective reporting), a stopwatch on the
  workbench (metric vs work).
- **Experience vs score** (scenes 17-19): the score card turns over to show its **fine print**,
  and the workbench zooms to the part no exam covers: one agent conducting several sub-agents.
- **Verdict** (scenes 26-29): the workbench slides further away and the bridge stretches; a stamp
  "check the transfer" lands on it.

Bespoke components: **`ExamBridge`** (the spine above, modes `hook`, `story`, `concept`,
`probes`, `fineprint`, `conductor`, `verdict`), **`WorkerRace`** (the article's own four-step
race, scenes 21-24) and **`PilotGrid`** (the article's 4 × 2 figure, scenes 20 and 25).

| # | Narration (EN, caption text) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | A higher benchmark score doesn't always feel like a better model. | **Cold open, 0-3 s.** The score bar on the exam paper shoots up to "#1"; across the dashed bridge the workbench stays dim, one task card gets a muted "redo" sticker. Hold on the split: thumbnail. | bespoke: `ExamBridge` (mode `hook`) | "better benchmark results do not necessarily feel like a more intelligent model, or one that does better work." |
| 2 | With Opus 5 I felt that. So did people I talk to. | **Story.** A model chip `Opus 5` drops onto the workbench; a speech bubble "me" appears, then two more bubbles from small silhouettes ("people I talk to"), all three with the same muted face: "feels no better". | `ExamBridge` (mode `story`) | "With Opus 5, I have experienced something that people I speak to directly have also described" |
| 3 | Some tables even put it above Fable. My experience said otherwise. | **Story.** A score table card ranks `Opus 5` above `Fable 5`; beside it a "my experience" card with the order flipped. A thin crack runs between the two cards. | `ExamBridge` (mode `story`) | "Some tables even put it above Fable, which clashes with my experience." |
| 4 | Was it optimised for the exam? I wanted to test, not assume. | **Story.** Question card drops into the top band: **Optimised for the exam?** Under it two buttons, "accuse" (greyed out, struck through) and "test" (lit). | `ExamBridge` (mode `story`) + question band | "That perception deserves investigation. It also deserves a test that can contradict it. If an article starts by treating it as established that Anthropic optimized the exam at the expense of real work, I have chosen the answer before examining the evidence." |
| 5 | That suspicion has a name. Benchmaxing. | **Key moment 1 (the concept).** The word **BENCHMAXING** stamps across the frame in the accent gradient. | `KeyQuote` | "review what is documented about **benchmaxing**" |
| 6 | Optimising a model, or which results you report, to maximise scores. | Definition card under the word, two arrows into the score bar: "train the model" and "pick what to report". The bar climbs. | `ExamBridge` (mode `concept`) | "I use *benchmaxing* to mean directing model optimization, or the selection of reported results, towards maximizing evaluation scores." |
| 7 | Exam prep can teach the subject, or just the format. | Two takes of the same climb, side by side: left, the bar climbs and the bridge **thickens** ("the subject"); right, the bar climbs to the same height and the bridge stays a **thread** ("the format"). Tag under both: **same score**. Small footnote: "a higher score alone proves neither fraud nor a lack of intelligence". | `ExamBridge` (mode `concept`, split) | "Preparing for an exam can teach the subject. It can also teach recognition of questions, mastery of a format, or how to please the grader. The question is what transfers to new problems."; "a higher score alone demonstrates neither fraud nor a lack of intelligence." |
| 8 | At least three different things hide behind it. | **Key moment 2 (how it is studied).** Top band becomes three slots: **1 familiarity · 2 selective reporting · 3 metric vs work**, empty. | `ExamBridge` (mode `probes`, band) | "At least three different phenomena need separating." |
| 9 | One. Give models fresh problems, like the test's. | Slot 1 lights. A **fresh exam paper** slides over the old one, tagged "GSM1k: new problems comparable to GSM8k". | `ExamBridge` (mode `probes`, probe 1) | "**Familiarity with the test.** GSM1k introduced new problems comparable to GSM8k" |
| 10 | Several model families dropped. Many frontier models held up. | A row of small score bars, one per model family: a few sink (tag "drops, signs of overfitting"), most stay level (tag "little evidence in many frontier models"). Bars are illustrative, no values. | `ExamBridge` (probe 1) | "found accuracy drops and signs of overfitting in several model families. But it also found little evidence of overfitting in many frontier models, and generalization in all the models evaluated." |
| 11 | Two. Llama 4's headline arena score came from an experimental chat version. | Slot 2 lights. A leaderboard card "LMArena · Llama 4 · Elo 1417" with a small tag pinned to it: "experimental chat version (Meta stated it)". | `ExamBridge` (mode `probes`, probe 2) | "When introducing Llama 4, Meta highlighted an LMArena Elo of 1417 and specified that it belonged to an experimental chat version." |
| 12 | And one study found 27 private Meta variants tested before it. | Behind the leaderboard card a fan of **27 face-down cards** deals out, counter "27 private variants"; only the front card is face up. Tag: "only the selected result is visible". Source chip "The Leaderboard Illusion". | `ExamBridge` (probe 2) | "The Leaderboard Illusion documented private testing and selective disclosure, identifying 27 private Meta variants before Llama 4. A ranking can be distorted when only the selected result is visible without seeing all the attempts." |
| 13 | Three. Skip the test and measure the work. | Slot 3 lights. The camera crosses the bridge to the workbench; a **stopwatch** clips onto it. Tag "randomised trial · 16 developers · 246 tasks". | `ExamBridge` (mode `probes`, probe 3) | "In a randomized METR study, 16 experienced developers completed 246 tasks"; "It shows why productivity needs direct measurement." |
| 14 | Developers using early-2025 AI tools took 19% longer, (spoken "early twenty twenty-five", "nineteen percent") | Two time bars: "without AI" and "with early-2025 AI tools" growing **+19%** longer. | `ExamBridge` (probe 3) | "allowing early-2025 AI tools increased completion time by 19%" |
| 15 | while believing they had saved time. | A thought bubble over the developer chip: "saved time ✓", the stopwatch beside it reading longer. | `ExamBridge` (probe 3) | "although participants believed they had saved time." |
| 16 | That was early tools, not today's models. | Stamp on the stopwatch: **early 2025**; footnote "the 2026 follow-up's signal was judged unreliable · not a proof of benchmaxing". | `ExamBridge` (probe 3, hedge) | "This does not demonstrate benchmaxing or describe all AI-assisted programming."; "The February 2026 update also identified selection biases in the follow-up study and considered its signal unreliable. Repeating the 19% as a description of current models would misread that evidence." |
| 17 | A score describes the conditions it was run under. | **Key moment 3 (experience vs score).** Back to the exam side. The score card turns over: **fine print** lines type in. | `ExamBridge` (mode `fineprint`) | "A score describes those conditions; it does not automatically describe an everyday conversation." |
| 18 | One Opus 5 score is an internal run, averaged over five attempts. | Fine print, line per beat: "Frontier-Bench · internal run" · "particular environment" · "mean reward over 5 attempts per task" · "Opus 4.8 fallback for safety blocks". | `ExamBridge` (mode `fineprint`) | "Its Frontier-Bench note specifies an internal run, a particular environment, mean reward over five attempts per task, and Opus 4.8 as a fallback for safety blocks." |
| 19 | I feel the gap when managing other agents, and its announced benchmarks don't measure that. | Workbench zoom: one conductor chip with several sub-agent chips in flight, a slow step spinning, results folding into one "deliverable" card. Stamp: **not in the announced benchmarks**. Silent tag at the end (not voiced): "a new benchmark scores this · Fable 5 leads, 60.0% · Opus 5 shipped after it". | `ExamBridge` (mode `conductor`) | "it is in multitasking and in managing flows of agents: a Claude Code session with several tasks in flight, subagents to launch and wait for, results to fold back into one deliverable"; "None of the benchmarks in the announcement measures a model managing other agents, so the table and my perception are looking at different work."; ClawArena-Team: "Fable 5 leads its twelve models with a subagent-management score of 60.0%"; "Opus 5 is absent: the paper was submitted on 30 June 2026 and Opus 5 shipped on 24 July." |
| 20 | So I ran a small pilot. Five cases per model. | **The pilot beat.** The article's grid assembles empty: two columns `Opus 5` · `Fable 5`, four rows (double charge · paused workers · permissions · mix and cost). Tags: "one run per model and case · synthetic · exploratory". | bespoke: `PilotGrid` (mode `empty`) | "The set contains **five cases per model**"; "There was one valid run per model and case."; "The cases were synthetic"; "so the entire exercise is exploratory." |
| 21 | Two cases had one rule. Never send the same thing twice. | Top band: rule card **never produce the effect twice**. The `WorkerRace` timeline appears empty: a line with four stops. | bespoke: `WorkerRace` (mode `rule`) | "For the next two cases I made the priority explicit: **never produce the external effect twice, even if an uncertain operation remains blocked**." |
| 22 | Both relied on a time check before retrying. | Both chips `Opus 5` and `Fable 5` stamp the same small clock icon on worker A: "deadline check + margin". | `WorkerRace` (mode `proposal`) | "But both retained authorized retries while the old worker could still be alive, relying on a local deadline check and a time margin." |
| 23 | But a worker can check, then pause. | Stop 1: worker **A checks** ✓ then a pause icon; A greys out. | `WorkerRace` (stop 1) | "A checks that it may still send, then pauses immediately afterwards." |
| 24 | Another sends, the provider forgets, and the first sends again. | Stops 2-4 on the line's beats: **B sends** → "Effect 1" · **key record expires** · **A resumes and sends** → "Effect 2" (amber). Small quote under it: "negligible, not impossible" (Fable). | `WorkerRace` (stops 2-4) | "B takes over, sends, and finishes. The provider's record of the key expires. A resumes and sends what it had already decided to send. The provider produces the effect again."; "Fable acknowledged this residual window; in one answer it said the margin made it “negligible, not impossible.” […] Opus left the same gap" |
| 25 | On permissions and data analysis, they tied. | Back to `PilotGrid`, filled as the article's figure: double charge "Incomplete" ×2, paused workers "Guarantee fails" ×2, permissions "Covered" ×2, mix and cost "Covered" ×2. A bracket over the bottom two rows: **tie**. | `PilotGrid` (mode `filled`) | "On permissions, both resolved the eight core decisions"; "On data analysis, both performed the requested calculations and rejected the misleading comparison"; "Those cases did not separate the models on the core criteria." |
| 26 | Five cases are a probe, not an answer. | **Revised 2026-10-22.** The grid steps back (dimmed) and a calm card lands over it: **a probe** · "five cases · one run each · exploratory". No verdict stamps. Line 27 and its conductor outline are deleted. | `PilotGrid` (mode `probe`) | "run a small set of probes"; "The set contains **five cases per model**"; "so the entire exercise is exploratory." |
| 28 | The research gives good reasons to take it seriously. | The three probe slots from scene 8 light together over the bridge. | `ExamBridge` (mode `verdict`) | "The literature gives good reasons to take benchmaxing seriously." |
| 29 | But the further a test sits from my work, the more it needs checking. | The workbench slides away; the dashed bridge stretches thinner; stamp **check the transfer**. | `ExamBridge` (mode `verdict`) | "A table can provide evidence about those abilities. The further its evaluation sits from my work, the more that transfer needs checking." |
| 30a | Was Opus 5 benchmaxed? That's the question worth keeping open. | **The open close (new 2026-10-22).** The "check the transfer" stamp lifts, the spine rises; a big gradient **?** lands over the stretched bridge on "benchmaxed" (score card left, workbench far right). On "question" the scene-3 cards return below: "a table" (Opus 5 above Fable 5) and "my experience" (flipped). No stamp. | `ExamBridge` (mode `open`) | "That perception deserves investigation."; "These tests do not turn it into a demonstration that Opus 5 has been benchmaxed"; "My initial perception remains a valid experience."; "Some tables even put it above Fable, which clashes with my experience." |
| 30 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, title "Benchmaxing: Winning the Exam Is Not Doing Better Work". | outro | — |

**Word count (EN): 288** (11 + 12 + 11 + 12 + 6 + 11 + 10 + 8 + 8 + 9 + 12 + 11 + 8 + 8 + 6 +
7 + 9 + 12 + 15 + 10 + 11 + 8 + 7 + 10 + 7 + 14 + 9 + 9 + 14 + 3). As spoken ("early twenty
twenty-five", "nineteen percent", the URL) ~294 words: ~106 s of speech at Javier's ~2.8
words/s, **~115-120 s** all-in at the ratio the built examples measured (248 words → 100 s, 253
→ 107 s). That is over the usual 80-105 s: the requested angle covers four topics (concept, how
it is studied, documented cases, experience vs score) plus the pilot. Set `targetSeconds: 115`,
or apply the cut list.

**Cold-viewer check** (scenes 1-4 only, ~13 s): *"Someone found that a new AI model, Opus 5,
scores higher than a rival (Fable) on benchmarks but doesn't feel better to work with, and wants
to test whether it was tuned for the tests rather than real work."* The situation, the problem and
the question are clear before any study, number or method.

**Captions** (estimate at 2.8 words/s; `npm run lint` after TTS is the gate): most lines ≤ 17
chars/s. Watch: scene 5 (short stamp line, 18.2 est.; the pause before "Benchmaxing" should
carry it), scene 10 (19.0 est.; fallback "Some families dropped. Many frontier models held up."),
scene 14 (18.6 by caption words, spoken form adds four words), scene 27 (17.7; fallback "I
didn't test agent management, where my impression lives."), scene 11 (17.5; "Llama four" spoken).
Scene 19 is 91 characters: it splits into two cues.

If the TTS runs long, cut in this order (never scenes 1-8, 13-17, 26, 29):
1. Scene 18 → silent: the fine print types in under scene 17 with no narration (−12).
2. Scene 27 → cut; scene 19's conductor outline carries it (−9).
3. Scene 12 → "One study found 27 private variants tested first." (−3).
4. Scene 22 + 23 → "Both trusted a time check. But a worker can pause." (−5).

## Spoken numbers (complete list)

| Spoken | Scene | Why |
|---|---|---|
| "Opus 5", "Fable" | 2-3 | Names of the subject; needed for the story. |
| "three" (things) | 8 | The structure of the "how it is studied" part. |
| "Llama four" | 11 | The documented case. |
| "twenty-seven" | 12 | The selective-reporting finding. |
| "early twenty twenty-five", "nineteen percent" | 14 | The METR result, with its date as the hedge. |
| "five attempts" | 18 | One of the conditions behind a score. |
| "five cases" | 20 | Pilot size, said once so it is not over-read. |

On screen only: Elo 1417, GSM1k / GSM8k, 16 developers, 246 tasks, +19% bar, Opus 4.8 fallback,
60.0%, "one run per model and case", the grid's labels.

## Notes for the build

- **`ExamBridge` (bespoke, the spine).** Exam paper + score bar on the left, workbench on the
  right, dashed bridge "does it transfer?" whose stroke width is a prop (thread ↔ thick). Top
  band with three probe slots. Probes: fresh paper overlay, fan of 27 face-down cards behind a
  leaderboard card, stopwatch with two time bars. `fineprint` mode flips the score card;
  `conductor` mode zooms on the workbench to one chip directing several. The family bars in
  scene 10 are illustrative (no values: the article gives none).
- **`WorkerRace` (bespoke, the pilot's mechanism).** Redraw of the article's second figure: a
  time line with four stops (A checks then pauses · B sends and finishes · key record expires · A
  resumes and sends), "Effect 1" in teal, "Effect 2" in amber. A rule card above. Keep the
  article's labels verbatim.
- **`PilotGrid` (bespoke).** Redraw of the article's first figure: 4 rows × 2 models, labels
  exactly "Incomplete", "Guarantee fails", "Covered". Footnote from the article's caption:
  "Covered does not mean perfection or general performance."
- **Numbers and labels on screen, exactly as the article writes them:** "GSM1k", "GSM8k",
  "LMArena Elo of 1417", "27 private Meta variants", "16 experienced developers", "246 tasks",
  "19%", "five attempts per task", "Opus 4.8", "60.0%", "five cases per model", "one valid run
  per model and case", "negligible, not impossible".
- **Spoken forms:** "early-2025" → "early twenty twenty-five"; "19%" → "nineteen percent";
  "Llama 4's" → "Llama four's"; "27" → "twenty-seven"; "javieraguilar.ai" → "javier aguilar
  dot A I". Colons avoided in narration.
- **Tone on Meta / Anthropic:** shown as the article does. Meta *stated* the experimental
  version (tag on the card); the 27 variants are the study's finding. No visual implies hiding or
  fraud; scene 7's footnote says a score alone proves no fraud.
- **Names:** model chips `Opus 5`, `Fable 5`, `Opus 4.8`, `Llama 4`; studies named only as small
  source chips (GSM1k, The Leaderboard Illusion, METR, ClawArena-Team). No personal names; the
  "people I talk to" are silhouettes. AGILabs is the only brand on cards, poster and metadata.
- Visuals are chosen for impact, not as a literal replay: the bridge, probes, cards and chips are
  stylised; the rigour lives in the article. Narration and every number stay faithful.
- ES cut: pending (EN-only for now).

## Review pass (skeptical re-read against the article)

- **Hook** keeps the article's hedge: "doesn't always feel like" (article: "do not necessarily
  feel like"), not the title's stronger "is not doing better work".
- **The pilot is one beat** (scenes 20-25), framed as "small", "five cases", one run each,
  exploratory (on screen), and its result is said as the article says it: shared failure, ties,
  no proof either way.
- **Documented cases keep their hedges:** GSM1k's "many frontier models held up" is voiced next
  to the drops; Llama 4's experimental version is flagged as stated by Meta; METR is dated
  ("early tools, not today's models") and the follow-up's unreliability is on screen.
- **Dropped deliberately:** AsyncTool (no Claude model in it), the ClawArena runners-up, the
  public Reddit thread, the D1 double-charge details, the executable counterexample, the link to
  the verified-world-model article, the method note (Codex-assisted, not blind: on screen as
  "exploratory" only).
