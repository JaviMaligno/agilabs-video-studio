---
name: schedule-social-video
description: Schedule finished article videos as Instagram and Facebook reels (Meta Business Suite) and as LinkedIn video posts, with per-platform captions and a calendar that avoids clashes. Use when asked to publish, schedule, programar or post one or more rendered videos (out/main-en-vertical.mp4) to Instagram, Facebook or LinkedIn.
---

# Schedule social video

Takes rendered videos (`examples/<slug>/out/main-en-vertical.mp4`) and gets them scheduled.
When the browser tool can upload files, the agent does the whole thing; otherwise the person's
only manual step is choosing each file in the browser's file dialog, once per video. Deleting
scheduled entries is always the person's step (it is permanent).

## 0. Gate: only approved, final videos

Nothing is uploaded or scheduled, not even as a draft in the composer, unless all three hold:

- **The author approved this video**, the rendered mp4 itself, in so many words, after watching
  it. An approved script is not an approved video, and "yes" to a plan that ends in "and I'll
  schedule it" approves the plan, not the video that comes out of it. Hand the video over (open
  it locally) and wait.
- **It has the final voice.** A video voiced with the Kokoro fallback, or with any voice marked
  preliminary, is a draft for review only (see `narration`). It is re-voiced and re-rendered
  before scheduling, and the author sees that version too if anything changed beyond the voice.
- **It has an approved cover.** The cover can only be set while creating the reel (see step 4),
  so a reel scheduled without its cover, or with a placeholder, has to be uploaded again. The
  author approved this cover image, the file itself (`out/cover.png` or its copy in the hand-off
  folder), and it matches the current cut: a cover made for an earlier version is not approved
  for a remake. Open the file before uploading it, since a frame with the same name is not the cover.

If any is missing, stop at handing the video over and say what is still pending.

## 1. Prepare the hand-off folder

Make a folder the person can reach from Finder (e.g. `~/Desktop/<Brand>-redes/`), not a
temp or scratch path:

- `videos/NN-<slug>.mp4`, numbered in publishing order. Re-encode anything over ~25 MB
  (`ffmpeg -c:v libx264 -crf 20 -preset slow -c:a copy -movflags +faststart`).
- `portadas/NN-<slug>.png` from each video's designed cover, `out/cover.png` (see *The cover is a
  designed image* in `explainer-animation`). `out/poster-en.png` is a frame of the video, not the
  cover. Check the number is free: an older video may already use it.
- `textos-reels.md`: per video, three ready-to-paste blocks, nothing to edit by hand:
  - **INSTAGRAM**: caption ending in "link in bio" (caption links are not clickable on IG).
  - **FACEBOOK**: the same caption with the exact article URL in place of "link in bio".
  - **ENLACE PARA LA STORY**: the bare URL for the story link sticker.

Captions: hook line first (it is what shows before "more"), numbers exactly as the
narration says them, 4-5 hashtags, no claims stronger than the article.

## 2. Calendar

- **Never before its article.** A reel whose caption sends people to an article ("link in bio",
  the URL on Facebook) goes out on or after the day that article is live. Check the site's publish
  schedule, not the calendar from memory: an article that moved takes its reels with it. If the
  article publishes the same day through a scheduled job that can run hours late, schedule the
  reel late in the evening (it has happened that the job only ran after 18:00 UK).
- **A new article's reel goes out the day the article does**, and its part 2 the next day (two
  reels on one day compete). The rest of the calendar runs one reel every two days at a fixed
  evening hour (18:00 local). Check the blog publish schedule and the LinkedIn schedule first: a
  reel goes out on or after its article's day.
- **Everything not yet published can be reordered** (Business Suite reschedules without
  re-uploading), except today's reel. Propose the best overall order (series together, recent
  articles near their publication, topical reels on their date) rather than only filling gaps.
