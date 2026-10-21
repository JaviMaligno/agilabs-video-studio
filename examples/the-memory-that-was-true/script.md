# The Memory That Was True — article video (EN) · script draft v1.0

Article: the-memory-that-was-true (javieraguilar.ai, EN, `pubDate` 2026-09-27; read from
`origin/main:src/content/blog/en/the-memory-that-was-true.md` of personal-website). Vertical 9:16,
target ~83 s (ceiling 85 s), 202 counted words. ES column left empty (EN-only for now). Voice: the
template default, Javier's cloned voice with the `JAVIER_POST` chain.

Data behind the visuals: the article's own audit (35 memories on 11 September: 7 green, 3 red,
25 grey) and the public checker's `scripts/memory-audit/checks.json` on `origin/main`, which has
exactly 10 memories with checks (7 + 3) and the real check of the hook memory,
`{ "file_matches": ".github/workflows/scheduled-publish-*.yml" }`. The misleading green is the
entry with seven `file_exists` checks.

## Central visual: the pinned note on a moving repo

A memory is drawn as a **note pinned over a small file tree** (the repository). The note never
changes; the tree under it does. That is the whole article in one picture: the memory was true
when written, and the world moved underneath while the note stayed where it was. A check is a
**thread** from the note down to one line of the tree; while the thread finds its file the note's
edge is teal, when the file is gone the thread goes slack and the edge turns rose (red).

The note then shrinks into a **wall of 35 notes** (5 × 7), the audit. Each note is one of three
states, colour-coded as in the article: **green** (thread taut, check passes), **red** (thread
slack), **grey** (no thread at all: nothing in the repo could contradict it). The wall carries the
rest of the video: the three reds get an hourglass, the greys get their kind ("preference",
"judgement", "way of working"), one green opens to show a date inside that its threads never touch.

