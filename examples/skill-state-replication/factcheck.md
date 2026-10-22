# Fact-check: Explicit State Doesn't Forget. It Misremembers. (v1.0)

Sources, both on `origin/main` of the website repo:

- **P1** `src/content/blog/en/when-the-fact-stops-being-true.md` (pubDate 2026-09-13), including its
  top **Correction** banner and the closing correction note.
- **P2** `src/content/blog/en/explicit-state-misremembers.md` (pubDate 2026-09-26).
- Cross-check: `JaviMaligno/delayed-relevance` (public, the articles' `repoUrl`), local clone at
  commit `7cba859`, `docs/paper-draft.md`.

Scope: narration, plus numbers and text shown on screen. Visuals are illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "Give an agent a notepad instead of a memory. It stops forgetting. It starts misremembering." | P2 title "Explicit State Doesn't Forget. It Misremembers."; P2 "Explicit state does not lose track of the procedure. It **writes the state wrong**, and nothing checks the write." | OK as a hook; line 18 adds the hedge "on some models" (P2: Gemini never made the error). |
| 2 | "Agents usually reread their whole conversation at every step, and it keeps growing." | P1 "the append-only conversation history of a ReAct-style agent"; "ReAct: **16,437** and growing linearly"; "a prompt that stays O(1) instead of growing O(T)" | OK. "usually" = the ReAct-style baseline the paper replaces. |
| 3 | "A paper called SKILL.state swaps that for a small notepad of current facts, rewritten each step." | P1 "replaces the append-only conversation history … with an explicit, mutable execution state … It replies with a JSON patch and an action. The patch is validated and merged … the reasoning that produced it is **discarded**." | OK. "notepad" is the plain-words metaphor for the explicit state object (P1 also calls it "a 200-character JSON state object"). |
| 4 | "It promises steadier accuracy and a far smaller prompt. I rebuilt their test to check." | P1 "The claim has two halves: better accuracy on long procedures, and a prompt that stays O(1)"; "SkillExecBench has no public code, so the environment here is a reimplementation" | OK. |
| 5 | "My test is a warehouse agent filing pallets, for up to two hundred steps." | P1 "a 500-shelf warehouse"; horizons T=10…T=200; P2 "75 episodes of up to 200 steps" | OK. |
| 6 | "In tokens it's 7.5x cheaper. But a changing notepad breaks caching, and my bill said only 1.4x." | P2 "With a short procedure, caching shrinks SKILL.state's input-cost advantage over the transcript from **7.5x to 1.4x** on Anthropic, because an append-only transcript is an ideal cacheable prefix and a mutating state block is not." P1 "SKILL.state's advantage over ReAct falls from 7.54x in raw tokens to 1.39x in money." | OK. "my bill" scopes it to this setup; on screen "short procedure · Anthropic caching". Not voiced: with a 5,243-token procedure it is 2.51x (P1), and on Vertex 7.5x stays 7.2x (P2). |
| 7 | "Keeping both, with the notepad first as in the paper's template, costs 5.2x more." | P2 "The same Stateful runtime, sending the same content … costs **5.2x more** when its state block goes in front of the transcript than behind it — 869k against 168k effective input tokens per 50-step episode — for the same score. The paper's own prompt template puts the state block in front." | OK. "Keeping both" = Stateful (state block + transcript), shown on screen. |
| 8 | "On Claude, long tasks hurt neither. So I ran the paper's own model, Gemini, in their setup." | P1 table (Claude Haiku 4.5): ReAct T=200 **0.99 ±0.02**, SKILL.state **1.00 ±0.00**; "The accuracy half does not [replicate]"; P2 "So this half runs on theirs — `gemini-3-flash-preview` … in an environment rebuilt to match their Appendix B" | OK. "Claude" is Haiku 4.5 in P1's first environment (screen says so). "in their setup" = rebuilt to their Appendix B. See issue A. |
| 9 | "The notepad never missed in 75 episodes. The transcript slipped, less than the paper reports." | P2 "**SKILL.state does not fail once in 75 episodes of up to 200 steps**"; "ReAct falls only to 0.913 at T=200, against 0.74 in the paper"; "our ReAct loses 0.080 … where theirs loses 0.160" | OK. Hedge on screen: "may not be the exact checkpoint" (P2). |
| 10 | "It clearly wins when a fact stops being true, like a pallet never actually put away." | P1 "*the pallet you filed at step 3 was never actually put away; that shelf is empty.*"; "**Having a single place where the truth lives is an advantage precisely when the truth changes.**" | OK. |
| 11 | "The transcript holds the record and its correction, and must reconcile them each time." | P1 "The transcript erases nothing: it holds the original record and its retraction simultaneously, and every subsequent step has to resolve the contradiction again from scratch." | OK. |
| 12 | "Across three models, the notepad applied the correction in 70 of 72 episodes. The transcript, in 10." | P2 "**Explicit state applies the correction in 70 of 72 episodes (Wilson 95 % interval 90–99 %); the full transcript in 10 of 72 (8–24 %).**"; P1 Correction banner, same figures; P2 figure 24/24, 22/24, 24/24 vs 1/24, 9/24, 0/24 (repo `paper-draft.md` l. 475-480 matches). | OK. Uses the corrected count, not P1's body (see issue B). "the paper's own claim" shown on screen, as both articles stress. |
| 13 | "Yet on Claude Haiku, in the same setup, the notepad came last." | P2 table T=200 Haiku: ReAct 0.974, Stateful **0.999**, SKILL.state 0.958; "On Haiku the ordering turns over." | OK. "same setup" = P2's environment (same as Gemini's). See issue A. |
| 14 | "Replaying every step, each failure began with a correct move written down wrong." | P2 "I replayed every episode against the real environment and compared, step by step…"; "In all 17 episodes where the belief drifted from reality, the step that corrupted it was a **`Move` executed correctly with a state patch written wrong**." | OK. "each failure" = P2 "Every failure of explicit state has the same origin." |
| 15 | "It moved shelf seven to three, but noted shelf six's contents, then shipped on that belief." | P2 figure: "At step 132 the model executes a correct Move from shelf 7 to shelf 3, but writes into its state the contents of shelf 6 instead of shelf 7. Five steps later it ships from shelf 3 based on that belief and the environment rejects the action." | OK. |
| 16 | "Nothing checks that write. Haiku did it in 17 of 24 long runs." | P2 "the write is never checked against what the action did"; "Haiku wrote at least one wrong patch in 17 of 24 at T=200." | OK. "did it" = wrote at least one wrong patch (screen: "runs with a wrong patch at T=200"). Note P2 also says not every wrong patch matters (seed 0, lot number); the voice says "did it", not "failed". |
| 17 | "On Haiku, keeping the transcript beside the notepad absorbed every slip that mattered." | P2 "On Haiku it makes **the same kind of write error** … and loses nothing to it"; "None of its failures comes from its state."; "It cost Stateful nothing on Haiku and caught every wrong write that would have mattered." | OK, scoped to Haiku. Not voiced: on Gemini Stateful drifts in 11 of 15 episodes, and P2's caveat that it "describes rather than isolates" the transcript's effect. |
| 18 | "So the notepad works, best when facts change. It doesn't forget. On some models, it misremembers." | P2 "**Explicit state does what the paper says on the paper's model.**"; P1 "**Explicit state earns its place when facts get invalidated.**"; P2 "**Its failure mode is writing, not remembering.**"; title | OK. Verdict as the articles conclude it: good, with a specific failure on some models. |
| 19 | "Check each write against what the action did, and keep the notepad last in the prompt." | P2 "nothing in the runtime checks that the value matches what the action did. If you build on explicit state, that check is the part to add."; "**Put the mutating part last.** It is a one-line change and, measured in isolation, a 5.2x difference on the invoice." | OK. |
| 20 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Line | Source |
|---|---|---|
| "500 shelves", "up to 200 steps", four runtimes | 5 | P1 "a 500-shelf warehouse"; P2 four runtimes list |
| "2,157" vs "16,437" chars at step 50 | 6 | P1 "SKILL.state **2,157** … ReAct: **16,437**" |
| "7.5x" tokens, "1.4x" bill, "short procedure · Anthropic caching" | 6 | P2 "from **7.5x to 1.4x** on Anthropic", "With a short procedure" |
| "869k" vs "168k", "5.2x", "same content · same score" | 7 | P2 cost section |
| Claude Haiku "0.99" / "1.00" at T=200 | 8 | P1 table |
| "1.000", "0.913", "paper: 0.74", "may not be the exact checkpoint" | 9 | P2 figure aria-label and text |
| "70 / 72", "10 / 72", per-model 24/24 · 22/24 · 24/24 vs 1/24 · 9/24 · 0/24 | 12 | P2 figure; P1 Correction banner |
| "0.999", "0.974", "0.958" (Haiku, T=200) | 13 | P2 table |
| step "132" / "137", shelves 7 → 3, shelf 6, "REJECTED" | 15 | P2 figure ("Five steps later … the environment rejects the action") |
| "Haiku 17 / 24", "Gemini 0 / 75" | 16 | P2 "Gemini never made this error in 75 episodes; Haiku … 17 of 24 at T=200" |
| "same write errors · 0 failures from them" | 17 | P2 "None of its failures comes from its state." |

