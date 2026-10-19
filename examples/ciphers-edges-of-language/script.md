# Teaching a Model a Language You Just Invented — article video (EN) · script v1.2 (approved)

Article: ciphers-edges-of-language (javieraguilar.ai, EN, published 2026-07-20, with a correction
banner dated 1 August 2026). Vertical 9:16, target ~55 s, 128 written words (v1.1, independent review).
Data on screen: the experiment's own ciphers, generated with the repo's code
(`JaviMaligno/llm-language-limits`, `src/llm_language_limits/ciphers.py`) on one of its real
tasks ("name the capital of france", from `oracle.py`'s task bank). No third-party data to credit.

**Out of scope on purpose:** the article's jailbreak section ("The twist: encoding a refused
request doesn't unlock it") is retracted by the article's own correction. Nothing from it (the
36% / 1% figures, "decode-and-comment", "375 encoded requests") appears in narration or on
screen. The video stops at the switches, which the correction leaves untouched ("Everything else
here (refusal rates, the difficulty ladder, the protocol effects) is unaffected").

## Changes from feedback (v1.2)

- Javier approved the script as is. Narration, visuals, timing (128 written words, ~58 s spoken)
  and every number are unchanged from v1.1.
- His one condition, leaving out the jailbreak section (retracted by the article's 1 August 2026
  correction), already held in v1.1; re-verified against `origin/main`: no 36% / under 1% /
  375 encoded requests / decode-and-comment anywhere in narration, on screen or in the
  alternative scene.
- Scene 6 (Azure's filter flags GPT-5's ciphered prompts "as a jailbreak") stays: it quotes the
  setup section ("Azure's content filter classifies the ciphered prompts as a **jailbreak
  attempt** and returns a 400 before the model ever sees them."), not the retracted section, and
  the correction lists the refusal results as unaffected. On screen it must read as a filter
  refusal, never as a jailbreak result.

## Central visual metaphor: the mask and the switches

**The mask.** One message card is the protagonist: `name the capital of france` in plain Inter.
Its letters scramble, glyph by glyph, into a cipher: the mask goes on. The whole video is about
what happens to that masked card when it reaches a model: it bounces off a wall (refusal), gets
stopped at a gate before the model (filter), or the mask slowly comes off letter by letter (the
codebreaker's "break", the click from the article's opening).

**The switches.** In the final scenes the three outcomes collapse into a row of three toggle
switches, *Engage · Understand · Reply in code*, the article's closing image. The reveal is that
the switch everyone expects to be first (Understand) sits second: Engage was the wall we saw at
the start.

| # | Narration (EN) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | Two of my five models refuse to play before any decoding happens. | Black stage (first 3 s carry the hook: the scramble completes by ~1 s, the wall hit lands on "refuse to play" at ~3 s). The message card `name the capital of france` sits centre; its letters scramble in a wave into the keyed substitution (`dovg pkg xolwpoc rf fjodxg`). Five model chips below (Claude Opus · Claude Sonnet · GPT-5 · Qwen-7B Instruct · Qwen-7B Base, muted). The masked card flies towards them; at the two Claude chips it hits a glass wall and shatters back into noise | intro card over bespoke `CipherCard` (mode `scramble`) | "Speak to a language model in a cipher it has never been told the key to, and something surprising happens before any decoding does: some models refuse to play at all."; "I had to notice that **two of my five models refuse to try.**" |
| 2 | I hid simple, checkable tasks in ten ciphers, from ROT13 to a shuffled alphabet. | The ladder: the same card repeated down ten rungs, each rung re-masking it in one real cipher (ROT13, keyed substitution, letters→digits, Morse, binary, base64, reversal, block permutation, Cyrillic homoglyphs, disemvowel). A small check-mark "oracle" tick sits at the side: "Paris ✓" | bespoke: `CipherCard` (mode `ladder`) | "I built a ladder of **ten ciphers**"; "ROT13, and a *keyed random substitution* — an arbitrary shuffle of the alphabet"; "Each turn, the model gets a short **verifiable task** ... encoded in the active cipher." |
| 3 | Claude Opus and Sonnet refuse about 87% of encoded turns. | Masked cards stream at the two Claude chips; most bounce off the wall. Each Claude chip returns an empty speech bubble stamped `stop_reason: refusal`. Small figure under the chips: "~87%" | bespoke: `RefusalGate` (mode `wall`) | "**Claude Opus and Sonnet refuse ~87% of encoded turns.** Not "fail to decode" — *refuse*, with the API's `stop_reason: refusal` and an empty completion." |
| 4 | In plain English, they answer instantly. | The mask peels off the card (letters unscramble back); the same card now passes straight through the wall and the Claude chip answers "The capital of France is **Paris**" | `RefusalGate` (mode `plain`) | "Feed the same model the same question in plain English and it answers instantly and correctly ("The capital of France is **Paris**")." |
| 5 | The more the text looks like noise, the more they refuse. | A horizontal "legibility" strip: at the left the card in Cyrillic homoglyphs (`nаmе thе сарitаl оf frаnсе`, still reads as words), at the right in binary/base64 (pure noise). The wall in front of the Claude chips grows taller as the card slides from left to right: low ("~⅓") on the homoglyph end, nearly closed ("close to 100%") on the noise end | `RefusalGate` (mode `legibility`) | "anything that turns the message into visual noise — draws refusal close to 100%. But `cyrillic_homoglyph`, where the text still *looks* like words, gets refused only a third of the time. The model's guard rises exactly with how alien the input looks." |
| 6 | Azure's filter flags GPT-5's ciphered prompts as a jailbreak before the model sees them. | Camera slides to the GPT-5 chip: here the wall is not on the chip but a separate gate placed *in front of it*, labelled "content filter". The card is stopped at the gate with a red "400 · jailbreak" stamp; the chip itself never lights up | `RefusalGate` (mode `filter`) | "Azure's content filter classifies the ciphered prompts as a **jailbreak attempt** and returns a 400 before the model ever sees them." |
| 7 | Past the filter, GPT-5 cracks most ciphers on turn one. | The gate lifts (dashed outline remains). Cards in ROT13, Morse, binary, disemvowel… (all median 1 for GPT-5 in the turns figure) reach GPT-5 and unmask instantly, one after another: a crisp "click" flash, "turn 1" badge on each | bespoke: `CipherCard` (mode `break`, fast) | "Only GPT-5 (past the filter) and the two open Qwen models actually engage."; "**GPT-5 cracks most ciphers on the very first turn**" |
| 8 | The keyed ones, which it has to infer, take a median of 4–5 turns. | The hero shot: the keyed-substitution card unmasks in slow motion. A turn counter ticks 1 → 5; at each tick a few letters lock into place (frequency-analysis style: the most common letters first, a faint letter-frequency histogram flickering behind), until the whole line snaps into `name the capital of france` | `CipherCard` (mode `break`, slow) | "but takes a median of 4–5 on the keyed ones — random substitution and block permutation, the two it has to genuinely *infer*."; "watching one grind it out over several turns is the closest thing here to a human frequency-analysis "break" in slow motion." |
| 9 | A few plaintext–code pairs, a Rosetta stone, lift comprehension from 61% to 83%. | A stone tablet slides in beside the masked card: three rows of plaintext ↔ coded pairs. Lines of light link matching letters from the tablet to the card, and the card unmasks. A small figure ticks "61% → 83%" under the tablet | bespoke: `CipherCard` (mode `rosetta`) + small `Counter` overlay | "Giving the model a **Rosetta stone** — a few plaintext↔coded pairs — lifts comprehension from 61% to 83%" |
| 10 | Understanding a code and answering in it are separate switches. | The scene collapses into two big toggle switches: "Understand" (on, accent gradient) and "Reply in code" (off). A ghost prompt "reply in the same code" drops in and flips the second one on | bespoke: `SwitchPanel` | "Understanding a code and choosing to answer in it are separate switches, and they respond to different prompts."; "the moment you explicitly say "reply in the same code," the models that understand start *speaking* it." |
| 11 | For a model, understanding isn't even the first switch to fire. | The panel pans right-to-left to reveal a third switch *before* the other two: "Engage". Below it the two Claude chips (switch off, the wall from scene 3) and the GPT-5 chip (switched off by the filter gate from scene 6). Final frame: Engage · Understand · Reply in code | `SwitchPanel` (reveal) | "for a model, comprehension is only one of several switches, and not even the first one to fire. Before understanding there's a *willingness to engage at all* — the switch Claude keeps flipped to off, that Azure flips off on GPT-5's behalf." |
| 12 | More at javieraguilar.ai | Outro card: AGILabs badge, javieraguilar.ai, "Teaching a Model a Language You Just Invented" | outro | — |

**Word count (EN, v1.1, recounted):** 12 + 14 + 10 + 6 + 11 + 14 + 10 + 14 + 13 + 10 + 11 + 3 =
**128 words** (written), about 53 s at ~2.4 words/s. Spoken forms ("eighty-seven percent",
"four to five", "sixty-one percent to eighty-three percent", "rot thirteen", "G P T five" x3) add
~12 spoken words, so expect ~58 s: inside 45-60 s but with no headroom; do not add words (the
escalation alternative scene would need a cut elsewhere). Caption speed at 2.4 words/s: every
line 11-16 chars/s (highest: scene 4, 16.0; scene 6, ~15); the 3-word outro computes to ~19
chars/s only if it is held for its spoken length, so hold the outro caption ≥ 1.5 s.

**v1.1 review changes:** hook reordered so "refuse to play" lands inside 3 s; scene 6 now says
"ciphered prompts" and "the model" (article: "classifies the ciphered prompts as a jailbreak
attempt ... before the model ever sees them"), instead of implying all of GPT-5's prompts are
blocked; scenes 7 and 11 trimmed by 2 and 1 words to keep the spoken length under 60 s.

## Notes for the build

- **`CipherCard` (bespoke)**: one message card in Inter (monospace only for the masked text if
  it reads better at phone size) whose glyphs interpolate between plaintext and a cipher. Pure
  `frameState(props, t, beats, dur)` returns, per glyph slot, which string is shown and a
  `locked` progress. Modes: `scramble` (plain → masked, wave left-to-right, random glyphs
  flickering before settling), `ladder` (ten rows, one per cipher, popping one per ~0.3 s),
  `break` (masked → plain; `fast` = whole line in one flash, `slow` = letters lock in over five
  turn ticks, most frequent cipher letters first), `rosetta` (tablet + linking lines, then
  unmask). Ciphers whose length differs from the plaintext (Morse, binary, base64,
  letters→digits) morph as whole strings, not glyph by glyph.
- **`RefusalGate` (bespoke)**: five model chips in a row; a glass wall drawn *on* a chip
  (Claude: the model's own refusal) versus a separate gate drawn *in front of* a chip (GPT-5:
  external filter). The visual difference between the two is the article's point ("two frontier
  labs guard it two different ways"), so keep it legible. Modes: `wall`, `plain`, `legibility`
  (wall height driven by a 0-1 "noise" parameter: ~⅓ at homoglyphs, ~1 at binary/base64),
  `filter`. Wall heights are illustrative, only the two labelled values are claims.
- **`SwitchPanel` (bespoke)**: three toggles with labels; state per toggle per beat; the
  reveal pans the camera so "Engage" enters from the left of the other two.
- **Real data to extract**: a small script (like `scripts/extract-play.py` in wheres-the-ball)
  imports `make_ciphers` from `llm-language-limits` and writes a committed JSON with the
  plaintext `name the capital of france` encoded in all ten ciphers. With `seed=0` it gives,
  for example, ROT13 `anzr gur pncvgny bs senapr`, keyed substitution
  `dovg pkg xolwpoc rf fjodxg`, reversal `ecnarf fo latipac eht eman`, homoglyph
  `nаmе thе сарitаl оf frаnсе`, disemvowel `nm th cptl f frnc`, base64
  `bmFtZSB0aGUgY2FwaXRhbCBvZiBmcmFuY2U=`. The keyed ciphers depend on the seed; I did not check
  which seed the published runs used, so the keyed strings are real outputs of the cipher code
  but not necessarily the exact key of the experiment (illustrative is fine for the video).
- **Hook task**: "name the capital of france" is one of the eight real tasks in
  `oracle.py`'s task bank; the article itself quotes the Paris answer in the plain-English
  scene, so scenes 1, 4 and 8 all use the same card.
- Visuals are chosen for impact, not as a literal replay of the experiment: the glass wall, the
  gate, the frequency-analysis unmasking and the tablet are stylised; the rigour lives in the
  article and the repo. Narration and every number on screen stay faithful to the article.
- **Numbers on screen, exactly as the article writes them**: "~87%" (refusal, Claude Opus and
  Sonnet), "close to 100%" and "a third" (legibility), "400" (filter response), "turn 1",
  "4–5 turns" (median, keyed ciphers, GPT-5), "61% → 83%". The figure's per-model split (Opus
  87%, Sonnet 86%) is available if the two chips should carry their own numbers.
- **Spoken forms**: "~87%" → "about eighty-seven percent" (the caption keeps "about 87%");
  "4–5" → "four to five"; "61% to 83%" → "sixty-one percent to eighty-three percent"; "ROT13" →
  "rot thirteen"; "GPT-5" → "G P T five"; "Qwen" is never spoken.
- **Model names**: chips use the article's names (Claude Opus, Claude Sonnet, GPT-5,
  Qwen-7B Instruct, Qwen-7B Base); "Azure" is spoken because the article names it. The only
  brand on cards, poster and metadata is AGILabs.
- **Credits**: none needed (all text generated by the repo's own code). Optional outro line:
  "Code: github.com/JaviMaligno/llm-language-limits".
- **Alternative scene (not in v1, +~12 words)**: "Asking it to reply in the same code lifts
  answers in code from 25% to 62%", the escalation result, drawn on the "Reply in code" switch
  of scene 10. Left out to keep numbers in a supporting role; swap in if scene 10 feels abstract.
- ES cut: pending (EN-only for now).
