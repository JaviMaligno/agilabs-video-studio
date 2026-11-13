# Compact or look it up — explainer video (EN) · script draft v2 (after cold read)

Article: "Compact or Look It Up" (javieraguilar.ai, scheduled 2026-12-11). Vertical 9:16, target ~80 s.
EN-only for now (ES column empty).

**Central metaphor: the agent's memory is a desk.** Pages pile up as it works. When the desk is full
there are two ways out: squeeze the pile into one notecard (the summary), or sweep the desk clean and
drop every page into a filing cabinet it can search. Halfway through, a red correction slip arrives:
"Shelf 0 is empty." With the notecard, the slip's message is written on the card. With the clean desk,
the slip is filed in the cabinet, and the agent never opens the drawer. The video opens on that closed
drawer with the red slip glowing inside.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | The correction was in its log. It never found it. | **Cold open:** a closed filing-cabinet drawer, a red slip "SHELF 0: EMPTY" glowing through the gap. A small robot agent walks past it without stopping. | bespoke: `FilingCabinet` (cold-open variant) | "The correction is in the transcript, but nothing in its context says there was a correction to look for, so it never asks." |
| 2 | An AI agent that works for hours fills its memory, and something has to go. | The robot at a desk; pages pile up until they spill over the edges. A "full" gauge fills to amber. | bespoke: `MemoryDesk` | "Since then it has run a hundred commands, and its context window is full. Something has to go." |
| 3 | Most tools write a summary and start again from it. | The pile squeezes down into one notecard on the desk. | bespoke: `MemoryDesk` (summary path) | "Claude Code and Codex do the same thing at that point: they ask the model to write a summary of the conversation and start again from the summary." |
| 4 | The other way: clear the desk, and keep the full log to search when needed. Nothing gets summarised away. | Split: the desk sweeps clean, every page slides into the filing cabinet; a magnifier appears on the cabinet. | bespoke: `MemoryDesk` + `FilingCabinet` | "The alternative that keeps coming up is to throw the conversation away instead and keep the literal transcript on disk, where the agent can search it when it needs something." | "The appeal is obvious: a summary decides in advance what will matter, and a transcript doesn't have to." 
| 5 | I tested both in a simulated warehouse, with a small model. | Warehouse shelves behind the desk, pallets arriving on a conveyor. | bespoke: `WarehouseShelves` | "The environment is the warehouse simulation from my replication of SKILL.state" | "The environment is the warehouse simulation from my replication of SKILL.state" / "The main model is Claude Haiku 5.5" 
| 6 | Halfway through, a notice arrives: that shelf is actually empty. | A red slip drops onto shelf 0; the pallet drawn on it fades out. | bespoke: `WarehouseShelves` | "Probe C sends an audit notice saying an earlier put-away never happened and the shelf is empty, then counts whether the agent stores the next pallet there." |
| 7 | Then the memory fills up, and the agent has to place the next pallet. | Both desks (notecard / clean desk + cabinet) side by side; a pallet waits on the conveyor. | bespoke: split `MemoryDesk` | "Every arm compacts at the same steps (15, 30 and 45)." |
| 8 | Every other setup, even one that never cleared anything, used the correction five or six times out of six. | Left desk: the notecard reads "shelf 0: empty"; the robot puts the pallet on shelf 0, tick. Six cells fill teal. | `BarCompare` or bespoke cells | "every arm except fresh_lookup applied it in five or six of six." | "every arm except fresh_lookup applied it in five or six of six." (the arms include react, which never compacts) 
| 9 | Starting clean and searching: two out of six. | Right desk: the robot looks at its empty desk, puts the pallet on another shelf. Two of six cells teal, four amber. | `BarCompare` or bespoke cells | "fresh_lookup stayed at two of six in every coherent variant I tried." |
| 10 | The correction was right there in the log. | Camera pushes into the cabinet: the red slip is in the drawer, among the pages. | bespoke: `FilingCabinet` | "The correction is in the transcript" |
| 11 | But its clean desk gave no hint that anything had changed. It searched for other things, and almost never found the notice. | The robot's thought bubble: empty. The drawer stays shut. | bespoke: `FilingCabinet` | "nothing in its context says there was a correction to look for, so it never asks." | "its searches almost never bring back the notice (one in forty). The correction is in the transcript, but nothing in its context says there was a correction to look for" 
| 12 | In my test, a simple search only helped when the agent knew there was something to find. | Text slam over the closed drawer. | `KeyQuote` | "A plain search only helps an agent that knows there is something to search for." |
| 13 | So, with a search this simple: don't clear the desk. Keep a summary. Searching on top is optional. | Notecard on the desk, the cabinet beside it, a line from the card to the drawer. | bespoke: `MemoryDesk` + `FilingCabinet` | "Don't drop the context entirely — at least not with a plain search." / "Keep a summary, or the agent's own lines, and add the search on top if you want it" | "Don't drop the context entirely — at least not with a plain search." / "Keep a summary, or the agent's own lines, and add the search on top if you want it" 
| 14 | More at javieraguilar.ai. | Outro card: AGILabs badge, javieraguilar.ai, title "Compact or Look It Up". | outro | — |

## Must show

- The correction slip filed in the cabinet while the agent never opens the drawer (the cold open and line 10-11).
- The two numbers as the article writes them: "five or six of six" and "two of six".

## Count

EN: 184 words. At ~2.5 words/s plus scene breaths: ~78-82 s. Set `targetSeconds: 80`.

## Cold read (v1 → v2)

- Viewer: stayed to the end; takeaway "stored information doesn't help unless something prompts the agent to look"; surprised the full log did worse than a lossy summary. Lost "its own notes" (line 8) and the caveat "a search like mine" (line 13); asked why anyone would clear the desk (answered in line 4).
- Expert: the clean session did search, its searches just almost never returned the notice (1 in 40), so "never looked / never searched" → "never found it"; the causal "nothing told it" is the article's reading, kept as "gave no hint"; every other arm, including never compacting, tied at five or six of six; search on top added nothing here, so it is "optional"; scope "in my test", "a small model", "a search this simple".
