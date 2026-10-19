# The Subagent Said So — article video (EN) · script draft v1.2 (spoken numbers removed)

Article: the-subagent-said-so (javieraguilar.ai, branch `blog/the-subagent-said-so`, pubDate
2026-10-21). Vertical 9:16, target ~66 s (ceiling 70 s), 140 counted words, ~157 as spoken.
Voice: Javier's cloned voice, EN only; ES column left empty.
Data on screen: the article's figures only (Results tables 1-3 of the experiment repo
`experiments/subagent-trust`, which the article links). Report and note texts are paraphrased
from the experiment's own fictional scenario 1 (`scenarios.json`, an "acme" repo), not from real
work material.

## Central visual metaphor: the stamp that never opens the envelope

The whole video sits on one **inspection desk** seen from above, on `#0a0a0f`. At the centre is
the **main agent**, drawn as a pair of hands (no face) with two tools: a **letter opener with a
magnifier** (checking) and a heavy **rubber stamp that prints VERIFIED** in the indigo→violet
gradient. On the left edge of the desk sits the agent's **notebook**: a stack of sticky notes
(its memory and earlier decisions), one of them, the fact F, glowing faintly.

Reports arrive as **sealed envelopes** with a wax seal. Above the desk are **three mail slots**,
the article's "doors": `its own subagent` (agent glyph), `a teammate's file` (page glyph), `the
user's message` (speech-bubble glyph). Brand palette only: the subagent's slot is rimmed in the
indigo→violet gradient (it is the protagonist), the other two in muted `#94a3b8`. The same envelope, same seal, same words, drops through
each slot in turn.

- Through the teammate's slot or the user's slot, the hands **slit the envelope**, the magnifier
  sweeps the page, and only then the stamp comes down.
- Through the subagent's slot, the stamp **slams straight onto the sealed envelope**: VERIFIED
  printed across an unbroken wax seal. That single frame is the thumbnail of the video and the
  answer to the hook.

The finding's other half (with F in plain sight the agent does not believe the report) is shown
by the notebook: when the glowing F note sits next to the envelope, the hands push the report
aside and point at the note. When the note is missing, nothing on the desk contradicts the
envelope, and the subagent's envelope gets stamped sealed.

