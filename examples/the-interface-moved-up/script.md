# The Interface Moved Up — article video (EN) · script v1.1 (reviewed)

Article: "The Interface Moved Up" (javieraguilar.ai, EN; on branch `blog/the-interface-moved-up`,
`pubDate` 2026-10-27, not yet on `main`). Essay, no experiment and no `repoUrl`. Vertical 9:16,
target ~65 s, 141 spoken words. ES column left empty (EN-only for now).
Data on screen: only the article's own content (the launch timeline of its first figure, the four
rising steps of its second, the surfaces-over-harness stack of its third). No external data.

## Central visual metaphor: the camera pulls back

One continuous shot, a dolly-out in four stops. The video opens in macro on a single line of
code with a blinking cursor; every time the narration jumps a stage, the camera pulls back and the
thing we were looking at turns out to be a small part of a bigger frame:

1. **The line** (editor): one line of code, a ghost completion types itself in grey after the
   cursor and is accepted (Tab). The human is close enough to read every character.
2. **The diff** (terminal): pull back, and that line is one green `+` row in a diff hunk, next to a
   terminal pane where commands scroll by on their own (`run tests ✓`, `git commit`). The code is
   now something to review, not to write.
3. **The result** (cloud + app): pull back again: the terminal is one session card among several in
   an app sidebar (chat, cloud, local, each with a small status dot); the main panel shows a
   rendered result (a preview page, a PR with a green check); a phone at the side mirrors the same
   sidebar. The diff is one click away, collapsed.
4. **The metrics** (unattended): last pull back: the whole app is one small tile on a conveyor
   (feedback bubble → ticket → agent → PR), many tiles flowing without anyone pressing start;
   above the conveyor, a dashboard of three gauges (evals · feedback · tests) and a short queue
   "needs your judgement".

The previous levels never disappear: each one stays visible inside the next, dimmed, as a nested
frame (picture-in-picture), so at the widest shot the viewer can still see the tiny line of code
at the centre. That is the article's "no surface disappeared" as a picture.

