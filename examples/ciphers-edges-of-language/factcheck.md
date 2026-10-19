# Fact-check: Teaching a Model a Language You Just Invented (EN vertical) · v1.2

Source: `src/content/blog/en/ciphers-edges-of-language.md` (personal-website, `main`). Every
spoken claim and every number or claim shown on screen, with the article sentence it rests on.
Visuals that are illustrative (wall heights between the two labelled values, the
frequency-analysis unmasking order, the tablet, the switch animation, which cipher strings are
shown) are not claims and are listed at the end.

The article carries a correction (1 August 2026) retracting its jailbreak section. Nothing in
this script comes from that section; every claim below is from the parts the correction states
are unaffected: "Everything else here (refusal rates, the difficulty ladder, the protocol
effects) is unaffected and was since reproduced on the full 696-conversation sweep."

## Narration

| # | Claim (spoken) | Where | Article sentence |
|---|---|---|---|
| 1 | "Two of my five models refuse to play before any decoding happens." | hook | Description: "something surprising happens before any decoding does: some models refuse to play at all."; "Before I could measure *how fast* anyone cracks a cipher, I had to notice that **two of my five models refuse to try.**"; "Five models: Claude Opus and Sonnet, GPT-5, and Qwen2.5-7B in both Instruct and Base flavors." (The refusal rate is ~87%, not 100%; "refuse to play/try" is the article's own wording.) |
| 2 | "I hid simple, checkable tasks in ten ciphers, from ROT13 to a shuffled alphabet." | ladder | "I built a ladder of **ten ciphers**"; "**Substitution:** ROT13, and a *keyed random substitution* — an arbitrary shuffle of the alphabet the model cannot have memorized"; "Each turn, the model gets a short **verifiable task** ... encoded in the active cipher." |
| 3 | "Claude Opus and Sonnet refuse about 87% of encoded turns." | wall | "**Claude Opus and Sonnet refuse ~87% of encoded turns.**" (figure: "Claude Opus 87%, Claude Sonnet 86%") |
| 4 | "In plain English, they answer instantly." | plain | "Feed the same model the same question in plain English and it answers instantly and correctly ("The capital of France is **Paris**")." |
| 5 | "The more the text looks like noise, the more they refuse." | legibility | "the refusal is shaped by **illegibility**. ... anything that turns the message into visual noise — draws refusal close to 100%. But `cyrillic_homoglyph`, where the text still *looks* like words, gets refused only a third of the time. The model's guard rises exactly with how alien the input looks." |
| 6 | "Azure's filter flags GPT-5's ciphered prompts as a jailbreak before the model sees them." | filter | "Azure's content filter classifies the ciphered prompts as a **jailbreak attempt** and returns a 400 before the model ever sees them." |
| 7 | "Past the filter, GPT-5 cracks most ciphers on turn one." | break (fast) | "Only GPT-5 (past the filter) and the two open Qwen models actually engage."; "**GPT-5 cracks most ciphers on the very first turn**"; "(To measure GPT-5 at all I had to route it through a deployment with the jailbreak shield disabled ...)" |
| 8 | "The keyed ones, which it has to infer, take a median of 4–5 turns." | break (slow) | "but takes a median of 4–5 on the keyed ones — random substitution and block permutation, the two it has to genuinely *infer*." |
| 9 | "A few plaintext–code pairs, a Rosetta stone, lift comprehension from 61% to 83%." | rosetta | "Giving the model a **Rosetta stone** — a few plaintext↔coded pairs — lifts comprehension from 61% to 83%"; figure: "Comprehension: pure 61%, few-shot 83%" |
| 10 | "Understanding a code and answering in it are separate switches." | switches | "Understanding a code and choosing to answer in it are separate switches, and they respond to different prompts." |
| 11 | "For a model, understanding isn't even the first switch to fire." | reveal | "for a model, comprehension is only one of several switches, and not even the first one to fire. Before understanding there's a *willingness to engage at all*" |
| 12 | "More at javieraguilar.ai" | outro | — |

## Numbers and claims on screen

| On screen | Where | Article sentence |
|---|---|---|
| Chips "Claude Opus", "Claude Sonnet", "GPT-5", "Qwen-7B Instruct", "Qwen-7B Base" | hook, wall, filter | "Five models: Claude Opus and Sonnet, GPT-5, and Qwen2.5-7B in both Instruct and Base flavors."; heatmap alt text uses "Qwen-7B Instruct" / "Qwen-7B Base" |
| The two Claude chips hit the wall | hook, wall | "two of my five models refuse to try"; "Claude Opus and Sonnet refuse ~87% of encoded turns" |
| Ten cipher rows: ROT13, keyed substitution, letters→digits, Morse, binary, base64, reversal, block permutation, Cyrillic homoglyphs, disemvowel | ladder | The cipher list under "The setup": "ROT13, and a *keyed random substitution*"; "letters→digits (`a=1…`), Morse"; "binary, base64"; "full text reversal, and a keyed block permutation"; "Latin↔Cyrillic homoglyphs"; "disemvoweling (drop the vowels)" |
| "Paris ✓" oracle tick | ladder | "the oracle is **deterministic** — I encode and decode the ciphers myself, so scoring whether the model *acted correctly* needs no LLM judge, just a string check." |
| `stop_reason: refusal` + empty bubble | wall | "with the API's `stop_reason: refusal` and an empty completion" |
| "~87%" | wall | "refuse ~87% of encoded turns" |
| "The capital of France is **Paris**" | plain | "("The capital of France is **Paris**")" |
| Homoglyph end "~⅓" / noise end "close to 100%" | legibility | "draws refusal close to 100%"; "gets refused only a third of the time" |
| Gate "content filter", stamp "400 · jailbreak", chip never lights | filter | "returns a 400 before the model ever sees them"; "classifies the ciphered prompts as a **jailbreak attempt**" |
| "turn 1" badges on GPT-5 | break (fast) | "GPT-5 cracks most ciphers on the very first turn" |
| Turn counter 1 → 5, "median 4–5 turns", keyed substitution unmasking | break (slow) | "takes a median of 4–5 on the keyed ones"; "The keyed random substitution is the purest case ... watching one grind it out over several turns is the closest thing here to a human frequency-analysis "break" in slow motion." |
| Tablet of plaintext ↔ coded pairs, "61% → 83%" | rosetta | "a few plaintext↔coded pairs — lifts comprehension from 61% to 83%" |
| Switches "Understand", "Reply in code"; prompt "reply in the same code" flips the second | switches | "Understanding a code and choosing to answer in it are separate switches"; "the moment you explicitly say "reply in the same code," the models that understand start *speaking* it." |
| Third switch "Engage", first in the row, off under the Claude chips and under the GPT-5 gate | reveal | "Before understanding there's a *willingness to engage at all* — the switch Claude keeps flipped to off, that Azure flips off on GPT-5's behalf." |
| (alternative scene only) "25% → 62%" on "Reply in code" | — | "Escalation, by contrast, barely moves comprehension but drives **production** through the roof (62% vs 25%)" |

## Illustrative, not claims

- The message `name the capital of france` and its cipher strings: generated with the repo's own
  `make_ciphers(seed=0)` on a real task from `oracle.py`; the seed of the published runs was not
  checked, so keyed strings may differ from the experiment's actual keys.
- Wall heights between the two labelled ends; the "noise" ordering of the cipher cards on the
  legibility strip beyond the two ends the article names (homoglyphs low, visual-noise ciphers
  near 100%).
- The letter-by-letter unmasking order (most frequent letters first) and the flickering
  frequency histogram: a stylisation of "frequency analysis", not a trace of what GPT-5 did.
- Which ciphers appear in the fast "turn 1" montage: pick only from ciphers the turns figure
  (`/blog/ciphers-turns.png`) gives GPT-5 a median of 1: binary, cyrillic_homoglyph, rot13,
  disemvowel, morse, letters_to_digits. Not reversal (2), not the keyed ones (4, 5), and not base64
  (`filtered` for GPT-5, must never be shown as cracked).
- The tablet's linking lines and the toggle animation.

## Checked and excluded

- Jailbreak section (36% plaintext compliance, "under 1%" encoded, "375 encoded requests",
  "decode-and-comment"): retracted by the article's correction; not used.
- Qwen-7B Base difficulty (0% on binary, Cyrillic, block permutation; 100% letters→digits): true
  but cut for length.

## v1.1 review (independent)

- Every number re-checked against the article: ~87% (Opus 87%, Sonnet 86%), close to 100% / a
  third, 400, turn 1, median 4–5, 61% → 83%. All match, same rounding and hedges.
- Scene 6 softened from "blocks GPT-5's prompts ... before it sees them" to the article's scope:
  the *ciphered* prompts, flagged as a jailbreak (attempt), before *the model* sees them.
- No retracted-section material (36%, 1%, 375, decode-and-comment) anywhere. No employer or
  client names; "Azure" and the model names appear only as the article uses them; no personal
  name on screen.

## v1.2 (feedback: approved as is, jailbreak section left out)

- No narration or on-screen change, so no new claims to check. Re-read the correction on
  `origin/main` (line 13): "Everything else here (refusal rates, the difficulty ladder, the
  protocol effects) is unaffected". The retracted block starts at the "This section is
  retracted." banner near the end; scene 6 quotes line 48 of the setup, outside it.
- grep over script.md for 36%, 1%, 375 and decode-and-comment: only hits are in the
  "out of scope" and "checked and excluded" notes.
