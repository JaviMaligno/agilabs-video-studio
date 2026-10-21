# Three Judges, Three Rankings — article video (EN) · script draft v1.0

Article: three-judges-three-rankings (javieraguilar.ai, EN, `pubDate` 2026-07-30; read from
`origin/main` of personal-website). Vertical 9:16, target ~83 s (ceiling 85 s), 209 counted
words. ES column left empty (EN-only for now). Voice: the template default.
Data on screen: the article's tables, re-derived from the raw judgments with the repo's own
script (`python3 analyze.py results/cross-family.json` in `experiments/judge-bias`, every
figure reproduces exactly; see `factcheck.md`).

Scope: the video tells the article's spine only, the one in its title and description: same
45 blinded comparisons → three rankings → each judge favours its own → the effect grows with
subjectivity → on taste the judges agree at chance → verdict. Position bias (Grok's 72.4 % /
flip rate) and the length section are left to the article; the swap of presentation order
stays only as part of the fair-test setup.

## Central visual metaphor: the judge's scale and the ink only it recognises

Three **judge seats** sit across the top of the stage, each a chip with a clipboard in its
family colour (the article figures' palette: GPT-5.5 blue, Grok-4.3 orange, Claude Sonnet 4.6
green). Under them, **answer cards** arrive in pairs. Every card's name strip is blacked out
(`████`, "blind"), but its text is written in a faint tint of its author's colour: the
**house style**. The viewer can see the tint; so can the judge of the same colour, and only
that one: when a judge looks at its own family's card, its clipboard glows the same colour.

Under each judge hangs a **balance scale**. Judging = the scale tipping towards one card. The
mechanism the video turns on:

- **Objective task**: an **answer-key weight** ("✓ checkable") sits on the right card's pan.
  The ink glow is there, but the key outweighs it; the scale tips by the key.
- **Subjective task**: the key dissolves into a cloud labelled "taste". Nothing anchors the
  scale, so the judge's own-ink glow tips it towards its own card.

