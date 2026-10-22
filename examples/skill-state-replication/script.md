# Explicit State: It Doesn't Forget, It Misremembers — article video (EN) · script draft v1.0

Articles (one video, both halves of the SKILL.state replication), read from `origin/main` of
personal-website:

- Part 1: `when-the-fact-stops-being-true` (`pubDate` 2026-09-13), with its **Correction** banner.
- Part 2: `explicit-state-misremembers` (`pubDate` 2026-09-26).

Cross-checked against the public repo `JaviMaligno/delayed-relevance` (local clone,
`docs/paper-draft.md`, commit `7cba859`). Where part 1's body and its own Correction banner
disagree, the video uses the corrected figures (70 of 72 vs 10 of 72), which part 2 repeats.

Vertical 9:16, **~285 counted words incl. outro, estimated ~110-115 s** (two articles in one
video; see the cut list). ES column left empty (EN-only for now). Voice: the template default,
Javier's cloned voice. No work material: the warehouse is the article's simulated environment,
models and the paper are public. Only brand on screen: AGILabs.

## Central visual: the scroll and the notepad

One picture carries the video. At the bottom of the frame, a **warehouse rack** (a row of
numbered shelf slots with pallet blocks). Above it, two ways an agent remembers, side by side:

- **The scroll** (the transcript): a paper roll that unrolls one line per step and never stops
  growing; old lines scroll up and shrink, nothing is ever erased.
- **The notepad** (explicit state, SKILL.state): a small card with a few key/value lines
  (`shelf 12: empty`, `shelf 3: lot A7`…). Every step a pen strikes one value and writes the new
  one; the scribbled reasoning above it fades out. Its size never changes.

Everything the video says is something happening to one of the two:

- **The bill:** a soft "cached" glow covers the scroll's old lines (they never change) but never
  sits on the notepad, because the notepad is rewritten every step.
- **The correction:** on the scroll, the line "pallet filed at shelf 12" and, ten lines later,
  "never put away, shelf 12 empty" both stay inked; on the notepad one value is simply struck
  and rewritten.
- **The misremembering:** the notepad and the rack drift apart. The pen writes the wrong
  contents into a slot, and the rack below shows what is really there.

Recurring element: a fixed **question band** at the top (`Cheaper?` → `More accurate?` →
`When facts change?` → `Where does it break?`) that gets a stamp at the end of each part.

