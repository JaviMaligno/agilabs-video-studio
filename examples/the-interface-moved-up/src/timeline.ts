// The Interface Moved Up — explainer video (EN). Narration from the approved script v1.1
// (script.md). One continuous dolly-out (PullBack) over a nested world: a line of code, the diff
// and terminal around it, the app around that, and a conveyor under a dashboard around the app.
// One break from the dolly: the harness drop (HarnessStack). Every label is in factcheck.md.
import type { Cuts, Scene } from './types.ts';
import { WORDS } from './audio.generated.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { FPS, SCENE_TRANSITION, sceneFrames } from './timing.ts';

/**
 * Scene second where `word` (its nth occurrence, punctuation ignored) is spoken in line `line`
 * of the scene, from the TTS word timings; NaN before TTS (the component then falls back to
 * proportional timing).
 */
const at = (scene: Scene, line: number, word: string, nth = 0): number => {
  const l = scene.lines[line];
  const words = l ? WORDS[voice()]?.[l.key] : undefined;
  if (!l || !words) return NaN;
  const norm = (w: string) => w.toLowerCase().replace(/[^a-z']/g, '');
  const hits = words.filter((w) => norm(w[0]) === norm(word));
  const w = hits[nth];
  return w ? +(l.start + w[1]).toFixed(3) : NaN;
};
const end = (scene: Scene, line: number): number => {
  const l = scene.lines[line];
  return l ? l.start + l.dur : NaN;
};
/** Attach the cue times (scene seconds) a PullBack / HarnessStack mode keys off. */
const cued = (scene: Scene, cues: (s: Scene) => number[]): Scene => {
  if (scene.anim) scene.anim.props = { ...scene.anim.props, cues: cues(scene) };
  return scene;
};

/**
 * The belt keeps one clock from the conveyor scene to the quote: each scene starts where the
 * previous one was when the cross-blend began, and the quote keeps lane A stopped where the bell
 * rang.
 */
const chainClocks = (scenes: Scene[]): Scene[] => {
  let clock = 0;
  let frozenA = NaN;
  for (const s of scenes) {
    const props = s.anim?.props as { mode?: string; cues?: number[] } | undefined;
    if (!s.anim || s.anim.name !== 'PullBack' || !props) continue;
    if (!['conveyor', 'dashboard', 'contract', 'quote'].includes(props.mode ?? '')) continue;
    s.anim.props = { ...s.anim.props, clock0: +clock.toFixed(3), ...(props.mode === 'quote' ? { frozenA } : {}) };
    if (props.mode === 'contract') frozenA = clock + (props.cues?.[4] ?? NaN) + 0.15;
    clock += (sceneFrames(s) - SCENE_TRANSITION) / FPS;
  }
  return scenes;
};

const build = (): Cuts => ({
  main: chainClocks([
    // Cold open: the hook is drawn by the scene itself over a 3-s teaser of the whole shot.
    cued(anim('hook', 'PullBack', { mode: 'teaser', titleLine: true }, [say(0.1, 'First the code. Then the diff. Then the result.', '')], { min: 3.6 }), (s) => [
      at(s, 0, 'code'),
      at(s, 0, 'diff'),
      at(s, 0, 'result'),
    ]),
    // A snap back to the macro start: a dip, not a blend.
    anim('ladder', 'PullBack', { mode: 'ladder' }, [say(0.15, 'Each jump raised what the human looks at.', '', undefined, { emotion: 'contemplative' })]),
    cued(anim('code', 'PullBack', { mode: 'code', blend: true, cameos: [{ pose: 'laptop', at: [0, 'typed'] }] }, [say(0.15, 'In the editor, I typed; the model completed.', '')], { min: 4.2 }), (s) => [
      at(s, 0, 'I'),
      at(s, 0, 'model'),
      at(s, 0, 'completed'),
    ]),
    // The reviewer's eye-line and check play after the line: a short hold.
    cued(anim('diff', 'PullBack', { mode: 'diff', blend: true }, [say(0.15, 'In the terminal, the agent got the whole machine.', '')], { min: 4.6 }), (s) => [
      at(s, 0, 'agent'),
      at(s, 0, 'whole'),
    ]),
    cued(
      anim(
        'saturate',
        'PullBack',
        { mode: 'saturate', blend: true, cameos: [{ pose: 'laughing', at: [0, 'saturate'], dur: 2.0 }] },
        [say(0.15, 'Then the cloud, partly for capacity: several agents at once saturate a laptop.', '')],
        // ~0.4 s hold after the line: the panes lift to the cloud on "laptop".
        { min: 6.7 },
      ),
      (s) => [at(s, 0, 'cloud'), at(s, 0, 'several'), at(s, 0, 'saturate'), end(s, 0)],
    ),
    cued(anim('result', 'PullBack', { mode: 'result', blend: true }, [say(0.15, 'Then the app: every session in one sidebar, the result in view.', '')]), (s) => [
      at(s, 0, 'app'),
      at(s, 0, 'every'),
      at(s, 0, 'sidebar'),
      at(s, 0, 'result'),
    ]),
    cued(
      anim('nested', 'PullBack', { mode: 'nested', blend: true }, [say(0.15, 'No surface disappeared.', '', undefined, { emotion: 'confident' }), say(0, 'The editor just stopped being the centre.', '')]),
      (s) => [at(s, 0, 'surface'), at(s, 0, 'disappeared'), at(s, 1, 'editor'), at(s, 1, 'centre')],
    ),
    cued(
      anim('harness', 'HarnessStack', {}, [say(0.2, 'Terminal, app, phone:', ''), say(0, 'views of one agent, with one harness underneath.', '')], { min: 5.4 }),
      (s) => [at(s, 0, 'terminal'), at(s, 0, 'app'), at(s, 0, 'phone'), at(s, 1, 'harness')],
    ),
    cued(
      anim('conveyor', 'PullBack', { mode: 'conveyor', cameos: [{ pose: 'amazed', at: [0, 'nobody'], dur: 1.9 }] }, [say(0.2, 'Next, a ticket arrives, an agent builds it, and nobody opens a session.', '', undefined, { emotion: 'amazed' })], {
        // The last cue ("a session.") needs a little more than the tail to stay >= 0.8 s.
        min: 5.75,
      }),
      (s) => [at(s, 0, 'ticket'), at(s, 0, 'agent'), at(s, 0, 'nobody')],
    ),
    cued(
      anim(
        'dashboard',
        'PullBack',
        { mode: 'dashboard', blend: true },
        // ~0.3 s holds after each line (caption speed).
        [say(0.15, 'The human watches the metrics: evals, feedback, tests.', ''), say(0, 'Mostly in preview, but already launched.', '')],
      ),
      (s) => [at(s, 0, 'metrics'), at(s, 0, 'evals'), at(s, 0, 'feedback'), at(s, 0, 'tests'), at(s, 1, 'preview')],
    ),
    cued(
      anim(
        'contract',
        'PullBack',
        { mode: 'contract', blend: true },
        [
          say(0.15, "What sets a team apart won't be the window.", '', undefined, { emotion: 'confident', speed: 1.05 }),
          say(0, "It's what its agents may do, what they receive, what they return, and when they call a human.", '', undefined, { emotion: 'confident', speed: 1.05 }),
        ],
        { min: 10.0 },
      ),
      (s) => [at(s, 0, 'window'), at(s, 1, 'may'), at(s, 1, 'receive'), at(s, 1, 'return'), at(s, 1, 'call')],
    ),
    anim(
      'quote',
      'PullBack',
      // titleLine: the quote is drawn word by word on stage, so no duplicate caption under it.
      { mode: 'quote', blend: true, titleLine: true, quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] },
      [say(0.2, 'Fewer keyboards, more dashboards.', '')],
      // ~0.5 s hold after the line.
      { min: 3.9 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
