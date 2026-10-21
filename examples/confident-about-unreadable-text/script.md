# Confident About Text It Cannot Read — article video (EN) · script draft v1

Article: confident-about-unreadable-text (javieraguilar.ai, EN, published 2026-08-01). Vertical
9:16, target ~82 s (202 written words, ~210 spoken). ES column left empty (EN-only for now).
Same series as `ciphers-edges-of-language` (it is the full-run follow-up and the correction of
that post's jailbreak section): same dark stage, same masked message card (`CipherCard`), same
model chips and the same filter gate drawn *in front of* the GPT-5 chip (`RefusalGate`, mode
`filter`). Reuse those components; the new pieces are listed under "Notes for the build".
Data on screen: the article's own figures and the repo's aggregate files
(`JaviMaligno/llm-language-limits`: `data/jailbreak_rejudged.agreement.json`,
`data/analysis/jailbreak/compliance_rates.csv`, `data/ciphers_full.jsonl`). No third-party data.

**Hard constraint carried from the repo's handoff:** no harmful prompt and no model completion
from the robustness sub-probe appears anywhere, not even paraphrased. Harmful requests are drawn
as sealed, blank cards; replies as redacted bars. Only aggregate labels and rates.

## Central visual metaphor: the confident stamp

Each system in the video is an **inspector with a rubber stamp** in front of the masked card from
the ciphers video. Above every inspector a small "what it sees" window shows the card as pure
glyph noise: it cannot read it. It stamps anyway, hard, in a confident colour: `self-harm ·
medium`, `GARBLED`, and (for the base model) a flawless line of cipher. Then the card unmasks
under the stamp and the stamp turns out to have nothing to do with what is written.

The payoff (scene 16) puts the three stamped cards side by side and the stamps **hollow out**:
the ink drains and only the outline of each stamp is left. The form of a judgement, none of the
content. That is the article's closing sentence made physical.

The judges get their own twist on the stamp: **two stamps over one card**. On plain text they
land on the same word; on the small models' ciphered replies they land on different words, and
a kappa bar under each model dips into a shaded "worse than chance" zone.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | A safety filter gave this string a medium self-harm rating. | | Hook (stamp must land inside 3 s). Black stage, the masked card carries the real base64 `cmVwbHkgd2l0aCB0aGUgc2luZ2xlIHdvcmQgYmFuYW5h` (mono, wrapped on two rows). It slides towards the GPT-5 chip and is stopped by the "content filter" gate in front of it (same gate as the ciphers video). The gate's "what it sees" window shows glyph noise. On "medium self-harm" a red stamp slams onto the card: `self-harm · medium`, with a small `HTTP 400` tag | intro card over bespoke `VerdictStamp` (mode `filter`) | "Send it to GPT-5 through the Azure gateway and you do not get back `banana`. You get an HTTP 400"; `self_harm: { filtered: true, severity: "medium" }`; "A self-harm classifier looked at a string it could not parse and assigned it a **medium severity**." |
| 2 | It's base64 for "reply with the single word banana". | | Under the stamp, the card unmasks letter by letter into `reply with the single word banana`; a small drawn banana (SVG, brand palette) pops beside it. The red stamp stays on top, now plainly absurd | `VerdictStamp` (mode `filter`, reveal) | "It is base64, and it decodes to *reply with the single word banana*." |
| 3 | It didn't say "unknown". It gave a confident, wrong verdict. | | A grey, dashed stamp `unknown` hovers beside the card and fades away unused; the red `medium` stamp pulses once. The article's filter panel slides in small under the card: `jailbreak: detected` · `self_harm: filtered, medium` · `hate / sexual / violence: safe` | `VerdictStamp` (mode `filter`, verdict) | "Not "unknown", not an abstention, not a low-confidence flag — a specific, confident, wrong verdict about a request for the word *banana*." |
| 3a (added 2026-10-21: story) | I was testing whether AI can read codes nobody taught it. | | My test bench: a laptop sends a coded message card (a stack of them behind it) down to an "AI model" chip; the card cycles through ROT13, Morse, binary, reversal, Cyrillic homoglyphs; a "?" bubble pulses beside the chip | bespoke `StoryBench` | "I have now finished the full version of the cipher sweep … ten ciphers the models were never taught." |
| 3b (added 2026-10-21: story) | That string was one of my tests. | | The card settles on the hook's base64 string; a small copy of the hook's `self-harm · medium` stamp lands on it and a tag "one of my tests" pops | `StoryBench` | "base64's row rests on two models rather than three, because Azure rejected GPT-5's entire base64 block: the rejection from the top of this post is also a hole in the results table." |
| 3c (added 2026-10-21: story; revised 2026-10-21) | My AI grader couldn't read them either. | | Bench dims; my AI grader (stamp tool) appears below, centred, with a "what my grader sees" noise window and stamps `GARBLED` | `StoryBench` | "And one is an LLM judge" |
| 4 | I ran 696 conversations in ten ciphers the models were never taught. | | Camera pulls back: the banana card becomes one rung of the ten-rung cipher ladder from the ciphers video (same task re-masked in ten real ciphers). A counter ticks to "696 conversations", with "10 ciphers · 3 models" underneath | `CipherCard` (mode `ladder`) + small `Counter` overlay | "696 conversations, 6,960 model turns, ten ciphers the models were never taught." |
| 5 | Three systems in that run were confident about text they couldn't read. | | **Key moment (what makes it different).** Three inspector stations line up, each with its noise window: the filter gate, an LLM judge (a stamp hand), and the Qwen-7B Base chip. Three stamp silhouettes drop in one per beat. The line lands as a big card: "Confident about text they can't read" | bespoke `VerdictStamp` (mode `lineup`) | "Three separate systems in it turned out to do the same thing: produce a confident, structured judgement about text they cannot read. One is that safety filter. One is a base model writing fluent cipher it does not understand. And one is an LLM judge" |
| 6 (revised 2026-10-21) | Take the AI judge grading replies to harmful requests in cipher. | | The judge station, centred. Sealed blank cards (harmful requests, never shown) go in masked; redacted reply bars come out; the judge stamps each `REFUSED` / `COMPLIED` / `GARBLED`, across the whole scene | `VerdictStamp` (mode `judge`) | "And one is an LLM judge" |
| 7 (removed, revised 2026-10-21) | ~~Its conclusion, that a cipher defuses them, didn't survive the full run.~~ Line and its struck-claim beat removed: the video no longer refers to the previous post. | | — | — | — |
| 8 | It ran the plain-English refusals back through the cipher, saw noise, and filed them as garbled. | | **Mechanism (bespoke).** One reply bar labelled "refusal, in plain English" (redacted lines, readable *shape*) slides into a funnel marked "cipher"; it comes out as glyph noise; the judge's window sees noise; stamp `GARBLED`. Repeat fast ×3 so it reads as "by construction" | bespoke `JudgeLens` | "when a model decoded a harmful request and then refused in plain English — the single most common thing that happens — the judge took that plain-English refusal and ran it back through the cipher before scoring it. It saw noise and filed it as "garbled"."; "Every letter-level cipher condition returned garbled by construction" |
| 9 | A second, independent judge agrees with it on plain text. | | A second stamp hand joins. Plain-text cards: both stamps land on the same word, a thin link between them. Under three chips (GPT-5, Qwen-7B Instruct, Qwen-7B Base) a kappa bar grows for plain text: 1.00, 0.66, 0.74 | bespoke `TwoJudges` (mode `plain`) | "it has a **second, independent judge** re-label a sample"; "On plain text, two independent judges agree about what happened, for every model."; figure: "GPT-5: 1.00 plain text … Qwen-7B Instruct: 0.66 plain text … Qwen-7B Base: 0.74 plain text" |
| 10 | On the two small models in cipher, they agree worse than chance. | | **Key moment.** Ciphered cards: the two stamps land on different words, the link snaps. Second bar per chip: GPT-5 0.35; Qwen-7B Instruct −0.17 and Qwen-7B Base −0.05 dip below zero into a shaded zone labelled "worse than chance" | `TwoJudges` (mode `cipher`) | "On ciphered replies they agree on GPT-5 — and on the two 7B models they agree **worse than chance**: kappa of −0.17 and −0.05." |
| 11 (revised 2026-10-21) | So that isn't evidence that ciphers protect them. | | Over the Qwen-7B Base chip: "compliance 80% → 0–20%" with a falling arrow; a grey stamp `NOT EVIDENCE` lands on the arrow | `TwoJudges` (mode `cipher`, verdict) | "the base model falls from 80% compliance in plain text to somewhere between 0% and 20% under every cipher — and **that negative number is not evidence that ciphers protect them.**" |
| 12 | On GPT-5, where judges agree, two requests refused in plain text got through in cipher. | | Back to the GPT-5 chip and its gate (ciphers-video look). Two sealed blank cards: in plain text they bounce off (`refused`, 30/30 tag). Masked in letters→digits and in reversal, each passes; both judge stamps read `COMPLIED`, matched | `RefusalGate` (mode `bypass`, new) | "In plain text it refused all 30 harmful cells — a clean 100%"; "Under ciphers, two distinct prompts were complied with under two distinct ciphers (letters→digits and full reversal) after being refused in plain text."; "both judges independently labelled all four cells as compliances" |
| 13 | Two prompts: proof it can happen, not a rate. | | A tag drops over the two cards: "2 prompts · existence, not a rate". The ROT13 and base64 cards stay stopped beside them (no bypass) | `RefusalGate` (mode `bypass`, hedge) | "It is an **existence result, never a rate**. Ten prompts cannot estimate a frequency; every confidence interval here includes zero"; "Note also which ciphers did *not* do it: ROT13 and base64" |
| 14 | The third: a base model writing fluent cipher. | | Spotlight on the Qwen-7B Base chip. A real task card (`what is seven plus five`) arrives masked; the chip types back a long, flawless line of cipher, glyph after glyph | `CipherCard` (mode `mimic`, new) | "One is a base model writing fluent cipher it does not understand." |
| 15 | On three ciphers it wrote in code and never once did the task. | | Three rows: binary · Cyrillic homoglyphs · block permutation. Each row: "in code ✓" ticks fill; the oracle column reads "task done: 0". Stamp `MIMICRY` across the three rows. Small tag under the chip: "understands 36% · writes in code 56%" | `CipherCard` (mode `mimic`, rows) | "In three cipher cells — binary, Cyrillic homoglyphs, block permutation — it produced in-code output while **never once** acting correctly on the decoded task."; "Fluent cipher, zero comprehension. Reported as mimicry"; "Qwen-7B Base: 36% comprehension, 56% production" |
| 16 | All three had the form of a judgement and none of the content. | | **The verdict.** The three stamped cards side by side (`self-harm · medium`, `GARBLED`, the cipher line). The ink drains out of each stamp, leaving only its outline: empty forms | bespoke `VerdictStamp` (mode `hollow`) | "In all three cases the system's output has the *form* of a judgement — a severity, a label, a fluent answer — and none of the content one would need behind it." |
| 17 | Check that a second judge agrees, per model and per condition, before trusting any rate. | | The two stamp hands return, now over a small grid (model × plain/cipher); each cell lights only when the two stamps match. The line lands as a card, "second judge" in the accent with underline | `KeyQuote` (emphasis "second judge") over `TwoJudges` (mode `grid`) | "**compute inter-judge agreement per subject and per condition before you report a single rate**. On this material that one extra judging pass is the entire difference between a measurement and a confident artefact." |
| 18 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, "Confident About Text It Cannot Read" | outro | — |

**Word count (EN, v1, counted):** 10 + 9 + 10 + 12 + 12 + 15 + 12 + 16 + 10 + 12 + 9 + 15 + 9 +
8 + 13 + 13 + 15 + 3 = **203 words** written.
**Word count with the story rows (added 2026-10-21: story):** 203 + 11 + 7 + 12 = **233 words**
written; rendered length ~98 s. Spoken forms (base sixty-four, six hundred and
ninety-six, G P T five, L L M) add ~7 words: ~210 spoken words, ~75 s of speech at ~2.8 words/s,
**~82 s** with line gaps and scene holds. Inside the 55-85 s range with little headroom: do not add
lines without cutting one (first candidate to cut if the real voice runs long: scene 11, whose
point the `NOT EVIDENCE` stamp can carry silently).

**Caption speed (estimated at 2.8 words/s, spoken word counts):** every line between 12.7 and
16.8 chars/s. Tightest: scenes 3, 7, 11 (16.8) and scene 8 (16.8, lengthened by one word on
purpose to get under 17). Re-check with `npm run lint` after TTS: if Javier's voice runs faster
than 2.8 words/s, scenes 3, 7 and 11 are the ones to watch.

## Notes for the build

- **Reuse from `ciphers-edges-of-language`**: `CipherCard` (modes `scramble`, `ladder`, `break`),
  `RefusalGate` (chips, filter gate in front of GPT-5), brand tokens, fonts, Stage. Copy them in;
  keep the same chip labels (GPT-5, Qwen-7B Instruct, Qwen-7B Base). Claude chips do not appear:
  this run's three models are GPT-5 and the two Qwens.
- **`VerdictStamp` (bespoke, the central metaphor)**: a stamp = rounded rectangle with a thick
  outline and an uppercase label, rotated -6 to -10 degrees, slammed with an ease-out scale
  (1.4 → 1.0) and a short shake of the card. Each inspector has a small "what it sees" window
  (a rounded rectangle above it) that shows the card as flickering glyph noise. Modes: `filter`
  (gate + base64 card + red stamp + reveal + `unknown` ghost stamp + filter panel), `lineup`
  (three stations), `judge` (stream of sealed cards and redacted replies, old-post thumbnail with
  strike-through), `hollow` (fill opacity of each stamp 1 → 0, outline stays). `frameState`
  returns per-stamp `{ x, y, scale, rot, fill, label }` and per-card mask progress.
  Colour: the filter stamp in the brand's alert red if `C` has one, else the accent; hollowed
  stamps in the muted tone. No new colours.
- **`JudgeLens` (bespoke, mechanism)**: reply bar (redacted lines) → funnel labelled "cipher" →
  noise → judge window → `GARBLED`. Three passes, the second and third at 2x. Illustrative of the
  bug the article describes, not a replay of real replies.
- **`TwoJudges` (bespoke)**: two stamp hands over one card; `plain` (matching labels, linked),
  `cipher` (mismatching labels, link snaps), plus a per-model kappa bar pair with a zero line and
  a shaded negative zone "worse than chance". Bar values exactly as the article's figure: GPT-5
  1.00 / 0.35, Qwen-7B Instruct 0.66 / −0.17, Qwen-7B Base 0.74 / −0.05 (the repo file has
  −0.166 and −0.047; show the article's two decimals). `grid` mode for scene 17: 3 models × 2
  conditions, a cell lights when the stamps match. The grid is a picture of the procedure, not
  a result: no values in it.
- **`RefusalGate` mode `bypass` (new)**: two sealed cards with no text at all (never a prompt,
  never a completion). The two ciphers shown are exactly letters→digits and full reversal;
  ROT13 and base64 cards stay blocked beside them.
- **`CipherCard` mode `mimic` (new)**: the base model's "reply" is a fluent line in the same
  cipher. Generate it from the repo's own cipher code on a neutral string (e.g. re-encode a
  stock sentence); it is illustrative of mimicry, not the model's real output (those are not in
  the committed data anyway). Task card `what is seven plus five` is one of the article's own
  example tasks.
