// Repetition at the Edges of Language — explainer video (EN). Narration from the approved script
// v1.1 (script.md). The stage is one chat column: the same user bubble stacks into a wall; the
// aligned models' replies go flat (EchoChat), the base model's reply spirals (LoopSpiral). The
// shell (ShellChips) is the alignment layer, peeled off on screen. Replies are real outputs from
// llm-language-limits (scripts/extract-replies.py → public/replies.json); numbers as the article.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // 1 · Hook: "table" repeated until its letters go hollow (semantic satiation).
    anim('hook', 'HollowWord', { word: 'table', count: 30, span: 3.8 }, [
      say(0.15, 'Say “table” thirty times. Around the tenth, it stops feeling like a word.', ''),
    ], { min: 6.0 }), // +0.3 s hold keeps the second cue under 17 chars/s
    // 2 · The copies become chat bubbles; the N counter climbs to 1000.
    anim('wall', 'EchoChat', { mode: 'wall' }, [say(0.15, 'I did that to language models. Up to a thousand times.', '')], { min: 4.2 }),
    // 3 · Four chips; the two Qwen ones share one core.
    anim('chips', 'ShellChips', { mode: 'roster' }, [say(0.15, 'Four models.', ''), say(0, 'Two are one Qwen network, with and without alignment.', '')]),
    // 4-6 · Sonnet goes flat; the loop metric calls it fine.
    anim('flat', 'EchoChat', { mode: 'flat' }, [say(0.15, "Claude didn't loop.", ''), say(0, 'Its answers just got shorter.', '')], { min: 4.6 }),
    anim('final', 'EchoChat', { mode: 'final', blend: true }, [say(0.1, 'Ask Sonnet the time a thousand times: “No time access.”', '')]),
    anim('meter', 'EchoChat', { mode: 'meter', blend: true }, [say(0.1, 'A loop metric would call that fine.', '')], { min: 2.9 }),
    // 7 · Opus breaks character.
    anim(
      'opus',
      'EchoChat',
      { mode: 'burst' },
      [say(0.15, 'Opus broke character: “THIRTY!!! The big 3-0!”', '', { en: 'Opus broke character: Thirty! The big three-oh!' })],
      { min: 4.4 },
    ),
    // 8 · Peel the shell: same core, and it loops.
    anim('peel', 'ShellChips', { mode: 'peel' }, [say(0.15, 'Now strip the alignment layer.', ''), say(0, 'Same weights, and it loops.', '')], { min: 4.6 }),
    // 9-11 · The spiral.
    anim(
      'table',
      'LoopSpiral',
      { mode: 'table' },
      [say(0.1, 'Given “table”, its answer was 99.6% repetition.', '', { en: 'Given “table”, its answer was ninety-nine point six percent repetition.' })],
    ),
    anim('florb', 'LoopSpiral', { mode: 'seeds' }, [say(0.15, '“florb” works as well as an insult.', '')], { min: 3.0 }),
    anim(
      'stats',
      'LoopSpiral',
      { mode: 'stats', swing: [0.9, 3.65] }, // "zero point five one" / "zero point seven eight" (stats-02.words.json)
      [
        say(0.15, 'Aligned models: ~0.10 repetition.', '', { en: 'Aligned models: about zero point one repetition.' }),
        say(0, 'The base: 0.51, multi-turn 0.78.', '', { en: 'The base: zero point five one, multi-turn, zero point seven eight.' }),
      ],
      { min: 7.2 },
    ),
    // 12-13 · Sonnet's give-up order, and a human's.
    anim('giveup', 'GiveUpRow', { mode: 'row' }, [say(0.15, 'Sonnet gives up first on gibberish and distress, last on greetings and praise.', '')]),
    anim('human', 'GiveUpRow', { mode: 'human', blend: true }, [say(0.15, 'Much like a human would.', '')], { min: 2.6 }),
    // 14-15 · The thin layer; the split close.
    anim('layer', 'ShellChips', { mode: 'cutaway' }, [say(0.15, 'The assistant is a thin layer over raw statistics.', '')]),
    anim('close', 'EchoChat', { mode: 'split' }, [
      // One sentence voiced as two lines: every single take of it ran the first cue past 17 chars/s.
      say(0.15, 'Repetition is a cheap way to find out', ''),
      say(0, "which one you're talking to.", ''),
    ], { min: 5.15 }), // +0.25 s hold keeps the last cue under 17 chars/s
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
