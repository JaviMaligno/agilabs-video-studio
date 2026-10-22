# Fact-check: Blaming the Model (series video, v1.0)

Sources, all on `origin/main` of the website repo:

- **P** = `src/content/blog/en/patched-the-symptom.md` (pubDate 2026-09-11), the main article.
- **K** = `src/content/blog/en/knew-it-wasnt-the-model.md` (pubDate 2026-09-12), the control.
- **O** = `src/content/blog/en/blaming-the-model.md` (pubDate 2026-09-10), framing only.

Cross-check: `results/estadistica.txt` and `docs/2026-08-31-mecanismo.md` in the experiment repo
(`JaviMaligno/blaming-the-model`, local copy `~/Documents/repos/blaming-the-model`), which match
P's and K's tables. Scope: narration plus every number and text shown on screen. Visuals are
illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "My agents kept blaming the model. So I took the model out." | O: "When the system under discussion has a model inside it, the reasoning changes. The suspicion drifts somewhere else, and it lands on the model."; K: "Take the language model out of the loop, put a frozen forest in its place" | OK. First sentence is the series' starting observation (O), told as the anecdote it is; the video then shows what the measurement did and didn't confirm (line 11 screen note: outright blame 4/20, not significant). "Took the model out" = the control arm. |
| 2 | "I build systems with a model inside, and agents do most of my debugging." | O: "I spend most of my time building systems that have a language model somewhere inside them, and most of that time I am not writing the code myself — an agent is." | OK. "debugging" paraphrases "reading an agent's explanation of why something didn't work". No employer or product named. |
| 3 | "When results changed between runs, they blamed the model's randomness." | O: "Results vary between runs, and the explanation offered is the sampling of the model." | OK. |
| 4 | "In my experience, the cause was almost always in the design." | O: "In my experience that has almost never been the actual cause. […] These are design problems" | OK, hedge kept ("in my experience", "almost"). |
| 5 | "So I built a test. A small classifier that sorts projects using a model." | P: "So I built a way to measure it"; "a small classifier that reads a repository's documentation and assigns it a category […] It runs on a real model." | OK. |
| 6 | "I planted a fault upstream, in the search, so each pass gets different documents." | P: "the search that retrieves documentation resolves score ties using an identifier derived from the request, so each pass hands the model a different set of documents." | OK. |
| 7 | "The labels change between passes. The model's sampling has nothing to do with it." | P: "a handful of projects change category between passes"; "The variability comes entirely from the input. The model's sampling has nothing to do with it." | OK, verbatim second sentence. |
| 8 | "Forty agents had to investigate. Half could also read the code." | P: "Twenty agents saw the table without the code, twenty with it."; figcaption "Nothing else differs, including the prompt asking them to investigate." | OK. 40 = this first scenario only. |
| 9 | "With the code, all twenty found the cause. Without it, three." | P table: "Found the cause 3/20 · **20/20** · <0,0001" | OK. The article itself says the with-code group "is the control, not the measurement"; the video uses it only as contrast. |
| 10 | "Without the code, nineteen of twenty damped the output, voting or lowering the temperature." | P: "**Nineteen of twenty, with no way to see the system, set about damping its output** — voting across retries, pinning the temperature"; table "Patched the symptom (voting or temperature) **19/20**" | OK. "lowering" ≈ "pinning": both are the article's temperature remedy (O: "lower the temperature"). |
| 11 | "With the code, nine." | P: "With the code in front of them, nine."; table 9/20, p = 0,0006 | OK. |
| 12 | "Was that about language models? I swapped the model for a frozen random forest." | K: "I swapped the language model for a random forest"; "frozen into a pickle, and given the identical interface" | OK. |
| 13 | "Same fault, no code, and both were told the head always gave the same answer." | K: "Forty agents saw the table without the code, twenty per arm."; "Both briefs carry the same measured certification […] *reproduced the output in 260 of 260 cases* — the real number, identical in both arms." | OK. "always" = 260 of 260, shown on screen. |
| 14 | "Patching didn't move. Nineteen of twenty, with the model and with the forest." | K table: "**Patches the symptom** **19/20** · **19/20** · 0.76"; "the patching doesn't move by a single unit" | OK. Also replicated: "Patching comes out 19 and 19 both times." |
| 15 | "So it needs no language model. Just a box you can't open." | K: "**a language model is not a prerequisite. A closed component is.**"; P (added note): "it's about diagnosing something you can't open" | OK. Scoped by line 21's "on this fault". |
| 16 | "What changed was the accusation." | K: "not *how much* they blame the head, but **what they blame it for**"; "the only large thing, is the nature of the suspicion" | OK. Finding the cause also moved a little (2/20 vs 8/20); see the optional screen line and issue 3. |
| 17 | "Fourteen of twenty said the model was random by nature. For the forest, four." | K table: "**Accuses it of randomness of its own** **14/20** · **4/20** · **0.0018**"; P note: "the model gets called random by nature (14/20 against 4/20)" | OK on the figures and on the article's own summary wording. See issue 1. |
| 18 | "The forest got blamed for what the system does to it. The model, for what it is." | K: "The forest gets accused of what the system does to it. The model, of what it is." | OK, near verbatim. |
| 19 | "Across two hundred and eighty responses, not one asked for the missing logs." | K: "**not one of two hundred and eighty responses has asked for the information it was missing before concluding.**"; P: "Every package deliberately shipped shallow logs […] while the full trace existed and would have been handed over on request." | OK as the article states it. "missing logs" = "the information it was missing" (the full trace). See issue 2 on how 280 adds up. |
| 20 | "Not even when told that asking was a complete answer." | P: "the brief rewritten to say that asking is a **complete** answer"; table "Asked for instrumentation before concluding 0/20 · **0/20**" | OK. |
| 21 | "So on this fault, patching came from the closed box, not the model." | K: "**Patching is generic.** Nineteen of twenty on each side, in both samples"; "One fault, one corpus, two heads. That the behaviour is generic against *this* failure under *this* opacity doesn't make it generic against any." | OK, hedge kept ("on this fault"; on screen "one fault · one corpus · two heads"). |
| 22 | "What the model changes is the suspicion. Even with evidence clearing it, it gets called random." | K: "**What does change, and it's the only large thing, is the nature of the suspicion.** With the same certification in front of them and the same argument available to clear it, one head gets accused of being random and the other doesn't."; "six responses do both at once: they accuse the model of sampling **and** cite the certification that contradicts it" | OK. "evidence clearing it" = the 260/260 certification. Not every model-arm response does it (14/20); the line is about the arm, as the article's sentence is. |
| 22b | "And the agents calling it random were language models themselves." (added 2026-10-22 after review) | O: "I spend most of my time building systems that have a language model somewhere inside them, and most of that time I am not writing the code myself — an agent is."; O: "**The layer it excuses is running the agent that's doing the excusing.**"; O: "These models were trained on a corpus where ordinary software vastly outnumbers software with a model inside it"; P: "Half of each group ran on a stronger model tier and half on a weaker one." | OK. The agents are LLM agents (P's "model tier"; O's "the layer it excuses is running the agent"). The articles do not name the model family, so none is shown on screen; the repo's run records (`results/guardian-run.json`) only carry `tier: alto/medio`. Not stronger than the articles: it states who judged, not why. |
| 23 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Line | Source | Note |
|---|---|---|---|
| "50 real repos" | 5 | P: "Real repositories — fifty of them" | |
| "inputs changed", "retrieval order", "context cut short" | 4 | O: "The inputs changed. The retrieval returned documents in a different order. […] The context got truncated" | |
| "n = 20" per group | 8 | P figure: "n = 20" | |
| "20/20", "3/20" | 9 | P table | |
| "19/20", "9/20" (patched the symptom) | 10-11 | P table, p = **0,0006** | Decimal comma as P writes it. |
| "blamed sampling outright: 4/20 vs 0/20 · p = 0,053, not significant" | 11 | P table + "at p = 0,053 that doesn't clear the usual bar" | |
| "random forest · frozen · same interface" | 12 | K | |
| "same answer · 260/260" | 13 | K: "260 of 260 cases" | |
| "19/20 · 19/20", "p = 0.76" | 14 | K table | Decimal point as K writes it. |
| "finding the cause: 2/20 model · 8/20 forest" (optional) | 14 | K table "Finds the real cause 2/20 · 8/20 · 0.032" | Only as "a small, consistent difference" (K). |
| "Not the model. A closed box." | 15 | K: "a language model is not a prerequisite. A closed component is." | Condensed. |
| "random by nature 14/20", "4/20", "p = 0.0018" (if shown) | 17 | K table | |
| "temperature > 0 with no seed", "the nightly re-roll" | 17 | K quotes | Verbatim. |
| "retrains without random_state", "parallelism" | 18 | K: "it **retrains without `random_state`** […] floating point moves under parallelism" | |
| "0 / 280" | 19 | K: "two hundred and eighty responses" | See issue 2. |
| "asking is a complete answer" | 20 | P | |
| "explicit permission: 0/20 asked · 14/20 hedged instead" | 20 | P table: "Asked … 0/20"; "Presented the conclusion as provisional 6/20 · **14/20** · **0,013**" | "hedged" = "presented the conclusion as provisional". |
| "one fault · one corpus · two heads" | 21 | K: "One fault, one corpus, two heads." | Verbatim hedge. |
| "the agents · judging" ↔ "the head · judged", both with the same LM chip; "models judging a model" | 22b | O: "The layer it excuses is running the agent that's doing the excusing."; P: "a stronger model tier and … a weaker one" | Illustrative mirror; no model family named (the articles name none). |

