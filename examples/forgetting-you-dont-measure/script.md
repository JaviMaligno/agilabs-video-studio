# The Forgetting You Don't Measure — article video (EN) · script draft v1.0

Article: forgetting-you-dont-measure (javieraguilar.ai, EN, published 2026-07-06; read from
`origin/main` of personal-website). Vertical 9:16, target ~85 s (story needs the method act;
see the cut list to reach ~80 s), 206 caption words, ~217 as spoken. ES column left empty
(EN-only for now). Voice: the template default.
Data on screen: the article's numbers; where a visual needs a value the article does not print
(the per-benchmark bars, the 25 %/50 % points, the LoRA curve points), it comes from the
experiment repo `JaviMaligno/language-world-model-forgetting`, `docs/EXPERIMENTS.md`, and is
listed in `factcheck.md`. Terminal lines are the repo's real command templates
(`src/lwmf/data/terminal_gen.py`). Nothing to anonymise: personal experiment, public repo.

## Central visual metaphor: the wall of lit tiles

The model is a **wall of small square tiles** (~12 × 9) filling the stage, each tile softly lit in
**white** (`C.text`): what the model already knows. It is the same wall all video long.

- **Narrow training is a conveyor of batch cards** sliding into the wall from the left. Terminal
  cards are filled with the brand gradient and carry a tiny `$ _` glyph; as each one lands, a few
  tiles it touches are **repainted in the accent** (the new skill) and a few neighbouring white
  tiles **go dark** (`C.card`): forgetting, happening quietly while the new colour spreads.
- **Replay is a white card in the stream**, a little page with a "W" (Wikipedia) glyph. With
  10 % replay one card in ten is white; each time it lands, dark tiles **relight** white. The
  viewer sees the rehearsal working.
- **Full fine-tuning vs LoRA is the wall's state.** Full fine-tuning: every tile is loose (a faint
  jitter, any of them can be repainted). LoRA: a **pane of glass slides over the wall** (sheen +
  small padlock) and a **slim adapter column** bolts on at the right edge; only that column takes
  the accent paint. The white wall stays lit behind the glass.

A second, data-true picture hangs off the wall: the **replay curve** (`ReplayCurve`), the
article's own chart redrawn in brand colours, its points landing as the knob turns. The verdict
is a **bill** (`CostReceipt`): two receipts side by side, "Full fine-tuning" and "LoRA", three line
items each, and a small lens labelled "one benchmark" that only ever covers the first line.