The payoff picture: **three podiums**, one under each judge, built from the real win scores;
the same three cards, stacked in three different orders.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | I gave three AI judges the same answers. I got three different rankings. | | **Cold open.** Three judge seats light up across the top. One stack of blind answer cards fans out under each (same cards, same `████` name strips). On "three different rankings" three podiums rise at once, one under each judge, each with a different card on top (GPT / GPT / Claude) and a different order below; a "?" pulses between them. No numbers yet. | bespoke: `JudgeBench` (mode `hook`) + `Podiums` | Title "Three Judges, Three Rankings"; description: "I ran the same 45 blinded comparisons past a GPT, a Grok and a Claude judge. Each produced a different ranking" |
| 2 | Can a GPT judge fairly compare a GPT system with a Claude one? | | Rewind: podiums sink. A question card drops into the top band: **Is a GPT judge fair?** Two boxes below it, "GPT system" and "Claude system", a single blue judge chip between them, a scale at rest. | bespoke: `QuestionCard` + `JudgeBench` (mode `question`) | "The question came out of a conversation about evaluating two systems, one built on GPT and one on Claude. If you use a GPT judge, is the comparison still fair?" |
| 3 | GPT, Grok and Claude each answered fifteen tasks, from checkable code to pure taste. | | Three author chips (GPT-5.5, Grok-4.3, Claude Sonnet 4.6) each write a column of 15 small cards in their tint. A strip under the columns runs **objective → medium → subjective**, five ticks per third, with three example labels fading in: "fix a bug" · "summarise" · "error-message copy". Small footnote: "Claude seat: Sonnet 4.6, a generation behind the other two". | `JudgeBench` (mode `generate`) | "Fifteen tasks, split evenly across three levels of subjectivity: objective ones with a checkable answer (parse a duration string, fix a median bug, merge intervals), medium ones (summarize, extract to JSON, classify tickets), and subjective ones (error-message copy, a postmortem opening…)"; "Three models answer all fifteen: GPT-5.5, Grok-4.3 and Claude Sonnet 4.6"; "the Anthropic seat is Sonnet 4.6, a generation behind the other two" |
| 4 | Then each one judged every pair of answers blind, twice, with the order swapped. | | The authors become the judges: the three chips slide up into the seats. A pair of cards slides under a judge; the name strips black out with a "blind" tag; the judge stamps a winner; the two cards **swap places** (A ↔ B) and it stamps again. Tags: "every pair · both orders". Corner counter: "45 comparisons". | `JudgeBench` (mode `blind`) | "Then each of those three models judges every pair of answers, blinded — no model names anywhere in the prompt"; "Every comparison is judged twice, with the two answers swapped"; figure title "the same 45 comparisons" |
| 5 | No names. But each model writes in a recognisable house style. | | Zoom on one blind card: the name strip stays black, but its lines of text take on a faint tint of the author's colour. Three cards side by side, three tints. Label: "house style". | `JudgeBench` (mode `tint`) | "The judge never sees a model name. But it doesn't need one: every family has a recognisable house style, and a judge that learned to produce a style may well reward it." |
| 6 | So each judge is also a contestant, grading its own work blind. | | **Key moment ("what makes it different").** Each judge's clipboard flips to show its own card among the contestants; a stamp lands across the three seats: **JUDGE = CONTESTANT**. When a judge's own-tint card passes under it, its clipboard glows that colour. | `JudgeBench` (mode `contestant`) + stamp | "Then each of those three models judges every pair of answers"; "With three judges that double as the three generators"; "a judge that learned to produce a style may well reward it" |
| 7 | Each judge gave a different ranking of the same 45 comparisons. | | **Result 1.** The three podiums rise again, now built from the data: under the GPT judge GPT > Claude > Grok; under the Grok judge GPT > Grok > Claude; under the Claude judge Claude > GPT > Grok. Podium heights = win score. Title: "Same 45 comparisons. Three rankings." | bespoke: `Podiums` (data) | "Three judges, three different orderings."; ranking table (win scores per judge); findings: "gpt-5.5 as judge: gpt > claude > grok · grok-4.3 as judge: gpt > grok > claude · claude-sonnet-4-6 as judge: claude > gpt > grok" |
| 8 | Two of them crowned GPT. The Claude judge crowned Claude. | | Crowns drop: two blue crowns on the GPT and Grok podiums (GPT on top), one green crown on the Claude podium (Claude on top). | `Podiums` (mode `crowns`) | "Two of them crown GPT-5.5; the third crowns itself." |
| 9 | Every judge rated its own answers higher than the other two did. | | Each judge's own card glows on its podium; a thin line links it across to where the other two podiums placed the same card, lower. On-screen pairs: **85% vs 58 / 55** (GPT), **53% vs 30 / 33** (Grok), **62% vs 35 / 38** (Claude). | `Podiums` (mode `self`) | "Every judge puts itself higher than the other two put it."; ranking table: GPT-5.5 85.0 / 58.3 / 55.0; Grok-4.3 53.3 / 30.0 / 33.3; Claude Sonnet 4.6 61.7 / 35.0 / 38.3 |
| 10 | On the same pairs, each favoured its own by twenty to thirty points over its peers. | | The podiums collapse into three horizontal gap bars, one per judge: own rate vs peers on the same pairs, the gap shaded in the judge's colour: **+28.3 pp** (GPT), **+25.0 pp** (Claude), **+21.7 pp** (Grok), each with its 95% CI whisker, all clear of zero. | bespoke: `GapBars` | "What actually proves bias is the delta: how much more often a judge picks its own answer than its peers pick that same answer, on the same comparisons."; table: +28.3 [+16.7, +40.0], +25.0 [+12.5, +36.7], +21.7 [+9.2, +35.8]; "All three positive, all three intervals excluding zero, all three about the same size." |
| 11 | Against a judge with no stake, it shrinks; for Grok, it's no longer clear. | | The peer marker on each bar slides to the uninvolved judge's value; each gap shrinks: **+21.7** (GPT, CI clear of 0), **+15.0** (Claude, CI touches 0), **+13.3** (Grok, CI crosses 0, bar turns muted with a "?"). Tag: "baseline: the judge with no stake in the pair". | `GapBars` (mode `neutral`) | "Restricting the baseline to the judge with no stake in the pair knocks about a third off every number. The effect survives that correction for GPT-5.5, marginally for Claude, and becomes indistinguishable from zero for Grok."; table: +21.7pp [+8.3, +35.0], +15.0pp [+0.0, +28.3], +13.3pp [−1.7, +30.0] |
| 12 | And the bias grows with how subjective the task is. | | **Key moment (the finding the article cares most about).** Back to one judge and its scale. Question card changes to **Does the task matter?** The objective → subjective strip from scene 3 slides under the scale as a track. | bespoke: `JudgeBench` (mode `scale`) | "Self-preference is real, and it scales with subjectivity"; "Now the finding I care most about" |
| 13 | On tasks with a checkable answer, it was small or absent. | | **Mechanism, objective end.** A pair of code cards on the pans; the judge's own-tint card glows, but an answer-key weight "✓ checkable" drops on the other pan and the scale tips by the key. Beside it, the article's objective bars grow: **+17.5 · +7.5 · −2.5 pp** (the Claude bar dips just below zero, tag "harder on itself"). | `JudgeBench` (mode `scale`, objective) + bespoke `SubjectivityBars` (group 1) | "On tasks with a checkable answer, self-preference is small or absent — Claude Sonnet 4.6 is actually harder on itself than a neutral judge is."; table: +17.5 / +7.5 / −2.5 |
| 14 | On matters of taste, thirty points or more. | | **Mechanism, subjective end.** The pair is now two error messages; the key dissolves into a cloud "taste"; with nothing to anchor it, the own-tint glow tips the scale hard towards the judge's own card. Medium and subjective bar groups grow: **+25.0 · +27.5 · +30.0** then **+42.5 · +30.0 · +47.5 pp**. Final frame = the article's figure, restyled. | `JudgeBench` (mode `scale`, subjective) + `SubjectivityBars` (groups 2-3) | "On tasks where the criterion is taste, it reaches +30 to +48 percentage points."; table: medium +25.0 / +27.5 / +30.0; subjective +42.5 / +30.0 / +47.5 |
| 15 | There, the judges agreed no better than chance. | | The three judges stamp the same subjective pair: stamps land on different cards. Each stamp turns into a spinning coin. Three pair chips: **κ −0.01 · −0.03 · +0.05**, tag "0 = chance". | bespoke: `JudgeBench` (mode `coins`) | "On subjective tasks, judges agree at chance"; "On the subjective tasks all three pairs are indistinguishable from chance."; kappa table, subjective column: −0.01, −0.03, +0.05 |
| 16 | So a judge from a family you're testing is close to harmless on objective work… | | **Verdict card** fills the frame, title **VERDICT**. Left half "objective" with a ✓ stamp: **close to harmless**. | bespoke: `VerdictCard` | "a judge from the same family as one of the systems you're comparing is close to harmless on objective work and close to unusable on subjective work." |
| 17 | …and close to unusable on subjective work. | | Right half "subjective" with a ✗ stamp (warm): **close to unusable**. Footnote, small: "one run · 15 tasks · one model per family". | `VerdictCard` | same sentence; "Fifteen tasks … still small — every interval here is wide. It's one run"; "One model per family, and the tiers aren't matched" |
| 18 | On taste, your judge is a participant. | | The card clears to a single judge seat with its scale tipped towards its own glowing card; the sentence writes itself over it, "participant" in the accent with an underline. | `KeyQuote` over `JudgeBench` still | "If it is "which error message reads better", your judge is a participant." |
| 19 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Three Judges, Three Rankings". | outro | — |