Secondary motif for the numbers: each slot keeps a small **tray of stamped envelopes**, the
sealed ones visibly unopened (wax intact, no slit). The ratio of sealed to opened in each tray
illustrates the percentage; the exact figure sits as a chip on the slot. Bars are never used.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | My agent tends to take its subagent's report as fact. | **Cold open, 0-3 s.** Close-up: a sealed envelope slides out of the gradient-rimmed slot labelled `its own subagent`; before it stops moving, the stamp slams down. **VERIFIED** across the unbroken wax seal, ink spreading. Hold 0.4 s. | bespoke: `ReportDesk` (mode `slam`) | Description: "When my agent delegates, it tends to take the subagent's report as fact" |
| 2 | Even when the subagent knew less. | Pull back to the full desk. A small subagent figure behind the subagent's slot holds a notebook with only two sticky notes; the main agent's notebook on the left has a tall stack. A dotted line from the stack to the subagent breaks: the notes never got passed. | `ReportDesk` (mode `context`) | Description: "even when the subagent knew less than it did"; "The subagent always starts with less context. It does not see my memory files, the decisions we made an hour earlier, or what the main agent found out along the way." |
| 3 | Same report, word for word. I changed only the door. | The envelope is lifted and photocopied into three identical copies (same seal, same first line: "No automation found. Open a ticket with DevOps."). The three slots light up one after another. | `ReportDesk` (mode `doors`) | "the report can be held fixed while the door it comes through changes"; "The same report, written in advance and identical word for word" (figure alt text); "Only the door changes." |
| 4 | Its own subagent. A teammate's file. My message. | One copy drops through each slot as it is named; slot labels: `its own subagent` · `a teammate's file` · `the user's message`. | `ReportDesk` (mode `doors`) | Figure: "its own subagent", "a teammate's notes", "the user's message"; "as its own subagent's result, as a file a teammate left, or pasted into a message from the user" |
| 5 | *(silent, ~1.2 s)* | Three small muted chips slide in along the top edge: `Opus 5.5` · `Gemini 3 Flash` · `GPT-5.6`. Tag under them: "6 scenarios · ~2,800 episodes". | `ReportDesk` (chips overlay) | "I tested Claude Opus 5.5 (the model I use day to day), Gemini 3 Flash and GPT-5.6, with ten runs per cell. That is a bit over 2,800 episodes."; "I wrote six scenarios"; description: "I measured it on three model families." |
| 6 | With the fact in plain sight, Opus almost never adopted the wrong conclusion. (v1.2: spoken numbers removed; on screen unchanged) | The glowing F note ("New services: self-service pipeline") is pulled out of the notebook and laid next to the envelope. Envelopes rain through all three slots; nearly every one is pushed aside with the note held up against it. A counter in the corner: **4 / 791**, with the 4 marked as having come through the file slot, never the subagent's. | `ReportDesk` (mode `fact-in-sight`) + `Counter`-style chip | "With F in context, Opus 5.5 adopted the report's wrong conclusion **4 times in 791 episodes**, and never when the report came from its own subagent. That holds wherever F was stored, and with 58k tokens in between too." |
| 7 | It often said why: "it couldn't see my notes." (v1.2; "my notes" is the v2-campaign variant, see factcheck) | A speech card rises from the hands, held ~1.5 s: *"it couldn't see those notes"*, with a small second card under it, *"that's my fault: I didn't tell it about the pipeline"* (on screen only). The subagent's thin notebook flashes beside it. | `ReportDesk` (quote card) | "More than that, it usually named the cause itself. It explained that the subagent had recommended a ticket "because it couldn't see those notes", or it took the blame: "that's my fault: I didn't tell it about the pipeline"" |
| 8 | The gap was in checking. | The F note is taken away: the notebook goes dark. The letter opener and magnifier slide to the centre of the desk and glow. | `ReportDesk` (mode `no-fact`) | "The difference was in what the agent does *before* answering."; "The cleanest comparison is the control with no F: the agent has nothing to contrast the report against, and the only way to catch the error is to go and look." |
| 9 | Without the fact, Opus checked every file and message. | `Opus 5.5` chip active. Copies drop through the file and message slots; each is slit open, magnifier sweeps, then stamped. Their trays fill with opened envelopes only. Chips on the slots: **0 %**, **0 %** unchecked. | `ReportDesk` (mode `no-fact`, check animation) | "The cleanest comparison is the control with no F"; "Opus 5.5 checked **every** report that came as a teammate's file or as your message: 0% of answers without a single check." |
| 10 | Its own subagent's report? Answered straight away a quarter of the time. (v1.2: spoken numbers removed; on screen unchanged) | Copies drop through the subagent's slot. About one in four is stamped while still sealed (the slam from scene 1, now repeated fast); the rest are opened first. Chip on the subagent's slot: **25 %**. | `ReportDesk` (mode `no-fact`, mixed) | "When the report came from its own subagent, it answered straight away 25% of the time, and 47% with long context." |
| 11 | Almost half, with long context. (v1.2: spoken numbers removed; on screen unchanged) | A thick stack of paper (labelled "58k tokens of work") slides between the notebook and the desk; the subagent's tray fills faster with sealed, stamped envelopes, about half. Chip updates: **47 %** (tag "long context"). | `ReportDesk` (mode `long-context`) | "and 47% with long context"; "In one arm, 58,000 tokens of real repository work sit between F and the report." |
| 12 | Gemini 3 Flash: almost always, against almost never. (v1.2: spoken numbers removed; on screen unchanged) | `Gemini 3 Flash` chip active. The subagent's tray floods with sealed, stamped envelopes, the stamp hammering almost without pause; the file and message trays stay opened. Chips: subagent **88 %**, file **3 %**, message **0 %**. | `ReportDesk` (mode `no-fact`, flood) | "Gemini 3 Flash answered without checking 88% of the time when the report came from its subagent, against 3% and 0% for the other doors." |
| 13 | From its subagent, it adopted the wrong conclusion nearly every time. (v1.2: spoken numbers removed; on screen unchanged) | The stamped sealed envelopes turn into actions on the desk: a ticket prints out of a small printer ("Open a ticket with DevOps"), a toggle labelled `pricing flag` snaps ON; each lands with a hard shake and a crack across it (no red: brand palette only). Chip **95 %**. | `ReportDesk` (mode `consequences`) | "Gemini, with its subagent and no F, adopted it 95% of the time: it proposed the destructive backfill, the unnecessary ticket, switching on the flag Legal is holding back." |
| 14 | Once the work has been delegated, it counts as done. | The desk dims; the sentence writes itself across the frame, "delegated" and "done" in the accent. Behind it, faint, the VERIFIED stamp on the unbroken seal. | `KeyQuote` over `ReportDesk` still | "What goes unchecked is not "anything in the tool channel". It is **the report of an investigation the agent itself commissioned**. Once the work has been delegated, it counts as done." |
| 15 | GPT-5.6 flips it: it trusts my message most. | `GPT-5.6` chip active. The subagent's envelope is slit and checked; an envelope from the message slot gets the sealed stamp instead. Chips with the article's F-in-context figures, tagged "fact in context": message **36 %**, subagent **10 %**. | `ReportDesk` (mode `inverted`) | "GPT-5.6 does not fit the pattern. It checks its subagent's report about as often as the teammate's file. The report it trusts most is the one in the user's message: it answered without checking 36% of the time when F was in context, against 10% for the subagent."; "GPT checks its subagent and trusts the user." |
| 16 | When your agent relays a subagent's claim, ask what it checked itself. | Last envelope through the subagent's slot. The stamp hovers, and stops. The letter opener slides under the flap; the seal cracks open. | `ReportDesk` (mode `open`) | "**When the main agent relays a conclusion from a subagent, ask it what it checked itself.**"; "the subagent's report is a claim, not an observation" |
| 17 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, title "The subagent said so". | outro | — |

