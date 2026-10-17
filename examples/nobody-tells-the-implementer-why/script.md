# Nobody tells the implementer why — explainer video (EN) · script draft v1

Article: "Nobody tells the implementer why" (javieraguilar.ai, 2026-11-05). Vertical 9:16, target ~50 s, 134 spoken words.
Data on screen: real hand-off lines from the published, anonymised agent-telephone data
(`experiments/agent-telephone/runs/cc_grid/messages.jsonl`, run `software_3-hier_chain-free-clean-sonnet`).

**Central metaphor: the request is a paper strip, and every "because" is an amber tab stapled to it.**
The strip drops down a vertical shaft of four desks (lead → PM → architect → implementer: the 9:16 frame
*is* the chain). At each desk the strip is retyped, crisp, tabs still attached. At the last desk a pair of
scissors snips every amber tab off before the strip reaches the builder, and the tabs flutter into a
pile on the floor beside the implementer: a pile of whys nobody reads. The video opens on that snip and
ends on a hand stapling one tab back on.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Nobody tells the implementer why. | **Cold open, 0–2 s:** close-up of a paper strip, one line in crisp type, an amber tab hanging off it reading "because the mobile app stopped updating last_login". Scissors slide in from the right — SNIP — the tab drops out of frame. Title types over the clean strip. | bespoke: `ScissorsCut` (cold-open variant) over `RequestStrip` | Title: "Nobody tells the implementer why" |
| 2 | I passed a client's request down a team of agents, from the lead to whoever writes the code. | Pull back: the strip is now the full client request, unrolling from the top of the frame. Below it, four desks stacked vertically, each a glowing node with a role label: lead, PM, architect, implementer. Amber tabs dot the strip. | bespoke: `HandoffShaft` + `RequestStrip` | "When that request then goes to a lead agent, which passes it to a product manager, which passes it to an architect, which passes it to whoever writes the code" |
| 3 | Names, numbers, prohibitions: almost all of it arrived. | The strip drops desk to desk; at each one it is retyped (typewriter flicker) but the fact chips stay sharp: "Þórdís", "730 days", "Never touch…". Small teal ticks pop on each chip as it passes. | `HandoffShaft` (fact chips) | "Most of the request survives the trip." / "prohibitions arrive intact 98% of the time … numbers 92%, names and conditions 90%" |
| 4 | For two hops, so did the reasons. | Camera rides with the strip past the lead and PM desks. The amber tabs are still there; the real PM line is legible: "(the mobile app stopped updating last_login after the Auth0 switch)". | `HandoffShaft` + `RequestStrip` (real line, PM → architect) | "the reason behind a decision travels well for two hops: 88–99% in the lead's message to the PM, 83–97% from the PM to the architect" |
| 5 | Then the architect wrote to the implementer. | The strip arrives at the architect's desk. Beat of stillness. The scissors from the cold open are lying on that desk. | `HandoffShaft` | "Then the architect writes to the implementer" |
| 6 | In my runs, the "because" survived in only 8–31% of those messages. | SNIP, SNIP: every amber tab is cut. They flutter down and settle in a pile on the floor next to the implementer. The strip that arrives reads, real: "Inactivity is measured on last_seen_at, never last_login." Small corner chip: "8–31% · Claude, software teams". | bespoke: `ScissorsCut` + `WhyPile` | "Then the architect writes to the implementer, and it falls to 8–31%." |
| 7 | It isn't worn away, like in the telephone game. It's cut. | Split screen. Left, labelled "telephone": a strip whose letters blur and dissolve a little at every desk. Right, labelled "what I saw": letters stay razor-sharp, and one clean cut line at the last desk. | bespoke: `ErosionVsCut` | "So it is not a telephone effect in the sense of something wearing away from mouth to mouth." / section heading "The why is not worn away. It is cut" |
| 8 | Even the lead, writing that message itself with the client's request in hand, kept the reason only 24% of the time. | The PM and architect desks fade. The lead's node swoops straight down to the implementer, carrying the original request as a full page with every tab on it. It still snips: about three tabs in four fall to the pile, one stays attached. Counter "24%". | bespoke: `RelayShortcut` + `ScissorsCut`; `Counter` (24%) | "the lead writes hop 4 itself, with the client's request in front of it, and only keeps the reason in **24%** of its messages to the implementer, with Haiku and with Sonnet alike. It has the information; it chooses not to pass it on." |
| 9 | Whoever writes to the builder writes instructions. And instructions don't carry reasons. | Text slam over the implementer's desk, the pile of amber tabs beside it. | `KeyQuote` | "whoever writes to the person who builds writes instructions, and instructions do not carry reasons" |
| 10 | Whether losing it hurts the code is less tidy than I expected. | The implementer's screen lights up with code; the pile of tabs sits untouched. A small "?" hovers between them. No number. | `HandoffShaft` (implementer close-up) | "That was my next question, and the answer is less tidy than I expected." |
| 11 | But if the why matters to whoever builds, put it in their message yourself. Or attach the original. | A hand picks one amber tab from the pile and staples it back onto the strip (CLACK). Then a paperclip clips the original client page to the strip. | bespoke: `ReattachTab` | "If the reason matters to the person executing, it has to be in their message, and nobody will put it there for you." / "If you want the implementer to know *why*, say so in the delegation or attach the original." |
| 12 | More at javieraguilar.ai. | Outro card: AGILabs badge, javieraguilar.ai, title "Nobody tells the implementer why". | outro | — |

