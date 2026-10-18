# What Coding Agents Say to Each Other — article video (EN) · script v2

Article: what-agents-say-to-each-other (javieraguilar.ai, published 2026-08-22). Vertical 9:16, target ~68 s
(hard ceiling 70 s), 158 counted words, ~173 as spoken. ES column left empty (EN-only for now).

v2 adds Part III of the article ("Then it happened for real", the nine real minutes) as its own
act with real screen time, **anonymised rather than cut**. Every substitution is listed in
`factcheck.md` → "Changes from feedback". Other lines were trimmed to make room; Part III was not.

## Central metaphor: panes that talk, and a shelf nobody looks at

The whole video lives inside a dark **split terminal**: the 9:16 frame is stacked into session
panes (two, sometimes four), each a blinking cursor with a few lines of illustrative work. Message
**bubbles** fly between panes through a thin indigo pipe in the gutter. Two kinds of bubble, told
apart at a glance:

- **ASK** bubbles: small, outlined, with a "?" glyph ("can you…", "when will…").
- **TELL** bubbles: filled indigo→violet, carrying a small "true / not true" tick or flag: a
  session telling the other something about *its own* work ("I retract…", "master is NOT red…").

Act II adds the second motif, the one the experiment hangs on: a **registry shelf** outside the
panes, below the frame's mid-line. Packages are boxes with a version on the label and something
inside. The trap is a box whose label says `0.4.0` and whose contents are the old code. The
question of the whole experiment becomes physical: *does the session walk to the shelf and open
the box, or trust the label?* The article's own phrase for it — "the check that gets made on
something other than what gets delivered" — is the label/contents gap.

Act III goes back to the panes, now four of them and **unlabelled**, with a small "real work ·
verbatim, anonymised" tag in the corner and a clock ticking from 0:00 towards ~9 min. No shelf:
the story is the bubbles themselves, the longest bubble text in the video, held long enough to read.