| # | Narration (EN, caption text) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | I taught a small model one new skill. It quietly forgot some of what it knew. | | **Cold open.** The wall, all white. A small terminal chip at the top types `$ cat notes.md` → `hello  [exit 0]` with a green tick. As it types, gradient cards stream in and an accent stain spreads across the wall; on "quietly forgot" dozens of white tiles go dark, without a sound effect or a flash (quiet). Hook text big on the intro card, words lighting as spoken | bespoke: `WeightWall` (mode `hook`) under the intro card | Description: "When you continually pre-train an LLM into a 'world model', it quietly forgets general knowledge"; "pour enough narrow data on a model and it starts to *forget* things it used to know" |
| 2 | The skill: predicting what a terminal prints. A tiny world model. | | The terminal chip grows to a full card. Real command templates: `$ echo hello > notes.md`, `$ cat notes.md`; the model's guess `hello [exit 0]` ghost-types, then a solid line (the real output) lands on it: match ✓. On "A tiny world model" a label snaps on: **WORLD MODEL** · "predicts what the environment returns" | bespoke: `TerminalProbe` (mode `in-dist`) | "the model learns to predict what an environment returns after an action. Run a shell command, and it predicts the exact terminal output, exit code and all."; "continually pre-trained the model to predict those outputs — teaching it to be a tiny world model" |
| 3 | A recent paper trains big ones the same way, but never measures the forgetting. | | A huge wall rises behind the small one, tag "recent world-model paper · 397B". A chip on it: "general text mixed in ✓". Beside it an empty gauge "forgetting: ?" — the "?" pulses | bespoke: `WeightWall` (mode `paper`) | "taking a finished, general-purpose model and training it further … continual pre-training"; "during continual pre-training they blend in general-knowledge corpora"; "What they never do is *measure* it: there's no before/after on general benchmarks, no number on how much gets forgotten or how much the replay saves."; "Not to one-up a 397B model with a 0.5B one" |
| 4 | So I did, at toy scale, on reasoning benchmarks. | | The big wall falls away. Small wall, chip "0.5B model · toy scale". Four gauges light up under it, one per beat: ARC-Challenge, ARC-Easy, HellaSwag, WinoGrande, each with a "before" mark. Tag: "before → after" | `WeightWall` (mode `test`) | "So I ran the experiment at toy scale."; "I took `Qwen2.5-0.5B-Instruct`"; "Before and after training I measured general ability on standard benchmarks (ARC, HellaSwag, WinoGrande)"; "My reasoning benchmarks couldn't see this" |
| 5 | One knob: how much of each batch is general text. | | The conveyor appears at the wall's left edge with a **dial** above it: **0% · 10% · 25% · 50%** (ticks), tag "3 seeds each". The dial sweeps once across its range and the mix of white cards in the stream follows it (none → 1 in 10 → 1 in 4 → 1 in 2), then snaps back to 0% | bespoke: `WeightWall` (mode `knob`) | "Then I swept the one knob that matters: what fraction of each training batch is *replay* — general text (Wikipedia) — instead of terminal data. Zero, 10%, 25%, 50%, and a 100% control. Three seeds each." (the control ran 1 seed: not shown, see factcheck) |
| 6 | With none, it learned the terminal, but its general scores all fell. | | Dial at **0%**: the stream is all gradient cards. Accent spreads over the wall; white tiles go dark. Terminal meter at the top climbs **0.36 → 0.90**. All four gauges drop, one per beat | `WeightWall` (mode `zero`) | "With no replay, the model learns the terminal task well (exact-match on held-out outputs jumps from ~0.36 to ~0.90) — and it forgets. General accuracy drops across the board" |
| 7 | Down 0.078 on average, 0.15 at worst. | | Big figure **−0.078** "average" in the accent; the ARC-Easy gauge lifts out with **−0.15** "worst: ARC-Easy" | `StatGrid` (2 tiles) over the dimmed wall | "on average −0.078, and −0.15 on the worst-hit benchmark (ARC-Easy)" |
| 8 | Then I mixed in 10% general text. | | Wall resets to white. Dial clicks to **10%**: every tenth card in the stream is a white page. Each white card that lands relights a patch of dark tiles; the wall ends mostly white with the accent skill still painted in | `WeightWall` (mode `replay`) | "Then I dialed replay up."; "Ten percent replay recovers about 73% of the average forgetting" |
| 9 | That won back about 73% of the loss, at no cost to the new skill. | | Split: the wall shrinks to the top half; below, the **replay curve** draws its full-fine-tuning line: point at 0% (−0.078) then a jump to 10% (−0.021). A stamp lands on the jump: **≈73% back** (small sub-tag "≈82% on the worst benchmark"). Terminal meter stays at **≈0.90**. Then the 25% and 50% points land quickly; label "little more past 25%". Corner chip: "a known result" | bespoke: `ReplayCurve` (mode `full`) | "Ten percent replay recovers about 73% of the average forgetting — and roughly 82% of the worst case — at **no cost to the new task** (task accuracy stays at ~0.90). Past 25% you get diminishing returns."; "this is not a new discovery. That a small replay fraction suppresses catastrophic forgetting is well-established" |
| 10 | The bigger lever was how I trained it. | | Big line, word by word: **"The bigger lever: how I trained it."** The curve dims behind it | `KeyQuote` (emphasis "how I trained it") | "Replay is one lever. The training *method* is a bigger one." |
| 11 | Full fine-tuning lets any weight in the model change. | | Back to the full wall, label **FULL FINE-TUNING**: every tile jitters loose; a gradient card lands and repaints tiles anywhere, including white ones, which go dark | bespoke: `WeightWall` (mode `methods`, left) | "**full fine-tuning** — every weight in the model is free to change"; "Full fine-tuning … lets the optimizer overwrite any weight — including the ones holding general ability." |
| 12 | LoRA freezes the model and trains a small add-on. | | Second wall beside it, label **LoRA**: a pane of glass slides over it (sheen, padlock), and a slim adapter column bolts on at its right edge. Gradient cards land only on the column, which fills with accent; the white wall behind the glass stays lit | `WeightWall` (mode `methods`, right) | "**LoRA** … freezes the original model and trains only a small set of add-on 'adapter' weights"; "because the original weights are frozen, the general knowledge they hold sits untouched by construction" |
| 13 | LoRA barely forgot, even with no mixing, and learned the terminal just as well. | | The replay curve returns with both lines: the full-fine-tuning line as before and the **LoRA line flat on zero** at every dial position (0% first, on "even with no mixing"). Two terminal meters side by side: both **≈0.90** | `ReplayCurve` (mode `both`) | "LoRA barely forgets, even with no replay at all, while learning the terminal task just as well (same ~0.90 accuracy)."; "flat, near zero, at *every* replay fraction, including zero" |
| 14 | Instruction-following fell by 37% with full fine-tuning. With LoRA it went up. | | **The bill opens.** Two receipts, "Full fine-tuning" and "LoRA", tag "at 0% mixing". Line 1 is already printed: "General reasoning: −0.078 · ≈0". Line 2 prints: "Instruction-following: **−37%** (0.194 → 0.123) · **+0.033**" | bespoke: `CostReceipt` (lines 1–2) | "Full fine-tuning drops it 37% relative (0.194 → 0.123); LoRA actually nudges it up."; table "Instruction-following (IFEval) · −0.071 · **+0.033**"; "Two more probes, at zero replay" |
| 15 | On unseen commands, full fine-tuning scored zero. LoRA got 0.15. | | A small terminal pops above the receipts with a command type never trained on: `$ echo banana \| sed 's/a/X/g'`, expected `bXnXnX`. Full fine-tuning's line fills with a wrong guess, ✗; LoRA's sometimes right (meter, not a single trial). Line 3 prints: "Unseen commands: **0.00** · **0.15**" | `CostReceipt` (line 3) + `TerminalProbe` (mode `ood`) | "on genuinely unfamiliar commands (things like `sed`, `awk`, `grep` and pipes, which the training set never contained) full fine-tuning collapses to zero while LoRA still gets 0.15"; table "World model on unseen commands · **0.00** · **0.15**" |
| 16 | Full fine-tuning paid three costs. One benchmark shows only one of them. | | **Verdict.** A stamp lands on the full-fine-tuning receipt: **3 COSTS**. Then a lens labelled "one benchmark" slides over the receipt and covers line 1 only; lines 2 and 3 stay outside it, unlit by the lens | `CostReceipt` (mode `verdict`) | "**full fine-tuning pays three costs — general reasoning, instruction-following, and out-of-distribution robustness — that a single benchmark undersells, and LoRA mostly doesn't pay them**"; "My reasoning benchmarks couldn't see this" |
| 17 | LoRA mostly didn't pay them. | | The LoRA receipt gets a lighter stamp: **mostly spared** | `CostReceipt` (mode `verdict`) | "and LoRA mostly doesn't pay them, because it perturbs the model far less" |
| 18 | But LoRA isn't free: on harder tasks it may learn less. | | A dial between two labels, "learn more, forget more" (full fine-tuning) and "learn less, forget less" (LoRA); tag under it "here the task was easy: both ≈0.90" | bespoke: `CostReceipt` (mode `dial`) | "LoRA learns the *new* task a bit less aggressively than full-FT. Here the terminal task was easy enough that both hit the same ~0.90 … but on a harder target where you need every point of task performance, full fine-tuning's willingness to overwrite is exactly what you're paying for. There's no free lunch, just a dial between 'learn more, forget more' and 'learn less, forget less.'" |
| 19 | So check more than one capability, and pick the method on purpose. | | The wall returns, white, with four gauges plus two new ones (instruction-following, unseen commands) lighting under it; "check more than one" in the accent. Then "pick the method" over the two wall states side by side | `KeyQuote` (emphasis "more than one", "on purpose") over `WeightWall` still | "when you specialize a model, check more than one capability, pick the training method deliberately (LoRA and full fine-tuning are genuinely different trades, not interchangeable defaults), and don't read one flat benchmark as proof that nothing was lost." |
| 20 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, "The Forgetting You Don't Measure" | outro | — |

