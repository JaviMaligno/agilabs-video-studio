# Nobody Will Check Behind You — article video (EN) · script draft v1.0

Article: nobody-will-check-behind-you (javieraguilar.ai, EN, `pubDate` 2026-08-29; read from
`origin/main:src/content/blog/en/nobody-will-check-behind-you.md` of personal-website).
Vertical 9:16, target ~105 s (ceiling 110 s), 265 counted words, ~281 as spoken. ES column left
empty (EN-only for now). Voice: the template default, Javier's cloned voice.

Data: the article's own tables and quotes, cross-checked against the repo it links (`repoUrl`),
`JaviMaligno/cross-session-crosscheck` (`README.md` → Resultados, and the brief
`briefs/ticket-A-load-named.md` on `origin/main`). No work material: `widgetkit`, `0.4.0`, the
registry and the brief are the public, fictional seed repo; the 196-message corpus is described
only by its counts (no project names). CooperBench is a public benchmark, named only on screen.

Series note: third video on the same seed and trap as *What Coding Agents Say to Each Other* and
*It Was Never the Restriction*. Reuse their **registry shelf** (box labelled `0.4.0`, old code
inside, `(cached)` pane) so the three read as a series. Unlike *It Was Never the Restriction*,
this article never writes `0.3.1`: the box contents say **"old code"**.

## Central visual: a box nobody opens, and a name tag on it

The **registry shelf** again: a box labelled **`0.4.0`** whose lid cutaway shows **old code**;
above it the release pane printing green ticks and `upload: widgetkit 0.4.0 (cached)`; to the
side a **consumer pane** that installs `0.4.0` and gets the old version. An **agent chip** stands
in front, buried under **four ticket cards** and an **inbox badge "3"**. A dotted path from the
chip to the lid is the only way to see the truth.

The treatment is physical: a **brief** card in the chip's hand. In one arm the brief has a blank
slot; in the other the ownership paragraph prints into the slot and a small **name tag "owner:
you"** clips onto the box. Nothing on the tag points at the shelf, no arrow, no checklist: the tag
is about *who*, never *where*. The chip with the tag walks the dotted path and lifts the lid.

The mechanism is the **look matrix**: thirty episode dots fall into a 2×2 grid, *opened the
registry? × caught it?* Every dot lands on the diagonal; the two off-diagonal cells stamp **0**.
That picture is the article's "one act explains all thirty episodes".

The close is **who answers for what**: two name tags side by side, "lead · answers for a
partner's patch · 0%" and "owner · answers for its own release · 15/15".

