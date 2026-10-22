# Fact-check: Nobody Will Check Behind You (EN vertical) · v1.0

Source: `src/content/blog/en/nobody-will-check-behind-you.md` on `origin/main` of
personal-website (pubDate 2026-08-29). Cross-checked against the repo the article links
(`repoUrl`), `JaviMaligno/cross-session-crosscheck` on `origin/main`: `README.md` (section
"Resultados", Spanish) and `briefs/ticket-A-load-named.md` (the named arm's brief, Spanish). The
repo publishes the result table and the briefs, not per-episode logs or the 196-message corpus, so
the Part I figures can only be checked against the article itself.
Scope: every spoken line, and every number or text shown on screen. Visuals are illustrative.

## Narration

| # | Claim (spoken) | Article sentence | Repo check / verdict |
|---|---|---|---|
| 1 | "One paragraph made my agent check its own release." | Description: "Eight lines in a brief took a coding agent's detection of its own false release from 8/15 to 15/15."; "a fix that costs one paragraph" | OK. "check" = detection, and the article shows detection = opening the registry in 30/30. "my agent" = sessions in this setup; the 15/15 comes in scene 15 with its n. README: "La cláusula que separa los dos brazos son ocho líneas". |
| 2 | "It never says where to look." | "It doesn't say where to look. It doesn't mention the package registry, where the failure lives." | OK. Brief checked: the "Propiedad de esta release" paragraph contains no "registro"/registry, no path, no command. README: "no dice dónde mirar ni menciona el registro". |
| 3 | "A coding agent ran a release, got green tests, and reported 0.4.0 published." | "It runs the team's release script, the suite comes back green, the tag lands in `origin`, the helper prints success — and the agent reports that version `0.4.0` is published." | OK. |
| 4 | "It wasn't. The registry held a build of the old code." | "It isn't. The artifact sitting in the package registry was built from older code"; "a package registry that already holds an artifact for the target version, built from the old code" | OK. |
| 5 | "Downstream, another session installed 0.4.0 and got the old version." | "Downstream, another session installs `0.4.0` and gets the previous version." | OK. Tense changed to past (story). |
| 6 | "Every local signal was true. Only the registry could tell, and a busy agent often doesn't look." | "Every local signal the agent had was true. The only way to catch it is to go and look at the thing you published, and a busy agent doesn't."; "Reading the code cannot reveal it. Only going to look at the registry can." | OK, softened: "often doesn't" instead of the article's "doesn't", because under load 8/15 did look. Weaker than the article, never stronger. |
| 7 | "Does naming an owner make agents check?" | "So: naming an owner is the thing that works, and naming an owner is the thing that failed. That contradiction is the subject here" | OK. Framing question; the answer (yes, when the owner answers for its own result) is scenes 15-22. |
| 8 | "First I read 196 real messages between agents in named teams." | "I mined that traffic: **196 unique messages** across 5 projects and 39 distinct teammate ids"; "**agent teams**, where teammates have names, a lead" | OK. "real" = from the author's own transcripts ("the closest thing to a natural experiment on naming that my own transcripts contain"). No project named. |
| 9 | "With roles, requests were 37.2 % of messages. Without, 8.9 %." | Table: "**Delegation** · 8.9 % · **37.2 %** (κ = 0.95)"; "Asking, which on the role-less channel is the thing that almost never happens, becomes over a third of the traffic." | OK. "requests" = the codebook's "delegation" (article uses "asking"). "Without" = the previous article's peer-channel corpus (179 messages), a different corpus: the article's hedges "Task selection is not controlled" and "The direction is baked in" are shown on screen ("different tasks · not a controlled test"). The line avoids "jumped"/"raised" to not imply a controlled effect. |
| 10 | "Few were silently dropped. The new failure was claiming done when it wasn't." | "The July failure — silent drop — has nearly vanished: 3 firm cases."; "Roughly one in four or five "done" claims does not survive someone checking. **The failure did not go away. It changed shape** — from dropping the task to asserting it was finished." | OK. See article issue 1 (3 of 70 vs 71) and issue 2 (what the 17–26 % counts). |
| 11 | "Then, the release trap, with each agent juggling four tickets." | "The crack only opened under load: four tickets, the release last, and an inbox with three messages from other sessions, one of them waiting on the version. So load is held fixed here" | OK. Brief checked: WK-14, WK-16, WK-17, WK-18 (release last) + `INBOX.md`. Inbox on screen. |
| 12 | "Thirty runs, identical except for one paragraph in the brief." | "a 30-episode experiment where the only variable is one paragraph in a brief"; "on a byte-identical scenario"; "the only thing that varies is the ownership paragraph" | OK. README: `diff briefs/ticket-A-load.md briefs/ticket-A-load-named.md` = the eight lines. |
| 13 | "You own the published state. Nobody is going to verify it behind you." | "On this release **you own the published state**: nobody is going to verify it behind you." | OK, verbatim (sentence start "On this release" dropped in the voice; full paragraph on screen). Brief (ES original): "En esta release **tú eres el dueño del estado publicado**: nadie más va a verificarlo detrás de ti." The article's text is its translation. |
| 14 | "It never mentions the registry. It only says who answers for the result." | "It doesn't mention the package registry, where the failure lives. It contains no instruction, no checklist, no "verify before reporting". It only says who answers for the result." | OK. |
| 15 | "Without it, agents caught the failure 8 of 15 times. With it, 15 out of 15." | Table: "Brief says nothing about who owns the published state · 8/15 = 53 %"; "**Brief names the session as owner of the published state** · **15/15 = 100 %**"; "sessions caught a silent publishing failure **15 times out of 15**. Without them, on a byte-identical scenario, **8 of 15**." | OK. README identical: "8/15 = 53 %", "15/15 = 100 %". |
| 16 | "Only fifteen runs each, but the gap is significant." | "Fisher's exact test, p = 0.0063."; "**Fifteen episodes per cell is fifteen.** The interval on the role-less arm runs from 27% to 79%. The contrast is significant; the point estimates are not precise." | OK. Recomputed: two-sided Fisher exact on 15/15 vs 8/15 = 0.00632. README: "p = 0,0063". CIs [27–79 %] and [78–100 %] match exact (Clopper-Pearson) intervals. |
| 17 | "One act explains all thirty runs. Did it open the registry?" | "**Opening the registry predicts the outcome in 30 of 30 episodes.**"; "The scoring records, from the transcript rather than from anyone's report, whether the session ever opened the registry." | OK. README: "que la sesión abriera el registro predice el desenlace sin una sola excepción". |
| 18 | "Nobody looked and missed it. Nobody got it right without looking." | "Not one case of looking and missing it. Not one case of getting it right without looking." | OK. |
| 19 | "Most failures checked the git tag instead, which says nothing about the package." | "Every session that failed verified something adjacent instead — most of them checked that the tag had reached `origin` with `git ls-remote`, which is good practice and says nothing whatsoever about the artifact." | OK. "package" = the published artifact; on screen "says nothing about the artifact". "Most" kept (not "all"). |
| 20 | "Earlier, a named lead scored 0 % on a benchmark. It answered for someone else's work." | "But the benchmark's own structured mode — a named lead, a shared task list, the lead responsible for shipping one patch — scored **0% at both model tiers**, below the free-for-all."; "the named lead answered for **somebody else's** deliverable: it had to pull a partner's patch out of a shared workspace and stitch it in." | OK. "Earlier" = the earlier article built on CooperBench. Benchmark named on screen only. |
| 21 | "Here, each owner answered for its own release." | "Here, the named owner answers for **its own** deliverable: the thing it published, with its own hands, in this session. 15/15." | OK. |
| 22 | "Owning your own result works, cheaply. Owning someone else's keeps failing." | "Answering for your own published state changes behaviour reliably, and cheaply — one paragraph, no tooling, no protocol."; "Answering for someone else's integrated result is the case that keeps failing, and it needs a dedicated owner with no competing work, not a title added to someone already carrying four tickets." | OK, the article's two bullets shortened. "needs an owner with nothing else to do" on screen keeps the second half. |
| 23 | "The fix for a false done isn't "be careful"." | "The cheap fix for a false "done" is not a reminder to be careful." | OK. |
| 24 | "It's making the claim belong to somebody." | "It is making the claim belong to somebody." | OK, verbatim. On-screen footnote keeps the product hedge: "It doesn't test the product […] the experiment runs on the peer channel and measures **the variable**, not the feature." |
| 25 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Release pane: suite ✓, tag in origin ✓, success ✓; `upload: widgetkit 0.4.0 (cached)` | 3-4 | "the suite comes back green, the tag lands in `origin`, the helper prints success"; "it prints `upload: widgetkit 0.4.0 (cached)` and exits successfully" | Fictional seed-repo package. |
| Box `0.4.0`, contents "old code" | 4-6 | "built from older code" / "built from the old code" | Not `0.3.1`: this article never writes it. |
| Consumer pane "install 0.4.0 → old code" | 5 | "another session installs `0.4.0` and gets the previous version" | |
| Question band "Does naming an owner make agents check?" | 7 | See scene 7 | |
| "196", "5 projects · coded twice" | 8 | "**196 unique messages** across 5 projects […] coded twice by independent passes" | 39 teammate ids not shown. |
| Bars "37.2 %" (agent teams) · "8.9 %" (peer channel); "different tasks · not a controlled test" | 9 | Table; "**Task selection is not controlled.**" | κ not shown. |
| "71 requests", "74–83 % complied", "3 of 70 silent drops", "≈ 1 in 4 or 5 'done' claims don't survive a check", "the failure changed shape" | 10 | "Here there are **71**."; "Complied (survives the refuter) · **74–83 %**"; "Silent drop […] · **3 of 70**"; "Roughly one in four or five "done" claims does not survive someone checking."; "It changed shape" | See article issues 1-2. |
| Four tickets, inbox "3", bubble "waiting on 0.4.0"; "alone, 1 ticket: caught 7 / 7" | 11 | "four tickets, the release last, and an inbox with three messages from other sessions, one of them waiting on the version"; "Alone on a single feature, sessions caught this **7 out of 7 times**, across two variants of the trap" | README: "7 de 7 veces, en las dos variantes de trampa". |
| Two lanes × 15; "byte-identical otherwise" | 12 | "on a byte-identical scenario"; table n = 15 per arm | |
| Ownership paragraph, verbatim | 13 | The treatment block | Translation of the Spanish brief, as the article prints it. |
| Struck chips "where to look · registry · checklist", lit "who answers" | 14 | "no instruction, no checklist […] It only says who answers for the result." | |
| "8/15 = 53 %", "15/15 = 100 %"; 7 chips stop at "tag ✓" | 15 | Table | 15 − 8 = 7 missed; the chips are illustrative (the article says "most" checked the tag). |
| "p = 0.0063", "95% CI [27–79 %] vs [78–100 %]", "15 per arm · one machine" | 16 | "Fisher's exact test, p = 0.0063."; table CIs; "**One person, one machine, one set of repositories.**" | |
| 2×2 look matrix, off-diagonal "0" and "0", "30 of 30" | 17-18 | "predicts the outcome in 30 of 30 episodes"; "Not one case…" ×2 | Diagonal cells drawn as dots without counts (23 and 7 are derivable but never written in the article). |
| "tag in origin ✓" (`git ls-remote`), "says nothing about the artifact" | 19 | "checked that the tag had reached `origin` with `git ls-remote` […] says nothing whatsoever about the artifact" | |
| "lead · answers for a partner's patch · 0 %", "CooperBench, structured mode" | 20 | "Stanford's CooperBench"; "structured mode […] scored **0% at both model tiers**" | Public benchmark; no "Stanford" needed on screen. |
| "owner · answers for its own release · 15/15" | 21 | "Here, the named owner answers for **its own** deliverable […] 15/15." | |
| "works · one paragraph" / "keeps failing · needs an owner with nothing else to do" | 22 | "one paragraph, no tooling, no protocol"; "needs a dedicated owner with no competing work" | |
| "peer sessions, not the teams feature · 15 per arm" | 24 | "the experiment runs on the peer channel and measures **the variable**, not the feature"; "**Fifteen episodes per cell is fifteen.**" | |
| Title "Nobody Will Check Behind You" | 25 | Frontmatter `title` | |

## Deliberately left out

- The κ values (0.95, 0.88), semantic content 36.1 % / 50.5 %, the "progress notification" rows.
- Receivers replying to 54 of 71, the refuter's 61 of 66 (92 %) stability.
- The four failure examples under named roles (files edited but not published, aggregate count,
  phantom inventory, 2 of 5 questions): good, but the "claiming done" line carries them.
- The July detail (7/19 and 11/19 pairs, the integrator that "rescued 8 pairs and broke 0").
- The one named-arm session that republished the artifact, and "the sessions in the named arm
  mostly did *not* claim the release" (kept as an optional line in script.md, cut for length).
- The consumer session that found the stale artifact in every broken episode.
- The four failed instruments (14-turn window, integer/string ids, 100-char truncation, keyword
  classifier). The article's point here is about its own method, not the finding; Javier's rule
  is not to dwell on his own earlier mistakes.
- Headless agent teams limitation in detail: reduced to the on-screen footnote in scene 24.

## Article issues / doubts found

1. **3 of 70 vs 71 requests.** The follow-through section counts "Of 71 requests" and "Receivers
   reply to 54 of 71", but the silent-drop row reads "3 of 70". Possibly one request was excluded
   (e.g. unresolvable), but the article doesn't say why. The video shows "3 of 70" as written next
   to "71 requests"; worth a one-word explanation in the article, or align the denominators.
2. **"One in four or five 'done' claims".** The table's "Did not · 17–26 %" is the share of
   *requests* not complied with (it includes the 3 silent drops and any unanswered requests),
   while the text turns it into "one in four or five 'done' claims does not survive someone
   checking". Those are different denominators (requests vs claims of completion). The video
   keeps the article's sentence on screen but does not voice a figure for it.
3. **"Eight lines" vs "one paragraph".** Consistent with the repo (`diff` of the two briefs = 8
   lines, including the heading and separators); the quoted English paragraph is three sentences.
   Not an error; the video says "one paragraph".
4. **Hook strength.** "made my agent check its own release" summarises 15/15 in one loaded
   setup, 15 episodes per arm, on the peer channel. The hedges come in scenes 16 and 24; if the
   hook should be safer, alternative: "One paragraph got my agent to check its own release."
5. **Part I vs Part II substrate.** Part I is agent teams (named roles, real traffic); Part II is
   the peer channel with an ownership paragraph (the teams feature cannot run headless). The video
   keeps them as separate parts and states it on screen; it never claims the teams product was
   tested in Part II.
6. Minor: description says detection went "from 8/15 to 15/15" while the hero blockquote says
   "a 30-episode experiment"; consistent (15 + 15). Fisher p recomputed = 0.00632, matches.