**Word count (EN caption text):** 16 + 11 + 14 + 9 + 10 + 12 + 7 + 7 + 15 + 8 + 9 + 9 + 14 + 12 +
10 + 12 + 5 + 11 + 12 + 3 = **206 words**. As spoken ("0.078", "0.15", "10%", "73%", "37%" and the
URL expanded) it is ~217 words: ~78 s of speech at ~2.8 words/s, **~85 s with line gaps and scene
tails**. Set `targetSeconds: 85`.

If the render runs past 88 s, cut in this order (never scenes 6–7, 9, 13–17):
1. Scene 3: "the same way" (−3); the on-screen "general text mixed in ✓" carries the method.
2. Scene 18: "But" (−1).
3. Scene 7: drop the narration, keep the two tiles on screen ~2 s silent (−12 spoken, ~−4 s).

## Notes for the build

- **`WeightWall` (bespoke, the spine).** A grid of ~12 × 9 rounded tiles in the stage
  (≈ 936 px wide). Tile state per frame: `white` (`C.text` at ~0.85), `dark` (`C.card`),
  `accent` (gradient sampled per tile from `C.accent` → `C.accent2`). Which tiles change is a
  **seeded** list, so the hook, scene 6 and scene 8 reuse the same tiles (the viewer sees the
  same patches go dark and come back). Conveyor cards are ~70 × 90 px, gradient (terminal) or
  white with a "W" glyph (replay); in `replay` mode the white card ratio is 1 in 10. Modes:
  `hook`, `paper`, `test`, `knob`, `zero`, `replay`, `methods`. The share of tiles that go dark is
  **illustrative**, not proportional to −0.078 (a literal 8 % would be invisible); keep it at
  roughly a quarter of the white tiles so it reads, and let the gauges and numbers carry the size.