A thin **altitude ladder** on the right edge of the stage (four rungs: the code · the diff · the
result · the metrics, the article's second figure as a ladder) lights one rung higher at each
pull-back, in the accent gradient; the earlier rungs stay lit, muted.

One break from the dolly: **the harness drop**. The surfaces (terminal, IDE, desktop app,
phone, ticket, clock) detach from the shot and fall onto one wide slab labelled "Harness", with a
thinner "Model" slab under it: different windows, one agent underneath.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | First the code. Then the diff. Then the result. | | Hook as a 3-s teaser of the whole shot: macro on a code line (on "code"), a fast pull back to the diff (on "diff"), another to the app with a rendered preview (on "result"). Each word lands in the hook card as the camera hits its level | intro over bespoke `PullBack` (mode `teaser`) | "Each jump raised what the human looks at. First the code, then the diff, then the result." |
| 2 | Each jump raised what the human looks at. | | Snap back to the macro start. The altitude ladder fades in on the right, empty, four rungs labelled | `PullBack` (mode `ladder-in`) | "**Each jump raised what the human looks at.**" |
| 3 | In the editor, I typed; the model completed. | | Level 1. A line of code; the cursor types a few characters, a grey ghost completion fills the rest of the line, accepted with a Tab flash. Rung "the code" lights. Small stamp "2021" | `PullBack` (level 1) | "I started working with AI inside the editor"; "The unit of work was a line or a function: you were typing, and the model completed." |
| 4 | In the terminal, the agent got the whole machine. | | Pull back to level 2: the line is a `+` row in a diff hunk; a reviewer's eye-line sweeps down it and a ✓ lands (the human now reads, not writes). Beside it, a terminal pane where commands run by themselves (tests, git, a package manager), with thin wires running out of the shell to small tool icons around the machine. Rung "the diff" lights. Stamp "2025" | `PullBack` (level 2) | "Then I moved to the terminal, with a light editor open next to it."; "Handing the agent a terminal is the cheapest way to hand it everything."; "an agent that can run fifty commands on its own needs the whole machine, not a completion box."; "You still look at code, but as a reviewer rather than an author."; "In both, the human looks at the **diff**"; "the terminal became the main road" (2025) |
| 5 | Then the cloud, partly for capacity: several agents at once saturate a laptop. | | Pull back a little: the terminal sits on a laptop screen; it splits into 2, 4, 8 panes, a heat shimmer and a load meter in the red. On "cloud" the panes lift off the laptop and float up into cloud slots, each still running. Hold ~0.2 s after the line | `PullBack` (level 2→3, `saturate`) | "Convenience is only part of the reason. The other part is capacity. Running several agents at once, each with its own branch and test suite, saturates a normal laptop long before it saturates your attention." |
| 6 | Then the app: every session in one sidebar, the result in view. | | Pull back to level 3: the cloud panes become session cards in an app sidebar (a chat, a cloud session, a local session, each with a status dot); the main panel shows a rendered result (preview page, PR ✓), the diff collapsed beside it; a phone slides in mirroring the sidebar. Rung "the result" lights. Stamp "2026" | `PullBack` (level 3) | "in the same sidebar live ordinary conversations, remote coding sessions and local ones."; "Diff, git, pull requests, artefacts, a preview panel and an embedded browser to see the result."; "The app: the same work, but you can see it" (section title); figure 2: "App + cloud · the result"; "You start something at the desk and follow it from your phone."; "Here is where 2026 happened." |
| 7 | No surface disappeared. / The editor just stopped being the centre. | | Two beats. Beat 1: hold the wide frame; the nested levels light up one by one inside it (the terminal pane, the diff, at the very centre the tiny code line still blinking). Beat 2: the code-line frame slides off-centre to a corner of the app, still lit, then everything dims back | `PullBack` (level 3, `nested`) | "**no surface disappeared**. The editor is still there, the terminal is still there, and the new surfaces were added on top."; "The editor wasn't replaced, it stopped being the centre." |
| 8 | Terminal, app, phone: / views of one agent, with one harness underneath. | | The harness drop. Beat 1: the surfaces (terminal, IDE, app, phone, a ticket, a clock) detach from the shot. Beat 2: they dock, in quick succession, onto one wide accent slab "Harness" (small labels: permissions · tools · inputs and outputs · context and memory · escalation to a human), a thinner muted "Model" slab beneath; one glowing agent dot passes through every tile and down into the slab | bespoke: `HarnessStack` | "The same agent now runs in the terminal, in the IDE, in the desktop app, in the browser, from the phone, from a ticket in Linear or Jira, or on a schedule. What makes it *that* agent lives underneath and is shared by all those surfaces: the **harness**."; caption of figure 3: "The surface is a choice of view over the same agent." |
| 9 | Next, a ticket arrives, an agent builds it, and nobody opens a session. | | Back to the dolly, last pull back to level 4: the app shrinks into one tile on a conveyor: a feedback bubble becomes a ticket, the ticket flows into an agent, a PR comes out; more tiles follow by themselves. A start button nobody presses, greyed | `PullBack` (level 4, `conveyor`) | "The next jump is already visible, and in it the human doesn't even start the work."; "The chain looks like this: a customer leaves feedback, a ticket is created, an agent develops it … Nobody opens a session." |
| 10 | The human watches the metrics: evals, feedback, tests. / Mostly in preview, but already launched. | | Beat 1: above the conveyor a dashboard fades in: three gauges labelled evals · feedback · tests, needles moving; a short queue "needs your judgement". Rung "the metrics" lights; the whole ladder is lit. Beat 2: small "preview" tags pin onto a few conveyor tiles; the tiles keep flowing anyway. Hold ~0.3 s after each line | `PullBack` (level 4, `dashboard`) | "the human supervises the *performance* of that process through evals (automated too), external feedback and final testing."; figure 2: "Unattended · the metrics · a flow of tickets · evals · feedback · tests"; "Most of it is still in preview, but it's already launched." |
| 11 | What sets a team apart won't be the window. / It's what its agents may do, what they receive, what they return, and when they call a human. | | Beat 1: the widest frame; all nested windows dim to outlines ("the window"). Beat 2: the harness slab slides up under the conveyor and its four contract labels light one by one, on the words: permissions ("may do"), inputs ("receive"), outputs ("return"), escalation ("call a human"); on the last one a tile on the conveyor stops and rings a bell into the judgement queue | `PullBack` (level 4, `contract`) | "What will set a team apart, then, is not which window it uses. It's how well it has defined what its agents may do, what they receive, what they return and when they call a human."; figure 3 slab: "permissions · tools · inputs and outputs … escalation to a human" |
| 12 | Fewer keyboards, more dashboards. | | KeyQuote over the dashboard; "dashboards" in the accent with the underline, a keyboard outline fading as it lands. Hold ~0.5 s after the line | `KeyQuote` (emphasis "dashboards") | "That's a management problem, and it's where the interface is heading: fewer keyboards and more dashboards." |
| 13 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, "The Interface Moved Up" | outro | — |

A " / " in the narration column splits the scene into two `say()` lines (two beats, two caption
cues).

**Word count (EN):** 9 + 8 + 8 + 9 + 13 + 12 + 10 + 11 + 13 + 14 + 27 + 4 + 3 = **141 words**.
At ~2.8 words/s (Javier's cloned voice) that is ~50 s of speech; with 13 scenes (~0.35 s lead-in
and 0.8 s tail each), the in-scene gaps and the holds on scenes 5, 10 and 12 it comes to
**≈64-66 s**. Within the "up to ~70 s" allowance. If it has to come down to ~60 s, in this order:
shorten scene 11's second line to "It's what its agents may do, and when they call a human." (−7
words, the draft's abridged list), then drop the second line of scene 10 (−6 words, the preview
hedge moves to an on-screen "preview" tag only, which is still faithful).

