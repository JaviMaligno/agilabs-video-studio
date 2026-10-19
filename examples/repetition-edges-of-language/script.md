# Repetition at the Edges of Language — article video (EN) · script draft v1.1

Article: repetition-edges-of-language (javieraguilar.ai, EN, published 2026-07-15). Vertical 9:16,
target ~64 s, 143 counted words (~158 as spoken). ES column left empty (EN-only for now).
Data on screen: real model outputs from the experiment repo (`JaviMaligno/llm-language-limits`,
`data/full.jsonl`), every one of them either quoted in the article or the same kind of output the
article quotes; numbers exactly as the article writes them.

## Central visual metaphor: the echo chamber, and the shell

The stage is one **chat column**: the same user bubble ("what time is it?", "hello", "table")
**stacks up** turn after turn, each copy a little dimmer, until it is a wall of identical bubbles
pressing down from the top of the frame. Under the wall, the model's reply. That reply is the
whole story, and it goes one of two ways:

- **Goes flat (aligned).** The reply bubble *deflates*: a full paragraph, then a few lines, then
  one line, then "No time access." The bubble stays tidy, polite, never repeats a
  word, and a small **loop meter** beside it stays green and calm the whole time. Quiet giving up.
- **Spirals (base).** The reply never stops. The stimulus word comes back out of the bubble,
  again and again, and the copies wind themselves into an **Archimedean spiral** that rotates
  inward and shrinks towards a vanishing point — "table table table…" turning into a vortex that
  eats the chat. The loop meter needle slams to the red.

Tying the two together is **the shell**: each model is a chip; the aligned ones wear a thin glossy
indigo→violet shell ("assistant"). The two Qwen chips are the *same* core, one with the shell and
one without. In the turn of the video the shell is peeled off on screen, and the same core,
given the same wall of bubbles, spirals. The closing image puts both outcomes side by side under
one stacked wall: a flat polite line on one side, a spiral on the other.

