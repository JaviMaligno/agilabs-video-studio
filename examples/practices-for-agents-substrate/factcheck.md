# Fact-check: Bad Code Doesn't Hurt an Agent. Until the Repository Is Large. (v1.0)

Source: `src/content/blog/en/practices-for-agents-substrate.md` on `origin/main` of the website
repo (pubDate 2026-09-08; the ES version has the same tables and text). Repo:
`JaviMaligno/agent-code-practices` (local copy `~/Documents/repos/agent-code-practices`, commit
`8da8083` "data: the full campaign, 2,929 cells"), read only to resolve the table issue below.
Scope: narration, plus the numbers and text shown on screen. Visuals are illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1-2 | "Bad code doesn't hurt an agent. Until the repository is large." | Title: "Bad Code Doesn't Hurt an Agent. Until the Repository Is Large." | OK, the title. |
| 3 | "Clean-code habits were made for human readers." | "Software practices were justified for human readers." | OK ("clean-code habits" = the practices listed in the next sentence). |
| 4 | "Now agents do more and more of the reading, and I couldn't find a measurement of which habits help them." | "Today a growing share of the reads of any repository are done by an agent, and I couldn't find a measurement of which of those practices help *it*" | OK. |
| 5 | "My bet. An agent reads text well, but doesn't hold the whole repository in its head." | "My hypothesis, written down before running anything"; "An LLM is an excellent text processor. What it doesn't have is the repository in its head." | OK. |
| 6 | "So knowing where to look should matter more than how well each file is written." | "So it should care **more about knowing where to look** … **than about how well-written the file is** once it's open." | OK. |
| 7 | "To test it, I damaged working code without changing what it does." | "degrade it in ways that are **semantically equivalent** — the program does exactly the same thing before and after, verified by the repo's own suite giving an identical result." | OK. |
| 8 | "Nine kinds of damage, in two families. How it's written, and where to look." | "Nine degradations in two families. **How it's written** … **Where to look** …" | OK. |
| 9 | "Then I planted bugs for an agent to fix. 2,929 runs in all." | "a bug is injected programmatically and only counts if it makes a specific set of tests fail"; "**2,929 measured runs across four repositories**" | OK. |
| 10 | "On a small library of self-contained files, nothing measurable happens." | "python-stdnum: tax-number validators, small self-contained files."; "Nothing separates from the baseline. Not even degrading everything at once."; description "In small code nothing measurable happens." | OK as the article concludes it (see issue 1: the table printed under this sentence is not stdnum's, but the sentence matches stdnum's data). |
| 11 | "Even fully degraded, the strong model only goes from 98% to 93%." | High-tier table: baseline "59/60 — 98%", both "56/60 — 93% … n.s."; summary table "python-stdnum, high tier \| 98% \| 93%" | OK. Repo: T0-alto10 59/60, T3-alto10 56/60. |
| 12 | "Then a large library, where every fix means understanding several pieces at once." | "pint: physical units, large interconnected code where fixing anything means understanding several pieces at once." | OK. |
| 13 | "Degrade everything, and the agent goes from solving 54% to 24%." | "**From 54% to 24%.** Degrading both families at once takes away more than half of what the agent was solving"; summary table "pint \| 54% \| 24%" | OK. Repo (pint, pooled p10 + g15 + g15b + first batch): T0 91 solved, T3 37 solved, matching "91/167 — 54%" and "37/157 — 24%". |
| 14 | "Dirtying only the text costs almost as much. Hiding where to look, alone, I can't tell from noise." | "degrading only *how it's written* costs almost as much"; "Hiding *where to look* produces no effect this data can separate from noise. Dirtying the text does." | OK, hedge kept ("can't tell from noise", not "no effect"). |
| 15 | "So my bet was backwards. Likely, finding files the agent already solves with search." | "it is the opposite of what I wrote down"; "The explanation I find most plausible … **finding the file is a problem it has already solved** — it searches, lists, opens" | OK; "Likely" carries the article's "most plausible". |
| 16 | "Unreadable code it pays for line by line, in turns. Each run had 40." | "Reading unreadable code it cannot delegate to any tool: it pays for that in full, line by line"; "It is paid in turns before it is paid in failures"; "6 turns out of 40"; "The 40-turn ceiling is a design choice." | OK. |
| 17 | "On the small library, the strong model needs 6." | "It solves in 6 turns out of 40"; summary table "python-stdnum, high tier … 6 → 6" | OK (median). |
| 18 | "On the large one it already needs 30. The damage pushes it to 40, and it runs out." | "pint starts at 30 out of 40, and any added cost pushes it through the ceiling"; summary table "pint … 30 → 40"; "with the median turn count pinned at the ceiling" | OK. "it runs out" = median at the ceiling; runs at the ceiling 62/167 → 103/157 (on screen optional). |
| 19 | "The real question is how much margin it has left." | "Not *"can the agent work in this codebase?"* but *"how much margin does it have left?"*." | OK. |
| 20 | "One habit stood out. Readable names, given back to destroyed code, brought it to 97%, above the 83% baseline." | "giving **readable names** back to otherwise destroyed code recovers 97%, and that does separate — from the baseline"; "*(baseline: 49/59 — 83%)*" | OK. Repo: AB-A2 (all degraded except names) 58/60. The article does not name the repository for this table; the data is python-stdnum, low tier (baseline T0-p10 49/59). The script does not name it either. |
| 21 | "So does clean code matter to an agent? Only sometimes." | "A small repository with a good model tolerates almost anything. A large one with a stretched model tolerates nothing." | OK, the verdict in plain words. |
| 22 | "What does help? First, readable names." | "giving **readable names** back to otherwise destroyed code recovers 97%, and that does separate — from the baseline and from giving back almost anything else"; "names are not necessary while the rest of the context is intact, but they are sufficient when nothing else is left" | OK. "First" orders the list; it is the only practice that separates when given back (p=0.016). Not "names alone are necessary": removing them from clean code is n.s. (81%), so the card says "given back to destroyed code". |
| 23 | "Then, in large code with little margin, clearly written code." | "degrading only *how it's written* costs almost as much, with the median turn count pinned at the ceiling"; "Hiding *where to look* produces no effect this data can separate from noise. Dirtying the text does."; "pint starts at 30 out of 40"; "A large one with a stretched model tolerates nothing." | OK, conditioned as the article does (large interconnected code, little turn margin); in small code nothing measurable (line 10). |
| 24 | "Tidy folders matter less. The agent likely finds files by searching." | "Hiding *where to look* produces no effect this data can separate from noise"; "hiding *where to look* adds damage on top of dirtying the text, but on its own it does nothing this data separates from noise"; "The explanation I find most plausible … **finding the file is a problem it has already solved** — it searches, lists, opens — and flattening the hierarchy or deleting the README removes help it wasn't using." | OK. "matter less" (not "don't matter"): alone not separable from noise, but it adds damage on top of dirty text. "likely" carries "most plausible". |
| 25 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Line | Source | Note |
|---|---|---|---|
| "tests: identical ✓" | 7-8 | "verified by the repo's own suite giving an identical result" | |
| "9", the degradation chips | 8 | "Nine degradations in two families" + the list | |
| "2,929", "4 repositories" | 9 | "**2,929 measured runs across four repositories**" | |
| "98% → 93%", "83% → 81%", "n.s." | 11 | Summary table rows "python-stdnum, high tier" and "low tier" | The low-tier "worst condition" (81%) is the both-families cell (repo T3-p10 48/59); the low-tier "how it's written" cell is lower (T1-p10 42/56, 75%), so the label on screen must be "fully degraded", not "worst". |
| "54% → 24%", "p<0.001" | 13 | "**From 54% to 24%.**"; "both drops sit far below chance (p<0.001)" | |
| "6", "30", "40", "out of turns" | 16-18 | "6 turns out of 40"; "pint starts at 30 out of 40"; summary table "30 → 40" | |
| Given-back bars: types 80%, names 97%, formatting 80%, comments 85%, cohesion 78%, hierarchy 82%, README 86%, tests 86%; baseline 83% | 20 | "Which practice pays" table, column "Given back to destroyed code"; "*(baseline: 49/59 — 83%)*" | |
| Checklist "what helps an agent": ✓ Readable names "given back to destroyed code · 97% vs 83%"; ✓ Clearly written code "in large code with little margin"; ~ Tidy folders "matter less · the agent likely searches" | 22-24 | Sources of lines 22-24 above; 97% and 83% as in line 20 | The tilde (not a cross) keeps "not separable from noise" from reading as "proven useless". |
| Caveat tags "40-turn budget", "1 model per tier", "2 repos carry it" | 24 | "The 40-turn ceiling is a design choice."; "One model per tier, and one pair of tiers."; "Two repositories carry everything." | |