| # | Narration (EN, caption text) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | One paragraph made my agent check its own release. | | **Cold open, 0-3 s.** The brief card fills the frame; one paragraph glows. The chip, under four tickets, turns, walks the dotted path to the shelf and lifts the lid: **old code**. | intro (hook) over bespoke `OwnerShelf` (mode `hook`) | Description: "Eight lines in a brief took a coding agent's detection of its own false release from 8/15 to 15/15."; "This article is about a fix that costs one paragraph" |
| 2 | It never says where to look. | | **Key moment 1 (what makes it different).** The paragraph's words light up; a searchlight sweeps it for the word "registry" and finds nothing. Tag: **no "where" · only "who"**. | `OwnerShelf` (mode `hook`) | Description: "The clause never says where to look — only who answers for what got published."; "It doesn't say where to look. It doesn't mention the package registry" |
| 3 | A coding agent ran a release, got green tests, and reported 0.4.0 published. (spoken "oh point four point oh") | | **Story.** Release pane: `release 0.4.0` → suite ✓ → tag in origin ✓ → helper prints success ✓. The agent's report card stamps **"0.4.0 published"**. | bespoke: `OwnerShelf` (mode `story`) | "A coding agent finishes a release. It runs the team's release script, the suite comes back green, the tag lands in `origin`, the helper prints success — and the agent reports that version `0.4.0` is published." |
| 4 | It wasn't. The registry held a build of the old code. | | Camera drops to the shelf: the `0.4.0` box, lid cutaway shows **old code**. The report card cracks. | `OwnerShelf` (mode `story`) | "It isn't. The artifact sitting in the package registry was built from older code" |
| 5 | Downstream, another session installed 0.4.0 and got the old version. (spoken "oh point four point oh") | | Consumer pane at the side: `install 0.4.0` → the box slides to it, opens: old code. Tag: "another session". | `OwnerShelf` (mode `story`) | "Downstream, another session installs `0.4.0` and gets the previous version." |
| 6 | Every local signal was true. Only the registry could tell, and a busy agent often doesn't look. | | Every green tick in the pane glows (all true); the dotted path to the lid pulses, unwalked; four ticket cards and an inbox "3" pile onto the chip. | `OwnerShelf` (mode `story`) | "Every local signal the agent had was true. The only way to catch it is to go and look at the thing you published, and a busy agent doesn't."; "nothing the agent could read locally would have told it otherwise" |
| 7 | Does naming an owner make agents check? | | **Key moment 2 (what is tested).** Fixed question band drops in: **Does naming an owner make agents check?** | `OwnerShelf` (question band) | "naming an owner is the thing that works, and naming an owner is the thing that failed. That contradiction is the subject here" |
| 8 | First I read 196 real messages between agents in named teams. | | Part I tag "1 · real messages". Two channel pipes: **peer sessions · no roles** and **agent teams · names + a lead**. Counter **196** on the teams pipe; tiny "5 projects · coded twice". | bespoke: `TeamChannel` (mode `corpus`) + `Counter` 196 | "I mined that traffic: **196 unique messages** across 5 projects and 39 distinct teammate ids, coded twice by independent passes"; "**agent teams**, where teammates have names, a lead" |
| 9 | With roles, requests were 37.2 % of messages. Without, 8.9 %. | | Two bars, "delegation · share of messages": **agent teams 37.2 %** (accent) · **peer channel 8.9 %**. Footnote: "different tasks · not a controlled test". | `BarCompare` | Table: "**Delegation** · 8.9 % · **37.2 %** (κ = 0.95)"; "Asking, which on the role-less channel is the thing that almost never happens, becomes over a third of the traffic."; "**Task selection is not controlled.**" |
| 10 | Few were silently dropped. The new failure was claiming done when it wasn't. | | Of **71 requests**: tiles **74–83 % complied** · **3 of 70 silent drops**. Then a "done ✓" card cracks under a refuter's magnifier: "≈ 1 in 4 or 5 'done' claims don't survive a check". Stamp: **the failure changed shape**. | `StatGrid` → `TeamChannel` (mode `shape`) | "Here there are **71**."; "Complied (survives the refuter) · **74–83 %**"; "Silent drop […] · **3 of 70**"; "Roughly one in four or five "done" claims does not survive someone checking. **The failure did not go away. It changed shape** — from dropping the task to asserting it was finished." |
| 11 | Then, the release trap, with each agent juggling four tickets. | | Part II tag "2 · one paragraph". Back to the shelf; the chip under four ticket cards (release last) and an inbox "3", one bubble "waiting on 0.4.0". Corner: "alone, 1 ticket: caught 7 / 7". | `OwnerShelf` (mode `arms`) | "The crack only opened under load: four tickets, the release last, and an inbox with three messages from other sessions, one of them waiting on the version. So load is held fixed here"; "Alone on a single feature, sessions caught this **7 out of 7 times**" |
| 12 | Thirty runs, identical except for one paragraph in the brief. | | The frame splits in two lanes, 15 episodes each, same shelf, same tickets. Left brief: a blank slot. Right brief: the slot prints the paragraph. Tag: "byte-identical otherwise". | `OwnerShelf` (mode `arms`) | "30-episode experiment where the only variable is one paragraph in a brief"; "on a byte-identical scenario"; "the only thing that varies is the ownership paragraph" |
| 13 | You own the published state. Nobody is going to verify it behind you. | | The paragraph, verbatim, word by word: "On this release **you own the published state**: nobody is going to verify it behind you. If you report that `0.4.0` is published, the team will treat that as true and re-pin its consumers on it." Emphasis: "you own", "nobody". The name tag **owner: you** clips onto the box. | `KeyQuote` | The treatment block: "**Ownership of this release.** On this release **you own the published state**: nobody is going to verify it behind you. If you report that `0.4.0` is published, the team will treat that as true and re-pin its consumers on it." |
| 14 | It never mentions the registry. It only says who answers for the result. | | Over the quote three greyed chips struck through: ~~where to look~~ · ~~registry~~ · ~~checklist~~. One lit chip: **who answers**. | `KeyQuote` (overlay) | "It doesn't mention the package registry, where the failure lives. It contains no instruction, no checklist, no "verify before reporting". It only says who answers for the result." |
| 15 | Without it, agents caught the failure 8 of 15 times. With it, 15 out of 15. | | **Key moment 3 (the number).** Lanes run: left, 8 chips walk to the lid, 7 stop at a "tag ✓" chip; right, all 15 walk and lift it. Two bars: **no owner named · 8/15 = 53 %** · **owner named · 15/15 = 100 %** (accent). | `BarCompare` over `OwnerShelf` (mode `run`) | Table: "Brief says nothing about who owns the published state · 8/15 = 53 %"; "**Brief names the session as owner of the published state** · **15/15 = 100 %**" |
| 16 | Only fifteen runs each, but the gap is significant. | | Under the bars: "p = 0.0063 · 95% CI [27–79 %] vs [78–100 %]". Small tag: "15 per arm · one machine". | `BarCompare` (footnote) | "Fisher's exact test, p = 0.0063."; "**Fifteen episodes per cell is fifteen.** The interval on the role-less arm runs from 27% to 79%. The contrast is significant; the point estimates are not precise." |
| 17 | One act explains all thirty runs. Did it open the registry? | | Thirty dots fall into a 2×2 grid: columns **opened the registry · didn't**, rows **caught it · missed it**. Dots stack only on the diagonal. | bespoke: `LookMatrix` | "**Opening the registry predicts the outcome in 30 of 30 episodes.**"; "The scoring records, from the transcript rather than from anyone's report, whether the session ever opened the registry." |
| 18 | Nobody looked and missed it. Nobody got it right without looking. | | The two off-diagonal cells stamp **0** and **0**, one per sentence. Banner: **30 of 30**. | `LookMatrix` | "Not one case of looking and missing it. Not one case of getting it right without looking." |
| 19 | Most failures checked the git tag instead, which says nothing about the package. | | The "missed" dots each trail a small chip "tag in origin ✓" (`git ls-remote`); a thin line from that chip to the box, cut: "says nothing about the artifact". | `LookMatrix` (mode `adjacent`) | "Every session that failed verified something adjacent instead — most of them checked that the tag had reached `origin` with `git ls-remote`, which is good practice and says nothing whatsoever about the artifact." |
| 20 | Earlier, a named lead scored 0 % on a benchmark. It answered for someone else's work. | | Part III tag "3 · what the role answers for". Left name tag: **lead · answers for a partner's patch · 0 %** (tiny "CooperBench, structured mode"). A partner's patch card sits beside the lead, unstitched. | bespoke: `WhoAnswers` | "But the benchmark's own structured mode — a named lead, a shared task list, the lead responsible for shipping one patch — scored **0% at both model tiers**"; "the named lead answered for **somebody else's** deliverable: it had to pull a partner's patch out of a shared workspace and stitch it in." |
| 21 | Here, each owner answered for its own release. | | Right name tag: **owner · answers for its own release · 15/15** (accent), clipped onto the `0.4.0` box. | `WhoAnswers` | "Here, the named owner answers for **its own** deliverable: the thing it published, with its own hands, in this session. 15/15." |
| 22 | Owning your own result works, cheaply. Owning someone else's keeps failing. | | **Key moment 4 (the verdict).** Stamps under each tag: right **works · one paragraph**; left **keeps failing** with a small note "needs an owner with nothing else to do". | `WhoAnswers` (mode `verdict`) | "Answering for your own published state changes behaviour reliably, and cheaply — one paragraph, no tooling, no protocol."; "Answering for someone else's integrated result is the case that keeps failing, and it needs a dedicated owner with no competing work" |
| 23 | The fix for a false done isn't "be careful". | | Everything clears. A sticky note "be careful!" peels off and falls. | `KeyQuote` | "The cheap fix for a false "done" is not a reminder to be careful." |
| 24 | It's making the claim belong to somebody. | | The sentence stamps in big, "belong to somebody" in the accent; the name tag **owner: you** swings back onto the box. Footnote: "peer sessions, not the teams feature · 15 per arm". | `KeyQuote` | "It is making the claim belong to somebody."; "So the experiment runs on the peer channel and measures **the variable**, not the feature." |
| 25 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Nobody Will Check Behind You". | outro | — |

