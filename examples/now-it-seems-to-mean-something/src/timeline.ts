// The Definition Looked Complete — explainer video (EN). Narration from the approved script v1.1
// (script.md). One stage for the whole video: the repair loop drawn as a walled room with a gate,
// and a handoff note whose highlighted clause casts a violet shadow that spills over the gate
// (ScopeNote). Consecutive ScopeNote scenes with `blend: true` cross-blend instead of dipping.
import type { Cuts } from './types.ts';
import { anim, lineSeconds, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: the first line is drawn by the scene itself as the hook title (no caption).
    anim(
      'hook',
      'ScopeNote',
      { mode: 'hook', titleLine: true },
      [
        say(0.05, 'This note supported 16 correct reviews.', '', { en: 'This note supported sixteen correct reviews.' }),
        say(0, 'It also changed what one flag meant.', ''),
      ],
      { min: 6 },
    ),
    anim('write', 'ScopeNote', { mode: 'write' }, [say(0.2, 'An agent summarised code from one of my projects for a reviewer agent.', '')], { min: 5.2 }),
    anim('room', 'ScopeNote', { mode: 'room', blend: true }, [say(0.15, 'In the code, the flag is set only inside the repair loop.', '')], { min: 4.6 }),
    anim('spill', 'ScopeNote', { mode: 'spill', blend: true }, [say(0.15, 'The note turned that into a rule about the data alone.', '')], { min: 4.8 }),
    anim(
      'handoff',
      'ScopeNote',
      { mode: 'handoff', blend: true },
      [say(0.1, 'The loop condition was missing from the first note.', ''), say(0, 'Two handoffs kept it that way.', '')],
      { min: 6 },
    ),
    anim(
      'reviews',
      'ScopeNote',
      { mode: 'reviews', blend: true },
      [say(0.15, 'With the final note, two models reviewed all 16 changes correctly, both times.', '', {
        en: 'With the final note, two models reviewed all sixteen changes correctly, both times.',
      })],
      { min: 5 },
    ),
    anim('probe', 'ScopeNote', { mode: 'probe', blend: true }, [say(0.15, 'Then I built one case that splits note from code: zero iterations allowed.', '')], { min: 5 }),
    anim('code', 'ScopeNote', { mode: 'code', blend: true }, [say(0.1, 'The loop never runs, so the code returns False.', '')], { min: 3.8 }),
    anim(
      'verdict',
      'ScopeNote',
      { mode: 'verdict', blend: true },
      [say(0.1, "GPT accepted it, citing the note's definition.", '', { en: "G P T accepted it, citing the note's definition." })],
      { min: 3.8 },
    ),
    anim('rename', 'ScopeNote', { mode: 'rename', blend: true }, [say(0.1, "Renaming the flag didn't fix it.", '')], { min: 3.2 }),
    anim('grid', 'ScopeNote', { mode: 'grid', blend: true }, [say(0.15, 'One exploratory case, run twice per model: not a rate.', '')], { min: 4.4 }),
    anim(
      'fix',
      'ScopeNote',
      // `sentence`: spoken length of fix-02, so the shadow snaps back on "loop", not after it.
      { mode: 'fix', blend: true, sentence: lineSeconds('fix-02', 'this flag can only be set inside the repair loop.') },
      [say(0.15, 'The missing sentence was short:', ''), say(0, 'this flag can only be set inside the repair loop.', '')],
      { min: 7.4 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
