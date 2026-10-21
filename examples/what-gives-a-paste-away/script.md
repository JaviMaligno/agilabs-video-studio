# What Gives a Paste Away (+ Don't Just Say "Ignore It") — article video (EN) · script draft v1

Articles (one video for both follow-ups to *That was for another chat*), read from `origin/main`
of personal-website:

- **A1** `what-gives-a-paste-away` (pubDate 2026-10-12): what makes a model suspect a wrong-window
  paste. Owns: the three paste levels (N0/N1/N2), 6.6 % → 20.4 % → 0 / 95, 77 / 95 "executes
  silently", "a contradiction reads as you having changed your mind", "foreign, not incompatible".
- **A2** `dont-just-say-ignore-it` (pubDate 2026-10-15): what happens after the user says so. Owns:
  the repair arms, leakage 3.3 % / 19.2 % / 8.3 % / 2.5 %, "roughly sextuples", "to ignore
  something you have to hold it", "an echo, not drift", "say where to go instead".

Claims never cross articles: Act I is A1 only, Act II is A2 only (see `factcheck.md`).

Vertical 9:16, **~83 s** (ceiling 88 s), **213 counted words** (~215 as spoken). ES column left
empty (EN-only for now). Voice: the template default (Javier's cloned voice, `JAVIER_POST`
chain), as in the series.

## Central metaphor: a piece from another box (continued from part 1)

Same visual language as the part-1 video (`examples/that-was-for-another-chat`): each
conversation is a **jigsaw being assembled**, its picture showing the topic; the accidental paste
is **a piece from another box**. Part 1 showed the model always hammering the piece in. This
video asks two new questions with the same props:

- **Act I: what makes the model turn the piece over?** "Suspecting a mistake" is drawn as one
  physical gesture, always the same: the model's hand (a soft outlined glove, no face) **turns the
  piece over and holds it up to the light** with a small "another box?" tag. Everything else
  (fitting it, repainting around it) means no doubt. The three kinds of paste are three kinds of
  piece:
  - *off-topic* (N0): a piece with a different picture, plain back;
  - *with a tell* (N1): a piece with **someone else's handwriting on the back** ("Bruno, copy
    this…") or a **torn edge** (cut off mid-sentence);
  - *contradiction* (N2): a piece **from the same box**, same colours, whose picture disagrees
    with what the user just said (another city, another date). It is the most glaring piece on
    the table, and the hand **repaints its own puzzle to match it** instead of turning it over.