## Notes for the build

- **`PullBack` (bespoke, the spine)**: one scene-spanning camera on a single SVG world, nested
  frames at four scales (each ~6-8× the previous). The camera is a `scale` + `translate` on the
  world, eased (`easeOutCubic`) between level keyframes, one pull per beat. Modes: `teaser` (three
  fast pulls in 3 s, then reset), `ladder-in`, levels 1-4, `saturate` (pane split + heat + lift to
  cloud), `nested` (inner frames re-light one by one), `conveyor`, `dashboard`, `contract`. The
  altitude ladder is a fixed overlay on the right edge (outside the camera transform), four rungs,
  the lit rung in the brand gradient, earlier rungs muted. At level 4 the code line at the centre
  is a few pixels wide: keep a soft glow so the viewer can still find it.
- **Rendering at scale**: draw each level as vector SVG so the macro start (level 1) stays crisp
  at ~40× zoom; do not rasterise the world. Text in the inner frames is decorative once it is
  under ~10 px on screen; replace it with grey bars below that size (level-of-detail switch by
  camera scale) to avoid shimmering.
- **`HarnessStack` (bespoke)**: six surface tiles (Terminal, IDE, Desktop app, Web · mobile,
  Tickets, Schedules · events, the article's third figure) dock one per beat onto a wide accent
  slab "Harness"; five small labels on the slab (permissions · tools · inputs and outputs ·
  context and memory · escalation to a human), of which permissions, inputs, outputs and
  escalation are addressable so scene 11 can light them one per word; a thinner muted slab
  "Model" underneath. Tile labels generic: no product logos, no Linear/Jira wordmarks. Decided
  in review (v1.1): no product names anywhere on screen. The article names them and the thesis
  is vendor-neutral; names on tiles or stamps would turn the dolly into a product timeline and
  date the video faster.
- **Level contents (illustrative, not a replay of any real session):** code line = a short
  generic function line; diff = 3-4 rows, one `+` highlighted; terminal = generic commands
  (`npm test ✓`, `git commit -m "…"`); sidebar = three session cards with neutral titles
  ("chat", "cloud · fix-auth", "local · refactor"); result = a simple preview page and a PR card
  with a check; conveyor tickets = generic ("Feedback: export is slow" → "TICKET-123"). No real
  repository, ticket ID or company name from Javier's work.
- **Year stamps (optional)**: "2021" (editor: Copilot preview, June 2021), "2025" (terminal:
  "the terminal became the main road" in 2025; cloud agents arrived May 2025), "2026" (app:
  "Here is where 2026 happened"). Level 4 gets no year: the article dates its pieces from May
  2025 but frames it as the next jump. Small, muted, top-left of the stage. Kept in review (v1.1):
  they carry the article's "almost everything that matters happened in the last twenty months"
  density at no word cost. Drop them only if they collide with the ladder in stills.
- **Colours**: the article's figures use teal/sky/amber per lane; the video uses brand tokens only
  (`C`, `GRADIENT`): the current level and lit rung in the indigo→violet gradient, earlier levels
  muted grey. The harness slab is the accent, the model slab muted.
- Visuals are chosen for impact, not as a literal record: the dolly, the laptop heat, the conveyor
  and the gauges are stylised; the rigour (dates, sources) lives in the article. Narration and
  every label on screen stay faithful to the article.
- **Labels on screen, as the article writes them**: "the code", "the diff", "the result", "the
  metrics" (ladder, from figure 2); "evals · feedback · tests" (figure 2, unattended column);
  "Harness" / "Model" and the slab labels (figure 3); "needs your judgement" (article: "a queue of
  what needs your judgement"); "preview" (article: "still in preview").
- **Spoken forms**: none needed; "javieraguilar.ai" as usual in the outro.
- **Caption speed** (estimated at ~2.8 words/s, Javier's voice): long-word lines run faster in
  characters than in words, so: scenes 7 and 8 are split into two `say()` lines (each half
  ≤17 c/s; single lines would be ~18 c/s); scene 5 (78 chars, ≈17 c/s) gets a ~0.2 s hold;
  scene 10's two lines (≈19 c/s each by estimate) get ~0.3 s holds each; scene 12 ("Fewer
  keyboards, more dashboards.", 33 chars in ~1.4 s) gets a ~0.5 s hold so it stays ≥2 s.
  Re-run `npm run lint` after `npm run tts`; real durations decide.
- **Data extraction**: none. The essay has no experiment repo; the three figures are inline SVG in
  the article and only their labels are reused (no need to extract data).
- **Credits in the outro**: none needed (no third-party data, footage or logos).
- ES cut: pending (EN-only for now).

## Review log

- **v1.1 (independent review, 2026-10-19)**, against branch tip 30d88277:
  - Old scene 5 ("I read the diff, as a reviewer") cut; its visual (eye-line + ✓) and the "the
    diff" rung moved into scene 4, so the reviewer idea stays on screen at no word cost.
  - Scene 5 (cloud): "partly for capacity" added. The article says "Convenience is only part of
    the reason. The other part is capacity"; the draft read as capacity being the reason.
  - Scene 6 (app): "the result one click away" → "the result in view". In the article "one click
    away" is the *evidence* a good surface should offer, not a description of the app; level 3
    is where the human looks at the result.
  - Scene 8 (harness): "views over the same harness" → "views of one agent, with one harness
    underneath". The article's figure caption says the surface is a view over the same *agent*;
    the harness is what lies underneath and makes it that agent.
  - Scene 9 (unattended): "In the next jump" → "Next", source now quotes "the human doesn't even
    start the work".
  - Old scenes 11 + 12 merged into one two-beat scene (fewer scene tails).
  - Scene 11 (contract): the article's full four-item list restored ("what they receive, what
    they return"), and the visual now lights the four matching harness labels one per word, so
    the close reuses the harness mechanism instead of a generic dim.
  - Scenes 7 and 8 split into two lines for caption speed; speed re-estimated at 2.8 words/s.

