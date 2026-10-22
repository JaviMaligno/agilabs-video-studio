# Bad Code Doesn't Hurt an Agent. Until the Repository Is Large. — article video (EN) · script draft v1.1 (ending revised 2026-10-22: lines 22-24 replace the old line 22 with a plain list of what helps)

Article: practices-for-agents-substrate (javieraguilar.ai, EN, `pubDate` 2026-09-08; read from
`origin/main` of personal-website). Code and data: `JaviMaligno/agent-code-practices` (public,
`repoUrl` in the frontmatter; local copy at `~/Documents/repos/agent-code-practices`, used only to
resolve the table issue in `factcheck.md`). Vertical 9:16, **289 counted words incl. outro,
estimated ~105-115 s** (see "Length"). ES column left empty (EN-only for now). Voice: the
template default.

**Important.** Two of the article's results tables are mislabelled (see `factcheck.md` →
"Article issues"). The script voices and shows only figures on which the prose, the summary
table "It is paid in turns before it is paid in failures" and the repo data all agree. Nothing
from the two mislabelled tables appears.

## Central visual: the turn budget

One picture carries the mechanism. A horizontal **track of 40 turn slots** (`TurnBudget`), with a
rose **wall at 40**. An agent cursor fills slots as it works: search, open, read, edit. On
readable code each read is one cool-blue slot; on degraded code the same read is drawn as a
stretched, scribbled amber block that eats several slots.

- **Small library, strong model:** the track fills to **6** and stops with a green tick. The
  degraded run stretches a little and still ends far from the wall. The empty track is labelled
  **margin**.
- **Large library:** the clean run already fills to **30**. The degraded run's read blocks
  stretch, slam into the **40** wall, and the cursor stops under a rose stamp **out of turns**.

The same two tracks come back in the margin scene, so "how much margin is left" is literally the
empty part of the track. The verdict (v1.1) closes on a plain checklist of what helps instead.