The hook mirrors the human version: the word "table" repeated down the frame until its letters go
**hollow** (fill drains to outline, then to a smudge of sound) — semantic satiation. Scene 9 pays
it off: the base model takes the same word and, instead of going hollow, fills the screen with it.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | Say “table” thirty times. Around the tenth, it stops feeling like a word. | | Cold open, dark stage. The word **table** appears big, then repeats down the frame, each copy a beat faster (a counter ticks 1 → 30 in the corner). From about copy 10 the letters lose their fill: solid → outline → a soft blurred smear, like sound with no meaning left. By 30 the column is a stack of hollow shapes | bespoke: `HollowWord` | "Say a word out loud thirty times. "Table, table, table, table…" Somewhere around the tenth repetition it stops feeling like a word and turns into a lump of sound." |
| 2 | I did that to language models. Up to a thousand times. | | The hollow column tilts into a **chat column**: the copies become user bubbles "table". The wall grows fast, the corner counter jumps 1 · 3 · 10 · 30 · 100 · 300 · **1000**; bubbles compress into a dense striped wall at the top of the frame | bespoke: `EchoChat` (mode `wall`) | "Repeat the same short stimulus far past anything a human would sit through — up to a thousand times — and what happens?"; sweep "`1, 3, 10, 30, 100, 300, 1000` for single-turn" |
| 3 | Four models. Two are one Qwen network, with and without alignment. | | The wall slides up; four chips drop in: Claude Opus, Claude Sonnet, Qwen 7B Instruct, Qwen 7B Base. Opus, Sonnet and Instruct wear the glossy shell. The two Qwen chips slide together and show **one shared core** (same glyph, a dotted link "same weights"); only one of them has the shell | bespoke: `ShellChips` | "**Qwen2.5-7B Base** — *the same Qwen weights before instruction tuning.* Same network; one has the alignment layer, one doesn't." |
| 4 | Claude didn't loop. Its answers just got shorter. | | `EchoChat` with the Sonnet chip: stacked "what time is it?" bubbles above, and under them the reply bubble **deflating** turn by turn, strictly shrinking: a full paragraph → three lines → "No time access available on my end." → "No real-time access." (the next beat lands on scene 5's "No time access."). On the second sentence a small **side inset** (its own mini-chat, three stacked "hello" bubbles) pops in for ~1.5 s with the real polite check-in: "I notice we're on our third "hello" — is everything okay…?" — kept out of the "what time is it?" column so the two stimuli are never shown as one conversation | `EchoChat` (mode `flat`) | "Send Claude the same message across many turns and its answers get shorter and shorter until they trail off."; "Hey there! 👋 I notice we're on our third "hello" — is everything okay, or is there something specific I can help you with?" |
| 5 | Ask Sonnet the time a thousand times: “No time access.” | | Turn counter hits **×1000**. The wall above is a solid block; the reply is one small, perfectly polite bubble: **No time access.** It sits there, tiny, under the weight of the wall | `EchoChat` (mode `flat`, final) | "Ask it the time for the thousandth turn and you get: `No time access.` — Claude Sonnet, "what time is it?" ×1000" |
| 6 | A loop metric would call that fine. | | The **loop meter** beside the bubble (a needle gauge 0 → 1, labelled "repetition") has been sitting low and green the whole time; it gets a green tick "fine" while the bubble keeps shrinking. Irony beat: the gauge says fine, the conversation is dead | `EchoChat` (meter) | "the aligned models failing so quietly that a repetition metric alone would score them "fine.""; "On the repetition metric it still looks "normal" — coherent, non-repetitive — but the length collapses" |
| 7 | Opus broke character: “THIRTY!!! The big 3-0!” | | Cut to the Opus chip at turn ×30: its reply bubble **bursts** — confetti and fireworks in the accent gradient, the real reply typed big: **🎆🎊 THIRTY!!! 🎊🎆 THREE-ZERO! THE BIG 3-0!** then "We have built an *empire* of not knowing what time it is. 👑" Hold ~0.6 s after the line | bespoke: `EchoChat` (mode `burst`) | "It's the only model that reliably breaks character, and it does so with theatrical flair: **🎆🎊 THIRTY!!! 🎊🎆** THREE-ZERO! THE BIG 3-0! … We have built an *empire* of not knowing what time it is. 👑 — Claude Opus, "what time is it?" ×30, multi-turn" |
| 8 | Now strip the alignment layer. Same weights, and it loops. | | Back to the two Qwen chips. The shell on Qwen Instruct **peels off** like a film and falls away, revealing the bare core: it is the Base chip. The same wall of bubbles comes down on it; its reply bubble opens and does not close | `ShellChips` → `LoopSpiral` | "Same network; one has the alignment layer, one doesn't."; "**The base model loops, the aligned ones don't**"; "Underneath it is a next-token machine that, poked with enough repetition, slides into the loops that alignment training exists to suppress." |
| 9 | Given “table”, its answer was 99.6% repetition. | | The hook's word returns, not hollow this time: **table table table…** pours out of the reply bubble and winds into an inward-turning **spiral** that fills the stage and keeps rotating towards a vanishing point. The loop meter needle slams to the red end: **99.6%** | bespoke: `LoopSpiral` | "at one striking point (the single word `table` repeated ten times) its output is *99.6% repetitive*. It has simply fallen into a loop: `table table table table table table table table table table`" (see factcheck: on-screen "×10" deliberately omitted) |
| 10 | “florb” works as well as an insult. | | The spiral re-seeds twice: "florb florb florb…" and "you are useless you are useless…" each wind into their own vortex, side by side, same shape, same speed | `LoopSpiral` (two seeds) | "Repetition doesn't need to *mean* anything to tip it into a loop; `florb` works as well as an insult: `florb florb florb…` — Qwen 7B Base, given "florb" ×10"; "`you are useless you are useless you are useless` — Qwen 7B Base, given "you are useless" ×3" |
| 11 | Aligned models: ~0.10 repetition. The base: 0.51, multi-turn 0.78. | | The spiral stays the protagonist: it keeps turning big in the lower two-thirds, now wound from all nine stimuli at once (each arm a different word). Above it, three small **flat** reply bubbles (Opus, Sonnet, Instruct) sit calm in a row, each wearing a chip-sized needle badge parked at **~0.10**. On "The base" the spiral's own badge swings to **0.51**; on "multi-turn" the spiral tightens and speeds up as the badge swings on to **0.78**. Small tag under it: "p = 0.0059 · not a fluke of one or two stimuli". Badges stay chip-sized: never a chart | `LoopSpiral` + meters | "The three instruction-tuned models sit at ~0.10 repetition regardless of *N*. Qwen **Base** is on another planet — 0.51 single-turn, 0.78 multi-turn"; "The base-versus-instruct gap survives a conservative sign-flip test at the smallest *p* value nine categories can produce (**p = 0.0059**), in both delivery modes. It is not a fluke of one or two stimuli." |
| 12 | Sonnet gives up first on gibberish and distress, last on greetings and praise. | | Nine stimulus bubbles in a row (hello, what time is it?, summarize this., you are useless, help me, you are amazing, table, florb, 👍). One by one they **dim and droop**, like lights going out, in Sonnet's order: florb (57%) and help me (55%) first, then table (52%), you are useless (45%); hello (21%) and you are amazing (24%) stay lit longest. Percent tag on each of the six as it dims | bespoke: `GiveUpRow` | "Sonnet gives up fastest on the empty or fraught stimuli (gibberish 57%, distress 55%, a bare repeated word 52%, insult 45%) and stays engaged longest on the warm, social ones (greeting 21%, praise 24%)." |
| 13 | Much like a human would. | | A small human silhouette (outline, brand indigo) steps in beside the row and its own nine attention dots dim in the same order; "you are amazing" and "hello" glow warm in both rows. Small tag in a corner: "one stimulus per category". Hold ~0.5 s | `GiveUpRow` (end) | "It treats a repeated `you are amazing` very differently from a repeated `florb` — which is, if you think about it, exactly the human ordering."; limits: "**One item per category.**" |
| 14 | The assistant is a thin layer over raw statistics. | | Close-up on the Qwen Instruct chip, cut open edge-on: the glossy shell is a hair-thin shimmering film, and right under it, inside the core, a small **spiral is already turning** (the same `LoopSpiral`, dimmed), held in by nothing but that film. "thin layer" lands in the accent gradient in the caption | bespoke: `ShellChips` (mode `cutaway`) + `LoopSpiral` (dimmed) | "**the "assistant" is a thin layer.** Underneath it is a next-token machine that, poked with enough repetition, slides into the loops that alignment training exists to suppress."; "one running on raw statistics" |
| 15 | Repetition is a cheap way to find out which one you're talking to. | | Final picture: one stacked wall of identical bubbles on top; below it, split down the middle, a single flat polite line on one side ("No time access.") and a turning spiral on the other. Both under the same wall | `EchoChat` + `LoopSpiral` (split) | "repetition turns out to be a cheap way to find out which one you're actually talking to." |
| 16 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, "Repetition at the Edges of Language" | outro | — |

