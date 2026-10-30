---
name: article-video
description: Turn a published blog article into a short narrated, animated vertical explainer video (usually 45-90 s, 1080x1920) in the AGILabs brand, rendered locally with Remotion. Use when asked to make a video, reel, short or explainer from an article or blog post, or to re-render one made with this plugin (a folder with video.config.mjs and src/timeline.ts).
---

# Article video

Orchestrates the whole path from an article to a finished MP4. The other skills hold the
detail; load them at the step that needs them:

- `explainer-script`: writing the script and picking a visual per scene.
- `explainer-animation`: the component catalogue, the timeline, bespoke components, stills.
- `narration`: TTS (Cartesia, Kokoro fallback), pronunciation, audio QA.

The Remotion project lives in the plugin's `template/` folder (`${CLAUDE_PLUGIN_ROOT}/template`
when installed as a plugin; next to `skills/` in the plugin repo).

## Non-negotiables

- **Fact-check.** Every number and every claim, on screen or spoken, is traced to a sentence of
  the article. Keep the table in `factcheck.md` (claim, where it appears, the article sentence
  quoted). Figures are shown exactly as the article writes them: same rounding, same units,
  same "14/20" rather than "70%". A mismatch is fixed in the timeline, never in the article.
  The fact-check covers the narration and the numbers and claims shown on screen, nothing else.
  Visuals are chosen for impact, not as a literal replay of the experiment: an illustrative
  scene (real data replayed freely, markers placed for clarity, a stylised mechanism) is fine,
  because the rigour lives in the article and its repo.
- **Voice.** The narration speaks as the article is written: first person ("I ran...", "I
  found..."), with claims no stronger than the article's. If the article hedges ("in this
  setup", "on these 20 runs"), the script hedges too. No punchier-than-source wording.
- **Branding.** AGILabs only: the AGILabs badge and `javieraguilar.ai`. No personal name
  anywhere, not in the cards, the poster, the captions or the file metadata.
- **Route overview, then build.** Before building, show the author a short overview of the route: the
  hook, the line that tells a cold viewer what the video is about, the verdict, and the "Must show"
  list. Then carry on building; they review the finished video. The full `script.md` is there
  whenever he asks to read it.

## Workflow

1. **Pick the article.** Use the one named. If none is named, read the published articles and
   propose 2-3 candidates, each with its title, a hook line, the visual idea and the key number
   (quoted). Favour articles whose story can be drawn: people, objects, a mechanism, a scene that
   moves. Let the person choose.
2. **Write the script** with `explainer-script`: the narration lines (EN, ES optional), a visual
   idea per scene mapped to a library component or flagged "bespoke", and the source sentence
   for every number.
3. **Overview of the route.** Show the overview (see above) and continue. When the author answers
   with changes, apply them and keep building.
4. **Create the video folder.** Copy the template without its generated files:
   - inside the plugin repo: `examples/<article-slug>/`;
   - from any other repo: `./video/<article-slug>/`.

   ```bash
   rsync -a --exclude node_modules --exclude out --exclude public/audio --exclude public/music \
     --exclude .env "${CLAUDE_PLUGIN_ROOT}/template/" "video/<article-slug>/"
   cd "video/<article-slug>" && npm ci
   ```

   Save the approved script as `script.md` in that folder.
5. **Build the timeline** with `explainer-animation`: set `src/settings.ts` (`articleTitle`,
   `voices`, `subtitles`, `targetSeconds`, `poster`, and `avatar` when the author has one) and
   write `src/timeline.ts` from the script, with the cameos it marks. Add bespoke components if
   the script flagged any, each with its `frameState` test, and generate the drawings it asks for
   (people, objects) in the same style as the author's avatar, as transparent PNGs in `public/`.
6. **Lint:** `npm run lint`. Fix every finding (length, caption speed, unknown component).
   Run `npm test` too when a component was added or changed.
7. **Fact-check** against the article and write `factcheck.md` (see above).
8. **Narrate:** `npm run tts`, then `npm run audio-qa` (see `narration`). Listen to anything
   it flags. Run `npm run lint` again: real line lengths replace the estimates.
9. **Stills, and look at them.** Render one still per scene plus one every ~3 s and Read every
   PNG. Check the brand, the safe areas, nothing overflowing, numbers equal to the article, and
   captions matching the beat on screen. A clean build is not proof that a frame looks right.
10. **Render:** `npm run render` (vertical EN). `-- --es` for the Spanish cut, `-- --landscape`
    for 1920x1080. Then `npm run audio-qa` again to measure the mix (-16 LUFS integrated).
11. **Deliver:** `npm run deliver` writes the poster PNG, the SRT and `out/manifest.json`. Look
    at the poster. Hand over the MP4 path and the poster; publishing is a separate step.

## Re-rendering an existing video

Open its folder, run `npm ci` if `node_modules` is missing, change `src/timeline.ts` or the
settings, then repeat from step 6. TTS only re-voices lines whose text changed.

**Changing what the author pointed at.** The approved version is the one in git. Start from it, write
the list of lines that change (before → after) and change exactly those; when you hand the change
to another agent, hand it that list and the instruction to keep everything else. Check with
`git diff` that the diff holds only those lines. If another change looks necessary (a factual fix),
name it to the author on its own.

**Keep the approved takes.** Before re-voicing a video the author has approved, copy `public/audio/` to
`out/approved-audio-<date>/`. A take they liked (a reaction that came through in the voice) can then
be restored by copying its WAV and `.words.json` back.

**Videos made from an older template.** Each video folder carries its own copy of the template, so
template fixes reach it only when applied. The plugin's `scripts/migrate/` holds the migrations
(`apply_avatar.py` for cameos and the outro avatar, `apply_tone.py` for per-line tones and the
`excited` default); each is idempotent and fails loudly when an anchor is missing.

## Trying a new idea

A new feature (a cold open, a cover frame, a new card) is tried first in one video's folder, as an
option that is off by default in the template. It moves into the template once the author approves
the result, or once the metric it targets improves (see `schedule-social-video`), and is then
applied to the videos still to be published.

## Where things go

- Source (timeline, settings, bespoke components, `script.md`, `factcheck.md`) is committed.
- `out/`, `public/audio/`, `public/music/`, `node_modules/` and every `.mp4`/`.wav` are not.
- `.env` holds the TTS key and is never committed or printed.
