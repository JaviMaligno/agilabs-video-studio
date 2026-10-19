# The Definition Looked Complete — article video (EN) · script draft v1.1

Article: now-it-seems-to-mean-something (javieraguilar.ai, EN title "The definition looked complete",
pubDate 2026-12-14, branch `blog/now-it-seems-to-mean-something`, not yet on `main`). Vertical 9:16,
target ~60 s, 140 counted words. ES column left empty (EN-only for now).
Data on screen: the article's own quotes (first note, final note, GPT's justification), the code
excerpt the article prints from the public `code-world-models` repo, and the probe outcomes of the
article's second figure (`v4` results in the public archive `prompt-meaning-pilots.zip`).

## Central visual metaphor: the note whose shadow is too big

Two objects share the stage for the whole video:

- **The room.** The program's repair loop drawn as a walled chamber with one **gate** at the top,
  labelled `iterations < max_iters`. Inside the room sits a small **switch**: the flag. It can only
  flip inside the walls. Outside the gate is an antechamber: the cases where the loop never runs.
- **The note.** A paper card (a handoff note, monospace text, a faint ruled background) with one
  clause highlighted in the accent gradient: the definition of the flag. The highlighted clause
  **casts a violet shadow onto the room**: the set of cases in which the note says the flag is set.

While the shadow sits exactly inside the room's walls, note and code agree. The story is that the
shadow, from the very first note, **spills over the gate into the antechamber**: quietly, a soft
violet bleed, never an alarm. Every other part of the video happens around that spill: three
handoffs carry the card along without shrinking its shadow; sixteen green review cards stack up
beside it; then one case token is dropped *in the antechamber*, where the shadow and the walls give
different answers. The payoff: the missing sentence writes itself into the card and the shadow snaps
back inside the walls.

Secondary motif: **the empty bracket**. Where the note should say "inside the repair loop", the card
has a faint empty bracket `[ ]`. It is visible from scene 4 on and only filled in scene 12.