| # | Narration (EN, caption text) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | Give an agent a notepad instead of a memory. It stops forgetting. It starts misremembering. | | **Cold open.** Notepad card centre-frame; a pen writes `shelf 3: lot B2`. Below, the rack: shelf 3 actually holds a different pallet (`lot A7`). On "misremembering" the notepad line and the shelf flash amber with a thin "≠" between them. | bespoke: `ScrollVsNotepad` (mode `hook`) | Part 2 title "Explicit State Doesn't Forget. It Misremembers."; "Explicit state does not lose track of the procedure. It **writes the state wrong**" |
| 2 | Agents usually reread their whole conversation at every step, and it keeps growing. | | **Story.** The scroll alone: a chat-like roll unrolling one line per step, a small step counter ticking 1, 2, 3 … 50; the roll gets taller and its top lines shrink into a stack. | `ScrollVsNotepad` (mode `scroll`) | "replaces the append-only conversation history of a ReAct-style agent"; "ReAct: **16,437** and growing linearly" |
| 3 | A paper called SKILL.state swaps that for a small notepad of current facts, rewritten each step. (spoken "skill dot state") | | **Story.** The scroll slides left and dims; the notepad drops in on the right with a label "SKILL.state · explicit state". A pen strikes one value and writes the next; the scratch reasoning above it fades ("discarded"). Small tag: "a paper at EMNLP". | `ScrollVsNotepad` (mode `notepad`) | "replaces the append-only conversation history … with an explicit, mutable execution state"; "It replies with a JSON patch and an action. The patch is validated and merged … and the reasoning that produced it is **discarded**. Nothing accumulates."; "(Badhe, Tiwari and Chung, accepted at EMNLP)" |
| 4 | It promises steadier accuracy and a far smaller prompt. I rebuilt their test to check. | | **Story.** Two promise cards pin above the notepad: "accuracy on long tasks ✓" and "prompt stays small ✓", each with a hollow check waiting to be filled. On "rebuilt" a stamp **REPLICATION** lands. | `ScrollVsNotepad` (mode `promises`) | "The claim has two halves: better accuracy on long procedures, and a prompt that stays O(1) instead of growing O(T)."; "SkillExecBench has no public code, so the environment here is a reimplementation" |
| 5 | My test is a warehouse agent filing pallets, for up to two hundred steps. | | The rack fills the bottom; an agent cursor files pallets into slots, shipping some out. Silent tags: "500 shelves", "up to 200 steps", "4 ways to remember" with four mini icons (full transcript · summary · notepad + transcript · notepad only). | `ScrollVsNotepad` (mode `warehouse`) | "a 500-shelf warehouse with dense pipe-separated event records"; horizons T=10…T=200; "four runtimes: ReAct (full transcript), Memory (rolling summary), Stateful (state block plus transcript) and SKILL.state (state block only)" |
| 6 | In tokens it's 7.5x cheaper. But a changing notepad breaks caching, and my bill said only 1.4x. (spoken "seven and a half times … one point four times") | | Question band: **Cheaper?** Prompt size first: notepad flat at **2,157** chars, scroll climbing to **16,437** at step 50. Then two bars: dashed outline "tokens · 7.5x", filled bar "bill with caching · 1.4x". On "caching" the cached glow spreads over the scroll's old lines and slides off the notepad every time the pen writes. Footnote: "short procedure · Anthropic caching". | bespoke: `CacheBill` | "Average prompt at T=50 … SKILL.state **2,157** … ReAct: **16,437**"; "With a short procedure, caching shrinks SKILL.state's input-cost advantage over the transcript from **7.5x to 1.4x** on Anthropic, because an append-only transcript is an ideal cacheable prefix and a mutating state block is not." |
| 7 | Keeping both, with the notepad first as in the paper's template, costs 5.2x more. (spoken "five point two times") | | The "notepad + transcript" icon: two stacks, notepad on top of scroll vs scroll on top of notepad. Cached glow covers almost all of the second and almost none of the first. Bars: **869k** vs **168k** effective input tokens per episode; stamp **5.2x**; tag "same content · same score". Question band stamp: **less than it looks**. | `CacheBill` (mode `order`) | "The same Stateful runtime, sending the same content … costs **5.2x more** when its state block goes in front of the transcript than behind it — 869k against 168k effective input tokens per 50-step episode — for the same score. The paper's own prompt template puts the state block in front." |
| 8 | On Claude, long tasks hurt neither. So I ran the paper's own model, Gemini, in their setup. | | Question band: **More accurate?** Two flat lines at the top of a small chart (Claude Haiku, T=10 → 200, both ≈1.00, labels "0.99" and "1.00"). Then a chip swap: "Claude" → "Gemini 3 Flash", and a tag "environment matched to the paper's appendix · every cell repeated". | `ScrollVsNotepad` (mode `models`) | Part 1 table: ReAct T=200 **0.99 ±0.02**, SKILL.state **1.00 ±0.00**; "The accuracy half does not [replicate]"; part 2: "So this half runs on theirs … in an environment rebuilt to match their Appendix B … with **every cell repeated**" |
| 9 | The notepad never missed in 75 episodes. The transcript slipped, less than the paper reports. | | Line chart, T=10 → 200: notepad (teal) flat at **1.000**; transcript (amber) dips to **0.913**; dashed ghost line "paper: 0.74". Small hedge tag: "may not be the exact checkpoint". Question band stamp: **yes, on their model**. | `BarCompare` or bespoke `HorizonLines` | "**SKILL.state does not fail once in 75 episodes of up to 200 steps**"; "ReAct falls only to 0.913 at T=200, against 0.74 in the paper"; "`gemini-3-flash-preview` may not be the exact checkpoint" |
| 10 | It clearly wins when a fact stops being true, like a pallet never actually put away. | | Question band: **When facts change?** Rack: a pallet filed at shelf 12 (step 3). Ten steps later a red-ink message slides in: "never put away · shelf 12 is empty"; the slot empties. | bespoke: `ScrollVsNotepad` (mode `correction`) | "the pallet you filed at step 3 was never actually put away; that shelf is empty."; "**Having a single place where the truth lives is an advantage precisely when the truth changes.**" |
| 11 | The transcript holds the record and its correction, and must reconcile them each time. | | Split. Scroll: "filed at shelf 12" and "shelf 12 empty" both inked, far apart, each step a faint line connects them and flickers. Notepad: the value `shelf 12: pallet` is struck once and rewritten `shelf 12: empty`; done. | `ScrollVsNotepad` (mode `correction`) | "The transcript erases nothing: it holds the original record and its retraction simultaneously, and every subsequent step has to resolve the contradiction again from scratch."; "Explicit state has exactly one place where the fact lives" |
| 12 | Across three models, the notepad applied the correction in 70 of 72 episodes. The transcript, in 10. | | Grid of 72 cells per arm (three rows of 24: Haiku · Sonnet · Gemini). Notepad: 24 · 22 · 24 filled; transcript: 1 · 9 · 0 filled. Big figures **70 / 72** vs **10 / 72**. Tag "the paper's own claim, counted per episode". Question band stamp: **yes**. | bespoke: `CorrectionGrid` | "**Explicit state applies the correction in 70 of 72 episodes (Wilson 95 % interval 90–99 %); the full transcript in 10 of 72 (8–24 %).** This is the paper's own claim, and it reproduces cleanly."; figure: 24/24, 22/24, 24/24 vs 1/24, 9/24, 0/24 |
| 13 | Yet on Claude Haiku, in the same setup, the notepad came last. | | Question band: **Where does it break?** Three bars at T=200 on Haiku: notepad + transcript **0.999**, transcript **0.974**, notepad **0.958** (accent on the last). | `BarCompare` (3 bars) | "On Haiku the ordering turns over."; table T=200 Haiku: ReAct 0.974, Stateful **0.999**, SKILL.state 0.958 |
| 14 | Replaying every step, each failure began with a correct move written down wrong. | | Two layers: the notepad's belief (top) and the rack's reality (bottom), scrubbed step by step; they match, match, match… then split at one step, highlighted "Move ✓ · patch ✗". | bespoke: `BeliefVsShelf` | "I replayed every episode against the real environment and compared, step by step, the inventory the model *believes* … with the one that is actually on the shelves."; "In all 17 episodes where the belief drifted from reality, the step that corrupted it was a **`Move` executed correctly with a state patch written wrong**." |
| 15 | It moved shelf seven to three, but noted shelf six's contents, then shipped on that belief. | | Step counter **132**: a pallet slides from shelf 7 to shelf 3 on the rack (correct); the pen writes shelf 6's contents into the notepad's shelf 3 line (amber). Counter **137**: the agent ships from shelf 3; the rack flashes **REJECTED**; the notepad line stays as it was. | `BeliefVsShelf` (mode `step132`) | Figure: "At step 132 the model executes a correct Move from shelf 7 to shelf 3, but writes into its state the contents of shelf 6 instead of shelf 7. Five steps later it ships from shelf 3 based on that belief and the environment rejects the action." |
| 16 | Nothing checks that write. Haiku did it in 17 of 24 long runs. | | A "schema ✓" badge sits on the bad line, green, untouched. Counter tiles: **Haiku 17 / 24** runs with a wrong patch at T=200; **Gemini 0 / 75** (muted). | `StatGrid` over `BeliefVsShelf` still | "the write is never checked against what the action did"; "Gemini never made this error in 75 episodes; Haiku wrote at least one wrong patch in 17 of 24 at T=200."; "a schema-valid patch with the wrong value in it, which passes every check the runtime runs" |
| 17 | On Haiku, keeping the transcript beside the notepad absorbed every slip that mattered. | | The notepad + transcript icon: the same wrong line appears on its notepad, but a thin thread from the scroll pulls the agent's hand to the right shelf; tag "same write errors · 0 failures from them". | `ScrollVsNotepad` (mode `insurance`) | "On Haiku it makes **the same kind of write error** … and loses nothing to it"; "None of its failures comes from its state."; "It cost Stateful nothing on Haiku and caught every wrong write that would have mattered." |
| 18 | So the notepad works, best when facts change. It doesn't forget. On some models, it misremembers. | | Verdict, full frame: the notepad card with two stamps, **DOESN'T FORGET** (gradient) and **MISREMEMBERS** (amber, smaller tag "some models"). | `KeyQuote` over `ScrollVsNotepad` still | "**Explicit state does what the paper says on the paper's model.**"; "Explicit state earns its place when facts get invalidated."; "**Its failure mode is writing, not remembering.**"; title |
| 19 | Check each write against what the action did, and keep the notepad last in the prompt. | | Two checklist items tick in: "✓ check the write against the action" (a little arrow from the rack up to the notepad line) and "✓ notepad last · cache the rest". | `ScrollVsNotepad` (mode `advice`) | "nothing in the runtime checks that the value matches what the action did. If you build on explicit state, that check is the part to add."; "**Put the mutating part last.** It is a one-line change" |
| 20 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Explicit State Doesn't Forget. It Misremembers." | outro | — |

