// Navier–Stokes Blows Up — article video (EN). Narration from the approved script v1.2 (script.md).
// One vortex, seen like water going down a drain, tightens from the first frame to the zoom; the
// continuum then breaks into particles, and the video closes back on the calm vortex.
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';
import { FPS, handOverAt, sceneStarts } from './timing.ts';
import { REST, VORTEX_FAMILY, type Knot, type Params } from './anim/vortex.ts';
import { MODE_KEYS } from './anim/VortexCore.state.ts';

/**
 * Every vortex scene shares one clock: timeline.ts gives each one the video second it starts at
 * (`clock`) and the same list of camera/collapse keyframes (`knots`, from MODE_KEYS placed on the
 * real beats), so two consecutive vortex scenes draw the very same vortex while they blend (no
 * ghosting) and the spin angle never jumps. Values a keyframe leaves out carry over.
 */
const withClock = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  const knots: Knot[] = [];
  let cur: Params = { ...REST };
  scenes.forEach((s, i) => {
    if (s.kind !== 'anim' || !s.anim || !VORTEX_FAMILY.includes(s.anim.name)) return;
    const t0 = starts[i] / FPS;
    for (const k of MODE_KEYS[String(s.anim.props.mode ?? '')] ?? []) {
      const sec = k.end ? handOverAt(s) : k.beat !== undefined ? (s.beats[k.beat] ?? 0) + (k.off ?? 0) : (k.at ?? 0);
      cur = { ...cur, ...k.v };
      knots.push({ T: +(t0 + sec).toFixed(3), ...cur });
    }
  });
  return scenes.map((s, i) => {
    if (s.kind !== 'anim' || !s.anim || !VORTEX_FAMILY.includes(s.anim.name)) return s;
    return { ...s, anim: { ...s.anim, props: { ...s.anim.props, clock: +(starts[i] / FPS).toFixed(3), knots } } };
  });
};

const build = (): Cuts => ({
  main: withClock([
    anim(
      'hook',
      'VortexCore',
      { mode: 'hook' },
      [say(0.2, 'A fluid at rest.', ''), say(0, 'A smooth push.', ''), say(0, 'Its speed goes to infinity.', '')],
    ),
    anim(
      'swarm',
      'SwarmToVortex',
      { mode: 'swarm' },
      [say(0.15, 'OpenAI proved it can happen, with some 10,000 agents.', '', { en: 'OpenAI proved it can happen, with some ten thousand agents.' })],
    ),
    anim('drain', 'VortexCore', { mode: 'drain' }, [say(0.15, "You've seen the shape: water going down a drain.", '')]),
    anim('skater', 'VortexCore', { mode: 'skater' }, [say(0.15, 'It spirals in and spins up, like a skater pulling in their arms.', '')]),
    anim('stretch', 'VortexCore', { mode: 'stretch' }, [say(0.15, 'It leaves along the axis: the core stretches and thins.', '')]),
    anim(
      'collapse',
      'VortexCore',
      { mode: 'collapse' },
      [say(0.15, 'Its radius shrinks like the square root of the time left.', ''), say(0, 'Its peak speed has no ceiling.', '')],
    ),
    anim('balance', 'VortexCore', { mode: 'balance' }, [say(0.15, 'Intuitive to read.', ''), say(0, 'Not to prove.', '')]),
    anim(
      'continuum',
      'ContinuumBreak',
      {},
      [
        say(0.15, "Long before the end, the core is narrower than air's mean free path.", ''),
        say(0, "The equations don't predict an infinitely fast fluid.", ''),
        say(0, 'They predict their own boundary.', ''),
        say(0, 'My reading: for wings, weather or blood flow, nothing changes.', ''),
      ],
    ),
    anim('unforced', 'VortexCore', { mode: 'unforced' }, [say(0.15, 'It needs that push.', ''), say(0, 'A fluid left alone? Still open.', '')], { min: 5.0 }),
    anim('closer', 'VortexCore', { mode: 'closer' }, [
      say(0.15, 'It took ninety years and a machine to write it down, and about a minute to explain.', ''),
    ], { min: 6.1 }),
    // Silent card: badge, address, title and the credit line (SETTINGS.credit).
    outro('outro', [], 3.0),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
