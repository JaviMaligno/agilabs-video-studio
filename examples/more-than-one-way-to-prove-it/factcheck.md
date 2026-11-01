# Fact-check: More Than One Way to Prove It

Article: `src/content/blog/en/more-than-one-way-to-prove-it.md` (javieraguilar.ai, 2026-12-05).
Every figure and claim spoken or drawn on screen, with the article sentence it comes from.
The card data lives in `src/anim/LeaderboardFlip.state.ts` (`MODELS`); the lines in `src/timeline.ts`.

| # | Claim | Where | Article sentence |
|---|---|---|---|
| 1 | A rule that sounds like good practice ranked six AI models upside down | cold (hook) | "Two rules that each sound reasonable add up to a grader that ranks the field in reverse." / "It adds one obligation that looks like plain good practice" |
| 2 | Six models | setup (voice, tile "6 models") | "Six models ran each task three times: Claude Haiku 5.5, Sonnet 5.5 and Opus 5.5 …; GPT-6.1 Sol and GPT-6 Luna …; and Qwen 3.5 9B" |
| 3 | Ten real bugs in a Python library | setup (voice, tile "10 real bugs") | "Ten bugs reintroduced into humanize, a real Python library" |
| 4 | Three times each | setup (voice, tile "3 runs each") | "Six models ran each task three times" |
| 5 | The rule: run the tests before you change anything (voice: "touch") | rule (voice, clipboard) | "It adds one obligation that looks like plain good practice: run the test suite before you change anything" |
| 6 | Sonnet fixed all thirty bugs; ran the tests first zero times (30/30, 0/30) | sonnet (voice, card); cold and flip cards | "Sonnet fixed all 30 bugs and never once ran the suite before editing." / figure 4: "Sonnet 0 of 30" |
| 7 | Opus fixed twenty-nine, ran them first once (29/30, 1/29) | opus (voice, card); cold and flip cards | "Opus fixed 29 and ran it first once." / figure 4: "Opus 1 of 29" |
| 8 | Qwen fixed the fewest (22/30), ran them first almost every time (19/22) | qwen (voice, card); cold and flip cards | "Qwen, tied for the fewest fixes, ran it first in most runs" / figure 4: "Qwen 19 of 22". The card shows 22/30, the same as Luna: the tie is visible on the leaderboard. |
| 9 | Qwen is a small model | qwen (voice) | "Qwen 3.5 9B in a plain tool loop" (9B against frontier models; the article does not call it small in words, the size is in its name) |
| 10 | Sol 29/30 fixed, 28/29 tests first | cold and flip cards | "Sol fixed 29 and ran the suite first in 28 of them." / figure 4: "Sol 28 of 29" |
| 11 | Haiku 25/30 fixed, 7/25 tests first | cold and flip cards | figure 4: "Haiku 7 of 25" (25 = Haiku's valid fixes, the figure's denominator) |
| 12 | Luna 22/30 fixed, 3/22 tests first | cold and flip cards | figure 4: "Luna 3 of 22" (22 = Luna's valid fixes) |
| 13 | The rule wasn't measuring care, it was measuring habit | habit (voice, quote) | "The obligation splits the models by habit, and the habit has nothing to do with who fixes more bugs." / caption of figure 4: "Two working styles, not two levels of care" |
| 14 | Second rule: don't edit the tests | flip (voice, clipboard) | "E1 forbids editing the tests." / E1 in figure 1: "no test edited" |
| 15 | The ranking flips: Qwen on top with 18/22; Opus 1/29 and Sonnet 0/30 last | flip (voice, cards "passes both rules"), cold (stamps) | "So under E2 the model that passes most often is Qwen, with 18 of its 22 fixes, and the strongest models come last: Opus 1 of 29, Sonnet 0 of 30." |
| 16 | A rule about how to work is an opinion about method; here it graded the habit, not the result | opinion (voice, OPINION stamp, tagline) | "An obligation is an opinion about method. … Here it sorted the models by habit, and combined with a ban on touching the tests it ranked them in reverse order of how well they fixed bugs." |
| 17 | More at javieraguilar.ai | outro | — |

## Illustrative choices (not claims)

- The leaderboard before the flip orders the cards by valid fixes (Sonnet 30, Opus 29, Sol 29,
  Haiku 25, Luna 22, Qwen 22; ties kept in the article's order of mention). The flip reverses the
  stack. The article gives the two-rule (E2) figures only for Qwen, Opus and Sonnet, so the
  middle three (Luna, Haiku, Sol) carry no figure after the flip and are dimmed: their place
  between the top and the bottom is not a ranking the article states.
- PASS / FAIL and the tick / cross stamps mark how each card fares under the rules: Qwen passes
  (19/22 tests first; 18/22 both rules), Sonnet (0/30) and Opus (1/29) fail. Sol is not stamped in
  the focus scenes (it has no focus scene).
- "Fixed" counts are valid fixes out of 30 runs (10 bugs × 3 runs), as in the article.
