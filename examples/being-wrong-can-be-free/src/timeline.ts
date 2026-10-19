// Being Wrong Can Be Free — series video (EN). Narration from the approved script v1.2 (script.md).
// One top-down map (ReachMap) carries the story: reach drawn as light, the models' mistakes as
// overlays, the cost meter on top; one 3D beat (TorusStage) for the doughnut. Script lines are
// split at their sentence breaks so each beat of the animation has its own narration beat.
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';

const M1 = L('model 1 · filled disc', 'modelo 1 · disco lleno');
const M2 = L('model 2 · no fence', 'modelo 2 · sin valla');
/** Shorter hold after the last line where the next scene continues on the same map (blend). */
const BLEND = { tail: 0.55 };

const build = (): Cuts => ({
  main: [
    anim(
      'hook',
      'ReachMap',
      { mode: 'hook', chip: M1, meter: { from: '0', show: 2 } },
      [
        say(0.15, 'An AI-written world model got a whole region wrong.', ''),
        say(0, 'No test can catch it.', ''),
        say(0, 'Cost: exactly nothing.', ''),
      ],
      BLEND,
    ),
    anim('setup', 'ReachMap', { mode: 'setup', chip: L('truth', 'realidad'), chipIn: true }, [
      // Spoken comma: a breath after "spot" keeps the first caption cue under 17 chars/s with the cloned voice.
      say(0.2, 'A robot wants a high-value spot inside a fence that stops it on contact.', '', { en: 'A robot wants a high-value spot, inside a fence that stops it on contact.' }),
    ], { min: 4.4, ...BLEND }),
    anim('gauge', 'ReachMap', { mode: 'gauge', chip: M1, chipIn: true }, [
      say(0.2, 'The model wrote a filled disc.', ''),
      say(0, 'Wrong shape, but no run from outside gets in.', ''),
    ], BLEND),
    // "No test can tell." is cut (script v1.2: the next cut when the voiced video runs long; the
    // hook already says it and the overlapping trails carry it on screen).
    anim('twin', 'ReachMap', { mode: 'twin', chip: M1, meter: { from: '0' } }, [say(0.2, 'The planner acts identically.', '')], { min: 3.4 }),
    anim('blind', 'ReachMap', { mode: 'blind', chip: M2, meter: { from: '0', steps: [{ to: '1.116', beat: 1, delay: 0.1 }] } }, [
      say(0.2, 'A second model omits the fence:', ''),
      say(0, '1.116, worse than acting at random.', '', { en: 'one point one one six, worse than acting at random.' }),
    ], BLEND),
    anim(
      'doorFront',
      'ReachMap',
      { mode: 'doorFront', chip: M2, gap: { from: 0, to: 0.1, beat: 0, delay: 0.2 }, meter: { from: '1.116', steps: [{ to: '0.348', beat: 1, delay: 0.9 }] } },
      [say(0.2, 'Open a door on its route.', ''), say(0, 'At a tenth of a radian, danger collapses.', '')],
      { min: 5.6, ...BLEND },
    ),
    anim(
      'doorWide',
      'ReachMap',
      { mode: 'doorFront', chip: M2, gap: { from: 0.1, to: 0.6, beat: 0 }, meter: { from: '0.348', steps: [{ to: '0.029', beat: 0, delay: 0.5 }] } },
      [say(0.2, 'Wide open: 0.029.', '', { en: 'Wide open: zero point zero two nine.' })],
      { min: 3.4, ...BLEND },
    ),
    anim(
      'doorBack',
      'ReachMap',
      { mode: 'doorBack', chip: M2, gap: { from: 0.6, to: 0.6 }, meter: { from: '0.029', steps: [{ to: '1.116', beat: 1, roll: true }] } },
      [
        say(0.2, 'Rotate that same door behind the goal:', ''),
        say(0, '1.116 again.', '', { en: 'one point one one six again.' }),
      ],
      { min: 5.4 },
    ),
    anim('split', 'ReachMap', { mode: 'split', chip: M2 }, [
      say(0.2, 'Same mistake, same shape of hole.', ''),
      say(0, 'Only reach changed.', ''),
    ], { min: 4.4 }),
    anim(
      'torus',
      'TorusStage',
      // Beats: 0 go around, 1 through the hole, 2 its cost, 3 into the tube, 4 on the path.
      {
        chip: M2,
        at: { thread: 1, tube: 3, path: 4 },
        meter: { from: '0', show: 1, steps: [{ to: '0.019', beat: 2, delay: 0.1 }, { to: '0.898', beat: 3, delay: 1.45 }] },
      },
      [
        say(0.25, 'In 3D you can go around.', '', { en: 'In three D you can go around.' }),
        say(0, "Route through the doughnut's hole:", ''),
        say(0, '0.019.', '', { en: 'zero point zero one nine.' }),
        say(0, 'Into its tube: 0.898.', '', { en: 'Into its tube: zero point eight nine eight.' }),
        say(0, 'Being on the path is what costs you.', ''),
      ],
    ),
    anim('zoomOut', 'ReachMap', { mode: 'zoomOut' }, [
      say(0.2, 'Does a plan cross where my model is wrong?', ''),
      say(0, 'That decides the cost.', ''),
    ], BLEND),
    anim('newGoal', 'ReachMap', { mode: 'zoomOut', newGoal: true }, [
      say(0.2, "Where nothing goes, it's free today.", ''),
      say(0, 'No test will tell me when that stops.', ''),
    ]),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
