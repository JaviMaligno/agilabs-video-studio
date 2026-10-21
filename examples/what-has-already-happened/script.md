# Your Agent Doesn't Know What Has Already Happened — article video (EN) · script draft v1.0

Article: what-has-already-happened (javieraguilar.ai, EN, `pubDate` 2026-08-13; read from
`origin/main` of personal-website). Vertical 9:16, target ~82 s (ceiling 85 s), 207 counted words
incl. outro. ES column left empty (EN-only for now). Voice: the template default.

Data on screen: the article's own tables and quotes (no `repoUrl` in the frontmatter and no
experiment repo found locally, so every figure comes from the article text). The test material
(course facts, the `auth-api` / `auth-db-migrator` release) is the article's published stimulus.

## Central visual: the plan board under a wall clock

One picture carries the whole video. A dark **plan board** with three columns, **DONE · NOW ·
AHEAD**, and task cards pinned in them. Above it hangs a **wall clock with a tear-off calendar**.
The agents' plans are drawn on the board in red marker: **arrows** between cards ("do this after
that") and **ghost cards** (dashed outline, translucent) for work the plan treats as done that
never happened.

Each failure is something wrong *on the board*. The clock is the obvious suspect. When the date is
finally pinned to the calendar, **nothing on the board moves**: same arrows, same ghosts. The only
things that ever change the board are words written *on the cards themselves* (a lock, a dagger,
"self-contained"). That is the article's thesis made physical: a calendar says when now is; which
facts are settled lives in the document.

Recurring element: a small **question card** at the top of the frame states what is being asked
in each part (`Does the date fix it?` → `Failure 1` / `2` / `3` → `So, is it the clock?`) and
gets a stamp at the end of the part.

