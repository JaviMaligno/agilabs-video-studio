import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stamp, youtubeChapters } from '../src/chapters.ts';
import { anim, intro, outro, say } from '../src/narrate.ts';
import { FPS, sceneStarts } from '../src/timing.ts';

test('stamp writes m:ss, and h:mm:ss from an hour', () => {
  assert.equal(stamp(0), '0:00');
  assert.equal(stamp(9.99), '0:09');
  assert.equal(stamp(75.4), '1:15');
  assert.equal(stamp(600), '10:00');
  assert.equal(stamp(3725), '1:02:05');
});

/** A scene of about `s` seconds of voice (14.5 chars/s estimate). */
const voiced = (s: number) => [say(0, 'x'.repeat(Math.round(s * 14.5)), '')];

test('chapters start at the real scene starts; the first is 0:00 Intro', () => {
  const scenes = [
    intro('hook', voiced(20)),
    anim('a', 'X', {}, voiced(30), { chapter: { en: 'Training', es: 'Entrenamiento' } }),
    anim('a2', 'X', {}, voiced(15)),
    anim('b', 'X', {}, voiced(40), { chapter: 'The desk' }),
    anim('c', 'X', {}, voiced(25), { chapter: 'The summary' }),
    outro('end', []),
  ];
  const { starts } = sceneStarts(scenes);
  const r = youtubeChapters(scenes, 'en');
  assert.deepEqual(
    r.chapters.map((c) => c.label),
    ['Intro', 'Training', 'The desk', 'The summary'],
  );
  assert.equal(r.chapters[0].at, 0);
  assert.equal(r.chapters[1].at, starts[1] / FPS);
  assert.equal(r.chapters[2].at, starts[3] / FPS);
  const lines = r.text.trimEnd().split('\n');
  assert.equal(lines[0], '0:00 Intro');
  assert.equal(lines[1], `${stamp(starts[1] / FPS)} Training`);
  assert.equal(lines.length, 4);
  assert.deepEqual(r.warnings, []);
  assert.equal(youtubeChapters(scenes, 'es').chapters[1].label, 'Entrenamiento');
});

test('a chapter on the first scene names the 0:00 entry', () => {
  const scenes = [anim('a', 'X', {}, voiced(20), { chapter: 'Cold open' }), anim('b', 'X', {}, voiced(20), { chapter: 'B' }), anim('c', 'X', {}, voiced(20), { chapter: 'C' })];
  const r = youtubeChapters(scenes, 'en');
  assert.deepEqual(r.chapters.map((c) => c.label), ['Cold open', 'B', 'C']);
  assert.deepEqual(r.warnings, []);
});

test('warns when YouTube would ignore the chapters: fewer than 3, or one under 10 s', () => {
  const two = youtubeChapters([intro('hook', voiced(20)), anim('a', 'X', {}, voiced(20), { chapter: 'A' })], 'en');
  assert.equal(two.chapters.length, 2);
  assert.ok(two.warnings.some((w) => /at least 3/.test(w)), two.warnings.join('; '));
  const short = youtubeChapters(
    [intro('hook', voiced(20)), anim('a', 'X', {}, voiced(3), { chapter: 'Short' }), anim('b', 'X', {}, voiced(20), { chapter: 'B' })],
    'en',
  );
  assert.ok(short.warnings.some((w) => /"Short"/.test(w) && /10 s/.test(w)), short.warnings.join('; '));
  // The last chapter runs to the end of the video.
  const lastShort = youtubeChapters([intro('hook', voiced(20)), anim('a', 'X', {}, voiced(20), { chapter: 'A' }), anim('b', 'X', {}, voiced(2), { chapter: 'End' })], 'en');
  assert.ok(lastShort.warnings.some((w) => /"End"/.test(w)), lastShort.warnings.join('; '));
});
