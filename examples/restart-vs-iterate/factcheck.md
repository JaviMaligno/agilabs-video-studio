# Fact-check: Let the Loop Iterate (v1.0)

Source: `src/content/blog/en/restart-vs-iterate.md` on `origin/main` of the website repo (pubDate
2026-07-17; **current text includes the 2026-07-19 correction** of finding 4, commit `37eeac5e`,
which reframes the restart-style result with the matched-subset counterfactual). Scope: narration,
plus the numbers and text shown on screen. Visuals are illustrative. Numbers were also re-derived
from the experiment's artifacts (`JaviMaligno/CooperBench`, branch `experiment/restart-loop`,
`logs/R-*`, `experiment/RESTART_DESIGN.md`).

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "Your coding agent is stuck. Should it start over?" | "when a coding agent's attempt is going badly, don't keep patching the sinking ship — throw the attempt away and let it start fresh" | OK. A question, no claim. |
| 2 | "Andrej Karpathy put it as: let the loop restart." | "a piece of agent folklore, crystallized by Andrej Karpathy as *"let the loop restart"*" | OK as the article states it. "put it as" = "crystallized as". On screen the line is tagged "agent folklore · Andrej Karpathy's phrasing", keeping the article's framing (folklore he phrased, not a study of his). Verbatim source not given in the article: see questions. |
| 3 | "I built a loop on real code: write a feature, see the tests, try again." | "So I built one."; "29 single-feature tasks across 5 real repositories"; "the harness runs the feature's test suite and shows the agent the results … then comes the next round" | OK. "real code" = existing real repositories (the article's "existing codebases"). |
| 4 | "Four rounds, same budget. All I changed was what happens in between." | "up to **K = 4 rounds**, stopping early on success"; "Every policy gets the same K, the same per-round compute caps, and the *same feedback format* — so the only variable is what happens **between** rounds" | OK. "same budget" = same K and per-round caps ("Equal compute, honestly"). |
| 5 | "Iterate: keep the code, read the failures, and patch." | "**ITERATE** — the classic loop: code and context accumulate; the agent patches its own work with the test results in hand." | OK. |
| 6 | "Restart: wipe it all and start clean every round." | "**RESTART-FRESH** — … each round starts from a clean checkout with a fresh context. No memory of prior attempts." | OK. |
| 7 | "Or a restart button: the agent picks when, and how much to throw away." | "**AGENT-DECIDES** — … an explicit **restart tool with scope** — `restart(file \| directory \| all-my-work)` — presented as a legitimate, cost-free option. It chooses when to discard and *how much*." | OK. "button" is the video's image for the tool; the article itself says "a restart button" in the closing section. |
| 8 | "Iterating won. My stronger model solved 86% of features; clean restarts, 69%." | Table: "iterate … 86% [79–90]"; "restart-fresh … 69% [69–69]"; "gpt-5.4 iterate wins 17–2 over restart-fresh (p=0.001)"; "The literal *let-the-loop-restart* … **loses** on this benchmark." | OK. 86% / 69% are 3-seed means over 29 features, as the table. "Iterating won" is decisive only for the strong model; scene 9 carries the weaker model's hedge. |
| 9 | "The weaker model leaned the same way." | "mini leans the same way (15–6, p=0.078)" | OK. Article's own verb; on screen "leans · p = 0.078", no claim of significance. |
| 10 | "With the button, the strong model reached 91%, its best." | "Agent-decides tops both tiers (91% for gpt-5.4, its best; 75% for mini)." | OK. |
| 11 | "It didn't hurt, but its edge over iterating isn't proven." | "Handing the agent the decision … never hurts."; "Against pure iterate the edge is not significant (8–4, p=0.39) … a plausible-but-unproven bonus and costs nothing." | OK, slightly softer than the article's "never hurts" (see "Article vs data", item 2). |
| 12 | "The difference: how each model used it." | "**The capability marker is restart *style***" | OK. |
| 13 | "The strong one restarted rarely, and usually just one file." | "the strong model restarted **rarely and surgically** (7 restarts, 5 file-scoped …)" | OK. "usually" = 5 of 7. |
| 14 | "On 4 features iterating never solved, it rescued 3. A hint, not proof." | "Those same 4 features solve **0/4 under iterate**; the scoped restart turned three of them into wins. … at n=4 it's directional (exact p≈0.25), not significant." | OK. Uses the corrected (2026-07-19) matched-subset framing. "A hint, not proof" = "directional, not significant". Says "it rescued", not "the one-file restart rescued" (see item 1 below). "features" = feature-runs (feature × seed); the 4 are distinct feature+seed pairs. |
| 15 | "The weak one restarted a lot, and mostly wiped it all." | "the weak model restarted **often and destructively** (34 restarts, 23 of them `scope=all` …)" | OK. "mostly" = 23 of 34. |
| 16 | "Iterating failed nearly all of those too: the wipe-outs were a symptom, not the cause." | "Those same 14 features solve just **2/14 under iterate**"; "**Weak tier — the wrecking ball is a symptom, not the cause.**"; "the agent razed everything *because* the feature was already lost" | OK. "nearly all" = 12 of 14 failed under iterate. This is the corrected claim; the pre-correction "destroys work" reading is not used anywhere. |
| 17 | "The verdict, on these tasks: keep the code and iterate." | "*in the regime I measured* — feature-sized tasks on existing codebases, four rounds, tests visible — restart-as-resampling loses to iteration"; "Default to **iterate with visible tests**" | OK. "on these tasks" keeps the regime hedge; the card adds "existing codebases · 4 rounds · tests visible". |
| 18 | "Restart only if you know what to throw away." | Title: "Restarting Only Pays If You Know What to Throw Away" | OK. Article's title. |
| 19 | "Here, only the stronger model knew." | "expect **only your stronger models to wield it well** — on our data, the strong tier's scoped reverts rescued features plain iteration lost (3/4 vs 0/4 …), while the weak tier's restarts merely marked work that was already sunk"; "knowing *what* to throw away is the metacognition, and it's the strong tier's scoped restart that actually pays" | OK. "Here" limits it to this experiment; "knew" is the article's metacognition reading, resting on the n=4 hint already hedged in scene 14. |
| 20 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| "let the loop restart" + "agent folklore · Andrej Karpathy's phrasing" | 2 | "agent folklore, crystallized by Andrej Karpathy as *"let the loop restart"*" | No photo, no logo. |
| "29 features · 5 real codebases · 2 models" | 3 | "29 single-feature tasks across 5 real repositories, two model tiers" | |
| "2 failing" feedback card | 3 | "pass/fail counts plus the failing tests' output" | Illustrative value. |
| Four round pips, equal coin stacks, "only this changes" | 4 | "the same K, the same per-round compute caps … the only variable is what happens **between** rounds" | |
| Lane 1 readout "4 → 1 → 0" ✓ | 5 | Real run: `R-large-iterate-s3`, one click feature, failing tests per round 4, 1, 0 | Labelled "one real run". |
| Lane 2 readout "3 → 3 → 4 → 3" ✗ | 6 | Real run: `R-large-restart-fresh-s3`, same feature, failing 3, 3, 4, 3 | Labelled "one real run". |
| Scope dial "one file · a folder · everything" | 7 | "`restart(file \| directory \| all-my-work)`" | Plain-word labels for the three scopes. |
| "agent's choice · costs nothing" | 7 | "presented as a legitimate, cost-free option" | |
| "86%" vs "69%", "3 seeds · 17–2 · p = 0.001" | 8 | Table; "gpt-5.4 iterate wins 17–2 over restart-fresh (p=0.001)" | Recomputed exact McNemar 17–2: p = 0.0007. |
| "74%" vs "63%", "leans · p = 0.078" | 9 | Table; "(15–6, p=0.078)" | Recomputed: p = 0.078. |
| "91%" | 10 | "91% for gpt-5.4, its best" | |
| "8–4 · p = 0.39 · not significant" | 11 | "the edge is not significant (8–4, p=0.39)" | Recomputed: p = 0.388. |
| "7 restarts · 5 one file" (5 scalpel cuts, 2 full wipes) | 13 | "7 restarts, 5 file-scoped" | Logs: file 5, all 2. |
| Chips "0/4" (iterate) → "3/4" (with button), "n = 4 · a hint" | 14 | "0/4 under iterate"; "3 of 4 restarted feature-runs solved"; "at n=4 it's directional (exact p≈0.25)" | Logs: 0/4 and 3/4 reproduce; exact p = 0.25. |
| "34 restarts · 23 everything" (23 wrecking-ball swings, 11 scalpel cuts) | 15 | "34 restarts, 23 of them `scope=all`" | Logs: all 23, file 11. |
| Chips "1/14" (with button), "2/14" (iterate), "already lost", "symptom, not cause" | 16 | "only **1 of 14** restarted feature-runs solved"; "Those same 14 features solve just **2/14 under iterate**"; "the wrecking ball is a symptom, not the cause" | Logs reproduce 1/14 and 2/14. |
| Verdict card: "Keep the code. Iterate." / "existing codebases · 4 rounds · tests visible" / "Restart only if you know what to throw away." / strong tower ✓, weak greyed | 17-19 | See narration rows 17-19 | |

## Deliberately left out

- **Restart-informed** (69% / 79%, one seed; finding 2, "what hurts … is losing the working
  tree"). Cut for length: it is a one-seed side arm and the video's restart lane already shows the
  working tree being lost. Not contradicted anywhere.
- Mini's agent-decides 75%, the cost (~$102), the pilot bugs and the audit: method detail, not
  needed to follow the result.
- The regimes where restarting might win (greenfield, long horizons, very weak models): covered in
  narration only by the hedge "on these tasks" and the card "existing codebases · 4 rounds · tests
  visible".

## Article vs data (problems found in the article)

1. **The strong tier's three rescues were not all scoped.** Recomputed from
   `round_*/decision.json`: of the 4 strong-tier feature-runs with a restart, the 3 solved ones
   are seed 1 (go_chi 56 f1: two `file` restarts), seed 1 (go_chi 26 f2: one `file` restart) and
   **seed 3 (go_chi 56 f5: one `scope=all` restart)**. So one of the three "scalpel" rescues was a
   full wipe. The article says "the scoped restart turned three of them into wins" and "the strong
   tier's scoped reverts rescued features plain iteration lost (3/4 vs 0/4)". Accurate wording
   would be "restarts, mostly file-scoped, turned three of them into wins" (2 of 3 rescues were
   file-scoped). The video avoids the claim ("it rescued 3", not "one-file restarts rescued 3")
   and the build note tells the animator not to tie every rescued chip to a scalpel.
2. **"Never hurts" holds on the means, not per seed.** Mini agent-decides is 75% [69–79] vs
   iterate 74% [72–76]: at least one seed of agent-decides (69%) sits below iterate's worst seed
   (72%). Strong tier: 91% [90–93] vs 86% [79–90], fine. The video says "It didn't hurt", which
   the means support; "never" is a little strong for mini.
3. **Minor: the "directory" scope was never used.** All 41 logged restarts are `file` (16) or
   `all` (25). The tool offered it, so the article is not wrong; the video shows "a folder" on the
   dial but never animates it.

Everything else in the table, the McNemar counts and p-values, and the 7 / 5 / 3-of-4 and
34 / 23 / 1-of-14 / 2-of-14 figures reproduces exactly from the logs.
