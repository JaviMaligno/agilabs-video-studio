# Ask the Agent to Refactor — article video (EN) · script draft v1.1 (reviewed)

Article: ask-the-agent-to-refactor (javieraguilar.ai, pubDate 2026-10-19; read from
`origin/blog/ask-the-agent-to-refactor`, not yet on `main`). Vertical 9:16, target ~62 s,
140 counted words (~146 as spoken). ES column left empty (EN-only for now).

Real material on screen: the actual midpoint code from the experiment's repeated-code variant
of `loot-core` (Actual, MIT licence) and Codex's real T0 refactor diff, both in the public
experiment folder `experiments/agent-abstractions` (see "Data to extract").

## Central visual metaphor: copies that a rule change has to reach

The whole video is a **map of files**: a vertical stack of dark file cards (thin borders, file
name in monospace on the tab), and inside some of them a small glowing **copy block**: the same
piece of logic, repeated. Every copy block has a "rule colour". A **rule change** is a pulse of
new colour that must reach every copy; a copy the pulse misses stays in the old colour and
starts to **flicker red**: a stale copy, a bug that passes the tests.

The agent is drawn as a **search beam** (a narrow indigo→violet scanline with a cursor at its
head) that sweeps the map. It lights the blocks it *matches*. One block is written differently
and the beam slides over it without lighting it. That is the hook and the mechanism.

The three levers are three ways of acting on that map:

- **Rule**: a sticky note pinned to an `AGENTS.md` card at the top of the stack. The beam passes
  under it; in one lane it obeys, in two it doesn't even glance at it.
- **Lint**: a grid-scanner that sweeps the map and boxes copies **that look alike**. A copy
  written differently is invisible to it too; and in Codex's lane a strip of tape
  `// jscpd:ignore-start` is slapped on a block and the scanner passes over it.
- **Refactor request**: before any rule change, the copy blocks **lift out of their files, fly
  together and fold into one card** (`getScheduledAmount()`), leaving a thin thread from each
  file to it. Then the next rule-change pulse hits the one card and runs down the threads to
  every file at once, including a file card that stays **closed** (a small "never opened" lock).

Folding = the money shot. Bars and numbers never carry a scene: the few figures appear as
small chips on the map.

