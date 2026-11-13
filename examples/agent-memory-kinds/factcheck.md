# Fact-check — How an AI agent forgets (EN, script v3)

Sources (javieraguilar.ai):

- **[CL]** "Compact or Look It Up" — `src/content/blog/en/compact-or-look-it-up.md` on branch
  `blog/compact-or-look-it-up` (scheduled 2026-12-11). Main model: Claude Haiku 5.5, six episodes per
  arm on probe C.
- **[ES]** "Explicit State Doesn't Forget. It Misremembers." — `src/content/blog/en/explicit-state-misremembers.md`
  (on `main`).
- **[WF]** "When the fact stops being true" — `src/content/blog/en/when-the-fact-stops-being-true.md`.

Numbers on screen: only "0/24" and "24/24" (scene `margin`), plus the "SHELF 0" labels. No figure
is spoken except "24" ("all 24 runs").

| Claim | Where it appears | Source sentence |
|---|---|---|
| The test is a warehouse an agent runs all day | Scene 2 `warehouse`, voice ("I tested it like this: an agent runs a warehouse all day."); screen: robot shuttling pallets | [CL] "The environment is the warehouse simulation from my replication of SKILL.state: fifty steps of pallets arriving, orders shipping, sensor telemetry, and a fixed policy for which shelf to use." |
| Halfway through, it is told shelf 0 is actually empty | Scene 2, voice; screen: red slip "SHELF 0: EMPTY" drops on the desk, shelf 0's pallet turns into a dashed outline | [CL] "**Probe C** sends an audit notice saying an earlier put-away never happened and the shelf is empty, then counts whether the agent stores the next pallet there." (Shelf "0" and "halfway" are illustrative; the article does not name the shelf number on screen.) |
| On a long day the desk (context) runs out of room and something has to go | Scene 6 `desk`, voice; screen: pages pile over the slip, gauge amber, pages spill | [CL] "Since then it has run a hundred commands, and its context window is full. Something has to go." |
| AI assistants like Claude Code squeeze the desk into a summary | Scene 7 `summary`, voice; screen: the pile squeezed into one notecard | [CL] "Claude Code and Codex do the same thing at that point: they ask the model to write a summary of the conversation and start again from the summary." |
| In my test, the summary kept the message | Scene 7, voice; screen: "shelf 0: empty" on the notecard, the pallet goes to shelf 0, tick | [CL] "With the coherent notice, Haiku 5.5 accepted it in 33 of 36 episodes, and every arm except `fresh_lookup` applied it in five or six of six." Arm `summary`: 6/6 with the coherent notice (figure, probe C). Hedge kept: "in my test". Note: with the original notice that contradicts the history, `summary` got 2/6, but [CL] shows that notice was measuring something else ("The correction probe was measuring something else"), so the coherent-notice result is the one that answers the question. |
| Or clear the desk and keep only a notebook it can search; nothing is lost | Scene 8 `notebook`, voice; screen: every page and the slip slide into the filing cabinet | [CL] "The alternative that keeps coming up is to throw the conversation away instead and keep the literal transcript on disk, where the agent can search it when it needs something." Arm table: "`fresh_lookup` \| nothing: a clean session \| yes". |
| A search only helps if you know what to look for | Scene 8, voice; screen: magnifier with "?" | [CL] "**A plain search only helps an agent that knows there is something to search for.**" |
| Nothing on the clean desk said anything had changed | Scene 9 `missed`, voice; screen: the empty desk highlighted | [CL] "The correction is in the transcript, but nothing in its context says there was a correction to look for, so it never asks." |
| Its searches almost never turned up the message | Scene 9, voice; screen: other drawers opened, the slip's drawer stays shut, the pallet goes to the wrong shelf, cross | [CL] "After compacting, it rebuilds what is on each shelf by searching the transcript, and its searches almost never bring back the notice (one in forty)." and "`fresh_lookup` stayed at two of six in every coherent variant I tried." ("almost never" in the voice, no figure.) |
| A form with fixed boxes; the new value replaces the old one | Scene 10 `form`, voice; screen: "pallet" struck, "empty" written in the SHELF 0 box | [CL] "SKILL.state gives the agent a fixed set of fields, here one for shelf contents and one for the last event, and rejects any update that adds another." |
| A fact with no box of its own gets scribbled in the margin, and erased | Scene 11 `margin`, voice; screen: margin note erased by the next entry, chip "0/24" | [CL] "There is no field for a quarantine, so the model writes it into the last event and the next event overwrites it." [ES] table "SKILL.state, fact first needed 40 steps later": "No dedicated field \| 0/24 \| 0/24" (Haiku 4.5, Gemini-3-Flash). |
| Give it a box, and one model kept it in all 24 runs | Scene 11, voice ("all 24 runs"); screen: SHELF 0 box appears, 24-cell grid fills with ticks, "24/24" | [ES] table: "Schema field that names the fact \| **24/24** \| **16/24**" — 24/24 is Claude Haiku 4.5; the second model, Gemini-3-Flash, got **16/24** (hence "one model", not "the model"). [CL] "With a field that names the fact, the same probe gave 24 of 24 on Haiku 4.5". Also [WF] "A schema field that names the fact (`quarantined_shelves`) takes Haiku from 0/24 to 100%". |
| A form doesn't forget; it misremembers: a wrong value looks just as sure | Scene 12 `misremember`, voice; screen: "full" written in the box with a confident tick, the pages behind fade, the real shelf 0 shown empty | [ES] title "Explicit State Doesn't Forget. It Misremembers."; [ES] "Where it breaks, it breaks by writing the state wrong"; [ES] "Explicit state does not lose track of the procedure. It **writes the state wrong**, and nothing checks the write." ("full" is an illustrative wrong value.) |
| For what happens on the job there is no best memory; each one forgets something different | Scene 13 `verdict`, voice; screen: desk, notecard, cabinet and clipboard each show a crack | Verdict, built on the per-arm failures above: [CL] "A plain search only helps an agent that knows there is something to search for."; [CL] "explicit state protects what its designer anticipated"; [WF] "A schema protects only against what its designer anticipated." Scoped to "on the job" (the training layer is framing, not measured). |
| Use more than one: the gist in front, the notebook behind it, a box for what will matter | Scene 14 `advice`, voice; screen: notecard on the desk linked to the cabinet and the clipboard; small line "what my tests point to" | [CL] "Keep a summary, or the agent's own lines, and add the search on top if you want it; both hybrids did as well as never compacting." and "explicit state protects what its designer anticipated". The on-screen line "what my tests point to" keeps it no stronger than the article ("read every number below as direction, not as a rate"). |
| Framing lines (not claims from the articles) | Scene 1 hook, scene 3 ("Hours later, does it still know?"), scene 4 (layers), scene 5 (training "like school"; "Today's message can't go there") | — Framing. Scene 5 states a general fact: a message received during a job is not written into the model's weights. |

## Not on screen

- Model names, sample sizes, the 16/24, the one-in-forty and the 33-of-36 figures stay out of the
  video (they are recorded here).
