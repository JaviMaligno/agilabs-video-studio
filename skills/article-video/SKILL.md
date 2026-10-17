---
name: article-video
description: Turn a published blog article into a short narrated, animated vertical explainer video (30-60 s, 1080x1920) in the AGILabs brand, rendered locally with Remotion. Use when asked to make a video, reel, short or explainer from an article or blog post, or to re-render one made with this plugin (a folder with video.config.mjs and src/timeline.ts).
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
- **Voice.** The narration speaks as the article is written: first person ("I ran...", "I
  found..."), with claims no stronger than the article's. If the article hedges ("in this
  setup", "on these 20 runs"), the script hedges too. No punchier-than-source wording.
- **Branding.** AGILabs only: the AGILabs badge and `javieraguilar.ai`. No personal name
  anywhere, not in the cards, the poster, the captions or the file metadata.
- **Approval gate.** Nothing is built before the script is approved.

## Workflow

1. **Pick the article.** Use the one named. If none is named, read the published articles and
   propose 2-3 candidates, each with its title, a hook line, the key number (quoted) and a
   visual idea. Favour articles with an experiment, a clear number and a mechanism that can be
   drawn. Let the person choose.
2. **Write the script** with `explainer-script`: the narration lines (EN, ES optional), a visual
   idea per scene mapped to a library component or flagged "bespoke", and the source sentence
   for every number.
3. **STOP for approval.** Show the script and wait. Apply edits and show it again if asked.
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
   `voices`, `subtitles`, `targetSeconds`, `poster`) and write `src/timeline.ts` from the script.
   Add bespoke components if the script flagged any, each with its `frameState` test.
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

## Where things go

- Source (timeline, settings, bespoke components, `script.md`, `factcheck.md`) is committed.
- `out/`, `public/audio/`, `public/music/`, `node_modules/` and every `.mp4`/`.wav` are not.
- `.env` holds the TTS key and is never committed or printed.