| # | Narration (EN, caption text) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Codex merged three copies of a rule. Tests passed. The step failed. | **Cold open, 0–3 s.** The file map, four cards, already moving on frame 1. The search beam sweeps down; three copy blocks light up one by one (counter chip "3" by the beam's head), fly into one shared box, a green "tests ✓" chip lands (~2.5 s) and is immediately cracked by a red "step ✗" stamp on "failed". | intro over bespoke `CopyMap` (mode `hook`) | "It searches, writes *"I found three midpoint calculations"*, moves all three into one shared function, runs the tests, and reports […] The tests pass. The step fails." |
| 2 | There was a fourth copy. Its search never matched it. | Camera drifts to the fourth card, `schedule-template.ts`, never lit: inside, the real line `Math.round(num1 + num2) / 2` beside the other copies' `Math.round((num1 + num2) / 2)`, the bracket difference underlined. The rule-change pulse arrives everywhere except here; the block flickers red. Small tag: "written differently". | `CopyMap` (mode `miss`) | "There was a fourth copy. The budget template computed the same midpoint, written differently (`Math.round(num1 + num2) / 2`), and Codex's search never matched it." |
| 3 | Matt Pocock says to use more abstractions and harsh lint. | Quote card over the dimmed map: *"use MORE abstractions in the AI age … (combined with harsh lint rules)"* — attributed "Matt Pocock", no X/Twitter chrome, no avatar. Accent on "MORE abstractions" and "harsh lint". | `KeyQuote` | Tweet quoted in the article: "we should use MORE abstractions in the AI age. You can use them (combined with harsh lint rules) to reduce the design space available to the agent […] Be braver! Design abstractions." |
| 4 | Can the agent be the designer? | The quote fades; the beam's cursor turns towards the scattered copy blocks and a "?" forms over them. | `CopyMap` (mode `question`) | "if the code is already repeated, can the agent be the one who designs the abstraction?" |
| 5 | I gave three agents real budgeting code: 384 task chains. | The map splits into **three lanes** side by side, each a slim copy of the file map with its own beam; lane chips "Sonnet 5.5", "GPT-6 Luna", "Haiku 5.5". A chain of four step pips (T1-T4) runs under each lane; a counter in the corner ticks to **384 chains**. | `CopyMap` (mode `lanes`) | "`loot-core`, the core of the open-source budgeting app Actual"; "Claude Code with Sonnet 5.5 and with Haiku 5.5, and Codex with GPT-6 Luna"; "That makes 384 chains and 1,632 steps."; "Each chain has four steps" |
| 6 | Three levers: a written rule, a duplication lint, or just asking for the refactor. | One beat per lever, each drawn on a lane-sized map: a sticky note on `AGENTS.md` ("Do not copy logic…"); a grid-scanner sweeping and boxing look-alike blocks; a fifth pip **T0** appearing before T1 with a speech chip "make it live in one place". | `CopyMap` (mode `levers`, 3 beats) | "RG, the written rule. One line in the root `AGENTS.md`"; "RL, the harsh lint. `yarn lint` runs a duplication check (jscpd)"; "RC, the directed refactor. Before T1, a step T0 that names the behaviour area and asks for it to live in one place" |
| 7 | The rule and the lint helped one agent of three. | Back to three lanes, rule and lint applied. In the Sonnet lane copies partly fold (fewer blocks); in the Luna and Haiku lanes the blocks stay scattered, a red flicker keeps appearing after each pulse. Lane chip "1 / 3". | `CopyMap` (mode `lanes-rule-lint`) | Description: "A written rule and a duplication lint helped one agent out of three."; "For Codex and Haiku, the rule and the lint do nothing measurable." |
| 8 | Codex sometimes told the lint to skip its code. | Zoom into the Luna lane: the grid-scanner approaches a copy block; a strip of tape lands on it reading `// jscpd:ignore-start`, the scanner passes over, the block stays. Small tag "in 4 steps". | `CopyMap` (mode `lint-dodge`) | "In four steps it marked the code so the checker would skip it: `// jscpd:ignore-start -- This provider has the same link lifecycle as the others.`" |
| 9 | Only asking for the refactor lifted all three, if modestly. | **The fold.** T0 fires in all three lanes at once: in each, the copy blocks lift out of their files and fold into one card, threads back to each file. One small secondary chip in the bottom corner, after the fold lands: "+0.35 to +0.47 of 5" (backs "modestly"; never centred, never a bar). | bespoke `CopyMap` (mode `fold`) | "The refactor request (amber) is the only lever that raises all three agents, by 0.35 to 0.47 points"; "Only the refactor request moves all three."; hedge: "On its own, each agent's refactor effect is around p = 0.02 and would not survive correction"; Haiku "starts close to the ceiling" |
| 10 | What it bought was mostly search: going to find every copy. | Replay of the hook in the Luna lane, but after T0: the beam doesn't stop at three matches; it widens into a full sweep, finds the fourth card and pulls its block into the fold too. Real Codex T0 diff lines scroll faintly behind (`- Math.round(…)` / `+ getScheduledAmount(…)`). | `CopyMap` (mode `search`) | "The refactor request says the logic is "repeated rather than defined once", and that sentence sends it looking for every copy. A rule change doesn't."; "what it buys is search more than design" (description) |
| 11 | Then one edit reached every copy, even in a file it never opened. | The next rule-change pulse hits only the shared card; light runs down every thread at once. The `schedule-template.ts` card stays **closed** (lock icon "never opened") and still turns the new colour. | bespoke `CopyMap` (mode `propagate`) | "Once the copies sit behind one function, the next rule change reaches all of them with one edit, including the budget template, without the agent ever opening that file." |
| 12 | Codex's missed copies fell from 33% to 12%. | **Pulse strobe**, not a chart: in the Luna lane, a quick train of rule-change pulses runs through the map twice. First pass, *before* the refactor (scattered copies): about one pulse in three leaves a copy flickering red; chip "33%". Second pass, *after* the fold: pulses go through the shared card and only about one in eight leaves a red flicker; chip morphs to "12%". The red flickers stay as faint afterimages so the drop is felt, not read. Proportions illustrative, chips exact. | `CopyMap` (mode `miss-rate`) | "With the repeated code and no lever, Codex misses a copy at a rule step in 33% of cases […] After its own refactor, it misses 12%" |
| 13 | Don't just write the rule. Ask for the refactor, and name what must survive. | Split in two beats. Beat 1: the `AGENTS.md` sticky note dims. Beat 2: the T0 chip "make it live in one place" brightens and gains a second line "keep: what must differ" while one block inside the folded card keeps a small distinct notch (an exception that survives). | `KeyQuote` over `CopyMap` still | "ask the agent for it as a task, not as a rule. Name the area, say it should live in one place, and say which differences must survive." |
| 14 | More at javieraguilar.ai. | Outro card: AGILabs badge, javieraguilar.ai, title "Ask the agent to refactor. Writing the rule isn't enough". Credit line (see build notes). | outro | — |

