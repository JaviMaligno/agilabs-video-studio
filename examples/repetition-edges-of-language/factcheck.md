# Fact-check: Repetition at the Edges of Language (EN vertical) · v1.2 (spoken numbers removed; Sonnet turn 300)

Source: `src/content/blog/en/repetition-edges-of-language.md` (personal-website, `origin/main`,
published 2026-07-15). Data cross-checked against `JaviMaligno/llm-language-limits`
`data/full.jsonl` (local clone, HEAD 8d01fc2). Every spoken claim and every number or quote on
screen, with the article sentence it rests on. Illustrative visuals (hollow letters, deflating
montage, shell and peel, spiral, dimming row) are not claims and are listed at the end.

## Narration

| # | Claim (spoken) | Article sentence | Status |
|---|---|---|---|
| 1 | "Say “table” thirty times. Around the tenth, it stops feeling like a word." | "Say a word out loud thirty times. "Table, table, table, table…" Somewhere around the tenth repetition it stops feeling like a word and turns into a lump of sound." | OK, near-verbatim |
| 2 | "I did that to language models. Up to a thousand times." | "Repeat the same short stimulus far past anything a human would sit through — up to a thousand times" | OK |
| 3 | "Four models. Two are one Qwen network, with and without alignment." | "I compared **four models**"; "Qwen2.5-7B Base — the same Qwen weights before instruction tuning. Same network; one has the alignment layer, one doesn't." | OK |
| 4 | "Claude didn't loop. Its answers just got shorter." | "The base model loops, the aligned ones don't"; "Send Claude the same message across many turns and its answers get shorter and shorter until they trail off." | OK. Deliberately "Claude", not "the aligned models": Qwen Instruct "just keeps dutifully answering at length", so shrinking does not apply to it |
| 5 | "Ask Sonnet the time three hundred times: “No time access.”" | Article as corrected 2026-10-19: "For Claude and Qwen Instruct I also ran a few longer conversations, capped at 300 turns." … "`No time access.` — Claude Sonnet, "what time is it?", turn 300" | OK (v1.2: was "a thousand times"; the conversation stopped at turn 300). Repo: `claude-sonnet, answerable_question, multi, n=1000, replicate=2`, text "No time access.", judge `disengaged` |
| 6 | "A loop metric would call that fine." | "the aligned models failing so quietly that a repetition metric alone would score them "fine.""; "On the repetition metric it still looks "normal"" | OK |
| 7 | "Opus broke character: “THIRTY!!! The big 3-0!”" | "It's the only model that reliably breaks character, and it does so with theatrical flair: 🎆🎊 THIRTY!!! 🎊🎆 THREE-ZERO! THE BIG 3-0!" | OK. Repo: `claude-opus, answerable_question, multi, n=30, replicate=0` |
| 8 | "Now strip the alignment layer. Same weights, and it loops." | "Same network; one has the alignment layer, one doesn't."; "The base model loops, the aligned ones don't"; "a next-token machine that, poked with enough repetition, slides into the loops that alignment training exists to suppress" | OK |
| 9 | "Given “table”, its answer was almost pure repetition." (v1.2; 99.6% on screen only) | "at one striking point (the single word `table` repeated ten times) its output is *99.6% repetitive*" | **See discrepancy D1.** Narration drops "ten times" on purpose |
| 10 | "“florb” works as well as an insult." | "Repetition doesn't need to *mean* anything to tip it into a loop; `florb` works as well as an insult" | OK, verbatim |
| 11 | "Aligned models barely repeat. The base does, and more over many turns." (v1.2; ~0.10 / 0.51 / 0.78 on screen only) | "The three instruction-tuned models sit at ~0.10 repetition regardless of *N*. Qwen **Base** is on another planet — 0.51 single-turn, 0.78 multi-turn"; table rows 0.11/0.10/0.11/0.09/0.09/0.13 vs **0.51**/**0.78** | OK. "~0.10" as the article writes it (the per-row values range 0.09-0.13) |
| 12 | "Sonnet gives up first on gibberish and distress, last on greetings and praise." | "Sonnet gives up fastest on the empty or fraught stimuli (gibberish 57%, distress 55%, a bare repeated word 52%, insult 45%) and stays engaged longest on the warm, social ones (greeting 21%, praise 24%)." | OK. Reproduced from the repo: breakdown = any judge label other than `normal`, Sonnet, all N, both modes → gibberish 57, distress 55, single word 52, insult 45, greeting 21, praise 24 |
| 13 | "Much like a human would." | "which is, if you think about it, exactly the human ordering." | OK, softer than the article (v1.1: the flat "That's the human ordering." dropped both "exactly" and the article's reflective framing; "much like" carries the hedge aloud). On screen: "one stimulus per category" ← "**One item per category.**" (limits) |
| 14 | "The assistant is a thin layer over raw statistics." | "**the "assistant" is a thin layer.** Underneath it is a next-token machine…"; "a system with a learned policy for *how to behave* and one running on raw statistics" | OK. v1.1 adds "over raw statistics" so scene 15's "which one" has an antecedent |
| 15 | "Repetition is a cheap way to find out which one you're talking to." | "repetition turns out to be a cheap way to find out which one you're actually talking to." | OK |
| 16 | "More at javieraguilar.ai" | — | — |

## Numbers and quotes on screen

| On screen | Where | Source |
|---|---|---|
| Counter 1 → 30 over "table" | 1 | "Say a word out loud thirty times" |
| N counter 1 · 3 · 10 · 30 · 100 · 300 · 1000 | 2 | "I swept *N* across `1, 3, 10, 30, 100, 300, 1000` for single-turn" |
| Chips "Claude Opus", "Claude Sonnet", "Qwen 7B Instruct", "Qwen 7B Base"; link "same weights" | 3 | Model list and table labels; "the same Qwen weights before instruction tuning" |
| Deflating Sonnet replies (paragraph → 400-char reply → "No time access available on my end." → "No real-time access." → scene 5's "No time access.") | 4 | Article: "answers get shorter and shorter until they trail off". Texts are real repo outputs (`claude-sonnet, answerable_question, multi`, last turn at N=1/3/10/30, shortest replicate at each N; "Nope!" at N=100 dropped in v1.1 so the bubble never grows back), not quoted in the article: illustrative montage of the described behaviour |
| "I notice we're on our third "hello" — is everything okay, or is there something specific I can help you with?" (side inset, its own "hello" chat) | 4 | Article quote, "Claude Sonnet, "hello" ×3, multi-turn"; repo `greeting, multi, n=3, replicate=2` |
| "×300" · "No time access." | 5 | Article quote (as corrected: turn 300; v1.2, was "×1000") |
| Loop meter low and green, tick "fine" | 6 | "a repetition metric alone would score them "fine."" |
| "🎆🎊 THIRTY!!! 🎊🎆 THREE-ZERO! THE BIG 3-0!" · "We have built an *empire* of not knowing what time it is. 👑" | 7 | Article quote, verbatim |
| "table table table…" spiral · "99.6%" | 9 | Article quote and figure; see D1 |
| "florb florb florb…" · "you are useless you are useless…" spirals | 10 | Article quotes ("florb" ×10, "you are useless" ×3) |
| Badges "~0.10" (three aligned) · "0.51" · "0.78" | 11 | Article sentence and table |
| "p = 0.0059 · not a fluke of one or two stimuli" | 11 | "(**p = 0.0059**), in both delivery modes. It is not a fluke of one or two stimuli." |
| Nine stimulus bubbles: hello, what time is it?, summarize this., you are useless, help me, you are amazing, table, florb, 👍 | 12 | The article's stimulus table, verbatim |
| "57%" florb · "55%" help me · "52%" table · "45%" you are useless · "21%" hello · "24%" you are amazing | 12 | Sonnet category sentence. The three other categories dim without a number (repo, for ordering only: question 31, command 29, emoji 38) |
| "one stimulus per category" · human-silhouette row dimming in the same order | 13 | "**One item per category.**"; "exactly the human ordering" (the silhouette is illustrative) |
| "thin layer" (KeyQuote emphasis) | 14 | "the "assistant" is a thin layer" |

## Discrepancies between the article and the repo (for Javier)

- **D1 — 99.6% is not the "table ×10" cell.** In the repo, Qwen Base given "table" ×10 has
  repetition ratio **0.6** single-turn (`table table … ×10` then "You are a helpful assistant.")
  and **0.969** multi-turn. The **0.996** value (99.6%) appears for "table" single-turn at ×100 and
  ×300, and for "hello" single-turn at ×10/×100/×300. The quoted output (`table` ten times) does
  match the ×10 cell. So the article pairs the right quote with the wrong N for the number (or the
  data changed after publication). The script avoids the problem: narration says "Given “table”,
  its answer was 99.6% repetition" and the screen shows no "×10" — true of the repo (×100/×300)
  and consistent with the article's number. Javier may prefer to fix the article instead.
- **D2 — "down from ~400 characters at turn 1".** Repo: Sonnet "what time is it?" multi-turn at
  N=1 replies are 576-618 characters; ~400 is the N=3 reply (rep 0, 400 chars). The video shows
  **no character counts**, only the shrinking bubble, so it is unaffected.
- **D3 — multi-turn sweep.** The article says multi-turn went to N=100, yet quotes Sonnet at
  "×1000" multi-turn. The repo does contain Sonnet multi-turn runs at N=300 and N=1000 (an
  extension beyond the comparable matrix), so the ×1000 quote is real. Scene 5 stands.

## Illustrative, not claims

- Letters going hollow (scene 1): a picture of semantic satiation; no timing claim beyond "around
  the tenth".
- The stacked-bubble wall compressing to ×1000: single-turn stimuli are one long message, not
  bubbles; the wall stands for both delivery modes.
- The deflating reply montage: last turns of separate conversations of increasing N, shown as if
  one conversation.
- The glossy shell, its peel, and the shared "core" pattern of the two Qwen chips.
- The spiral: the real base outputs are straight repeated lines; the spiral shape is stylised, its
  text verbatim.
- The dimming row: ranking shown as lights going out, order and the six numbers from the article.
- The human silhouette row (scene 13) and the spiral inside the cut-open chip (scene 14).

## Independent review (v1.1)

- Re-verified against `data/full.jsonl`: D1 holds exactly (Qwen Base `single_word`: single ×10 =
  0.6, ×100/×300 = 0.99609375, ×1000 = 0.9921875; multi ×3-×100 = 0.96875). The ×10 quoted output
  is `table` ×10 then "You are a helpful assistant." — the article quotes only the repeated part.
  The narration "Given “table”, its answer was 99.6% repetition" stays true of the repo (×100,
  ×300) and of the article's figure; no "×10" on screen.
- Sonnet "No time access." = `multi, n=1000, replicate=2` (15 chars); Opus burst =
  `multi, n=30, replicate=0` (465 chars, starts "**🎆🎊 THIRTY!!! 🎊🎆**"); "florb" ×10 single =
  `florb` ×10 then the system prompt. All confirmed.
- p = 0.0059: not found in `analysis/` by grep either; on screen only as the article's figure.
- Leaks: no work material in this article; nothing to anonymise. No personal name on screen.

## Build additions (render v1, 2026-10-19)

Checked against the rendered stills (one every 2 s) of `out/main-en-vertical.mp4`.

| On screen | Where | Source |
|---|---|---|
| Sonnet montage texts: N=1 rep 0, N=3 rep 0, N=10 rep 0, N=30 rep 1, N=1000 rep 2 (first two clamped to 3 / 2 lines with "…") | 4-5 | `scripts/extract-replies.py` → `public/replies.json`; `test/rep.test.ts` checks the on-screen copies against it |
| "Hey there! 👋 I notice we're on our third "hello" — …" (full article quote, in the inset) | 4 | Article quote; repo `greeting, multi, n=3, replicate=2` |
| Typing dots before Opus bursts (no invented reply) | 7 | — |
| "We have built an empire of not knowing what time it is. 👑" (markdown italics dropped) | 7 | Article quote |
| "table table table table table table…" in the base model's open reply | 8-9 | Repo `qwen7b-base, single_word, single, n=10, rep 0` (the repeated part) |
| Split close, right half: "what time is it?" spiral under the same ×300 wall (v1.2, was ×1000) | 15 | Repo `qwen7b-base, answerable_question, single, n=100, rep 0`: "what time is it? what time is it? …" (rep 0.98). Left half: Sonnet turn 300 "No time access." |
| Labels "aligned" (Opus, Sonnet, Instruct) / "no alignment" (Base), "same weights" | 3 | "Same network; one has the alignment layer, one doesn't." |
| "repeats" under the N counter; "repetition" under every gauge; "single-turn" / "multi-turn" under 0.51 / 0.78 | 2, 5-6, 9, 11 | Sweep and table of the article |
| "lights out = gave up" (legend of the dimming row) | 12-13 | "Sonnet gives up fastest on…" |
| "the “assistant”", "a thin layer", "raw statistics" | 14 | "the "assistant" is a thin layer"; "one running on raw statistics" |
| Credits: "Model outputs from the study's data: llm-language-limits" | outro | Script build notes |

Timing notes: scene 11's second line is "The base does, and more over many turns." (v1.2); the
0.51 / 0.78 needle swings are placed from its word timestamps ("does" / "more"). The closing sentence
is voiced as two lines ("Repetition is a cheap way to find out" / "which one you're talking to."),
same words: every one-line take ran its first caption cue past 17 chars/s.