| # | Narration (EN, caption text) | Visual | Component | Source sentence |
|---|---|---|---|---|
| 1 | My coding agents almost never ask each other for things. | **Cold open, 0–3 s:** four stacked terminal panes, cursors blinking, bubbles zipping between them through the gutter pipe, faster and faster. On "almost never ask" the swarm freezes: only a sparse few bubbles show a "?" glyph; the rest carry ticks and flags. | bespoke: `SessionPanes` (mode `swarm` → freeze) | Description: "the channel is almost never used to ask for things"; body: "The channel is almost never used to *ask*." |
| 2 | Of 179 messages, delegation was 8.9 %. | Corner counter ticks to **179**. Every ASK bubble (about one in eleven) lights up; the rest dim. Chip: "8.9 %". | `SessionPanes` (mode `highlight-ask`) | "**179 messages over five days**"; "**Delegation — one session needing another to act so it can proceed — is 8.9 % of the traffic.**" |
| 3 | More than a third were about whether work was correct. | The ASK bubbles fade; roughly one bubble in three flips to its TELL face, a tick or a flag on it. **No percentage chip**: the caption "more than a third" carries it. | `SessionPanes` (mode `highlight-tell`) | "more than a third of the messages are about whether something is correct"; "tell the other one something true about their own work" |
| 4 | One blamed the other for a red master, then retracted: its own venv. | Zoom to two panes. Four real bubbles from the article travel in order, cropped to one line each: "master is red: 9 tests, from your d4e5f6a" → "master is NOT broken: it was the venv…" → "I RETRACT: master is NOT red, it was my venv" → "I fell for the same thing…". On "retracted", the first bubble's red flag flips to a tick. | bespoke: `SessionPanes` (mode `thread`, real lines) | The four-message chain: "*"master is red: 9 tests, from your `d4e5f6a`"* → *"master is NOT broken: it was the venv with core-lib 0.11.0 and the pin at 0.12.0"* → *"I RETRACT: master is NOT red, it was my venv"* → *"I fell for the same thing and then confirmed it to you: my isolation was sharing your venv"*" |
| 5 | So I built traps: success on screen, an old build in the registry. | From here to scene 8 the gutter pipe is **unplugged** (grey, capped): these arms have no channel. Camera drops below the panes to the **registry shelf**. One pane prints `upload: widgetkit 0.4.0 (cached)` and a green exit tick. On the shelf, a dusty box already labelled `0.4.0` sits; the new box bounces off it and vanishes. A cutaway shows the dusty box's contents: old code, stamped `0.3.1`. | bespoke: `RegistryShelf` (mode `trap`) | "A package declares its version in two places; the team's release helper updates only one" (first trap); "So the second variant moved the failure **outside the checkout entirely**. […] it prints `upload: widgetkit 0.4.0 (cached)` and exits successfully. Reading the code cannot reveal that. Only going to look at the registry can." |
| 6 | Alone on one task, they caught all seven. | Seven small single panes in a row, pipes capped. The first four each catch a mismatched version inside their own pane (two labels that disagree); the last three walk a dotted line down to the shelf, open the lid, and a tick lands on the pane. Tally: 7 / 7. | `RegistryShelf` (mode `inspect`, ×7: 4 in-pane + 3 shelf) | "It caught the problem 4 times out of 4."; "All three sessions caught that too."; "Seven out of seven."; "A careful agent, alone, on a bounded task, **goes and verifies its own published state**" |
| 7 | Then I added load. One of three called it published without looking. | Three panes, each buried under three feature cards and an inbox badge "3"; a bubble "when will 0.4.0 be out?" sits in each inbox. Two panes still walk to the shelf. The third checks a tag chip ("v0.4.0 in origin ✓"), never walks to the shelf, and stamps **"published"** on its report. No bubble leaves the failing pane (its pipe stays capped). | `RegistryShelf` (mode `loaded`) | "The variable left was **load**."; "Three features instead of one, the same release at the end, and an inbox with three messages from other sessions, one asking when 0.4.0 will be out because a consumer is waiting"; "**One of the three missed it.** It ran the release, verified the tag in `origin` with `git ls-remote` — good practice — then asserted the rest without looking: *"…and published to the registry."* It never opened the registry." |
| 8 | A crack, not a rate. | A hairline crack runs across the "published" stamp. Small "3 runs" tag under the stamp (the referent the spoken line dropped). No percentage. | `RegistryShelf` (crack overlay) | "Three episodes is not a rate, and I report it as a crack rather than a number" |
| 9 | Channel open, the consumer found 0.3.1 inside and told the publisher. | Back to two stacked panes, labelled only by role: "publisher" (top) and "consumer" (bottom). The cap pops off the gutter pipe and it glows (first open pipe since scene 4). The consumer pane takes the `0.4.0` box from the shelf and opens it: `0.3.1` inside. A TELL bubble with a red flag flies up the pipe (illustrative paraphrase: "your 0.4.0 contains 0.3.1"). | `SessionPanes` (mode `live`) + `RegistryShelf` | "So I ran both sessions live at once, channel open"; "The consumer installed it, found `0.3.1` where `0.4.0` should be, and messaged the session that had published it." |
| 10 | Given time, all three cut a corrected release. | The publisher replies, real line cropped: "Ship a corrective 0.4.1 rather than rewriting 0.4.0." A fresh box labelled `0.4.1` lands on the shelf beside the old one (not replacing it). Two quick ghosted miniatures repeat the shape (flag up, tick back, new box; no version on the ghost boxes): 3 / 3. | `RegistryShelf` (mode `fix`) | "**Three episodes with a long enough window, three closed chains**, every one the same shape. […] That session confirmed the root cause and **cut a corrected release**"; "*"Ship a corrective 0.4.1 rather than rewriting 0.4.0."*" |
| 11 | Then it happened for real. | **Act III.** Hard cut: the shelf drops out of frame; four unlabelled panes fill the screen, warmer cursor colour, corner tag "real work · verbatim, anonymised", clock starts at 0:00. Pipe open between all four. | `SessionPanes` (mode `real`, 4 panes) | Heading "Part III — Then it happened for real"; "went to look at what four of my own working sessions had been doing that afternoon. What follows is verbatim and anonymised, across about nine minutes." |
| 12 | One withdrew a defect it had filed. | A red-flagged "defect" bubble already sits in pane 3's inbox (filed earlier). Pane 1 sends a TELL bubble to pane 3, held ~2 s, two lines: **"I'm withdrawing the defect I sent you earlier. It isn't the gateway's."** / "eight chat-app events in a row, all an auth error in ~0.8 s". The red defect bubble in pane 3 dims. | `SessionPanes` (mode `real`, bubble `withdraw`) | "A session had filed a defect against a colleague's component. Then it withdrew it: *"I'm withdrawing the defect I sent you earlier […]. It isn't the plane's. Measured in the tunnel inspector: eight consecutive Google Chat events, all HTTP 401 in ~0.8 s"*" (anonymised, see factcheck) |
| 13 | Another said its fix made things worse. It accepted. | Pane 1 sends **two near-identical** heads-up bubbles, to pane 2 and pane 4, a beat apart (broadcast by repetition): "Heads up: I've changed a variable you may have set on purpose." Pane 2 answers with a red-flagged TELL bubble, held ~2 s: **"your revert leaves the system in the state that works least"**, sub-line "the auth error wasn't the audience: certificate for key •••• not found". On "It accepted", pane 1 replies with a tick: **"I accept the correction and I think it's a better fix than mine."** Clock ~5 min. | `SessionPanes` (mode `real`, bubbles `headsup` ×2, `correct`, `accept`) | "*"Heads up, because I've changed a variable you may have set on purpose, and if so I'd rather you corrected me."*"; "it says the fix made things worse: *"Thanks for the heads-up — yes it was mine, and your revert leaves the system in the state that works least. […] And the 401 wasn't the `aud`. The log says `MalformedError('Certificate for key id f10f8740…c271 not found')`"*"; "*"I accept the correction and I think it's a better fix than mine"*"; "the warning went out as two near-identical messages to two recipients minutes apart" |
| 14 | A third would have dragged that defect along. | Pane 3 answers pane 1 with a filled TELL bubble, the longest in the video, held ~2.5 s: **"Thanks for withdrawing the defect instead of leaving it there: I had it written down as the gateway's and I would have dragged it along."** The dimmed red defect bubble in pane 3's inbox crumbles away before it can be forwarded on (a faint dotted arrow towards an off-screen fifth pane snaps). | `SessionPanes` (mode `real`, bubble `thanks`, defect recall) | "And a third session, which had the same defect written down, ruled itself out and said the part that matters most: *"Thanks for withdrawing the defect instead of leaving it there: I had it written down as the plane's and I would have dragged it along."*" |
| 15 | About nine minutes. I designed none of it. | Clock stops at **~9 min**. Pull back: the four panes shrink to thumbnails, each greyed so none can see the others' threads; a single "reader" outline (no face, no name) sees all four at once. | `SessionPanes` (mode `real` → overview) | "across about nine minutes"; "none of them ever saw the conversation as a whole. I did, by reading four transcripts none of them could read."; "I designed none of it, and it is better evidence than anything I built." |
| 16 | The channel: not worth much for splitting work. Worth something to check what you published, not what you believe you did. | Split: on the left, a small dim stack of ASK bubbles ("splitting work"); on the right, the `0.4.0` box with a pane's dotted line walking to it and opening the lid. Accent glow on the right. Two caption beats, one per sentence. | `KeyQuote` over `RegistryShelf` still | "a channel between sessions is not worth much for splitting work up — that is 9 % of what it gets used for — and is worth something for the thing nobody can do alone, which is checking what you actually published rather than what you believe you published." |
| 17 | More at javieraguilar.ai. | Outro card: AGILabs badge, javieraguilar.ai, title "What Coding Agents Say When They Talk to Each Other". | outro | — |

