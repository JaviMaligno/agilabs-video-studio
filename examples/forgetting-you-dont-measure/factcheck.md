# Fact-check: The Forgetting You Don't Measure (EN vertical) · v1.0

Source: `src/content/blog/en/forgetting-you-dont-measure.md` (personal-website, `origin/main`,
published 2026-07-06), cross-checked against the experiment repo
`JaviMaligno/language-world-model-forgetting` (`docs/EXPERIMENTS.md`, Phases 1–3;
`src/lwmf/data/terminal_gen.py`). Every spoken claim and every number or claim shown on screen,
with the article sentence it rests on. Illustrative visuals are listed at the end.

## Narration

| # | Claim (spoken) | Where | Article sentence |
|---|---|---|---|
| 1 | "I taught a small model one new skill. It quietly forgot some of what it knew." | hook | Description: "When you continually pre-train an LLM into a 'world model', it quietly forgets general knowledge"; "pour enough narrow data on a model and it starts to *forget* things it used to know" ("some of", not all: −0.078 average) |
| 2 | "The skill: predicting what a terminal prints. A tiny world model." | skill | "generated a narrow 'terminal simulator' dataset (real shell commands and their real outputs), and continually pre-trained the model to predict those outputs — teaching it to be a tiny world model" |
| 3 | "A recent paper trains big ones, but never measures the forgetting." (build: script cut 1 applied, "the same way" dropped; the on-screen "general text mixed in ✓" carries it) | paper | "They build this by taking a finished, general-purpose model and training it further … continual pre-training"; "What they never do is *measure* it: there's no before/after on general benchmarks, no number on how much gets forgotten or how much the replay saves." "Big": "a 397B model". The paper does mix general text in ("they blend in general-knowledge corpora"), shown on screen so "never measures" is not read as "ignores it" |
| 4 | "So I did, at toy scale, on reasoning benchmarks." | test | "So I ran the experiment at toy scale."; "Before and after training I measured general ability on standard benchmarks (ARC, HellaSwag, WinoGrande)"; the article itself calls them "My reasoning benchmarks" |
| 5 | "One knob: how much of each batch is general text." | knob | "Then I swept the one knob that matters: what fraction of each training batch is *replay* — general text (Wikipedia) — instead of terminal data." |
| 6 | "With none, it learned the terminal, but its general scores all fell." | zero | "With no replay, the model learns the terminal task well (exact-match on held-out outputs jumps from ~0.36 to ~0.90) — and it forgets. General accuracy drops across the board" (repo: all four benchmarks negative at 0 %) |
| 7 | "Down 0.078 on average, 0.15 at worst." | zero | "on average −0.078, and −0.15 on the worst-hit benchmark (ARC-Easy)" |
| 8 | "Then I mixed in 10% general text." | replay | "Then I dialed replay up."; "Ten percent replay …" |
| 9 | "That won back about 73% of the loss, at no cost to the new skill." | replay | "Ten percent replay recovers about 73% of the average forgetting … at **no cost to the new task** (task accuracy stays at ~0.90)." Repo: (0.078 − 0.021) / 0.078 = 73 % ✓ |
| 10 | "The bigger lever was how I trained it." | pivot | "Replay is one lever. The training *method* is a bigger one." |
| 11 | "Full fine-tuning lets any weight in the model change." | methods | "**full fine-tuning** — every weight in the model is free to change"; "lets the optimizer overwrite any weight" |
| 12 | "LoRA freezes the model and trains a small add-on." | methods | "**LoRA** … freezes the original model and trains only a small set of add-on 'adapter' weights" |
| 13 | "LoRA barely forgot, even with no mixing, and learned the terminal just as well." | methods | "LoRA barely forgets, even with no replay at all, while learning the terminal task just as well (same ~0.90 accuracy)." |
| 14 | "Instruction-following fell by 37% with full fine-tuning. With LoRA it went up." | bill | "Full fine-tuning drops it 37% relative (0.194 → 0.123); LoRA actually nudges it up." Repo: 0.071 / 0.194 = 36.6 % ✓. Measured "at zero replay" (on screen: "at 0% mixing") |
| 15 | "On unseen commands, full fine-tuning scored zero. LoRA got 0.15." | bill | "on genuinely unfamiliar commands (things like `sed`, `awk`, `grep` and pipes, which the training set never contained) full fine-tuning collapses to zero while LoRA still gets 0.15" |
| 16 | "Full fine-tuning paid three costs. One benchmark shows only one of them." | verdict | "**full fine-tuning pays three costs — general reasoning, instruction-following, and out-of-distribution robustness — that a single benchmark undersells**"; "My reasoning benchmarks couldn't see this" (IFEval); the OOD probe is a separate held-out set. "Shows only one" is the spoken form of "undersells": a reasoning benchmark measures the first cost and neither of the other two |
| 17 | "LoRA mostly didn't pay them." | verdict | "and LoRA mostly doesn't pay them, because it perturbs the model far less" |
| 18 | "LoRA isn't free: on harder tasks it may learn less." (build: script cut 2 applied, "But" dropped) | trade-off | "LoRA learns the *new* task a bit less aggressively than full-FT. Here the terminal task was easy enough that both hit the same ~0.90 … but on a harder target where you need every point of task performance, full fine-tuning's willingness to overwrite is exactly what you're paying for. There's no free lunch" ("may": the article did not run a harder task) |
| 19 | "So check more than one capability, and pick the method on purpose." | close | "when you specialize a model, check more than one capability, pick the training method deliberately … and don't read one flat benchmark as proof that nothing was lost." |
| 20 | "More at javieraguilar.ai" | outro | — |

