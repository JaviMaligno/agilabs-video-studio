# How an AI agent forgets — conceptual explainer (EN) · script v3 (after three cold reads)

Concept video, not an experiment video: it compares the kinds of memory an agent has, each with its
human counterpart and its own way of failing. The experiments only appear as one-line evidence.
Vertical 9:16, target ~2 min. EN-only for now (ES column empty).

Sources (all javieraguilar.ai): "Compact or Look It Up"
(context, summary, searchable log; scheduled 2026-12-11), "Explicit State Doesn't Forget. It
Misremembers." (fixed-field state).

**One picture throughout: a small robot running a warehouse, and one message it must keep.**
Halfway through the day a red slip arrives: "Shelf 0 is empty." Each kind of memory is an object in
the robot's office, matched to its human version: a bookshelf in its head (what it learned), the
desk (what is in front of it), a notecard (the gist), a filing cabinet (the notebook it can search),
a clipboard form (fixed boxes). Every scene follows the same red slip into a different object.

| # | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|
| 1 | bespoke: `MemoryMap` (cold open) | An AI agent forgets the way you do. It just has more places to do it in. | | The memory map, all on screen from frame 0: the robot in the middle holds up the red slip "SHELF 0: EMPTY"; around it four tiles, each one big word over a drawing of how it fails: DESK (pages spilling off), GIST (card "shelf 0: empty" with blurred lines), NOTEBOOK (cabinet with the slip inside, magnifier, "?"), FORM (box "SHELF 0: full" with a confident tick). A glow sweeps the tiles one by one, the last on "more", then all four hold it. Poster: the same map with the title "How an AI agent forgets" in place of the hook. | — (framing) |
| 2 | bespoke: `WarehouseShelves` | Here is my test. An agent runs a warehouse all day. Halfway through, it's told that shelf 0 is actually empty. | | Robot moving pallets; the red slip drops onto the robot's desk. | "The environment is the warehouse simulation from my replication of SKILL.state"; "Probe C sends an audit notice saying an earlier put-away never happened and the shelf is empty" |
| 3 | bespoke: `WarehouseShelves` | Hours later, does it still know? | | Clock spins; a new pallet waits on the conveyor; shelf 0 glows. (curious) | — |
| 4 | bespoke: `MemoryOffice` | That depends on where it keeps the message. Its memory has layers, a bit like yours, and each one fails in its own way. | | The objects light up one by one as the line names layers: bookshelf in its head, desk, then the rest dim. | — (thesis) |
| 5 | bespoke: `HeadShelf` | Its oldest layer is its training, like school. Today's message can't go there. So it lands on the desk. | | The bookshelf in the robot's head, doors closed; the slip bounces off it and floats down to the desk. | — (framing; weights are not where a message from the job goes) |
| 6 | bespoke: `MemoryDesk` | The desk is its working memory. On a long day, the desk runs out of room, and something has to go. | | The red slip on the desk; pages pile over it and spill; a gauge goes amber. | "its context window is full. Something has to go." |
| 7 | bespoke: `MemoryDesk` (notecard) | AI assistants like Claude Code squeeze the desk into a summary: the gist, like a meeting you remember without its words. In my test, the summary kept the message. | | The pile squeezes into one notecard; "shelf 0: empty" is written on it; the pallet goes to shelf 0, tick. | "Claude Code and Codex do the same thing at that point: they ask the model to write a summary"; "every arm except fresh_lookup applied it in five or six of six" |
| 8 | bespoke: `FilingCabinet` | Or clear the desk and keep only a notebook it can search. Nothing is lost. But a search only helps if you know what to look for. | | The desk sweeps clean; every page, the red slip too, slides into the cabinet; a magnifier hovers. | "A plain search only helps an agent that knows there is something to search for." |
| 9 | bespoke: `FilingCabinet` | Nothing on the clean desk said anything had changed. It looked up other things, and almost never found the message. | | The robot opens other drawers; the slip stays in its drawer; the pallet goes onto the wrong shelf. | "its searches almost never bring back the notice (one in forty)"; "fresh_lookup stayed at two of six" |
| 10 | bespoke: `ClipboardForm` | Or use a form with fixed boxes, like what is on each shelf. The new value simply replaces the old one. | | Clipboard: "Shelf 0: pallet" crossed out, rewritten "empty" in the same box. | "SKILL.state gives the agent a fixed set of fields" |
| 11 | bespoke: `ClipboardForm` | But a fact with no box of its own gets scribbled in the margin, and erased. Give it a box, and one model kept it in all 24 runs. | | A note in the margin gets erased by the next entry ("0/24"); a box with the fact's name appears; a grid of 24 runs fills with ticks ("24/24"). | Table: no dedicated field 0/24, schema field that names the fact 24/24 (Haiku 4.5; Gemini-3-Flash 16/24, in factcheck) |
| 12 | bespoke: `ClipboardForm` | And a form doesn't forget. It misremembers: write "full" by mistake, and the box looks just as sure. | | "Shelf 0: full" written in the box with a confident tick; the pages behind it fade away. (skeptical) | "Explicit State Doesn't Forget. It Misremembers."; "Where it breaks, it breaks by writing the state wrong" |
| 13 | bespoke: `MemoryOffice` (pull back) | So for what happens on the job, there is no best memory. Each one forgets something different. | | Pull back to desk, notecard, cabinet, clipboard; each shows its crack. (confident) | — (verdict) |
| 14 | bespoke: `MemoryOffice` | Like people, use more than one: the gist in front of you, the notebook behind it, and a box for what you know will matter. | | Notecard on the desk, cabinet behind, clipboard on the wall; lines link them; the slip is on the card. A readable line under it: "what my tests point to". (confident, speed 1.05) | "Keep a summary, or the agent's own lines, and add the search on top if you want it; both hybrids did as well as never compacting."; "explicit state protects what its designer anticipated" |
| 15 | outro | More at javieraguilar.ai. | | Outro card: AGILabs badge, javieraguilar.ai. | — |

## Must show

- The same red slip ("SHELF 0: EMPTY") followed into each kind of memory.
- The human counterpart of each one (school, the desk, the gist of a meeting, a notebook, a form).
- Each memory's own way of failing, as something seen: the slip bouncing off the closed bookshelf, pages spilling, the slip never found, the margin note erased, the wrong value ticked.
- On screen: "0/24" and "24/24".

## Count

EN: 304 words. At ~2.5 words/s plus scene breaths: ~2 min. Set `targetSeconds: 120`.

## Cold read

- v1: the viewer got lost in abstract layers with no common thread; the expert asked to scope the claims (in my test, small model, plain search), to separate the training layer from the rest, and to add that a form misremembers.
- v2: one example (the shelf 0 message) end to end; the viewer still dropped at the retraining part and at the stacked numbers.
- v3: training reduced to one line the message bounces off; the warehouse named as my test; one number pair on screen. The viewer would probably stay; takeaway: saving everything is not enough if you do not know what to look for, and a form fails by remembering wrong with confidence.