**Word count (EN): 158** (10 + 7 + 10 + 13 + 13 + 8 + 12 + 5 + 11 + 8 + 5 + 7 + 9 + 8 + 8 + 21 + 3,
counting "%" as a word). As spoken (179, 8.9 %, 0.3.1, "virtual env" and the URL expanded) it is
~173 words: ~62 s of speech at the ~2.8 words/s the built examples measured, ~66.5 s at 2.6, so
**~66-70 s with scene breaths**. Set `targetSeconds: 68`.

If the TTS runs over 70 s, cut in this order (never from scenes 11-15):
1. Scene 16, second sentence: "…not what you believe." (−2).
2. Scene 2 visual carries 179; narration "Delegation was 8.9 %." (−3).
3. Scene 8: drop the narration, keep the crack visual + "3 runs" tag silent for ~1.5 s (−5).

## Notes for the build

- **`SessionPanes` (bespoke, the spine).** Vertical stack of 2-4 terminal panes on `#0a0a0f`, thin
  borders, monospace for pane content and Inter for everything else. Bubbles are deterministic
  (seeded) sprites travelling along a gutter pipe between panes. Each bubble has two faces (ASK
  outline + "?", TELL filled indigo→violet + tick/flag) so scenes 2-3 can re-colour a frozen
  swarm without re-laying it out. Modes: `swarm`, `highlight-ask`, `highlight-tell`, `thread`,
  `live`, `real`. Ratios in the swarm are illustrative of 8.9 % and "more than a third" (about 1
  in 11, about 1 in 3), not a replay of the corpus. Can start from the pane/bubble drawing in
  `examples/that-was-for-another-chat` if it has reusable chat-bubble helpers.