**Word count (EN):** 13 + 13 + 14 + 14 + 11 + 12 + 11 + 10 + 12 + 16 + 14 + 10 + 11 + 8 + 8 +
15 + 7 + 7 + 3 = **209 words** (45 counted as one word), about 75 s of speech at ~2.8 words/s,
**~81-84 s** with line gaps, the two key-moment holds (scenes 6 and 12) and the outro. If the
TTS render runs over 85 s, cut in this order: (1) scene 2's "fairly" and scene 3's "each"
(−2); (2) merge scenes 8 into 7's visual and drop its narration, crowns stay silent (−10);
never cut scene 11 (the hedge) or scenes 16-17 (the verdict).

Caption estimate at 2.8 words/s: every line ≤ 16.8 chars/s (highest: scenes 3 and 17 at
16.8, scene 15 at 16.4); scene 7's "45" is spoken "forty-five", which only slows it.
`npm run lint` after TTS is the gate.

## Spoken numbers (complete list)

| Spoken | Scene | Why |
|---|---|---|
| "three" (judges, rankings) | 1, 7 | The subject itself. |
| "fifteen" (tasks) | 3 | Setup count, round. |
| "forty-five" (comparisons) | 7 | The article's own framing number ("the same 45 comparisons"). |
| "twenty to thirty points" | 10 | Word form of +21.7 / +25.0 / +28.3 pp; the article: "all three about the same size". |
| "thirty points or more" | 14 | Word form of the article's "+30 to +48 percentage points" (subjective: +30.0, +42.5, +47.5). |