- **LoRA glass.** `alpha(C.text, 0.08)` sheen with a diagonal highlight, a small padlock glyph in
  `C.muted`; adapter column ≈ 1 tile wide, full height, on the right edge. Under glass, no white
  tile ever changes state. In `methods` both walls are on screen together (two ~440 px walls side
  by side in the vertical stage).
- **Gauges (scene 4 onward).** Four small horizontal gauges with the benchmark names. Drops in
  scene 6 use the repo's per-benchmark means at 0 % (illustrative ordering): ARC-Challenge
  −0.048, ARC-Easy −0.153 (labelled "−0.15" as the article writes it), HellaSwag −0.078,
  WinoGrande −0.031. Only "−0.078" (average) and "−0.15" (ARC-Easy) are printed as numbers.
- **`ReplayCurve` (bespoke, data).** The article's chart, redrawn in brand tokens with direct line
  labels (no legend). x: 0 %, 10 %, 25 %, 50 %; y: change in general accuracy, 0 line marked.
  Full fine-tuning (line in `C.accent`, end label "Full fine-tuning"): −0.078, −0.021, −0.012,
  −0.015. LoRA (line in `C.text`, label "LoRA"): +0.002, +0.005, +0.009, +0.009. Values from
  `docs/EXPERIMENTS.md` (Phase 1, Phase 2 LoRA 0.5B), identical to the article's chart. The 100 %
  control is not plotted (as in the article). Only "−0.078", "≈73% back", "≈82%" and the task
  meter "≈0.90" are printed as numbers; the other points are just dots.
