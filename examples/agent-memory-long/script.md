# How an AI agent forgets — long explainer for YouTube (EN) · script v5 (concept first, after one cold read)

Concept video, landscape 16:9, ~6 min, with chapters. EN-only (ES column empty).

**Premise card (approved by Javier, 2026-11-19).**
1. Question: why does my AI forget what I told it, in a long chat and when I open a new one?
2. One example, start to finish: planning a trip. "Change of plan: my flight is Friday, not
   Thursday." "Got it!" An hour later it books the hotel for Thursday. Next morning, in a new chat,
   it may know nothing about the trip. Each chapter follows "Friday" and shows where it dies or
   survives.
3. Frame 0: that chat, with the wrong booking already made.
4. The experiment: a tool, not the subject. No warehouse on screen. The results enter as short
   "in my tests with AI agents" lines; numbers are never transferred to the trip, and the apps
   themselves were not tested (said once, in chapter 6).
5. On screen: the chat with the wrong booking, and the new chat the next morning.

**Five fixed names, never synonyms:** training (school), the desk (what it can see now), the
summary (the gist of a meeting), the notebook (searchable by keyword; email; closest to "search
past chats"), the form (fixed boxes; the app "memory" is a looser cousin, a list of notes).

**Chapters (YouTube):** 0 Intro · 1 Training · 2 The desk · 3 The summary · 4 The notebook ·
5 The form · 6 What to combine

**Retention:** the hook plants "the one that sounds safest did worst" without naming it; paid in
chapter 4. The practical advice is paid in chapter 6.

Sources (all javieraguilar.ai): "Compact or Look It Up" (scheduled 2026-12-11), "Explicit State
Doesn't Forget. It Misremembers.", "When the Fact Stops Being True", "The Forgetting You Don't
Measure", "Your Agent Doesn't Know What Has Already Happened".

| # | Ch | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|---|
| 1 | 0 | bespoke: `ChatTrip` (cold open) | You told your AI the plan changed. It said "got it". An hour later, it booked the old plan. | | Frame 0: a chat. High up: "Change of plan: my flight is Friday, not Thursday." → "Got it!" At the bottom, already there: "Booked your hotel for Thursday night ✓". The Thursday line pulses red. | — (everyday example; the coherent correction, recast) |
| 2 | 0 | `ChatTrip` | And tomorrow, in a new chat, it may not remember the trip at all. | | Wipe to a fresh chat, morning light: "Hi! How can I help you today?" | — (a new session starts with an empty context unless a memory feature fills it) |
| 3 | 0 | bespoke: `MemoryMap` | It didn't ignore you. It forgot. An AI has several kinds of memory, a bit like you, and each one loses things in its own way. | | The robot holding a slip "FLIGHT: FRIDAY"; the five tiles draw in around it, unlabelled until their chapter. | — (thesis) |
| 4 | 0 | `MemoryMap` | I've spent months testing them on AI agents. And the one that sounds safest did the worst. | | One tile flickers with a "?"; title "How an AI agent forgets". | "A clean session with a searchable transcript was the only arm that failed in every condition, with both models." |
| 5 | 1 | chapter card + bespoke: `HeadShelf` | First, why can't it just learn it? Before an AI is released, it reads a huge amount of text, and all of it gets packed inside the model. | | Chapter card "1 · Training". Books stream into the shelf in the robot's head. | — (framing) |
| 6 | 1 | `HeadShelf` | It's like what you learned at school. Huge, and frozen. Nobody reprints your schoolbooks because your flight moved. | | A school satchel; the doors close; the "FLIGHT: FRIDAY" slip bounces off. | — (analogy) |
| 7 | 1 | `HeadShelf` | Teaching it something for good means training it again. That's slow, it's costly, and it can make it worse at what it already knew. | | One bar shoots up ("new"), the others sink ("everything else"). | "With no replay, the model learns the terminal task well … — and it forgets. General accuracy drops across the board" |
| 8 | 1 | `HeadShelf` | So your correction has to live somewhere else. | | The slip floats down to the desk. | — (transition) |
| 9 | 2 | chapter card + bespoke: `MemoryDesk` | The desk is everything the AI can see right now: its instructions, and your conversation so far. It's your working memory, only much bigger. | | Chapter card "2 · The desk". An instruction card and the chat as a stack of pages; the slip on top. | — (framing; the context window) |
| 10 | 2 | `MemoryDesk` | While "Friday" is on the desk, it can use it. | | The robot reads the slip; a calendar ticks Friday. | — (illustrative) |
| 11 | 2 | `MemoryDesk` | But a long chat buries it. You said it once, early on, and then came pages of hotels, prices and plans. | | Pages pile on top of the slip: hotel cards, price tags, a map. | — (illustrative) |
| 12 | 2 | `MemoryDesk` | Having it in front of it isn't a guarantee. In my tests, the best model slipped about once in six hundred decisions. Another got a quarter of them wrong. | | A row of ~600 ticks with one red mark, "1 in ~600"; a second robot's row, one in four red. | "it misses one decision out of roughly 600. On Gemini-3-Flash the same arm misses a quarter of them." |
| 13 | 2 | `MemoryDesk` | And a new chat starts with a clean desk. Unless a memory feature puts something back on it, it knows nothing about your trip. | | The desk wiped bare; morning light; "Hi! How can I help you today?" as a small card. | — (expert fix: apps with memory refill the desk) |
| 14 | 2 | `MemoryDesk` | On a long enough chat, the desk fills up, and something has to go. There are two ways to make room. | | The stack hits the top edge; pages tip off; a fork: SUMMARY / NOTEBOOK. | "Since then it has run a hundred commands, and its context window is full. Something has to go." |
| 15 | 3 | chapter card + `MemoryDesk` (card) | The first is a summary. When the desk is full, the AI writes up the conversation, throws the pages away, and carries on from the summary. Coding assistants do this all the time. | | Chapter card "3 · The summary". The stack squeezes into one card. | "Claude Code and Codex do the same thing at that point: they ask the model to write a summary of the conversation and start again from the summary." |
| 16 | 3 | `MemoryDesk` (card) | It's how you remember a meeting: not the words, the gist. | | Speech bubbles fade into one card. | — (analogy) |
| 17 | 3 | `MemoryDesk` (card) | The risk is that a summary decides in advance what will matter. Will "Friday" make the cut? | | The card being written; the slip hovers over it. | "a summary decides in advance what will matter, and a transcript doesn't have to." |
| 18 | 3 | `MemoryDesk` (card) | In my tests, a recent model wrote the correction into its summary and acted on it almost every time. | | The card gains the line "flight: Friday"; a row of ticks, one miss. | Summary and own-lines arms applied the coherent correction 5-6 of 6. "The arms that keep a summary or their own lines have one sentence telling them the shelf changed, and that is enough." |
| 19 | 3 | `MemoryDesk` (card) | But it depends on who writes it. In an earlier test, an older model's summaries slipped more and more as the day got longer. | | An older, greyer robot squeezes a tiny card; reds appear as a clock runs. | Memory arm 1.00 / 0.96 / 0.75 / 0.72 over longer horizons; "the gap … depends on how good the summariser is" |
| 20 | 3 | `MemoryDesk` (card) | A summary is a guess about what will matter. With a good writer, it guesses well. | | The new robot's card, ticked. | — (framing) |
| 21 | 4 | chapter card + bespoke: `FilingCabinet` | The second way sounds safer. Clear the desk, and keep the whole conversation in a notebook the AI can search by keyword. It's close to the "search past chats" some apps have. Nothing is thrown away. | | Chapter card "4 · The notebook". Every page, the slip too, slides into the cabinet. | Arm `fresh_lookup`: a clean session; "A search returns up to eight raw lines that contain every word asked for" |
| 22 | 4 | `FilingCabinet` | It's what you do with your email. You don't remember it; you know where to find it. | | An inbox icon morphs into the cabinet. | — (analogy) |
| 23 | 4 | `FilingCabinet` | This is the one that sounds safest. And in my tests, it did the worst, in every setup I tried. | | Back to the cold open: "Booked your hotel for Thursday night ✓"; the cabinet behind the robot. | "A clean session with a searchable transcript was the only arm that failed in every condition, with both models." |
| 24 | 4 | `FilingCabinet` | Here's why. After the clean-up, nothing on its desk says there was a correction. So when it books the hotel, it searches for flights and dates, never for whether anything changed. | | Empty desk; the robot opens drawers "flights", "dates"; the slip sits in an unopened drawer. | "nothing in its context says there was a correction to look for, so it never asks." |
| 25 | 4 | `FilingCabinet` | Its searches brought the correction back about once in forty. A search only helps if you know what to look for. | | The magnifier passes the slip by; "1 search in 40". The last sentence as a large line. | "its searches almost never bring back the notice (one in forty)"; "A plain search only helps an agent that knows there is something to search for." |
| 26 | 4 | bespoke: `AskReader` | A smarter notebook doesn't search by keyword. It asks a helper, a second AI, to reread the whole conversation and answer. Reading everything, the helper ran into the correction and passed it on most of the time. | | The robot asks "when's the flight?"; a second robot behind it reads the entire stack, stops on the slip, copies it into its answer. | "a separate call to the same model reads the entire transcript and answers"; "27 of 33 answers carried the correction" |
| 27 | 4 | `AskReader` | The catch: the helper has to fit the whole conversation in its head. On a chat long enough to need clearing, it fills up too, and we're back to guessing what matters. | | The reader's stack grows past the top; it splits into pieces or squeezes into a card. | "In a session long enough to need compacting, the reader would fill up too, and would have to split the history or summarise it, and the question of what to keep comes back." |
| 28 | 5 | chapter card + bespoke: `ClipboardForm` | The last memory is the strictest: a form. A few fixed boxes, kept apart from the chat, filled in as it goes. | | Chapter card "5 · The form". A clipboard: "FLIGHT", "HOTEL", "DESTINATION" boxes. | "replaces the append-only conversation history … with an explicit, mutable execution state" |
| 29 | 5 | `ClipboardForm` | When you correct it, "Thursday" is crossed out and "Friday" goes into the same box. And unlike the desk, the form is still there tomorrow. | | "FLIGHT: Thursday" struck, "Friday" written; wipe to morning, the clipboard unchanged. | "SKILL.state gives the agent a fixed set of fields" |
| 30 | 5 | `ClipboardForm` | But a form only holds what it has a box for. A fact with no box of its own gets scribbled in the margin, and the next entry wipes it. | | "allergic to feathers" scribbled in the margin, erased by the next entry. | "There is no field for a quarantine, so the model writes it into the last event and the next event overwrites it." |
| 31 | 5 | `ClipboardForm` | In my tests, with no box for it, the fact never survived. With a box named after it, it survived every time on one model, and most of the time on another. | | "0/24" → a box labelled with the fact → a grid of 24 ticks "24/24"; small "16/24" for a second model. | Table: no dedicated field 0/24 \| 0/24; schema field that names the fact 24/24 \| 16/24 (Haiku 4.5 \| Gemini-3-Flash) |
| 32 | 5 | `ClipboardForm` | A box just called "notes" helped much less. The box has to say what goes in it. | | A "notes" box half-filled dims; the named box glows. | Free-form `notes` 10/24 \| 1/24; "A place to put it is not enough; the place has to say what goes there." |
| 33 | 5 | `ClipboardForm` | And a form fails in a stranger way. It doesn't forget. It misremembers. The agent did the right thing, wrote down the wrong one, and everything after built on that. | | The hotel booked right, but the pen writes "Thursday" into the box; a cascade of red marks follows. (skeptical) | "a `Move` executed correctly with a state patch written wrong"; "the agent cascades through about 25 failures" |
| 34 | 5 | `ClipboardForm` | The saved "memory" in ChatGPT or Claude is a looser cousin: a list of notes kept outside the chat. It's still there tomorrow, but it only holds what got written down. | | Beside the clipboard, a "Memory" panel with a short list of notes; "flight is Friday" is on it, "allergic to feathers" is not. | — (analogy; app memory not tested, and closer to free-form notes than to named boxes) |
| 35 | 6 | chapter card + bespoke: `MemoryOffice` | So which memory is best? On its own, none. | | Chapter card "6 · What to combine". Pull back to the whole office. (confident) | — (verdict) |
| 36 | 6 | `MemoryOffice` | The desk fills up. The summary guesses. The search doesn't know what to look for. And the form only holds what has a box. | | Each object lights with its crack as it is named. | — (recap of chapters 2-5) |
| 37 | 6 | `MemoryOffice` | You don't run your life from one memory either. You keep the gist in your head, your email to search, and a few things on the fridge because you know they'll matter. | | Human version: a head with a card, an inbox, a fridge note "FLIGHT FRI". | — (analogy) |
| 38 | 6 | `MemoryOffice` | For agents, my tests point the same way, though I haven't tried the two together yet: a summary to carry the thread, and named boxes for the facts that must not slip. | | The recipe on screen: SUMMARY + FORM with a named box. Label "what my tests point to". (confident) | "Keep a summary, or the agent's own lines, and add the search on top if you want it"; "if a fact stays true across many steps, re-inject the field, not the record." (combination not tested) |
| 39 | 6 | `MemoryOffice` | And for you, today: when something matters, don't leave it buried in the chat. Ask it to save it to memory, in one clear line that names the fact. I didn't test the apps, and it's no guarantee, but it gets the fact out of the pile. | | A chat line typed: "Save to memory: my flight is Friday." → the line appears in the Memory panel. | — (practical advice, no stronger than the data) |
| 40 | 6 | `MemoryMap` | Every AI forgets. What matters is what it forgets, and whether anything notices. Tell me in the comments which one has bitten you. | | Back to the map, all five tiles labelled; the slip glows; the recipe small in a corner. | — (closing line + comment prompt) |
| 41 | — | outro | More at javieraguilar.ai. | | Outro card: AGILabs badge, javieraguilar.ai; end-screen space for YouTube. | — |

## Must show

- "Friday" followed through every memory, as the slip "FLIGHT: FRIDAY".
- Frame 0: the chat with the wrong Thursday booking already made; the new chat the next morning.
- The hook's question paid in chapter 4: the notebook sounds safest and did worst.
- The human counterpart of each memory: school, working memory, the gist of a meeting, email, the
  fridge note.
- Each memory's way of failing, seen: the slip bouncing off the closed shelf, the slip buried under
  pages, the desk wiped by a new chat, the slip in an unopened drawer, the margin note erased, the
  wrong value written after the right action.
- On screen, each with what it counts: "1 in ~600", "1 search in 40", "0/24", "24/24" (and "16/24").
- A chapter card at the start of each chapter, matching the YouTube chapter list.
- The practical advice on screen in chapter 6: "Save to memory: my flight is Friday."

## Count

EN: ~1,000 words. The cloned voice at speed 1 reads ~2.9 words/s: ~6-6.5 min with chapter cards.
`targetSeconds`: set from the first TTS pass.

## Cold read

- v3 and earlier: the warehouse version (see git history).
- v4: rewritten concept-first after Javier found the opening unappealing (19-nov-2026).
- v4 viewer: stayed to the end; took away that the notebook loses the correction because nobody
  searches for what they don't know exists, that a form misremembers with confidence, and that a
  named box changes the result. Lost at figures without "of what", "failed every time" next to
  "one in forty", "Claude Code", the helper named and dropped, the conversation-beside-the-form
  line, and the recap.
- v4 expert: "failed every time" is false (3/8, 2/6), only "worst in every setup"; the older-model
  summary was "worst" in another experiment, and "shorter summaries" is not in the source; "won't
  remember the trip" is false for apps with memory; "about as well as never summarising" belongs
  to the detail probe, not the correction; app memory is a list of notes, closer to the free-form
  notes field than to named boxes, so don't bind the form's failures to it; the keyword search is
  not RAG; the combination was never tested together; "just as sure" was not measured.
- v5: all of the above applied; the conversation-beside-the-form line dropped.
