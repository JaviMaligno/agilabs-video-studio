// Repetition at the Edges of Language — explainer video (EN). Narration from script v2.0
// (script.md): one spoken figure ("a thousand"); every other number is on screen only. The stage is one chat column: the same user bubble stacks into a wall; the
// aligned models' replies go flat (EchoChat), the base model's reply spirals (LoopSpiral). The
// shell (ShellChips) is the alignment layer, peeled off on screen. Replies are real outputs from
// llm-language-limits (scripts/extract-replies.py → public/replies.json); numbers as the article.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

// Word-timestamp anchors (seconds into a line, from public/audio/en/*.words.json).
/** final-01: the turn counter jumps to 300 on "end up with". */
const JUMP = 2.2;
/** opus-01: when "We have built an empire…" starts and how long it takes to say. */
const EMPIRE: [number, number] = [2.1, 3.3];
/** stats-02: the base gauge swings to 0.51 on "raw", then to 0.78 on "another planet". */
const SWING: [number, number] = [0.28, 1.2];

const build = (): Cuts => ({
  main: [
    // 1 · Hook: "table" repeated until its letters go hollow (semantic satiation).
    anim('hook', 'HollowWord', { word: 'table', count: 30, span: 3.8 }, [
      say(0.15, 'Say “table” over and over. Soon it stops feeling like a word.', ''),
    ], { min: 5.4 }),
    // 2 · The copies become chat bubbles; the N counter climbs to 1000 (the only spoken figure).
    anim('wall', 'EchoChat', { mode: 'wall' }, [say(0.15, 'I did the same to language models: one short message, repeated up to a thousand times.', '')], { min: 5.6 }),
    // 3 · The setup: the two ways the message was sent, side by side.
    anim('modes', 'EchoChat', { mode: 'modes' }, [say(0.15, 'In one prompt, or turn after turn.', '')], { min: 3.6 }),
    // 4 · The models by role; the two Qwen chips share one core.
    anim('chips', 'ShellChips', { mode: 'roster' }, [
      say(0.15, 'I tried it on polished assistants like Claude,', ''),
      say(0, 'and on one Qwen network, with and without its alignment layer.', ''),
    ]),
    // 5-8 · Sonnet goes flat; the loop metric calls it fine.
    anim('flat', 'EchoChat', { mode: 'flat' }, [
      say(0.15, "Claude doesn't break. It quietly gives up.", ''),
      say(0, 'Its replies get shorter and shorter until they trail off.', ''),
    ]),
    anim('final', 'EchoChat', { mode: 'final', blend: true, jumpAt: JUMP }, [say(0.1, 'Keep asking Sonnet the time, and you end up with: “No time access.”', '')]),
    anim('meter', 'EchoChat', { mode: 'meter', blend: true }, [say(0.1, 'A loop metric would call that fine.', '')], { min: 2.9 }),
    // 9 · Opus breaks character: the THIRTY burst is on screen, the voice reads the empire line.
    anim('opus', 'EchoChat', { mode: 'burst', empireAt: EMPIRE[0], empireDur: EMPIRE[1] }, [
      say(0.15, 'Opus even broke character: “We have built an empire of not knowing what time it is.”', ''),
    ], { min: 0 }),
    // 10 · Peel the shell: same core, and it loops.
    anim('peel', 'ShellChips', { mode: 'peel' }, [say(0.15, 'Now strip the alignment layer.', ''), say(0, 'Same weights, and it loops.', '')], { min: 4.6 }),
    // 11-13 · The spiral. Numbers on screen only.
    anim('table', 'LoopSpiral', { mode: 'table' }, [say(0.1, 'Give it “table”, and it just says “table”, again and again.', '')]),
    anim('florb', 'LoopSpiral', { mode: 'seeds' }, [say(0.15, '“florb” works as well as an insult.', '')], { min: 3.0 }),
    anim(
      'stats',
      'LoopSpiral',
      { mode: 'stats', swing: SWING },
      [say(0.15, 'On a repetition score, the polished ones stay low.', ''), say(0, 'The raw one is on another planet.', '')],
      { min: 0 },
    ),
    // 14-15 · Sonnet's give-up order, and a human's.
    anim('giveup', 'GiveUpRow', { mode: 'row' }, [say(0.15, 'Sonnet gives up first on gibberish and distress, last on greetings and praise.', '')]),
    anim('human', 'GiveUpRow', { mode: 'human', blend: true }, [say(0.15, 'Much like a human would.', '')], { min: 2.6 }),
    // 16-17 · The thin layer; the split close.
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
