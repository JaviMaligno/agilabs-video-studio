# Fact-check: Repetition at the Edges of Language (EN vertical) · v2.0

Source: `src/content/blog/en/repetition-edges-of-language.md` (personal-website, `origin/main`,
published 2026-07-15; numbers as corrected in 31a49777 "align numbers with the data"). Data cross-checked against `JaviMaligno/llm-language-limits`
`data/full.jsonl` (local clone, HEAD 8d01fc2). Every spoken claim and every number or quote on
screen, with the article sentence it rests on. Illustrative visuals (hollow letters, deflating
montage, shell and peel, spiral, dimming row) are not claims and are listed at the end.

## Narration (v2.0)

| # | Claim (spoken) | Article sentence | Status |
|---|---|---|---|
| 1 | "Say “table” over and over. Soon it stops feeling like a word." | "Say a word out loud thirty times. "Table, table, table, table…" Somewhere around the tenth repetition it stops feeling like a word" | OK, looser than the article (no count claimed); counter 1 → 30 on screen |
| 2 | "I did the same to language models: one short message, repeated up to a thousand times." | "Repeat the same short stimulus far past anything a human would sit through — up to a thousand times" | OK. **Spoken figure: "a thousand"** (the only one) |
| 3 | "In one prompt, or turn after turn." | "**Single-turn:** the stimulus repeated *N* times inside one message"; "**Multi-turn:** the same stimulus sent once per turn, for *N* turns" | OK. Not every N was run in both modes (multi-turn to N=100 in the comparable matrix); the line names the two modes, not their ranges |
| 4 | "I tried it on polished assistants like Claude, / and on one Qwen network, with and without its alignment layer." | "I compared **four models**"; "Qwen2.5-7B Base — the same Qwen weights before instruction tuning. Same network; one has the alignment layer, one doesn't." | OK. "Polished" is the article's word ("the polished ones don't break") |
| 5 | "Claude doesn't break. It quietly gives up." | Description: "the polished ones don't break — they quietly give up"; section "The aligned models don't break — they give up" | OK. Said of Claude (the montage is Sonnet); Qwen Instruct "keeps dutifully answering", so the line is not extended to it |
| 6 | "Its replies get shorter and shorter until they trail off." | "Send Claude the same message across many turns and its answers get shorter and shorter until they trail off." | OK, near-verbatim |
| 7 | "Keep asking Sonnet the time, and you end up with: “No time access.”" | "Ask it the time for the three-hundredth turn and you get: `No time access.` — Claude Sonnet, "what time is it?", turn 300" | OK. No count spoken; screen says "turn 300" (see D3) |
| 8 | "A loop metric would call that fine." | "a repetition metric alone would score them "fine.""; "On the repetition metric it still looks "normal"" | OK |
| 9 | "Opus even broke character: “We have built an empire of not knowing what time it is.”" | "It's the only model that reliably breaks character, and it does so with theatrical flair: … We have built an *empire* of not knowing what time it is. 👑" | OK, quote verbatim (italics not voiced). Repo `claude-opus, answerable_question, multi, n=30, replicate=0` |
| 10 | "Now strip the alignment layer. Same weights, and it loops." | "Same network; one has the alignment layer, one doesn't."; "The base model loops, the aligned ones don't" | OK |
| 11 | "Give it “table”, and it just says “table”, again and again." | "(the single word `table` repeated a hundred times) its output is *99.6% repetitive*. It has simply fallen into a loop: `table table table …` — Qwen 7B Base, given "table" ×100" | OK. 99.6% and ×100 on screen only. D1 resolved by the article correction |
| 12 | "“florb” works as well as an insult." | "Repetition doesn't need to *mean* anything to tip it into a loop; `florb` works as well as an insult" | OK, verbatim |
| 13 | "On a repetition score, the polished ones stay low. / The raw one is on another planet." | "The three instruction-tuned models sit at ~0.10 repetition regardless of *N*. Qwen **Base** is on another planet — 0.51 single-turn, 0.78 multi-turn" | OK; "on another planet" is the article's phrase. ~0.10 / 0.51 / 0.78 and p = 0.0059 on screen only |
| 14 | "Sonnet gives up first on gibberish and distress, last on greetings and praise." | "Sonnet gives up fastest on the empty or fraught stimuli (gibberish 57%, distress 55%, …) and stays engaged longest on the warm, social ones (greeting 21%, praise 24%)." | OK. Percentages on screen only |
| 15 | "Much like a human would." | "which is, if you think about it, exactly the human ordering." | OK, softer than the article; on screen "one stimulus per category" ← "**One item per category.**" |
| 16 | "The assistant is a thin layer over raw statistics." | "**the "assistant" is a thin layer.**"; "one running on raw statistics" | OK |
| 17 | "Repetition is a cheap way to find out / which one you're talking to." | "repetition turns out to be a cheap way to find out which one you're actually talking to." | OK |
| 18 | "More at javieraguilar.ai" | — | — |

