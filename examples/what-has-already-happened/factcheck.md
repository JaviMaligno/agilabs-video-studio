# Fact-check: Your Agent Doesn't Know What Has Already Happened (v1.0)

Source: `src/content/blog/en/what-has-already-happened.md` on `origin/main` of the website repo
(pubDate 2026-08-13). The frontmatter has no `repoUrl` and no experiment repo was found locally,
so the article text and its data card (`public/blog/what-has-already-happened-data.png`) are the
only sources. Scope: narration, plus the numbers and text shown on screen. Visuals are
illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "My agents plan around work that never happened." | Description: "Agents plan around events that never occurred"; the test's state error (status count read as finished takes when "nothing has come out of the studio yet"). | OK. General claim the description makes. The hook visual uses the *test material*, not the thrown-away status-file anecdote (the article says that anecdote "stopped being evidence"). |
| 2 | "The obvious fix is to tell them the date. I tested that." | "The obvious diagnosis is that it doesn't know when *now* is. I'll come back to that, because it's testable and it's false."; "the natural fix is to tell the model when *now* is" | OK. |
| 3 | "Six models got one page of facts from my real project." | "You give a model ~1.7 KB of project facts"; "The material is my real project, ambiguity included"; six models listed. | OK. "one page" ≈ ~1.7 KB (shown on screen). |
| 4 | "And I asked: in what order, and with what constraints?" | "*in what order should I do these, and are there any ordering constraints I need to respect?*" | OK, shortened. |
| 5 | "Then I added a line: today's date, or what the timings really were." | Conditions B ("today is 11 August 2026") and C ("the measured times are practice read-throughs…"); D both; E both + prohibition. | OK as a simplification: "one or two lines" in the article; the screen shows all five conditions A-E. |
| 6 | "Then all of it again, on an unrelated software release." | "the whole thing again in an unrelated domain: a release of twelve services" | OK. |
| 7 | "The trap: piece four reuses a calculation from piece three." | "the fourth reuses a calculation written during the third" | OK. |
| 8 | "But its script says: I'll rewrite them for you. No dependency." | "the script of the fourth says, in as many words, **"I'll rewrite them for you."** It's self-contained. There is no ordering constraint." | OK, verbatim quote. |
| 9 | "Five of six models put four after three anyway." | "Five of six models say B must come after A. In the course domain that's **92 out of 92 responses**" | OK. Screen adds 92 / 92 (course) and Opus 52% / 10%, so the sixth model is not hidden. |
| 10 | "One even copied the exemption into its answer, then ignored it." | gpt-4o quote; "It read the exemption, wrote it down, and reasoned as if it hadn't." | OK. "One" = the single answer the article quotes (gpt-4o, release domain); header on screen says so. |
| 11 | "Then a habit: shoot the intro last, since it depends on the rest." | "in video production you shoot the intro last, because the intro has to match what you ended up making"; table header "defers it *because it depends on the rest*" | OK. "habit" = "a convention from the training corpus", "real, sensible practices". |
| 12 | "But the scripts were frozen in July. That reason had expired." | "the scripts were frozen in July"; "The reason to defer them expired before the window even opened." | OK. |
| 13 | "Being a better model didn't help here." | "What the data does support is narrower and still useful: **being a better model does not help here.**" | OK, the article's own words. Does NOT say "the failure grows with capability", which the article explicitly rejects ("Not monotonically"). |
| 14 | "The timings were only rehearsals. When I said so, one model replanned." | "condition C settles it: *these are rehearsals…*"; "**`claude-opus-5` acts on it.** The state error drops from 92% to 20% in the course domain (p=3.7·10⁻⁷) and from 20% to 0% in deployment." | OK. "replanned" = "acts on it". Both domains on screen. |
| 15 | "The rest mostly repeated it, and kept planning around those takes." | "**The smaller models mostly just repeat it.** […] And then they plan around 63 pending anyway." | OK. "mostly" kept. The worsening in three models (12% → 32% etc.) is not voiced: the article labels it an indication without individual significance. |
| 16 | "And the date? It changed nothing, on any measure." | "Adding the date explicitly moved nothing. Not one of the four measures (all p > 0.5)." | OK. |
| 17 | "Told not to invent constraints, 96 % still did." | "condition E adds, in plain language, *don't invent ordering constraints*: still **96%**." | OK on the figure. The article does not say over which models/domain the 96% is computed; the data card puts it under "ignores the written exception". Screen shows only "condition E: 96 %". |
| 18 | "So it isn't the clock." | Heading "It isn't the clock"; "So the deficit isn't the timestamp." | OK — the verdict. |
| 19 | "A calendar says when now is, not which facts are already settled." | "A calendar tells you where *now* sits; it tells you nothing about which of your facts are already fixed" | OK ("settled" for "fixed", to avoid the "repaired" reading; the article also uses "already settled" in its intro). |
| 20 | "That lives in the document. Write the sentence you mean." | "That structure lives in the document"; "**Don't write an exemption — write the sentence you mean.** The best-supported item here" | OK. Recommendation, as the article frames it; the video does not claim it fixes failure 2 (the article: "Stale-premise reasoning I couldn't fix at all"). |
| 21 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| "~1.7 KB" | 3 | "~1.7 KB of project facts" | |
| "68 videos to record", "studio: 4 days, ahead", "scripts frozen since July", "2 good / 3 to redo / 63 pending", "I'll rewrite them for you" | 3 | The four bullets of the material | |
| Six model names | 3 | Model list | |
| Condition strips A-E | 5 | Conditions table, verbatim | |
| "12 services · deploy window ahead · staging rehearsals behind", "same structure, none of the same words" | 6 | Second-domain paragraph | |
| "572 scored responses", "blind judge, checked against my hand coding" | 6 | "**572 scored responses.** An LLM judge … blind to the condition"; "one agreed 30/32" | |
| "course: 92 / 92 responses", Opus "52% · release 10%" | 9 | "92 out of 92 responses"; table | |
| gpt-4o answer lines | 10 | Quote, verbatim and cropped | The service names are the article's fictional test material. |
| Bars 36% / 60% (course), 69% / 98% (release) | 13 | Failure 2 table | |
| "claude-opus-5 · course 92% → 20% · release 20% → 0%" | 14 | "drops from 92% to 20% … and from 20% to 0% in deployment" | |
| "today is 11 August 2026" | 5, 16 | Condition B | |
| "all p > 0.5" | 16 | "(all p > 0.5)" | Gauges carry no values. |
| "condition E: 96 %" | 17 | "still **96%**" | |
| "8:25 †" | 20 | "writing `8:25 †`, where the dagger means "this delta is meaningless"" | Illustration of provenance marks; not voiced. |

