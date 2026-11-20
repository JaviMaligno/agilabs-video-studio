# How an AI agent forgets — vertical reel (EN) · script v5 (the trip chat)

Concept reel, vertical 9:16, ~85 s. EN-only (ES column empty).

**It follows the long version's world** (`examples/agent-memory-long`, script v5): one everyday
example from start to finish. A trip-planning chat: "Change of plan: my flight is Friday, not
Thursday." "Got it!" An hour later the AI books the hotel for Thursday. The red slip "FLIGHT:
FRIDAY" travels through each memory and shows where it dies or survives.

**The experiment is instrumental, not the subject.** No warehouse on screen or in the voice. The
results enter only as "in my tests with AI agents" and as the general claims below; no figure is
spoken or shown, and no number is transferred to the trip. The advice on the apps rests on
Javier's own long use of them, not on these experiments.

Sources (all javieraguilar.ai): "Compact or Look It Up" (scheduled 2026-12-11), "Explicit State
Doesn't Forget. It Misremembers.", "When the Fact Stops Being True". Every claim is traced in
`factcheck.md`.

| # | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|
| 1 | bespoke: `ChatTrip` (cold open) | You told your AI the plan changed. It said "got it". An hour later, it booked the old plan. | | Frame 0: a phone-style chat. High up: "Change of plan: my flight is Friday, not Thursday." → "Got it!"; a "later" divider; at the bottom, already there and pulsing red: "Booked your hotel for Thursday night ✓". Poster frame (frame 12). | — (everyday example; the coherent correction, recast) |
| 2 | bespoke: `MemoryMap` | It didn't ignore you. It forgot. Your AI has a few places to remember things, and each one forgets in its own way. | | The robot holding the slip "FLIGHT: FRIDAY"; five memory tiles draw in around it, unlabelled, one per word; title "How an AI agent forgets". | — (thesis) |
| 3 | bespoke: `HeadShelf` | What it learned in training is frozen. Your correction has to go somewhere else. | | Books stream into the shelf in the robot's head; the glass doors close and lock on "frozen"; the slip flies at them, bounces off and floats down to the desk. | — (framing: a message received during a job is not written into the model's weights) |
| 4a | bespoke: `MemoryDesk` (crowded, short) | First, the desk: the chat it can see. In a long chat, "Friday" can get buried under hotels and prices. | | The desk lights on "desk", the slip on top of the chat's pages; hotel cards and price tags land until the slip is buried. | — (framing; the context window) |
| 4b | `MemoryDesk` (wiped) | And a new chat starts with a clean desk, unless something was saved to memory. | | The pile slides off; the bare desk in morning light; "Hi! How can I help you today?"; a faint dashed slip hovers on "unless something was saved to memory". | — (a new session starts with an empty context unless a memory feature fills it) |
| 5 | `MemoryDesk` (squeeze) | When the desk fills up, it writes a summary and throws the pages away. A good summary keeps "Friday". A weaker one can drop it. | | Pages pile up on the desk, then squeeze into one card "trip plans"; the slip drops in and the card gains "flight: Friday" with a tick; the robot greys (a weaker model) and its card shrinks and drops the line. | Summary arms applied the coherent correction in 5-6 of 6 ("every arm except `fresh_lookup` applied it in five or six of six"); older-model summaries degraded over longer days (Memory arm, a prose summary on Haiku 4.5: 1.00 / 0.96 / 0.75 / 0.72); "the gap between the two depends on how good the summariser is" |
| 6a | bespoke: `FilingCabinet` (file, short) | Or it files the whole chat away and looks things up by keyword. Sounds safest, right? In my tests with AI agents, it did the worst. | | Every page, the slip too, slides into the filing cabinet; a magnifier comes in on "keyword". "Sounds safest, right?": a "?" rises over the magnifier and the cabinet glows. "the worst": the cold open's "Booked your hotel for Thursday night" comes back, crossed. | "A clean session with a searchable transcript was the only arm that failed in every condition, with both models." |
| 6b | `FilingCabinet` (miss, short) | It searched for hotels and prices, and almost never for a change of plan it didn't know about. | | The magnifier opens the drawers tagged "hotels" and "prices"; the drawer holding the slip is never opened; the question it never asks, "anything changed?", comes up dashed and is struck. | "its searches almost never bring back the notice (one in forty)"; "nothing in its context says there was a correction to look for, so it never asks." |
| 7a | bespoke: `ClipboardForm` (replace) | Or it keeps a few named boxes: flight, hotel. "Friday" replaces "Thursday" and stays. | | A clipboard with boxes FLIGHT, HOTEL (and DESTINATION, LAST ENTRY) filling in; the slip slides into FLIGHT: "Thursday" struck, "Friday" written in the same box; a warm light and a tick ("stays"). | "SKILL.state gives the agent a fixed set of fields" |
| 7b | `ClipboardForm` (margin, short) | But a fact with no box gets lost. | | "allergic to feathers" scribbled in the margin; the next entry wipes it. | Named field 24/24 vs no field 0/24 (Explicit State article table); "There is no field for a quarantine, so the model writes it into the last event and the next event overwrites it." |
| 8a | bespoke: `MemoryOffice` (human) | Like you: the gist in your head, your email to search, a note on the fridge. | | The robot's office, softly lit; the human version comes in on its words: a head with a card, an inbox, a fridge note "FLIGHT FRI". | — (analogy) |
| 8b | `ChatTrip` (save) | These apps often save to memory on their own, but when something matters, ask it to save it. | | The trip chat beside the app's "Memory" panel (two notes already there); the old chat dims; "Save to memory: my flight is Friday." is typed and sent, and appears in the panel, lit. | — (practical advice from Javier's use of the apps; no stronger than that) |
| 9 | outro | More at javieraguilar.ai. | | Outro card: AGILabs badge, javieraguilar.ai. | — |

Rows 4, 6, 7 and 8 each have two visual beats, so each is split into two scenes at a sentence
boundary (a/b); the text is the row's, verbatim. Line 6's "Sounds safest, right?" beat: the "?"
over the magnifier and the cabinet glowing.

## Must show

- Frame 0: the chat with the wrong Thursday booking already made, pulsing red.
- "Friday" followed through every memory, as the slip "FLIGHT: FRIDAY".
- Each memory's way of failing, seen: the slip bouncing off the closed shelf, buried under hotel
  cards and price tags, the desk wiped by a new chat, the weaker summary dropping the line, the
  slip in a drawer that is never opened, the margin note wiped.
- The human counterparts: the gist in your head, email, the fridge note.
- The practical advice on screen: "Save to memory: my flight is Friday."
- On screen: no figures.

## Count

EN: 219 words. The cloned voice at speed 1 reads ~2.9 words/s: ~76 s of speech, ~84-85 s with the
breaths between scenes. `targetSeconds: 84` until the first TTS pass.

## History

- v1-v3: the warehouse version (see git history). Rejected: the experiment is only instrumental.
- v5: rebuilt on the long version's trip world (approved by Javier, 2026-11-19).