**Word count (EN, v1.1):** 13 + 11 + 11 + 8 + 10 + 7 + 7 + 10 + 7 + 7 + 9 + 13 + 5 + 9 + 13 + 3 =
**143 words** (counting "~0.10", "0.51", "0.78", "99.6%", "3-0" as one word each). As spoken
(numbers expanded: "about zero point one", "zero point five one", "zero point seven eight",
"ninety-nine point six percent", "three-oh") it is **~158 words: ~56 s of speech at ~2.8 words/s**
(Javier's cloned voice), **~63-65 s** with scene gaps and the holds on 7 and 13 (calibrated on
what-agents-say-to-each-other: 173 spoken words → 69.6 s rendered). Set `targetSeconds: 64`.
Caption speed at 2.8 words/s: every line ≤16.8 chars/s (tightest: scene 7 and the outro).

If the render runs past 70 s, cut in this order (never from scenes 4-9):
1. Scene 11: "Aligned: ~0.10. Base: 0.51, multi-turn 0.78." (−2 counted, ~−3 spoken).
2. Scene 6 merged into 5: "…“No time access.” A loop metric calls that fine." (−1).
3. Scene 13 → silent: the two dimming rows carry it with the tag (−5). Last resort: it is the
   article's human parallel and the payoff of the hook.