**EN word count: 134** (lines 1–12). At ~2.6 words/s plus scene breaths: **~50–54 s**. ES column left empty (EN-only for now).

## Notes for the build

- **`RequestStrip`** (bespoke): a paper strip in brand neutrals with monospaced/serif type and amber
  "because" tabs (`accent` amber, the article's figure colour for the implementer). Content comes from a
  small JSON committed with the example, pre-extracted from the real run
  `software_3-hier_chain-free-clean-sonnet` (GDPR purge job, fictional client "Tidewater Climbing"):
  - client → lead: "Inactivity is measured on `last_seen_at`, not `last_login`, because the mobile app stopped updating `last_login` after the Auth0 switch."
  - PM → architect: "Inactivity is measured on last_seen_at, NOT last_login (the mobile app stopped updating last_login after the Auth0 switch)."
  - architect → implementer: "Inactivity is measured on last_seen_at, never last_login."
  - Second tab, same run: "Skatteetaten requires five-year retention" (present to the architect, gone in the implementer's message).
  Lines are quoted verbatim but cropped to one sentence; the scene is illustrative (one run standing for the pattern).
- **`HandoffShaft`** (bespoke): four role nodes stacked top to bottom (teal outline for lead/PM/architect,
  amber for implementer, as in the article's topology figure). Camera tracks the strip downwards; props:
  current hop, which tabs are attached, fact chips with tick state.
- **`ScissorsCut`** (bespoke): open/close scissors sprite, snip sound cue, cut tabs fall with a light
  flutter (seeded, deterministic per frame) and land in **`WhyPile`**, which persists from scene 6 to 11.
  Cold-open variant for scene 1 (single tab, tight crop).
- **`ErosionVsCut`** (bespoke): two strips side by side; left applies progressive blur/letter dropout per
  hop, right stays sharp and gets one cut. Pure illustration of the contrast the article draws; no numbers.
- **`RelayShortcut`** (bespoke): lead node arcs past the faded PM/architect desks straight to the
  implementer, holding a full original page. Exactly one tab in four survives the snip, to match 24%.
- **`ReattachTab`** (bespoke): hand + stapler on one tab, then a paperclip attaching the original page.
- Numbers are support, not protagonist: only "8–31%" (corner chip) and "24%" (counter) appear on screen.
  The 88–99% / 83–97% upstream figures live in the source column, not on screen, unless a review wants a
  thin "kept: 88–99% → 83–97% → 8–31%" ribbon down the shaft in scene 6.
- Spoken forms: "8–31%" → "eight to thirty-one percent"; "24%" → "twenty-four percent";
  "javieraguilar.ai" → "javier aguilar dot A I".
- Captions: line 2 (≈90 chars) and line 8 (≈110 chars) are the long ones; check them against the 17 cps
  limit with `npm run lint` and split across two beats if needed.
- Visuals are chosen for impact, not as a literal replay of the experiment (rigour lives in the article and
  the repo); narration and numbers stay faithful to the article.
- Voice: the narration voice for this batch is Javier's own; it can be re-voiced later (TTS only re-voices
  changed lines).

## Alternative scene, if a second mechanism is wanted (not counted above)

Luna's data contract: in prose, its summary dropped the list of input fields in **54 of 72** runs; the
implementer then wrote `appointment["appointment_id"]` instead of `appointment["id"]` and the module
crashed on the first test (23% of hidden tests vs 76% with a list and 86% with the original attached).
Visual: a field-name chip falls into the pile with the whys; the code line turns red. Would add ~20 words
and push past 140, so it would replace scenes 10–11's hedge, not add to them.