- Work out weekdays with `date` (`date -j -f %Y-%m-%d 2026-11-04 +%A` on macOS), never by hand.
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
2. Add the video. If the browser tool can upload files (e.g. Claude in Chrome's `file_upload`),
   the agent does it without the person; otherwise ask them to click **Add video** and pick
   `videos/NN-<slug>.mp4`. Agent upload (see *Uploading without the file dialog* below).
3. Turn on **Customise for Facebook and Instagram** and paste each platform's block.
4. Thumbnail: upload the designed cover (`out/cover.png`) through **Subir imagen**, the same
   captured-input upload as the video, and look at it in the preview. Open the file before
   uploading: a frame with the same name is not the cover. The cover can only be set while
   creating the reel; a scheduled reel lets you edit the text and the date, and a published one
   nothing, so a wrong cover means creating the reel again.
5. Auto-captions: with both platforms selected the Share step has **Subtitles ticked by default**;
   untick it (the videos have burned-in captions) and confirm it reads "Aplica subtítulos a tu vídeo".
   With both platforms there is also an Edit step (music library): skip it without adding audio.
   If an upload stalls at 95 %, reload the composer and add the file again (texts are lost).
6. Schedule: select **Programar** in the scheduling options first; until then the main button
   reads **Compartir**, which publishes now. Date: open each calendar, move with ›, click the day;
   a missed click silently keeps today's date, so zoom on both rows. Time: click the hour segment
   and type `18`, then the minutes and type `00`. Re-check Subtitles is unticked, press
   **Programar**, and check the confirmation dialog shows the same date for Facebook and Instagram.
7. Reopen the composer for the next video and ask for the next file.

### Uploading without the file dialog

Clicking **Add video** opens the native picker, which automation cannot drive. Capture the file
input instead, then hand it the file with the browser tool's upload action:

```js
// Run in the composer page, then click nothing else until the upload is done.
window.__orig = window.__orig || HTMLInputElement.prototype.click;
HTMLInputElement.prototype.click = function () {
  if (this.type === 'file') { window.__cap = this; return; }   // swallow the picker
  return window.__orig.call(this);
};
[...document.querySelectorAll('div[role=button],button')].find((b) => b.innerText.trim() === 'Añadir vídeo').click();
const i = window.__cap; if (!i.isConnected) document.body.appendChild(i); i.style.display = 'block';
```

Then locate that `input[type=file]` (e.g. `find` "file input") and upload to its ref. Notes:

- **Size and location:** upload tools are capped (Claude in Chrome: 10 MB, only files in the
  session's scratch/shared folders). Re-encode a copy there first:
  `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -c:a copy -movflags +faststart out.mp4`
  (crf 28 if still over ~9.8 MB). Reels look the same at this size.
- The composer loads blank for a few seconds; wait until **Add video** exists before running the
  snippet. Reload the composer for each reel (the override lives in the page).
- **Captions:** after the customise switch, the Facebook and Instagram text boxes are the same
  element under two tabs. Type the Facebook text, click a neutral area to close the hashtag
  suggestions, select the Instagram tab, click the box again and check it is empty before typing.
- **Subtitles** sometimes come back ticked after the steps: untick by script (the checkbox whose
  `closest('[role]')` text starts with "Subtítulos") and check it again right before scheduling.
- **Time:** type the hour and the minutes into their own segments ("18", then "00"); typing
  "1800" into the hour leaves it at 00. Zoom on the date and time fields before **Schedule**.
- **Next** stays disabled while the video processes; wait, don't click through.

Not available in this composer: Instagram collaborators and the AI-content label. Both
can be added from the Instagram app after publication if wanted.

After each reel goes live the person shares it to their own story with the link sticker.

### Moving or removing scheduled reels

Content → Programadas lists each reel twice (Facebook and Instagram are separate entries); search
by the caption's first words to find both. Row menu «…» → Administrar publicación:

- **Reprogramar publicación** changes date and time without re-uploading. Still limited to 29 days
  ahead; do it per platform and check the dialog's date before confirming.
- **Eliminar** is the way to take a reel off the calendar. The dialog says the reel is deleted
  *definitivamente*: it is a permanent deletion, so the person clicks it, not the agent. **Never
  "Mover a borradores"**: it leaves the scheduled entry in "Error al publicar", and deleting that
  entry deletes the draft with it. The reel must be uploaded again when its window opens.
  In a batch, deletions are gathered and asked for once at the end (see *Deleting in one step at
  the end of the batch*).
- Free a date before moving another reel onto it (one reel per day).

### Replacing a scheduled reel with a new cut

A scheduled reel's video cannot be swapped. Upload the new cut as a new reel with the same texts,
date and time; the old Facebook and Instagram entries then have to be deleted. In
Programadas both versions show the same caption and the list order is not creation order.
**Tell them apart by creation time, not by thumbnail** (thumbnails misled once and the new cut
got deleted): each row's React fiber carries the post, so
`memoizedProps.item.creationTime` (walk `.return` up from the row element until a fiber has
`memoizedProps.item`) gives when it was created. Load the whole list (scroll until no rows are
added), group rows by date, platform and caption, keep the newest of each group and tick the
checkboxes of the rest, so the person only has to delete the selection. Afterwards, check every
date has exactly one Facebook and one Instagram entry; a stray duplicate on today's date posts
twice.

### Deleting in one step at the end of the batch

Asking for a deletion after each replaced reel interrupts the person once per reel. In a batch,
deletions wait for the end:

1. **Accumulate.** Each time a reel already scheduled is replaced (or taken off the calendar),
   add a row to a **Borrar** table in `textos-reels.md`: date and time, reel (number and slug),
   platforms (FB, IG), the caption's first line, and the creation time of the entry to delete
   (and of the one to keep). Do not ask for anything yet.
2. **One selection.** When the batch is done, open Content → Programadas once, load the whole list,
   and tick every entry of the table at once (the creation-time grouping above, run over all the
   rows), so a single view holds every entry to delete and nothing else. Check the ticked count
   equals the table (two per reel when both platforms are scheduled).
3. **One notice.** Tell the person once: the table (date / reel / first line / platforms) and
   "they are ticked in Programadas; delete the selection". The deletion itself stays theirs, as
   always (it is permanent); it is asked for once for the whole batch, not per reel. The day a
   replaced reel goes out is the exception: if its old entry would post before the batch ends,
   ask for that one deletion straight away.
4. **Verify the whole list.** After they delete, reload Programadas and check every row of the
   table is gone and every date of the batch has exactly one Facebook and one Instagram entry,
   the new ones (by creation time). Report the result in one line and mark the rows done in
   `textos-reels.md`.

## 4. LinkedIn

Video posts go through the site repo's LinkedIn tooling (`scripts/linkedin/post-standalone.js`
and `scripts/linkedin/posts/schedule.json`): put the video at
`scripts/linkedin/posts/<post>/video.mp4` (force-add, `*.mp4` is gitignored), the text in
`<post>.txt`, add the date to `schedule.json`, and merge to `main` through a PR. Re-voiced or
re-rendered videos replace that file before the post date.

## 5. Close

Verify in the Planner month view that each day shows both the Instagram and the Facebook
item, then record the calendar (date, slug, platforms) where the project keeps it.

## 6. Metrics, about 72 h after each reel

Record each reel in the project's metrics file (for AGILabs, `metricas-reels.md` in the hand-off
folder): from Business Suite (Content → Published, columns) reach, views, likes, comments, shares,
saves, new followers and average watch time; from the Instagram app (the reel's insights) the
retention at 1 s and 3 s and the share of non-followers. These numbers decide the features under
test (cold open, cover frame): a feature becomes the default when it improves them.