Recurring fixed element: a small **state legend** in the top band (green · red · grey) that fills
in its counts at the tally and stays.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | My agent handed me a memory. It was true in July. | | **Cold open.** Dark stage; a note slides in and pins itself, top centre, over a small file tree (`.github/workflows/` with three `scheduled-publish-<article>.yml` files). Note text, handwritten feel: "To schedule an article: one workflow per article." Corner tag "written · July". Edge teal; a thread runs from the note to the workflow files. | bespoke: `PinnedNote` (mode `hook`) | "my agent handed me a stale memory and I very nearly acted on it."; "The memory said that scheduling an article on this site means creating a single-use workflow named after the article. That was true in July." |
| 2 | It said: one workflow per article. | | The note's line "one workflow per article" underlines itself; the three workflow files in the tree pulse in sync with it. | `PinnedNote` (mode `hook`) | "a single-use workflow named after the article" |
| S1 | A memory is a note my coding agent writes about my blog after each session. | | *(added 2026-10-21: story)* A "coding agent · my blog" session window types a few chat lines; a "session ends → note" chip; a note flies into a small stack labelled "its memory · notes it keeps on my blog". | bespoke: `MemoryStory` | "the files Claude Code keeps per project. The agent writes them when a session ends" |
| S2 | I was preparing an article, and that note told me how to schedule it. | | *(added 2026-10-21: story)* An article draft card ("new article · draft") asks "how do I schedule it?"; the hook note ("To schedule an article: one workflow per article.", "written · July") is pulled out of the stack to full size and pinned. | `MemoryStory` | "While I was preparing it, my agent handed me a stale memory"; "The memory said that scheduling an article on this site means creating a single-use workflow" |
| S3 | I very nearly acted on it. | | *(added 2026-10-21: story)* A "+ create the workflow / scheduled-publish-new-article.yml" button appears; the cursor heads for it and stops just short; rose chip "very nearly". | `MemoryStory` | "I very nearly acted on it." |
| 3 | Since then, a single queue file replaced them all. | | Time runs (a small calendar strip under the tree flips July → September). The workflow files fade out one by one; a single file `publish-schedule.json` slides in, "queue" tag. The note does not move and its text does not change; the thread goes slack, the edge drifts teal → rose. | `PinnedNote` (mode `drift`) | "The mechanism has since been replaced by a manifest: one JSON file holding the publication queue. There is **not one** of those workflows left on the main branch." |
| 4 | The memory was not wrong. | | Stamp on the note, teal: **TRUE WHEN WRITTEN**. | `PinnedNote` (mode `stamp`) | "The memory wasn't wrong." |
| 5 | It stopped being true while nobody was looking. | | Second stamp under it, rose: **STALE NOW**. The tree keeps moving slightly; the note stays still. | `PinnedNote` (mode `stamp`) | "**It was true, and it stopped being true while nobody was looking.**" |
| 6 | So I audited the 35 memories my agent keeps. | | The note shrinks into the top-left slot of a wall of 35 blank notes (5 × 7), all neutral. Counter "35 memories" in the top band, small tag "this project · 11 Sep". | bespoke: `MemoryWall` (mode `fill`) + `Counter` | "Across the 35 memories this project had on 11 September"; "I audited the 35 memories my agent keeps about this project." |
| 7 | The idea: tie each memory to a check against the repository. | | Zoom back to the first note: a thread drops from it to the file tree; the check appears beside the thread in mono, `{ "file_matches": ".github/workflows/scheduled-publish-*.yml" }`. | `MemoryWall` (mode `thread`) | "attach to each memory a check that runs against the repository"; the JSON block, verbatim |
| 8 | It claims those workflows exist? If none is left, it turns red. | | The thread searches the tree: no match; it goes slack and the note turns red. Mini legend: "file there → green · gone → red". | `MemoryWall` (mode `thread`) | "*this memory claims those workflows exist, so there should be at least one*. If there isn't, the memory gets flagged." |
| 9 | A preference changes only when I change my mind. | | **What makes this different, its own card.** Title band: **WHAT EXPIRES ON ITS OWN?** Two notes side by side. Left: a preference note ("avoid sweeping claims"), no thread, a small speech bubble "only when I say so". | bespoke: `MemoryWall` (mode `split`) | "**A preference doesn't become false by itself.** If my standard is that an article should avoid sweeping claims, that doesn't stop being true on its own: it changes the day I change my mind" |
| 10 | A fact about the system expires on its own. | | Right: a system-fact note (the workflow note) with its thread, a clock ticking beside it; its edge drifts rose by itself. | `MemoryWall` (mode `split`) | "**A fact about the system does expire on its own**, quietly, because the world moves without telling anyone." |
| 11 | Only that kind can be checked. | | A check icon lands only on the right note; the left gets a calm grey "no check needed". Title band answers: **only facts about the system**. | `MemoryWall` (mode `split`) | "So automatic verification only makes sense over the second half."; "**you can only check what can expire without anyone touching it.**" |
| 12 | Three came out red. | | Back to the wall. Threads drop from 10 of the 35 notes into the tree; 7 go taut and turn green, 3 go slack and turn red (the 3 pulse). Legend in the top band fills: **7 green · 3 red · 25 grey**. | `MemoryWall` (mode `tally`) | Table: "green 7 · the check passes"; "**red** 3 · claims something no longer true"; "grey 25 · no check is possible" |
| 13 | I checked each by hand. None was wrong when written. | | The three red notes slide out of the wall into a row and flip to show their text: "scheduling = one workflow per article" · "article pending on its branch" · "two articles awaiting review". A hand-tick "checked by hand" passes over each; then each gets the teal stamp **TRUE WHEN WRITTEN** and a rose "→ since published / replaced". | `MemoryWall` (mode `reds`) | "I verified each red by hand, because a red is an accusation. All three held up."; "**None was wrong when written.**"; the three bullets |
| 14 | All three recorded a situation in progress, born with an expiry date. | | An hourglass appears on each red note, label **IN PROGRESS**; beside the row, a grey "stable fact" note with no hourglass stays teal. | `MemoryWall` (mode `reds`) | "**All three described a transitional state.**"; "**a memory recording a stable fact ages well; one recording a situation in progress is born with an expiry date.**" |
| 15 | And most, 25 of them, can't be checked at all. | | Wall again; the 25 grey notes brighten together, no threads. "25 / 35" in the legend highlights. | `MemoryWall` (mode `greys`) | Table "grey 25 · no check is possible"; description "most cannot be checked at all" (see factcheck on "80%") |
| 16 | It's judgement and ways of working. That isn't a flaw. | | Grey notes get small labels as they glow: "preference", "judgement", "way of working". Stamp across the grey block, teal: **NOT A FLAW**. | `MemoryWall` (mode `greys`) | "that 80% is judgement, preferences and ways of working, and **it's the part that makes working with an agent bearable**."; description: "can't be checked at all, and that isn't a flaw." |
| 17 | One green was stale too: its files existed, its expiry date had passed. | | One green note zooms out of the wall and opens: seven file lines, each with a taut thread and a tick; below them, a line "credential expires <date>" lit rose, with no thread touching it. Calendar chip "a month past". | `MemoryWall` (mode `green`) | "A memory about publishing automation came out **green**: its seven files all exist, all verified. And inside, that same memory said a credential expired on a date that by then was a month past." |
| 18 | A green certifies what was encoded, not the whole memory. | | Spotlight on the gap: threads cover the file lines only; the dated line sits outside the light. The sentence writes over it, "what was encoded" in accent. | `KeyQuote` over `MemoryWall` (mode `green`) | "**A green certifies what was encoded, not the whole memory.**" |
| 19 | That's one folder, not a staleness rate. | | The whole wall shrinks into a single folder icon; tag "1 person · 1 project". | `MemoryWall` (mode `folder`) | "Three reds out of thirty-five is not a staleness rate for anything: it's what came out of my folder." |
| 20 | The verdict: the checker is clumsy. | | Top band: **VERDICT**. The check-thread tool icon gets a muted stamp **CLUMSY**; small line under it: "by hand: same cost, same number". | bespoke: `MemoryWall` (mode `verdict`) | "Let me give the verdict on the tool up front […]: **it's clumsy**."; "Reviewing all 35 by hand would have cost about the same and produced the same number." |
| 21 | What keeps a memory true is updating it when the work ends. | | The hook note returns over its tree. A "work done ✓" chip lands on the tree (the article goes out); in the same moment a pen rewrites the note's line and its edge goes teal. Stamp: **UPDATE WHEN THE WORK ENDS**. | `PinnedNote` (mode `close`) | "what keeps a memory alive isn't checking it: it's **closing the session by updating it**."; "When a piece of work ends […] that is the moment the memory describing it stops being true" |
| 22 | And mark anything in progress as such: it will expire. | | A small **IN PROGRESS** tag with an hourglass clips onto a new note. | `PinnedNote` (mode `close`) | "**Anything recording a situation in progress should be marked as such**, because it will expire and it helps to know where it will break." |
| 23 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, article title. | outro | — |