Second bespoke, the method and the bet: **`CodeDegrader`**. A code card (left, "HOW IT'S
WRITTEN") and a file-tree card (right, "WHERE TO LOOK") under a fixed badge **tests: identical ✓**.
The left card loses its names (`parse_vat` → `f1`), its indentation and its comments; the right
card's folders collapse to `m1.py m2.py m3.py`, the README is struck out, the tests folder fades.
The program never changes: the badge never moves. The same two cards sit on a balance for the bet
(tipping toward WHERE TO LOOK), and the balance flips when the result arrives.

Recurring element: a small **question card** at the top of the frame (`My bet` → `Small library`
→ `Large library` → `Which habit?` → `Verdict`), stamped at the end of each part (as in
`examples/sport-from-motion-laya`).

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | Bad code doesn't hurt an agent. | | Hook card, big. Behind it a tidy code snippet scrambles into opaque names while a small agent cursor keeps working, unbothered. | intro | Title: "Bad Code Doesn't Hurt an Agent. Until the Repository Is Large." |
| 2 | Until the repository is large. | | The snippet zooms out into a huge wall of interlinked files; the cursor slows and stalls. | intro (2nd line) | Title; description: "In large interconnected code, degrading how it's written halves what the agent solves." |
| 3 | Clean-code habits were made for human readers. | | **Story.** A person reading a page of code; habit chips pop beside them: "readable names", "formatting", "one job per module", "docs: where things live". | bespoke: `CodeDegrader` (mode `habits`) | "Software practices were justified for human readers. Names you can understand, consistent formatting, modules with one responsibility, documentation that tells you where things live." |
| 4 | Now agents do more and more of the reading, and I couldn't find a measurement of which habits help them. | | The person fades into an agent cursor reading the same page; on "which habits help them" each chip gets a question mark: "helps the agent? / only helped us?". | `CodeDegrader` (mode `habits`) | "Today a growing share of the reads of any repository are done by an agent, and I couldn't find a measurement of which of those practices help *it* and which only ever helped *us*." |
| 5 | My bet. An agent reads text well, but doesn't hold the whole repository in its head. | | Question card: **My bet**. An agent head icon: the text page fits inside, the folder map stays outside. | bespoke: `CodeDegrader` (mode `bet`) | "My hypothesis, written down before running anything"; "An LLM is an excellent text processor. What it doesn't have is the repository in its head." |
| 6 | So knowing where to look should matter more than how well each file is written. | | The two cards on a balance; it tips toward **WHERE TO LOOK**; pencil stamp **my bet**. | `CodeDegrader` (mode `bet`) | "So it should care **more about knowing where to look** — organisation, file layout, documentation — **than about how well-written the file is** once it's open." |
| 7 | To test it, I damaged working code without changing what it does. | | **Method.** Code card + file tree; the badge **tests: identical ✓** lands and stays for the whole scene. | bespoke: `CodeDegrader` (mode `method`) | "degrade it in ways that are **semantically equivalent** — the program does exactly the same thing before and after, verified by the repo's own suite giving an identical result." |
| 8 | Nine kinds of damage, in two families. How it's written, and where to look. | | Counter chip "9". On "how it's written" the left card degrades (names → `f1`, indentation gone, comments gone, type hints peeled). On "where to look" the right card's tree flattens to `m1.py m2.py`, README struck out, `tests/` fades. Badge still ✓. | `CodeDegrader` (mode `method`) | "Nine degradations in two families. **How it's written**: strip type annotations, rename identifiers to opaque ones, destroy formatting, remove comments and docstrings. **Where to look**: break cohesion without changing size, flatten the hierarchy to `m1.py`, `m2.py`, delete README and module docstrings, hide the test suite, concatenate modules" |
| 9 | Then I planted bugs for an agent to fix. 2,929 runs in all. | | A bug is injected; specific tests turn red; the cursor works; tests go green. Counter up to **2,929**, label "measured runs · 4 repositories". | `CodeDegrader` (mode `task`) → `Counter` | "a bug is injected programmatically and only counts if it makes a specific set of tests fail and no others"; "no LLM judge anywhere"; "**2,929 measured runs across four repositories**" |
| 10 | On a small library of self-contained files, nothing measurable happens. | | Question card: **Small library**. A row of small separate files ("tax-number validators"). | `BarCompare` (intro of scene) | "python-stdnum: tax-number validators, small self-contained files."; "Nothing separates from the baseline. Not even degrading everything at once." |
| 11 | Even fully degraded, the strong model only goes from 98% to 93%. | | Bar pairs: strong model **98% → 93%**; weaker model **83% → 81%** (on screen only); both tagged "n.s."; stamp **within noise**. | `BarCompare` | Summary table: "python-stdnum, high tier \| 98% \| 93%"; "python-stdnum, low tier \| 83% \| 81%"; high-tier table "both … 93% … n.s. (≥7% would be visible)" |
| 12 | Then a large library, where every fix means understanding several pieces at once. | | Question card: **Large library**. Dense web of file cards with arrows between them ("physical units"). | `FlowDiagram` (or `TurnBudget` mode `intro-large`) | "pint: physical units, large interconnected code where fixing anything means understanding several pieces at once." |
| 13 | Degrade everything, and the agent goes from solving 54% to 24%. | | Big drop **54% → 24%**, the 24% bar in rose; small label "p<0.001". | `BarCompare` | "**From 54% to 24%.** Degrading both families at once takes away more than half of what the agent was solving"; "both drops sit far below chance (p<0.001)"; summary table "pint \| 54% \| 24%" |
| 14 | Dirtying only the text costs almost as much. Hiding where to look, alone, I can't tell from noise. | | Two tiles: "HOW IT'S WRITTEN · almost as much" (amber, big) and "WHERE TO LOOK alone · not separable from noise" (muted). | `StatGrid` | "degrading only *how it's written* costs almost as much"; "Hiding *where to look* produces no effect this data can separate from noise. Dirtying the text does." |
| 15 | So my bet was backwards. Likely, finding files the agent already solves with search. | | The balance flips to **HOW IT'S WRITTEN**; "my bet" crossed out, stamp **backwards**. The cursor's magnifier finds `m2.py` in the flat tree instantly. | `CodeDegrader` (mode `bet-flip`) | "it is the opposite of what I wrote down"; "The explanation I find most plausible"; "**finding the file is a problem it has already solved** — it searches, lists, opens" |
| 16 | Unreadable code it pays for line by line, in turns. Each run had 40. | | **The central visual.** Inside the open file the cursor crawls line by line; the 40-slot track appears with the rose wall at 40. | bespoke: `TurnBudget` (mode `track`) | "Reading unreadable code it cannot delegate to any tool: it pays for that in full, line by line"; heading "It is paid in turns before it is paid in failures"; "It solves in 6 turns out of 40" |
| 17 | On the small library, the strong model needs 6. | | Track fills to **6**, green tick; the degraded run stays near 6; long empty track labelled **margin**. | `TurnBudget` (mode `small`) | "It solves in 6 turns out of 40, and even if degradation tripled that it would still have budget to spare."; summary table "6 → 6" |
| 18 | On the large one it already needs 30. The damage pushes it to 40, and it runs out. | | Clean run fills to **30**; degraded read blocks stretch and slam into **40**; rose stamp **out of turns**. | `TurnBudget` (mode `large`) | "pint starts at 30 out of 40, and any added cost pushes it through the ceiling."; summary table "pint … 30 → 40"; "with the median turn count pinned at the ceiling" |
| 19 | The real question is how much margin it has left. | | The empty parts of both tracks glow; big line **How much margin is left?** | `KeyQuote` over `TurnBudget` still | "Not *"can the agent work in this codebase?"* but *"how much margin does it have left?"*." |
| 20 | One habit stood out. Readable names, given back to destroyed code, brought it to 97%, above the 83% baseline. | | Question card: **Which habit?** Bars "given back to destroyed code": **readable names 97%** highlighted; types 80%, formatting 80%, comments 85%, cohesion 78%, hierarchy 82%, README 86%, tests 86% muted; dashed baseline at **83%**. On the card, `f1` turns back into `parse_vat`. | `BarCompare` | "giving **readable names** back to otherwise destroyed code recovers 97%, and that does separate — from the baseline and from giving back almost anything else"; "*(baseline: 49/59 — 83%)*"; table column "Given back to destroyed code" |
| 21 | So does clean code matter to an agent? Only sometimes. | | Question card: **Verdict**. Stamp **ONLY SOMETIMES**. | `KeyQuote` | "A small repository with a good model tolerates almost anything. A large one with a stretched model tolerates nothing." |
| 22 | What does help? First, readable names. | | Under "Only sometimes." a checklist card **WHAT HELPS AN AGENT** builds item by item. Item 1: ✓ **Readable names** · "given back to destroyed code · 97% vs 83%". | bespoke: `TurnBudget` (mode `verdict`) | "giving **readable names** back to otherwise destroyed code recovers 97%, and that does separate — from the baseline and from giving back almost anything else"; "names are not necessary while the rest of the context is intact, but they are sufficient when nothing else is left" |
| 23 | Then, in large code with little margin, clearly written code. | | Item 2: ✓ **Clearly written code** · "in large code with little margin". | `TurnBudget` (mode `verdict`) | "degrading only *how it's written* costs almost as much"; "Dirtying the text does."; "A large one with a stretched model tolerates nothing." |
| 24 | Tidy folders matter less. The agent likely finds files by searching. | | Item 3: ~ (muted tilde) **Tidy folders** · "matter less · the agent likely searches". Then the caveat tags: "40-turn budget", "1 model per tier", "2 repos carry it". | `TurnBudget` (mode `verdict`) | "Hiding *where to look* produces no effect this data can separate from noise. Dirtying the text does."; "The explanation I find most plausible … **finding the file is a problem it has already solved** — it searches, lists, opens"; "What this doesn't answer" (caveat tags, on screen only) |
| 25 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Bad Code Doesn't Hurt an Agent. Until the Repository Is Large." | outro | — |

## Length

**v1.1 (2026-10-22):** the old line 22 (20 words) became lines 22-24 (6 + 10 + 11 = 27 words), so **296 words**; the rendered main cut is **136.4 s** (`targetSeconds` 136).

**Word count (EN, v1.0):** 6 + 5 + 7 + 20 + 16 + 15 + 12 + 14 + 13 + 10 + 12 + 13 + 11 + 18 + 14 + 14 +
9 + 18 + 10 + 19 + 10 + 20 + 3 = **289 words** (numbers counted as one word). The last finished
example ran 253 words in 107.4 s, so this lands around **~110 s** after TTS (voice alone ~100 s at
2.9 words/s). Slightly above the usual 80-105 s; the story (lines 3-6) and the mechanism (16-19)
are what make the result understandable, so they stay.

If the render runs past ~115 s, cut in this order (never 1-7, 13-15, 18, 21-22):
1. Line 12 → "Then a large, interconnected library." (−8).
2. Line 9 → "Then I planted bugs for an agent to fix, 2,929 times." (−1) or drop the count to screen
   only: "Then I planted bugs for an agent to fix." (−4).
3. Line 20 → "One habit stood out. Readable names, given back to destroyed code, recovered 97%." (−5),
   baseline on screen only.
4. Line 10 → fold into 11: "On a small library, even fully degraded, the strong model only goes
   from 98% to 93%." (−6).

Captions (estimate at 2.9 words/s): the hook lines and line 10 run ~17-21 chars/s on the estimate
and will need the real TTS timing; lines 4, 14, 18, 20 and 22 are two-sentence lines that the
build splits into two cues at the full stop. `npm run lint` after TTS is the gate.

## Spoken numbers (complete list)

| Spoken | Line | Why |
|---|---|---|
| "nine" (kinds of damage) | 8 | Setup. |
| "two thousand nine hundred and twenty-nine" | 9 | Scale; needs a spoken form (comma). |
| "ninety-eight… ninety-three percent" | 11 | The small-library result. |
| "fifty-four… twenty-four percent" | 13 | The headline result. |
| "forty", "six", "thirty", "forty" (turns) | 16-18 | The mechanism. |
| "ninety-seven", "eighty-three percent" | 20 | The names finding. |

On screen only: "83% → 81%" (weaker model, small library), "n.s.", "p<0.001", "4 repositories",
"9", the given-back bars other than names, the caveat tags.

## Notes for the build

- **`TurnBudget` (bespoke, the spine).** 40-slot track, rose wall at 40; cursor fills slots; read
  slots on degraded code stretch (amber, scribbled). Modes: `intro-large`, `track`, `small`
  (fill to 6, degraded stays ~6, green tick, "margin"), `large` (clean 30, degraded 40 + "out of
  turns"), `verdict` ("Only sometimes.", then a checklist of what helps built item by item, then caveat tags). 6, 30 and 40 are the article's median
  turns; the fill animation between them is illustrative.
- **`CodeDegrader` (bespoke, method and bet).** Code card + file tree + fixed badge "tests:
  identical ✓", and a balance for the bet. Modes: `habits`, `bet`, `method`, `task`, `bet-flip`.
  The code is invented, illustrative Python (e.g. `def parse_vat(number):`), not copied from any
  library.
- **`QuestionCard`**: as in `examples/sport-from-motion-laya`.
- **Numbers on screen, exactly as the article writes them:** "9", "2,929", "4 repositories",
  "98% → 93%", "83% → 81%", "n.s.", "54% → 24%", "p<0.001", "6", "30", "40", "97%", "83%"
  (baseline), and the given-back column: types 80%, names 97%, formatting 80%, comments and
  docstrings 85%, cohesion 78%, hierarchy 82%, README and module docs 86%, visible tests 86%.
  **Not shown:** anything from the two mislabelled tables (91/167, 45/155 — 29%, 76/161 — 47%,
  37/157, 19/35, 7/26 — 27%, 11/30 — 37%, 0/25 — 0%, p=0.040, the "Ceiling before→after"
  column), the file-size table, the variance table.
- **Names:** the libraries are described as the article does ("tax-number validators, small
  self-contained files"; "physical units, large interconnected code"). Their names (public
  open-source projects named in the article) may appear small on screen but are not voiced.
  Models are not named (the article only says "the capable model" / "one model per tier"). The
  only brand is AGILabs. No work material is involved.
- Left out on purpose: the variance section and the earlier "naming costs 28 points" version (the
  author's own earlier reading; the result does not depend on it), sqlglot, the TypeScript probe,
  file size (no effect, not needed for the story).
- Visuals are chosen for impact, not as a literal replay; the rigour lives in the article.
  Narration and every number stay faithful to the article.
- ES cut: pending (EN-only for now).

## Cold-viewer check

Hook + story only (lines 1-6): "Bad code doesn't hurt an agent. Until the repository is large.
Clean-code habits were made for human readers. Now agents do more and more of the reading, and I
couldn't find a measurement of which habits help them. My bet. An agent reads text well, but
doesn't hold the whole repository in its head. So knowing where to look should matter more than
how well each file is written."

What a cold viewer would say: *"He tested which clean-code habits actually matter when an AI
agent, not a person, is reading the code — he expected file organisation to matter most, and the
hook says messy code only starts to hurt in big repositories."* Passes: the real situation (agents
now read our code; nobody measured which habits help them) and the question are clear before any
condition or number.
