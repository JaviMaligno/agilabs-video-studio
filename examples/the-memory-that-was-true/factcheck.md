# Fact-check: The Memory That Was True (v1.0)

Source: `src/content/blog/en/the-memory-that-was-true.md` on `origin/main` of the website repo
(pubDate 2026-09-27), cross-checked against the public checker in
`scripts/memory-audit/` (`checks.json`, `README.md`) on the same branch. Scope: narration, plus
the numbers and text shown on screen. Visuals are illustrative.

## Narration

| # | Claim (narration) | Article sentence | Verdict |
|---|---|---|---|
| 1 | "My agent handed me a memory. It was true in July." | "my agent handed me a stale memory and I very nearly acted on it."; "That was true in July." | OK. |
| 2 | "It said: one workflow per article." | "scheduling an article on this site means creating a single-use workflow named after the article" | OK. Condensed; the check in `checks.json` encodes the same claim (`scheduled-publish-*.yml`, one per article). |
| 3 | "Since then, a single queue file replaced them all." | "The mechanism has since been replaced by a manifest: one JSON file holding the publication queue. There is **not one** of those workflows left on the main branch." | OK. "queue file" = "one JSON file holding the publication queue"; "all" = "not one left". |
| 4 | "The memory was not wrong." | "The memory wasn't wrong." | OK. Verbatim, uncontracted for caption speed. |
| 5 | "It stopped being true while nobody was looking." | "It was true, and it stopped being true while nobody was looking." | OK. Verbatim. |
| 6 | "So I audited the 35 memories my agent keeps." | Description: "I audited the 35 memories my agent keeps about this project."; "Across the 35 memories this project had on 11 September" | OK. "this project · 11 Sep" on screen. |
| 7 | "The idea: tie each memory to a check against the repository." | "The idea is simple: attach to each memory a check that runs against the repository" | OK. Describes the idea; scene 12 shows that only 10 got one. |
| 8 | "It claims those workflows exist? If none is left, it turns red." | "*this memory claims those workflows exist, so there should be at least one*. If there isn't, the memory gets flagged."; table "red · claims something no longer true" | OK. "flagged" shown as red, the article's state name. |
| 9 | "A preference changes only when I change my mind." | "**A preference doesn't become false by itself.** […] it changes the day I change my mind, and on that day I say so." | OK. |
| 10 | "A fact about the system expires on its own." | "**A fact about the system does expire on its own**" | OK. Verbatim. |
| 11 | "Only that kind can be checked." | "So automatic verification only makes sense over the second half."; "**you can only check what can expire without anyone touching it.**" | OK. "that kind" = facts that expire on their own. |
| 12 | "Three came out red." (+ "7 green · 3 red · 25 grey" on screen) | Table: green 7, red 3, grey 25 | OK. Matches `checks.json`: exactly 10 memories have checks (7 + 3). The three reds are the entries for the publishing mechanism (`file_matches` a per-article workflow), the language-limits experiment and the agent-code-practices campaign (`file_absent` on articles since published). |
| 13 | "I checked each by hand. None was wrong when written." | "I verified each red by hand, because a red is an accusation. All three held up."; "**None was wrong when written.**" | OK. |
| 14 | "All three recorded a situation in progress, born with an expiry date." | "**All three described a transitional state.**"; "one recording a situation in progress is born with an expiry date." | OK. |
| 15 | "And most, 25 of them, can't be checked at all." | Table "grey 25 · no check is possible"; summary "most cannot be checked at all" | OK on 25 / 35. Deliberately avoids the article's "about 80%": see "Problems in the article" below. |
| 16 | "It's judgement and ways of working. That isn't a flaw." | "that 80% is judgement, preferences and ways of working"; description: "can't be checked at all, and that isn't a flaw." | OK. "preference" appears on the grey labels; the point (not a flaw) is the article's. |
| 17 | "One green was stale too: its files existed, its expiry date had passed." | "came out **green**: its seven files all exist, all verified. And inside, that same memory said a credential expired on a date that by then was a month past."; "The green was correct and the memory was stale, both at once." | OK. "its expiry date" = the credential's expiry date the memory stated. Matches `checks.json` (the entry with seven `file_exists`). |
| 18 | "A green certifies what was encoded, not the whole memory." | "**A green certifies what was encoded, not the whole memory.**" | OK. Verbatim. |
| 19 | "That's one folder, not a staleness rate." | "Three reds out of thirty-five is not a staleness rate for anything: it's what came out of my folder." | OK. The article's hedge, kept. |
| 20 | "The verdict: the checker is clumsy." | "Let me give the verdict on the tool up front […]: **it's clumsy**." | OK. On screen: "by hand: same cost, same number" = "Reviewing all 35 by hand would have cost about the same and produced the same number." |
| 21 | "What keeps a memory true is updating it when the work ends." | "what keeps a memory alive isn't checking it: it's **closing the session by updating it**."; "When a piece of work ends […] that is the moment"; takeaway: "The moment to fix a memory is when the work that makes it stale finishes" | OK. |
| 22 | "And mark anything in progress as such: it will expire." | "**Anything recording a situation in progress should be marked as such**, because it will expire" | OK. |
| 23 | "More at javieraguilar.ai" | — | — |