## Article issues (for Javier)

1. **The first results table is not python-stdnum's.** Under "Where nothing happens /
   python-stdnum" the table shows baseline 91/167 — 54%, "how it's written" 45/155 — 29%
   (p=0.000), "both" 37/157 — 24% (p=0.000), "Ceiling before→after" 62 → 103. That is the
   **pint** pooled data (repo: pint T0 p10 + g15 + g15b + first batch = 91 solved; T3 = 37; it
   also matches "pint … 62/167 → 103/157" in the summary table and "original 91/167 — 54%" in the
   pint file-size table). The text right under it says "Nothing separates from the baseline" and
   "sixty cells per condition would have shown a twenty-point drop", which describes the
   **python-stdnum low-tier** run (repo T0-p10 49/59 = 83%, T1 42/56, T2 46/58, T3 48/59) — a
   table that is not in the article. Same in ES.
2. **The pint table is the 10-pass subset only.** Under "Where it does / pint" the table shows
   19/35 — 54%, 7/26 — 27%, 11/30 — 37%, 0/25 — 0% (repo: pint p10 files only: 19/36, 6/25,
   10/29, 0/25, small differences from unmeasurable cells). The paragraph right after it ("From 54%
   to 24% … nearly two hundred cells per condition … p<0.001") describes the pooled data of the
   first table, not this one. Its "both 0%" and "where to look … 37%" contradict the prose (24%;
   "on its own it does nothing this data separates"). The fix is likely: move the 91/167 table to
   the pint section, and put the stdnum low-tier table (83% baseline) where it was. Not touched
   here.
3. "nearly two hundred cells per condition" vs 155-167 cells in the pooled pint table: a soft
   rounding; not voiced.
4. Summary table header "Worst condition": for python-stdnum low tier the 81% is the
   both-families cell, but the "how it's written" cell is lower (75% in the repo). Not voiced;
   on screen labelled "fully degraded".
5. The "Which practice pays" table does not say which repository/tier it is; it is python-stdnum,
   low tier (repo AB/KO files, baseline 49/59). Not voiced.

None of these change the video: every voiced figure (98% → 93%, 54% → 24%, 6 / 30 / 40 turns,
97% vs 83%, 2,929) is consistent across the prose, the summary table and the repo data.
