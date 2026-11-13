# How an AI agent forgets — long explainer for YouTube (EN) · script v2 (after one cold read)

Concept video, landscape 16:9, target ~9-10 min, with chapters. The long version of the short
`agent-memory-kinds`: same thread (a robot running a warehouse and one red slip, "SHELF 0: EMPTY"),
the same memories, each with its human counterpart and its own way of failing, with room for the
evidence, the surprises and one flaw in my own test. EN-only (ES column empty).

Sources (all javieraguilar.ai): "Compact or Look It Up" (scheduled 2026-12-11), "Explicit State
Doesn't Forget. It Misremembers.", "When the Fact Stops Being True", "Let the Loop Iterate",
"The Forgetting You Don't Measure", "Your Agent Doesn't Know What Has Already Happened",
"Beyond RAG: Building a Recursive Language Model". Quotes are from the published versions
(origin/main) and the compact-or-look-it-up branch.

**Five fixed names, never synonyms:** training (school), the desk (what it can see now; "the day's
record" is what piles up on it), the summary (the gist of a meeting), the notebook (searchable by
keyword; email), the form (boxes; a patient's chart). On screen they are the five tiles of the map.

**Chapters (YouTube):** 0 Intro · 1 Training · 2 The desk · 3 The summary · 4 The notebook ·
5 The form · 6 A flaw in my own test · 7 What to combine

**Retention:** the cold-open agent is revealed in chapter 4 (it was the notebook); the promise
("which to combine") is paid in chapter 7 with an on-screen recipe; one surprise per chapter; at
most two figures per chapter in the voice, each with what it counts.

| # | Ch | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|---|
| 1 | 0 | bespoke: `WarehouseShelves` (cold open) | At noon, an AI agent running a warehouse is told that shelf zero is empty. So the next pallet should go there. | | Frame 0: wide warehouse, the robot at its desk; a red slip "SHELF 0: EMPTY" drops in; clock 12:00; shelf 0 glows green, "next pallet → here". | "Probe C sends an audit notice saying an earlier put-away never happened and the shelf is empty, then counts whether the agent stores the next pallet there." |
| 2 | 0 | `WarehouseShelves` | Two hours later, the pallet arrives, and it goes straight past shelf zero. As if nobody had told it. | | Clock spins to 2:00; the pallet glides past the glowing shelf 0 onto another; red cross. | "it does what an agent that never heard the correction would do" (the clean-session arm; revealed in ch 4) |
| 3 | 0 | bespoke: `MemoryMap` | It didn't ignore the message. It forgot it. And how it forgot says a lot about how these systems remember. | | The robot in the middle, the slip in its hand; the map's frame draws in. | — (framing) |
| 4 | 0 | `MemoryMap` | An agent has several memories, a bit like you. What it learned in training. Its desk. A summary. A notebook. And a form. | | One tile per word, each drawn as it is named and staying on: TRAINING (book), DESK, SUMMARY (card), NOTEBOOK (cabinet), FORM (clipboard). | — (thesis) |
| 5 | 0 | `MemoryMap` | Each one forgets in its own way. I've spent months testing them, and by the end you'll know which ones to combine. | | All five tiles hold; title "How an AI agent forgets". | — (promise, paid in ch 7) |
| 6 | 1 | chapter card + bespoke: `HeadShelf` | Start with training. Before an AI model is released, it reads a huge amount of text, and all of it gets packed inside the model. | | Chapter card "1 · Training". Books stream into the shelf in the robot's head. | — (framing) |
| 7 | 1 | `HeadShelf` | It's like what you learned at school. Huge, and slow to change. Nobody rewrites your schoolbooks because a shop down the street closed. | | A school satchel beside the head shelf; doors close. | — (analogy) |
| 8 | 1 | `HeadShelf` | So today's message can't go in there. To learn something for good, a model has to be trained again, and that has a price. | | The red slip bounces off the closed doors. | — (framing; weights are not where a message from the job goes) |
| 9 | 1 | bespoke: `ReplayBars` | I trained a small model to do one narrow thing: pretend to be a computer terminal. It learned it, and got worse at almost everything else. | | A terminal window; the "terminal" bar shoots up while "general knowledge" bars sink. | "With no replay, the model learns the terminal task well (exact-match on held-out outputs jumps from ~0.36 to ~0.90) — and it forgets. General accuracy drops across the board" |
| 10 | 1 | `ReplayBars` | Mixing a little of its old reading back in, like revising for an exam, won most of it back. | | A thin stripe of "old reading" mixed into the stream; the sunk bars climb; label "10% old reading → ~73% of the loss recovered". | "Ten percent replay recovers about 73% of the average forgetting — and roughly 82% of the worst case — at no cost to the new task" |
| 11 | 1 | bespoke: `TwoJobs` | Old habits also push back against the facts in front of it. In another test, models read that two jobs were independent, said so, and still put one first, as if habit won. | | A plan card "B doesn't depend on A"; the robot repeats it in a speech bubble; then draws the arrow A → B anyway. | "Five of six models say B must come after A."; "the model reproduced the information and then overrode it" (habit is my reading) |
| 12 | 1 | `TwoJobs` | So the message from noon has to live somewhere it can actually be read. It lands on the desk. | | The slip floats down to the desk. | — (transition) |
| 13 | 2 | chapter card + bespoke: `MemoryDesk` | The desk is everything the agent can see right now: its instructions, and the record of its day so far. It's your working memory, only much bigger. | | Chapter card "2 · The desk". The desk: an instruction card, the day's record as a growing stack, the slip on top. | — (framing; the context window) |
| 14 | 2 | `MemoryDesk` | While the message is on the desk, the agent uses it. The next pallet goes to shelf zero. | | Pallet to shelf 0, tick. | — (illustrative) |
| 15 | 2 | `MemoryDesk` | Does a crowded desk hurt by itself? Less than you'd think. With its whole day in front of it, one model missed about one decision in six hundred. Another missed far more. | | The stack grows tall; a row of ~600 ticks with one red mark, "1 in ~600"; a second robot's row with many reds. | "it misses one decision out of roughly 600. On Gemini-3-Flash the same arm misses a quarter of them." |
| 16 | 2 | `MemoryDesk` | And the task was kind: what it needed was always near the top of the pile. | | The needed page glows two sheets from the top. | "The freed shelf an agent has to reuse sits 1.9 positions from the top of the stack on average, at most 7." |
| 17 | 2 | bespoke: `RestartIterate` | Coding agents face a version of this. When an attempt goes badly, do you clear everything and start over, or keep going? | | Two lanes: a robot sweeping its bench clean vs one patching its half-built thing. | "when a coding agent's attempt is going badly, don't keep patching the sinking ship — throw the attempt away and let it start fresh" |
| 18 | 2 | `RestartIterate` | On short coding tasks, keeping going won. What hurt wasn't the messy desk. It was throwing away the half-built code along with it. | | Bars "keep going 86%" vs "start over 69%" (share of tasks solved); in the swept lane the half-built thing vanishes. | "iterate … 86% [79–90] gpt-5.4 … restart-fresh … 69%"; "What hurts isn't the contaminated context — it's losing the working tree." |
| 19 | 2 | `MemoryDesk` | But the desk has an edge. On a long enough day it fills up, and something has to go. There are two ways to make room. | | The stack hits the top edge; pages tip off; a gauge goes amber; a fork: SUMMARY / NOTEBOOK. | "Since then it has run a hundred commands, and its context window is full. Something has to go." |
| 20 | 3 | chapter card + `MemoryDesk` (card) | The first is a summary. Coding assistants like Claude Code do this: when the desk is full, the model writes up its day and starts again from that. | | Chapter card "3 · The summary". The stack squeezes into one card. | "Claude Code and Codex do the same thing at that point: they ask the model to write a summary of the conversation and start again from the summary." |
| 21 | 3 | `MemoryDesk` (card) | It's how you remember a meeting: not the words, the gist. | | Speech bubbles fade into one card. | — (analogy) |
| 22 | 3 | `MemoryDesk` (card) | The risk is that a summary decides in advance what will matter. So I tried to break it: I showed the agent a small detail it would only need much later, after two summaries. | | A detail card "shelf 4: quarantine" goes under the stack; the stack squeezes twice; a clock runs. | "a summary decides in advance what will matter, and a transcript doesn't have to."; "Probe A shows the agent a detail — a shelf put in quarantine — and needs it forty steps and two compactions later." |
| 23 | 3 | `MemoryDesk` (card) | It didn't break. A recent model wrote the detail into its summary and used it, about as often as an agent that never summarised at all. | | The card reads "shelf 4: quarantine"; two rows of ticks, "summary" and "never summarised", nearly equal. | "Haiku 5.5 writes the quarantined shelf into its summary and uses it forty steps later, about as often as the arm that never compacts." |
| 24 | 3 | `MemoryDesk` (card) | And the message from noon? One line on the card, "shelf zero is empty", and that line was enough. | | The card line glows; pallet to shelf 0, tick. | "The arms that keep a summary or their own lines have one sentence telling them the shelf changed, and that is enough." |
| 25 | 3 | `MemoryDesk` (card) | It depends on who writes it, though. In an earlier test, an older model writing shorter summaries lost track more than any other memory. | | An older, greyer robot squeezes a tiny card; reds appear. | "Memory really does degrade" (rolling-summary arm, 1.00 / 0.96 / 0.75 / 0.72); "Memory is the arm that degrades most"; "the gap … depends on how good the summariser is" |
| 26 | 3 | `MemoryDesk` (card) | A summary is a guess about what will matter. With a good writer, it guesses well. | | The new robot's card, ticked. | — (framing) |
| 27 | 4 | chapter card + bespoke: `FilingCabinet` | The second way sounds safer. Clear the desk completely, and keep the whole day in a notebook the agent can search by keyword. Nothing is thrown away. | | Chapter card "4 · The notebook". Every page, the slip too, slides into the cabinet. | Arm `fresh_lookup`: "nothing: a clean session", can search; "A search returns up to eight raw lines that contain every word asked for" |
| 28 | 4 | `FilingCabinet` | It's what you do with your email. You don't remember it; you know where to find it. | | An inbox icon morphs into the cabinet. | — (analogy) |
| 29 | 4 | `FilingCabinet` | In my tests, it was the only memory that failed every time I tried it. And it's the agent from the start of this video. | | Cut back to the cold open: the pallet passing shelf 0; the cabinet behind the robot. | "A clean session with a searchable transcript was the only arm that failed in every condition, with both models." |
| 30 | 4 | `FilingCabinet` | After the clean-up, its desk says nothing about any message. So when a pallet arrives, it works out what's on each shelf by searching the notebook. | | Empty desk; the robot opens drawers "shelf 1", "shelf 2"… | "After compacting, it rebuilds what is on each shelf by searching the transcript" |
| 31 | 4 | `FilingCabinet` | It searches for shelves and pallets. Never for a correction, because nothing tells it there was one. About one search in forty brought the message back. | | The slip sits in an unopened drawer; the magnifier passes it by; "1 search in 40". | "nothing in its context says there was a correction to look for, so it never asks."; "its searches almost never bring back the notice (one in forty)" |
| 32 | 4 | `FilingCabinet` | Giving it tips on how to search made its searches sharper, but it still didn't find the message. A plain search only helps if you know what to look for. | | Sharper queries, same miss. The last sentence as a large line. | "Giving it a short guide on when and how to search made its queries more specific … and did not improve the result: 2 of 8."; "A plain search only helps an agent that knows there is something to search for." |
| 33 | 4 | bespoke: `RecursiveReader` | Smarter notebooks exist. I built one where the model writes its own code to read a library of seventy-one papers, piece by piece. | | A stack of 71 papers; the robot types code; small copies of it each take a paper. | "let the LLM *program its own access* to the document."; "analyzes all 71 papers individually" |
| 34 | 4 | `RecursiveReader` | But it was told the library existed, and the question was about the library. It never had to guess there was something to look for. | | A table-of-contents card in the robot's hand. | "The full document is NOT in your context."; "read TOC → batch analyze → synthesize" (no hidden-correction test; the contrast is mine) |
| 35 | 5 | chapter card + bespoke: `ClipboardForm` | The last memory is the strictest: a form. Fixed boxes, like what's on each shelf. Each step, the agent updates the boxes, and everything else is thrown away. | | Chapter card "5 · The form". A clipboard with a box per shelf; the robot's pages shred after each step. | "replaces the append-only conversation history … with an explicit, mutable execution state … the reasoning that produced it is discarded. Nothing accumulates." |
| 36 | 5 | `ClipboardForm` | Like a patient's chart. When the message arrives, "empty" goes into shelf zero's box, and the old value is gone. | | "Shelf 0: pallet" crossed out, "empty" in the same box. | "SKILL.state gives the agent a fixed set of fields, here one for shelf contents and one for the last event" |
| 37 | 5 | `ClipboardForm` | And it never fills up: the form is the same size at step ten and at step two hundred. | | A step counter runs to 200; the clipboard stays the same size while a ghost stack grows beside it. | "SKILL.state 2,157, flat from T=10 (2,136) to T=50 … ReAct: 16,437 and growing linearly" |
| 38 | 5 | `ClipboardForm` | But a form only holds what it has a box for. A fact with no box gets jotted next to the last entry, and the next entry wipes it. | | "shelf 4: quarantine" written in the "last event" box, overwritten by the next event. | "There is no field for a quarantine, so the model writes it into the last event and the next event overwrites it." |
| 39 | 5 | `ClipboardForm` | With no box for it, none of twenty-four runs kept the fact. With a box named after it, one model kept it every time, and others most of the time. | | "0/24" → a box labelled "quarantined shelves" → a grid of 24 ticks "24/24"; small "16/24" for a second model; a generic "notes" box half-filled. | Table: no dedicated field 0/24 \| 0/24; free-form `notes` 10/24 \| 1/24; schema field that names the fact 24/24 \| 16/24 (Haiku 4.5 \| Gemini-3-Flash) |
| 40 | 5 | `ClipboardForm` | A general box for notes helped much less. The box has to say what goes in it. | | The "notes" box dims; the named box glows. | "A place to put it is not enough; the place has to say what goes there." |
| 41 | 5 | `ClipboardForm` | And then a stranger failure. A form doesn't forget. It misremembers. | | The clipboard; a pen hovers. (skeptical) | "Explicit State Doesn't Forget. It Misremembers." |
| 42 | 5 | `ClipboardForm` | On one model, the agent moved a pallet correctly, then wrote the wrong pallet into the box. In one run, about twenty-five mistakes followed, all from that one box. | | The pallet moves right; the box gets the wrong code with a confident tick; a cascade of red marks. | "In all 17 episodes where the belief drifted from reality, the step that corrupted it was a `Move` executed correctly with a state patch written wrong."; "the agent cascades through about 25 failures" |
| 43 | 5 | `ClipboardForm` | Nothing checks that a box matches reality. When that model also kept the day's record beside the form, those slips did no harm: where the two disagreed, it followed the record. | | The day's record appears beside the clipboard; a mismatch flashes; the robot follows the record. | "nothing checks the write"; "on all 4 the model does what reality requires"; "this describes rather than isolates the effect of the transcript" |
| 44 | 6 | chapter card + bespoke: `CorrectionReplay` | One confession. Until recently, my results said the form was far better than the day's record at taking a correction like our message. It wasn't. | | Chapter card "6 · A flaw in my own test". Bars, same model and seeds: form 12/12, record 3/12. | "On Haiku 4.5, the old notice reproduces the published result (12 of 12 against 3 of 12" |
| 45 | 6 | `CorrectionReplay` | My message didn't make sense. The pallet it named had already left the warehouse. An agent that had watched it leave had reason to doubt it, and mostly didn't apply it. Hard to blame it. | | The slip names a pallet; a replay shows that pallet shipping out earlier; the robot frowns at the slip. | "The notice claimed a put-away never happened for a pallet the agent had watched leave … Rejecting it is the right call." |
| 46 | 6 | `CorrectionReplay` | With a message that made sense, both got it right. That fixed message is the one behind every result about it in this video. | | The bars redraw: form 12/12, record 10/12. | "the full transcript applies the correction in 10 of 12 episodes on Haiku 4.5 and 12 of 12 on Sonnet 5, against 12 of 12 for explicit state on both" |
| 47 | 6 | `CorrectionReplay` | So check your test from the agent's side. If the correction contradicts what it saw, you're measuring whether it believes you, not what it remembers. | | The sentence, large. | "A correction that contradicts what the agent saw measures whether it believes you, not what it remembers." |
| 48 | 7 | chapter card + bespoke: `MemoryOffice` | So which memory is best? For what happens on the job, none of them on its own. | | Chapter card "7 · What to combine". Pull back to the whole office. (confident) | — (verdict) |
| 49 | 7 | `MemoryOffice` | Training can't take today's news. The desk fills up. A summary is only as good as its writer. The notebook only helps if you know to look. And the form holds only what has a box, and can be sure and wrong. | | Each object lights with its crack as it is named. | — (recap of chapters 1-5) |
| 50 | 7 | `MemoryOffice` | You don't run your life from one memory either. You keep the gist in your head, a notebook to check, and a few things on the fridge because you know they'll matter. | | Human version: a head with a card, a notebook, a fridge note. | — (analogy) |
| 51 | 7 | `MemoryOffice` | For agents, my tests point the same way. First, when the desk fills up, keep a summary, or the agent's own lines, instead of clearing it. A notebook to search is a bonus on top, not a replacement. | | The recipe builds on screen, item 1: SUMMARY on the desk (+ NOTEBOOK behind, dashed). Label "what my tests point to". | "Keep a summary, or the agent's own lines, and add the search on top if you want it; both hybrids did as well as never compacting." |
| 52 | 7 | `MemoryOffice` | Second, for facts you know will matter, a box with their name on it. And on some models, the day's record beside the form, to catch it when it's wrong. | | Item 2: FORM with a named box; item 3: the record beside it, "some models". (confident, speed 1.05) | "if a fact stays true across many steps, re-inject the field, not the record."; "Keeping the transcript next to the state is cheap insurance on some models." |
| 53 | 7 | `MemoryMap` | Every agent forgets. The question is what it forgets, and whether anything notices. Which of these would your agent lose first? | | Back to the map from the cold open; the slip glows; the recipe stays small in a corner. | — (closing line + comment prompt) |
| 54 | — | outro | More at javieraguilar.ai. | | Outro card: AGILabs badge, javieraguilar.ai; end-screen space for YouTube. | — |

## Must show

- The same red slip ("SHELF 0: EMPTY") followed through every memory; shelf 0 marked as the right
  place in the cold open.
- The cold-open agent revealed as the notebook agent in chapter 4.
- The human counterpart of each memory: school, working memory, the gist of a meeting, email, a
  patient's chart; the fridge note in the verdict.
- Each memory's way of failing, seen: the slip bouncing off the closed shelf, the habit overruling
  the plan, pages tipping off the desk, the slip in an unopened drawer, the entry overwritten, the
  wrong value ticked with confidence.
- On screen, each with what it counts: "~73% of the loss recovered", "1 in ~600", "86% vs 69% of
  tasks solved", "1 search in 40", "0/24", "24/24" (and "16/24"), form vs record "12/12 vs 3/12 →
  12/12 vs 10/12" (same model).
- A chapter card at the start of each chapter, matching the YouTube chapter list.
- The recipe on screen in chapter 7: summary (+ notebook) · named box · record beside it.

## Count

EN: ~1250 words. At ~2.4 words/s plus breaths and chapter cards: ~9.5 min. `targetSeconds: 570`.

## Cold read

- v1 viewer: stayed to the end for the promise, but lost at numbers without "of what", the five
  labels in one breath, synonyms ("notes", "gist", "margin"), the coding and RLM detours, and the
  confession as insider talk; misread the cold open (thought the right move was another shelf).
  Took away: the form is confidently wrong; the summary beat the notebook.
- v1 expert: bind each figure to its model (1 in 600, 24/24, the misremembering); the summary
  degraded most in the earlier test; "worst" is only "failed every time"; one in forty is per
  search; restart is about code, not context; the confession must compare the same model and
  seeds and not use the refusal reply as evidence; the verdict keeps "on some models" and "search
  is optional".
- v2: all of the above applied.
