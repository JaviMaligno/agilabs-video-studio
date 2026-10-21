# Fact-check: Three Judges, Three Rankings (EN vertical) · v1.0

Source: `src/content/blog/en/three-judges-three-rankings.md` on `origin/main` of
personal-website (pubDate 2026-07-30). Data: `experiments/judge-bias/results/cross-family.json`
on the same branch, re-analysed with the repo's `analyze.py` (`python3 analyze.py
results/cross-family.json`): every table the video uses reproduces exactly (ranking, self-
preference with CIs and neutral baseline, subjectivity split, kappas). Scope: narration, plus
the numbers and text shown on screen. Visuals that are illustrative are listed at the end.

## Narration

| # | Claim (spoken) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "I gave three AI judges the same answers. I got three different rankings." | Description: "I ran the same 45 blinded comparisons past a GPT, a Grok and a Claude judge. Each produced a different ranking"; "Three judges, three different orderings." | OK. First person, as the article. "Same answers": "Same answers. Same blinded prompt. Both presentation orders." |
| 2 | "Can a GPT judge fairly compare a GPT system with a Claude one?" | "The question came out of a conversation about evaluating two systems, one built on GPT and one on Claude. If you use a GPT judge, is the comparison still fair?" | OK. Generic, no work context named. |
| 3 | "GPT, Grok and Claude each answered fifteen tasks, from checkable code to pure taste." | "Fifteen tasks, split evenly across three levels of subjectivity: objective ones with a checkable answer (parse a duration string, fix a median bug, merge intervals) … subjective ones (error-message copy, a postmortem opening, explaining eventual consistency to a PM). Three models answer all fifteen" | OK. The three objective tasks are all code (`tasks.json`: obj-parse-duration, obj-fix-bug, merge intervals …), so "checkable code" is accurate for that end; "pure taste" = the article's "the criterion is taste". |
| 4 | "Then each one judged every pair of answers blind, twice, with the order swapped." | "Then each of those three models judges every pair of answers, blinded — no model names anywhere in the prompt"; "Every comparison is judged twice, with the two answers swapped" | OK. |
| 5 | "No names. But each model writes in a recognisable house style." | "The judge never sees a model name. But it doesn't need one: every family has a recognisable house style" | OK. Stated as the article's premise, not as a measured result (the video never claims the judges *recognised* the style; the tint/glow is the hypothesis pictured). |
| 6 | "So each judge is also a contestant, grading its own work blind." | "With three judges that double as the three generators"; "your judge is a participant" | OK. Design fact: each judge judged pairs containing its own answer. |
| 7 | "Each judge gave a different ranking of the same 45 comparisons." | "Three judges, three different rankings of the same 45 comparisons" (figure title); "Three judges, three different orderings." | OK. Orders verified: GPT judge gpt > claude > grok; Grok judge gpt > grok > claude; Claude judge claude > gpt > grok. 45 = 15 tasks × 3 pairs. |
| 8 | "Two of them crowned GPT. The Claude judge crowned Claude." | "Two of them crown GPT-5.5; the third crowns itself." | OK. |
| 9 | "Every judge rated its own answers higher than the other two did." | "Every judge puts itself higher than the other two put it." | OK. 85.0 vs 58.3 / 55.0; 53.3 vs 30.0 / 33.3; 61.7 vs 35.0 / 38.3. |
| 10 | "On the same pairs, each favoured its own by twenty to thirty points over its peers." | "how much more often a judge picks its own answer than its peers pick that same answer, on the same comparisons"; deltas +28.3, +25.0, +21.7pp; "All three positive, all three intervals excluding zero, all three about the same size." | OK. "Twenty to thirty" is the word form of 21.7-28.3. Peer baseline; the next line hedges it. |
| 11 | "Against a judge with no stake, it shrinks; for Grok, it's no longer clear." | "Restricting the baseline to the judge with no stake in the pair knocks about a third off every number. The effect survives that correction for GPT-5.5, marginally for Claude, and becomes indistinguishable from zero for Grok." | OK. Keeps the article's hedge, which it calls "the one I would quote". "Marginally for Claude" is shown on screen (CI [+0.0, +28.3]), not voiced. |
| 12 | "And the bias grows with how subjective the task is." | Heading "Self-preference is real, and it scales with subjectivity"; figure title "A judge's bias towards its own answers grows with how subjective the task is" | OK. Article's own wording. |
| 13 | "On tasks with a checkable answer, it was small or absent." | "On tasks with a checkable answer, self-preference is small or absent — Claude Sonnet 4.6 is actually harder on itself than a neutral judge is." | OK. Verbatim claim. |
| 14 | "On matters of taste, thirty points or more." | "On tasks where the criterion is taste, it reaches +30 to +48 percentage points."; table subjective +42.5 / +30.0 / +47.5 | OK against the article (lower end 30.0, so "or more" holds for all three). See "Problems found in the article" #1: these are peer-baseline deltas. |
| 15 | "There, the judges agreed no better than chance." | Heading "On subjective tasks, judges agree at chance"; "On the subjective tasks all three pairs are indistinguishable from chance." | OK. Kappas −0.01, −0.03, +0.05. |
| 16-17 | "So a judge from a family you're testing is close to harmless on objective work… and close to unusable on subjective work." | "a judge from the same family as one of the systems you're comparing is close to harmless on objective work and close to unusable on subjective work." | OK. Article's rule, lightly shortened. |
| 18 | "On taste, your judge is a participant." | "If it is "which error message reads better", your judge is a participant." | OK. |
| 19 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Chips "GPT-5.5", "Grok-4.3", "Claude Sonnet 4.6" | 3 on | "Three models answer all fifteen: GPT-5.5, Grok-4.3 and Claude Sonnet 4.6." | |
| "fix a bug" · "summarise" · "error-message copy" | 3 | Task list in "The setup, in one paragraph" | One example per subjectivity level. |
| "Claude seat: Sonnet 4.6, a generation behind the other two" | 3 | "the Anthropic seat is Sonnet 4.6, a generation behind the other two" | The article's main caveat, kept on screen. |
| "45 comparisons", "every pair · both orders", "blind" | 4, 7 | Figure title; "judged twice, with the two answers swapped"; "blinded" | |
| "JUDGE = CONTESTANT" | 6 | "three judges that double as the three generators" | Paraphrase of a design fact. |
| Podium orders and heights; 85%, 58%, 55% / 35%, 38%, 62% / 30%, 53%, 33% | 7-9 | Ranking table; the article's own ranking figure uses the same rounding | Win score: 1 = win, 0.5 = tie or flip, per `analyze.py`. |
| "+28.3 pp [+16.7, +40.0]", "+25.0 pp [+12.5, +36.7]", "+21.7 pp [+9.2, +35.8]" | 10 | Self-preference table, Delta and 95% CI | |
| Neutral: "+21.7 [+8.3, +35.0]", "+15.0 [+0.0, +28.3]", "+13.3 [−1.7, +30.0]" | 11 | Self-preference table, "vs uninvolved judge only" | Grok bar muted with "?" = "indistinguishable from zero". |
| "+17.5 · +7.5 · −2.5", "+25.0 · +27.5 · +30.0", "+42.5 · +30.0 · +47.5" (pp), "harder on itself" | 13-14 | Subjectivity table; "Claude Sonnet 4.6 is actually harder on itself" | Order GPT / Grok / Claude, as the article's table and figure. |
| "κ −0.01 · −0.03 · +0.05", "0 = chance" | 15 | Kappa table, subjective column; "1.0 is perfect agreement, 0.0 is chance" | |
| VERDICT: "close to harmless" / "close to unusable" | 16-17 | The rule sentence | |
| "one run · 15 tasks · one model per family" | 17 | "What this doesn't show": "One model per family"; "It's one run"; "Fifteen tasks … still small" | |
| "participant" (KeyQuote) | 18 | "your judge is a participant" | |

## Illustrative, not claims

- The tinted ink of each answer card ("house style") and the judge's clipboard glowing at its
  own tint: a picture of the article's hypothesis ("a judge that learned to produce a style may
  well reward it"). The experiment measured self-preference deltas, not recognition.
- The balance scale, the answer-key weight on objective tasks and the "taste" cloud on
  subjective ones: a picture of why bias can grow with subjectivity, not a measured mechanism.
- The podiums' motion, crowns and the coins in scene 15: stylised. Podium heights and the bar
  values are data.
- Card text is placeholder lines, not the real answers.

## Problems found in the article (vs its own data)

All tables reproduce exactly from `cross-family.json`. The problems are of interpretation:

1. **The subjectivity split, the article's headline rule, uses the baseline the article itself
   says over-counts.** The by-subjectivity table (+30 to +48pp on subjective) is computed
   against both peers, including the opponent, which section 2 says inflates every delta
   ("Anyone measuring self-preference with a judge panel drawn from the models under test is
   over-counting unless they do this"). Recomputed against the uninvolved judge only (same
   script logic, `analyze.py`'s `neutral_paired` split by level): GPT-5.5 +20.0 / +15.0 /
   +30.0, Grok-4.3 +0.0 / +20.0 / +20.0, Claude Sonnet 4.6 −5.0 / +20.0 / +30.0. Subjective is
   still the highest (or tied) for every judge, so the shape survives, but the magnitude on
   taste becomes **+20 to +30**, not +30 to +48, and GPT-5.5 is no longer monotone (medium <
   objective). Each cell is 10 comparisons with no CI reported. The video's "thirty points or
   more" (scene 14) is faithful to the article but would change if the article does.
2. **"knocks about a third off every number"**: GPT-5.5 drops 28.3 → 21.7 (−23 %, about a
   quarter); Claude −40 %, Grok −39 %. "Between a quarter and two fifths" would be exact.
3. **"Fifteen tasks and six length probes is 2.5× the pilot"**: tasks are 2.5× (15 vs 6),
   length probes 2× (6 vs 3).
4. **"On the subjective tasks all three pairs are indistinguishable from chance"** and "agree
   exactly as often as two coin flips": the kappas are point estimates on 15 comparisons per
   pair per level, with no CI or test reported; the claim is plausible but not shown. Kappa is
   computed on resolved verdicts with a third "neither" label (ties, flips, unstable), so
   Grok-4.3's 35.6 % flip rate feeds directly into its pairs' kappas.

None of these is in the narration except #1 (scene 14, flagged).

## Review pass (skeptical re-read, v1.0)

- Scene 4: "every pair" → "every pair of answers" (a newcomer did not know pairs of what).
- Scene 5: "No names on the page." → "No names." (length).
- Scene 7: "its own ranking" → "a different ranking": "its own" read as self-preference one
  beat before scene 9 earns it.
- Scene 11 kept although it costs ~5 s: without it the video quotes only the peer-baseline
  delta the article explicitly says not to quote.
- Position bias and the length section deliberately out of scope (title/description spine
  only); the article covers them.

## On-screen text added in the build (v1.0 render)

| On screen | Scene | Source | Note |
|---|---|---|---|
| Question cards "Is a GPT judge fair?" (2-11), "Does the task matter?" (12-15) | 2-15 | "If you use a GPT judge, is the comparison still fair?"; heading "it scales with subjectivity" | Questions, not claims. |
| Stamp "YES" on "Does the task matter?" | 14 | "Self-preference is real, and it scales with subjectivity" | Lands after "thirty points or more", i.e. after the evidence. |
| "SAME BLIND ANSWERS" | 1 | "Same answers. Same blinded prompt." | |
| "blind", "every pair · both orders", counter to "45 comparisons" | 4 | as above | The counter only counts up to the article's 45. |
| "no names" → "house style" | 5 | "The judge never sees a model name … every family has a recognisable house style" | |
| "its own work, blind" | 6 | as narration 6 | |
| "Same 45 comparisons. Three rankings."; "JUDGE" over each chip; "85%" + "vs 58 / 55" etc. | 7-9 | Ranking table, figure rounding | "vs" values are the other two judges' scores for the same generator, in GPT / Grok / Claude judge order. |
| "How much more each judge picks its own answer than its peers do"; "same pairs · bars with 95% CI"; band "20–30" | 10 | "how much more often a judge picks its own answer than its peers pick that same answer, on the same comparisons" | Band = the spoken "twenty to thirty". |
| "Baseline: the judge with no stake in the pair"; Grok row muted, "? indistinguishable from zero" | 11 | "becomes indistinguishable from zero for Grok" | Dashed outline = the previous (peer) bar. |
| "own-answer bias, pp"; legend GPT / Grok / Claude; "objective → medium → subjective"; "✓ checkable", "taste"; "harder on itself" | 12-14 | Subjectivity table; "Claude Sonnet 4.6 is actually harder on itself" | Bars: judge colour; the scale is illustrative (see below). |
| "GPT · Grok κ −0.01", "GPT · Claude κ −0.03", "Grok · Claude κ +0.05", "0 = chance" | 15 | Kappa table, subjective column | Pairs as the article's table. |
| "a judge from a family you're testing is…"; "checkable answer" / "a matter of taste" under the panel heads | 16-17 | The rule sentence; "objective ones with a checkable answer"; "the criterion is taste" | |
| Outro credit "Harness, raw judgments: experiments/judge-bias" | 19 | Article footer | |
