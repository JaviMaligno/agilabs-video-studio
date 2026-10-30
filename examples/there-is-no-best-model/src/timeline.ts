// There Is No Best Model, Only a Frontier — explainer video (EN). Narration from the approved script
// (script.md). New models keep claiming to be the best, but cheap, fast and smart rarely come together.
// A parcel analogy introduces dominance and the Pareto frontier (Pareto component), a 3D cloud shows
// why three axes keep almost everyone and quality works as a gate (Frontier3D), and the worked
// example (reasoning levels, cost per task, the receipt, the price of a second) closes on luna.
import type { Cuts } from './types.ts';
import { L, anim, intro, outro, say, videos } from './narrate.ts';

/**
 * Hook steps in scene seconds, from the TTS word timestamps of hook-01 (line starts at 0.1):
 * terra (the newer model) zooms in from the right from frame 0, luna fades in on the left before
 * "faster", 6/6 under both on "looked just as good", terra leaves on "and I didn't".
 */
const HOOK_AT = [0, 0.5, 2.1, 3.6];

const build = (): Cuts => ({
  main: [
    intro(
      'hook',
      [say(0.1, "A newer model was faster and looked just as good… and I didn't switch.", '', undefined, { emotion: 'curious' })],
      3,
      { name: 'Pareto', props: { mode: 'hook', at: HOOK_AT, cover: process.env.REMOTION_COVER !== '0' } },
    ),
    anim(
      'story',
      'Pareto',
      { mode: 'newmodels' },
      [
        say(0.2, "Every few weeks there's a new model,", ''),
        say(0, 'and every one claims to be the best.', ''),
        say(0, 'But best at what? Cheaper, faster, smarter…', '', undefined, { emotion: 'curious' }),
      ],
    ),
    anim(
      'parcel',
      'Pareto',
      { mode: 'parcel' },
      [say(0.2, 'Think of a delivery.', ''), say(0, 'Next-day is fast but expensive. Standard is slow but cheap.', '')],
    ),
    anim(
      'dominated',
      'Pareto',
      { mode: 'dominated' },
      [
        say(0.2, "A courier that's slow AND expensive?", '', { en: "A courier that's slow and expensive?" }),
        say(0, 'Nobody picks it.', '', undefined, { emotion: 'skeptical' }),
        say(0, "It's dominated.", '', undefined, { emotion: 'skeptical' }),
      ],
    ),
    anim(
      'frontier',
      'Pareto',
      { mode: 'frontier' },
      [
        say(0.2, 'The options nobody beats on everything', ''),
        say(0, 'form the Pareto frontier.', ''),
        say(0, 'Between them, you trade.', ''),
      ],
    ),
    anim(
      'orbit',
      'Frontier3D',
      { mode: 'orbit', cameos: [{ pose: 'sceptical', at: [1, 'almost'], dur: 2.2 }] },
      [say(0.2, 'With models there are three axes: cost, speed and quality.', ''), say(0, 'With three, almost every model survives.', '')],
    ),
    anim(
      'gate',
      'Frontier3D',
      { mode: 'gate' },
      [
        say(0.2, 'So treat quality as a gate.', ''),
        say(0, "If a model can't do the task, it's out.", ''),
      ],
      // Room for the drop-out and the tilt to the cost x latency top view after the last line.
      { min: 7.6 },
    ),
    anim(
      'reasoning',
      'Pareto',
      { mode: 'reasoning', cameos: [{ pose: 'laptop', at: [0, 'agent'], dur: 2.2 }] },
      [
        say(0.2, 'In my case, an agent that classifies companies.', ''),
        say(0, 'Less reasoning: 29% cheaper, but it stopped researching. Out.', '', {
          en: 'Less reasoning: twenty-nine percent cheaper, but it stopped researching. Out.',
        }),
        say(0, 'More reasoning: 16% pricier, no better. Dominated.', '', { en: 'More reasoning: sixteen percent pricier, no better. Dominated.' }),
      ],
    ),
    anim(
      'pertask',
      'BarCompare',
      {
        bars: [
          { label: L('terra · price per token', ''), value: 10, display: '10×' },
          { label: L('terra · total cost per task', ''), value: 1.23, display: '1.23×', highlight: true },
          { label: L('luna', ''), value: 1, display: '1×', at: 0.2 },
        ],
        max: 10,
      },
      [
        say(0.2, 'Then a newer model: ten times the price per token.', ''),
        say(0, 'And only 23% more per task.', '', { en: 'And only twenty-three percent more per task.' }, { emotion: 'amazed' }),
      ],
    ),
    anim(
      'seconds',
      'Pareto',
      { mode: 'seconds', cameos: [{ pose: 'amazed', at: [2, 'three'], dur: 2.2 }] },
      [
        say(0.2, 'Both pass the gate.', ''),
        say(0, 'Are 27 seconds worth 2 cents?', '', { en: 'Are twenty-seven seconds worth two cents?' }),
        say(0, "That's about $3 per hour of waiting.", '', { en: "That's about three dollars per hour of waiting." }),
      ],
    ),
    anim(
      'decision',
      'Pareto',
      { mode: 'decision' },
      [
        say(0.2, "Here, it wasn't.", '', undefined, { emotion: 'confident' }),
        say(0, 'I stayed with the cheaper model.', '', undefined, { emotion: 'confident' }),
      ],
      { min: 3.4 },
    ),
    anim(
      'verdict',
      'KeyQuote',
      {
        text: L("There's no best model. Measure per task, set a quality floor, and put a price on your seconds.", ''),
        emphasis: ['no best model', 'per task', 'quality floor', 'price'],
      },
      [
        say(0.3, "There's no best model.", '', undefined, { emotion: 'confident', speed: 1.05 }),
        say(0, 'Measure per task, set a quality floor,', '', undefined, { emotion: 'confident', speed: 1.05 }),
        say(0, 'and put a price on your seconds.', '', undefined, { emotion: 'confident', speed: 1.05 }),
      ],
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
