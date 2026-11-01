# More Than One Way to Prove It: explainer video (EN + ES) · script draft v1

Article: "More Than One Way to Prove It" (javieraguilar.ai, 2026-12-05). Vertical 9:16, target ~45 s.
Only one idea from the article: the order rule. No CORE, no Lean, no formulas.

**Central image: a leaderboard of six model cards that flips upside down.** Each card carries two
counters: bugs fixed, and "tests first". The checklist clipboard with the rule stamps each card
green or red. The video opens on the flip and closes on it.

| # | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|
| 1 | bespoke: `LeaderboardFlip` (cold open) | A rule that sounds like good practice ranked six AI models upside down. | Una regla que suena a buena práctica ordenó seis modelos de IA al revés. | Six model cards stacked as a leaderboard; the stack rotates 180° and lands with the smallest model on top. Title over it. | "Two rules that each sound reasonable add up to a grader that ranks the field in reverse." |
| 2 | `StatGrid` | I gave six models ten real bugs in a Python library, three times each. | Les di a seis modelos diez bugs reales de una librería de Python, tres veces cada uno. | Three tiles: "6 models" · "10 real bugs" · "3 runs each". | "Ten bugs reintroduced into humanize, a real Python library" / "Six models ran each task three times" |
| 3 | `KeyQuote` | Then I graded them with a rule nobody argues with: run the tests before you touch anything. | Y los evalué con una regla que nadie discute: ejecuta los tests antes de tocar nada. | Clipboard card: "✓ Run the tests before you change anything". | "It adds one obligation that looks like plain good practice: run the test suite before you change anything" |
| 4 | `BarCompare` | Sonnet fixed all thirty bugs. It ran the tests first zero times. | Sonnet arregló los treinta bugs. Ejecutó los tests primero cero veces. | Sonnet card: two bars, "fixed 30/30" full teal, "tests first 0/30" empty. Red stamp from the clipboard. | "Sonnet fixed all 30 bugs and never once ran the suite before editing." |
| 5 | `BarCompare` | Opus fixed twenty-nine, and ran them first once. | Opus arregló veintinueve y los ejecutó primero una vez. | Opus card, same two bars: 29/30 · 1/29. Red stamp. | "Opus fixed 29 and ran it first once." |
| 6 | `BarCompare` | Qwen, a small model, fixed the fewest, and ran them first almost every time. | Qwen, un modelo pequeño, arregló de los que menos, y los ejecutó primero casi siempre. | Qwen card: fixed bar shorter (22/30), tests-first bar nearly full (19/22). Green stamp. | "Qwen, tied for the fewest fixes, ran it first in most runs" (fig.: 19 / 22) |
| 7 | `KeyQuote` | The rule wasn't measuring care. It was measuring habit. | La regla no medía el cuidado. Medía una costumbre. | Big line. Under it, two small icons: "reads the code first" / "explores by running things". | "The obligation splits the models by habit, and the habit has nothing to do with who fixes more bugs." / "Both read the failing test and the code, made the fix, then ran everything." / "because it explores by running things" |
| 8 | bespoke: `LeaderboardFlip` | Add a second sensible rule, don't edit the tests, and the ranking flips. | Añade otra regla sensata, no tocar los tests, y el ranking se da la vuelta. | Second clipboard line appears: "✓ Don't edit the tests". The leaderboard flips: Qwen 18/22 on top; Opus 1/29 and Sonnet 0/30 at the bottom. | "E1 forbids editing the tests. So under E2 the model that passes most often is Qwen, with 18 of its 22 fixes, and the strongest models come last: Opus 1 of 29, Sonnet 0 of 30." |
| 9 | `KeyQuote` | A rule about how to work is an opinion about method. Here it graded the habit, not the result. | Una regla sobre cómo trabajar es una opinión sobre el método. Aquí puntuó la costumbre, no el resultado. | Stamp "OPINION" lands on the clipboard. | "An obligation is an opinion about method. … Here it sorted the models by habit" |
| 10 | outro | More at javieraguilar.ai. | Más en javieraguilar.ai. | Outro card: AGILabs badge, javieraguilar.ai, title. | — |

**EN word count: 122** (lines 1-10). At ~2.6 words/s plus scene breaths: **~47-50 s**. ES runs ~15 % longer.

## Notes for the build

- **`LeaderboardFlip`** (bespoke): six cards (Haiku, Sonnet, Opus, Sol, Luna, Qwen), each with
  "fixed" and "tests first" counters. Cold-open variant: a fast flip under the title. Scene 8:
  the second rule line drops onto the clipboard, then the flip, ending with Qwen 18/22 on top
  and Opus 1/29, Sonnet 0/30 at the bottom (the other three in between, unlabelled numbers).
- Card "fixed" figures, all from the article's valid-fix counts: Sonnet 30, Opus 29, Sol 29,
  Haiku 25, Luna 22, Qwen 22 (of 30 each). "Tests first" from figure 4: Sol 28/29, Qwen 19/22,
  Haiku 7/25, Luna 3/22, Opus 1/29, Sonnet 0/30.
- Scene 6 on screen: "fixed 22/30" and "tests first 19/22". The narration says "fixed the fewest";
  the card shows the tie honestly (Luna also 22).
- Spoken forms: "javieraguilar.ai" → "javier aguilar dot A I".
- Visuals are illustrative; narration and numbers stay faithful to the article.