## Numbers and text on screen

| On screen | Scene | Source | Note |
|---|---|---|---|
| Note "To schedule an article: one workflow per article.", tag "written · July" | 1-2 | "single-use workflow named after the article"; "true in July" | Paraphrase. |
| Files `scheduled-publish-<article>.yml` (three), then `publish-schedule.json` | 1-3 | Check glob `.github/workflows/scheduled-publish-*.yml`; manifest = `.github/publish-schedule.json` (repo CLAUDE.md / docs) | Three old files is illustrative (the article gives no count). |
| Calendar strip July → September | 3 | "true in July"; audit "on 11 September" | Illustrative of time passing. |
| Stamps "TRUE WHEN WRITTEN" / "STALE NOW" | 4-5, 13 | "None was wrong when written"; "stale memory" | |
| "35 memories", "this project · 11 Sep" | 6 | "the 35 memories this project had on 11 September" | |
| `{ "file_matches": ".github/workflows/scheduled-publish-*.yml" }` | 7 | Verbatim JSON block | |
| "WHAT EXPIRES ON ITS OWN?" / "avoid sweeping claims" / "only facts about the system" | 9-11 | Section "What expires on its own"; the article's own preference example | |
| "7 green · 3 red · 25 grey" | 12 | Table | |
| Red notes "scheduling = one workflow per article" · "article pending on its branch" · "two articles awaiting review" | 13 | The three bullets | Paraphrases; no dates shown (see problems below). |
| "IN PROGRESS" hourglass | 14, 22 | "a situation in progress" | |
| "25 / 35", grey labels "preference / judgement / way of working", stamp "NOT A FLAW" | 15-16 | Table; "judgement, preferences and ways of working"; description | No "80%". |
| Seven ticked file lines + "credential expires <date>", chip "a month past" | 17 | "its seven files all exist"; "a credential expired on a date that by then was a month past" | No real date, credential not named. |
| "1 person · 1 project" | 19 | "All of the above is one person and one project." | |
| "VERDICT", "CLUMSY", "by hand: same cost, same number" | 20 | "it's clumsy"; "would have cost about the same and produced the same number" | |
| "UPDATE WHEN THE WORK ENDS" | 21 | Takeaway bullet | |

## Anonymisation

- Memories are shown as generic paraphrases, never their file names; the credential, the
  services it belongs to and the production DevOps bot are not shown. Nothing from work material
  appears (the production system is left out of the video).

## Problems in the article (vs its data)

