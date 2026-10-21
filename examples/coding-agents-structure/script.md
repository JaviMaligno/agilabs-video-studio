# Coding Agents and Teamwork: Social Skills, or Structure? — article video (EN) · script draft v1.0

Article: coding-agents-structure (javieraguilar.ai, EN, published 2026-07-12; read from
`origin/main` of personal-website). Vertical 9:16, target **~82 s** (ceiling 85 s), 206 counted
words. ES column left empty (EN-only for now). Voice: the template default.
Data on screen: the article's table, plus the real per-seed pass counts behind it from the public
fork (`JaviMaligno/CooperBench`, branch `experiment/structural-conditions`; recomputed locally with
`aggregate_seeds.py` and `seed_stats.py`, they reproduce the article's table and p-values exactly).

## Central visual metaphor: two crews, one bridge

A coding task with two features is **a bridge over a gap**, and the merge is **the join in the
middle**. Each agent is a small construction crew (a hard-hat chip, "A" and "B"). Each crew builds
one half of the deck from its own bank: that half is its feature. The crews carry **walkie-talkies**
(the benchmark's message channel): radio waves pulse between them the whole time, so the viewer
always sees that they *can* talk. The tests are a **test truck** (label "tests: both features")
that has to drive from one bank to the other; a pass is the truck reaching the far bank.

- **One agent alone** builds the whole bridge from one bank: no join, slower, the truck crosses.
- **Two agents, free-form** build from both banks at once: the halves arrive at different heights
  and **jam at the join** (red spark, "merge conflict"). The truck stops at the gap.
- **Fences** (file ownership): a painted line splits the deck, each crew stays on its side, the
  halves meet flush, no spark, but the truck drives on and the deck **cracks under it**: the merge
  is clean, the code still fails.
- **Sequence**: crew A finishes the whole first span; crew B starts *from the end of A's span* and
  finishes. One continuous deck, nothing to join. Truck crosses.
- **Integrator**: A and B build their spans in separate yards; a third crew, **C**, lifts both into
  place and bolts the join itself. Truck crosses.

The whole argument is the join: the social-skills reading says the crews need to talk better;
the video shows they are already talking (radios never stop) and that what fixes the bridge is
**one crew owning the join**. A fixed **question card** at the top of the frame carries the
article's question, "Social skills, or structure?", from scene 3 to the verdict.

| # | Narration (EN, caption text) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Give two coding agents one job, and they do worse than one. | **Cold open, 0–4 s.** Split stage. Top lane: one crew chip "1 agent" builds a whole small bridge bank to bank; the truck crosses, green tick. Bottom lane: crews "A" and "B" build from both banks at once, radios pulsing; the halves arrive at different heights and jam with a red spark at the join; the truck stops at the gap, red cross. Lands on "worse than one". | bespoke: `BridgeCrew` (mode `hook`) | CooperBench "reports a striking result: when you pair up two strong coding agents to split a task, their success rate roughly *halves* versus a single agent doing the same total work"; my table: solo 14% / 30%, coop 7% / 7% |
| 2a | A recent study says they lack social skills. | The bottom lane freezes. A paper card slides in over it: **CooperBench** · Stanford, 2026 · "Why Coding Agents Cannot be Your Teammates Yet". Under it a chip: "missing: social intelligence". | `KeyQuote` over `BridgeCrew` still | "A recent Stanford benchmark, CooperBench ("Why Coding Agents Cannot be Your Teammates Yet") […] their reading is that the missing ingredient is *social intelligence*" |
| 2b | But its agents work with almost no process. On purpose. | **The "what is different" moment.** The paper card gets a warm stamp **ALMOST NO PROCESS · BY DESIGN** on "On purpose". Small fair-play footnote under it: "a legitimate choice: it measures raw coordination". | `KeyQuote` (stamp) | "they **deliberately** run agents with almost no scaffolding, precisely to measure *intrinsic* coordination ability. That's a legitimate scientific choice." |
| 3 | Human teams with no process collide too. So I tested structure. | Four tiny human-crew icons in one shared yard bump into each other (no labels). On "structure" the **question card** drops in at the top and stays: **Social skills, or structure?** | bespoke: `QuestionCard` (new) + `BridgeCrew` (mode `humans`) | "Human teams don't coordinate well with *zero* process either. […] we use **structure**: code ownership, interface contracts, sequential PRs, a reviewer who integrates." |
| 4a | The test: each agent builds one feature; then their code is merged. | **The test, laid out before any result.** Chip **THE TEST** in the card's corner. The bridge in full frame: crew A on the left bank with a span labelled "feature 1", crew B on the right with "feature 2". The join in the middle gets a small label "merge". The truck parks on the left bank, label "tests: both features". Each label lands on its word. | `BridgeCrew` (mode `setup`) | "two agents, each assigned one feature of a task, working in separate containers […] with their patches merged afterwards"; "Scoring requires *both* features to pass." |
| 4b | They can message each other the whole time. | Both walkie-talkies light up; radio waves pulse across the gap and keep pulsing in every later scene with two crews (they can always talk). Tag: "channel: always open". | `BridgeCrew` (mode `setup`, radios on) | "**connected by a message channel they can use to coordinate at any time** (the benchmark gives them this from the start) […] the agents can *always* talk — the open question is whether talking is enough." |
| 5 | I got the same drop. With the stronger model: 30 % alone, 7 % as a pair. | Model chip "gpt-5.4". Two bars grow beside the bridge: **alone 30 %**, **pair 7 %**, each with its three seed dots (7, 4, 6 of 19 / 1, 3, 0 of 19) and the range in small type. Under them, muted, one line: "gpt-5.4-mini: 14 % → 7 %". | bespoke: `SeedBars` (two bars) | Table: "solo (one agent, both features) 14% [11–16] / 30% [21–37]"; "coop (two agents, free-form) 7% [0–11] / 7% [0–16]"; "The coordination gap reproduces — and it's wider for the stronger model." |
| 6 | Most failures came at the merge: their code clashed. | Back on the bridge: A and B build at once, halves jam at the join, red spark, tag **merge conflict**. Counter beside it: "14–15 of 19 pairs". | `BridgeCrew` (mode `clash`) | "**Free-form coop fails at the merge, not at the code.** 14–15 of 19 coop failures (both tiers) are outright **merge conflicts**" |
| 7 | Then I tried five kinds of structure. | A ladder rises on the right edge, five rungs appearing bottom to top, each with its analogy as a tiny icon: **talk first** (handshake), **own files** (fence), **own lines** (striped fence), **in sequence** (relay baton), **integrator** (third hard hat). | bespoke: `BridgeCrew` (ladder overlay) | "Then I added a **ladder of coordination structures** […] Handshake (C1) […] File ownership (C2) […] Line-range ownership (C2b) […] Sequential pipeline (C3) […] Integrator (C4)" |
| 8a | Forcing them to talk first didn't help. They already were. | Rung "talk first" glows. A boom barrier blocks the deck until plans are exchanged; it lifts at once, because the radios had already sent the plans. Chips: "first message: turn 2" · "first edit: turn 6". The halves still jam. Rung gets a grey ✗. | `BridgeCrew` (mode `handshake`) | "The handshake gate (C1) never even fired: agents *already* message each other before touching code (first message on turn 2, first edit on turn 6). Making them talk more changed nothing, at either tier." |
| 8b | One read its partner's request, planned to reply, and never did. | Zoom on the two radios. Three bubbles from A, cropped from the article's log, land in B's radio one after another (each blinks "received"): "Are you touching either of those?" → "Can you avoid the import block…?" → "Could you add the IsMac re-export there?". A thought cloud over B: *"I should inspect and respond with precise coordination."* Then nothing: B's radio stays dark, a "…" fades out, B walks off its half. | bespoke: `BridgeCrew` (mode `silence`) | "agent 2 never replies. In its own private reasoning it wrote: *"We do overlap. I should inspect and respond with precise coordination."* It never did."; "It read the requests, even *planned* to coordinate in its own reasoning, and then never replied" |
| 9 | Owning files ended the clashes, but most code still failed. | Rungs "own files" and "own lines" glow. A painted line splits the deck; each crew stays on its side; the halves meet flush, no spark. Counter: **merge conflicts 0 / 19**. Then the truck drives on and the deck cracks under it, red cross on the tests label. Rungs get ✗ (own lines) and a grey "~" (own files) with a small note "strong model 14 % · no better than a fair merge". | `BridgeCrew` (mode `fences`) | "**enforced ownership drives merge conflicts to zero** — 0 of 19 for both C2 and C2b, at both tiers. The failure then moves downstream: patches combine cleanly but the integrated code doesn't pass both suites."; table: file ownership 0% [0–0] / 14% [11–16]; line ownership 0% / 0% |
| 10 | What worked was one agent owning the final assembly. | **The key-point moment.** The ladder's top two rungs light up in the accent. The join in the middle gets a single accent hard hat standing on it and the stamp **ONE AGENT OWNS THE JOIN**. | `KeyQuote` over `BridgeCrew` (stamp) | "They share a mechanism: **one agent ends up owning the final integrated state**"; "The most reliable lever wasn't communication or ownership — it was **giving one agent ownership of the final integration**" |
| 11a | In sequence: the second agent builds on the first one's code. | Rung "in sequence". Crew A builds its span all the way, hands a baton to B; B starts from the end of A's span and finishes. One continuous deck; the truck drives across, green tick. | `BridgeCrew` (mode `sequence`) | "**Sequential pipeline (C3):** agent A implements feature 1 and commits; agent B starts *from A's code* and adds feature 2."; "B builds directly on A's finished work" |
| 11b | Or a third agent who merges both. | Rung "integrator". A and B build their spans in two separate yards (off the bridge); crew C lifts both into place and bolts the join. Truck crosses, green tick. | `BridgeCrew` (mode `integrator`) | "**Integrator (C4):** A and B work independently; a third agent reconciles both patches."; "a reviewer reconciles both patches in a single workspace" |
| 12a | Both got back to solo level: 35 % and 33 %. | Chip "gpt-5.4". The two bars from scene 5 return; a dashed line marks **alone 30 %**. Two new bars grow past the pair's 7 % and just past the line: **in sequence 35 %**, **integrator 33 %**, each with seed dots (6, 7, 7 / 6, 8, 5 of 19). | bespoke: `SeedBars` (four bars) | Table: "sequential (C3) 26% [21–37] / 35% [32–37]"; "integrator (C4) 23% [21–26] / 33% [26–42]"; "Both recover solo-level performance at both tiers" |
| 12b | And for the weaker model, sequencing beat one agent alone. | Model chip swaps to "gpt-5.4-mini". Two bars: **alone 14 %** (3, 3, 2 of 19), **in sequence 26 %** (4, 4, 7 of 19), highlighted. Tag: "ahead in all 3 runs". | `SeedBars` (two bars) | "for the *weak* model it **beats** solo (mini 26% vs 14%, ahead in all three seeds, p=0.039)"; "Sequencing […] is the one intervention that lifts the *weak* model above its own solo score" |
| 13 | That's 19 task pairs, three runs each: a slice, not the whole benchmark. | Card: a grid of 652 tiny tiles with 19 lit; labels "19 of 652" · "5 repos" · "3 runs" · "2 models". | `StatGrid` | Banner: "**A complete study on a 19-task slice of CooperBench's 652.**"; "these are **19 task-pairs across 5 repositories** […] not the full benchmark"; "the four headline conditions were run **three times each**"; "within this slice the pattern replicates; whether it holds across the full benchmark is the open question." |
| 14a | Verdict: what worked was process, not more talk. | **The verdict moment.** The question card "Social skills, or structure?" gets a big stamp **PROCESS, NOT MORE TALK** on "process". Behind it, the finished bridge with one hard hat on the join, radios still pulsing. Small unvoiced footnote: "a smaller gap remains: agents rarely improvise process on their own". | `KeyQuote` + `QuestionCard` stamp | "the fix that generalizes is process (decompose + sequence, or appoint an integrator), not exhortations to communicate"; footnote: "when process is missing, a good human *improvises* it […]; the agents, handed the very same channel, mostly didn't. That gap […] is real" |
| 14b | Don't expect agents to invent process. Give them one. | The sentence writes itself word by word, "Give them one" in the accent with an underline. | `KeyQuote` (emphasis "Give them one") | "**don't rely on anyone, silicon or carbon, to invent process in the moment — give them the process.**" |
| 15 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, title "Coding Agents and Teamwork: Social Skills, or Structure?" over two lines. Credit line: "Benchmark: CooperBench (Khatua, Zhu, et al., 2026)". | outro | — |

**Word count (EN):** 12 + 8 + 10 + 11 + 12 + 8 + 17 + 9 + 7 + 10 + 11 + 10 + 9 + 11 + 7 + 11 +
10 + 13 + 8 + 9 + 3 = **206 counted words** ("%" counted as a word, as the other examples do;
about the same as spoken: "nineteen", "thirty-five and thirty-three percent"). About 74 s of speech
at ~2.8 words/s; with line gaps, scene tails and the outro (~8 s in the built examples) **~82 s**.
Set `targetSeconds: 82`.

Caption estimate at 2.8 words/s: every line ≤ 16.8 chars/s (highest: 14a "Verdict: …" 16.8,
9 and 14b 16.5, 8b 16.3; the number lines 5 and 12a are slow, ~11-12, because spoken numbers take
longer than their digits). `npm run lint` after TTS is the gate.

If the TTS render runs over 85 s, cut in this order (never scenes 4, 10, 14):
1. Scene 3, first sentence → "So I tested structure." (−7 words; the human-teams point stays in the
   icons).
2. Scene 5, "I got the same drop." dropped; the bars carry the reproduction (−5).
3. Scene 12a → "Both got back to solo level." (−5; the bars carry 35 % and 33 %).

## Spoken numbers (complete list)

| Spoken | Scene | Why it stays in the voice |
|---|---|---|
| "thirty percent … seven percent" | 5 | The reproduced gap: the one comparison everything else is measured against. |
| "five" (kinds of structure) | 7 | Setup count; round. |
| "thirty-five and thirty-three percent" | 12a | The recovery, said once, right after the dashed solo line shows what it is compared with. |
| "nineteen", "three" | 13 | The hedge: size of the slice and runs per cell. |

Not voiced (screen only): the weak model's 14 % → 7 %, 26 % vs 14 %, 14–15 of 19, 0 / 19, turn
2 / turn 6, 652, the seed dots, file ownership's 14 %.

## Notes for the build

- **`BridgeCrew` (bespoke, the spine).** A flat bridge stage across the 936 px stage width: two
  banks, a gap, deck spans built plank by plank (progress per beat), crew chips with hard hats ("A",
  "B", "C", "1 agent"), walkie-talkies with pulsing radio arcs across the gap, a join marker, and
  the test truck. Modes: `hook` (two lanes), `humans`, `setup`, `clash`, `handshake` (boom barrier),
  `silence` (radio bubbles + thought cloud), `fences` (painted line, flush join, deck crack),
  `sequence` (baton, continuous deck), `integrator` (two yards, crew C lifts and bolts). Ladder
  overlay on the right edge (five rungs with icons and ✗ / half-tick / ✓ marks) is a prop, not a
  mode. Vertical cut: the bridge sits in the lower half of the stage, the ladder hugs the right
  margin, the question card the top band. Brand tokens only; the "clash" spark and the crack use
  the warm/error token, the accent goes only to the owner of the join (scenes 10-14).
- **`SeedBars` (bespoke, small).** Horizontal bars like `BarCompare`, plus three dots per bar at
  the per-seed rates and the range in small type ("[21–37]"); optional dashed reference line
  ("alone 30 %"). Could become `BarCompare` with a `dots` prop if that is simpler. Data, verbatim
  from the fork's `aggregate_seeds.py` (pass counts of 19 per seed):

  | cell | seed 1 | seed 2 | seed 3 | article |
  |---|---|---|---|---|
  | gpt-5.4 solo | 7 | 4 | 6 | 30% [21–37] |
  | gpt-5.4 coop | 1 | 3 | 0 | 7% [0–16] |
  | gpt-5.4 seq | 6 | 7 | 7 | 35% [32–37] |
  | gpt-5.4 c4 | 6 | 8 | 5 | 33% [26–42] |
  | mini solo | 3 | 3 | 2 | 14% [11–16] |
  | mini coop | 0 | 2 | 2 | 7% [0–11] |
  | mini seq | 4 | 4 | 7 | 26% [21–37] |

- **`QuestionCard` (reuse from `sport-from-motion-laya`).** Fixed top band, one question for the
  whole video ("Social skills, or structure?"), stamped once, at scene 14a.
- **Radio bubbles in 8b**: only text the article publishes, cropped (the agents' own messages
  about the public `dirty-equals` task: `_other.py`, `__init__.py`, IsMac). No filenames needed on
  screen; if a bubble wraps badly, drop the filename and keep the question.
- **Labels on screen:** model chips "gpt-5.4" and "gpt-5.4-mini" as the article names them;
  the conditions in plain words ("alone", "pair", "talk first", "own files", "own lines", "in
  sequence", "integrator"), never the codes C1-C4 (the article's codes are noise for a viewer).
  "CooperBench" and "Stanford" only on the paper card and in the outro credit. The only brand is
  AGILabs; no personal name on screen.
- **Numbers on screen, exactly as the article writes them:** "30 %", "7 %", "14 % → 7 %", "14–15
  of 19 pairs", "turn 2" / "turn 6", "0 / 19", "strong model 14 % · no better than a fair merge" (own files), "35 %", "33 %",
  "26 %", "14 %", ranges as in the table, "19 of 652", "5 repos", "3 runs", "2 models". No
  p-values on screen (the "ahead in all 3 runs" tag carries the weak-model claim, as the article
  itself leans on the per-seed direction).
- **Spoken forms:** "30 %" → "thirty percent"; "7 %" → "seven percent"; "35 % and 33 %" →
  "thirty-five and thirty-three percent"; "19" → "nineteen"; "javieraguilar.ai" → "javier aguilar
  dot A I".
- Visuals are chosen for impact, not as a literal replay: the bridge, crews, radios, truck, yards
  and the 652-tile grid are stylised; the rigour lives in the article and the fork. Narration and
  every number stay faithful to the article.
- Not in the cut (kept in the article): the fair-merge resolver re-score, the paper's own "team"
  mode at 0 %, the combos, the cost per run, the line-ownership v2 rerun, the human comparison
  beyond scene 3. If a v2 needs one more beat, the strongest candidate is the resolver ("fixing
  the conflicts barely helped: they were hiding deeper failures"), which fits the fences visual.
- ES cut: pending (EN-only for now).