| # | Narration (EN) | ES | Visual | Component | Source sentence |
|---|---|---|---|---|---|
| 1 | My agents plan around work that never happened. | | **Cold open.** The plan board, cards pinned. A red marker draws the agent's plan: an arrow "4 after 3", the intro card dragged to the end, and two cards in DONE, "take ✓" and "take ↻ redo". On "never happened" the calendar above shows the studio days still weeks AHEAD; the two DONE cards go dashed and translucent (ghosts) and a small tag reads "nothing recorded yet". | bespoke: `PlanBoard` (mode `hook`) | Description: "Agents plan around events that never occurred and invent dependencies between things that don't depend on each other."; "nothing has come out of the studio yet" |
| 2 | The obvious fix is to tell them the date. I tested that. | | The clock above the board ticks and glows; a blank calendar page flutters. Question card drops in: **Does the date fix it?** | `PlanBoard` (mode `clock`) + `QuestionCard` | "The obvious diagnosis is that it doesn't know when *now* is. I'll come back to that, because it's testable and it's false."; "the natural fix is to tell the model when *now* is" |
| 3 | Six models got one page of facts from my real project. | | A single **fact sheet** slides onto the board (tag "~1.7 KB"), lines appearing one by one: "68 videos to record" · "studio: 4 days, ahead" · "scripts frozen since July 🔒" · "timings: 2 good / 3 to redo / 63 pending" · "piece 4: 'I'll rewrite them for you'". Six model chips line up under it (gpt-4o, gpt-4.1-mini, gpt-5.4-mini, claude-haiku-4.5, claude-sonnet-4.6, claude-opus-5). | `PlanBoard` (mode `sheet`) | "You give a model ~1.7 KB of project facts"; "The material is my real project, ambiguity included"; the four bullets of the material; the six model names |
| 4 | And I asked: in what order, and with what constraints? | | The question appears as a speech bubble from the sheet to the six chips: "In what order? Any ordering constraints?" | `PlanBoard` (mode `sheet`) | "and ask: *in what order should I do these, and are there any ordering constraints I need to respect?*" |
| 5 | Then I added a line: today's date, or what the timings really were. | | Five tabs A-E on the sheet's edge. A: nothing. B: a strip "today is 11 August 2026" pins on. C: "these are practice read-throughs, not studio takes". D: both strips. E: both + "don't invent ordering constraints". One tab lights per beat (fast; the two named strips land on "date" and "timings"). | `PlanBoard` (mode `conditions`) | Conditions table A-E, verbatim strip texts |
| 6 | Then all of it again, on an unrelated software release. | | The sheet flips: "12 services · deploy window ahead · staging rehearsals behind". Sub-tag "same structure, none of the same words". Corner tally counts up to **572 scored responses**, tiny line under it "blind judge, checked against my hand coding". | `PlanBoard` (mode `sheet`, flip) + `Counter` (572) | "the whole thing again in an unrelated domain: a release of twelve services, production deploy window ahead, staging rehearsals behind. Same logical structure, none of the same words."; "**572 scored responses.** An LLM judge does the scoring, blind to the condition"; "one agreed 30/32" |
| 7 | The trap: piece four reuses a calculation from piece three. | | Question card: **Failure 1 · a dependency the page denies**. Back to the course sheet. Two cards, "piece 3" and "piece 4"; a dotted arrow grows 3 → 4, labelled "reuses a calculation". | bespoke: `ScopeArrow` (mode `trap`) | "Two pieces look dependent — the fourth reuses a calculation written during the third" |
| 8 | But its script says: I'll rewrite them for you. No dependency. | | On card 4 the clause **"I'll rewrite them for you."** highlights in amber; the dotted arrow snaps in two and fades; stamp on card 4: **SELF-CONTAINED**. | `ScopeArrow` (mode `exempt`) | "but the script of the fourth says, in as many words, **"I'll rewrite them for you."** It's self-contained. There is no ordering constraint." |
| 9 | Five of six models put four after three anyway. | | The six chips each draw the arrow back in red marker, one per beat: five solid, bold, identical; claude-opus-5 draws a faint, half-length one. On screen: **"course: 92 / 92 responses"** under the five; under Opus, small: "52% · release 10%". Question card stamp: **5 / 6**. | `ScopeArrow` (mode `models`) | "Five of six models say B must come after A. In the course domain that's **92 out of 92 responses** — not a tendency, a ceiling."; table: claude-opus-5 52% / 10% |
| 10 | One even copied the exemption into its answer, then ignored it. | | Header "release domain · gpt-4o, unedited". An answer card types out two lines from the quote: "auth-db-migrator — Prepares the schema auth-api uses. **It's idempotent and backward-compatible.**" (amber highlight) … then "**Always deploy auth-db-migrator before auth-api**" (red). On "ignored" the amber highlight peels off the first line and drifts away, leaving the words in place: the fact stays, its scope goes. Three ticks: "read it · wrote it · ignored it". | `ScopeArrow` (mode `quote`) | The gpt-4o quote; "It read the exemption, wrote it down, and reasoned as if it hadn't."; "What loses isn't the fact — it's the fact's *scope*." |
| 11 | Then a habit: shoot the intro last, since it depends on the rest. | | Question card: **Failure 2 · a reason that expired**. A pinned rule tag on the board: "intro last: it must match the rest", with a small hanging precondition tag "…while the rest can still change". The intro card slides to the far end of AHEAD. | bespoke: `ExpiredRule` (mode `rule`) | "in video production you shoot the intro last, because the intro has to match what you ended up making" |
| 12 | But the scripts were frozen in July. That reason had expired. | | The calendar flips back to **July**; a padlock snaps onto the script stack ("frozen since July"). The precondition tag greys out and gets a stamp **EXPIRED**. The intro card stays at the end anyway. | `ExpiredRule` (mode `expired`) | "**the scripts were frozen in July and the artefacts were signed in July.** Nothing done later can change what they say. The reason to defer them expired before the window even opened." |
| 13 | Being a better model didn't help here. | | Two pairs of bars ("defers it because it depends on the rest"): course: five smaller **36%** vs claude-opus-5 **60%**; release: **69%** vs **98%**. The Opus bars are the accent colour. Question card stamp: **no help**. | `BarCompare` (4 bars, paired) | Table: five smaller 36% / 69%, claude-opus-5 60% / 98%; "**being a better model does not help here.**" |
| 14 | The timings were only rehearsals. When I said so, one model replanned. | | Question card: **Failure 3 · what has happened**. The status card "2 good / 3 to redo / 63 pending" gets a strip "rehearsals, nothing from the studio yet". The Opus chip redraws its plan: its ghost takes vanish. On screen: "claude-opus-5 · course 92% → 20% · release 20% → 0%". | bespoke: `PlanBoard` (mode `provenance`) | "condition C settles it: *these are rehearsals, nothing has come out of the studio yet.*"; "**`claude-opus-5` acts on it.** The state error drops from 92% to 20% in the course domain" |
| 15 | The rest mostly repeated it, and kept planning around those takes. | | The other five chips answer with a speech bubble "these are rehearsals ✓"; their plans still keep the ghost takes in DONE. Small tag: "said it ≠ used it". | `PlanBoard` (mode `provenance`) | "**The smaller models mostly just repeat it.** […] And then they plan around 63 pending anyway."; "talking about it is not using it" |
| 16 | And the date? It changed nothing, on any measure. | | Question card: **So, is it the clock?** The strip **"today is 11 August 2026"** tears off the calendar and slams onto the board. Four small gauges at the side (one per measure) don't move a pixel; arrows and ghosts stay. On screen: "all p > 0.5". | bespoke: `PlanBoard` (mode `date`) | "Adding the date explicitly moved nothing. Not one of the four measures (all p > 0.5)." |
| 17 | Told not to invent constraints, 96 % still did. | | A sticky note "don't invent ordering constraints" pins over the board (tab E). The red arrows stay put. On screen: **"condition E: 96 %"**. | `PlanBoard` (mode `date`) | "condition E adds, in plain language, *don't invent ordering constraints*: still **96%**." |
| 18 | So it isn't the clock. | | The verdict, full frame: the wall clock dims; a big stamp across it: **IT ISN'T THE CLOCK**. Question card stamp: **no**. | bespoke: `PlanBoard` (mode `verdict`) | Heading "It isn't the clock"; "So the deficit isn't the timestamp." |
| 19 | A calendar says when now is, not which facts are already settled. | | Split: the calendar on the left lights only the NOW line; on the right the board's cards show what it cannot: the padlock "frozen", the dagger "†" on the timings, "self-contained" on piece 4. | `PlanBoard` (mode `verdict`) | "A calendar tells you where *now* sits; it tells you nothing about which of your facts are already fixed, which relations still hold, and which rule's precondition expired last month." |
| 20 | That lives in the document. Write the sentence you mean. | | Card 4's text rewrites itself: "reuses piece 3's calculation, but rewrites it" → **"piece 4 is self-contained."**; the timings become "8:25 †". KeyQuote: "Write the sentence you mean." with "sentence you mean" in the accent. | `KeyQuote` over `PlanBoard` still | "That structure lives in the document"; "**Don't write an exemption — write the sentence you mean.**"; ""B reuses A's calculation, but it rewrites it" becomes "B is self-contained.""; "writing `8:25 †`" |
| 21 | More at javieraguilar.ai | | Outro card: AGILabs badge, javieraguilar.ai, title "Your Agent Doesn't Know What Has Already Happened". | outro | — |

