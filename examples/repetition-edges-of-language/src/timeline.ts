// Repetition at the Edges of Language — explainer video (EN). Narration from the approved script
// v3 (script.md, 2026-11-12, general audience). The stage is one chat column: the same user bubble stacks into a wall; the
// aligned models' replies go flat (EchoChat), the base model's reply spirals (LoopSpiral). The
// shell (ShellChips) is the alignment layer, peeled off on screen. Replies are real outputs from
// llm-language-limits (scripts/extract-replies.py → public/replies.json); numbers as the article.
import type { Cuts } from './types.ts';
import { anim, intro, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // 1 · Hook, cold open: the wall of "table" is already stacked (×9) at the first frame, the whole
    // hook over it, the voice from 0.1 s; the rest of the copies arrive and go hollow (semantic satiation).
    intro('hook', [say(0.1, 'Say “table” thirty times. Around the tenth, it stops feeling like a word.', '')], 6.0, {
      name: 'HollowWord',
      props: { word: 'table', count: 30, span: 3.8, pre: 9 },
    }),
    // 2 · The copies become chat bubbles; the N counter climbs to 1000.
    anim('wall', 'EchoChat', { mode: 'wall', cameos: [{ pose: 'laptop', at: [0, 'did'], dur: 1.4 }] }, [say(0.15, 'I did that to AI chatbots. Up to a thousand times.', '')], { min: 4.2 }),
    // 3 · Four chips; the two Qwen ones share one core.
    anim('chips', 'ShellChips', { mode: 'roster' }, [
      say(0.15, 'A big Claude, a small Claude,', ''),
      say(0, 'and Qwen, a smaller AI, in two versions: with assistant training, and without.', ''),
    ]),
    // 4-5 · Sonnet goes flat, then checks out at turn 300.
    anim('flat', 'EchoChat', { mode: 'flat' }, [say(0.15, 'I asked the small Claude the time, over and over.', ''), say(0, 'Its answers just got shorter.', '', undefined, { emotion: 'contemplative' })], { min: 4.6 }),
    anim('final', 'EchoChat', { mode: 'final', blend: true }, [say(0.1, 'Three hundred times in: “No time access.”', ''), say(0, 'It has checked out.', '', undefined, { emotion: 'skeptical' })]),
    // 6 · Opus breaks character.
    anim(
      'opus',
      'EchoChat',
      { mode: 'burst', cameos: [{ pose: 'laughing', at: [0, 'breaks'] }] },
      [say(0.15, 'Ask the big Claude thirty times, and it breaks character: “Thirty! The big 3-0!”', '', { en: 'Ask the big Claude thirty times, and it breaks character: Thirty! The big three-oh!' })],
      { min: 4.4 },
    ),
    // 7 · Peel the shell: same core, and it loops.
    anim('peel', 'ShellChips', { mode: 'peel', cameos: [{ pose: 'amazed', at: [1, 'loop'], dur: 1.0 }] }, [say(0.15, 'With its training, Qwen just keeps answering politely.', ''), say(0, 'Take it off: same brain, and it gets stuck in a loop.', '', undefined, { emotion: 'amazed' })], { min: 4.6 }),
    // 8-9 · The spiral.
    anim('table', 'LoopSpiral', { mode: 'table' }, [say(0.1, 'Give it “table”, and it just says table, table, table…', '')]),
    anim('florb', 'LoopSpiral', { mode: 'seeds' }, [say(0.15, 'Same with a made-up word. Same with an insult.', '')], { min: 3.0 }),
    // 10-11 · The thin layer; the split close.
    anim('layer', 'ShellChips', { mode: 'cutaway' }, [say(0.15, 'The polite assistant is a thin layer over a giant autocomplete.', '', undefined, { emotion: 'confident', speed: 1.05 })]),
    anim('close', 'EchoChat', { mode: 'split' }, [
      say(0.15, "Repetition is a cheap way to find out which one you're talking to.", ''),
    ], { min: 5.4 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
