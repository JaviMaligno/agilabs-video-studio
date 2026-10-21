# Fact-check: The Instrument Fails in Your Favour (v1.0)

Source: `src/content/blog/en/the-instrument-fails-in-your-favour.md` on `origin/main` of the
website repo (pubDate 2026-09-04). Cross-checked against the articles it links
(`what-agents-say-to-each-other`, `coding-agents-structure`, `the-grader-knew-less`,
`three-judges-three-rankings`) and the CooperBench fork's history
(`~/Documents/repos/CooperBench`, branch `experiment/structural-conditions`). Scope: narration
and the numbers/text on screen. Visuals are illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "Every instrument I built broke at least once." | "In those three studies, every instrument I built broke at least once." | OK, the article's own sentence. See "Problems in the article" (1): cases 2 and 3 were not built by Javier. |
| 2 | "And every break pointed toward the result I was expecting." | "Every break pointed toward the result I was already expecting." | OK as the article states it. Softened in the body by scene 11 ("didn't change the conclusion"), as the article itself does in section 2. See problems (2)-(3). |
| 3 | "To test AI agents, I write tools that score them." | "it is what I did in three separate studies this year"; "I wrote a lexical detector for it"; "The scorer in the same study" | OK. Setup line for newcomers; "AI agents" covers the coding-session and CooperBench studies shown. |
| 4 | "The thing you measure with is unverified software too." | "**the thing you measure with is unverified software too.**" | OK, verbatim. |
| 5 | "One detector looked for agents saying: wait, I'm in that file." | "one session says *wait, I'm in that file*, the other says *go ahead*. I wrote a lexical detector for it." | OK. |
| 6 | "It found 19, and only 5 closed. That fit my story." | "It found 19 candidate sequences of which only 5 closed"; "it fitted the story I was telling about follow-through" | OK. "19" = candidate sequences (screen chip says so implicitly: 19 chips). Same in the source article. |
| 7 | "Counted by hand: 3 real requests, all 3 closed." | "Recounted over the coded categories, there are **3** real wait requests, and **all 3 close**." | OK. "By hand" = the article's own summary in section 5: "recounting the mutex sequences by hand". |
| 8 | "It had counted every "wait", even just mentions." | "anything containing *wait*, *hold* or *go ahead* walked in, including messages that were not requests at all"; "so it counted mentions" | OK. "wait" stands for the three keywords; the net label on screen shows all three. |
| 9 | "A benchmark I inherited scored every merge conflict as a fail." | "I did not write that eval; I inherited it"; "my first table scored **every** merge conflict as an instant fail" | OK. |
| 10 | "That pushed the number toward my thesis." | "The missing step pushed the number in the direction of my thesis." | OK, near-verbatim. |
| 11 | "Fixing it moved one task. It didn't change the conclusion." | "7% for the weak model (unchanged) and 9% for the strong one, up from 7%. One extra task."; "**Fixing the instrument did not change the conclusion.**" | OK. Matches `coding-agents-structure` table: coop 7% / 7%, fair-merge 7% / 9%. "One task" pooled over three seeds, as the article says. |
| 12 | "An external report scored a client's classifier at 54%." | "An external report scored a client's industry classification service at **54% accuracy over 500 companies**" | OK. 500 on screen. |
| 13 | "Its answer key could be guessed from the company name alone." | "**the gold labels could be guessed from the company name alone**" | OK. "answer key" = gold labels, plain wording. |
| 14 | "The comparator had three flaws, and all three could only subtract." | "order-sensitive […] blind to compatibility […] binary"; "Three independent defects, and **all three could only subtract points**." | Wording note: in the article the "three independent defects" are arguably the three comparator flaws *plus* the gold set ("the gold set wasn't the only defect"), but it then lists exactly three comparator properties and says "all three could only subtract". The narration follows that reading. |
| 15 | "Checked case by case: 75%, up to 85%." | "Redone by hand, case by case, the defensible number was **75% on a conservative reading and up to 85% resolving the grey zones favourably**." | OK. Hedge kept on screen as a band 75%-85% with "~20 points" (article: "Around twenty points above the report"). |
| 16 | "Random bugs would point both ways. These didn't." | "random bugs would have gone both ways" | OK. "These didn't" restates the article's thesis; see problems (2)-(3). |
| 17 | "When the number confirms, I stop looking. That bug survives." | "**you stop looking when the number confirms.** […] a bug that produces one is never encountered." | OK. "Survives" = never encountered. |
| 18 | "When it contradicts, I dig, and the bug gets found." | "A result that contradicts it starts an investigation, and that investigation finds whatever bug is there." | OK. |
| 19 | "The instrument isn't biased. My stopping rule is." | "The instrument isn't biased. Your stopping rule is" | OK; first person, as the article's preceding paragraphs ("I wrote that article while doing the same thing with my own tooling"). |
| 20 | "So go and look at the thing itself, hardest where the result pleased you." | "**Go and look at the thing itself, not at what your tool says about it.**"; "**Audit hardest where the result pleased you.**" | OK, two of the article's bolded rules merged. |
| 21 | "Measure it, but trust the measurement the least." | "**measure it, and treat the measurement as the least trustworthy component in the system**" | OK, shortened. |
| 22 | "It's the only part nothing is checking." | "because it is the only one nothing is checking." | OK. |
| 23 | "More at javieraguilar.ai." | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Row of 5 cracked gauges | 2 | "Five instruments across three studies" | Unlabelled; illustrative. The article never lists the five (see problem 4). |
| Stamp "UNVERIFIED SOFTWARE TOO" | 4 | "unverified software too" | |
| Net `/wait\|hold\|go ahead/` | 5 | "anything containing *wait*, *hold* or *go ahead*" | Stylised regex; the article does not print the rule. |
| 19 chips, 5 ticks; gauge "closed 5 / 19" | 6 | "19 candidate sequences of which only 5 closed" | Chip texts illustrative, anonymised. |
| 16 grey out, 3 stay; gauge "3 / 3" | 7 | "**3** real wait requests, and **all 3 close**. The other 16 were false positives" | 19 − 3 = 16, consistent. |
| Arc label "agents don't finish" | 6 | "Agents start coordinating and don't finish." | |
| "29 conflicted pairs" | 9 | "Triaging all 29 conflicted pairs by hand" | |
| Arc label "two agents at once fail" | 10 | "the condition my article was arguing against" | Paraphrase of the thesis (concurrent coop underperforms). |
| ~half the sparks heal | 11 | "roughly **half the conflicts aren't real logic collisions**" | Illustrative proportion. |
| "7% → 7%" (weaker model), "7% → 9%" (stronger model), "+1 task", "CONCLUSION HELD" | 11 | "7% for the weak model (unchanged) and 9% for the strong one, up from 7%. One extra task."; "Fixing the instrument did not change the conclusion." | Same in `coding-agents-structure` table (coop vs coop + fair conflict resolution). |
| "accuracy 54% · 500 companies" | 12 | "**54% accuracy over 500 companies**" | |
| Fictional rows "Northgate Logistics → Transport", "Brightfield Solar → Energy", "JRK Holdings → General services" | 13 | "If the name contained *logistics*, transport. If it contained *solar*, energy. If it was an acronym or a surname, some generic services bucket." | Fictional names; client data never shown. |
| Magnets "order-sensitive", "blind to compatible codes", "all-or-nothing", each "−" | 14 | "**order-sensitive** […] **blind to compatibility** […] **binary**"; "all three could only subtract points" | "all-or-nothing" = "binary (missing the branch entirely and missing a subcategory within the right branch scored the same)". |
| Band "75%-85%", bracket "~20 points" | 15 | "75% on a conservative reading and up to 85%"; "Around twenty points above the report." | |
| DONE shelf / magnifier conveyor | 16-20 | Section 5 mechanism | Illustrative, not a replay. |
| "Measure it. Trust the measurement least." | 21 | Closing paragraph | Shortened. |
| Badges "tests", "review", "monitoring", "users" on other boxes | 22 | "Everything else in your stack has tests, review, monitoring, and users who complain." | |