## Anonymisation

Nothing to anonymise: the warehouse is the article's simulated environment, the paper and the
models are public. Cloud providers (Vertex, Foundry) are not named in the video. AGILabs is the
only brand.

## Article issues and doubts found

- **A. "On Claude, long tasks hurt neither" vs "Haiku's notepad came last".** P1 shows Haiku with
  SKILL.state at 1.00 at T=200; P2 shows Haiku SKILL.state at 0.958 at T=200. They are different
  environments (P1: own reimplementation from §4.1; P2: rebuilt to match Appendix B), but P2
  does not say explicitly that the environment change is why Haiku now drops. The video separates
  them with "in their setup" / "in the same setup" and the on-screen tag; worth a sentence in P2.
- **B. P1's body still carries the superseded headline.** The Correction banner replaces "3/44
  vs 44/44" and "93 of 93" with 70 of 72 vs 10 of 72, but the body (intro, the 18-of-82 figure
  caption, "6.8% to 39.5%", and "93/93 against 18/82" in "What I would take from this") and the
  LinkedIn summary still state the old numbers as findings. The video uses only the corrected
  ones.
- **C. 5.7x vs 5.2x in P1.** P1's first figure caption says the order "turns out to cost 5.7x"
  (also in its LinkedIn summary), while P1's body computes "$849 against $162 … A 5.2x
  difference" and P2 reports 5.2x isolated (the repo draft explains 5.7x as ReAct vs Stateful with
  order and mutating block confounded). The video uses 5.2x only.