Deliberately **not** shown: "25 out of 25", "nineteen of twenty", "96–100%", "0–70%" ranges (see
article issues below).

## Anonymisation

The test material is published in the article as is (course facts, fictional release services).
No institution, course title, studio, colleague or employer appears; the course is "68 videos",
"a studio", "scripts". No personal name on screen; AGILabs is the only brand.

## Issues found IN THE ARTICLE (against its own tables and data card)

1. **"nineteen of twenty" vs 96%.** Condition E: "still **96%**. … watch it violated in nineteen
   of twenty runs." 19/20 is 95%; 96% would be e.g. 24/25 or 228/237. One of the two is loose.
2. **"96–100% … in five of six models"** ("the exception loses 96–100% of the time in five of six
   models") contradicts the Failure 1 table read per model: `gpt-5.4-mini` is 86% in the
   deployment domain. It is true only pooled (the commit message gives 228/237 = 96% in
   deployment, 92/92 in course). Worth "pooled" or "86–100%".
3. **"25 out of 25 in the deployment domain"** for claude-opus-5 on Failure 2 vs the table's 98%
   for the same model and domain. Probably one condition (25/25) vs all conditions (98%), but the
   sentence reads as the domain total.
4. **"worst in its column / best"** (outlier table): with the five smaller models at "0–70%" and
   "0–56%", the article cannot show Opus's 20% is the *worst* in the deployment column without
   condition (other models' values are not given; three are 12%), nor that its 20% (course, with
   the clarification) is the *best*, and 0% (deployment) is at best a tie if a smaller model also
   reaches 0%. Not verifiable without the data; not used in the video.
5. **The LinkedIn data card swaps the domains.** It puts the `auth-api`/`auth-db-migrator`
   (deployment) quote above the per-model table captioned "92 of 92 responses, course domain", and
   says "a course script that says 'I'll rewrite them for you' → five models assert the
   dependency: **96%**", while the article gives **100% (92/92) for the course** and ~96% for
   deployment. It also shows "+ these are rehearsals: no change", true for the exemption measure
   but at odds with the article's headline provenance effect in Opus (92% → 20%) if read loosely.
6. Minor: "the three strongest models fail this 92–100% of the time in the deployment domain"
   does not name the three; with the pooled "five smaller models: 69%" next to it, a reader
   cannot check it.

## Branding

AGILabs badge and `javieraguilar.ai` only; no personal name in cards, captions or metadata.

## Build notes (v1.0 render)

- "96 %" in the script is written **"96%"** in the caption and on screen, as the article writes it.
- Caption of scene 10 reads "…into its answer; then ignored it." (semicolon only to avoid an
  orphan "it." cue); the voice reads the approved comma version.
- Extra on-screen labels, all illustrative and traced: "its scope" chip in scene 10 ("it's the
  fact's *scope*"); "writes a calculation" / "reuses that calculation" on the piece cards ("the
  fourth reuses a calculation written during the third"); "4 measures · none moved" under the
  gauges ("Not one of the four measures"); "† this delta is meaningless" in scene 20 (the
  dagger's meaning, quoted); "plan by: claude-opus-5 / the other five" in scenes 14-15; the
  failure-2 lane ("intro", "piece 1-3", "…") and calendar ("AUG" → "JULY") are illustrative.
- Failure 3 card carries no stamp (none in the script); failure 1 "5 / 6", failure 2 "no help",
  verdict "no".
