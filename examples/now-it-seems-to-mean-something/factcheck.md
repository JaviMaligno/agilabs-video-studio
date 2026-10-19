# Fact-check: The Definition Looked Complete (v1.1)

Source: `src/content/blog/en/now-it-seems-to-mean-something.md` on `origin/blog/now-it-seems-to-mean-something`
in the website repo (pubDate 2026-12-14; not yet merged). Cross-checked against the study report
`experiments/prompt-meaning/v4/results/findings.md` on the same branch and the article's two figures.
Scope: narration, plus the numbers and text shown on screen. Visuals are illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "This note supported 16 correct reviews. It also changed what one flag meant." | Description: "Its note supported 16 correct change reviews, yet had turned a condition in the program into a broader rule."; "an agent can work well from an explanation that has already changed the operational meaning of what it explains." | OK. "supported" is the description's verb. "changed what one flag meant" = "changed the operational meaning"; the video never says the note was "wrong" or "false". |
| 2 | "An agent summarised code from one of my projects for a reviewer agent." | "An agent received code, documentation and tests from one of my projects. Its task was to prepare a note for another agent that would review maintenance changes." | OK. "summarised" = description's "summarised real code for another agent". Omits docs/tests for length; not a claim against them. |
| 3 | "In the code, the flag is set only inside the repair loop." | "initialises the flag to `False` and changes it inside the repair loop"; "This flag can only be set inside the repair loop." | OK. Verified in the excerpt: the only assignment to `True` is inside `while ...`. |
| 4 | "The note turned that into a rule about the data alone." | "The note had turned a description of what happens **inside a procedure** into a definition that could be applied directly to the data. The code requires entering the loop; the shortened definition only requires remaining errors outside the permitted set." | OK. "rule about the data alone" condenses "a definition that could be applied directly to the data". |
| 5 | "The loop condition was missing from the first note. Two handoffs kept it that way." | "The loop-entry condition was already missing from the first note. Subsequent handoffs preserved that shortened definition."; "It passed through two further handoffs and remained clear." | OK (v1.1: was "The loop was gone", which read as if the loop itself were missing; now names the condition, as the article does). "kept it that way" = "preserved that shortened definition". Two further handoffs: first summary → reviewer brief → session note. The visual does not show gradual widening ("this case did not show a correct rule gradually deteriorating at each handoff"). |
| 6 | "With the final note, two models reviewed all 16 changes correctly, both times." | "With the final note, two models correctly reviewed all 16 proposed changes in the initial test, in both repetitions."; "the final note supported correct reviews of all 16 initial proposals in the evidence task, with both models and two repetitions." | OK (v1.1: "got all 16 changes right" → "reviewed all 16 changes correctly", the article's verb). "both times" = "in both repetitions". (findings.md: 64/64 decisions; not used.) |
| 7 | "Then I built one case that splits note from code: zero iterations allowed." | "When a case was constructed to separate what the note said from what the code did"; "the maximum number of iterations was zero"; "The check was designed after examining the summaries: it is an exploratory probe of an observed omission." | OK. "Then" matches the article's order (probe designed after reading the summaries). v1.1: "splits the two" → "splits note from code" = "separate what the note said from what the code did". |
| 8 | "The loop never runs, so the code returns False." | "With zero iterations allowed, the loop never runs. The flag remains `False`"; "Under the current code, that proposal must be rejected. The expected result was checked by executing the original function with a simulated evaluation." | OK. |
| 9 | "GPT accepted it, citing the note's definition." (spoken "G P T") | "GPT accepted incorrect behaviour and justified it by referring to that same definition."; "With the summaries, GPT accepted the change in both repetitions of all three conditions." | OK. "it" = the proposal to return True (scene 7-9 visuals). Claude's mixed result is shown on screen in scene 11, not narrated; narration names GPT only, as the intro of the article does. |
| 10 | "Renaming the flag didn't fix it." | "`evidence_capped_failure` became `flag_q7`"; "Opaque labels do not fix the incorrect acceptance."; "Changing the names did not fix this case's error." | OK. "the flag" — the rename replaced several labels, the flag among them ("Among the replacements"). Narration names the one that matters; not a claim that only the flag was renamed. |
| 11 | "One exploratory case, run twice per model: not a rate." | "These are repetitions of **one case**, not independent discoveries or an estimate of how often handoffs fail this way." | OK. Keeps the article's main hedge; v1.1 adds "exploratory" ("it is an exploratory probe of an observed omission") and "run twice per model" (fig. 2 caption: "two repetitions of the same case per condition and model"). "Designed after examining the summaries" is carried by "Then" in scene 7 plus "exploratory". |
| 12 | "The missing sentence was short: this flag can only be set inside the repair loop." | "The missing sentence was short: “This flag can only be set inside the repair loop.”" | OK. Verbatim. |
| 13 | "More at javieraguilar.ai." | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Counter "16", block "16 / 16", chips GPT-5.6 Sol / Claude Opus 5, "×2 runs" | 1, 6 | "two models correctly reviewed all 16 proposed changes in the initial test, in both repetitions" | |
| Labels "indices", "full set", "leakage", "infra error" on 4 of the 16 cards | 6 | "preserving original indices, evaluating against the full set, preventing positive examples from leaking into the background, and distinguishing an infrastructure failure" | One-word condensations; which card is which is illustrative. |
| Code excerpt, `= False` tag, gate `iterations < max_iters`, switch `evidence_capped_failure = True` | 2-3 | Article's code block, verbatim | Javier's public repo; no anonymisation needed. |
| First-note clause | 4 | "> An `evidence_capped_failure` occurs when gate accuracy is below 1.0 but no remaining attributable failure belongs to the allowed set. It stops refinement immediately." | Verbatim (cropped wrap). If a gist line is used instead, it is a paraphrase. |
| Final-note clause | 5-12 | "> Gate accuracy below 1.0 with no attributable allowed failure is `evidence_capped_failure` and stops refinement." | Verbatim. |
| Chain "GPT · first note → Claude · reviewer brief → GPT · final note", tag "lost here" on first hop | 5 | Fig. 1; "GPT-5.6 Sol wrote the first summary. A fresh Claude Opus 5 session turned it into a reviewer brief, and another fresh GPT session prepared the next agent's session note."; "already missing from the first note" | Card shrinking = "Length targets became progressively shorter". No word targets shown. |
| Token "2 errors, both outside the allowed set · no infra problem · max iterations: 0" | 7 | "two errors remained, both outside the permitted set, there was no infrastructure problem, and the maximum number of iterations was zero" | |
| (none) | 7 | — | v1.1 reviewer decision: archive-only probe values (accuracy 0.8, error indices, allowed set) are NOT shown; on-screen numbers come from the article only. |
| "code → False", chip "checked by running the function" | 8 | "The expected result was checked by executing the original function with a simulated evaluation." | |
| Proposal "return flag = True", GPT ACCEPT ×2, quote strip "…returning evidence_capped_failure with zero repair iterations preserves the specified behavior." | 9 | "The proposal was to return `evidence_capped_failure=True`"; GPT's reason quoted verbatim (cropped at the front) | Shown over the final note; the article says this quote is "one of its reasons" with the summaries. findings.md confirms it was from the final (third) note. |
| `evidence_capped_failure` → `flag_q7`; GPT ACCEPT ×2, Claude ACCEPT ×2 | 10 | "became `flag_q7` in both the instructions and the proposal"; GPT "accepted the change in both repetitions of all three conditions"; Claude "with opaque labels it accepted twice" | |
| Grid 4 × 4 (Invalid/Reject · Reject/Reject; Accept/Accept · Context/Context; Accept/Accept · Accept/Context; Accept ×4), tag "1 case · 2 repetitions per model" | 11 | Fig. 2 and its caption "These are two repetitions of the same case per condition and model."; body text on GPT's invalid dossier response and Claude's per-condition results | Row label "Final note" where fig. 2 says "Third note" (same object; the body says "final note"). |
| Sentence written into the bracket, shadow back inside the walls | 12 | "This flag can only be set inside the repair loop." | The snap-back is a metaphor for the fix the article proposes in words. v1.1: no verdict stamp or token flip after the snap-back, so the video does not imply an agent was re-tested with a corrected note (the article did not test one). |

## Anonymisation

- All code and identifiers come from Javier's own public project (`code-world-models`), already printed
  in the article. No employer, client or work material is involved, so nothing is substituted.
- No ticket ids, environment names or people. Mathias Strasser's post is not shown or named (credit goes in the post text).
- No personal name on screen; brand AGILabs only. `evidence_capped_failure` and `flag_q7` appear on screen only, verbatim from the article.
- Model names appear as the article writes them (GPT-5.6 Sol, Claude Opus 5), as neutral chips.

## Deliberately left out

- The two refused chains (Claude-started starts returning empty responses), the 76 calls and USD 4.97,
  the geometry-area lexical follow-up (19 valid responses): true and in the article, but not needed for
  the story in 60 s.
- "64/64" and "128/126/126/125" totals from findings.md: not in the article.
