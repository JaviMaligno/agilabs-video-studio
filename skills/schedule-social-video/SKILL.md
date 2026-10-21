---
name: schedule-social-video
description: Schedule finished article videos as Instagram and Facebook reels (Meta Business Suite) and as LinkedIn video posts, with per-platform captions and a calendar that avoids clashes. Use when asked to publish, schedule, programar or post one or more rendered videos (out/main-en-vertical.mp4) to Instagram, Facebook or LinkedIn.
---

# Schedule social video

Takes rendered videos (`examples/<slug>/out/main-en-vertical.mp4`) and gets them scheduled.
The person's only manual step is choosing each file in the browser's file dialog: plan
everything else so that step happens once per video and never twice.

## 1. Prepare the hand-off folder

Make a folder the person can reach from Finder (e.g. `~/Desktop/<Brand>-redes/`), not a
temp or scratch path:

- `videos/NN-<slug>.mp4`, numbered in publishing order. Re-encode anything over ~25 MB
  (`ffmpeg -c:v libx264 -crf 20 -preset slow -c:a copy -movflags +faststart`).
- `portadas/NN-<slug>.png` from each `out/poster-en.png`.
- `textos-reels.md`: per video, three ready-to-paste blocks, nothing to edit by hand:
  - **INSTAGRAM**: caption ending in "link in bio" (caption links are not clickable on IG).
  - **FACEBOOK**: the same caption with the exact article URL in place of "link in bio".
  - **ENLACE PARA LA STORY**: the bare URL for the story link sticker.

Captions: hook line first (it is what shows before "more"), numbers exactly as the
narration says them, 4-5 hashtags, no claims stronger than the article.

## 2. Calendar

- One reel every two days at a fixed evening hour (18:00 local) works; check the blog
  publish schedule and the LinkedIn schedule first so a video never lands before its
  article is live, and avoid same-day clashes with article posts.
- **Business Suite only schedules up to 29 days ahead, on Facebook and on Instagram.** Anything
  later cannot be scheduled yet: leave it out, note the date from which it can be scheduled
  (post date minus 29 days) and add a reminder to the project calendar.
- Write the agreed dates into `textos-reels.md` and show the table before scheduling.

## 3. Instagram + Facebook: Meta Business Suite, one reel at a time

Use **Create reel** (Planner → Create post ▾ → Create reel), never **Bulk reel upload**:
bulk upload publishes to the Facebook Page only and has no Instagram option, so the
person ends up choosing every file twice.

Per video:

1. Open the composer; **Publish to** = Facebook Page **and** Instagram account.
2. Ask the person to click **Add video** and pick `videos/NN-<slug>.mp4` (the file dialog is
   native; browser automation cannot drive it, and file-upload tools are size-capped).
3. Turn on **Customise for Facebook and Instagram** and paste each platform's block.
4. Thumbnail: pick the most striking suggested frame (the hook frame usually wins).
5. Auto-captions: with both platforms selected the Share step has **Subtitles ticked by default**;
   untick it (the videos have burned-in captions) and confirm it reads "Aplica subtítulos a tu vídeo".
   With both platforms there is also an Edit step (music library): skip it without adding audio.
   If an upload stalls at 95 %, reload the composer and add the file again (texts are lost).
6. Schedule: date `dd/mm/yyyy`, hour, minutes; confirm the zoomed date reads correctly
   before pressing **Schedule**; check the confirmation dialog shows the same date.
7. Reopen the composer for the next video and ask for the next file.

Not available in this composer: Instagram collaborators and the AI-content label. Both
can be added from the Instagram app after publication if wanted.

After each reel goes live the person shares it to their own story with the link sticker.

### Moving or removing scheduled reels

Content → Programadas lists each reel twice (Facebook and Instagram are separate entries); search
by the caption's first words to find both. Row menu «…» → Administrar publicación:

- **Reprogramar publicación** changes date and time without re-uploading. Still limited to 29 days
  ahead; do it per platform and check the dialog's date before confirming.
- **Eliminar** is the way to take a reel off the calendar beyond the window (it goes to the
  trash). **Never "Mover a borradores"**: it leaves the scheduled entry in "Error al publicar", and
  deleting that entry deletes the draft with it. The reel must be uploaded again when its window
  opens.
- Free a date before moving another reel onto it (one reel per day).

## 4. LinkedIn

Video posts go through the site repo's LinkedIn tooling (`scripts/linkedin/post-standalone.js`
and `scripts/linkedin/posts/schedule.json`): put the video at
`scripts/linkedin/posts/<post>/video.mp4` (force-add, `*.mp4` is gitignored), the text in
`<post>.txt`, add the date to `schedule.json`, and merge to `main` through a PR. Re-voiced or
re-rendered videos replace that file before the post date.

## 5. Close

Verify in the Planner month view that each day shows both the Instagram and the Facebook
item, then record the calendar (date, slug, platforms) where the project keeps it.
