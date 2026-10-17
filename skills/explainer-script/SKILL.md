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
2. **Setup.** What was being tested and why it matters, in one or two lines.
3. **The experiment in one picture.** The mechanism or design as one visual (a flow, a
   comparison). One idea, not the whole method section.
4. **The finding, with its exact number.** The number as the article writes it ("14/20 vs
   4/20", "83 %", "p = 0.0018"): same rounding, same units.
5. **So what.** What the finding means for someone building with it, no stronger than the
   article claims.
6. **Outro card line:** "More at javieraguilar.ai" (ES: "Más en javieraguilar.ai").

## Voice

- First person, as the article is written: "I gave the planner...", "What I found...".
- Claims as nuanced as the article. Keep its hedges ("on these runs", "in this setup").
- Short spoken sentences. One idea per line. No jargon the article does not explain.

## Captions

- Captions are burned in from the narration text, at most two rows of ~32 characters.
- **At most 17 characters per second** on screen (`npm run lint` checks it). A line that reads
  too fast needs fewer words, not a faster voice.
- Write numbers in the caption as the article does. If the TTS should say them differently,
  that is handled in narration (see the `narration` skill), not by changing the caption.
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

## Script format

Write `script.md` as a table, one row per narration line:

| Scene | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|

- "Source sentence" quotes the article for every number and every claim in the line.
- End with the word count (EN) and the estimated length.
- Present it for approval before anything is built.