## Problems in the article (vs its own data and sources)

1. **"Every instrument I built" vs inherited/external instruments.** The headline sentence says
   every instrument *I built* broke, but two of the four sections are about instruments Javier did
   not build: the CooperBench eval ("I did not write that eval; I inherited it") and the
   classifier's gold set and comparator (produced by the external report). The video keeps the
   article's line in the hook and labels the cases "an inherited benchmark" and "the reference".
2. **"Every break pointed toward the result I was expecting" is not true of every break the
   article lists.** Section 2 itself says "three instrument defects, two of which would have
   flattered my thesis, one of which changed nothing" (the team-mode double-apply bug: "The number
   didn't move — it stayed at 0%"). And the false-0% composition bug did not flatter the thesis:
   the fork's commit `7b8a402` ("fix(eval): c4 must compose patch_a + integrator patch (false-0%
   bug)") shows it zeroed the **integrator** condition (C4), one of the two structures the
   CooperBench article found to *recover* coordination. A false 0% there pointed against the
   published conclusion, not toward it. So "two of which would have flattered my thesis" is also
   doubtful: of missing-resolver / team-routing / composition, only the missing resolver clearly
   flattered it.
3. **The classifier case points the other way too.** The broken reference and comparator pushed
   Javier's own client system *down* (54%), against what he would have expected of it; that is why
   he investigated. It fits the stopping-rule mechanism (contradiction → digging → bugs found) but
   not the headline claim that every break pointed toward his expected result. The video only
   claims "all three could only subtract" for this case, which the article supports.
