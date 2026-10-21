// The Forgetting You Don't Measure — article video (EN). Narration from the approved script v1.0
// (script.md). One picture carries it: the model as a wall of lit tiles (WeightWall), fed by a
// conveyor of batch cards; then the article's replay chart (ReplayCurve) and the bill
// (CostReceipt). Spoken forms are TTS-only: the captions keep the article's written numbers.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const LORA = 'Lora';

// Scene-second props (forgetAt, askAt, secondAt, noMixAt, pickAt) are set from the word timestamps
// in public/audio/en/*.words.json, so each visual change lands on its word.
const build = (): Cuts => ({
  main: [
    // Cold open: the hook is drawn as a title over the wall (no caption for its line).
    // Held a little past the line: the dark tiles need a beat to be seen, and the title to be read.
    anim(
      'hook',
      'WeightWall',
      { mode: 'hook', titleLine: true, forgetAt: 3.1 },
      [say(0.25, 'I taught a small model one new skill. It quietly forgot some of what it knew.', '')],
      { min: 6.0 },
    ),
    anim('skill', 'TerminalProbe', {}, [say(0.1, 'The skill: predicting what a terminal prints.', ''), say(0, 'A tiny world model.', '')]),
    // Script cut 1 (render past 88 s): "the same way" dropped; "general text mixed in ✓" carries it.
    anim('paper', 'WeightWall', { mode: 'paper', askAt: 2.9 }, [say(0.1, 'A recent paper trains big ones, but never measures the forgetting.', '')], {
      // Holds "the forgetting." long enough to read.
      min: 5.45,
    }),
    anim('test', 'WeightWall', { mode: 'test' }, [say(0.1, 'So I did, at toy scale, on reasoning benchmarks.', '')]),
    // Held past the line so the dial can rest on 10 %, 25 % and 50 % and the lane show each share.
    anim('knob', 'WeightWall', { mode: 'knob' }, [say(0.1, 'One knob: how much of each batch is general text.', '')], { min: 4.6 }),
    anim('zero', 'WeightWall', { mode: 'zero', secondAt: 7.15 }, [
      // One sentence voiced as two lines, so each caption is one clause.
      say(0.1, 'With none, it learned the terminal,', ''),
      say(0, 'but its general scores all fell.', ''),
      say(0, 'Down 0.078 on average, 0.15 at worst.', '', { en: 'Down point oh seven eight on average, point one five at worst.' }),
    ]),
    anim('replay', 'WeightWall', { mode: 'replay', secondAt: 7.0 }, [
      say(0.1, 'Then I mixed in 10% general text.', '', { en: 'Then I mixed in ten percent general text.' }),
      say(0, 'That won back about 73% of the loss,', '', { en: 'That won back about seventy-three percent of the loss,' }),
      say(0, 'at no cost to the new skill.', ''),
    ]),
    anim('pivot', 'KeyQuote', { text: 'The bigger lever: how I trained it.', emphasis: ['how I trained it'] }, [
      say(0.1, 'The bigger lever was how I trained it.', ''),
    ]),
    anim('methods', 'WeightWall', { mode: 'methods' }, [
      say(0.1, 'Full fine-tuning lets any weight in the model change.', ''),
      say(0, 'LoRA freezes the model and trains a small add-on.', '', { en: `${LORA} freezes the model and trains a small add-on.` }),
    ]),
    anim('lora', 'ReplayCurve', { mode: 'both', noMixAt: 1.6 }, [
      say(0.1, 'LoRA barely forgot, even with no mixing,', '', { en: `${LORA} barely forgot, even with no mixing,` }),
      say(0, 'and learned the terminal just as well.', ''),
    ], { min: 6.4 }),
    anim('bill', 'CostReceipt', { mode: 'bill' }, [
      say(0.1, 'Instruction-following fell by 37% with full fine-tuning.', '', { en: 'Instruction-following fell by thirty-seven percent with full fine-tuning.' }),
      say(0, 'With LoRA it went up.', '', { en: `With ${LORA} it went up.` }),
      say(0, 'On unseen commands, full fine-tuning scored zero.', ''),
      say(0, 'LoRA got 0.15.', '', { en: `${LORA} got point one five.` }),
      say(0, 'Full fine-tuning paid three costs.', ''),
      say(0, 'One benchmark shows only one of them.', ''),
      say(0, "LoRA mostly didn't pay them.", '', { en: `${LORA} mostly didn't pay them.` }),
    ]),
    anim('tradeoff', 'CostReceipt', { mode: 'dial' }, [
      // Script cut 2: "But" dropped.
      say(0.1, "LoRA isn't free: on harder tasks it may learn less.", '', { en: `${LORA} isn't free: on harder tasks it may learn less.` }),
    ]),
    // Held a little past the line: its caption breaks at the comma, and the second cue
    // ("and pick the method on purpose.") needs the hold to read under 17 chars/s.
    anim('close', 'WeightWall', { mode: 'close', pickAt: 2.5 }, [say(0.1, 'So check more than one capability, and pick the method on purpose.', '')], { min: 5.0 }),
    outro('outro', [say(0.1, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })], 2.4),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
