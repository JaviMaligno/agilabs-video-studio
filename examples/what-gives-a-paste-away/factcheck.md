# Fact-check: Don't Just Say "Ignore That" — reel 12 (EN, script v5, 2026-11-12)

Source: A2 `dont-just-say-ignore-it` (personal-website, pubDate 2026-10-15) and the run
`llm-wrong-paste/runs/phase2/main-20260921.jsonl` (120 conversations per arm, Claude Opus 5).
A1 claims (paste levels, 0 / 95, Valencia/Seville) are out of this reel; their check is in git
history with the v1 video.

## Narration and screen

| Line | Claim | Check |
|---|---|---|
| 1 | "ignore that" makes it worse | (b) 19.2 % vs (a) 3.3 % leakage, p = 0.0011 (Holm). Hook scoped by line 8 to the next answer. |
| 2-3 | wrong-chat paste, sofa repair quote into a 10K plan | The run's topic `carrera-10k` with artefact `n1-cortado-prompt-tapiceria` ("presupuestos de tapicería"). "Sofa repair quote" is a plain-English rendering of "upholstery quotes" (expert read: accepted). |
| 4 | on purpose, over and over; three ways to move on | 120 conversations per arm; the reel shows arms (a), (b), (c); arm (d) ("yes, let's talk about that") is left out (problem 1). |
| 5-7 | carry on / "Ignore that." / "Ignore that, back to the race plan." | Arms (a) continue the task, (b) bare "ignore it", (c) "ignore it, that was for another chat; let's carry on with …". (c) shortened on screen, same content. |
| 8 | one AI; its next answer | Claude Opus 5 only. Leakage of (b) is all in the reply to the repair turn (19.2 % → 0.0 % → 0.0 % in later turns), so "next answer" is exact. |
| 9 | carrying on: hardly ever · "1 in 30" | 4/120 = 3.3 % ≈ 1 in 30. |
| 10 | almost one in five · ×6 | 23/120 = 19.2 % (1 in 5.2: "almost" one in five). 19.2 / 3.3 = 5.8 → A2 "roughly sextuples". |
| 11 | one in twelve | 10/120 = 8.3 % = 1 in 12. |
| 12 | mostly it asks which thing you mean | Of the 23 leaking (b) replies, about 17 are "which do you mean?" lists that include the paste (problem 2). On-screen question is illustrative (tagged), modelled on the real ones (e.g. viaje-japon: "¿Al consejo del ryokan…, al tema del JR Pass, o al mensaje de Bruno…?"). |
| 13 | or it promises to drop it, by name | About 6 of the 23. The bubble is the real carrera-10k / tapicería (b) reply, translated: "Entendido. Doy por descartado lo de los presupuestos de tapicería y seguimos solo con el plan de carrera." Tagged "a real reply". |
| 14 | carry on; or say where to go; not just "ignore that" | Order by leakage: (a) 3.3 % < (c) 8.3 % < (b) 19.2 %. A2's advice "say where to go instead"; (c) vs (b) p = 0.0036 (Holm). |

No p-values, percentages or decimals on screen; numbers shown as "1 in N" and "×6".

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

- All on-screen paste and reply text comes from the experiment's synthetic bank or is tagged
  illustrative; translated from Spanish. No work material.
- Not shown: gateway URL, judge models, file paths, run ids. The evaluated model is named once as
  a scope chip ("tested on one AI: Claude"), as A2 does.
