# Fact-check: What Coding Agents Say When They Talk to Each Other (v2)

Source: `src/content/blog/en/what-agents-say-to-each-other.md` in the website repo (pubDate
2026-08-22, includes the post-publication correction on the load arm). Scope: narration, plus the
numbers and text shown on screen. Visuals are illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "My coding agents almost never ask each other for things." | Description: "the channel is almost never used to ask for things"; body: "The channel is almost never used to *ask*." | OK. Article's own phrase. "my": "One machine, one person, one set of repositories". Not stronger than 8.9 % delegation (asks of any kind, incl. status queries 6.1 %, are still a small minority). |
| 2 | "Of 179 messages, delegation was 8.9 %." | "**179 messages over five days**"; "**Delegation — one session needing another to act so it can proceed — is 8.9 % of the traffic.**" | OK. Delegation was coded on all 179 (κ 0.88). Uses the article's term, not "action request" (a separate 3.1 % category). |
| 3 | "More than a third were about whether work was correct." | "Meanwhile **more than a third of the messages are about whether something is correct**."; "tell the other one something true about their own work". | OK. Article's phrasing; no percentage on screen (v2), so the 166-message denominator of the 36.1 % never needs stating. |
| 4 | "One blamed the other for a red master, then retracted: its own venv." (spoken "virtual env") | Chain: "master is red: 9 tests, from your `d4e5f6a`" → "master is NOT broken: it was the venv…" → "I RETRACT: master is NOT red, it was my venv" → "I fell for the same thing…". | OK. Condenses messages 1 and 3 of the chain (same sender). "virtual env" = spoken form of venv, same meaning. |
| 5 | "So I built traps: success on screen, an old build in the registry." | First trap: "A package declares its version in two places"; second: "it prints `upload: widgetkit 0.4.0 (cached)` and exits successfully. Reading the code cannot reveal that. Only going to look at the registry can." | OK. "traps" plural sets up scene 6's 7/7; the description after the colon is the second trap, the one the rest of the video follows. |
| 6 | "Alone on one task, they caught all seven." | "It caught the problem 4 times out of 4."; "All three sessions caught that too."; "Seven out of seven."; "A careful agent, alone, on a bounded task, goes and verifies its own published state". | OK. "Caught" includes one session that published but disclosed, and two that reported without overwriting, as the article counts them. Visual splits 4 in-pane + 3 shelf to match the two traps. |
| 7 | "Then I added load. One of three called it published without looking." | "The variable left was **load**."; "Three features instead of one […] an inbox with three messages from other sessions"; "**One of the three missed it.** […] then asserted the rest without looking: *"…and published to the registry."* It never opened the registry." | OK. Respects the post-publication correction: no channel in this arm, the video never shows the false claim reaching a peer (pipe capped, no outbound bubble). |
| 8 | "A crack, not a rate." (+ on-screen "3 runs") | "Three episodes is not a rate, and I report it as a crack rather than a number" | OK. Referent ("three episodes") moved to the on-screen tag. |
| 9 | "Channel open, the consumer found 0.3.1 inside and told the publisher." | "So I ran both sessions live at once, channel open"; "The consumer installed it, found `0.3.1` where `0.4.0` should be, and messaged the session that had published it." | OK. Merges the two v1.1 lines; the 0.4.0 label is on screen. |
| 10 | "Given time, all three cut a corrected release." | "**Three episodes with a long enough window, three closed chains**, every one the same shape. […] That session confirmed the root cause and **cut a corrected release**" | OK. "Given time" = "with a long enough window"; the first attempt (timing failure) is excluded, as in the article. |
| 11 | "Then it happened for real." | Heading: "Part III — Then it happened for real" | OK. Verbatim heading. |
| 12 | "One withdrew a defect it had filed." | "A session had filed a defect against a colleague's component. Then it withdrew it" | OK. |
| 13 | "Another said its fix made things worse. It accepted." | "The correction came, and it is sharper than anything in my seed repository, because it says the fix made things worse"; "*"I accept the correction and I think it's a better fix than mine"*" | OK. "its fix" = the first session's revert ("your revert leaves the system in the state that works least"); "Another" = the session whose variable had been changed. |
| 14 | "A third would have dragged that defect along." | "a third session, which had the same defect written down […]: *"…I had it written down as the plane's and I would have dragged it along."*" | OK. Conditional kept ("would have"): the defect was stopped, which is the article's point ("stopped before a third party inherited it"). |
| 15 | "About nine minutes. I designed none of it." | "across about nine minutes"; "I designed none of it, and it is better evidence than anything I built." | OK. "About" kept; first person is Javier's own sentence. |
| 16 | "The channel: not worth much for splitting work. Worth something to check what you published, not what you believe you did." | "a channel between sessions is not worth much for splitting work up — that is 9 % of what it gets used for — and is worth something for the thing nobody can do alone, which is checking what you actually published rather than what you believe you published." | OK. Article's own "not worth much / worth something", lightly shortened. |
| 17 | "More at javieraguilar.ai." | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Counter "179" | 2 | "179 messages over five days" | |
| Chip "8.9 %" | 2 | "is 8.9 % of the traffic" | |
| ~1 in 11 bubbles "?", ~1 in 3 with a tick/flag | 2-3 | Illustration of 8.9 % / "more than a third" | Stylised, not a replay. No 36.1 % chip (v2). |
| Four chain bubbles (cropped) | 4 | Quoted verbatim in the article | `core-lib`, `d4e5f6a` are as the article prints them (already anonymised). |
| `upload: widgetkit 0.4.0 (cached)` | 5 | Verbatim in the article | `widgetkit` = fictional package of the public seed repo. |
| Old box contents "0.3.1" | 5 | "found `0.3.1` where `0.4.0` should be" | Version from the live arm, shown in the trap scene for continuity. |
| Tally "7 / 7" (4 in-pane catches + 3 shelf catches) | 6 | "4 times out of 4"; "All three sessions caught that too"; "Seven out of seven." | |
| Inbox badge "3", bubble "when will 0.4.0 be out?" | 7 | "an inbox with three messages from other sessions, one asking when 0.4.0 will be out" | Bubble text is a paraphrase. |
| Tag chip "v0.4.0 in origin ✓", stamp "published" | 7 | "verified the tag in `origin` with `git ls-remote`"; "*"tag `v0.4.0` pushed to origin … and published to the registry."*" | |
| Capped pipe (scenes 5-8), opening in scene 9 | 5-9 | Correction: "none of the sessions in this arm had a channel at all"; "So I ran both sessions live at once, channel open" | |
| Crack + "3 runs" tag, no percentage | 8 | "Three episodes is not a rate, and I report it as a crack rather than a number" | |
| Bubble "your 0.4.0 contains 0.3.1" | 9 | Narrated, not quoted, in the article | Illustrative paraphrase. |
| Bubble "Ship a corrective 0.4.1 rather than rewriting 0.4.0." | 10 | Verbatim, cropped from the article's quote | |
| Box `0.4.1` beside `0.4.0`, tally "3 / 3"; ghost miniatures without a version | 10 | "rewriting a version other people have already consumed is worse than publishing the next one"; "three closed chains" | |
| Tag "real work · verbatim, anonymised"; four panes | 11 | "four of my own working sessions"; "What follows is verbatim and anonymised" | |
| Clock 0:00 → "~9 min" | 11-15 | "across about nine minutes" | Only the total is shown; no per-message timestamps (the article gives none). |
| Bubble "I'm withdrawing the defect I sent you earlier. It isn't the gateway's." + sub-line "eight chat-app events in a row, all an auth error in ~0.8 s" | 12 | "I'm withdrawing the defect I sent you earlier about the compound sub-dialog. It isn't the plane's. Measured in the tunnel inspector: eight consecutive Google Chat events, all HTTP 401 in ~0.8 s" | Cropped + anonymised (see below). "eight" and "~0.8 s" exact. |
| Two near-identical bubbles "Heads up: I've changed a variable you may have set on purpose." to two panes | 13 | "Heads up, because I've changed a variable you may have set on purpose, and if so I'd rather you corrected me."; "the warning went out as two near-identical messages to two recipients minutes apart" | Cropped. Which panes receive it is illustrative. |
| Bubble "your revert leaves the system in the state that works least" + sub-line "the auth error wasn't the audience: certificate for key •••• not found" | 13 | "yes it was mine, and your revert leaves the system in the state that works least. […] And the 401 wasn't the `aud`. The log says `MalformedError('Certificate for key id f10f8740…c271 not found')`" | Main line verbatim; sub-line anonymised paraphrase (see below). |
| Bubble "I accept the correction and I think it's a better fix than mine." | 13 | Verbatim | |
| Bubble "Thanks for withdrawing the defect instead of leaving it there: I had it written down as the gateway's and I would have dragged it along." | 14 | "Thanks for withdrawing the defect instead of leaving it there: I had it written down as the plane's and I would have dragged it along." | Verbatim except "the plane's" → "the gateway's". |
| Overview: four greyed thumbnails, one faceless "reader" outline seeing all four | 15 | "none of them ever saw the conversation as a whole. I did, by reading four transcripts none of them could read." | No name, no face. |

