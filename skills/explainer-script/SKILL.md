---
name: explainer-script
description: Write the script for a 30-60 s narrated explainer video of a blog article - hook, setup, experiment, finding with its exact number, so-what and closing card - with a visual idea per scene mapped to an animation component, caption reading-speed limits and an optional parallel Spanish version. Use when drafting or revising what an article video says, before any scene is built.
---

# Explainer script

A script is a short list of scenes. Each scene has one or more narration lines and one visual.
It is written for a viewer scrolling with the sound off, so every line must also work as a
caption.

## Length

- 30-60 s, aiming at 45 s (`targetSeconds` in `src/settings.ts`).
- That is about **75-140 spoken words in EN**. Count them. Spanish runs about 15-20 % longer
  for the same content.

## Structure

1. **Hook, within the first 3 s.** The surprising finding or a concrete question. Never "In
   this video...", "Today I want to talk about...", or a greeting. Intro card.
2. **The story, right after the hook (~10 s, two or three lines).** Where this comes from, told
   as a story in plain words: the real situation the article starts from, what kept going wrong,
   and why it mattered. No scripts, conditions, models or numbers yet. A viewer who never read
   the article must know what the video is about before anything technical appears; without
   this, the rest of the video is lost on them, however good it is. Spending ten seconds here is
   always worth it: cut later content before cutting the story.
3. **Setup.** What was being tested and why it matters, in one or two lines.
4. **The experiment in one picture.** The mechanism or design as one visual (a flow, a
   comparison). One idea, not the whole method section.
5. **The finding, with its exact number.** The number as the article writes it ("14/20 vs
   4/20", "83 %", "p = 0.0018"): same rounding, same units.
6. **So what.** What the finding means for someone building with it, no stronger than the
   article claims.
7. **Outro card line:** "More at javieraguilar.ai" (ES: "Más en javieraguilar.ai").

## Voice

- First person, as the article is written: "I gave the planner...", "What I found...".
- Claims as nuanced as the article. Keep its hedges ("on these runs", "in this setup").
- Short spoken sentences. One idea per line. No jargon the article does not explain.
- **Numbers in the voice.** Say them the way you would explaining the result to a colleague:
  naturally, as part of the sentence. The only thing to avoid is reading a table aloud.
- **Clarity beats brevity.** The viewer must understand what was tested before hearing the
  result. If the setup needs another scene to make sense, add it, even past 60 s; labels
  scattered over the visual are not an explanation.
- **Key points, loud and clear.** Each key point (what is being tested, what makes the subject
  different, the verdict) gets its own spoken sentence and its own unmistakable on-screen
  moment: a card, a stamp, a big line. The closing must say plainly what the result means
  (good, bad, or "only sometimes"), as the article concludes it.

## Captions

- Captions are burned in from the narration text, at most two rows of ~32 characters.
- **At most 17 characters per second** on screen (`npm run lint` checks it). A line that reads
  too fast needs fewer words, not a faster voice.
- Write numbers in the caption as the article does. If the TTS should say them differently,
  give the line a spoken form (see the `narration` skill); never change the caption for it.
- Avoid long URLs and code identifiers in narration; they wrap badly and read worse.

## EN and ES

- Write the EN/ES pair together, line by line, so both cuts stay in step. ES is optional: leave
  the ES text empty while a video is EN-only.
- The ES line says the same thing, not a word-for-word translation; keep it as short as EN.

## Visual per scene

Every scene gets a visual idea, mapped to a component from the library (see
`explainer-animation`):

| Visual idea | Component |
|---|---|
| One headline figure counting up | `Counter` |
| Two to five values side by side | `BarCompare` |
| A pipeline, a hand-off, a broken link | `FlowDiagram` |
| The sentence the article hangs on | `KeyQuote` |
| Two to four figures at once | `StatGrid` |
| Hook and close | intro / outro cards |

If no component fits, flag the scene **"bespoke"** with a one-line description of the
animation. Avoid a video that is only text on a gradient: each article gets at least one
visual that shows its mechanism.

**Draw it, don't letter it.** When a scene shows people, models, agents, objects or places as
initials, labels or plain text boxes, propose the drawing instead: a caricature for each person
(not a circle with "A"), a small illustration for each object, a stylised terminal rather than a
literal screenshot. Keep text for numbers, quotes and the question on screen. Flag each one in the
script ("Ana, Bea, Carlos, Diego as caricatures") so the assets get made before the build.

**Tone per line (optional).** The narration is voiced `excited` by default. Where a line
reads better in another register, mark it in the script with its emotion: a question
`curious`, a plain statement of method `contemplative` or `confident`, a doubt `skeptical`, a
reveal `amazed` or `surprised`, the verdict `confident` (speed 1.05). A handful per video, on the
lines that carry the change of mood; the rest keep the default (see `narration`).

**Author cameos (optional).** When the video has an author avatar (see `explainer-animation`),
mark 2-3 moments for it in the script: a *role* cameo where the narration says what the author
did ("I trained…", "I labelled…"), or a *reaction* at a reveal (amazed), a failure or dubious
claim (sceptical), a self-deprecating line (laughing). Vary the poses and the moments between
videos; the same formula every time stops reading as personal.

## Script format

Write `script.md` as a table, one row per narration line:

| Scene | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|

- "Source sentence" quotes the article for every number and every claim in the line.
- End with the word count (EN) and the estimated length.
- **Cold-viewer check before presenting:** read only the first ~15 s of narration as someone
  who has never seen the article. Can they say, in one sentence, what real situation this is
  about? If not, the story is missing: add it, even if the video gets longer.
- Present it for approval before anything is built.