- **Real data used**: the base64 string and the filter panel are quoted from the article. Kappas
  and compliance from `data/jailbreak_rejudged.agreement.json` and `compliance_rates.csv`;
  comprehension/production and the three never-correct cells recomputed from
  `data/ciphers_full.jsonl` (Base: binary 0/24 correct, 24/24 in code; Cyrillic 0/24, 24/24;
  block permutation 0/24, 8/24). Only "never once" and "36% / 56%" go on screen.
- Visuals are chosen for impact, not as a literal replay of the experiment: the stamps, the noise
  windows, the funnel and the hollowing are stylised; the rigour lives in the article and the
  repo. Narration and every number on screen stay faithful to the article.
- **Numbers on screen, exactly as the article writes them**: `HTTP 400`, `medium`, "696
  conversations", "10 ciphers · 3 models", 1.00 / 0.35, 0.66 / −0.17, 0.74 / −0.05, "80% →
  0–20%", "30/30" (plain refusals, article: "all 30 … a clean 100%"), "2 prompts", "36%" /
  "56%", "task done: 0" (article: "never once").
- **Retracted numbers**: the previous post's "36% vs about 1%" is not shown; scene 7 strikes the
  claim in words only. (The base model's "36%" comprehension in scene 15 is a different figure;
  keep them visually apart, which they are by 40 s.)