**Word count (EN):** 11 + 6 + 9 + 5 + 8 + 10 + 11 + 12 + 9 + 9 + 6 + 4 + 10 + 12 + 11 + 10 + 13 +
10 + 7 + 6 + 12 + 10 + 3 = **204 words** with "35" / "25" counted as two spoken words each
(**202** as written). About 73 s of speech at ~2.8 words/s, **~83 s** with line gaps, stamps and
the outro hold. *(added 2026-10-21: story)* Rows S1-S3 add 15 + 14 + 6 = **35 words** (10.6 s
of speech): **239 words** total (**237** as written), rendered length **96.4 s**. If the TTS render runs over 85 s, trim scene holds first, then cut scene 2 (scene
1's note already shows the text). Do not cut scene 19 (the hedge) or scenes 9-11 (what makes the
subject different).

**Caption speed** (estimate at 2.8 words/s, 32-char rows): highest are scene 5 (16.4 chars/s),
scene 20 (16.3) and scene 14 (16.1); every other line ≤ 16.0. The outro is voiced through its
spoken form. `npm run lint` after TTS is the gate.

## Spoken numbers (complete list)

| Spoken | Scene | Why it stays in the voice |
|---|---|---|
| "July" | 1 | When the memory was true; the hook needs it. |
| "thirty-five" (memories) | 6 | Setup count: what was audited. |
| "three" (red) | 12, 13-14 | The finding. |
| "twenty-five" | 15 | The other half of the finding; said once, after "most". |

"Seven" (greens) and "seven files" are on screen only. No percentage is voiced (see factcheck on
the article's "80%").

## Notes for the build

- **Bespoke `PinnedNote`**: one note (rounded card, slight paper texture drawn in code, brand
  tokens only) pinned over a mini file tree. Modes: `hook` (note pins, thread taut), `drift`
  (calendar flips, files fade, `publish-schedule.json` slides in, thread slack, edge teal → rose
  as a continuous blend), `stamp` (two stamps on beats), `close` (rewrite + teal). `frameState`
  returns the tree rows' opacity, thread tension (0-1), edge colour mix (0-1), stamp progress.
- **Bespoke `MemoryWall`**: 5 × 7 grid of mini notes inside the stage (936 px wide: notes
  ~160 × 120 with 24 px gaps). State per note from a fixed array: 10 checked (7 green, 3 red),
  25 grey, positions shuffled once with a fixed seed so colours are not banded. Modes: `fill`,
  `thread`, `split`, `tally`, `reds`, `greys`, `green`, `folder`, `verdict`. Threads are bezier
  strokes to a compressed file tree under the wall; slack = sagging path + muted colour.
- **Note texts are generic paraphrases**, never memory file names: "scheduling = one workflow
  per article", "article pending on its branch", "two articles awaiting review", "avoid sweeping
  claims", "credential expires <date>". No real date on the credential line (the article gives
  none); the chip says "a month past". The credential is not named (the article does not).
- **Numbers on screen, exactly as the article writes them**: "35 memories", "11 Sep", "7 green ·
  3 red · 25 grey", "25 / 35", "seven files" as seven ticked lines, "a month past",
  "1 person · 1 project". The check JSON is the article's verbatim block.
- **Colours**: green / red / grey are the article's state words; draw green as the brand teal and
  red as the brand rose, grey as the muted token. No new colours.
- Visuals are chosen for impact, not as a literal replay: the threads, hourglasses, the
  calendar flip and the folder are stylised; the rigour lives in the article and the checker's
  README. Narration and every number stay faithful to the article.
- **Spoken forms**: "35" → "thirty-five"; "25" → "twenty-five"; "javieraguilar.ai" → "javier
  aguilar dot A I".
- **Left out on purpose** (taste call, for length): the vacuous-check result ("a check that always
  passes is worse than none"), the personal-vs-production comparison and the multi-person
  section. Alternative scene if a later cut wants it (+12 words, after scene 18): "And a check
  that always passes is worse than none: it looks watched." Visual: a thread tied back to the
  note itself, green forever.
- The only brand on cards, poster and metadata is AGILabs; no personal name on screen.
- ES cut: pending (EN-only for now).
