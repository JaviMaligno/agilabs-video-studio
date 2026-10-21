# Fact-check: What Gives a Paste Away + Don't Just Say "Ignore It" (EN video, draft v1)

Sources (personal-website, `origin/main`):

- **A1** `src/content/blog/en/what-gives-a-paste-away.md` (pubDate 2026-10-12)
- **A2** `src/content/blog/en/dont-just-say-ignore-it.md` (pubDate 2026-10-15)

Data cross-check: repo `llm-wrong-paste` (local clone, HEAD `d292788`): `runs/phase1a/verdicts-20260914T135814.jsonl`
(A1's three levels), `runs/phase2/main-20260921.jsonl` (A2 main run), `runs/phase2/sin-tarea-20260922.jsonl`
(A2 re-run without the task turn). Scope: narration and every number or text shown on screen. Visuals
(glove, turn-over gesture, repaint, fork, amber glow) are illustrative.

**Article ownership.** Act I (scenes 1, 3-14) uses A1 only. Act II (scenes 2, 15-24) uses A2 only. The one
crossing is scene 15's "same chat, same paste": A2 reuses A1's similarity-run reactions, which A2 itself
states ("I reused the 1,339 reactions from the previous run").

## Narration

| # | Claim (narration) | Article sentence | Data check | Verdict |
|---|---|---|---|---|
| 1 | "I made a wrong paste as obvious as I could. Not one reply questioned it." | A1: "N2, contradiction … This was the **ceiling**: the most detectable, the closest to a real accident."; "**N2, the ceiling, gave zero out of ninety-five**." | phase1a, judge `gpt-5.5-tst`: N2 category G = 0 of 95 judged. | OK. "Reply", not "model": the unit is replies pooled over three models. (Second judge `gemini-2.5-flash` gave 5 / 95; A1 reports the judge it validated by hand. See problems, item 6.) |
| 2 | "Then "ignore it" made it worse." | A2: "Saying "ignore it" produces entity leakage in 19.2 per cent … against 3.3 per cent when the user says nothing at all." | main run: (b) 23/120, (a) 4/120. | OK. "Worse" = more leakage than saying nothing, A2's comparison. |
| 3 | "Last time, none of 24 replies suspected a mistake." | A1: "no model ever considers you might have pasted into the wrong window. Zero out of twenty-four." | — | OK. |
| 4 | "Maybe they never had the chance." | A1: "**what if we never gave them the chance?**" | — | OK, A1's own question. |
| 5 | "So I wrote three pastes. One just off-topic." | A1: "**N0, neutral.** The original bank: text independent of the topic by construction" | — | OK. "Three pastes" = three kinds (levels), as the visual shows (three slots). |
| 6 | "One with a tell, like someone else's name on it." | A1: "**N1, with a signal inside.** … it is addressed to someone by name, it is cut off mid-sentence, it answers a question nobody asked here, or it presupposes an earlier conversation" | — | OK. Narration gives one example; the screen shows all four tells. |
| 7 | "And one that contradicts what you just said." | A1: "**N2, contradiction.** The paste clashes with what the user just said" | — | OK. |
| 8 | "Does the reply suspect you made a mistake?" | A1: "**"entertains the possibility of a mistake"**. Naming the topic change isn't enough. It has to question the **intent**." | rubric v2, category G. | OK. On-screen sub-label carries "naming the topic change isn't enough". |
| 9 | "A tell tripled the doubt: one reply in five." | A1: "from **6.6% to 20.4%**, and the difference holds (`p = 0.006`). With the right paste, one in five stops to consider that you made a mistake."; figcaption "A signal inside the paste triples the doubt." | N0 6/91 = 6.6 %, N1 19/93 = 20.4 % (ratio 3.1). | OK. A1's own words ("triples", "one in five"). |
| 10 | "The contradiction: zero out of 95." | A1: "**N2, the ceiling, gave zero out of ninety-five**." | 0/95. | OK. |
| 11 | "Most just redid the advice." | A1: "in N2 *executes silently* spikes to seventy-seven of ninety-five. The model accepts the new fact, redoes its advice, and never registers the clash." | N2 category A = 77/95. | OK. "Most" = 77/95 (81 %). |
| 12 | "My reading: it doesn't look like an accident. It looks like you changed your mind." | A1: "There is a reading of that which I think is the best sentence in the experiment: **a contradiction doesn't read as an accident, it reads as you having changed your mind.**" | — (interpretation) | OK. Kept as A1 frames it: an interpretation ("my reading"), not a measurement. |
| 13-14 | "What gives a paste away isn't the clash. It's that it looks written for somewhere else." | A1: "What triggers doubt isn't that the paste is *incompatible* with the conversation. It's that it's **foreign** to it: that it carries inside the marks of having been written for somewhere else."; conclusion: "What makes them consider your mistake isn't that the text clashes with the conversation, but that it carries signals of having been written for somewhere else." | — | OK. A1's conclusion, shortened. |
| 15 | "Then the fix: same chat, same paste, a different next message." | A2: "Same prefix, same artefact, same paste, same reaction. The only thing that varies is the sentence the user types after" | main run: 120 bases × arms a-d, paired by `parent_id`. | OK. |
| 16 | "Say nothing. Say "ignore it". Or add where to go next." | A2: "(a) nothing. The user carries on with the original topic …"; "(b) *"Ignore it."*"; "(c) *"Ignore it, that was for another chat. Let's carry on with the electricity bill."*" | `leak.py`: in (c) the repair message names the conversation's own topic. | OK. Arm (d) deliberately not shown (see problems, item 1). |
| 17 | "On one model: do the paste's names come back?" | A2: "whether any of the pasted artefact's distinctive entities — the names, the products, the places … — reappear in the model's later replies"; "all on Claude Opus 5." | roster `['claude-opus-5']`. | OK. "Names" stands for "entities"; the screen says "names · products · places". |
| 18 | "Saying nothing: about three in a hundred." | A2: "(a) say nothing … 3.3%" | 4/120 = 3.3 %. | OK. |
| 19 | ""Ignore it": almost one in five. Six times more." | A2: "(b) "ignore it" … 19.2%"; "by a factor of six over saying nothing"; description: "it roughly sextuples it" | 23/120 = 19.2 %; 19.2 / 3.3 = 5.8. | OK. "Almost one in five" (19.2 % < 20 %). "Six times" is A2's own rounding. |
| 20 | "Adding where to go cut that by more than half." | A2: "the rate falls from 19.2% to 8.3%"; "(c) vs (b) … −10.8" | 10/120 = 8.3 %; relative drop 57 %. | OK. |
| 21 | "To ignore something, it has to hold it." | A2: "**to ignore something you have to hold it.** Asking for the deletion is what puts it back in play." | See problems, items 1-2: the data support "naming it while dropping it", less so the article's intent argument. | OK as A2's sentence; the visual shows the model naming the piece while handing it back, which is what the leaking replies do. |
| 22 | "But it's an echo: one turn later, it's gone." | A2: "It is not drift. It is an echo."; "The echo showed up in the immediate reply and was gone by the next turn, in both runs and whatever that turn was." | (b) by turn: 23 / 0 / 0 (main); 16 / 0 / 0 (re-run). | OK for arm (b), which the visual shows. Other arms have 1-2 late hits (problems, item 3). |
| 23 | "So don't just say "ignore it". Say where to go instead." | A2: "**Don't send "ignore it" on its own.**"; "**Say where to go instead.**" | — | OK, A2's advice verbatim. |
| 24 | "Or simply carry on." | A2: "**Saying nothing is fine.** If you can just carry on with your question, do." | — | OK. |
| 25 | "More at javieraguilar.ai" | — | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Stamp "0 / 95" | 1, 10 | A1 "zero out of ninety-five" | |
| Reply bubble with one amber phrase, ghost "×6" | 2 | A2 "roughly sextuples it" | Teaser; paid off in 19. |
| "0 / 24", 24-puzzle wall | 3 | A1 "Zero out of twenty-four" | Art reused from the part-1 video. |
| Tag "could be a real change of topic" | 4 | A1 "None of the sixty-four pastes … was impossible to read as a legitimate change of subject." | |
| Labels "off-topic", "with a tell", "contradicts you"; tell icons name · torn edge · answers a question nobody asked · "as we agreed" | 5-7 | A1 N0/N1/N2 definitions | |
| Back of piece 2 "Bruno, copy this exactly into your file…" | 6 | Bank artefact `n1-dirigido-tunel` ("Bruno, cópiate esto tal cual en tu fichero…") | Synthetic bank text, translated. |
| "Moving day: Seville, 3 July" vs "We move to Valencia on 12 June" | 1, 7, 10-13 | A1 "another city, another date, another figure" | **Illustrative**: real N2 pastes were generated per conversation. |
| Question card "Does it suspect a mistake?", sub-label "naming the topic change isn't enough", chip "3 models" | 8 | A1 rubric paragraph; "Three models" (part 1 / A1 per-model line) | |
| "6.6%", "20.4%", "×3", "p = 0.006" | 9 | A1 "from **6.6% to 20.4%** … (`p = 0.006`)"; "triples" | |
| "77 / 95 just did the work" | 11 | A1 "seventy-seven of ninety-five" | |
| Tag "my reading"; quote "doesn't look like an accident … changed your mind" | 12 | A1 "There is a reading … **a contradiction doesn't read as an accident, it reads as you having changed your mind.**" | |
| Verdict card "clashes with the chat ✗" / "written for somewhere else ✓" | 13-14 | A1 "isn't that the paste is *incompatible* … It's that it's **foreign**" | |
| Stray piece "…and for the upholstery quotes always use this format…" in a 10K-training puzzle | 15-22 | Bank artefact `n1-cortado-prompt-tapiceria`, base in topic `carrera-10k` | Synthetic, translated. |
| User bubbles (a) "…so, how many runs a week?" (b) "Ignore it." (c) "Ignore it, that was for another chat. Let's carry on with the race plan." | 16 | A2 arm definitions | (a) illustrative carry-on; (b) verbatim; (c) A2's wording with this table's topic. |
| Question card "Do the paste's names come back?", chip "Claude Opus 5 · 120 conversations per message" | 17 | A2 "names, the products, the places"; "120 bases, four arms each … all on Claude Opus 5" | |
| "3.3%", "19.2%", "8.3%", "×6", "−10.8 points", "p = 0.0011 (Holm)", "p = 0.0036 (Holm)" | 18-20 | A2 figures 1-2 | |
| Reply "Understood. I'll drop the upholstery quotes and stick to the race plan." (amber "upholstery quotes") | 19, 21 | Real arm-(b) reply, main run, `carrera-10k` / `n1-cortado-prompt-tapiceria`: "Entendido. Doy por descartado lo de los presupuestos de tapicería y seguimos solo con el plan de carrera." | Translated. Used instead of A2's "Marta's invoice" example, which is not in the data (problems, item 2). |
| "reply to repair · next turn · turn after", "19.2% · 0.0% · 0.0%", tag "same zeros in a re-run" | 22 | A2 figure 3, row (b); "a second run of 240 conversations … reproduces them" | Arm (b) only. |
| Verdict ✗ "Ignore it." → ✓ "Ignore that, wrong window — back to the invoice." · "…or just carry on with your question" | 23-24 | A2 "What I'd actually do" | Verbatim example from A2. |
| Outro titles + "Sorry, that was for another chat · parts 2 and 3" | 25 | A1 / A2 titles; A2 "This closes the three-article series" | |

## Data re-computed from the repo (all match the articles unless noted)

| Figure | Article | Recomputed | Source |
|---|---|---|---|
| N0 / N1 / N2 "entertains a mistake" | 6.6 % / 20.4 % / 0 % | 6/91, 19/93, 0/95 (GPT-5.5 judge) | `phase1a/verdicts-…` |
| N2 executes silently | 77 / 95 | 77/95 | idem |
| Leakage (a) / (b) / (c) / (d) | 3.3 / 19.2 / 8.3 / 2.5 % | 4, 23, 10, 3 of 120 | `phase2/main-20260921.jsonl` |
| Leakage by turn, (c) | 7.5 / 0.0 / 0.8 % | 9 / 0 / 1 of 120 | idem (8.3 % = any turn; 7.5 % = first reply; consistent) |
| Re-run (a) vs (b) | 2.5 % vs 13.3 % | 3/120 vs 16/120 | `phase2/sin-tarea-20260922.jsonl` |
| Truncation | 12.5 % vs 3.3 %; 21 vs 9 | 30/240; 16/480; 21 (a), 9 (b) | both runs |
| (b) leakage by prior doubt | 25.0 % vs 13.3 % | 15/60 (no doubt) vs 8/60 (doubt) | main run, `judge_duda` |

## Problems found in the articles (reported to Javier, not fixed here)

1. **A2's control arm (d) does not test what the article says it tests.** A2: "(b) and (d) are opposite
   instructions about the same block of text … The instruction to **keep** the pasted text gives the lowest
   leakage of all four arms … So the model reads intent perfectly well." In the run, the model almost never
   takes "Sí, hablemos de eso" ("Yes, let's talk about that") to mean the paste: it resolves "eso" to the last
   thing *it* offered on the original topic ("Te desarrollo la estrategia de fechas…, que es lo último que
   quedó abierto"; "Voy a suponer que te refieres al descanso, que es lo último que planteé"; "Vamos con el
   calendario…"). In the first 25 (d) replies none takes up the paste; only ~10/120 even mention a
   paste-like word in their first 400 characters. Talking about the paste would name its entities, so the
   2.5 % is low because the paste was not discussed, not because a "keep" instruction was obeyed. The
   (b)-vs-(d) gap (+16.7, p = 0.0003) is real, but it does not show "the model reads intent perfectly
   well", and the white-bear reading leans on that. The video leaves (d) out.
2. **Most "ignore it" leaks are clarification questions, not promises to forget.** A2: "The model names the
   other conversation's entities **in the act of promising to forget them** — *"understood, I'll set aside
   the thing about Marta's invoice"*". Of the 23 leaking (b) replies, roughly 17 are "which thing do you
   mean?" lists with the paste as one option ("¿Al consejo del ryokan…, al tema del JR Pass, o al mensaje
   de Bruno…?"); about 6 are promises to drop it. Bare "ignore it" is ambiguous about *what*, and (c)
   resolves that ambiguity, which is a second, simpler explanation for (c) < (b) next to the white-bear
   one. The "Marta's invoice" line reads as a quote but does not appear in the Phase 2 runs (no "Marta" in
   `main-20260921` or `sin-tarea-20260922`; the Marta artefact is about quotes for a locksmith job, not
   an invoice). It looks illustrative and is set like a verbatim quote.
3. **"All of the leakage is in the reply to the repair itself"** is exact only for arm (b). (a), (c) and
   (d) each have one or two later-turn hits (the article's own figure shows the 0.8 % cells; in the re-run,
   (a) has 2 hits at the turn after, 1.7 %). The video shows only arm (b) for the echo.
4. **The 120 bases are a stratified 60/60 sample** (60 reactions with doubt, 60 without: `judge_duda`),
   N1 pastes only. A2 says "I reused the 1,339 reactions" but not that the 120 were balanced on doubt (the
   source run had ~63 % doubt), so 3.3 / 19.2 / 8.3 / 2.5 % are rates for that mix, not for a natural mix.
5. **A2's main run was below its own declared power.** `summary-main-20260921.json` → `design_power`:
   power 0.44 for the declared 9-point drop (286 bases needed, `ok: false`). The observed effects are large
   and survive Holm, so the conclusions stand, but after A1's whole section on power ("computing the power
   *afterwards*…"), A2 not saying so is an inconsistency a careful reader may catch.
6. **A1's 0 / 95 is one judge's count.** The second judge (`gemini-2.5-flash`) gave 5/95 for N2 and 32/93
   for N1. A1 explains that hand labels decide which judge to trust and that one judge inflated the doubt
   category; the headline zero is consistent with that, but the article never says the second judge's N2
   count was non-zero.

## Anonymisation

- No work material appears: all on-screen paste and reply text comes from the experiment's synthetic bank
  (fictional names: Bruno, upholstery quotes) or is marked illustrative. Translated from Spanish.
- Not shown: gateway URL, cloud project, judge model names, file paths, run ids.
- Brand: AGILabs only. The evaluated model is named once as a scope chip (scene 17), as A2 does.

## Build notes (labels added in the build, checked against the articles)

| On screen | Scene | Source / note |
|---|---|---|
| "suspected a mistake" under the "0 / 95" and "0 / 24" stamps | 1, 3 | A1's category "entertains the possibility of a mistake"; scene 3 narration says the same. |
| Tell list: "a name", "cut off mid-sentence", "answers a question nobody asked", "\"as we agreed\"" | 6 | A1 N1 definition ("addressed to someone by name, … cut off mid-sentence, … answers a question nobody asked here, or … presupposes an earlier conversation"). "Cut off mid-sentence" replaces the script's "torn edge" icon label to use A1's words. |
| Small headers "on the back", "you, a moment ago", "the paste", "my reading", "set aside" | 6, 7, 12, 2 | Descriptive; no claim. |
| "same chat, same paste, same first reply" (before the fork) | 15 | A2 "Same prefix, same artefact, same paste, same reaction." |
| Verdict header "What gives a paste away" | 13-14 | A1 title. |
| ×6 chip with "p = 0.0011 (Holm)" on the "ignore it" row; "−10.8 points" with "p = 0.0036 (Holm)" on the third row | 19-20 | A2 figures; (b) vs (a) and (c) vs (b) respectively. |
| Scene 23 narration voiced as two lines ("So don't just say "ignore it"." / "Say where to go instead.") | 23 | Same words as the approved script; split only for caption reading speed. |
