# The Instrument Fails in Your Favour — article video (EN) · script draft v1.0

Article: the-instrument-fails-in-your-favour (javieraguilar.ai, EN, `pubDate` 2026-09-04; read
from `origin/main` of personal-website). Vertical 9:16, target ~82 s (ceiling 85 s), 211 counted
words (~216 as spoken). ES column left empty (EN-only for now).

Data on screen: the article's own numbers (cross-checked against the four source articles it
links, and the CooperBench fork's commit log for the eval bugs; see `factcheck.md`). Message
chips, company names and code labels are illustrative and anonymised.

## Central visual metaphor: the rigged gauge

Every instrument is drawn as the same **analog gauge**: a round dial with a needle, a value
readout under it and, on the dial face, a soft glowing arc labelled **"what I expected"**. Behind
the face sits a small **magnet** (the bug), invisible at first, that tugs the needle into that arc.
The needle never jitters randomly: it *leans*.

"Going and looking" is always the same gesture: a magnifier slides over the gauge, the dial face
lifts like a lid, the magnet is exposed (accent glow) and plucked out, and the needle swings to
the true reading. Three cases, three gauges, same gesture each time, so by the third the viewer
reads it without help.

The mechanism (bespoke, scenes 16-19) turns the gauge into a **conveyor**: results arrive one by
one. Readings inside the "expected" arc get a green **DONE** stamp and slide onto a shelf, magnet
and all (the viewer sees the faint magnet glow through the face; I don't). Readings outside the
arc drop under the magnifier, the magnet is found and removed. At the end, the shelf holds a row
of DONE gauges whose hidden magnets all pull the same way. That row is the payoff: the bugs that
survive are the ones that agreed with me.

| # | Narration (EN, caption text) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | Every instrument I built broke at least once. | | **Cold open, 0-3 s:** dark stage, one gauge fills the stage, needle idling. On "broke" a hairline crack runs across its glass. | bespoke: `RiggedGauge` (mode `hook`) | "In those three studies, every instrument I built broke at least once." |
| 2 | And every break pointed toward the result I was expecting. | | The glowing "what I expected" arc fades in on the dial; the needle is dragged into it and sticks. Pull back: four more cracked gauges slide in beside it, every needle leaning into its own arc, all to the same side. | `RiggedGauge` (mode `hook`, row) | "Every break pointed toward the result I was already expecting." |
| 3 | To test AI agents, I write tools that score them. | | The row collapses back to one gauge; its readout card is labelled by what it is: small tags around it "detector", "scorer", "answer key" pop in one per beat, wired to a stack of agent transcripts on the left. | `RiggedGauge` (mode `setup`) | "I agree with it, I keep giving it, and it is what I did in three separate studies this year."; "I wrote a lexical detector for it."; "The scorer in the same study"; "a reference set" |
| 4 | The thing you measure with is unverified software too. | | **Key moment (what makes the subject different).** The gauge turns around: its back is a block of code with no tests. A big stamp lands over it: **UNVERIFIED SOFTWARE TOO**. Hold ~0.5 s. | `RiggedGauge` (mode `stamp`) | "**the thing you measure with is unverified software too.**" |
| 5 | One detector looked for agents saying: wait, I'm in that file. | | **Case 1** (corner tag "1 · a word detector"). Two agent panes; a bubble "wait, I'm in that file" travels between them, answered by "go ahead". A net labelled `/wait\|hold\|go ahead/` is cast over a scrolling feed of messages. | bespoke: `WordNet` | "the mutual-exclusion protocol: one session says *wait, I'm in that file*, the other says *go ahead*. I wrote a lexical detector for it." |
| 6 | It found 19, and only 5 closed. That fit my story. | | The net hauls in **19** message chips, each with a keyword lit; 5 get a "closed" tick. The case-1 gauge reads "closed 5 / 19", needle inside the "expected" arc labelled "agents don't finish". | `WordNet` + `RiggedGauge` | "It found 19 candidate sequences of which only 5 closed"; "the protocol **opens far more often than it closes**. Agents start coordinating and don't finish. It was a good line and it fitted the story I was telling" |
| 7 | Counted by hand: 3 real requests, all 3 closed. | | The magnifier sweeps the 19 chips: 16 grey out and drop away (tags "mention", "not a request"); 3 stay, each with a tick. Gauge lid lifts, magnet plucked, needle swings to "3 / 3". | `WordNet` (mode `recount`) + `RiggedGauge` (mode `reveal`) | "Recounted over the coded categories, there are **3** real wait requests, and **all 3 close**. The other 16 were false positives" |
| 8 | It had counted every "wait", even just mentions. | | Zoom on two of the greyed chips: illustrative mentions with the keyword underlined, e.g. "I'll *wait* for CI before merging", "they said *go ahead* yesterday". | `WordNet` (mode `mentions`) | "anything containing *wait*, *hold* or *go ahead* walked in, including messages that were not requests at all"; "A lexical rule cannot distinguish a request from a mention of a request, so it counted mentions" |
| 9 | A benchmark I inherited scored every merge conflict as a fail. | | **Case 2** (tag "2 · an inherited benchmark"). Two patch strips from two agents slide into one file; where they overlap, a conflict marker sparks and a red **FAIL** stamp hits the pair. Counter in the corner: "29 conflicted pairs". | bespoke: `MergeStrips` | "my first table scored **every** merge conflict as an instant fail"; "Triaging all 29 conflicted pairs by hand" |
| 10 | That pushed the number toward my thesis. | | The case-2 gauge: needle leaning into the arc labelled "two agents at once fail". | `RiggedGauge` | "merge conflicts are the characteristic death of two agents working concurrently, which is the condition my article was arguing against. The missing step pushed the number in the direction of my thesis." |
| 11 | Fixing it moved one task. It didn't change the conclusion. | | Magnet plucked (label "missing conflict resolver"). Many conflict sparks heal (about half, tagged "trivial: same import line"), but almost none turn to PASS. Readout: "7% → 7%" (weaker model) and "7% → 9%" (stronger model), chip "+1 task". The needle barely moves and stays in the arc: **CONCLUSION HELD** in small caps. | `MergeStrips` (mode `resolve`) + `RiggedGauge` (mode `reveal`, small move) | "roughly **half the conflicts aren't real logic collisions**"; "It rescued plenty of merges and almost none of them became passes: 7% for the weak model (unchanged) and 9% for the strong one, up from 7%. One extra task."; "**Fixing the instrument did not change the conclusion.**" |
| 12 | An external report scored a client's classifier at 54%. | | **Case 3** (tag "3 · the reference"). A report card: "accuracy **54%** · 500 companies". The case-3 gauge points low. | bespoke: `AnswerKey` + `RiggedGauge` | "An external report scored a client's industry classification service at **54% accuracy over 500 companies**" |
| 13 | Its answer key could be guessed from the company name alone. | | The answer key unrolls as rows "company → label", fictional names: "Northgate **Logistics** → Transport", "Brightfield **Solar** → Energy", "JRK Holdings → General services". The giveaway word in each name lights up and an arrow jumps straight from it to the label, skipping the company. | `AnswerKey` (mode `name-tell`) | "**the gold labels could be guessed from the company name alone**, without looking at the company. If the name contained *logistics*, transport. If it contained *solar*, energy. If it was an acronym or a surname, some generic services bucket." |
| 14 | The comparator had three flaws, and all three could only subtract. | | Lid lifts on the case-3 gauge: three magnets, not one, labelled "order-sensitive", "blind to compatible codes", "all-or-nothing". Each one lands on the low side with a "−" badge; no magnet on the other side. | `RiggedGauge` (mode `reveal`, three magnets) | "The comparator was **order-sensitive** […], **blind to compatibility** […], and **binary**"; "Three independent defects, and **all three could only subtract points**." |
| 15 | Checked case by case: 75%, up to 85%. | | Magnets out; the needle swings up and settles on a shaded band "75%-85%", a bracket from 54% labelled "~20 points". | `RiggedGauge` (mode `reveal`, band) | "Redone by hand, case by case, the defensible number was **75% on a conservative reading and up to 85% resolving the grey zones favourably**. Around twenty points above the report." |
| 16 | Random bugs would point both ways. These didn't. | | The three opened gauges line up; ghost needles fan out symmetrically ("random") then snap to the real ones, all leaning the same way. | bespoke: `StoppingRule` (mode `compare`) | "The direction is the part that needs explaining, because random bugs would have gone both ways." |
| 17 | When the number confirms, I stop looking. That bug survives. | | **Mechanism.** A conveyor: gauges arrive one per beat. One reading inside the arc gets a green **DONE** stamp and slides onto a shelf; its magnet still glows faintly through the face. | `StoppingRule` (mode `confirm`) | "**you stop looking when the number confirms.** A result that matches your expectation ends the investigation, so a bug that produces one is never encountered." |
| 18 | When it contradicts, I dig, and the bug gets found. | | The next gauge reads outside the arc: it drops under the magnifier, its magnet is pulled out and binned. Two more cycles run faster; the shelf fills with DONE gauges, every hidden magnet on the same side. | `StoppingRule` (mode `contradict`) | "A result that contradicts it starts an investigation, and that investigation finds whatever bug is there." |
| 19 | The instrument isn't biased. My stopping rule is. | | **Key moment (the verdict on the mechanism).** Freeze on the shelf. Big line: **"The instrument isn't biased. My stopping rule is."**, "stopping rule" in the accent with an underline. Hold ~0.6 s. | `KeyQuote` over `StoppingRule` still | "The instrument isn't biased. Your stopping rule is, and it filters which defects you ever meet." |
| 20 | So go and look at the thing itself, hardest where the result pleased you. | | The magnifier walks along the DONE shelf (not the reject bin) and lifts the first lid: a magnet. | `StoppingRule` (mode `audit`) | "**Go and look at the thing itself, not at what your tool says about it.**"; "**Audit hardest where the result pleased you.**" |
| 21 | Measure it, but trust the measurement the least. | | **Closing card.** The gauge alone, centred, glass cracked; text: **"Measure it. Trust the measurement least."** | `KeyQuote` | "**measure it, and treat the measurement as the least trustworthy component in the system, because it is the only one nothing is checking.**" |
| 22 | It's the only part nothing is checking. | | Around the gauge, other boxes of a system appear with small badges ("tests", "review", "monitoring", "users"); the gauge alone has none. | `KeyQuote` (part 2) | "Everything else in your stack has tests, review, monitoring, and users who complain. Your eval harness has a number that looked plausible and a person who wanted it to be true." |
| 23 | More at javieraguilar.ai. | | Outro card: AGILabs badge, javieraguilar.ai, "The Instrument Fails in Your Favour". | outro | — |

**Word count (EN): 211** (8 + 10 + 10 + 9 + 11 + 11 + 9 + 8 + 11 + 7 + 10 + 9 + 11 + 11 + 8 + 8 +
10 + 10 + 8 + 14 + 8 + 7 + 3, counting "54%" etc. as one word). As spoken ("nineteen",
"fifty-four percent", "seventy-five percent, up to eighty-five", URL expanded) ~216 words: ~77 s
of speech at ~2.8 words/s, **~82 s with scene gaps and the two holds** (scenes 4 and 19). Set
`targetSeconds: 82`.

If the render runs past 85 s, cut in this order (never scenes 2, 4, 7, 11, 14, 19, 21):
1. Scene 8 → silent: the mention chips carry it (−8 words).
2. Scene 3 → "I score AI agents with tools I write." (−2).
3. Scene 20 → "Go and look, hardest where the result pleased you." (−5).

## Notes for the build

- **`RiggedGauge` (bespoke, the central stage)**: dial ~620 px wide in the stage, needle, readout
  under it, an accent "what I expected" arc whose label changes per case ("agents don't finish",
  "two agents at once fail"; case 3 has no expectation label, only the "−" magnets, see
  factcheck). Modes: `hook` (crack + lean, then a row of 5 cracked gauges), `setup` (tags),
  `stamp`, `reveal` (lid lifts, magnet(s) out, needle swings to `to`). Props per case: `from`,
  `to`, `readout` strings exactly as in the factcheck table. `frameState` returns needle angle,
  lid lift 0-1, magnet positions and opacities; test that the needle never leaves [min, max] and
  that the lid is closed before its beat.
- **Why five gauges in scene 2**: the article's own count is "Five instruments across three
  studies". It is illustrative (the article does not list five one-to-one; see factcheck), so the
  row has no labels.
- **`WordNet` (bespoke)**: 19 chips in a 4-5 column grid, 5 with a "closed" tick, then the
  recount: 16 grey out, 3 stay with ticks. Chip texts are illustrative paraphrases (the corpus is
  private work material); never the real messages. Keywords underlined: wait / hold / go ahead.
- **`MergeStrips` (bespoke)**: two coloured patch strips into one file, conflict sparks, FAIL
  stamps; on `resolve` about half the sparks heal (illustration of "roughly half"), PASS appears
  on one extra pair only. Readouts "7% → 7%" and "7% → 9%" with small labels "weaker model" /
  "stronger model" (the article's "weak" / "strong"; no model names needed).
- **`AnswerKey` (bespoke)**: three to four rows of fictional company names; the real 500 are a
  client's data and never appear. Names chosen so the giveaway word is the article's own example
  (logistics → transport, solar → energy, acronym → generic services).
- **`StoppingRule` (bespoke, mechanism)**: conveyor left → right, a fork after the gauge reading:
  up to the DONE shelf if the needle is in the arc, down to the magnifier if not. Illustrative of
  the article's mechanism, not a replay of any run. Final frame: shelf of 3-4 DONE gauges, magnets
  faintly visible, all on the same side.
- **Numbers on screen, exactly as the article writes them**: "5 / 19", "16", "3 / 3", "29",
  "7% → 7%", "7% → 9%", "+1 task", "54%", "500 companies", "75%-85%", "~20 points". No other
  figures (the judge-bias numbers of section 4 are not in this cut).
- **Spoken forms**: "19" → "nineteen"; "54%" → "fifty-four percent"; "75%, up to 85%" →
  "seventy-five percent, up to eighty-five"; "javieraguilar.ai" → the template's usual reading.
- **Caption speed** (estimated at 2.8 words/s): every line ≤16.8 chars/s except scene 19
  ("The instrument isn't biased. My stopping rule is.", 49 chars, ~17.1 on the word estimate),
  which carries a 0.6 s hold (≥3.5 s on screen, ≈14 chars/s); scene 12 reads 17.1 on the raw
  word count but its spoken form ("fifty-four percent") adds two words (≈14 chars/s). Scene 23
  sits on the outro card's own hold.
- **Anonymisation**: "a client's classifier" (the article's own wording), fictional company
  names, illustrative message chips. The public benchmark is not named on screen ("an inherited
  benchmark"), which also keeps branding to AGILabs only.
- Section 4 of the article (the judge-length statistic "computed correctly and means nothing")
  and the "what measuring costs" section are not in this cut, by length. If Javier wants the
  fourth failure mode, it would be one scene after 15: "One statistic wasn't broken at all:
  computed right, and meaningless." (+10 words, ~4 s), visual: a gauge with no magnet whose
  needle moves with a hidden "length × quality" knob.
- ES cut: pending (EN-only for now).