## Numbers and claims on screen

| On screen | Where | Source |
|---|---|---|
| `$ echo hello > notes.md`, `$ cat notes.md` → `hello [exit 0]` | hook, skill | Repo `build_scenario` template (`echo {word} > {fname}`, `cat {fname}`; words include "hello", files include "notes.md"); system prompt "followed by an exit marker like [exit 0]" |
| "recent world-model paper · 397B", "general text mixed in ✓", "forgetting: ?" | paper | "a 397B model"; "they blend in general-knowledge corpora (law, medicine, current events)"; "What they never do is *measure* it" |
| "0.5B model · toy scale" (optional small "Qwen2.5-0.5B-Instruct") | test | "I took `Qwen2.5-0.5B-Instruct`"; "at toy scale" |
| Gauges ARC-Challenge, ARC-Easy, HellaSwag, WinoGrande; "before → after" | test | "(ARC, HellaSwag, WinoGrande)"; the chart's "ARC-Easy"; repo battery `arc_challenge, arc_easy, hellaswag, winogrande` |
| Dial "0% · 10% · 25% · 50%", "3 seeds each" | knob | "Zero, 10%, 25%, 50%, and a 100% control. Three seeds each." The 100 % control is not on the dial (and ran 1 seed, see below), so "3 seeds each" is true of what is shown |
| Terminal meter "0.36 → 0.90" | zero | "jumps from ~0.36 to ~0.90" (repo 0.356 → 0.897) |
| Gauge drops (unlabelled) ARC-C −0.048, ARC-E −0.153, HS −0.078, WG −0.031 | zero | Repo Phase 1 table, 0 % row. Only the article's "−0.15" is printed |
| "−0.078 average", "−0.15 worst: ARC-Easy" | zero | "on average −0.078, and −0.15 on the worst-hit benchmark (ARC-Easy)" |
| White replay card 1 in 10 | replay | "Ten percent replay" |
| Curve points full FT −0.078, −0.021, −0.012, −0.015 | replay | Article chart (labels "−0.078", "10% replay → most of it recovered"); repo Phase 1 mean Δ column |
| "≈73% back", "≈82% on the worst benchmark" | replay | "recovers about 73% of the average forgetting — and roughly 82% of the worst case" (repo: (0.153 − 0.028)/0.153 = 81.7 %) |
| Task meter "≈0.90" holding | replay | "task accuracy stays at ~0.90" |
| "little more past 25%" | replay | "Past 25% you get diminishing returns." |
| Chip "a known result" | replay | "this is not a new discovery … well-established" |
| LoRA curve points +0.002, +0.005, +0.009, +0.009 (flat on zero) | methods | Article chart ("LoRA: ~no forgetting"); repo Phase 2 "LoRA 0.5B" column |
| Two terminal meters "≈0.90" | methods | "learning the terminal task just as well (same ~0.90 accuracy)" |
| Receipt header "at 0% mixing" | bill | "Two more probes, at zero replay"; table header "Probe (at 0% replay)" |
| "General reasoning −0.078 \| ≈0" | bill | "on average −0.078"; "LoRA barely forgets" |
| "Instruction-following −37% (0.194 → 0.123) \| +0.033" | bill | "drops it 37% relative (0.194 → 0.123)"; table "**+0.033**" |
| `$ echo banana \| sed 's/a/X/g'` → `bXnXnX` | bill | Repo `build_scenario_hard` template (`echo {word} \| sed 's/a/X/g'`, word "banana"); article "things like `sed`, `awk`, `grep` and pipes" |
| "Unseen commands 0.00 \| 0.15" | bill | Table "World model on unseen commands · **0.00** · **0.15**" |
| Stamps "3 COSTS", "mostly spared"; lens "one benchmark" | verdict | "full fine-tuning pays three costs … that a single benchmark undersells, and LoRA mostly doesn't pay them" |
| Dial "learn more, forget more" ↔ "learn less, forget less"; "here the task was easy: both ≈0.90" | trade-off | "just a dial between 'learn more, forget more' and 'learn less, forget less.'"; "Here the terminal task was easy enough that both hit the same ~0.90" |