**Word count (EN): 140** (12 + 10 + 10 + 6 + 10 + 14 + 10 + 9 + 10 + 11 + 13 + 8 + 14 + 3).
As spoken ("384", "33%", "12%" and the URL expanded) ~146 words: ~52 s of speech at 2.8 words/s,
~56 s at 2.6, so **~60-64 s with scene breaths**. Set `targetSeconds: 62`.

If the TTS runs over 70 s, cut in this order:
1. Scene 4 ("Can the agent be the designer?") becomes silent: the "?" over the copies carries it (−6).
2. Scene 6: "or just asking" → "or asking" (−1), and drop "a written rule" etc. into on-screen labels
   with narration "Three levers." (−11) only if still long.
3. Scene 8 dropped (the tape gag moves silently into scene 7) (−9).

## Notes for the build

- **`CopyMap` (bespoke, the spine).** Vertical stack of 4-6 file cards on `#0a0a0f`; each card a
  rounded rect with a monospace tab (`forecast-schedules.ts`, `schedules/app.ts`,
  `schedule-template.ts`, `shared/schedules.ts`; illustrative layout, real file names). Copy
  blocks are small code chips with one real line each. State in a pure `frameState`: per block
  `{ lit, colour (old/new), stale, folded (0..1), threadProgress }`, beam position, scanner
  position, tape progress, lane count (1 or 3). Modes: `hook`, `miss`, `question`, `lanes`,
  `levers`, `lanes-rule-lint`, `lint-dodge`, `fold`, `search`, `propagate`, `miss-rate` (scene order).
  Can borrow the pane/bubble drawing helpers from `examples/what-agents-say-to-each-other`
  (`SessionPanes`) for card frames and monospace text.
- **The fold (scene 9) is the money shot**: give it ≥ 2.5 s; blocks lift with a slight stagger,
  arc to the shared card, the card's border goes indigo→violet. In three lanes at phone width
  the cards are tiny: draw the fold large in the Luna lane and as smaller echoes in the other
  two (illustrative, all three fold).
- **Lanes = agents, not bars.** Scene 7's "one of three" is shown as one lane folding partly and
  two not folding, not a chart. Which lanes and how many blocks fold is illustrative.
- **The miss in scene 2 must be legible**: show both forms one above the other, the parentheses
  highlighted: `Math.round((num1 + num2) / 2)` (the copies found) vs `Math.round(num1 + num2) / 2`
  (the template). Inter for labels, monospace only inside code chips.
- **Numbers on screen, exactly as the article writes them:** "3" (copies found), "384 chains",
  "1 / 3" (lane chip; or "one of three" if Javier prefers words), "in 4 steps", "+0.35 to +0.47 of 5"
  (small secondary chip, kept: it is the evidence for "modestly"), "33%", "12%". Model chips: "Sonnet 5.5", "GPT-6 Luna",
  "Haiku 5.5". No p-values, no kappas, no 1,632 on screen.