**Word count (EN):** 15 + 13 + 16 + 15 + 14 + 17 + 14 + 17 + 15 + 16 + 14 + 17 + 12 + 13 + 16 +
13 + 13 + 16 + 16 + 3 = **285 words** (counting "7.5x", "1.4x", "5.2x" as one each); spoken
forms add ~6 ("seven and a half times", "one point four times", "five point two times", "skill
dot state"), so ~291 spoken. At Javier's measured ~0.37-0.42 s per word all-in (253 words →
107.4 s in what-has-already-happened), **~108-118 s**. Over the usual 105 s because it covers two
articles; the story (lines 2-4) is not to be cut.

**Captions:** estimated at 2.8 words/s, the densest lines are 6, 12 and 15 (~16-17 chars/s).
`npm run lint` after TTS is the gate; if one of them fails, shorten its second sentence.

If the TTS render runs long, cut in this order (never 1-4, 10-12, 14-15, 18):
1. Line 8 → "So I also ran the paper's own model, Gemini." (−9); the Claude flat lines stay on screen.
2. Line 17 → silent; the insurance visual carries it under line 16 (−13). Keep line 19.
3. Line 13 → "On Claude Haiku, the notepad came last." (−5).

## Spoken numbers (complete list)

| Spoken | Line | Why |
|---|---|---|
| "two hundred" (steps) | 5 | What "long task" means here. |
| "7.5x" → "seven and a half times", "1.4x" → "one point four times" | 6 | The cost result: tokens vs bill. |
| "5.2x" → "five point two times" | 7 | Prompt order, the line item to act on. |
| "75" (episodes) | 9 | The notepad's clean record on the paper's model. |
| "70 of 72" … "10" | 12 | The headline accuracy result. |
| "seven", "three", "six" (shelves) | 15 | The concrete slip, needed to follow it. |
| "17 of 24" | 16 | How common the slip is on Haiku. |