**Word count (EN):** 8 + 12 + 11 + 10 + 13 + 10 + 10 + 11 + 9 + 11 + 13 + 11 + 7 + 12 + 11 + 9 +
9 + 5 + 12 + 10 + 3 = **207 words** (counting "%" as part of "96 %"), about 74 s of speech at
~2.8 words/s, **~80-84 s** with line gaps, card changes and the outro hold (under the 85 s
ceiling). Caption estimate at 2.8 words/s: every narrated line ≤ 16.8 chars/s (highest: scene 15,
16.8; scene 7, 16.5; hook 16.4); the outro goes through its spoken form. `npm run lint` after TTS
is the gate.

If the TTS render runs over 85 s, cut in this order (never scenes 7-10, 16-18):
1. Scene 4 → fold into scene 3's visual (question bubble silent) (−10 words).
2. Scene 6 → "Then again, on a software release." (−3).
3. Scene 15 → "The rest mostly repeated it." (−5), the ghost takes on screen carry the rest.

## Spoken numbers (complete list)

| Spoken | Scene | Why |
|---|---|---|
| "six" (models) | 3 | Setup count. |
| "four", "three" (pieces) | 7, 9 | Names of the two pieces in the trap; needed to follow it. |
| "five of six" | 9 | The result of failure 1, said as a colleague would. |
| "July" | 12 | The fact the premise expired against. |
| "ninety-six percent" | 17 | The one percentage voiced: the prohibition result. |

Everything else (92 / 92, 52%, 36/60/69/98%, 92% → 20%, p > 0.5, 572) is on screen only.

## Notes for the build

- **`PlanBoard` (bespoke, the spine).** Board with DONE · NOW · AHEAD columns, task cards, red
  marker arrows (drawn on with a stroke-dash animation), ghost cards (dashed, ~35 % opacity), and
  the wall clock + tear-off calendar above it. Modes: `hook`, `clock`, `sheet`, `conditions`,
  `provenance`, `date`, `verdict`. The key beat is `date` (scene 16): the date strip lands with
  weight and **every arrow and ghost stays exactly where it was**, held ~1 s still so the
  non-change reads. Gauges are illustrative, no values on them (the article gives only "all
  p > 0.5").
- **`ScopeArrow` (bespoke, the mechanism of failure 1).** Two cards, a dotted arrow, the exemption
  clause highlighted in amber on the card; the arrow snaps on "No dependency" and the six chips
  redraw it. Mode `quote` is the answer card where the amber highlight peels off the exemption
  while the words stay: the fact survives, its scope does not.
- **`ExpiredRule` (bespoke).** A rule tag with a hanging precondition tag; calendar flip to July,
  padlock, precondition greys out with **EXPIRED**; the intro card does not move back.
- **`QuestionCard`**: as in `examples/sport-from-motion-laya` (fixed top band, question + stamp).
- **Numbers on screen, exactly as the article writes them:** "~1.7 KB", "68 videos", "4 days",
  "2 good / 3 to redo / 63 pending", "12 services", "572 scored responses", "30/32" (optional,
  judge line), "92 / 92 responses", "52%", "10%", "36%", "60%", "69%", "98%", "92% → 20%",
  "20% → 0%", "all p > 0.5", "96 %", "11 August 2026", "8:25 †". Not shown: 25/25, 19/20, 96–100% (see
  factcheck → article issues).
- **Spoken forms:** "96 %" → "ninety-six percent"; "javieraguilar.ai" → "javier aguilar dot A I".
- **Names:** model chips use the article's names. The course is described only as the article
  does ("68 videos", "a studio", "scripts frozen since July"): no institution, no course title.
  The only brand on cards, poster and metadata is AGILabs.
- Visuals are chosen for impact, not as a literal replay: the board, ghosts, arrows, padlock and
  gauges are stylised; the rigour lives in the article. Narration and every number stay faithful
  to the article.
- ES cut: pending (EN-only for now).