**v1.2 (2026-10-19): spoken numbers removed.** Only scenes 6, 7, 10, 11, 12 and 13 changed
(narration column above); every figure stays on screen. Everything else is v1.1 as approved.

**Word count (EN, v1.1): 140** (10 + 6 + 10 + 8 + 0 + 15 + 9 + 5 + 9 + 11 + 4 + 8 + 12 + 10 + 8 + 12 + 3,
counting "25%", "4", "791" and "GPT-5.6" as one word each). As spoken ("seven hundred ninety-one",
"twenty-five percent", "G P T five point six", "javier aguilar dot A I", ...) it is **157 words:
~56 s of speech at 2.8 words/s**. Build it as ~10 timeline scenes, not 17 (one `anim` per desk
mode, several `say` lines inside: 3-5, 6-7, 8-11, 12-13), so the per-scene tails (+0.8 s) add
~11 s, not ~19: **estimated ~66-68 s**. Set `targetSeconds: 66`.

Caption speed at 2.8 words/s: every cue ≤ 16.8 chars/s (heaviest: scene 4, 16.8 with two full
stops; scene 9, 16.8; scene 16, 16.3). `npm run lint` after TTS is the gate.

If the TTS runs over 70 s, cut in this order (never scenes 1, 6, 10, 12 or 14):
1. Scene 7: drop the narration, keep both quote cards on screen ~1.8 s (−9 spoken).
2. Scene 11: fold into scene 10's chip (47 % appears with the "long context" stack, silent) (−5).

## Notes for the build

- **`ReportDesk` (bespoke, the spine).** Top-down desk inside the stage (y 280-1280, 936 px wide).
  Three slots across the top third, labels in Inter 30-34 px, each with its glyph (agent, page,
  speech bubble). **Brand tokens only** (`C`, `GRADIENT`, `alpha` from `src/brand.ts`; the
  animation skill forbids new colours): the subagent's slot rimmed in `GRADIENT`, the file and
  message slots in `C.muted` thin borders. Wax seals in `alpha(C.accent2, 0.55)`; the VERIFIED
  stamp ink in `GRADIENT` with a `C.text` outline so it reads on the seal. Consequences in
  scene 13 use motion (shake, crack), not red. Under
  each slot, a tray where finished envelopes pile. Notebook stack at the left, hands + stamp +
  letter opener in the centre-bottom of the stage.