Everything else (85 %, CIs, the neutral-baseline values, the objective bars, kappas) is on
screen only.

## Notes for the build

- **`JudgeBench` (bespoke, the spine).** Three judge seats (chip + clipboard + scale) on the
  dark stage; blind answer cards with a black name strip and text lines in a low-alpha tint of
  the author colour. Modes: `hook`, `question`, `generate`, `blind`, `tint`, `contestant`,
  `scale` (objective / subjective, the answer-key weight vs the "taste" cloud), `coins`.
  Colours: the article figures' family colours (blue / orange / green) for chips, tints and
  bars, mapped into the brand palette via `alpha`; keep them as the only non-brand hues and
  check contrast in stills. Card text is lorem-style lines, never readable answers.
- **`Podiums` (bespoke, data).** Three podiums, heights = win score per judge from the ranking
  table (85.0 / 35.0 / 30.0; 58.3 / 38.3 / 53.3; 55.0 / 61.7 / 33.3 for GPT / Claude / Grok
  generators under the GPT / Grok / Claude judges). On-screen values rounded as in the
  article's figure (85%, 58%, 55%, 35%, 38%, 62%, 30%, 53%, 33%).
- **`GapBars` (bespoke, data).** Own rate vs baseline per judge, gap shaded, 95% CI whisker,
  zero line. Mode `neutral` slides the baseline to the uninvolved judge. Values with one
  decimal as the article writes them.
- **`SubjectivityBars` (bespoke).** Grouped bars, 3 groups × 3 judges, one group per beat;
  `BarCompare` cannot do grouped or negative bars. Values from the article's table.
- **`QuestionCard`** can be reused from `examples/sport-from-motion-laya`.
- **Scale mechanism is illustrative**: the answer key and the "taste" cloud picture *why* the
  bias can grow with subjectivity; the experiment measured the deltas, not the mechanism. No
  claim in the narration depends on it.
- **Numbers on screen, exactly as the article writes them**: "45 comparisons", "15 tasks",
  85% / 58 / 55, 53% / 30 / 33, 62% / 35 / 38, "+28.3 pp", "+25.0 pp", "+21.7 pp" with CIs,
  neutral "+21.7", "+15.0", "+13.3" with CIs, subjectivity bars "+17.5 · +7.5 · −2.5",
  "+25.0 · +27.5 · +30.0", "+42.5 · +30.0 · +47.5", "κ −0.01 · −0.03 · +0.05", "0 = chance".
- **Spoken forms**: "45" → "forty-five"; "javieraguilar.ai" → "javier aguilar dot A I"; model
  names in the voice are the family names (GPT, Grok, Claude); chips show the article's full
  names (GPT-5.5, Grok-4.3, Claude Sonnet 4.6).
- **Anonymisation**: the motivating "conversation about evaluating two systems" stays generic
  ("a GPT system", "a Claude one"); no employer, product, client or cloud provider named (the
  Azure AI Foundry detail is left out, it is not needed). The only brand on cards, poster and
  metadata is AGILabs; no logos for the model families, colour + name chip only.
- Visuals are chosen for impact, not as a literal replay of the experiment: the tinted ink,
  the scale, the podiums' motion and the coins are stylised; the rigour lives in the article
  and the repo `experiments/judge-bias`. Narration and every number stay faithful to the
  article.
- **Credits in the outro**: "Harness, raw judgments: experiments/judge-bias".
- ES cut: pending (EN-only for now).
