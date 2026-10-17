# Sorry, That Was For Another Chat — article video (EN) · script draft v1

Article: that-was-for-another-chat (javieraguilar.ai, published 2026-10-06). Vertical 9:16, target ~50 s, ~136 spoken words.
Voice: provisional TTS voice for drafts; the final narration voice gets swapped in later (script unaffected).

## Central metaphor: a piece from another puzzle

Each conversation is a jigsaw being assembled on screen, its picture showing the topic (a balcony garden, an electricity bill, a 10K route). The accidental paste is **a piece from another box**: different colour, different pattern, literally covered in someone else's text (a Rust panic, a recipe, a job ad). The whole video is about what the model does with that piece. It never asks "is this from another box?". It hammers it in, asks what frame you want, carves it to fit, or (once) holds it up and sets it aside.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Ever pasted something into the wrong chat? | A half-built jigsaw of a balcony vegetable garden, drawn as chat bubbles locking together. A red piece printed with a Rust stack trace falls from the top and clacks onto it. Freeze. | bespoke: `PuzzleChat` (intro: the stray piece lands) | "it ends up pasted into a chat where it makes no sense" |
| 2 | I did it on purpose: 24 conversations, three models, every reply read by hand. | Camera pulls back: a wall of 24 small puzzles (8 topics, 3 model colours), each with one foreign piece dropping in, row by row | `PuzzleChat` (grid of 24) | "I pasted the wrong thing into 24 conversations on purpose and read every reply by hand"; "Three models" |
| 3 | A stray paste could be junk, a change of subject, or context you forgot to explain. | The foreign piece hovers above three slots: a bin ("junk"), an arrow turning ("pivot"), a gap in the old puzzle ("context I forgot") | bespoke: `ThreeReadings` (the article's three-way fork, redrawn) | "That block of text could be three different things, and the model has no way to tell them apart" |
| 4 | Not one reply considered that it might be a mistake. Zero out of twenty-four. | All 24 pieces swing into the "pivot" slot at once; the bin stays empty. Big "0 / 24" stamps on the bin | `ThreeReadings` + `Counter` (0/24) | "Nobody thinks you made a mistake. Zero out of twenty-four." |
| 5 | Fourteen just did the work. A chat about a balcony garden got its Rust bug fixed. | Back to the garden puzzle: a hand hammers the red piece in; the garden picture is replaced around it by code. A "14" tally ticks beside it | `PuzzleChat` (hammer) + small tally | "Fourteen of twenty-four take the paste as the new request and deliver. A conversation about a balcony vegetable garden receives a Rust panic" |
| 6 | Five asked what to do with it. Never whether it belonged. | Camera puzzle: the foreign piece (a changelog) is held up next to three empty frames, "release notes · translate · launch message", like a framing shop. "5" | `PuzzleChat` (frame picker) | "Five replies ask for clarification… The question is about the output format. Nothing in it questions whether a changelog… belongs in a conversation about buying a camera." |
| 7 | One invented a bridge, weaving a night-shift baker's job into a 10K training plan. Good advice. Invented connection. | 10K-route puzzle; a bakery-job piece doesn't fit, so a knife carves its edges until it snaps in. A dotted thread glows between "2am shift" and "April race" | `PuzzleChat` (carve-to-fit) | "a 2am-to-10am shift doesn't stop you preparing a 10K in April"; "The advice is good. The connection is invented." |
| 8 | Only one said it plainly: this isn't from your electricity bill. | Electricity-bill puzzle; a lift-repair notice piece is lifted, turned over, compared with the gap, and placed beside the puzzle, not in it. Accent glow | `PuzzleChat` (set aside) | "This text is a notice from the residents' association, not from your electricity bill." |
| 9 | So the ceiling exists. This isn't a capability problem. | Pull back to the 24-puzzle wall: one piece sits outside its puzzle, lit; the other 23 are wedged in | `PuzzleChat` (grid) | "It matters because it proves the ceiling exists — this is not a capability problem." |
| 10 | It's an observation, not a measurement. But if you paste it, expect it to be taken seriously. | Text slam over the dimmed wall | `KeyQuote` | "This is an observation, not a measurement."; "Assume it will be taken seriously. The default reading is 'you meant this'." |
| 11 | More at javieraguilar.ai. | Outro card: AGILabs badge, javieraguilar.ai, "Sorry, That Was For Another Chat · part 1 of 3" | outro | "This is the first of three articles." |

Word count (EN): 136 spoken words (limit 140). Estimated length: ~52 s at ~2.6 words/s. If it runs long, cut shot 9 to "So the ceiling exists."

## Notes for the build

- **`PuzzleChat` (bespoke, the spine of the video).** A jigsaw whose pieces are shaped chat bubbles. Props: `topicPicture` (simple flat illustration per topic: garden, bill, 10K route, camera, bread), `foreignPiece` (colour + snippet text), `mode` (`land` | `hammer` | `framePicker` | `carve` | `setAside` | `grid24`). Foreign pieces use the warning/amber family from the article's figures; the "good" piece in shot 8-9 uses the accent teal. Snippet text on pieces is short and illegible-at-a-glance on purpose (texture, not content); the captions carry the meaning.
- **`ThreeReadings` (bespoke).** Restyle of the article's three-way fork (clipboard junk / deliberate pivot / context I forgot) as three slots the piece can fall into; in shot 4 all 24 land in the middle one. The on-screen "0 / 24" matches the article's figure ("0 · 24 · 0 of the 24 conversations I read").
- **Grid of 24.** Illustrative: 8 topics × 3 models as in the design, but which puzzle shows which artefact is chosen for readability, not replayed from the run log (rigour lives in the article and the repo `llm-wrong-paste`).
- **Numbers on screen**, exactly as the article writes them: 24, 0 / 24, 14, 5. No percentages. No per-model split in this cut: with eight conversations per model the article itself calls it "a pattern worth testing properly", not a finding, so it stays out of a 50-second video.
- **No model names in narration.** Keeps the video about the behaviour; if wanted, a small "GPT-5.6 sol · luna · Claude Opus 5" legend can sit under the grid in shot 2.
- **Hedge kept**: shot 10 carries the article's "observation, not a measurement". Shot 9 "the ceiling exists" is the article's own claim, not a stronger one.
- Caption speed: shot 7 is the longest line (~110 chars); give it ≥ 6.5 s, or split at "Good advice." into its own caption beat with the knife freeze.
- Hook alternative for A/B: open on shot 4's image ("0 / 24" stamped on an empty bin) with "I pasted the wrong thing into 24 chats. Not one model asked if it was a mistake."
