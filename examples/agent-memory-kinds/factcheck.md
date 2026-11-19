# Fact-check — How an AI agent forgets (EN, vertical reel, script v5)

Sources (javieraguilar.ai):

- **[CL]** "Compact or Look It Up" — `src/content/blog/en/compact-or-look-it-up.md` on branch
  `blog/compact-or-look-it-up` (scheduled 2026-12-11). Main model: Claude Haiku 5.5, six episodes per
  arm on the correction probe.
- **[ES]** "Explicit State Doesn't Forget. It Misremembers." — `src/content/blog/en/explicit-state-misremembers.md`
  (on `main`).
- **[WF]** "When the Fact Stops Being True" — `src/content/blog/en/when-the-fact-stops-being-true.md`
  (on `main`).

The reel tells one everyday example (the trip chat: "my flight is Friday, not Thursday"). The
experiments behind it ran on a warehouse simulation; that setting never appears, and no number is
transferred to the trip. The trip, the hotel, the "allergic to feathers" note and the fridge note
are illustrations.

**Numbers on screen: none. No figure is spoken.**

| Claim | Where it appears | Source sentence |
|---|---|---|
| The AI said "got it" and then acted on the old plan | Row 1 `cold`, voice; screen: the chat with "Booked your hotel for Thursday night", pulsing red | — Everyday example: the correction probe of [CL] recast as a trip. Framing, not a measured rate. |
| It didn't ignore you, it forgot; each memory forgets in its own way | Row 2 `map`, voice | — Thesis, built on the per-memory failures below. |
| What it learned in training is frozen; the correction has to go somewhere else | Row 3 `training`, voice; screen: the slip bounces off the locked bookshelf | — General fact: a message received during a job is not written into the model's weights. |
| The desk is the chat it can see; in a long chat "Friday" can get buried | Row 4a `desk`, voice; screen: hotel cards and price tags land on the slip | — Framing (the context window). Illustrative; the reel claims no rate for it. |
| A new chat starts with a clean desk, unless something was saved to memory | Row 4b `fresh`, voice; screen: bare desk, greeting, a faint dashed slip | — General fact: a new session starts with an empty context unless a memory feature fills it (the v4 expert fix carried over from the long version). |
| When the desk fills up, it writes a summary and throws the pages away | Row 5 `summary`, voice; screen: the pile squeezed into one card | [CL] "Claude Code and Codex do the same thing at that point: they ask the model to write a summary of the conversation and start again from the summary." |
| A good summary keeps "Friday" | Row 5, voice; screen: the card gains "flight: Friday", tick | [CL] "With the coherent notice, Haiku 5.5 accepted it in 33 of 36 episodes, and every arm except `fresh_lookup` applied it in five or six of six." The summary arms: 5-6 of 6. "The arms that keep a summary or their own lines have one sentence telling them the shelf changed, and that is enough." |
| A weaker one can drop it | Row 5, voice; screen: the robot greys, its card shrinks and loses the line | [WF] table: the Memory runtime (a prose summary plus a three-step window, on Claude Haiku 4.5) scores 1.00 / 0.96 / 0.75 / 0.72 at T=10 / 25 / 50 / 100; "**Memory really does degrade**". [CL] "the gap between the two depends on how good the summariser is." Worded "can drop it", not "drops it". |
| Or it files the whole chat away and looks things up by keyword | Row 6a `notebook`, voice; screen: every page and the slip slide into the cabinet, a magnifier | [CL] "The alternative that keeps coming up is to throw the conversation away instead and keep the literal transcript on disk, where the agent can search it when it needs something." Arm `fresh_lookup`: a clean session; "Its search was deliberately simple: exact words, at most eight lines back". |
| In my tests with AI agents, it did the worst | Row 6a, voice; screen: the cold open's booking comes back, crossed | [CL] "A clean session with a searchable transcript was the only arm that failed in every condition, with both models." Scoped: "in my tests", "the worst" (not "failed every time"). |
| It searched for hotels and prices, and almost never for a change of plan it didn't know about | Row 6b `search`, voice; screen: drawers "hotels" and "prices" opened, the slip's drawer never opened, "anything changed?" struck | [CL] "its searches almost never bring back the notice (one in forty)"; "The correction is in the transcript, but nothing in its context says there was a correction to look for, so it never asks." ("hotels and prices" recasts the shelf lookups into the trip.) |
| A few named boxes: "Friday" replaces "Thursday" and stays | Row 7a `form`, voice; screen: "Thursday" struck, "Friday" written in the FLIGHT box, tick | [CL] "SKILL.state gives the agent a fixed set of fields, here one for shelf contents and one for the last event, and rejects any update that adds another." |
| A fact with no box gets lost | Row 7b `nobox`, voice; screen: "allergic to feathers" scribbled in the margin, wiped by the next entry | [ES] table "No dedicated field \| 0/24 \| 0/24" against "Schema field that names the fact \| **24/24** \| **16/24**" (Haiku 4.5 \| Gemini-3-Flash). [CL] "There is no field for a quarantine, so the model writes it into the last event and the next event overwrites it." |
| Like you: the gist in your head, your email to search, a note on the fridge | Row 8a `human`, voice; screen: a head with a card, an inbox, the fridge note "FLIGHT FRI" | — Analogy. |
| These apps often save to memory on their own; when something matters, ask it to save it | Row 8b `save`, voice; screen: "Save to memory: my flight is Friday." sent and lit in the Memory panel | — Practical advice from Javier's long use of the apps, not from these experiments; no stronger claim than "ask it to save it". |

## Not on screen

- Model names, sample sizes, "one in forty", "five or six of six", 24/24, 16/24, 0/24 and the
  Memory row stay out of the video (they are recorded here).
