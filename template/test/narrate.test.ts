import { test } from 'node:test';
import assert from 'node:assert/strict';
import { say, intro, anim, outro, lineSeconds, videos, voice, GAP, TAIL } from '../src/narrate.ts';
import { FPS, SCENE_TRANSITION, sceneFrames, sceneStarts } from '../src/timing.ts';
import { SETTINGS } from '../src/settings.ts';
import { VIDEOS, TIMELINE } from '../src/timeline.ts';

const near = (a: number, b: number, eps = 0.002) => assert.ok(Math.abs(a - b) <= eps, `${a} is not ≈ ${b}`);

test('lines never overlap and respect GAP', () => {
  const s = intro('hook', [
    say(0, 'The first line of the hook, short and plain.', 'La primera frase del gancho.'),
    say(0, 'A second line that follows it.', 'Una segunda frase.'),
  ]);
  const [a, b] = s.lines;
  near(a.start, 0);
  near(a.dur, 'The first line of the hook, short and plain.'.length / 14.5);
  near(b.start, a.start + a.dur + 0.35);
  assert.equal(GAP, 0.35);
  assert.deepEqual(s.lines.map((l) => l.key), ['hook-01', 'hook-02']);
});

test('beats equal line starts', () => {
  const s = anim('chart', 'BarRace', { n: 3 }, [say(0, 'One.', 'Uno.'), say(2, 'Two.', 'Dos.'), say(0, 'Three.', 'Tres.')]);
  assert.equal(s.kind, 'anim');
  assert.deepEqual(s.anim, { name: 'BarRace', props: { n: 3 } });
  assert.deepEqual(s.beats, s.lines.map((l) => l.start));
});

test('scene lasts at least min and covers last line + TAIL', () => {
  const short = outro('end', [say(0, 'Hi.', 'Hola.')]);
  assert.equal(short.minSeconds, 4);
  assert.equal(TAIL, 0.8);
  const long = intro('long', [say(0, 'x'.repeat(145), 'y'), say(0, 'z'.repeat(29), 'w')]);
  const last = long.lines.at(-1)!;
  near(long.minSeconds!, last.start + last.dur + 0.8);
  assert.ok(long.minSeconds! > 3);
  assert.equal(sceneFrames(long), Math.round(long.minSeconds! * FPS));
});

test('at pushes a line later', () => {
  // 29 chars / 14.5 = 2 s, so the first line ends at 2.
  const s = anim('later', 'X', {}, [say(0, 'a'.repeat(29), 'b'), say(5, 'Later.', 'Luego.')]);
  near(s.lines[0].start + s.lines[0].dur, 2);
  near(s.lines[1].start, 5);
});

test('estimate is per language and voice-aware', () => {
  near(lineSeconds('nope', 'x'.repeat(31), 'es'), 2);
  near(lineSeconds('nope', 'x'.repeat(29), 'en'), 2);
  const out = videos(() => ({ main: [intro('v', [say(0, 'English line', 'Frase española')])] }));
  assert.deepEqual(Object.keys(out), SETTINGS.voices);
  assert.equal(out.en.main[0].lines[0].text.en, 'English line');
  assert.equal(out.en.main[0].lines[0].voice, 'en');
  assert.equal(voice(), 'en');
});

test('sceneStarts overlaps scenes by the transition', () => {
  const a = intro('a', [say(0, 'A.', 'A.')]);
  const b = outro('b', [say(0, 'B.', 'B.')]);
  const { starts, total } = sceneStarts([a, b]);
  assert.deepEqual(starts, [0, sceneFrames(a) - SCENE_TRANSITION]);
  assert.equal(total, sceneFrames(a) + sceneFrames(b) - SCENE_TRANSITION);
});

test('settings defaults and placeholder timeline', () => {
  assert.deepEqual(SETTINGS.voices, ['en']);
  assert.deepEqual(SETTINGS.subtitles, ['en']);
  assert.equal(SETTINGS.targetSeconds, 45);
  assert.deepEqual(SETTINGS.music, { src: 'music/bed.wav', volume: 0.2, duck: 0.3 });
  assert.equal(SETTINGS.poster, null);
  assert.deepEqual(TIMELINE.map((s) => s.kind), ['intro', 'anim', 'outro']);
  assert.equal(TIMELINE[1].anim?.name, 'KeyQuote');
  assert.equal(VIDEOS.en.main, TIMELINE);
});