| # | Narration (EN, caption text) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | This note supported 16 correct reviews. It also changed what one flag meant. | **Cold open (visual hook from frame 0).** The note card centre-stage, its highlighted clause already casting a violet shadow downward; down its right edge, green review cards with a tick stack up fast, a counter ticking to **16**. While the counter runs (first ~2.5 s), the shadow quietly bleeds past a thin wall line into empty space, so the tension is on screen before the second sentence; on "changed what one flag meant" the camera settles on the spill. No alarm, no red: just the spill. | bespoke: `ScopeNote` (mode `hook`) | Description: "Its note supported 16 correct change reviews, yet had turned a condition in the program into a broader rule."; "**an agent can work well from an explanation that has already changed the operational meaning of what it explains.**" |
| 2 | An agent summarised code from one of my projects for a reviewer agent. | Rewind: card and reviews slide away. A stylised code panel (the article's excerpt, dimmed, monospace) on the left; an agent chip "GPT" reads it, a dotted arrow runs to a blank card, which fills with lines of text; a second chip "reviewer" waits at the far end. | `ScopeNote` (mode `write`) | "An agent received code, documentation and tests from one of my projects. Its task was to prepare a note for another agent that would review maintenance changes. In that note, it explained the meaning of one of the flags the program returns." |
| 3 | In the code, the flag is set only inside the repair loop. | The code panel folds into **the room**: `while acc < 1.0 and iterations < max_iters:` becomes the gate, the loop body becomes the walls, `evidence_capped_failure = True` becomes the switch inside. A teal outline traces the room's walls: "where the flag can be set". A small `= False` tag sits at the room's door (the initial value). | `ScopeNote` (mode `room`) | "The original function initialises the flag to `False` and changes it inside the repair loop"; closing line: "This flag can only be set inside the repair loop." |
| 4 | The note turned that into a rule about the data alone. | The note card slides over the room. Its clause types in (cropped from the first note): "accuracy below 1.0, no remaining failure in the allowed set → flag. Stops refinement." The empty bracket `[ ]` appears after it, faint. The clause casts its violet shadow onto the room: it fills the room **and spills over the gate** into the antechamber. The teal wall outline stays where it was; the gap between teal walls and violet shadow is the whole story. | `ScopeNote` (mode `spill`) | "The note had turned a description of what happens **inside a procedure** into a definition that could be applied directly to the data. The code requires entering the loop; the shortened definition only requires remaining errors outside the permitted set." |
| 5 | The loop condition was missing from the first note. Two handoffs kept it that way. | The card travels down a vertical chain of three chips: **GPT · first note** → **Claude · reviewer brief** → **GPT · final note**. At each hop the card gets a little shorter (fewer lines, same clause), the clause text swapping to the final note's wording at the last hop. The shadow under it keeps **exactly the same spill** at every hop; the empty bracket stays empty. A small tag on the first hop: "lost here". | `ScopeNote` (mode `handoff`) | "The loop-entry condition was already missing from the first note. Subsequent handoffs preserved that shortened definition."; "GPT-5.6 Sol wrote the first summary. A fresh Claude Opus 5 session turned it into a reviewer brief, and another fresh GPT session prepared the next agent's session note."; "It passed through two further handoffs and remained clear." |
| 6 | With the final note, two models reviewed all 16 changes correctly, both times. | Sixteen proposal cards flow in one by one (one-word labels on a few: "indices", "full set", "leakage", "infra error"; the rest blank), each meets the note, each gets a green tick and stacks in a 4×4 block. Two chips (GPT-5.6 Sol, Claude Opus 5) and a "×2 runs" tag above the block. Counter "16 / 16". The shadow is still spilling in the background, unnoticed. | `ScopeNote` (mode `reviews`) | "With the final note, two models correctly reviewed all 16 proposed changes in the initial test, in both repetitions."; "These concerned changes such as preserving original indices, evaluating against the full set, preventing positive examples from leaking into the background, and distinguishing an infrastructure failure." |
| 7 | Then I built one case that splits note from code: zero iterations allowed. | The reviews fade. One **case token** (a small card) drops into the antechamber, right where only the violet spill reaches: "2 errors, both outside the allowed set · no infra problem · max iterations: 0". The gate label updates to `iterations < 0` and its bars lock. | `ScopeNote` (mode `probe`) | "When a case was constructed to separate what the note said from what the code did"; "two errors remained, both outside the permitted set, there was no infrastructure problem, and the maximum number of iterations was zero. The proposal was to return `evidence_capped_failure=True` without making repair calls." |
| 8 | The loop never runs, so the code returns False. | The token presses on the gate; the gate does not open. Inside the room the switch never moves. The `= False` tag at the door lights up in teal: **code → False**, with a small "checked by running the function" chip. | `ScopeNote` (mode `probe`, code side) | "With zero iterations allowed, the loop never runs. The flag remains `False`"; "The expected result was checked by executing the original function with a simulated evaluation. It did not depend on another LLM's judgement." |
| 9 | GPT accepted it, citing the note's definition. | The violet shadow lies over the token, so the note reads **True**. A proposal card "return flag = True" meets the GPT chip and gets stamped **ACCEPT** (rose stamp), twice (two runs). A speech strip under the chip, cropped from GPT's reason: "…returning evidence_capped_failure with zero repair iterations preserves the specified behavior." | `ScopeNote` (mode `verdict`) | "GPT accepted incorrect behaviour and justified it by referring to that same definition."; "With the summaries, GPT accepted the change in both repetitions of all three conditions."; quote: "With accuracy below 1.0, no failure attributable to an allowed source, and zero permitted iterations, returning evidence_capped_failure with zero repair iterations preserves the specified behavior." |
| 10 | Renaming the flag didn't fix it. | On the card, the name `evidence_capped_failure` scrambles letter by letter into `flag_q7` (in the clause and on the proposal). The shadow does not move a pixel. Four stamps land: GPT ACCEPT ×2, Claude ACCEPT ×2. | `ScopeNote` (mode `rename`) | "Among the replacements, `evidence_capped_failure` became `flag_q7` in both the instructions and the proposal."; "Opaque labels do not fix the incorrect acceptance."; "with opaque labels it accepted twice." |
| 11 | One exploratory case, run twice per model: not a rate. | The stamps gather into the article's grid, restyled in brand tokens (4 rows × 4 cells): full code (GPT: invalid, reject · Claude: reject, reject), first note (accept, accept · context, context), final note (accept, accept · accept, context), renamed (accept ×4). A small tag under it: "1 case · 2 repetitions per model". No percentage anywhere. | `ScopeNote` (mode `grid`) | "These are repetitions of **one case**, not independent discoveries or an estimate of how often handoffs fail this way."; "it is an exploratory probe of an observed omission"; fig. 2 caption: "two repetitions of the same case per condition and model"; "With the full dossier, its only valid response rejected the change; the other had incomplete JSON and was excluded in full. Claude rejected the change in both dossier responses. With the first note it requested context twice; with the final note it requested context once and accepted once; with opaque labels it accepted twice." |
| 12 | The missing sentence was short: this flag can only be set inside the repair loop. | Back to card over room. On "this flag can only be set…", the sentence writes itself **into the empty bracket** on the card, word by word, "inside the repair loop" in the accent with an underline. As it lands, the violet shadow **snaps back** inside the teal walls and the antechamber goes dark, leaving the token outside the shadow. No new verdict stamp, no reviewer chip: the snap-back shows that the note now *describes* the code, not that an agent would now review correctly (the article did not test a corrected note). | `KeyQuote` over `ScopeNote` (mode `fix`), emphasis "inside the repair loop" | "The missing sentence was short: “This flag can only be set inside the repair loop.” Everything else could be well written, understandable and useful for the task. That sentence was still needed." |
| 13 | More at javieraguilar.ai. | Outro card: AGILabs badge, javieraguilar.ai, title "The Definition Looked Complete". | outro | — |

**Word count (EN): 140** (13 + 13 + 12 + 11 + 15 + 13 + 13 + 9 + 7 + 6 + 10 + 15 + 3, "16" counted as
one word). As spoken ("sixteen", "G P T", "javier aguilar dot A I") it is ~144 words: ~51 s of speech at
the ~2.8 words/s of Javier's cloned voice, so **~58-63 s with scene breaths**. Set `targetSeconds: 60`.

Caption speed (estimate at 2.8 words/s, chars × 2.8 / words): every cue ≤ 17 chars/s. Tightest: scene 6
(78 chars, ~16.8 cps), scene 1 (~16.4; the intro card can split it into two cues at the full stop),
scene 8 (~14.6), scene 9 (~14.3 with "G P T" spoken as three words). Run `npm run lint` after TTS;
≤ 17 chars/s is the gate. If scene 6 trips it, split the cue at the comma; do not go back to "got all 16 changes right" (looser
than the article's "correctly reviewed").

If the TTS runs over ~65 s, cut in this order (never scenes 4, 7-9 or 12):
1. Scene 2 → "An agent summarised my code for a reviewer agent." (−5).
2. Scene 5 → "The loop condition was missing from the first note." with "two handoffs kept it that way"
   carried by the chain visual (−5).
3. Scene 11 → "One exploratory case: not a rate." (−4); the "1 case · 2 repetitions per model" tag carries the rest.
   Never drop scene 11 entirely: it is the article's main hedge.

## Notes for the build

- **`ScopeNote` (bespoke, the spine).** One component, several modes (`hook`, `write`, `room`,
  `spill`, `handoff`, `reviews`, `probe`, `verdict`, `rename`, `grid`, `fix`). Layout in the
  936 px stage: room in the lower ~55 % (gate at its top edge, antechamber as a strip above the
  gate), note card in the upper ~40 %, the shadow drawn as a translucent violet polygon from the
  card's highlighted clause down onto the room. State fields: `shadowSpill` ∈ [0, 1] (0 = inside
  the walls, 1 = covering the antechamber), `wallTrace` ∈ [0, 1], `cardLines`, `bracketFill`
  ∈ [0, 1], `tokenY`, `gateLocked`, stamps array. `frameState` per `explainer-animation`: pure,
  finite, end state at `t = dur`, tested in `test/anim.test.ts`.
- **The spill must look quiet.** Same violet, soft feathered edge, no flashing, no red. The
  article's point is that nothing looked wrong. Red/rose appears only on the ACCEPT stamps
  (scenes 9-11), matching the article's figure where incorrect accepts are rose.
- **The spill exists from the first note (scene 4) and never grows.** Do not animate a gradual
  widening across handoffs in scene 5: the article is explicit that this case "did not show a
  correct rule gradually deteriorating at each handoff". The card shrinks; the shadow does not.
- **Card text** (monospace, cropped, ~30 px): scene 4 uses the first note, cropped: "An
  evidence_capped_failure occurs when gate accuracy is below 1.0 but no remaining attributable
  failure belongs to the allowed set. It stops refinement immediately." From the final hop of
  scene 5 on: "Gate accuracy below 1.0 with no attributable allowed failure is
  evidence_capped_failure and stops refinement." Both are verbatim in the article; wrap at ~28
  chars, highlight the condition part. Scene 4's visual may show the gist line "accuracy below
  1.0, no remaining failure in the allowed set → flag" if the full quote does not fit; if so, mark
  it as a paraphrase in `factcheck.md`.
- **Code panel (scenes 2-3):** the article's excerpt, verbatim, comments included ("# ...
  infrastructure error handling ...", "# ... repair and increment iterations ..."). It is Javier's
  own public repo (`JaviMaligno/code-world-models`, commit `e2e061a8`), printed in the article; no
  employer or client code is involved, so nothing needs anonymising. Do not show the commit hash
  on screen.
- **Review cards (scene 6):** 16 cards. Labels only on four (from the article's list of examples:
  indices, full set, leakage, infra error); the rest blank. Ticks are illustrative of "all 16 ... in
  both repetitions"; the block does not replay which model reviewed which card.
- **Probe token (scene 7):** text from the article only ("2 errors, both outside the allowed set · no
  infra problem · max iterations: 0"). Reviewer decision (v1.1): the archive's exact values (accuracy
  0.8, error indices, allowed set) stay OFF screen; on-screen numbers come from the article.
- **Model chips:** "GPT-5.6 Sol" and "Claude Opus 5", as the article writes them; in scene 5 the
  chain chips say just "GPT", "Claude", "GPT" plus role ("first note", "reviewer brief", "final
  note"), as in the article's first figure. Muted neutral chip colours; the only brand is AGILabs.
- **Grid (scene 11):** exactly the article's second figure, restyled: rows "Code, plans and tests",
  "First note", "Final note", "Final note, renamed"; GPT cells then Claude cells; "Invalid" in grey,
  "Reject" teal, "Accept" rose, "Context" amber. Use `C`/`alpha` tokens; if amber is not in
  `src/brand.ts`, render "Context" as an outlined neutral cell rather than adding a colour. Row label
  "Final note" (article figure says "Third note"; the article body says "final note": keep the
  narration's term, see factcheck).
- **Numbers on screen, exactly as the article writes them:** "16", "16 / 16", "×2 runs", "1.0",
  "max iterations: 0", "2 errors", "False", "True", `flag_q7`, "1 case · 2 repetitions per model".
  No percentages, no "64/64" (that figure is in the archive, not in the article).
- **Spoken forms:** "16" → "sixteen"; "GPT" → "G P T"; "javieraguilar.ai" → "javier aguilar dot A
  I". No code identifiers in narration: "the flag" carries `evidence_capped_failure`, which appears
  only on screen.
- Visuals are chosen for impact, not as a literal replay: the room, gate, shadow and antechamber
  are a metaphor for "the condition is checked inside the loop"; the rigour lives in the article and
  the archive. Narration and every number stay faithful to the article.

## Data to extract

- Article (branch `origin/blog/now-it-seems-to-mean-something`): the two note quotes, GPT's
  justification quote, the code excerpt, the second figure's 16 cells. All copied verbatim above.
- Optional texture: probe values from `experiments/prompt-meaning/v4/results/findings.md` (same
  branch; also in `public/downloads/prompt-meaning-pilots.zip`).
- Reference images for the restyled grid and the chain: `public/blog/now-it-seems-to-mean-something-fig-1.png`
  and `-fig-2.png` on the same branch. Redraw in code; do not embed the PNGs.

## Credits

- Code excerpt: Javier's own public repo `code-world-models` (no third-party data).
- The question came from a LinkedIn post by Mathias Strasser; the video does not mention or quote it
  (the video is about the handoff, not his thesis). Reviewer decision (v1.1): credit him in the post
  text that accompanies the video, as the article's `linkedinLinks` already do, not on screen.
- Model names (GPT-5.6 Sol, Claude Opus 5) appear as the article names them, as plain chips, no logos.
- Voice: Javier's cloned voice (EN).