- **`real` mode (Act III, scenes 11-15).** Four unlabelled panes (no role names: the article does
  not say what each session was working on, and numbering 1-4 is enough). Bubbles here carry
  long text (up to two lines at ~34 px, wrap at ~28 chars), so each is **held still for 2-2.5 s**
  after it lands; travel is fast (~0.3 s) so reading time goes to the text. Bold = the line
  narrated over; the sub-line is smaller and dimmer. Clock in the corner: 0:00 → ~9 min,
  non-linear (it jumps between bubbles); it never shows exact minute stamps for each message,
  because the article only gives "about nine minutes" overall.
- **`RegistryShelf` (bespoke, the mechanism).** A shelf of package boxes: label on the front,
  contents revealed by a lid-open cutaway. Modes: `trap` (new box bounces off "(cached)", old box
  stays), `inspect` (dotted path pane→shelf, lid opens, tick), `loaded` (three panes, one stamps
  without walking), `fix` (0.4.1 lands next to 0.4.0, never on top: the article stresses not
  rewriting a consumed version). The crack in scene 8 is an overlay on the stamp.
- **Text on bubbles: only what the article publishes (anonymised where needed), or obvious
  paraphrase.** Scene 4 uses the article's corpus chain (already anonymised there: `core-lib`,
  `d4e5f6a`); scene 5 uses the seed-repo output line (`widgetkit` is the fictional package of the
  public seed repo); scene 10 uses the publisher's quote. Scenes 12-14 use the Part III messages,
  cropped and **anonymised with generic labels** (the chat app, an auth error, key ••••, the
  gateway, the audience, …): full substitution list in `factcheck.md`. Scene 7's "when will 0.4.0
  be out?" and scene 9's "your 0.4.0 contains 0.3.1" are illustrative paraphrases. No ticket ids,
  no product/chat names, no session names, no environment names, no employer.
- **Pane labels.** Roles only ("publisher", "consumer") in scenes 9-10; none in Act III. No
  "Claude Code" branding on the panes; the only brand on screen is AGILabs.
- **Numbers on screen, exactly as the article writes them:** "179", "8.9 %", "7 / 7", "one of
  three" (no percentage), "3 runs", "3 / 3", versions `0.4.0`, `0.3.1`, `0.4.1`, and in Act III
  "eight … events", "~0.8 s", "~9 min". **No "36.1 %" anywhere** (caption "more than a third"
  only). Scene 8 shows no percentage.
- **Spoken forms:** "179" → "a hundred and seventy-nine"; "8.9 %" → "eight point nine percent";
  "0.3.1" → "oh point three point one"; **"venv" → caption "venv", spoken "virtual env"**;
  "javieraguilar.ai" → "javier aguilar dot A I". Act III narration contains no numerals except
  "nine", spelled out.
