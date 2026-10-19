# Fact-check: The Subagent Said So (EN vertical) · v1.2 (spoken numbers removed)

Source: `src/content/blog/en/the-subagent-said-so.md` on `origin/blog/the-subagent-said-so`
(personal-website, pubDate 2026-10-21, not yet on `main`). Cross-checked against the
experiment folder the article links, `experiments/subagent-trust` on the same ref
(`RESULTS.md`, `scenarios.json`, `runs/v2-2026-09-28/*.jsonl`, `runs/pilot-2026-09-28/*.jsonl`).
Every spoken claim and every number or text shown on screen, with the article sentence it rests on.

## Narration

| # | Claim (spoken) | Article sentence | Repo check |
|---|---|---|---|
| 1 | "My agent tends to take its subagent's report as fact." | Description: "When my agent delegates, it tends to take the subagent's report as fact" | v1.1 restores the article's hedge "tends to" (v1 said "takes"). |
| 2 | "Even when the subagent knew less." | Description: "even when the subagent knew less than it did"; "The subagent always starts with less context." | — |
| 3 | "Same report, word for word. I changed only the door." | "the report can be held fixed while the door it comes through changes"; figure alt: "The same report, written in advance and identical word for word"; caption "Only the door changes." | — |
| 4 | "Its own subagent. A teammate's file. My message." | Figure alt: "as its own subagent's result, as a file a teammate left, or pasted into a message from the user" | `RESULTS.md` columns: subagente / fichero / usuario |
| 5 | (silent in v1.1; chips on screen) "Three model families." | Description: "I measured it on three model families."; "I tested Claude Opus 5.5 …, Gemini 3 Flash and GPT-5.6" | — |
| 6 | "With the fact in plain sight, Opus almost never adopted the wrong conclusion." (v1.2; "4 / 791" on screen only) | "With F in context, Opus 5.5 adopted the report's wrong conclusion **4 times in 791 episodes**, and never when the report came from its own subagent." "In plain sight" is the article's own phrase: "when what it knows is in plain sight". | Recounted from `runs/v2-2026-09-28/opus55.judged.jsonl`: origin ≠ none → 791 labelled episodes, labels flags 756 / holds_silent 31 / **adopts 4**; all 4 via channel `tool` (file), arms A, A, A, L. Matches. |
| 7 | "It often said why: "it couldn't see my notes."" (v1.2: "my notes" is the verbatim v2-campaign variant noted at the end of this row; "often" is softer than the article's "usually") (+ on-screen card "it couldn't see those notes" and "that's my fault: I didn't tell it about the pipeline") | "More than that, it usually named the cause itself. It explained that the subagent had recommended a ticket "because it couldn't see those notes", or it took the blame: "that's my fault: I didn't tell it about the pipeline"" | Both verbatim in `runs/pilot-2026-09-28/opus55.jsonl`: "...recommended a ticket because it couldn't see those notes and only searched the service repos" and "...suggested a DevOps ticket, but that's my fault: I didn't tell it about the pipeline you just described." (v1 said the second was not found; the reviewer found it in the pilot file.) Note: both quotes come from the pilot run, not from the 791-episode v2 campaign; v2 has close variants ("it couldn't see my notes", "That was my fault: I didn't tell it about the freeze"). |
| 8 | "The gap was in checking." | "The difference was in what the agent does *before* answering." Section heading: "What did happen: nobody checks the subagent". | — |
| 9 | "Without the fact, Opus checked every file and message." | "The cleanest comparison is the control with no F: the agent has nothing to contrast the report against"; "Opus 5.5 checked **every** report that came as a teammate's file or as your message: 0% of answers without a single check." | `RESULTS.md` table 1, Opus A+E, F = no: fichero 0 %, usuario 0 %; L, F = no: also 0 % / 0 %. |
| 10 | "Its own subagent's report? Answered straight away a quarter of the time." (v1.2; 25 % on screen) | "When the report came from its own subagent, it answered straight away 25% of the time, and 47% with long context." | Table 1, Opus A+E, F = no, subagente **25 %** [5, 48]. |
| 11 | "Almost half, with long context." (v1.2; 47 % on screen) | Same sentence; "In one arm, 58,000 tokens of real repository work sit between F and the report." | Table 1, Opus L, F = no, subagente **47 %** [13, 80]. |
| 12 | "Gemini 3 Flash: almost always, against almost never." (v1.2; 88 % / 3 % / 0 % on screen) | "Gemini 3 Flash answered without checking 88% of the time when the report came from its subagent, against 3% and 0% for the other doors." | Table 1, Gemini A+E, F = no: **88 % / 3 % / 0 %**. |
| 13 | "From its subagent, it adopted the wrong conclusion nearly every time." (subject: Gemini, from scene 12; v1.2; 95 % on screen) | "Gemini, with its subagent and no F, adopted it 95% of the time: it proposed the destructive backfill, the unnecessary ticket, switching on the flag Legal is holding back." | Table 2, Gemini A+E, F = no, subagente **95 %** (adoption). Note: adoption over all episodes in that cell, not only unchecked ones; the line does not say "unchecked". |
| 14 | "Once the work has been delegated, it counts as done." | Verbatim: "Once the work has been delegated, it counts as done." | — |
| 15 | "GPT-5.6 flips it: it trusts my message most." | "GPT-5.6 does not fit the pattern. It checks its subagent's report about as often as the teammate's file. The report it trusts most is the one in the user's message"; "GPT checks its subagent and trusts the user." Heading: "GPT does it the other way round". | Table 1, GPT A+E, F = yes: usuario 36 %, subagente 10 %, fichero 6 %. |
| 16 | "When your agent relays a subagent's claim, ask what it checked itself." | "**When the main agent relays a conclusion from a subagent, ask it what it checked itself.**"; "the subagent's report is a claim, not an observation" | — |
| 17 | "More at javieraguilar.ai" | — | — |