- **D. P1 says "across two models" in its top note** while the corrected recovery result spans
  three (P2). Not an error, just dated; the video says "three models" for the 70 of 72.
- **E. Memory arm and the "re-inject the field" probe are left out** (no room). P1 and P2 agree
  on the named-field result for Haiku (24/24) but give different `notes` figures (P1: Sonnet 5/24;
  P2: Haiku 10/24, Gemini 1/24); different models, not a contradiction, but easy to misread.

## On-screen text added at build (2026-10-21)

| On screen | Scene | Source |
|---|---|---|
| "SKU-K" (really on shelf 3), "SKU-J" (written, "from shelf 6"), "ship SKU-J from shelf 3", "ACTION REJECTED", "not corrected" | drift / slip / check | P2 step-132 figure: "reality, shelf 3 SKU-K · L-8558", "state patch, shelf 3 SKU-J … (copied from shelf 6)", "Ship shelf 3 ✗", "ACTION REJECTED", "state not corrected" |
| Gemini transcript curve between T=10 and T=200, paper's dashed curve | gemini | Read off P2's first figure (points); only "1.000", "0.913", "0.74" are labelled |
| "75 episodes · never missed" | gemini | P2 "SKILL.state does not fail once in 75 episodes" |
| "schema ✓" on the wrong line | check | P2 "a schema-valid patch with the wrong value in it, which passes every check the runtime runs" |
| "bars start at 0.90" | haiku | Axis note for the 0.999 / 0.974 / 0.958 bars (P2 table) |
| Lot labels A7, C4, D1, E5, F2, G3 and the story transcript lines | story | Illustrative (the simulated warehouse); no figures |
