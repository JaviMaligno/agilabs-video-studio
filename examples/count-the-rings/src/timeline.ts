// Count the Rings or Sear the Squid — article video (EN). Narration from the approved script v1.2
// (script.md); a few lines are split in two (same words) so the animation gets a beat on the
// second half. Numbers and instances from src/data/instances.ts (the article's own examples,
// except the illustrative nest and scene 9 set). Photoreal cooking: src/data/cookingRings.ts.
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';
import { DIVERGENCE as DV, EDGE, NEST, OBLIVIOUS as OB, SUPER, sumArea } from './data/instances.ts';

const pre = <T extends object>(g: T) => ({ ...g, enter: 'pre' as const });

const build = (): Cuts => ({
  main: [
    anim(
      'hook',
      'CookingShot',
      {
        mode: 'hook',
        selfCaption: true,
        emphasis: [
          { word: 'rings', tone: 'accent' },
          { word: 'seared', tone: 'warm' },
        ],
      },
      [say(0.25, 'Drop squid rings in a pan.', ''), say(0, 'Most rings, or most squid seared?', '')],
      // The question stays lit until the match cut into the drawn pan.
      { min: 6.35 },
    ),
    anim(
      'split',
      'RingPan',
      { mode: 'split', blendIn: true, splitBeat: 1 },
      [say(0.25, 'Sounds like one instruction twice.', ''), say(0, "It isn't.", '')],
    ),
    anim(
      'nest',
      'RingPan',
      {
        mode: 'pans',
        R: NEST.R,
        counter: { radii: [NEST.small.r], w: NEST.small.w, align: 'right' },
        pans: [
          {
            dials: ['rings', 'seared'],
            rings: [pre(NEST.big), { ...NEST.small, from: 0, nest: true, enter: { beat: 0, delay: 1.45 } }],
          },
        ],
      },
      [say(0.25, 'A ring has a hole: a small enough ring drops inside and still touches the pan.', '')],
      // Holds the fast closing cue long enough to read.
      { min: 6.0 },
    ),
    anim(
      'count',
      'RingPan',
      {
        mode: 'pans',
        R: DV.R,
        meterMax: 80,
        counter: { radii: [...DV.counter], w: DV.w, scale: 0.62 },
        pans: [
          {
            dials: ['rings', 'seared'],
            seared: DV.countSeared,
            rings: DV.count.map((g, i) => ({ ...g, from: i + 1, enter: { beat: 0, delay: 0.15 + 0.8 * i } })),
          },
          { dials: ['rings', 'seared'], reserveSeared: true, rings: [] },
        ],
      },
      [
        say(0.25, 'Three small rings side by side: three rings, about 69.7 of area.', '', {
          en: 'Three small rings side by side: three rings, about sixty-nine point seven of area.',
        }),
      ],
    ),
    anim(
      'area',
      'RingPan',
      {
        mode: 'pans',
        blendIn: true,
        R: DV.R,
        meterMax: 80,
        counter: { radii: [...DV.counter], w: DV.w, scale: 0.62 },
        pans: [
          { dials: ['rings', 'seared'], seared: DV.countSeared, rings: DV.count.map(pre) },
          {
            dials: ['rings', 'seared'],
            seared: DV.areaSeared,
            rings: [
              { ...DV.area[0], from: 0, heavy: true, enter: { beat: 0, delay: 0.1 } },
              { ...DV.area[1], from: 1, nest: true, enter: { beat: 0, delay: 1.1 } },
            ],
          },
        ],
      },
      [say(0.2, 'The big one with a small one inside: two rings, about 76.7.', '', { en: 'The big one with a small one inside: two rings, about seventy-six point seven.' })],
    ),
    anim(
      'hold',
      'RingPan',
      {
        mode: 'pans',
        blendIn: true,
        R: DV.R,
        meterMax: 80,
        pans: [
          { dials: ['rings', 'seared'], seared: DV.countSeared, rings: DV.count.map(pre), pulse: 'rings', pulseAt: 0 },
          { dials: ['rings', 'seared'], seared: DV.areaSeared, rings: DV.area.map(pre), pulse: 'seared', pulseAt: 0 },
        ],
      },
      [say(0.2, 'Three rings or more dinner. Not both.', '')],
      { min: 3.6 },
    ),
    anim(
      'condition',
      'RingPan',
      { mode: 'superincreasing', set: { radii: [...SUPER.radii], w: SUPER.w, label: L('each ring > all smaller ones together', '') } },
      [say(0.2, 'But if every ring is bigger than all the smaller ones combined,', '')],
      { min: 4.62 },
    ),
    anim(
      'dominance',
      'RingPan',
      {
        mode: 'pans',
        R: SUPER.R,
        meterMax: sumArea(SUPER.greedy),
        counter: { radii: [...SUPER.radii], w: SUPER.w, scale: 0.62 },
        tags: ['area', 'radii', 'perimeters'].map((text, i) => ({ text, beat: 0, delay: 2.5 + 0.45 * i })),
        pans: [
          {
            dials: ['rings', 'seared'],
            dimRings: true,
            dimAt: 1,
            rings: [
              { ...SUPER.greedy[0], from: 0, heavy: true, enter: { beat: 0, delay: 0.05 } },
              { ...SUPER.greedy[1], from: 1, nest: true, enter: { beat: 0, delay: 0.95 } },
            ],
          },
          {
            dials: ['rings', 'seared'],
            pulse: 'rings',
            pulseAt: 1,
            rings: SUPER.row.map((g, i) => ({ ...g, from: i + 1, enter: { beat: 1, delay: -1.6 + 0.45 * i } })),
          },
        ],
      },
      [say(0.15, 'one layout wins on area and a family of similar goals.', ''), say(0, 'Not on count.', '')],
    ),
    anim(
      'oblivious',
      'RingPan',
      {
        mode: 'pans',
        R: OB.R,
        counter: { radii: [...OB.radii], w: OB.w },
        // Morph just after "random" starts (word timings of the cloned voice).
        morph: { beat: 0, delay: 5.05, tag: L('any pan shape', '') },
        pans: (['tightest', 'roomiest', 'random'] as const).map((rule, pi) => ({
          label: rule.toUpperCase(),
          dials: ['seared'],
          candidates: true,
          shape: pi === 1 ? 'rect' : pi === 2 ? 'sphere' : undefined,
          rings: OB[rule].map((g, i) => ({ ...g, from: i, enter: { beat: 0, delay: 0.1 + 0.85 * i } })),
        })),
      },
      [say(0.2, 'And where you put each ring stops mattering: tightest spot, roomiest, random, same result.', '')],
      { min: 7.1 },
    ),
    anim(
      'edge',
      'RingPan',
      {
        mode: 'pans',
        R: EDGE.R,
        counter: { radii: [...EDGE.radii], w: EDGE.w },
        pans: [
          {
            label: 'TIGHTEST',
            dials: ['rings'],
            rings: [
              { ...EDGE.tightest[0], from: 0, heavy: true, enter: { beat: 0, delay: 0.1 } },
              { ...EDGE.tightest[1], from: 1, nest: true, enter: { beat: 0, delay: 0.95 } },
              { ...EDGE.tightest[2], from: 2, enter: { beat: 0, delay: 2.2 } },
              { r: 4.8, w: EDGE.w, x: 0, y: 0, from: 3, refuse: EDGE.refusedTries, enter: { beat: 1, delay: -0.3 } },
            ],
          },
          {
            label: 'ROOMIEST',
            dials: ['rings'],
            pulse: 'rings',
            pulseAt: 1,
            rings: [
              { ...EDGE.roomiest[0], from: 0, heavy: true, enter: { beat: 0, delay: 0.1 } },
              { ...EDGE.roomiest[1], from: 1, enter: { beat: 0, delay: 0.95 } },
              { ...EDGE.roomiest[2], from: 2, nest: true, enter: { beat: 0, delay: 1.85 } },
              { ...EDGE.roomiest[3], from: 3, nest: true, enter: { beat: 1, delay: -0.3 } },
            ],
          },
        ],
      },
      [say(0.15, 'Drop the condition and that still holds up to three rings.', ''), say(0, 'At four, it breaks.', '')],
      { min: 6.9 },
    ),
    anim(
      'close',
      'CookingShot',
      { mode: 'finish', selfCaption: true, emphasis: [{ word: 'maximising', tone: 'accent' }, { word: 'decides', tone: 'warm' }] },
      [say(0.4, 'What am I actually maximising?', ''), say(0, 'That question decides the answer.', '')],
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })], 2),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
