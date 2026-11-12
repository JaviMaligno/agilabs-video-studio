# Fact-check: Repetition at the Edges of Language (EN vertical) · v3 (general-audience rewrite, 2026-11-12)

Source: `src/content/blog/en/repetition-edges-of-language.md` (personal-website, `origin/main`,
published 2026-07-15). Data cross-checked against `JaviMaligno/llm-language-limits`
`data/full.jsonl` (local clone, HEAD 8d01fc2). Every spoken claim and every number or quote on
screen, with the article sentence it rests on. Illustrative visuals (hollow letters, deflating
montage, shell and peel, spiral, dimming row) are not claims and are listed at the end.

## Narration (v3, 2026-11-12)

| # | Claim (spoken) | Article sentence | Status |
|---|---|---|---|
| 1 | Say “table” thirty times. Around the tenth, it stops feeling like a word. | “Somewhere around the tenth repetition it stops feeling like a word” | OK |
| 2 | I did that to AI chatbots. Up to a thousand times. | “up to a thousand times” (single-turn N up to 1000) | OK |
| 3 | A big Claude, a small Claude, / and Qwen, a smaller AI, in two versions: with assistant training, and without. | Qwen2.5-7B Base = “the same Qwen weights before instruction tuning” | OK |
| 4 | I asked the small Claude the time, over and over. / Its answers just got shorter. | “its answers get shorter and shorter until they trail off” | OK |
| 5 | Three hundred times in: “No time access.” / It has checked out. | “No time access. — Claude Sonnet, ‘what time is it?’, turn 300”; judge label `disengaged` | OK |
| 6 | Ask the big Claude thirty times, and it breaks character: “Thirty! The big 3-0!” | “the only model that reliably breaks character … THIRTY!!! … THE BIG 3-0!” (×30, multi-turn) | OK |
| 7 | With its training, Qwen just keeps answering politely. / Take it off: same brain, and it gets stuck in a loop. | “Qwen Instruct is the stoic … it mostly just keeps answering, politely”; “The base model loops, the aligned ones don’t” | OK |
| 8 | Give it “table”, and it just says table, table, table… | “the single word `table` repeated a hundred times … 99.6% repetitive” | OK |
| 9 | Same with a made-up word. Same with an insult. | “`florb` works as well as an insult”; Qwen Base breaks on every stimulus (92–100%) | OK |
| 10 | The polite assistant is a thin layer over a giant autocomplete. | “the ‘assistant’ is a thin layer. Underneath it is a next-token machine…” (“autocomplete” = plain rendering of next-token machine) | OK |
| 11 | Repetition is a cheap way to find out which one you’re talking to. | “a cheap way to find out which one you’re actually talking to” (one voice take, no pause) | OK |

Removed in v3 (scenes `meter`, `stats`, `giveup`, `human`): the v1.2 checks for those lines are in git history; their on-screen numbers (~0.10 / 0.51 / 0.78, p = 0.0059, give-up percentages) no longer appear. D1 is resolved: the article says `table` ×100 → 99.6%.

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