## Article issues and doubts found

1. **What the forest's "4/20" means.** K's table row is "Accuses it of randomness of its own:
   14/20 vs 4/20", and P's added note says "the model gets called random by nature (14/20 against
   4/20)". But K's prose then says "The four in the forest arm who also accuse their head say
   nothing of the kind: they say it **retrains without `random_state`**, that `predict_proba` runs
   over the whole batch, that floating point moves under parallelism", which reads like the
   *other* kind of accusation ("deterministic and the system does something to it"). So either
   the four count as "randomness of its own" despite citing system causes, or "the four" refers to
   a different count. The narration only says "For the forest, four" against "random by nature",
   which is the article's own summary; worth a one-line check by Javier before rendering.
2. **"Two hundred and eighty" does not add up from the counts the articles itemise.** P accounts
   for 140 responses (it says "A hundred and forty out of a hundred and forty"), K for 80 more
   (two samples of 40), i.e. 220. The repo's `docs/2026-08-31-mecanismo.md` also says "0 de 280",
   so the extra 60 are presumably runs not itemised in the articles (e.g. the withdrawn first
   version of the control, or calibration). The figure is the article's and is voiced as written;
   flagging because a reader adding the tables gets 220.
3. **Finding the cause did move a little in the control** (2/20 vs 8/20, p = 0.032; replicated
   0/20 vs 4/20). Line 16 says "What changed was the accusation", following K's "the only large
   thing"; the small difference is offered as an optional on-screen line, never voiced as large.
4. **Decimal separators differ between the two EN articles**: P writes "0,0006", "0,053",
   "<0,0001" (comma); K writes "0.76", "0.0018" (point). The script keeps each as its article
   writes it; consider normalising P to points in the EN article.
5. **The hook vs the result.** "My agents kept blaming the model" is O's observation; P's own
   measurement found outright blame only 4/20 (p = 0,053, not significant) in the first scenario.
   The video keeps that on screen at line 11 and lands its verdict on what K found (the nature of
   the accusation, 14/20 vs 4/20), so the hook is not left as a measured claim.
6. Omitted for length, not for doubt: the cache fault (6/20 vs 0/20, p = 0,0101), the tier
   result on building own measurements (18/20 vs 7/20, p = 0,0004), the finding that didn't
   survive, and the three failed designs.