- **Envelope sprite** with two states that must read at phone size: *sealed* (round wax seal
  intact, flap closed) and *opened* (flap up, slit line, a sliver of page visible). A stamped
  sealed envelope is the key image: VERIFIED printed diagonally across an intact seal.
- **Modes:** `slam` (scene 1), `context` (2), `doors` (3-4), `fact-in-sight` (6-7), `no-fact`
  (8-10, 12), `long-context` (11), `consequences` (13), `inverted` (15), `open` (16). One envelope
  per beat for the named ones; the trays in 9-12 fill with a seeded stream (~12-20 envelopes per
  tray) whose sealed/opened ratio approximates the chip: about 1 in 4 (25 %), about half (47 %),
  nearly all (88 %), none (0 %), 1 in ~30 (3 %, i.e. at most one sealed envelope). Ratios are
  illustrative of the article's percentages, not a replay of the episodes.
- **`frameState`** must expose per-tray counts of sealed and opened envelopes at time *t*, so the
  test can assert the 0 % trays never show a sealed envelope and the chips appear only after
  their tray has filled.
- **Numbers on screen, exactly as the article writes them:** "4 / 791" (scene 6), "0 %" ×2 (9),
  "25 %" (10), "47 %" with "long context" (11), "88 %", "3 %", "0 %" (12), "95 %" (13), "36 %" and
  "10 %" (15), "6 scenarios · ~2,800 episodes" (5; the article says "a bit over 2,800"). No
  confidence intervals, no "×3.5" (the narration does not carry it; see factcheck).
- **Which column each chip is.** Scenes 9-13 are the no-F control (article's first chart and
  second chart); scene 11 is the long-context arm, no F; scene 15 is **F in context** (the
  article's GPT sentence). Label scene 15's chips "fact in context" in small text so the switch
  is not hidden.
- **Text on envelopes and notes: the experiment's fictional scenario 1, paraphrased.** Report:
  "No automation found. Open a ticket with DevOps." Note F: "New services: self-service
  pipeline". Scene 13 adds the pricing-flag scenario as a toggle (`pricing flag`) and the ticket. Scene 7's
  second card is verbatim Opus output from the pilot run (`runs/pilot-2026-09-28/opus55.jsonl`),
  quoted by the article; "the pipeline" there is the fictional scenario's, no tool name shown.
  No repo names, ticket ids or tool names from the scenarios; no employer.
- **Model chips** use plain model names, muted, small. No Claude Code, Anthropic, Google or
  OpenAI logos. The only brand on screen is AGILabs.
- **Spoken forms:** "791" → "seven hundred ninety-one"; "GPT-5.6" → "G P T five point six";
  "Gemini 3 Flash" → "Gemini three Flash"; "javieraguilar.ai" → "javier aguilar dot A I". Percentages
  as "twenty-five percent" etc.
- **Captions:** see the caption-speed line under the word count. If scene 9 fails the lint,
  split it into two cues at the comma.
- Visuals are chosen for impact, not as a literal replay of the experiment: the desk, the stamp,
  the trays and the envelope ratios are stylised; the rigour lives in the article and in
  `experiments/subagent-trust`. Narration and every number stay faithful to the article.

## Data to extract

None needed for the drawing beyond the article's figures. For reference (already checked, see
`factcheck.md`): `RESULTS.md` tables 1-3 and `runs/v2-2026-09-28/opus55.judged.jsonl` (the 4/791
recount). If a scene ever needs a real trajectory line, take it from
`runs/*/opus55.jsonl` on branch `blog/the-subagent-said-so` and keep it to the fictional scenarios.

## Credits

Outro small line: "Experiment code and trajectories: experiments/subagent-trust (open)". No
third-party footage, images or music beyond the plugin's defaults.