| "mine: 0.5B" under the small wall | paper | "I took `Qwen2.5-0.5B-Instruct`" |
| "No free lunch, just a dial" | trade-off | "There's no free lunch, just a dial between 'learn more, forget more' and 'learn less, forget less.'" |
| "a command type never trained on" (OOD terminal header) | bill | "which the training set never contained" |
| "any weight can change" / "model frozen, small add-on trained" | methods | "every weight in the model is free to change"; "freezes the original model and trains only a small set of add-on 'adapter' weights" |
| Six capability chips (4 benchmarks, Instruction-following, Unseen commands) | close | the battery + the two probes; "check more than one capability" |

## Build notes (render)

- The render ran past the script's 88 s threshold (89.3 s), so cuts 1 and 2 of the script's cut
  list were applied, in order; cut 3 (silencing scene 7) was not needed. Final length ≈ 88 s.
- For caption speed, three sentences are voiced as two lines each with the same words
  ("With none, it learned the terminal, / but its general scores all fell.", "That won back about
  73% of the loss, / at no cost to the new skill.", "LoRA barely forgot, even with no mixing, /
  and learned the terminal just as well."), and scene 15/16 sentences are one line each.
- Gauge drops are drawn at 2x the repo's per-benchmark drops (unlabelled, ordering faithful).

## Illustrative, not claims

- The wall of tiles, how many go dark, which ones, and how fast: a picture of forgetting, not a
  measurement. The share is exaggerated so it reads (a literal 8 % would be invisible).
- The conveyor of batch cards and the 1-in-10 white card: a picture of the mixing ratio.
- The glass and the adapter column: a picture of "frozen base + small add-on".
- The full-fine-tuning wrong output on the `sed` command and LoRA's partial meter: the article
  reports scores only.
- The "one benchmark" lens covering one receipt line.

## Problems found in the article vs its data

1. **Base vs instruct figures don't match the data.** Article (EN and ES): "base and instruct 0.5B
   forgot almost identically (**−0.14 vs −0.17** mean at zero replay)". The repo's
   `docs/EXPERIMENTS.md` gives **−0.077 (base) vs −0.078 (instruct)** (Phase 2) and −0.073 vs
   −0.086 on the Phase 3 batch. An instruct mean of −0.17 also contradicts the article's own
   "on average −0.078" for the same model and setting. The first version of the article had
   "−0.077 vs −0.078"; commit `d1fa2c40` ("reframe LoRA section with batch-A data") replaced
   them with −0.14 / −0.17. Not used in the video.
2. **"Three seeds each" includes the 100 % control**, which ran 1 seed (repo: "3 seeds per mixing
   ratio (control: 1 seed)"). Minor. The video shows only 0–50 %.
3. **"task accuracy collapses back to baseline"** for the 100 % control: the repo has 0.253,
   *below* the 0.356 baseline. Minor understatement. Not used in the video.
4. **Takeaway tension:** "Full fine-tuning on a narrow task looked fine on reasoning, until IFEval
   showed…". The IFEval and unseen-command probes were run at 0 % replay, where reasoning did
   *not* look fine (−0.078; −0.086 on the probe batch). Reasoning only looks fine with replay,
   where the other two probes were not measured. The video avoids "looked fine" and says the
   reasoning benchmark shows one of the three costs.
5. Minor bookkeeping, not an error: the probe table pairs Phase 3's IFEval/OOD with the Phase 1
   mean (−0.078); the Phase 3 batch's own reasoning mean for instruct full-FT is −0.086. Same
   direction and size class.
6. Unverified, not checked against data: "a single spot T4 on Azure". The repo says a
   scale-to-zero AML T4 cluster (NC4as_T4_v3); spot/low-priority is not recorded there. Not
   used in the video.

## Changes from the reviewer pass (draft → v1.0)

- Hook: "It quietly forgot others" → "It quietly forgot some of what it knew" (the article says
  general knowledge, and only part of it).
- Close: dropped "The losses were real. They just weren't where I looked first." Inside this
  video the first place I looked (reasoning benchmarks, at 0 %) *did* show a loss, so the line
  contradicted scene 7. Replaced by the article's own instruction (check more than one
  capability, pick the method deliberately), with the verdict lens carrying "one benchmark".
- Verdict: "three costs one benchmark undersold" was 19.9 chars/s; split into "Full fine-tuning
  paid three costs. One benchmark shows only one of them." + "LoRA mostly didn't pay them."
- Replay line: "73% of it" → "73% of the loss" (the "it" had no clear referent after scene 8).
- Paper line now says "the same way" and the screen shows the paper did mix general text, so
  "never measures" is not mistaken for "never mixes".
- Instruction-following line reordered so it reads ≤17 chars/s ("Instruction-following fell by
  37% with full fine-tuning. With LoRA it went up.").
- Receipt header "at 0% mixing" added: the probes exist only at zero replay.
- Dropped "That part is well known" from the narration (time); kept as an on-screen chip.