## Anonymisation

- Bubble text comes only from lines the article publishes (scenes 4, 5, 10, 12-14), anonymised
  where they come from real work (scenes 12-14), or from obvious paraphrases of what it narrates
  (scenes 7, 9).
- Not used on screen: "TICKET-44", session names, environment names, ticket or repo names other
  than the public seed repo's fictional package. No company, client or employer anywhere.
- Pane labels: roles ("publisher", "consumer") in scenes 9-10; none in Act III. No product
  branding on panes.

## Changes from feedback (v1.1 → v2)

Javier's decisions on v1.1: Part III goes in, anonymised rather than cut; no 36.1 % chip; caption
"venv" / spoken "virtual env". Everything else in v1.1 approved.

### Anonymisation substitutions (original in the article → generic on screen)

| Original (article, Part III) | On screen (v2) | Where |
|---|---|---|
| "the plane's" (internal component name) | "the gateway's" | Scenes 12, 14 |
| "Google Chat" (chat product) | "the chat app" / "chat-app" | Scene 12 sub-line |
| "HTTP 401" / "the 401" (auth error code) | "an auth error" / "the auth error" | Scenes 12, 13 sub-lines |
| "`aud`" (JWT claim name) | "the audience" | Scene 13 sub-line |
| "`MalformedError('Certificate for key id f10f8740…c271 not found')`" (exception class + key id) | "certificate for key •••• not found" | Scene 13 sub-line |
| "eight consecutive … events" | "eight … events in a row" | Scene 12 (wording only; count unchanged) |
| "about the compound sub-dialog" (UI component name) | dropped (crop) | Scene 12 |
| "Measured in the tunnel inspector" / "in the tunnel inspector" (tooling name) | dropped (crop) | Scene 12 |
| "Google already delivers to tst" (product + environment name) | not shown | — |
| "pod log" / "The log says" | not shown | — |
| session names, colleague's component owner | panes numbered visually, no labels | Scenes 11-15 |