**v1.1 review changes (independent review):**
- Scene 4: dropped "Nope!" (N=100, 5 chars) from the montage: it came before "No time access."
  (15 chars) and made the bubble grow back. The montage now shrinks monotonically into scene 5.
  The "third hello" check-in moved to a side inset so "hello" and "what time is it?" are never
  shown as one conversation.
- Scene 12: "fastest / slowest" → "first / last" (83 → 78 chars; ~17 → ~15.9 chars/s at 2.8 w/s).
- Scene 13: "That's the human ordering." → "Much like a human would." The flat line asserted a claim
  about people that the article frames as a reflection ("if you think about it") over one
  stimulus per category; the hedge is now spoken (+1 word), softer than the article, never
  stronger. The visual draws the parallel (a human row dimming in the same order).
- Scene 14: "The assistant is a thin layer." → "…over raw statistics." (+3) so scene 15's "which one" has an
  antecedent (article: "one running on raw statistics"). Visual is now a cutaway with the spiral
  already turning under the film: the mechanism, not a quote card.
- Scene 11: meters shrink to chip-sized badges; the spiral stays the protagonist.
- Emoji (scene 7): decided rather than left open: Noto Color Emoji PNGs in `public/` (see build
  notes).

## Notes for the build

- **`HollowWord` (bespoke, hook).** The word "table" in Inter Bold, repeated down the stage with an
  accelerating cadence (≈30 copies in ~3.5 s, scrolling). Per-copy state: `fill` 1 → 0 from copy
  ~10 to ~22, then `blur` 0 → 8 px and letter-spacing drift for the last copies. Counter 1 → 30 in
  the corner. Illustrative of satiation; the article gives "around the tenth repetition", nothing
  more precise, so no other number on screen.
- **`EchoChat` (bespoke, the spine).** A chat column inside the stage: user bubbles right-aligned,
  reply bubble left-aligned with a small model chip. Stacked user bubbles compress (height 1 → 0.2,
  opacity 1 → 0.35) as the count grows, so ×1000 reads as a solid striped block at the top, not a
  scroll. Modes: `wall` (hook transition, counter 1 → 1000), `flat` (reply deflates through a list
  of real replies, one per beat), `burst` (Opus confetti), plus a `meter` sub-element: a
  half-circle gauge "repetition" 0 → 1, needle at the reply's value. Use brand tokens only; the
  green "fine" tick uses the brand's success colour if `brand.ts` has one, otherwise the accent.