## Numbers and texts on screen

| On screen | Scene | Article sentence |
|---|---|---|
| Chips `Opus 5.5` · `Gemini 3 Flash` · `GPT-5.6` | 5 onward | "I tested Claude Opus 5.5 …, Gemini 3 Flash and GPT-5.6" |
| "6 scenarios · ~2,800 episodes" | 5 | "I wrote six scenarios"; "That is a bit over 2,800 episodes." (`RESULTS.md`: "24 de ~2.800 veredictos no se pudieron leer") |
| Slot labels `its own subagent` · `a teammate's file` · `the user's message` | 3-4 onward | Figure labels: "its own subagent", "a teammate's notes", "the user's message" ("file" is the article's word in the body: "as a teammate's file") |
| "4 / 791", the 4 shown via the file slot, none via the subagent's | 6 | "4 times in 791 episodes, and never when the report came from its own subagent" (recount: all 4 via channel `tool`) |
| Quote cards "it couldn't see those notes" and "that's my fault: I didn't tell it about the pipeline" | 7 | "because it couldn't see those notes"; "that's my fault: I didn't tell it about the pipeline" |
| "0 %", "0 %" on file and user slots (Opus) | 9 | "0% of answers without a single check" |
| "25 %" subagent slot (Opus) | 10 | "it answered straight away 25% of the time" |
| "47 %" + "long context", stack labelled "58k tokens of work" | 11 | "and 47% with long context"; "58,000 tokens of real repository work" |
| "88 %" · "3 %" · "0 %" (Gemini) | 12 | "88% of the time … against 3% and 0% for the other doors" |
| "95 %" (Gemini adoption), printed ticket, pricing-flag toggle ON | 13 | "adopted it 95% of the time: it proposed … the unnecessary ticket, switching on the flag Legal is holding back" |
| "36 %" message slot · "10 %" subagent slot, tagged "fact in context" (GPT) | 15 | "it answered without checking 36% of the time when F was in context, against 10% for the subagent" |
| Envelope text "No automation found. Open a ticket with DevOps." | 3, 6 | "New services are onboarded through a self-service pipeline. The report says there is no automation and recommends opening a ticket with DevOps." (`scenarios.json` id 1 `not_f_summary`: "There is no automation; open a DevOps ticket …") |
| Note F "New services: self-service pipeline" | 6 | Same scenario bullet. |
| KeyQuote "Once the work has been delegated, it counts as done." | 14 | Verbatim. |
| Outro credit "Experiment code and trajectories: experiments/subagent-trust (open)" | 17 | "The code, the six scenarios, all trajectories and the analysis are in experiments/subagent-trust." |

## Not used, on purpose

- **"about three and a half times as often"** (adoption unchecked vs checked: Opus 7 % vs 2 %,
  Gemini 45 % vs 13 %). Strong, but a second ratio in a 66 s video crowds scene 13; can replace
  scene 13 if Javier prefers the mechanism over the Gemini headline.
- **Gemini/GPT with F in context, 9–11 % via subagent vs 2–5 %.** Omitted so scene 6 stays one
  model; the line says "Opus" explicitly so it does not overclaim for the other two.
- **The harness-label intervention** (GPT 10 % → 0 % unchecked, adoption 14 % vs 13 %). Its own
  story; would need ~10 s.
- **Confidence intervals.** Not shown; the article itself says "Confidence intervals bootstrapped
  over scenarios are wide; the contrasts against 0% are the solid part." Scenes 9 and 12 lean on
  exactly those contrasts against 0 %.

## Illustrative, not claims

- The desk, hands, rubber stamp, letter opener, envelopes, wax seals and slots. "VERIFIED" is the
  metaphor for answering without a tool call after the report (the article's mechanical metric),
  not a word the agent printed.
- The sealed/opened ratio inside each tray (approximates the chip; not a replay of episodes) and
  the stamp tempo.
- The subagent's thin notebook vs the main agent's tall stack (pictures "starts with less
  context"; the memory arm really had F "buried among 39 other notes", which the stack loosely
  echoes).
- Scene 13 mixes two scenarios (ticket, pricing flag) on one desk; in the experiment each episode
  is one scenario.
- Scene 16's opened envelope is a recommendation, not a measured outcome.

## Anonymisation

The article publishes the six scenarios generically, and the experiment's scenarios already use a
fictional org (`acme/...`). On screen only generic labels appear ("self-service pipeline",
"ticket with DevOps", "pricing flag"); no repo names, ticket ids (e.g. the scenario's legal
ticket id), tool names or employer.

## Reviewer notes (v1.1)

- **Hedge restored** in scene 1 ("tends to take").
- **Scene 15 uses the F-in-context GPT figures (36 % vs 10 %)** on purpose: they are the
  article's own GPT sentence, and the no-F figures (18 % subagent, 2 % file, 15-16 % message) do
  not show the inversion. The chips carry a visible "fact in context" tag.
- **95 % kept over "about three and a half times"** in scene 13: one concrete headline reads
  better at phone size; the ratio stays in the article.
- **Article issues found while checking (not used in the video):**
  - "Gemini, with its subagent and no F, adopted it 95% of the time: it proposed the destructive
    backfill, ..." — the backfill scenario (id 4, cents) is not in the v2 campaign (scenarios 1,
    2, 3, 5, 6, 7), and `runs/v2-2026-09-28/gemini3flash.jsonl` has 0 matches for "backfill".
    The only "backfill" trajectory is Opus in the pilot. The video shows only the ticket and the
    pricing flag.
  - First chart alt text says GPT no-F "16% user"; `RESULTS.md` table 1 says 15 %.
- **Brand:** slot colours (amber/teal/slate) replaced by glyphs + brand tokens; no red in scene 13.

## Build notes (v1.1 render, 2026-10-19)

On-screen texts added while building, with their source:

| On screen | Scene | Source |
|---|---|---|
| Slot chips "0" · "4" · "0" (adoptions per door, fact in sight) | fact | "4 times in 791 episodes, and never when the report came from its own subagent"; recount in `opus55.judged.jsonl`: all 4 via channel `tool` (file), so the message door is 0. |
| "fact in plain sight" / "no fact · % answered without a single check" / "fact in context · …" tag line | fact / check-long-gemini / gpt | Article: "in plain sight"; "0% of answers without a single check"; GPT figures are "when F was in context". |
| "never passed on", "its notes" (main agent and subagent), "subagent" | context | "It does not see my memory files, the decisions we made an hour earlier…" (illustrative). |
| Quoted report slip "No automation found. Open a ticket with DevOps." | doors | Scenario 1 paraphrase, as in the script. |
| "ticket" printer, "pricing flag" toggle ON, "adopted the wrong conclusion" next to 95 % | gemini | "it proposed … the unnecessary ticket, switching on the flag Legal is holding back"; "adopted it 95% of the time". |
| "long context" under 47 % | long | "and 47% with long context". |

Tray ratios (illustrative, 20 envelopes per tray, sealed = stamped without opening): Opus 5/20
(25 %), long context 9/20 (47 %), Gemini 18/20 · 1/20 · 0/20 (88 % · 3 % · 0 %), GPT with F 2/20 ·
1/20 · 7/20 (10 % · 6 % · 36 %; the file chip is not shown). Tested in `test/anim.test.ts`: the 0 %
trays never show a sealed envelope and every chip appears only after its tray has filled.

Narration: unchanged from the approved script. Line 6 is voiced as two lines split at its comma
("With the fact in plain sight," / "Opus adopted…"), same words, so its first caption cue stays
under 17 chars/s. Spoken forms: "791" → "seven hundred ninety-one", "GPT-5.6" → "G P T five point
six", "Gemini 3 Flash" → "Gemini three Flash", percentages in words, "javieraguilar.ai" →
"javier aguilar dot A I".

**v1.3 (2026-10-19):** on-screen quote cards updated to the corrected article (branch tip 9fe9c797, v2-campaign quotes): "it couldn't see my notes" (ep. 80) and "that's my fault: I didn't tell it that B ran a different model" (ep. 397). Supersedes the pilot quotes in rows 7 and the quote-card row above.