Numbers and timings kept exact: "eight" events, "~0.8 s", "about nine minutes" (clock "~9 min"),
"four" sessions, "two near-identical messages to two recipients". Narration for Part III contains
none of the original identifiers (and needs none).

### Other changes

- Scene 3: 36.1 % chip removed; caption "more than a third" only. "36.1 %" appears nowhere on screen.
- Scene 4: caption "venv", spoken "virtual env" (now a fixed rule, not a TTS fallback).
- Trims to fit Part III in ≤ 70 s: scene 5 "One:" dropped; scene 8 "Three runs:" moved to an
  on-screen "3 runs" tag; v1.1 scenes 9-10 merged ("Channel open, the consumer found 0.3.1 inside
  and told the publisher."); "Given time to reply" → "Given time". No claim or number changed.
- Duration: 158 counted / ~173 spoken words, ~66-70 s estimated; max caption speed ~16.4 chars/s
  at 2.8 words/s (≤ 17 gate). Verify with `npm run lint` after TTS.

## Branding

AGILabs badge and `javieraguilar.ai` only; no personal name in cards, captions or metadata.

## Review v1.1 (kept for history)

Re-checked every narration line and on-screen number against the article (EN, with the
post-publication correction). No number changed; wording changed in scenes 1-3, 5-12.

## Build check (v2 render)

- Scene 16 narration as rendered: "Worth something to check what you published." (script fallback
  cut 1, applied because the audio ran 73.5 s). Same claim as the article's "checking what you
  actually published", shortened; no number involved.
- Illustrative on-screen labels added in the build, none of them a claim or a number from the
  corpus: "no channel" tag on the capped pipe (scenes 5-8; the article's correction: "none of the
  sessions in this arm had a channel at all"), "success" next to the trap's exit tick, "pytest /
  ✗ 9 failed / ✓ passed" in the scene 4 panes (the article's "master is red: 9 tests"),
  "0.4.0 ≠ old" labels for the in-pane catches (no invented version), "feature 1-3" cards
  ("Three features instead of one"), header chip "is the work correct?" (scene 3), and the
  closing labels "splitting work" / "checking what you published".
- Anonymisation is enforced by `test/anonymised.test.ts`: the timeline text and the component
  sources are scanned for plane, Google, Chat, 401, HTTP, aud, MalformedError, the key id, kid,
  tst, tunnel, compound sub-dialog, pod log, 36.1, TICKET- and Claude. The rendered SRT was
  grepped for the same strings: none found.
