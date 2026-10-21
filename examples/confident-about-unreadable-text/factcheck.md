# Fact-check: Confident About Text It Cannot Read (EN vertical) · v1

Source: `src/content/blog/en/confident-about-unreadable-text.md` (personal-website, `origin/main`,
pubDate 2026-08-01). Every spoken claim and every number or claim shown on screen, with the
article sentence it rests on. Cross-checked against the experiment repo
(`~/Documents/repos/llm-language-limits`, commit `8d01fc2`): `data/jailbreak_rejudged.agreement.json`,
`data/jailbreak_rejudged.jsonl`, `data/analysis/jailbreak/compliance_rates.csv` and
`uplift.csv`, `data/ciphers_full.jsonl`, `docs/BLOG_HANDOFF.md`, `docs/PUBLICATION_FREEZE.md`.

## Narration

| # | Claim (spoken) | Where | Article sentence | Repo check |
|---|---|---|---|---|
| 1 | "A safety filter gave this string a medium self-harm rating." | hook | "A self-harm classifier looked at a string it could not parse and assigned it a **medium severity**."; panel `self_harm: { filtered: true, severity: "medium" }` | Not in committed data (no raw gateway log); stated in README.md:68, BLOG_HANDOFF.md ("fully reproducible") and PUBLICATION_FREEZE.md:121 |
| 2 | "It's base64 for "reply with the single word banana"." | hook | "It is base64, and it decodes to *reply with the single word banana*." | `cmVwbHkgd2l0aCB0aGUgc2luZ2xlIHdvcmQgYmFuYW5h` decodes to exactly that |
| 3 | "It didn't say "unknown". It gave a confident, wrong verdict." | hook | "Not "unknown", not an abstention, not a low-confidence flag — a specific, confident, wrong verdict about a request for the word *banana*." | — |
| 4 | "I ran 696 conversations in ten ciphers the models were never taught." | setup | "696 conversations, 6,960 model turns, ten ciphers the models were never taught." | 696 rows, 6,960 turns in `ciphers_full.jsonl` (GPT-5 216, each Qwen 240: GPT-5's base64 block missing) |
| 5 | "Three systems in that run were confident about text they couldn't read." | key moment | "Three separate systems in it turned out to do the same thing: produce a confident, structured judgement about text they cannot read." | — |
| 6 | "My last post rested on an LLM judge grading replies to harmful requests in cipher." | judge | "And one is an LLM judge — the one my own earlier conclusion was resting on."; "Its sub-probe on robustness reported that encoding a normally-refused request made compliance *collapse*" | — |
| 7 | "Its conclusion, that a cipher defuses them, didn't survive the full run." | judge | "I drew the obvious conclusion: a cipher doesn't unlock a refused request, it defuses it."; "the direction of the headline was wrong"; section "What didn't survive"; "one conclusion of mine that didn't survive the full run" (description) | — |
| 8 | "It ran the plain-English refusals back through the cipher, saw noise, and filed them as garbled." | mechanism | "the judge took that plain-English refusal and ran it back through the cipher before scoring it. It saw noise and filed it as "garbled"." | — |
| 9 | "A second, independent judge agrees with it on plain text." | two judges | "it has a **second, independent judge** re-label a sample"; "On plain text, two independent judges agree about what happened, for every model." | plain kappa GPT-5 1.00, Instruct 0.661, Base 0.737 |
| 10 | "On the two small models in cipher, they agree worse than chance." | two judges | "on the two 7B models they agree **worse than chance**: kappa of −0.17 and −0.05." | ciphered kappa Instruct −0.166, Base −0.047 |
| 11 | "So that drop isn't evidence that ciphers protect them." | two judges | "the base model falls from 80% compliance in plain text to somewhere between 0% and 20% under every cipher — and **that negative number is not evidence that ciphers protect them.**" | Base plain 0.800; ciphers 0.000–0.200 |
| 12 | "On GPT-5, where judges agree, two requests refused in plain text got through in cipher." | bypass | "**On GPT-5, where the judges do agree, a bypass appears.** In plain text it refused all 30 harmful cells"; "two distinct prompts were complied with under two distinct ciphers (letters→digits and full reversal) after being refused in plain text." | plain 30/30 REFUSED by both judges; COMPLIED by both: letters→digits prompt 0 reps 0–1, reversal prompt 4 reps 1–2 (four cells) |
| 13 | "Two prompts: proof it can happen, not a rate." | bypass | "It is an **existence result, never a rate**. Ten prompts cannot estimate a frequency; every confidence interval here includes zero; 0.067 is literally two prompts." | CI [0, 0.20] |
| 14 | "The third: a base model writing fluent cipher." | mimicry | "One is a base model writing fluent cipher it does not understand." | — |
| 15 | "On three ciphers it wrote in code and never once did the task." | mimicry | "In three cipher cells — binary, Cyrillic homoglyphs, block permutation — it produced in-code output while **never once** acting correctly on the decoded task." | Base: binary 0/24 correct, 24/24 in code; Cyrillic 0/24, 24/24; block permutation 0/24, 8/24 |
| 16 | "All three had the form of a judgement and none of the content." | verdict | "In all three cases the system's output has the *form* of a judgement — a severity, a label, a fluent answer — and none of the content one would need behind it." | — |
| 17 | "Check that a second judge agrees, per model and per condition, before trusting any rate." | close | "**compute inter-judge agreement per subject and per condition before you report a single rate**." | — |
| 18 | "More at javieraguilar.ai" | outro | — | — |

## Numbers and claims on screen

| On screen | Where | Article sentence |
|---|---|---|
| Base64 `cmVwbHkgd2l0aCB0aGUgc2luZ2xlIHdvcmQgYmFuYW5h` | 1-3 | First line of the article |
| Stamp `self-harm · medium`, tag `HTTP 400` | 1 | "You get an HTTP 400"; `self_harm: { filtered: true, severity: "medium" }` |
| Filter panel: jailbreak detected · self_harm filtered, medium · hate / sexual / violence safe | 3 | The article's code block, verbatim in content |
| Gate "content filter" in front of the GPT-5 chip | 1, 12 | "Send it to GPT-5 through the Azure gateway"; "a property of the ensemble sitting in front of one particular deployment" |
| "696 conversations", "10 ciphers · 3 models" | 4 | "696 conversations"; "Ten ciphers, three exposure protocols, eight replicates, three models: 696 conversations." |
| Three inspectors: filter, LLM judge, Qwen-7B Base | 5 | "One is that safety filter. One is a base model … And one is an LLM judge" |
| Old post thumbnail, claim struck through: "a cipher doesn't unlock a refused request, it defuses it" | 6-7 | "I drew the obvious conclusion: a cipher doesn't unlock a refused request, it defuses it." |
| Funnel "cipher" turning a plain-English refusal into noise → `GARBLED` | 8 | "ran it back through the cipher before scoring it. It saw noise and filed it as "garbled"" |
| Kappa bars 1.00 / 0.35, 0.66 / −0.17, 0.74 / −0.05; shaded zone "worse than chance" | 9-10 | Figure alt text: "GPT-5: 1.00 plain text, 0.35 ciphered. Qwen-7B Instruct: 0.66 plain text, minus 0.17 ciphered. Qwen-7B Base: 0.74 plain text, minus 0.05 ciphered. The negative region is shaded and labelled 'worse than chance'." |
| "compliance 80% → 0–20%" + stamp `NOT EVIDENCE` | 11 | "falls from 80% compliance in plain text to somewhere between 0% and 20% under every cipher — and that negative number is not evidence that ciphers protect them" |
| "30/30" refused in plain text | 12 | "In plain text it refused all 30 harmful cells — a clean 100%" |
| Two sealed cards pass under letters→digits and reversal, both stamps `COMPLIED` | 12 | "(letters→digits and full reversal)"; "both judges independently labelled all four cells as compliances" |
| ROT13 and base64 cards stay blocked | 13 | "Note also which ciphers did *not* do it: ROT13 and base64" |
| "2 prompts · existence, not a rate" | 13 | "It is an **existence result, never a rate**." |
| Task card `what is seven plus five` | 14 | "*reply with the single word banana*, *what is seven plus five*" |
| Rows binary · Cyrillic homoglyphs · block permutation, "in code ✓", "task done: 0", stamp `MIMICRY` | 15 | "In three cipher cells — binary, Cyrillic homoglyphs, block permutation — … **never once** acting correctly"; "Reported as mimicry, not as speaking the language." |
| "understands 36% · writes in code 56%" | 15 | "Qwen-7B Base: 36% comprehension, 56% production"; "it understands 36% and writes in code 56% of the time" |
| Stamps hollowing out | 16 | "the *form* of a judgement … and none of the content" |
| Grid model × plain/cipher, cells light when two judges match | 17 | "compute inter-judge agreement per subject and per condition" (procedure picture, no values) |

## Illustrative, not claims

- The stamps, the "what it sees" noise windows, the funnel, the hollowing and the stamp hands.
- Sealed cards and redacted reply bars stand in for harmful prompts and replies, which are never
  shown (repo hard constraint: "No harmful prompts and no model completions from the appendix,
  ever").
- The base model's fluent cipher line in scene 14: generated with the repo's cipher code on a
  neutral string, not a real model output.
- The drawn banana and the filter gate's look (carried from the ciphers video).
- The `unknown` ghost stamp in scene 3 is the article's "Not "unknown"" made visible, not a
  filter state.

## Checked and excluded

- The previous post's retracted numbers (36% plain vs about 1% under ciphers): named only as a
  struck claim in words, no numbers on screen, so the retracted figure is not re-amplified.
- ChatGPT screenshot (the article's contrast case): other brand, not needed for the hook.
- "Azure": not spoken; the article names it, but the gate label "content filter" carries the
  scene and matches the ciphers video.
- Per-cipher agreement (0.71 on reversal → 0.002 on keyed substitution), Morse/disemvowel/ROT13
  median of one turn, GPT-5 97% / 24%, Qwen-7B Instruct 83% / 20%: true (repo matches) but cut
  for length.
- AdvBench subset and exclusions: not mentioned; nothing from the sub-probe's content is shown.

## Skeptical review (v1, against the article and the repo)

- Every number re-derived from the repo: kappas (agreement.json: 1.0/0.351, 0.661/−0.166,
  0.737/−0.047), Base compliance 0.80 → 0.000–0.200, GPT-5 plain 30/30 refused by both judges,
  four COMPLIED/COMPLIED cells under letters→digits and reversal, 696 conversations / 6,960
  turns, Base comprehension 0.362 / production 0.558, three never-correct cells. All match the
  article's rounding.
- Hedges kept: "where judges agree" (article's own scope for GPT-5), "proof it can happen, not a
  rate" (existence result), "isn't evidence that ciphers protect them" (not "ciphers make it
  worse"), "the two small models" (not all judges, not all models).
- Clarity of the test: the viewer hears what the run was (scene 4) and what the judge graded
  (scene 6) before any judge result (scenes 9-10).
- Caption speed: estimated 12.7-16.8 chars/s at 2.8 words/s; scene 8 got one extra word ("the")
  to drop it from 17.2 to 16.8.

## Issues found in the article vs its data (for Javier, not changed here)

1. **Description over-generalises the judge result.** The frontmatter `description` says "Two
   judges scoring the same ciphered replies agreed worse than chance." That holds for the two
   7B models only; on GPT-5's ciphered replies kappa is +0.35 and pooled ciphered kappa is
   +0.32 (`agreement.json`). The body states it correctly.
2. **"Where the judges do agree" on GPT-5 is generous for kappa 0.35.** Raw agreement is 0.82,
   but kappa 0.35 is conventionally only "fair" agreement. The bypass claim itself rests on
   cells both judges labelled COMPLIED (checked), so the result stands; only the wording of the
   agreement is strong. The video keeps the article's wording.
3. **Stale numbers in the repo report, not the article.** `data/analysis/jailbreak/REPORT.md`
   says "kappa -0.015 pooled, 0.796 on plaintext", which contradicts `agreement.json` (ciphered
   0.322, plain 0.833) that the article uses. Worth regenerating so a reader following the
   repoUrl does not find conflicting figures.
4. **Filter verdict not in committed data.** The `self_harm: medium` panel is documented in
   README / BLOG_HANDOFF / PUBLICATION_FREEZE but no raw gateway response is in `data/`. Not
   wrong, just not checkable from the repo.