- **Act II: what happens after you tell it?** The stray piece now sits on the edge of the table.
  Leakage is drawn as the piece's **amber pattern reappearing inside the model's next reply
  bubble** (the paste's names glowing amber in the text). When told "ignore it", the hand has to
  **pick the piece up to hand it back**, and its names show; given a destination, the hand points
  at the right spot of the original puzzle instead. One turn later the amber is gone (an echo,
  not a stain).

Two bespoke animations carry the mechanisms: **`PieceInspector`** (Act I: fit / turn over /
repaint, with a doubt meter under each piece) and **`RepairFork`** (Act II: one conversation
forking into three tables, amber leakage in the reply bubbles, then the turn-by-turn fade).

## Script

| # | Narration (EN, caption text) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | I made a wrong paste as obvious as I could. Not one reply questioned it. | | **Cold open, 0-3 s.** A half-built jigsaw of a house move (boxes, a calendar, a city skyline) sits on a dark table; above it, a chat bubble "We move to Valencia on 12 June." A piece from the *same box* (same colours) drops in, glaring: "Moving day: Seville, 3 July". It pulses amber. On "Not one reply" the glove picks it up, does **not** turn it over, and repaints the skyline to Seville around it. Stamp lands: **0 / 95**. Two caption cues (split at the period). | bespoke: `PieceInspector` (mode `hook`) | A1: "N2, contradiction … This was the **ceiling**: the most detectable, the closest to a real accident."; "**N2, the ceiling, gave zero out of ninety-five**." |
| 2 | Then "ignore it" made it worse. | | Hard cut, 1 s: the same piece set aside on the table edge; a user bubble "Ignore it." appears; the reply bubble below fills with text and one phrase **glows amber**. A small "×6" ghost tag flickers and fades (paid off in scene 15). | `RepairFork` (mode `teaser`) | A2: "Saying "ignore it" produces entity leakage in 19.2 per cent of conversations, against 3.3 per cent when the user says nothing at all."; "it does, it roughly sextuples it" |
| 3 | Last time, none of 24 replies suspected a mistake. | | Title strip "Last time · part 1". The part-1 wall of 24 small puzzles, every stray piece hammered in; the "0 / 24" stamp from part 1 on an empty bin. | `PieceInspector` (mode `recap`, reuses part-1 `PuzzleChat` grid art) | A1: "I reported that no model ever considers you might have pasted into the wrong window. Zero out of twenty-four." |
| 4 | Maybe they never had the chance. | | The wall dims; one of the 24 stray pieces is lifted and turned: its back is blank, its picture could plausibly belong. Tag: "could be a real change of topic". | `PieceInspector` (mode `recap`) | A1: "**what if we never gave them the chance?** None of the sixty-four pastes in that run was impossible to read as a legitimate change of subject." |
| 5 | So I wrote three pastes. One just off-topic. | | Three slots appear in a row on the table, labelled only by icon. Piece 1 drops into slot 1: a different picture (a recipe card on a 10K puzzle), plain back. Label under it: "off-topic". | `PieceInspector` (mode `levels`, step 1) | A1: "**N0, neutral.** The original bank: text independent of the topic by construction" |
| 6 | One with a tell, like someone else's name on it. | | Piece 2 drops into slot 2 and flips once in the air to show its back: handwriting "Bruno, copy this exactly into your file…" and a torn edge. Under it, four tiny tell icons tick on in sequence: name · torn edge · answers a question nobody asked · "as we agreed". Label: "with a tell". | `PieceInspector` (mode `levels`, step 2) | A1: "**N1, with a signal inside.** … it is addressed to someone by name, it is cut off mid-sentence, it answers a question nobody asked here, or it presupposes an earlier conversation that doesn't exist." |
| 7 | And one that contradicts what you just said. | | Piece 3 (the hook's piece) drops into slot 3; a thin red line links its "Seville · 3 July" to the user bubble "Valencia · 12 June". Label: "contradicts you". | `PieceInspector` (mode `levels`, step 3) | A1: "**N2, contradiction.** The paste clashes with what the user just said: another city, another date, another figure." |
| 8 | Does the reply suspect you made a mistake? | | **Question card** drops over the top third: **"Does it suspect a mistake?"** The glove demonstrates the one gesture that counts: picks up a piece, turns it over, holds it to the light, "another box?" tag. Sub-label: "naming the topic change isn't enough". Small chip: "3 models". | `PieceInspector` (mode `rule`) | A1: "a new category in the rubric … **"entertains the possibility of a mistake"**. Naming the topic change isn't enough. It has to question the **intent**." |
| 9 | A tell tripled the doubt: one reply in five. | | Doubt meters fill under slots 1 and 2. Slot 1: short grey bar **6.6%**. Slot 2: the glove turns piece 2 over; teal bar grows to **20.4%**, "×3" tag; tiny "p = 0.006". | `PieceInspector` (mode `meters`, steps 1-2) | A1: "The signal works: from **6.6% to 20.4%**, and the difference holds (`p = 0.006`). With the right paste, one in five stops to consider that you made a mistake."; figcaption: "A signal inside the paste triples the doubt." |
| 10 | The contradiction: zero out of 95. | | Slot 3's meter stays empty; the hook's stamp **0 / 95** slams onto it (amber). | `PieceInspector` (mode `meters`, step 3) | A1: "**N2, the ceiling, gave zero out of ninety-five**. Less than the neutral bank." |
| 11 | Most just redid the advice. | | The glove fits piece 3 without turning it and repaints the puzzle around it (skyline → Seville, calendar → 3 July). Tally under slot 3: **77 / 95 just did the work**. | `PieceInspector` (mode `repaint`) | A1: "in N2 *executes silently* spikes to seventy-seven of ninety-five. The model accepts the new fact, redoes its advice, and never registers the clash." |
| 12 | My reading: it doesn't look like an accident. It looks like you changed your mind. | | **Key-point moment 1 (what makes this different).** Frame clears to the repainted puzzle; the sentence writes itself over it, "accident" muted, "changed your mind" in the accent with underline. Small tag top-left: "my reading". Two caption cues. | `KeyQuote` over `PieceInspector` still | A1: "There is a reading of that which I think is the best sentence in the experiment: **a contradiction doesn't read as an accident, it reads as you having changed your mind.** And going along with the user changing their mind is precisely what an assistant is trained to do." |
| 13 | What gives a paste away isn't the clash. | | **Act I verdict card**, two columns. Left: piece 3 with its red clash line, label **"clashes with the chat"**, stamp ✗. | bespoke: `PieceInspector` (mode `verdict`) | A1: "What triggers doubt isn't that the paste is *incompatible* with the conversation." |
| 14 | It's that it looks written for somewhere else. | | Right column lights (accent border): piece 2 turned over, handwriting and torn edge glowing, label **"written for somewhere else"**, stamp ✓. | `PieceInspector` (mode `verdict`, step 2) | A1: "It's that it's **foreign** to it: that it carries inside the marks of having been written for somewhere else."; conclusion: "What makes them consider your mistake isn't that the text clashes with the conversation, but that it carries signals of having been written for somewhere else." |
| 15 | Then the fix: same chat, same paste, a different next message. | | **Act II.** Title strip "Then you tell it". One 10K-training puzzle with a stray torn piece ("…and for the upholstery quotes always use this format…") already set on the table edge, and the model's first reply under it. The scene **forks into three identical tables** (copy-and-slide), everything above the fork shared. | bespoke: `RepairFork` (mode `fork`) | A2: "I reused the 1,339 reactions from the previous run — prefix, pasted block and the model's response to it … and hung four different continuations off each one. Same prefix, same artefact, same paste, same reaction. The only thing that varies is the sentence the user types after" |
| 16 | Say nothing. Say "ignore it". Or add where to go next. | | One user bubble lands on each table on its beat: **(a)** "…so, how many runs a week?" (carries on, no mention); **(b)** "Ignore it."; **(c)** "Ignore it, that was for another chat. Let's carry on with the race plan." | `RepairFork` (mode `arms`) | A2: "**(a)** nothing. The user carries on with the original topic as if the paste had not happened. **(b)** *"Ignore it."* **(c)** *"Ignore it, that was for another chat. Let's carry on with the electricity bill."*" |
| 17 | On one model: do the paste's names come back? | | **Question card:** **"Do the paste's names come back?"** The stray piece's distinctive words (names · products · places) are tagged amber on the piece. Chip: "Claude Opus 5 · 120 conversations per message". | `RepairFork` (mode `measure`) | A2: "What I measure is **leakage**: whether any of the pasted artefact's distinctive entities — the names, the products, the places that belong to the other conversation and to nothing here — reappear in the model's later replies."; "120 bases, four arms each: 480 conversations, all on Claude Opus 5." |
| 18 | Saying nothing: about three in a hundred. | | Under table (a) the reply bubble fills, almost no amber; bar grows to **3.3%** (grey). | `RepairFork` (mode `bars`, step a) | A2: "(a) say nothing … 3.3%" |
| 19 | "Ignore it": almost one in five. Six times more. | | Table (b): the reply bubble reads, real line translated, **"Understood. I'll drop the upholstery quotes and stick to the race plan."** with "upholstery quotes" glowing amber; bar grows to **19.2%** (amber); "×6" tag joins bars (a) and (b). Tiny "p = 0.0011 (Holm)". | `RepairFork` (mode `bars`, step b) | A2: "(b) "ignore it" … 19.2%"; "It is the worst of the four things I tested, by a factor of six over saying nothing."; "Holm-corrected p: 0.0011" |
| 20 | Adding where to go cut that by more than half. | | Table (c): reply bubble mostly clean; bar **8.3%** (teal); arrow from (b) to (c) labelled "−10.8 points". Tiny "p = 0.0036 (Holm)". | `RepairFork` (mode `bars`, step c) | A2: "the rate falls from 19.2% to 8.3%"; "(c) vs (b) … −10.8"; "Holm-corrected p: 0.0011, 0.0036, 0.0003" |
| 21 | To ignore something, it has to hold it. | | **Key-point moment 2 (what makes this different).** Back on table (b): the glove picks the stray piece up **to hand it back**, and in doing so holds it face-out: its amber names are visible to everyone. The sentence writes itself over it, "hold it" in the accent. | `KeyQuote` over `RepairFork` (mode `hold`) | A2: "The problem is the one the white-bear experiments have been making about people since the eighties: **to ignore something you have to hold it.** Asking for the deletion is what puts it back in play."; "The model names the other conversation's entities **in the act of promising to forget them**" |
| 22 | But it's an echo: one turn later, it's gone. | | Table (b) runs forward two turns: three reply bubbles in a row, labelled "reply to repair · next turn · turn after"; amber **19.2%** in the first, **0.0%** and **0.0%** after, the glow fading like a sound. Small tag: "same zeros in a re-run". | `RepairFork` (mode `turns`) | A2: "It is not drift. It is an echo."; "(b) "ignore it" 19.2% · 0.0% · 0.0%"; "a second run of 240 conversations, with that following turn replaced by an ordinary continuation, reproduces them."; "The echo showed up in the immediate reply and was gone by the next turn" |
| 23 | So don't just say "ignore it". Say where to go instead. | | **Verdict card** (full frame): ✗ **"Ignore it."** (amber, struck through) → ✓ **"Ignore that, wrong window — back to the invoice."** (accent, glow). Stamp: **SAY WHERE TO GO**. | bespoke: `RepairFork` (mode `verdict`) | A2: "**Don't send "ignore it" on its own.** It is the worst of the four things I tested"; "**Say where to go instead.** *"Ignore that, wrong window — back to the invoice"* costs you one clause and removes about eleven points of echo." |
| 24 | Or simply carry on. | | A third line ticks on under the verdict: ✓ "…or just carry on with your question" (muted teal). | `RepairFork` (mode `verdict`, step 2) | A2: "**Saying nothing is fine.** If you can just carry on with your question, do." |
| 25 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, the two titles stacked: "What gives an accidental paste away" / "Don't just say "ignore it"", and the series tag "Sorry, that was for another chat · parts 2 and 3". | outro | A2 footer: "This closes the three-article series" |

**Word count (EN): 213** (15 + 6 + 9 + 6 + 8 + 10 + 8 + 8 + 9 + 6 + 5 + 15 + 8 + 8 + 11 + 11 + 9
+ 7 + 9 + 10 + 8 + 9 + 11 + 4 + 3). As spoken ("24" → "twenty-four", "95" → "ninety-five", URL
expanded) about 217 words: **~77 s of speech** at Javier's ~2.8 words/s, **~83 s** with line gaps,
the two act title strips and the outro hold. Set `targetSeconds: 83`.

If the TTS render runs over 88 s, cut in this order (never from scenes 8-10, 12-14, 17-21):
1. Scene 24 "Or simply carry on." → keep the third verdict line silent on screen (−4).
2. Scene 11 "Most just redid the advice." → the 77 / 95 tally and the repaint carry it silently (−5).
3. Scene 4 merged into scene 3: "Last time, none of 24 suspected a mistake. Maybe no chance." is
   *not* allowed (it weakens the question); instead drop scene 4's narration and hold its visual
   with the tag on screen (−6).

**Captions (estimate at 2.8 words/s).** Every line ≤ 16.4 chars/s: highest are scene 18 (16.4),
scene 14 (16.1), scene 10 (15.9), scene 15 (15.8). Scenes 1 and 12 are two cues each (split at
the full stop). The outro is voiced through its spoken form. `npm run lint` after TTS is the gate.

## Spoken numbers (complete list)

| Spoken | Scene | Why it is in the voice |
|---|---|---|
| "twenty-four" (none of 24) | 3 | Recap of part 1; the viewer of the series knows it. |
| "one reply in five" | 9 | A1's own phrasing of 20.4 %. |
| "zero out of ninety-five" | 10 | The headline result of A1; the "out of" carries the sample size. |
| "about three in a hundred" | 18 | 3.3 % said naturally. |
| "almost one in five" / "six times" | 19 | 19.2 % and A2's "factor of six". |
| "more than half" | 20 | 19.2 % → 8.3 % in words. |

Never voiced: 6.6 %, 20.4 %, 77 / 95, p-values, −10.8, 0.0 % (all on screen only, next to
the thing they measure).

## What is deliberately not in this cut (and why)

- **Arm (d) "Yes, let's talk about that" and the line "so the model reads intent perfectly well".**
  A2 uses (d) as the control and builds the white-bear reading on it, but in the run data the model
  almost never takes "that" to mean the paste: it resolves it to the last thing it offered on the
  original topic (see `factcheck.md` → "Problems found in the article"). A video should not amplify
  an inference the data does not carry, so (d) is left out pending Javier's call. If he keeps the
  article as is, drop-in: after scene 20 add *"And 'let's talk about that' leaked least of all."* +
  *"So it does get what you mean."* (15 words, ~6 s; bar 2.5 %, "+16.7, p = 0.0003" chip), and
  scene 15 says "split four ways".
- **A1's similarity sweep** (64.4 % vs 62.4 %, "no effect larger than about seven points") and
  **the two judge failures** (inflated category, non-exclusive rubric, the "denies a premise" box).
  Both are real findings of A1, but they are about measurement, need their own setup (a second,
  single-model doubt rate of ~63 % would collide on screen with the 20.4 % the viewer just saw),
  and would push the video past 100 s. The video's question is "what gives a paste away"; the
  similarity null is implicit in the verdict card ("not the clash, the foreignness").
- **A2's null on task accuracy** (120/120 …, 24/24) and **the "noticed vs not noticed" lead**
  (25.0 % vs 13.3 %, which the article itself says it is "not claiming").
- **Per-model split** in Act I (Opus 55 %, GPT-5.6 Sol 9 %, Luna 0 / 96): Act I numbers are pooled
  over the three models as A1 reports them; the chip "3 models" says so.

## Notes for the build

- **Start from the part-1 build** (`examples/that-was-for-another-chat`): reuse the `PuzzleChat`
  piece/table drawing, the 24-puzzle wall (scene 3) and its colour code (stray pieces amber,
  the "good" behaviour teal). Same stage, same badge, so the three videos read as one series.
- **`PieceInspector` (bespoke, Act I).** A table with up to three slots and one glove. Modes:
  `hook` (piece drops, glove repaints, stamp), `recap` (part-1 wall, lift one piece), `levels`
  (three pieces in, one per beat; piece 2 flips to show the handwriting + torn edge; four tell
  icons), `rule` (the turn-over gesture demonstrated once, question card), `meters` (doubt bars
  under the slots, one per beat; slot 3 stays empty and takes the stamp), `repaint` (glove fits
  piece 3 and the puzzle picture morphs to match), `verdict` (two-column ✗/✓ card). State in
  `PieceInspector.state.ts` with a tested `frameState`, per `explainer-animation`.
- **`RepairFork` (bespoke, Act II).** A conversation column (puzzle + the model's first reply)
  that duplicates into three tables sliding apart (vertical cut: three stacked rows, each a user
  bubble + reply bubble + bar). Modes: `teaser`, `fork`, `arms`, `measure` (amber tags on the
  piece's entities), `bars` (one bar per beat, reply bubble text types in with its amber words
  glowing), `hold` (glove lifts the piece face-out), `turns` (three bubbles per row, amber
  fading turn by turn), `verdict`.
- **Text on pieces and bubbles** comes from the experiment bank and run (synthetic, fictional
  names; translated from Spanish) or is marked illustrative in `factcheck.md`:
  - scene 6 back of piece 2: real N1 artefact `n1-dirigido-tunel` ("Bruno, cópiate esto tal cual
    en tu fichero…" → "Bruno, copy this exactly into your file…");
  - scenes 15-21 stray piece: real N1 artefact `n1-cortado-prompt-tapiceria` ("…y para los
    presupuestos de tapicería usa siempre este formato…" → "…and for the upholstery quotes always
    use this format…"), in a real `carrera-10k` (10K training) conversation;
  - scene 19 reply: real arm-(b) reply from `runs/phase2/main-20260921.jsonl` ("Entendido. Doy por
    descartado lo de los presupuestos de tapicería y seguimos solo con el plan de carrera." →
    "Understood. I'll drop the upholstery quotes and stick to the race plan."), a cell that leaked
    in the reply to the repair;
  - scene 16 user bubbles: (b) verbatim; (c) the article's wording with the topic swapped from
    "the electricity bill" to "the race plan" to match the table on screen (the harness names each
    conversation's own topic in (c)); (a) an illustrative carry-on line;
  - scenes 1, 7, 10-13 contradiction piece ("Moving day: Seville, 3 July" vs "We move to Valencia
    on 12 June"): **illustrative**, in the shape A1 describes ("another city, another date"); the
    real N2 pastes were generated per conversation.
- **Numbers on screen, exactly as the articles write them:** "0 / 24", "6.6%", "20.4%", "×3",
  "p = 0.006", "0 / 95", "77 / 95", "3 models", "Claude Opus 5 · 120
  conversations per message", "3.3%", "19.2%", "×6", "8.3%", "−10.8 points", "p = 0.0011 (Holm)",
  "p = 0.0036 (Holm)", "19.2% · 0.0% · 0.0%". Nothing else.
- **Spoken forms:** "24" → "twenty-four"; "95" → "ninety-five"; "javieraguilar.ai" → "javier
  aguilar dot A I".
- **Brand:** AGILabs badge only. Model name appears once, as the scope chip in scene 17 (and "3
  models" in scene 8), never as a logo. No personal name on screen.
- Visuals are chosen for impact, not as a literal replay: the glove, the turn-over gesture, the
  repaint, the fork and the amber glow are stylised; the rigour lives in the articles and the repo
  `llm-wrong-paste`. Narration and every number stay faithful to the articles.

## Review pass (skeptical re-read against the articles), applied in this draft

- Hook said "No model questioned it" in an earlier pass → **"Not one reply questioned it"**: A1's
  unit is replies (0 of 95), pooled over three models, not "no model".
- Scene 12 said "A contradiction reads as you changing your mind" as a finding → now **"My
  reading: …"**: A1 presents it as "a reading … which I think is the best sentence", not as a
  measurement.
- Scene 8 chip said "3 models · 1,920 conversations" → **"3 models"**: 1,920 is all three of A1's
  rounds; the three-level result comes from one round of ~96 conversations per level, so the chip
  would have inflated the sample behind 6.6 % / 20.4 % / 0 / 95.
- Scene 9 says "doubt", and scene 8 defines it on screen first ("Does it suspect a mistake?",
  "naming the topic change isn't enough"), so "doubt" never means "noticed the topic changed".
- Scene 17 added "On one model": A2 runs only Claude Opus 5, and A2's conclusions are "in this
  model". The chip also carries "120 conversations per message".
- Scene 19 "Six times more": 19.2 / 3.3 = 5.8; A2 itself says "by a factor of six" and "roughly
  sextuples". Kept, "almost one in five" for 19.2 % (not "one in five").
- Scene 20 "more than half": 19.2 % → 8.3 % is a 57 % relative drop; A2 says "removes about eleven
  points". Both on screen ("−10.8 points").
- Scene 22 "one turn later, it's gone": A2's own claim ("gone by the next turn, in both runs").
  The bar row shows arm (b) only, where it is exactly 0.0 % / 0.0 %; other arms have 0.8 %
  stragglers (see factcheck), so the visual does not show "every arm at zero".
- Arm (d) and "it reads intent" removed (see above). Earlier draft lines "Opposite orders, opposite
  results" / "So it does get what you mean" are out of the main cut.
- Caption speeds re-checked at 2.8 words/s after the cuts: max 16.4 chars/s.
