# Fact-check: Coding Agents and Teamwork: Social Skills, or Structure? (EN vertical) · v1.0

Source: `src/content/blog/en/coding-agents-structure.md` on `origin/main` (personal-website,
pubDate 2026-07-12), cross-checked against the public fork `JaviMaligno/CooperBench`
(branch `experiment/structural-conditions`; local clone, `logs/F-*`), where `aggregate_seeds.py`
reproduces the article's table cell by cell and `seed_stats.py` its McNemar p-values. Every spoken
claim and every number on screen, with the sentence it rests on. Illustrative visuals at the end.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "Give two coding agents one job, and they do worse than one." | CooperBench "reports a striking result: when you pair up two strong coding agents to split a task, their success rate roughly *halves* versus a single agent doing the same total work"; "Two agents working concurrently (coop) score below one agent doing the whole task (solo): 14%→7% for mini, 30%→7% for gpt-5.4." | OK. The paper's finding, which the article reproduces at both tiers. "Worse" is not stronger than either source; the significance caveat (weak model alone p=0.39) is screen-only in scene 5 via the muted mini line and is not claimed in the voice. |
| 2a | "A recent study says they lack social skills." | "A recent Stanford benchmark, CooperBench […] their reading is that the missing ingredient is *social intelligence*" | OK. "social skills" = the article's own title wording ("Social Skills, or Structure?"); the paper card shows "social intelligence" verbatim. |
| 2b | "But its agents work with almost no process. On purpose." | "they **deliberately** run agents with almost no scaffolding, precisely to measure *intrinsic* coordination ability. That's a legitimate scientific choice." | OK. "process" for "scaffolding" is the article's own later word ("agents dropped into a process vacuum"). The fair-play footnote keeps the article's respect for the paper. |
| 3 | "Human teams with no process collide too. So I tested structure." | "Human teams don't coordinate well with *zero* process either. We don't fix a team that keeps stepping on each other with therapy — we use **structure**" | OK. |
| 4a | "The test: each agent builds one feature; then their code is merged." | "two agents, each assigned one feature of a task, working in separate containers […] with their patches merged afterwards" | OK. "Tests: both features" on the truck = "Scoring requires *both* features to pass." |
| 4b | "They can message each other the whole time." | "**connected by a message channel they can use to coordinate at any time** (the benchmark gives them this from the start)"; "the agents can *always* talk" | OK. |
| 5 | "I got the same drop. With the stronger model: 30 % alone, 7 % as a pair." | "The coordination gap reproduces"; table: solo 30% [21–37], coop 7% [0–16] for gpt-5.4. | OK. Same numbers, same rounding. "the stronger model" = gpt-5.4 ("a mid-tier `gpt-5.4-mini` and a stronger `gpt-5.4`"). Significant for this tier alone (p=0.002). Fork: 7, 4, 6 vs 1, 3, 0 of 19. |
| 6 | "Most failures came at the merge: their code clashed." | "**Free-form coop fails at the merge, not at the code.** 14–15 of 19 coop failures (both tiers) are outright **merge conflicts**"; "unstructured concurrency → ~75% merge conflicts" | OK. "Most" = 14–15 of 19. "Clashed" = merge conflict (the article's later finding that half of them are trivial is not contradicted: git still flags them). |
| 7 | "Then I tried five kinds of structure." | "Then I added a **ladder of coordination structures**": C1, C2, C2b, C3, C4. | OK. Five rungs. |
| 8a | "Forcing them to talk first didn't help. They already were." | "The handshake gate (C1) never even fired: agents *already* message each other before touching code (first message on turn 2, first edit on turn 6). Making them talk more changed nothing, at either tier." | OK. C1 = 0% at both tiers (single run each; fork: 0/19, 0/19). |
| 8b | "One read its partner's request, planned to reply, and never did." | "It read the requests, even *planned* to coordinate in its own reasoning, and then never replied"; its reasoning: *"We do overlap. I should inspect and respond with precise coordination."* | OK. "One" = agent 2 in the logged C2b run; "planned to reply" = "I should … respond". The article verified delivery ("all of agent 1's messages landed in agent 2's context"), so "read" is supported. |
| 9 | "Owning files ended the clashes, but most code still failed." | "**enforced ownership drives merge conflicts to zero** — 0 of 19 for both C2 and C2b, at both tiers. The failure then moves downstream: patches combine cleanly but the integrated code doesn't pass both suites." | OK. "Most": C2 reaches 14% for the strong model (0% for mini), C2b 0% at both, so most pairs still fail; on screen the 14% is shown with the article's deflation ("not significantly better than coop once coop's merges are scored fairly (14% vs 9%, McNemar p=0.73)"). "Owning files" covers both file and line ownership (both rungs light up). |
| 10 | "What worked was one agent owning the final assembly." | "They share a mechanism: **one agent ends up owning the final integrated state**"; "The most reliable lever […] was **giving one agent ownership of the final integration**" | OK. |
| 11a | "In sequence: the second agent builds on the first one's code." | "agent A implements feature 1 and commits; agent B starts *from A's code* and adds feature 2." | OK. |
| 11b | "Or a third agent who merges both." | "**Integrator (C4):** A and B work independently; a third agent reconciles both patches." | OK. |
| 12a | "Both got back to solo level: 35 % and 33 %." | Table (gpt-5.4): sequential 35% [32–37], integrator 33% [26–42], solo 30%; "Both recover solo-level performance at both tiers" | OK. Strong model, as the chip says. "Back to solo level", not "beat solo": seq vs solo p=0.45, integrator never significantly beats solo (p=0.23). Fork: 6, 7, 7 and 6, 8, 5 of 19. |
| 12b | "And for the weaker model, sequencing beat one agent alone." | "for the *weak* model it **beats** solo (mini 26% vs 14%, ahead in all three seeds, p=0.039)" | OK. Fork: 4, 4, 7 vs 3, 3, 2 of 19 (ahead in each seed); p=0.0391 recomputed. Hedge follows immediately in scene 13. |
| 13 | "That's 19 task pairs, three runs each: a slice, not the whole benchmark." | "**A complete study on a 19-task slice of CooperBench's 652.**"; "**19 task-pairs across 5 repositories** — a subset I could run cleanly — not the full benchmark"; "the four headline conditions were run **three times each**" | OK. "Three runs each" is true of every number voiced (solo, coop, sequence, integrator) and of file ownership; talk-first and line ownership are single runs, and the video voices no number for them. |
| 14a | "Verdict: what worked was process, not more talk." | "the fix that generalizes is process (decompose + sequence, or appoint an integrator), not exhortations to communicate"; "reads, from here, less like *they lack social intelligence* and more like *they were dropped into an unstructured free-for-all*" | OK. Not "structure beats social skills", which the article explicitly declines ("The honest headline isn't 'structure beats social skills'"). "Process" refers back to the two structures of scenes 10-12, not to fences. The unvoiced footnote keeps the concession: "That gap — improvising coordination when none was imposed — is real". |
| 14b | "Don't expect agents to invent process. Give them one." | "**don't rely on anyone, silicon or carbon, to invent process in the moment — give them the process.**" | OK. Shortened, same claim. |
| 15 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Paper card "CooperBench · Stanford, 2026 · Why Coding Agents Cannot be Your Teammates Yet"; chip "missing: social intelligence" | 2a | "A recent Stanford benchmark, CooperBench ("Why Coding Agents Cannot be Your Teammates Yet")"; "(Khatua, Zhu, et al., 2026)" | |
| Stamp "ALMOST NO PROCESS · BY DESIGN"; footnote "a legitimate choice: it measures raw coordination" | 2b | "they deliberately run agents with almost no scaffolding, precisely to measure *intrinsic* coordination ability. That's a legitimate scientific choice." | |
| Question card "Social skills, or structure?" | 3-14 | Article title | |
| "feature 1", "feature 2", "merge", "tests: both features", "channel: always open" | 4 | Setup section; "Scoring requires *both* features to pass." | |
| Chip "gpt-5.4"; bars "alone 30 %", "pair 7 %"; seed dots 7, 4, 6 / 1, 3, 0 of 19; ranges [21–37], [0–16] | 5 | Table; fork `aggregate_seeds.py` | |
| Muted line "gpt-5.4-mini: 14 % → 7 %" | 5 | "14%→7% for mini" | Not voiced; no claim of significance (article: p=0.39 for mini alone). |
| "merge conflict", "14–15 of 19 pairs" | 6 | "14–15 of 19 coop failures (both tiers) are outright merge conflicts" | |
| Ladder: "talk first", "own files", "own lines", "in sequence", "integrator" | 7 | C1 handshake, C2 file ownership, C2b line-range ownership, C3 sequential, C4 integrator | Plain-word labels; article codes not shown. |
| "first message: turn 2", "first edit: turn 6" | 8a | "(first message on turn 2, first edit on turn 6)" | |
| Radio bubbles "Are you touching either of those?", "Can you avoid the import block…?", "Could you add the IsMac re-export there?"; thought cloud "I should inspect and respond with precise coordination." | 8b | Article's agent-chat block, cropped verbatim | Public benchmark task (dirty-equals), not work material. |
| "merge conflicts 0 / 19"; own files: "strong model 14 % · no better than a fair merge"; own lines ✗ | 9 | "0 of 19 for both C2 and C2b, at both tiers"; "C2's 14% is **not** significantly better than coop once coop's merges are scored fairly (14% vs 9%, McNemar p=0.73)"; table: C2b 0% / 0% | |
| Stamp "ONE AGENT OWNS THE JOIN" | 10 | "one agent ends up owning the final integrated state" | |
| Bars "in sequence 35 %", "integrator 33 %", dashed "alone 30 %"; seed dots 6, 7, 7 / 6, 8, 5 of 19 | 12a | Table; fork | |
| Chip "gpt-5.4-mini"; "alone 14 %" (3, 3, 2), "in sequence 26 %" (4, 4, 7); tag "ahead in all 3 runs" | 12b | "mini 26% vs 14%, ahead in all three seeds" | |
| "19 of 652", "5 repos", "3 runs", "2 models"; 652-tile grid with 19 lit | 13 | "19-task slice of CooperBench's 652"; "19 task-pairs across 5 repositories"; "three times each"; "two capability tiers" | Fork: 19 feature pairs from 9 tasks in 5 repos (go-chi, click, jinja, pillow, dirty-equals). |
| Stamp "PROCESS, NOT MORE TALK"; footnote "a smaller gap remains: agents rarely improvise process on their own" | 14a | "not exhortations to communicate"; "a good human *improvises* it […]; the agents, handed the very same channel, mostly didn't. That gap […] is real" | |
| Credit "Benchmark: CooperBench (Khatua, Zhu, et al., 2026)" | 15 | Article footer | |

## Illustrative (not data)

Bridge, banks, deck spans, crews and hard hats, walkie-talkies, the test truck, the boom barrier,
the painted line and the deck crack, the baton, the two yards and crew C, the four human icons, the
652-tile grid. They stand for the mechanisms the article describes; their timing and geometry are
not measurements. No p-value appears on screen.

## Anonymisation and branding

Nothing in this article is work material: the benchmark, its tasks and the agent log are public.
No company, client or employer anywhere. Model names as the article prints them. The only brand on
cards, poster and metadata is AGILabs; no personal name on screen.

## Problems found in the article (vs its own data)

Checked against the fork's logs with `aggregate_seeds.py` / `seed_stats.py`. None affects a
line of this script; listed for Javier to decide whether to correct the article.

1. **"both beat coop decisively at both tiers (p<0.0001)"** (Results, point 2). p<0.0001 holds
   only pooled across tiers and for sequencing on gpt-5.4. Per tier: mini seq vs coop p=0.0074,
   mini integrator vs coop p=0.035, gpt-5.4 integrator vs coop p=0.0003. All still significant,
   but not p<0.0001 at both tiers. The "Statistics, honestly" paragraph says "overwhelmingly
   (p<0.0001)" without saying pooled.
2. **"coarse file ownership (C2, 16%)"** (line-range paragraph) disagrees with the table's C2
   14% [11–16]: 16% is seed 1 alone (3/19).
3. **"Sequencing roughly doubles the bill to modestly beat solo"** (cost paragraph, strong
   model) contradicts the article's own "merely tying it for the strong one (large 35% vs 30%,
   p=0.45)". "to match solo" would be consistent.
