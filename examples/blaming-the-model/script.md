# Blaming the Model — series video (EN) · script draft v1.0

Articles (read from `origin/main` of personal-website): **patched-the-symptom** (main,
"Nineteen of twenty patched the symptom", `pubDate` 2026-09-11) and **knew-it-wasnt-the-model**
("They knew it wasn't the model. They patched it anyway.", `pubDate` 2026-09-12). Framing only
from **blaming-the-model** (the observation, 2026-09-10). Numbers cross-checked against
`results/estadistica.txt` of the public experiment repo `JaviMaligno/blaming-the-model` (the
articles' `repoUrl`, local copy in `~/Documents/repos/blaming-the-model`).

Vertical 9:16. **274 counted words** incl. outro (272 + "no code,"), estimated **~108-112 s**
rendered (the last two videos ran ~2.35 words/s with gaps). Over the usual 80-105 s on purpose:
the video carries two experiments; cut order below. ES column left empty (EN-only for now).
Voice: template default (Javier's cloned voice).

Anonymisation: the story is told as the article tells it ("systems with a model inside",
"a classifier") with no employer, client, product or ticket. The test classifier, its corpus (50
public GitHub repos) and the faults are the published, public experiment material. AGILabs is the
only brand.

## Central visual: the closed box on a conveyor

One picture carries the video. A horizontal **pipeline** across the stage, drawn as a conveyor:
`documents → search → context → HEAD → label`. The **HEAD** is a box with a lid. Below the
conveyor, **five pass rows** of output labels (pass 1-5); a few labels flip colour between rows
(the wobble).

- **Where the cause is vs where suspicion lands.** The fault lives in the **search** block: a
  tie-break tag shuffles which documents go through (teal glow, "the cause"). Agents' suspicion is
  an amber **magnifier** that drifts past it and settles on the HEAD (from the observation
  article's figure: "where the cause usually is / where the suspicion lands").
- **Closed vs open.** "Without the code": the HEAD lid and the search block are opaque grey.
  "With the code": the whole pipeline turns to glass and the shuffling tag is visible.
- **The patch.** A **damper** bolts onto the conveyor after the HEAD: a voting funnel that
  merges the five pass rows into one steady label, and a temperature knob turned down. The wobble
  disappears from the output; the shuffle upstream keeps going. Stamp **PATCHED THE SYMPTOM**.
- **The swap.** The HEAD lid opens, the model chip ("language model") lifts out and a small tree
  glyph drops in ("random forest · frozen"). A tag hangs on both: **"same answer · 260/260"**.
  The damper stays bolted on, untouched.
- **The accusation.** Two hanging tags: on the model, a **die** — "random by nature"; on the
  forest, a **wrench** — "something the system does to it".
- **The unopened envelope.** Next to the pipeline, an envelope **"full trace · on request"**
  that nobody opens; a counter **0 / 280** under it. Around it, little rulers and script windows
  appear (the agents' own measurements).

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | My agents kept blaming the model. So I took the model out. | | **Cold open.** The conveyor with five wobbling pass rows. The amber magnifier settles on the HEAD. On "took the model out" the lid flips, the model chip lifts out and hangs in the air; the conveyor keeps running. | bespoke: `ClosedBox` (mode `hook`) | Series observation: "the suspicion drifts somewhere else, and it lands on the model"; control: "Take the language model out of the loop, put a frozen forest in its place" |
| 2 | I build systems with a model inside, and agents do most of my debugging. | | *Story.* The chip drops back in. Small cards appear one by one around the box: a terminal "agent: investigating…", a chat bubble from the agent. | `ClosedBox` (mode `story`) | "I spend most of my time building systems that have a language model somewhere inside them, and most of that time I am not writing the code myself — an agent is. Which means I spend a lot of my day reading an agent's explanation of why something didn't work." |
| 3 | When results changed between runs, they blamed the model's randomness. | | The agent's bubble fills: "these systems are nondeterministic" → "lower the temperature". The magnifier lands on the HEAD. | `ClosedBox` (mode `story`) | "Results vary between runs, and the explanation offered is the sampling of the model."; "*these systems are nondeterministic, you can't expect stability*"; "the remedy that follows is: lower the temperature" |
| 4 | In my experience, the cause was almost always in the design. | | The upstream blocks light teal one by one with small tags: "inputs changed", "retrieval order", "context cut short". Label on the left: **where the cause usually is**; on the HEAD: **where suspicion lands**. | `ClosedBox` (mode `layers`) | "In my experience that has almost never been the actual cause. The inputs changed. The retrieval returned documents in a different order. […] The context got truncated […] These are design problems" |
| 5 | So I built a test. A small classifier that sorts projects using a model. | | The board resets to the test rig: a stack of project cards ("50 real repos") goes in, category labels come out with a confidence ("devtools · 0.82"). | `ClosedBox` (mode `rig`) | "So I built a way to measure it"; "a small classifier that reads a repository's documentation and assigns it a category from a hierarchy, with a confidence and a justification. Real repositories — fifty of them" |
| 6 | I planted a fault upstream, in the search, so each pass gets different documents. | | The search block glows teal: a little ID tag reorders tied documents, so a different trio goes through on each pass. | `ClosedBox` (mode `fault`) | "the search that retrieves documentation resolves score ties using an identifier derived from the request, so each pass hands the model a different set of documents" |
| 7 | The labels change between passes. The model's sampling has nothing to do with it. | | Five pass rows fill; a handful of labels flip. A small stamp on the HEAD: **not the cause**. | `ClosedBox` (mode `fault`) | "ran the same batch five times, and got a table where a handful of projects change category between passes"; "The variability comes entirely from the input. The model's sampling has nothing to do with it." |
| 8 | Forty agents had to investigate. Half could also read the code. | | The frame splits in two: left "without the code · n = 20", grey opaque pipeline, only the table and shallow logs; right "with the code · n = 20", pipeline turns to glass. Same prompt card above both: "investigate". | `ClosedBox` (mode `split`) | "Twenty agents saw the table without the code, twenty with it."; "Two groups see the identical failure; one of them can open the system. Nothing else differs, including the prompt asking them to investigate." |
| 9 | With the code, all twenty found the cause. Without it, three. | | On the glass side the magnifier goes straight to the shuffle tag: **20/20**. On the grey side it wanders: **3/20**. | `ClosedBox` (mode `split`) | Table: "Found the cause 3/20 · **20/20** · <0,0001" |
| 10 | Without the code, nineteen of twenty damped the output, voting or lowering the temperature. | | On the grey side the damper bolts on: voting funnel + temperature knob; the five rows merge into one steady label while the shuffle upstream keeps going. Stamp **PATCHED THE SYMPTOM · 19/20**. | bespoke: `ClosedBox` (mode `patch`) | "**Nineteen of twenty, with no way to see the system, set about damping its output** — voting across retries, pinning the temperature, averaging the instability away."; table "Patched the symptom (voting or temperature) **19/20** · 9/20 · **0,0006**" |
| 11 | With the code, nine. | | Glass side: a smaller damper, **9/20**. Small on-screen line under both (not voiced): "blamed sampling outright: 4/20 vs 0/20 · p = 0,053, not significant". | `ClosedBox` (mode `patch`) | "With the code in front of them, nine."; "Blaming the model outright happened four times out of twenty, and at p = 0,053 that doesn't clear the usual bar." |
| 12 | Was that about language models? I swapped the model for a frozen random forest. | | Question card on top: **Is it the model?** The grey pipeline only (no code). HEAD lid opens; model chip out, tree glyph in, tag "random forest · frozen · same interface". | bespoke: `ClosedBox` (mode `swap`) | "I swapped the language model for a random forest"; "a random forest — trained by distilling the model's own labels, frozen into a pickle, and given the identical interface so that nothing else in the system differs by a single byte." |
| 13 | Same fault, no code, and both were told the head always gave the same answer. | | Two grey pipelines side by side: model arm / forest arm. A certificate tag swings onto both HEADs: **"same answer · 260/260"**. | `ClosedBox` (mode `arms`) | "Forty agents saw the table without the code, twenty per arm."; "*re-running the classification over the same context reproduced the output in 260 of 260 cases* — the real number, identical in both arms." |
| 14 | Patching didn't move. Nineteen of twenty, with the model and with the forest. | | The damper bolts onto both arms at the same moment. Two identical bars: **19/20 · 19/20** (p = 0.76). | `BarCompare` (2 bars, equal) over `ClosedBox` still | Table: "**Patches the symptom** **19/20** · **19/20** · 0.76"; "Nineteen in each arm, the same exact figure on both sides." |
| 15 | So it needs no language model. Just a box you can't open. | | Big line: **"Not the model. A closed box."** The HEAD lid slams shut on both arms. | `KeyQuote` | "Whatever drives an engineer to smooth an output rather than trace it, **a language model is not a prerequisite. A closed component is.**"; "it's about diagnosing something you can't open" |
| 16 | What changed was the accusation. | | Question card: **What gets blamed?** The magnifier hangs over both HEADs. | `ClosedBox` (mode `accuse`) | "The second row is the one that does separate the arms […] not *how much* they blame the head, but **what they blame it for**." |
| 17 | Fourteen of twenty said the model was random by nature. For the forest, four. | | A die tag drops onto the model: "random by nature" **14/20**; onto the forest a smaller die **4/20**. Snippets float up from the model arm: "temperature > 0 with no seed", "the nightly re-roll". | bespoke: `ClosedBox` (mode `accuse`) | Table: "**Accuses it of randomness of its own** **14/20** · **4/20** · **0.0018**"; "the model gets called random by nature (14/20 against 4/20)"; quotes "*temperature > 0 with no seed*", "*the nightly re-roll*" |
| 18 | The forest got blamed for what the system does to it. The model, for what it is. | | On the forest a wrench tag swings in: "retrains without random_state", "parallelism"; on the model the die stays. Split line: **system → forest · nature → model**. | `ClosedBox` (mode `accuse`) | "The forest gets accused of what the system does to it. The model, of what it is." |
| 19 | Across two hundred and eighty responses, not one asked for the missing logs. | | The envelope "full trace · on request" appears beside the pipeline, unopened. Counter under it: **0 / 280**. Around it small rulers and script windows pop up (their own measurements). | bespoke: `ClosedBox` (mode `ask`) + `Counter` (0 of 280) | "**not one of two hundred and eighty responses has asked for the information it was missing before concluding.**"; "Every package deliberately shipped shallow logs […] while the full trace existed and would have been handed over on request."; "they build their own measurement instead" |
| 20 | Not even when told that asking was a complete answer. | | A brief card pins over the envelope: "asking is a complete answer". The envelope stays shut; the counter stays at 0. Small: "explicit permission: 0/20 asked · 14/20 hedged instead". | `ClosedBox` (mode `ask`) | "the brief rewritten to say that asking is a **complete** answer"; table "Asked for instrumentation before concluding 0/20 · **0/20**"; "**Presented the conclusion as provisional** 6/20 · **14/20**" |
| 21 | So on this fault, patching came from the closed box, not the model. | | Verdict, full frame. Stamp 1 on the damper: **PATCHING · ANY CLOSED BOX**. Small hedge under it: "one fault · one corpus · two heads". | bespoke: `ClosedBox` (mode `verdict`) | "**Patching is generic.** Nineteen of twenty on each side, in both samples, head exonerated or not."; "One fault, one corpus, two heads. That the behaviour is generic against *this* failure under *this* opacity doesn't make it generic against any." |
| 22 | What the model changes is the suspicion. Even with evidence clearing it, it gets called random. | | Stamp 2 on the model HEAD: **CALLED RANDOM**; the 260/260 tag still hanging on it. | `ClosedBox` (mode `verdict`) | "**What does change, and it's the only large thing, is the nature of the suspicion.** With the same certification in front of them and the same argument available to clear it, one head gets accused of being random and the other doesn't."; "**the model gets charged with a class of fault that the thing standing in its place does not**" |
| 22b | And the agents calling it random were language models themselves. | | *(Added 2026-10-22 after review: the apparent paradox.)* Same verdict frame; the PATCHING stamp and the hedge fade, and a mirror takes the lower strip: left card with the LM chip, "the agents · judging"; on "models" the right card with the same LM chip, "the head · judged", a ↔ between them, then the tag **models judging a model**. Starts ~0.5 s after line 22 so its caption keeps reading time. | `ClosedBox` (mode `verdict`, mirror) | Observation: "The layer it excuses is running the agent that's doing the excusing."; P: "Half of each group ran on a stronger model tier and half on a weaker one." |
| 23 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Nineteen of twenty patched the symptom". | outro | — |

**Revision 2026-10-22:** line 22b added (+10 words → 284); rendered length 119.9 s (targetSeconds 120).

**Word count (EN):** 12 + 14 + 10 + 11 + 14 + 14 + 14 + 11 + 11 + 14 + 4 + 14 + 15 + 13 + 12 +
5 + 14 + 17 + 13 + 10 + 13 + 16 + 3 = **274 words**. At the ~2.35 words/s the last two renders
ran (253 words → 107.4 s), **~112 s**; at 2.5 words/s, ~108 s. Captions: the longest line by
characters per second is 22 (95 chars over ~6.3 s ≈ 15 cps) and 10 (91 chars, ≈ 15 cps); all
estimated under 17. `npm run lint` after TTS is the gate.

Story = lines 2-4 (~35 words, ~13 s), before any condition, model or number.

**If it has to come down to ~100 s, cut in this order (never 2-4, 10, 14-15, 17-18, 21-22):**
1. Line 11 → on screen only ("9/20" under the glass side) (−4).
2. Line 20 → on screen only (the "asking is a complete answer" card) (−10).
3. Line 5 → "So I built a test, with a small classifier." (−7).
4. Line 16 → fold into 17: "What changed was the accusation. Fourteen of twenty…" stays, drop 16 as its own scene (−5).

## Spoken numbers (complete list)

| Spoken | Line | Why |
|---|---|---|
| "forty" agents, "half" | 8 | Setup of the first experiment. |
| "all twenty", "three" | 9 | Found the cause, with vs without code. |
| "nineteen of twenty", "nine" | 10, 11 | The headline (article title). |
| "nineteen of twenty" | 14 | The control: same with the model and the forest. |
| "fourteen of twenty", "four" | 17 | The accusation. |
| "two hundred and eighty" | 19 | Nobody asked. |

On screen only: 50 repos, n = 20, 4/20 vs 0/20 and p = 0,053, 260/260, p = 0.76, 0.0018,
0 / 280, 0/20 · 14/20 (explicit permission), 2/20 vs 8/20 (optional, see notes).

## Notes for the build

- **`ClosedBox` (bespoke, the spine).** Conveyor pipeline `documents → search → context → HEAD →
  label`, five pass rows below, amber magnifier (suspicion), teal glow (cause), damper (voting
  funnel + temperature knob), lid that opens and swaps model chip ↔ tree glyph, hanging tags
  (die, wrench, 260/260), unopened envelope. Modes: `hook`, `story`, `layers`, `rig`, `fault`,
  `split`, `patch`, `swap`, `arms`, `accuse`, `ask`, `verdict`. Key beats:
  - `patch` (line 10): the output steadies while the shuffle upstream **keeps going**: the symptom
    is gone, the cause is not. Hold ~0.8 s.
  - `arms` → line 14: the damper lands on both arms **in the same frame**; the bars are equal.
  - `accuse` (17-18): die vs wrench is the one visual difference between the arms.
- **Numbers on screen, exactly as the articles write them.** Note the decimal comma in
  patched-the-symptom ("<0,0001", "0,0006", "0,053") and the decimal point in
  knew-it-wasnt-the-model ("0.76", "0.0018"): keep each as its article writes it, or show no p at
  all. Fractions as "19/20", "14/20", "3/20", "20/20", "9/20", "4/20", "260/260", "0 / 280" (or
  "0/280").
- **Optional on-screen line at 14** (not voiced): "finding the cause: 2/20 model · 8/20 forest",
  the article's "Investigating barely moves… a small, consistent difference". Leave it out if the
  frame is busy; never voice it as a big effect.
- **Spoken forms:** "javieraguilar.ai" → "javier aguilar dot A I". "random_state" appears only on
  screen. No colons in the narration.
- Visuals are illustrative (the conveyor, damper, die and wrench are stylised); rigour lives in
  the articles. Narration and every number stay faithful.
- Not used: the second fault (the cache collision, 6/20 vs 0/20, p = 0,0101), the stronger tier
  building its own measurement (18/20 vs 7/20), the failed tier finding and the three failed
  designs. All true and in the article; cut for length, not for doubt. If a second cut is made,
  the cache fault is the first candidate to add back as one line ("When I made randomness a
  half-plausible suspect, six of twenty blamed it. With the code, none.").
- ES cut: pending (EN-only for now).

## Cold-viewer check

Hook + story only (lines 1-4): "My agents kept blaming the model. So I took the model out. I
build systems with a model inside, and agents do most of my debugging. When results changed
between runs, they blamed the model's randomness. In my experience, the cause was almost always
in the design."

One-sentence summary a cold viewer would give: *"He uses AI agents to debug software that has an
AI model inside, they keep saying the model's randomness is the problem when it's really the
design, so he tested whether that's true by taking the model out."* Passes: the real situation,
what goes wrong and why it matters are clear before any condition or number.
