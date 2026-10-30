// Check the Step, Not the Path — explainer video (EN). Narration from the approved script
// (script.md). A false proof that reaches the right answer, the two kinds of grading error, and
// where specifying the path pays off.
import type { Cuts } from './types.ts';
import { anim, intro, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    intro('hook', [say(0.4, 'Grading the final state let 33 false proofs through.', '')]),
    anim(
      'paper',
      'KeyQuote',
      { text: 'Grade agents on their whole path, not just where they end up.', emphasis: ['whole path'] },
      [say(0.3, 'A recent paper says: grade agents on their whole path,', ''), say(0, 'not just where they end up.', '')],
      { min: 4.5 },
    ),
    anim(
      'proof',
      'KeyQuote',
      { text: "In a proof, you can't know in advance which step moves you forward.", emphasis: ['in advance'] },
      [say(0.3, "But in a proof, you can't know in advance", ''), say(0, 'which step moves you forward.', '')],
      { min: 4.2 },
    ),
    anim(
      'setup',
      'FlowDiagram',
      {
        layout: 'vertical',
        nodes: [
          { id: 'start', label: '(x²−1)/(x−1)' },
          { id: 'factored', label: '(x+1)(x−1)/(x−1)' },
          { id: 'end', label: 'x+1  ✓ target' },
        ],
        edges: [
          { from: 'start', to: 'factored', label: 'factor' },
          { from: 'factored', to: 'end', label: 'cancel x−1 (x>0 only)', broken: true },
        ],
      },
      [
        say(0.3, 'So I gave agents algebra to rewrite, with rules that only apply under conditions.', ''),
        say(0, 'Cancel x minus 1, knowing only that x is positive,', ''),
        say(0, 'and the answer is right but the proof is false.', ''),
      ],
    ),
    anim(
      'final',
      'Counter',
      { value: 33, suffix: ' / 33', label: 'false proofs passed by the final state' },
      [say(0.3, 'The final state passed all 33 false proofs.', '')],
      { min: 3.6 },
    ),
    anim(
      'reference',
      'BarCompare',
      {
        bars: [
          { label: 'Final state', value: 0, display: '0' },
          { label: '"Prove before you apply"', value: 115, display: '115' },
          { label: 'Reference path', value: 116, display: '116', highlight: true },
        ],
        max: 120,
      },
      [
        say(0.3, 'Grading against a reference path failed 116 of 120 valid ones.', ''),
        say(0, 'With or without proof steps in the reference,', ''),
        say(0, 'it grades style, not correctness.', ''),
      ],
    ),
    anim(
      'known',
      'StatGrid',
      {
        stats: [
          { value: '2', label: 'right decision, sanctions check skipped' },
          { value: '2 / 2', label: 'caught by the path rule' },
          { value: '0 / 2', label: 'caught by the final state' },
        ],
      },
      [
        say(0.3, 'Where the path is known,', ''),
        say(0, 'specifying it caught the 2 runs', '', { en: 'specifying it caught the two runs' }),
        say(0, 'the final state missed.', ''),
      ],
    ),
    anim(
      'close',
      'KeyQuote',
      { text: "Check each step's conditions. Specify the path only where you know it.", emphasis: ['each step', 'where you know it'] },
      [say(0.3, "Check each step's conditions.", ''), say(0, 'Specify the path only where you know it.', '')],
      { min: 4.5 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