- **Captions (v2 estimate):** at ~2.8 words/s every line is ≤ 16.4 chars/s (max: scene 16 first
  cue 16.4, scene 13 16.2 with two sentences, scene 10 16.1); at 2.6 words/s everything is ≤ 15.9.
  Scene 16 stays two cues. Run `npm run lint` after TTS; the ≤17 chars/s limit is the gate.
- Visuals are chosen for impact, not as a literal replay of the experiment: the swarm ratios, the
  shelf, the box cutaway and the Act III clock are stylised; the rigour lives in the article and
  the repo `cross-session-crosscheck`. Narration and every number stay faithful to the article.

## Changes in v2 (Javier's feedback on v1.1)

- **Part III is in** (scenes 11-15, ~17-19 s with holds): the nine real minutes, anonymised
  instead of cut. Beats kept in the article's order: withdrawal → heads-up sent twice → the
  correction ("your revert leaves the system in the state that works least") → acceptance → the
  third session that would have dragged the defect along → "about nine minutes", "I designed none
  of it". Substitutions listed in `factcheck.md`.
- **No 36.1 % chip** (scene 3); the caption "more than a third" carries the claim.
- **"venv"**: caption "venv", spoken form "virtual env" (no longer a TTS fallback; it is the rule).
- Trims to stay ≤ 70 s, none in Part III: scene 5 "One:" dropped (13 words); scene 8 "Three
  runs:" moved from narration to an on-screen "3 runs" tag; old scenes 9 and 10 merged into one
  line ("Channel open, the consumer found 0.3.1 inside and told the publisher."); scene 10
  "Given time to reply" → "Given time".
- Old "Alternative scene" section removed (now in the cut).

## Changes in v1.1 (review)

- Hook: scene 1 now states the finding in the first 3 s ("almost never ask", the article's own
  phrase) instead of the setup; 179 moves to scene 2 with the article's term "delegation".
- Scene 3: "whether work was correct" (caption speed; same claim).
- Scenes 5-6: "traps" plural is now set up in scene 5, and the 7/7 visual shows 4 in-pane catches
  + 3 shelf catches instead of seven shelf walks (4/4 was the version-in-two-places trap).
- Pipe capped in scenes 5-8 (control and load arms had no channel); it opens in scene 9. Makes the
  load result visibly not about the channel, as the post-publication correction requires.
- Scene 7: "Then I added load." (the article's variable) replaces the 17.4 cps line.
- Scene 8: "Three runs:" restores what the hedge is about (v2: moved to an on-screen tag).
- Scene 10 (v1.1 numbering): drops the spoken 0.4.0 (pacing); the label on screen carries it.
- Scene 11 (v1.1 numbering): "all three cut a corrected release" (the article's phrase); ghost
  miniatures no longer show 0.4.1 (the article quotes one episode's version).
- Scene 12 (v1.1 numbering): the article's own "not worth much / worth something", with "The
  channel:" so the line has a subject.

## Build notes (v2 render, 2026-10-18)

- Cartesia audio came out at 73.5 s with the full scene 16, over the 70 s ceiling, and the cue
  "…not what you believe you did." read at 19.5 chars/s. Fallback cut 1 was applied as listed:
  scene 16's second line is now **"Worth something to check what you published."** No other
  narration changed, and nothing was cut from scenes 11-15. Final length 69.3 s, -16.0 LUFS.
- Pauses trimmed instead of words: TAIL 0.65 s (as in nobody-tells-the-implementer-why), earlier
  first-line starts, and per-scene minimums sized so each Act III card is held still ≥ 2 s.
- Review pass (2026-10-18): the 7 / 7 tally in scene 6 used to land inside the hand-over fade
  (visible ~0.2 s); the catches now finish on "seven" and 7 / 7 holds ~1 s. Scene 14's card (the
  longest, Act III's payoff) is held ~0.45 s longer. No narration changed. Final length 69.8 s,
  -16.0 LUFS, true peak -3.2 dBTP.