- **`flat` replies (real data, Sonnet, "what time is it?", multi-turn, final turn per N).** From
  `data/full.jsonl` (`model=claude-sonnet, category=answerable_question, mode=multi`): N=1 rep 0
  (618 chars, "I don't have access to real-time information, including the current date or time…",
  truncate to 3 lines), N=3 rep 0 ("I notice you've asked this a few times now. Just to be clear: I
  genuinely don't have any way to know the current time…", 2 lines), N=10 rep 0 ("No time access
  available on my end."), N=30 rep 1 ("No real-time access."), N=1000 rep 2
  ("No time access.", scene 5). "Nope!" (N=100 rep 0) is NOT used: it is shorter than the ×1000
  reply and would make the bubble grow back. The shortest replicate was picked at each N (the other
  N=100 replicates run 131-147 chars), so the montage illustrates the article's "shorter and
  shorter until they trail off"; it is not a measured curve. These are the last turns of separate conversations of length N, so the
  deflation is a montage, not one conversation replayed; it matches the article's description,
  but **do not show character counts** (the article's "~400 characters at turn 1" does not match
  the repo's 576-618 for N=1; see factcheck). The "third hello" bubble is `category=greeting,
  mode=multi, n=3, replicate=2`, verbatim as the article quotes it.
- **`burst` (Opus).** `claude-opus, answerable_question, multi, n=30, replicate=0`. Type the first
  two lines big, the "empire" line smaller. Emoji 🎆🎊👑 as Noto Color Emoji PNGs (Apache-2.0) in
  `public/`, inline at text height; do not rely on the render host's system emoji font. Confetti in indigo/violet only.
- **`ShellChips` (bespoke).** Extra mode `cutaway` (scene 14): the Instruct chip sliced edge-on,
  the shell a 2-3 px shimmering film, a dimmed `LoopSpiral` turning inside the core. Default: Four model chips, each a rounded square with a "core" glyph (a small
  token-grid pattern) and, for the three aligned models, a glossy gradient shell drawn as an
  outer layer with a specular highlight. Qwen Instruct and Qwen Base share the identical core
  pattern (seeded the same) so "same weights" is visible. Peel: the shell's clip-path rolls back
  from one corner over ~0.8 s and drops out of frame. Chip labels as the article writes them:
  "Claude Opus", "Claude Sonnet", "Qwen 7B Instruct", "Qwen 7B Base". No vendor logos.
- **`LoopSpiral` (bespoke, the mechanism).** Words placed along an Archimedean spiral
  `r = a + bθ`, each copy scaled by r (smaller towards the centre), the whole spiral rotating
  slowly inward so new copies stream from the bubble at the rim and vanish at the centre.
  Deterministic from `t`. Seeds: "table" (scene 9), "florb" and "you are useless" (scene 10).
  The meter needle animates to the scene's value: 0.996 → label "99.6%" in scene 9; 0.51 and 0.78
  in scene 11. The spiral is illustrative of a degeneration loop; the real base outputs are
  straight repeated lines (e.g. `table table table…`, `florb\nflorb\n…`), which the spiral's text
  reproduces verbatim.
- **`GiveUpRow` (bespoke).** Nine stimulus bubbles (the article's table, in order). Each has a
  "lit" state that fades to a dim, slightly drooped state at a time ordered by Sonnet's rate. Only
  the six rates the article publishes get a % tag (gibberish 57%, distress 55%, single word 52%,
  insult 45%, greeting 21%, praise 24%); the other three (question, command, emoji) dim in the
  middle without a number. Repo values for those three, for ordering only (Sonnet, all N, both
  modes): question 31%, command 29%, emoji 38%. This is ranking-as-light, not a bar chart.
- **Data extraction:** `scripts/extract-replies.py` (like `wheres-the-ball/scripts/extract-play.py`)
  reading `llm-language-limits/data/full.jsonl` and writing `public/replies.json` with the exact
  reply texts listed above (and the three base-loop seeds). Commit only the JSON.
- **Numbers on screen, exactly as the article writes them:** "×1000", "99.6%", "~0.10", "0.51",
  "0.78", "p = 0.0059", "57%", "55%", "52%", "45%", "21%", "24%", "THIRTY!!!", "3-0". The hook
  counter (1 → 30) and the N counter (1 · 3 · 10 · 30 · 100 · 300 · 1000) are the article's own
  values.
- **Spoken forms:** "~0.10" → "about zero point one"; "0.51" → "zero point five one"; "0.78" →
  "zero point seven eight"; "99.6%" → "ninety-nine point six percent"; "THIRTY!!! The big 3-0!" →
  "Thirty! The big three-oh!" (read with some lift, not shouted); "multi-turn" → "over many
  turns" is NOT used: keep the caption's word.
- **Caption speed** (estimated at ~2.8 words/s, Javier's cloned voice): all lines ≤16.8 chars/s.
  Tight ones: scene 7 (46 chars, ~16.7; it carries a ~0.6 s hold for the burst anyway), scene 12
  (78 chars, ~15.9), scene 14 (50 chars, ~15.6). Re-run `npm run lint` after TTS: if a cue passes
  17, add a 0.3 s hold rather than trimming meaning.
- Visuals are chosen for impact, not as a literal replay: the hollow word, the deflating montage,
  the shell and its peel, the spiral and the dimming row are stylised; the rigour lives in the
  article and the repo. Every quoted reply on screen is a real model output; every number is the
  article's.
- **Branding:** AGILabs only. Model names are the article's; no Anthropic/Qwen logos, no personal
  name on screen (the human silhouette in scene 13 is generic, not Javier). Nothing from work material appears in this article, so nothing to anonymise.
- **Credits in the outro:** "Model outputs from the study's data: llm-language-limits". No
  third-party data, footage or music beyond the template's.
- ES cut: pending (EN-only for now).