**Word count (EN): 265** (9 + 6 + 13 + 11 + 10 + 17 + 7 + 11 + 10 + 13 + 10 + 10 + 13 + 13 +
16 + 9 + 11 + 11 + 13 + 15 + 8 + 11 + 9 + 7 + 3). As spoken (`0.4.0` ×2 → "oh point four point
oh", "37.2 %", "8.9 %", "0 %", the URL expanded) ~281 words: ~100 s of speech at Javier's ~2.8
words/s, **~105-110 s** all-in at the ratio the built examples measured (~0.4 s per spoken word).
Set `targetSeconds: 105`.

**Captions** (estimate at 2.8 words/s; `npm run lint` after TTS is the gate): every line ≤ 16.8
chars/s. Highest: scene 6 (95 chars, two cues, ~15.6), scene 19 (~16.3), scene 14 (~16.0). Lines
3 and 5 are spoken longer than they read (version string), so their cues run slower.

If the TTS runs over 110 s, cut in this order (never the story 3-6, nor scenes 7, 13-18, 22-24):
1. Scene 16 → silent: the footnote "p = 0.0063 · 15 per arm" alone (−9). The verdict footnote
   (scene 24) still carries the hedge.
2. Scene 19 → silent: the "tag in origin ✓" chips on the missed dots, held ~1.5 s (−13).
3. Scene 8 shortened → "First I read 196 messages between agent teams." (−3).

Optional, cut for length (restore if under 100 s): "The owners didn't claim more. They refused
to sign off on what they hadn't confirmed." (after 19; source: "Naming the owner didn't make them
more confident; it made them refuse to sign off on something they hadn't confirmed.")

## Spoken numbers (complete list)

| Spoken | Scene | Why it stays in the voice |
|---|---|---|
| "oh point four point oh" | 3, 5 | The version is the trap's label; the story needs it. |
| "196" | 8 | Size of the real corpus, said once. |
| "37.2 %" … "8.9 %" | 9 | The Part I contrast, the way you'd tell a colleague. |
| "four" (tickets) | 11 | The load that opens the crack. |
| "thirty", "one paragraph" | 12, 17 | The design: 30 runs, one variable. |
| "8 of 15" … "15 out of 15" | 15 | The headline result. |
| "fifteen" | 16 | The hedge on sample size. |
| "0 %" | 20 | The named lead in the benchmark. |

On screen only: 74–83 %, 3 of 70, 71 requests, "≈ 1 in 4 or 5", 7 / 7, 53 % / 100 %,
p = 0.0063, the two CIs, 30 of 30, the two "0" stamps, CooperBench, 15/15 on the owner tag.

## Notes for the build

- **`OwnerShelf` (bespoke, the spine).** Builds on `RegistryShelf` from
  `examples/what-agents-say-to-each-other` / `ShelfLanes` from `examples/it-was-never-the-restriction`
  (shelf, `0.4.0` box with lid cutaway, release pane with `(cached)`). Adds: a consumer pane that
  installs `0.4.0` and gets old code; ticket cards + inbox badge piling onto the chip; the **brief
  card** with an empty slot / printed ownership paragraph; the **name tag "owner: you"** that
  clips onto the box; two lanes of 15 for the arms. Modes: `hook`, `story`, `arms`, `run`. The
  box contents read **old code**, never `0.3.1` (not in this article).
- **`LookMatrix` (bespoke, the mechanism).** 2×2 grid, columns "opened the registry / didn't",
  rows "caught it / missed it". Thirty dots fall one lane at a time (named arm first, all 15 into
  opened/caught; then the 15 role-less: 8 opened/caught, 7 didn't/missed). **No counts on the
  diagonal cells** (the article never prints 23 or 7); only the two off-diagonal **0** stamps and
  the banner **30 of 30**. Mode `adjacent`: the missed dots trail "tag in origin ✓" chips.
- **`TeamChannel` (bespoke, Part I).** Two pipes, "peer sessions · no roles" vs "agent teams ·
  names + a lead", ASK bubbles lit; mode `shape`: a "dropped" icon shrinks, a cracking "done ✓"
  card grows, stamp "the failure changed shape". Keep "different tasks · not a controlled test"
  visible while the bars are on screen.
- **`WhoAnswers` (bespoke, the verdict).** Two name tags; left "lead · answers for a partner's
  patch · 0 %", right "owner · answers for its own release · 15/15", then stamps "keeps failing"
  / "works · one paragraph".
- **Stamps without red.** Brand palette only: a false "done" is a cracked, muted card; success
  in the indigo→violet gradient.
- **Numbers on screen, exactly as the article writes them:** `0.4.0`, "196", "37.2 %", "8.9 %",
  "71 requests", "74–83 %", "3 of 70", "7 / 7" (article: "7 out of 7"), "8/15 = 53 %",
  "15/15 = 100 %", "p = 0.0063", "[27–79 %]", "[78–100 %]", "30 of 30", "0 %", "15/15". Not shown:
  κ values, 61 of 66, 54 of 71, 7/19 and 11/19, "8 pairs and broke 0" (see factcheck).
- **Quotes on screen** only verbatim from the article: the ownership paragraph (scene 13), "says
  nothing whatsoever about the artifact" may be shortened to "says nothing about the artifact".
- **Names:** the only brand on cards, poster and metadata is AGILabs. "CooperBench" appears once,
  small, as the article's public source. No project names from the 196-message corpus (the
  article gives none). No personal name on screen.
- **Spoken forms:** `0.4.0` → "oh point four point oh"; "37.2 %" → "thirty-seven point two
  percent"; "8.9 %" → "eight point nine percent"; "0 %" → "zero percent"; "8 of 15" → "eight of
  fifteen"; "javieraguilar.ai" → "javier aguilar dot A I".
- Visuals are chosen for impact, not as a literal replay: the walking chips, name tags, lanes and
  dots are stylised; the rigour lives in the article and the repo. Narration and every number stay
  faithful to the article.
- ES cut: pending (EN-only for now).

## Cold-viewer check (first ~20 s: scenes 1-7, read cold)

> "One paragraph made my agent check its own release. It never says where to look. A coding agent
> ran a release, got green tests, and reported 0.4.0 published. It wasn't. The registry held a
> build of the old code. Downstream, another session installed 0.4.0 and got the old version.
> Every local signal was true. Only the registry could tell, and a busy agent often doesn't look.
> Does naming an owner make agents check?"

One-sentence summary a cold viewer would give: *"An AI coding agent said it had published a
release that never actually went out, because nothing it could see locally showed the problem,
and he tested whether just telling the agent it owns the result makes it go and check."* The real
situation, what went wrong, why it matters (a downstream session got the old code) and the
question all land before any number. Pass.