4. **"Five instruments across three studies" does not match the cases.** The article's footer
   names the three studies as CooperBench, judge-bias and cross-session crosscheck; the
   classifier case is a fourth source not in that list, and the judge study is framed as the
   "fourth failure mode where nothing is broken". Counting the broken instruments in the text gives
   more than five (lexical detector, claim scorer, missing conflict resolver, team-mode routing,
   composition bug(s), gold set, comparator), or a different five depending on grouping. The
   video's row of five gauges is unlabelled for this reason.
5. Minor: section 3 says "Three independent defects, and all three could only subtract points"
   right after "the gold set wasn't the only defect, and the others…", so "three" can read as gold
   set + others or as the three comparator properties. Not a number error.

All other numbers checked match their sources: 19 / 5 / 3 / 16 (what-agents-say-to-each-other),
29 pairs, "roughly half", 7% / 7% / 9%, false-0% audits (coding-agents-structure), 54% / 500 /
75% / 85% / ~20 points (the-grader-knew-less), and the judge numbers not used in the video
(48.6 / 48.6 / 64.6, 77.8 / 86.1 / 88.9, 27/27, 45/45, +16.7 / −14.6 / +4.2, +28.3 / +25.0 /
+21.7, κ −0.01 / −0.03 / +0.05; three-judges-three-rankings).

## Build notes (v1.0 build): extra on-screen text

Text added while building the scenes, beyond the script's table. All of it restates narration or
an article sentence; no new figures.

| On screen | Scene | Source |
|---|---|---|
| "agent runs" (stack wired to the gauge), "detector" / "scorer" / "answer key" tags | setup | Script 3 |
| Back of the gauge: illustrative code, chip "tests: 0" | setup | "unverified software too" (illustrative) |
| "19 found · 5 closed" → "3 real · all 3 closed" | case1 | "19 candidate sequences of which only 5 closed"; "**3** real wait requests, and **all 3 close**" |
| "16 false positives" | case1 | "The other 16 were false positives" |
| "mention", "not a request" on the zoomed chips | case1 | "including messages that were not requests at all"; "it counted mentions" |
| "agent A" / "agent B", "one file" | case2 | Illustrative |
| "bug: missing conflict resolver" | case2 | "The missing step pushed the number…"; the fix is a fair conflict resolver (coding-agents-structure) |
| "about half: not real collisions" | case2 | "roughly **half the conflicts aren't real logic collisions**" |
| Gauge readout "7%" → "9%" (stronger model) | case2 | "9% for the strong one, up from 7%" |
| "external report", "ANSWER KEY" | case3 | "An external report scored…"; gold labels |
| "random bugs: both ways" → "these: all one way" | mechanism | "random bugs would have gone both ways" + narration 16 |
| "as expected?" fork, "yes" / "no", "DONE · stopped looking", "dig", "bugs found" | mechanism | Section 5 mechanism (illustrative) |
| "audit where it pleased you" | mechanism | "**Audit hardest where the result pleased you.**" (first person) |
| Boxes "service", "pipeline", "database", "frontend"; "the eval harness"; "no checks" | close | "Everything else in your stack has tests, review, monitoring, and users who complain. Your eval harness has…" |

Narration changes at build time: script lines 14 and 20 are each voiced as two lines (same words,
split at the comma) so every caption reads under 17 chars/s; script line 11 is voiced as two
lines so "CONCLUSION HELD" gets its own beat. Spoken forms: "nineteen", "five", "three",
"fifty-four percent", "seventy-five percent, up to eighty-five", "javier aguilar dot A I".