**Spoken figures (complete list):** "a thousand" (scene 2). Everything else numeric is on screen
only.

## Numbers and quotes on screen (scene numbers v2.0)

| On screen | Where | Source |
|---|---|---|
| Counter 1 → 30 over "table" | 1 | "Say a word out loud thirty times" |
| N counter 1 · 3 · 10 · 30 · 100 · 300 · 1000 | 2 | "I swept *N* across `1, 3, 10, 30, 100, 300, 1000` for single-turn" |
| Chips "Claude Opus", "Claude Sonnet", "Qwen 7B Instruct", "Qwen 7B Base"; link "same weights" | 4 | Model list and table labels; "the same Qwen weights before instruction tuning" |
| Deflating Sonnet replies (paragraph → 400-char reply → "No time access available on my end." → "No real-time access." → scene 5's "No time access.") | 6 | Article: "answers get shorter and shorter until they trail off". Texts are real repo outputs (`claude-sonnet, answerable_question, multi`, last turn at N=1/3/10/30, shortest replicate at each N; "Nope!" at N=100 dropped in v1.1 so the bubble never grows back), not quoted in the article: illustrative montage of the described behaviour |
| "I notice we're on our third "hello" — is everything okay, or is there something specific I can help you with?" (side inset, its own "hello" chat) | 6 | Article quote, "Claude Sonnet, "hello" ×3, multi-turn"; repo `greeting, multi, n=3, replicate=2` |
| "turn 300" · "No time access." | 7 | Article quote (corrected: turn 300, not ×1000; see D3) |
| Loop meter low and green, tick "fine" | 8 | "a repetition metric alone would score them "fine."" |
| "🎆🎊 THIRTY!!! 🎊🎆 THREE-ZERO! THE BIG 3-0!" · "We have built an *empire* of not knowing what time it is. 👑" | 9 | Article quote, verbatim; only the "empire" sentence is voiced |
| "table table table…" spiral · "99.6%" · "×100" | 11 | Article quote and figure, ×100 as corrected (D1 resolved) |
| "florb florb florb…" · "you are useless you are useless…" spirals | 12 | Article quotes ("florb" ×10, "you are useless" ×3) |
| Badges "~0.10" (three aligned) · "0.51" · "0.78" | 13 | Article sentence and table |
| "p = 0.0059 · not a fluke of one or two stimuli" | 13 | "(**p = 0.0059**), in both delivery modes. It is not a fluke of one or two stimuli." |
| Nine stimulus bubbles: hello, what time is it?, summarize this., you are useless, help me, you are amazing, table, florb, 👍 | 14 | The article's stimulus table, verbatim |
| "57%" florb · "55%" help me · "52%" table · "45%" you are useless · "21%" hello · "24%" you are amazing | 14 | Sonnet category sentence. The three other categories dim without a number (repo, for ordering only: question 31, command 29, emoji 38) |
| "one stimulus per category" · human-silhouette row dimming in the same order | 15 | "**One item per category.**"; "exactly the human ordering" (the silhouette is illustrative) |
| "thin layer" (KeyQuote emphasis) | 16 | "the "assistant" is a thin layer" |

## Discrepancies between the article and the repo (for Javier)

- **D1 — RESOLVED in the article (31a49777): now "table" ×100.** Original note: 99.6% is not the "table ×10" cell. In the repo, Qwen Base given "table" ×10 has
  repetition ratio **0.6** single-turn (`table table … ×10` then "You are a helpful assistant.")
  and **0.969** multi-turn. The **0.996** value (99.6%) appears for "table" single-turn at ×100 and
  ×300, and for "hello" single-turn at ×10/×100/×300. The quoted output (`table` ten times) does
  match the ×10 cell. So the article pairs the right quote with the wrong N for the number (or the
  data changed after publication). The script avoids the problem: narration says "Given “table”,
  its answer was 99.6% repetition" and the screen shows no "×10" — true of the repo (×100/×300)
  and consistent with the article's number. Javier may prefer to fix the article instead.
- **D2 — RESOLVED in the article (now "~600 characters at turn 1").** Original note: "down from ~400 characters at turn 1". Repo: Sonnet "what time is it?" multi-turn at
  N=1 replies are 576-618 characters; ~400 is the N=3 reply (rep 0, 400 chars). The video shows
  **no character counts**, only the shrinking bubble, so it is unaffected.
- **D3 — UPDATED v2.0: the article now says "turn 300".** The long conversation that produced "No time access." was capped at 300 turns (article: "a few longer conversations, capped at 300 turns"), even though the repo record is labelled `n=1000`. The video shows "turn 300" and drops ×1000 from scenes 7 and 17. Original note (v1.1): The article says multi-turn went to N=100, yet quotes Sonnet at
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
| Split close, right half: "what time is it?" spiral under the same ×1000 wall | 15 | Repo `qwen7b-base, answerable_question, single, n=100, rep 0`: "what time is it? what time is it? …" (rep 0.98). Left half: Sonnet ×1000 "No time access." |
| Labels "aligned" (Opus, Sonnet, Instruct) / "no alignment" (Base), "same weights" | 3 | "Same network; one has the alignment layer, one doesn't." |
| "repeats" under the N counter; "repetition" under every gauge; "single-turn" / "multi-turn" under 0.51 / 0.78 | 2, 5-6, 9, 11 | Sweep and table of the article |
| "lights out = gave up · % of replies" (legend of the dimming row) | 12-13 | "Sonnet gives up fastest on…"; the % are the per-category breakdown (disengagement) rates of Sonnet's replies, "gibberish 57%, distress 55%, …" |
| "the “assistant”", "a thin layer", "raw statistics" | 14 | "the "assistant" is a thin layer"; "one running on raw statistics" |
| Credits: "Model outputs from the study's data: llm-language-limits" | outro | Script build notes |

Timing notes: scene 11's last two lines were voiced as one ("The base: 0.51, multi-turn 0.78.");
the 0.51 / 0.78 needle swings are placed from that line's word timestamps. The closing sentence
is voiced as two lines ("Repetition is a cheap way to find out" / "which one you're talking to."),
same words: every one-line take ran its first caption cue past 17 chars/s.

## Changes from feedback (v2.0, 2026-10-19)

Javier: too many numbers spoken. Narration rewritten (see `script.md`, "Changes from feedback"):
spoken figures went from eleven (incl. "ninety-nine point six percent" and the chained "about zero
point one … zero point five one … zero point seven eight") to one, "a thousand". New setup scene
(3: "In one prompt, or turn after turn.") so the test is clear before the results. Every claim
re-checked against the article as corrected on `origin/main` (31a49777): scene 7 now matches
"turn 300", scene 11's on-screen ×100 matches the corrected 99.6% cell. **Build changes needed:**
scene 7 counter stops at "turn 300"; closing wall loses "×1000"; scene 11 badge gains "×100";
new `EchoChat` mode `modes` for scene 3; `targetSeconds` 64 → 78.