1. **"About 80%" does not match the table.** The table is 7 green, 3 red, 25 grey of 35, and
   `checks.json` has exactly 10 checked memories. 25 / 35 = 71%. The 80% appears to be 25 / 31
   (≈ 81%): "I went through the 31 memories with no check and only 7 admitted one", one dropped
   as forced, so 25 of those 31 stayed grey. But the article (EN and ES, body and description)
   says "about 80% **of my memory**" / "The other 80% can't be checked", which is a share of all
   35. Suggested fix: "about 70%" (or "25 of 35"), or say "80% of the ones that had no check".
   The video avoids the percentage and says "25 of them".
2. **"31 memories with no check" vs 35 total** is never reconciled in the text: the reader can
   infer that 4 already had checks (4 + 6 = 10 checked), but the article does not say so.
   Minor; not in the video.
3. **One red's dates look off.** "two articles were awaiting review and merge. They went out on
   15 and 30 July." The two articles that entry checks (`repetition-edges-of-language`,
   `ciphers-edges-of-language`) have pubDate 2026-07-15 and 2026-07-20 and were added to `main`
   on 15 and 19 July. "30 July" looks wrong (20 July?). Likewise "It was published on 30 August"
   for `practices-for-agents-substrate`: added to `main` on 30 August, but its pubDate is
   2026-09-08. Minor; the video shows no dates on the red notes.

## Build additions (v1.0 build)

Narration is unchanged from the approved script. Two lines were split at a punctuation mark, same
words, to give the animation a beat and keep caption cues over 0.8 s: scene 1 ("My agent handed me
a memory." / "It was true in July.") and scene 14 ("All three recorded a situation in progress," /
"born with an expiry date."); scene 16 likewise ("It's judgement and ways of working." / "That
isn't a flaw.").

On-screen text added while building, all illustrative or paraphrased from the article:

| On screen | Scene | Source / note |
|---|---|---|
| Tree: `.github/` · `workflows/` · `deploy.yml` · `devto-post.yml` · `scheduled-publish-article-a/b/c.yml` · `publish-schedule.json` (tag "queue") | 1-5, 7-8, 21 | `deploy.yml` and `devto-post.yml` exist on `origin/main`; the three per-article files are illustrative names matching the check's glob; the manifest is `.github/publish-schedule.json`. The tree is abridged (other workflows not drawn). |
| "work done ✓", rewritten note "add it to the queue file.", tag "updated" | 21 | "closing the session by updating it"; "one JSON file holding the publication queue". Illustrative. |
| "new memory · article pending on its branch" + "IN PROGRESS" | 22 | The article's second red bullet, as the example of a situation in progress. |
| "check" label over the JSON; "none left"; "file there → green · gone → red" | 7-8 | "there should be at least one. If there isn't, the memory gets flagged"; "There is not one of those workflows left". |
| "preference" / "fact about the system"; "only when I say so"; "no check needed"; tick on the system fact; "you can only check / facts about the system" | 9-11 | "it changes the day I change my mind, and on that day I say so"; "Nothing needs verifying"; "you can only check what can expire without anyone touching it". |
| "checked by hand"; "→ since replaced" / "→ since published" | 13 | "I verified each red by hand"; bullets 1-3 (mechanism replaced; articles published). |
| "a stable fact · ages well · no hourglass" | 14 | "a memory recording a stable fact ages well". |
| "a memory about publishing automation"; seven `file_exists` lines (paths redacted as bars); "credential expires on" + redacted date; "checked ✓" frame around the seven lines | 17-18 | "A memory about publishing automation came out green: its seven files all exist"; the entry has seven `file_exists` checks in `checks.json`. Paths and date not shown (anonymisation). |
| Quote "A green certifies / what was encoded, / not the whole memory." | 18 | Verbatim. |
| "my folder", "1 person · 1 project" | 19 | "it's what came out of my folder"; "one person and one project". |
| "the memory checker" (a note, a thread, a file) | 20 | The tool the article builds. |
