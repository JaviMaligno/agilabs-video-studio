// The Riemann hypothesis has a proof nobody has read — article video (EN). Narration from the
// approved script v0.3 (script.md), with the one line the cold read changed (see script.md).
// The video opens on the stack of Lean files still piling up, then follows one trail: a walker
// choosing a route, a small light running ahead, and other people arriving to map it.
import type { Cuts, Scene } from './types.ts';
import { anim, intro, outro, say, videos } from './narrate.ts';
import { FPS, sceneStarts } from './timing.ts';

/** Animations whose ambient motion runs on the video's clock, so it never jumps between scenes. */
const CLOCKED = ['FileStack', 'Trail'];

/** Gives each of those scenes the video second it starts at (`clock`). */
const withClock = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  return scenes.map((s, i) =>
    s.anim && CLOCKED.includes(s.anim.name) ? { ...s, anim: { ...s.anim, props: { ...s.anim.props, clock: +(starts[i] / FPS).toFixed(3) } } } : s,
  );
};

const build = (): Cuts => ({
  main: withClock([
    // Cold open: the stack is already growing on frame 0, the hook sits over it.
    intro('hook', [say(0.1, '"Math is dead." I read that a lot this week.', '')], 3, { name: 'FileStack', props: { mode: 'loom' } }),
    anim('stack', 'FileStack', { mode: 'count' }, [
      say(0.5, 'A mathematician, working with an AI model, published a proof of the Riemann hypothesis.', ''),
      say(0, 'Machines checked it in about a day.', ''),
      say(0, 'Nobody has read it.', ''),
    ]),
    anim('open', 'Trail', { mode: 'open' }, [say(0.15, 'But look at what the humans did.', '')]),
    anim('past', 'Trail', { mode: 'past' }, [say(0.15, 'The author had planned his whole career around this problem.', '')], { min: 4.5 }),
    anim('pick', 'Trail', { mode: 'pick' }, [say(0.15, 'His clue was a paper almost nobody discussed, in a pile a rival lab had published.', '')]),
    anim('unfold', 'Trail', { mode: 'unfold' }, [say(0.15, 'That is taste.', ''), say(0, 'Nobody automated it.', '')]),
    anim('outrun', 'Trail', { mode: 'outrun' }, [say(0.15, "Then the model went where he couldn't follow.", ''), say(0, 'He says so himself.', '')]),
    anim('draw', 'Trail', { mode: 'draw' }, [say(0.15, 'Now his job is to understand his own proof.', '')]),
    anim('second', 'Trail', { mode: 'second' }, [
      // Two takes of one sentence: spoken in one go, its first caption ran at 18.7 chars/s.
      say(0.15, 'The same afternoon,', ''),
      say(0, 'a mathematician with twelve years of work and no AI published his draft.', ''),
      say(0, '"We are still here."', ''),
    ]),
    anim('map', 'Trail', { mode: 'map' }, [say(0.15, 'Within a day there was a public map of the proof, drawn with AI.', '')]),
    anim('catchup', 'Trail', { mode: 'catchup' }, [say(0.15, 'Understanding is behind.', ''), say(0, 'AI is how it catches up.', '')]),
    anim('closer', 'Trail', { mode: 'closer' }, [say(0.15, 'My view: mathematics is more alive than it has ever been.', '')], { min: 6.2 }),
    // Silent card: badge, address, title and the credit line (SETTINGS.credit).
    outro('outro', [], 5.5),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