4. **C2b "single run"**: the caveats say C1 and C2b are single runs at "0%/near-0%"; the fork has
   two C2b runs per tier (v1 whole-file revert: gpt-5.4 1/19; v2 per-hunk: 0/19; mini 0/19 both).
   The table shows v2. Minor; the text elsewhere describes the v2 rerun.
5. **"four of the nine tasks were solved by nothing, ever — including solo"** (caveats). In the
   fork, across every `F-*` run (all conditions, combos, both tiers, all seeds), passes land in only
   **three** of the nine tasks (click 2068, jinja 1465, pillow 25), so **six** of nine were solved
   by nothing. Consistent with the same bullet's "two Python repos (plus one Pillow task)"; the
   "four" looks wrong. Also, the article otherwise counts in pairs ("19 task-pairs"), so "nine
   tasks" next to "19" may read as a contradiction without saying 19 pairs come from 9 tasks.

## Build notes (v1.0 render)

Screen text added while building, none of it a new claim:

| On screen | Scene | Why it is safe |
|---|---|---|
| Lane titles "ONE AGENT" ✓ / "TWO AGENTS" ✗ | 1 | Restates the hook line and the table (solo 30 % vs coop 7 %, strong model). |
| "BENCHMARK · STANFORD, 2026" over "CooperBench" | 2 | "A recent Stanford benchmark, CooperBench"; "(Khatua, Zhu, et al., 2026)". |
| Legend "one run each (3 runs)" next to the seed dots | 5, 12 | "the four headline conditions were run three times each"; dots = per-seed pass counts of 19 from the fork. |
| "A → B · ✓ received" on each radio bubble; "B, thinking" over the thought cloud | 8b | "all of agent 1's messages landed in agent 2's context"; the quoted line is agent 2's own reasoning. |
| Note prefixed "own files:" ("own files: strong model 14 % · no better than a fair merge") | 9 | Ties the note to its rung; the 14 % is C2 file ownership on gpt-5.4. |
| "task pairs" after "19 of 652" | 13 | "19 task-pairs across 5 repositories"; "CooperBench's 652". |

Caption punctuation: scene 5's written line uses a comma after "model" instead of a colon (the
caption splitter otherwise flashed "With the stronger model:" at 20 chars/s). Words and the voiced
text are unchanged.