- **`TerminalProbe` (bespoke).** Monospace card. In-distribution (scene 2): `echo hello >
  notes.md`, `cat notes.md` → `hello` + `[exit 0]` (the repo's `build_scenario` template and
  system prompt's exit marker). Out of distribution (scene 15): `echo banana | sed 's/a/X/g'` →
  `bXnXnX` (a `build_scenario_hard` template; the article names sed, awk, grep and pipes). The
  wrong guess shown for full fine-tuning is illustrative (e.g. `banana [exit 0]`): the article
  gives only the score, not sample outputs. LoRA's "0.15" is a meter, not a claim that this
  command was solved.
- **`CostReceipt` (bespoke, the verdict).** Two receipts, monospace items, a dotted separator,
  "at 0% mixing" in the header. Lines: "General reasoning −0.078 | ≈0", "Instruction-following
  −37% (0.194 → 0.123) | +0.033", "Unseen commands 0.00 | 0.15". Line 1's LoRA value is "≈0"
  (article: "barely forgets"; repo +0.002), not a number. The lens is a rounded rect in
  `alpha(C.accentText, 0.25)` with the label "one benchmark", sized to cover exactly one line.
  Stamps: "3 COSTS" in the gradient on the full-FT receipt; "mostly spared" in `C.muted` outline on
  LoRA's. Mode `dial` (scene 18): a horizontal slider between the two trade-off labels.
- **Numbers on screen, exactly as the article writes them:** "0.36 → 0.90" (article "~0.36 to
  ~0.90"), "−0.078", "−0.15", "10%", "≈73% back", "≈82%", "≈0.90", "0.5B", "397B", "3 seeds each",
  "−37%", "0.194 → 0.123", "+0.033", "0.00", "0.15". No "−0.14 / −0.17" anywhere (see factcheck:
  the article's base-vs-instruct figures do not match its data, and the video does not use that
  nuance). No 1.5B figures.
- **Names on screen:** "0.5B model" (the chip may add "Qwen2.5-0.5B-Instruct" in small text, as
  data); the paper is a generic "recent world-model paper · 397B" tag, not its title. Benchmarks
  by name. The only brand on cards, poster and metadata is AGILabs.
- **Spoken forms:** "0.078" → "point oh seven eight"; "0.15" → "point one five"; "10%" → "ten
  percent"; "73%" → "seventy-three percent"; "37%" → "thirty-seven percent"; "LoRA" → "LOR-ah"
  (one word, not spelled out); "javieraguilar.ai" → "javier aguilar dot A I".
- **Captions (estimate at ~2.8 words/s, spoken words):** every line ≤ 16.8 chars/s. Tightest:
  scene 14 (16.8, "Instruction-following" is one long word; the TTS takes longer over it than the
  word estimate, so the real rate will be lower), scene 16 (16.8), scenes 2 and 11 (16.5). Scenes
  16 and 17 stay two separate cues. `npm run lint` after TTS is the gate.
- Visuals are chosen for impact, not as a literal replay of the experiment: the wall, the
  conveyor, the tile counts, the glass and the receipt are stylised; the rigour lives in the
  article and the repo. Narration and every number on screen stay faithful to the article.
- **Left out on purpose** (in the article, not in the video): base vs instruct (its figures are
  inconsistent, see factcheck), the 1.5B size result (soft, comparable to seed noise), the 100 %
  control, the T4 / cost note. The video's story is mechanism → replay → method → bill.
- ES cut: pending (EN-only for now).