On screen only: 2,157 / 16,437, 869k / 168k, 0.99 / 1.00, 1.000 / 0.913 / 0.74, 24·22·24 vs
1·9·0, 0.999 / 0.974 / 0.958, step 132 / 137, Gemini 0 / 75.

## Notes for the build

- **`ScrollVsNotepad` (bespoke, the spine).** Scroll (unrolls one line per beat, top lines shrink
  into a stack, never erased) and notepad (fixed card, 4-6 key/value lines, pen strike + rewrite,
  scratch reasoning fading out), above a warehouse rack of numbered slots. Modes: `hook`,
  `scroll`, `notepad`, `promises`, `warehouse`, `models`, `correction`, `insurance`, `advice`.
  The key beat is `correction` (lines 10-11): both lines stay inked on the scroll while the
  notepad just rewrites one value.
- **`CacheBill` (bespoke).** Prompt-size meters (flat vs climbing), then a dashed "tokens" outline
  vs filled "bill" bar (7.5x vs 1.4x), with the cached glow as the mechanism; mode `order` shows
  the two stackings of notepad + transcript (869k vs 168k, 5.2x).
- **`CorrectionGrid` (bespoke).** Two blocks of 3 × 24 cells, filled per model exactly as the
  article's figure (24/22/24 vs 1/9/0); totals 70 / 72 and 10 / 72.
- **`BeliefVsShelf` (bespoke, the failure mechanism).** Belief row (notepad) over reality row
  (rack), scrubbed by step; they split at step 132 (Move 7 → 3 correct, patch writes shelf 6's
  contents); step 137 ship from 3, REJECTED; the notepad line does not change after the rejection
  (the article: "even an explicit rejection from the environment does not make it re-read that
  fact").
- **Numbers on screen exactly as written:** "2,157", "16,437", "7.5x", "1.4x", "5.2x", "869k",
  "168k", "0.99", "1.00", "1.000", "0.913", "0.74", "75 episodes", "70 / 72", "10 / 72", "24/24",
  "22/24", "1/24", "9/24", "0/24", "0.999", "0.974", "0.958", "17 / 24", "500 shelves",
  "200 steps", step "132" / "137".
  **Not shown:** "3/44 vs 44/44", "93 of 93", "18 of 82", "6.8% → 39.5%" (superseded by part 1's
  own Correction banner); "5.7x" (see factcheck); "$849 / $162" (part 2's isolated 5.2x is used).
- **Names:** "SKILL.state" (the paper's name), model chips "Claude Haiku 4.5", "Gemini 3 Flash",
  "Sonnet 5" (grid row only). No cloud providers named. Paper authors not on screen. The only
  brand on cards, poster and metadata is AGILabs.
- **Spoken forms:** "SKILL.state" → "skill dot state"; "7.5x" → "seven and a half times";
  "1.4x" → "one point four times"; "5.2x" → "five point two times"; "javieraguilar.ai" →
  "javier aguilar dot A I".
- Visuals are chosen for impact: the scroll, notepad, glow and rack are stylised; the rigour lives
  in the articles and the repo. Narration and numbers stay faithful.
- ES cut: pending (EN-only for now).

## Cold-viewer check (hook + story only, lines 1-4)

"A paper says AI agents should keep a small, constantly rewritten notepad of current facts
instead of rereading their whole growing conversation, and he rebuilt its test to see whether
that really is more accurate and cheaper." Passes: situation (agents reread a growing history),
the idea under test (a rewritable notepad), and why (promised accuracy and a smaller prompt) are
all clear before any number.