- **Spoken forms:** "384" → "three hundred and eighty-four"; "33%" → "thirty-three percent";
  "12%" → "twelve percent"; "javieraguilar.ai" → "javier aguilar dot A I". "Codex" spoken as is.
- **Captions (estimate):** every line ≤ 16.5 chars/s at 2.8 words/s (max: scene 9, 59 chars in 10 words, 16.5;
  scene 6, 82 chars, 16.4; scenes 3/5 at 16.0); at 2.6 words/s all ≤ 15.3. Scene 2 was shortened in v1.1
  because "…, written differently. Its search…" ran at 17.3; "written differently" lives on screen as a tag. Scene 13 is two cues. Gate is
  `npm run lint` after TTS.
- Visuals are chosen for impact, not as a literal replay: the beam, scanner, tape, fold and
  threads are stylised; the rigour lives in the article and in `experiments/agent-abstractions`.
  Narration and every number stay faithful to the article.

## Data to extract

- **Real code for the copy blocks** (public, from Actual, MIT): the midpoint copies as they read in
  the repeated-code variant R, taken from the minus-lines of Codex's T0 diff in the schedules area:
  `git show origin/blog/ask-the-agent-to-refactor:experiments/agent-abstractions/data/diffs/study3/codex/RC/Z2/0/T0.patch`.
  Files: `server/budget/schedule-template.ts` (the template copy, `Math.round(…num1 + …num2) / 2`),
  `server/forecast/forecast-schedules.ts`, `server/schedules/app.ts` (two copies:
  `updateActions` and `postTransactionForSchedule`), `shared/schedules.ts` (`getScheduledAmount`,
  the shared function the copies fold into). Commit the trimmed one-liners as a small JSON under
  `public/` (no full diffs on screen).
- **Lint tape text**: from the article (`// jscpd:ignore-start`), crop to that token only.
- **Rule note text**: from the article's RG rule, cropped to "Do not copy logic…".
- Nothing else is needed: the figures are the article's. Optional cross-check against
  `data/study3-steps.jsonl` (missed-copy rates for codex R vs RC) is listed in `factcheck.md`.

## Credits (outro line, small)

"After an idea by Matt Pocock · code: Actual (open source, MIT)". The quote card in scene 3
attributes the quote to Matt Pocock in text only; no X/Twitter UI, logo or avatar.

## Alternative scene (not in v1.1, +~14 words)

The **named exception**: in one chain Codex preserved the template's odd rounding as a named mode
(`'round-sum-then-half'`, visible in the real T0 diff), and at the next step treated it as
sacred: *"Schedule templates explicitly request a separate sum-first rounding mode; I'll preserve
that behavior."* Visual: the folded card keeps a little padlocked notch the beam walks around.
Narration idea: "One fold kept an odd rounding as a named mode. The next agent guarded it." Strong
and it explains scene 13's "name what must survive"; left out for length.

## Review log (v1 → v1.1)

- Hook: added the article's own turn "The step failed." (was missing; "tests passed" alone is not a
  surprise). Visual gets a red "step ✗" stamp right after "tests ✓".
- Scene 2: "written differently" moved to the on-screen tag only (the longer line ran at 17.3 chars/s).
- Scene 9: "raised the design score of all three" → "Only asking for the refactor lifted all three, if
  modestly." Keeps the article's "only lever" claim and adds its hedge (each effect p ≈ 0.02, not
  surviving correction alone; Haiku near the ceiling) in two words; the "+0.35 to +0.47 of 5" chip
  stays small in a corner as the evidence for "modestly".
- Scenes 11/12 swapped: search → one edit reaches every copy → the miss rate falls (cause before
  number).
- Miss-rate scene: marker stacks (a bar chart in disguise) replaced by a pulse strobe through the map.
- Sol cross-judge caveat on the lint (1.13 → 0.43 for Sonnet) left off screen: scene 7 already stays
  at the article's "one agent of three", which the Sol check does not overturn (the rule still helps
  Sonnet, p = 0.02).