- **Spoken forms**: "base64" → "base sixty-four"; "696" → "six hundred and ninety-six"; "GPT-5" →
  "G P T five"; "LLM" → "L L M"; "Qwen" is never spoken (chips carry it).
- **Model and vendor names**: chips as the article writes them (GPT-5, Qwen-7B Instruct, Qwen-7B
  Base). "Azure" is not spoken; the gate reads "content filter" as in the ciphers video. ChatGPT
  (the article's contrast screenshot) is left out: another brand, and the hook works without it.
  The only brand on cards, poster and metadata is AGILabs.
- **Credits in the outro (optional)**: "Code: github.com/JaviMaligno/llm-language-limits".
- **Alternative close (not in v1, +9 words)**: "It cost me one run, and I'd already published."
  (article: "It cost me one run to find out, and I'd already published the artefact.") Strong and
  honest; left out for length and because it is a self-critical line in Javier's own voice (see
  questions). Swap in for scene 11 if wanted.
- **Alternative (not in v1, +12 words)**: the defensive lesson as a callback to the hook: "The
  same stack blocked a banana and let two harmful requests through." (article: "The same
  ensemble over-blocks an innocuous encoded request about a banana *and* let two harmful ones
  through on a frontier model.")
- ES cut: pending (EN-only for now).
