import { test } from 'node:test';
import assert from 'node:assert/strict';
import { L, say, intro, anim, outro, lineSeconds, videos, voice, GAP, TAIL, OUTRO_SECONDS, OUTRO_TAIL } from '../src/narrate.ts';
import { CHAPTER_CARD, CHAPTER_FADE, CHAPTER_LEAD, FPS, SCENE_TRANSITION, chapterCardOpacity, chapterNumbers, sceneFrames, sceneStarts } from '../src/timing.ts';
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
  const short = intro('hi', [say(0, 'Hi.', 'Hola.')]);
  assert.equal(short.minSeconds, 3);
  assert.equal(TAIL, 0.8);
  const long = intro('long', [say(0, 'x'.repeat(145), 'y'), say(0, 'z'.repeat(29), 'w')]);
  const last = long.lines.at(-1)!;
  near(long.minSeconds!, last.start + last.dur + 0.8);
  assert.ok(long.minSeconds! > 3);
  assert.equal(sceneFrames(long), Math.round(long.minSeconds! * FPS));
});

test('outro: 3 s when silent or short, else only OUTRO_TAIL past its last line', () => {
  assert.equal(OUTRO_SECONDS, 3);
  assert.equal(outro('silent', []).minSeconds, 3);
  assert.equal(outro('short', [say(0, 'Hi.', 'Hola.')]).minSeconds, 3);
  // 58 chars / 14.5 = 4 s of voice: the card ends OUTRO_TAIL after it, not TAIL.
  const long = outro('long', [say(0.2, 'a'.repeat(58), 'b')]);
  near(long.minSeconds!, 0.2 + 4 + OUTRO_TAIL);
  assert.ok(OUTRO_TAIL < TAIL);
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

test('a spoken form drives the TTS length estimate and is kept on the line', () => {
  const s = anim('num', 'Counter', {}, [say(0, 'It solved 14/20.', 'Resolvió 14/20.', { en: 'It solved fourteen out of twenty.' })]);
  const [l] = s.lines;
  assert.equal(l.text.en, 'It solved 14/20.');
  assert.deepEqual(l.spoken, { en: 'It solved fourteen out of twenty.' });
  near(l.dur, 'It solved fourteen out of twenty.'.length / 14.5);
  // No spoken form: the line carries none.
  assert.equal(say(0, 'a', 'b').spoken, undefined);
  assert.equal(intro('plain', [say(0, 'Plain line.', 'Línea.')]).lines[0].spoken, undefined);
});

test('a chapter scene leaves room for its card: lines shift by CHAPTER_LEAD, spacing kept', () => {
  const plain = anim('p', 'X', {}, [say(0, 'a'.repeat(29), 'b'), say(5, 'Later.', 'Luego.')]);
  const ch = anim('c', 'X', {}, [say(0, 'a'.repeat(29), 'b'), say(5, 'Later.', 'Luego.')], { chapter: L('Training', 'Entrenamiento') });
  assert.deepEqual(ch.chapter, { en: 'Training', es: 'Entrenamiento' });
  assert.ok(CHAPTER_LEAD > 0 && CHAPTER_LEAD < CHAPTER_CARD, 'the voice may start on the card');
  near(ch.lines[0].start, CHAPTER_LEAD);
  near(ch.lines[1].start, 5 + CHAPTER_LEAD);
  near(ch.minSeconds!, plain.minSeconds! + CHAPTER_LEAD);
  assert.deepEqual(ch.beats, ch.lines.map((l) => l.start));
  // A silent chapter scene still shows its whole card.
  assert.ok(anim('s', 'X', {}, [], { chapter: 'Silent' }).minSeconds! >= CHAPTER_CARD);
  // min counts from the end of the lead too.
  near(anim('m', 'X', {}, [], { chapter: 'M', min: 6 }).minSeconds!, 6 + CHAPTER_LEAD);
  // Scenes without a chapter are unchanged.
  near(plain.lines[0].start, 0);
});

test('chapter card is fully on from the first frame, then fades out by CHAPTER_CARD', () => {
  assert.equal(chapterCardOpacity(0), 1);
  assert.equal(chapterCardOpacity(CHAPTER_CARD - CHAPTER_FADE), 1);
  assert.equal(chapterCardOpacity(CHAPTER_CARD), 0);
  assert.equal(chapterCardOpacity(CHAPTER_CARD + 5), 0);
  assert.equal(chapterCardOpacity(Number.NaN), 0);
  let prev = 1;
  for (let t = 0; t <= CHAPTER_CARD + 0.5; t += 0.05) {
    const o = chapterCardOpacity(t);
    assert.ok(o >= 0 && o <= 1 && o <= prev + 1e-12, `opacity ${o} at ${t}`);
    prev = o;
  }
});

test('chapters are numbered in order; only anim scenes with a chapter get a card', () => {
  const scenes = [
    intro('hook', [say(0, 'Hook.', 'Gancho.')]),
    anim('a', 'X', {}, [say(0, 'A.', 'A.')], { chapter: 'One' }),
    anim('b', 'X', {}, [say(0, 'B.', 'B.')]),
    anim('c', 'X', {}, [say(0, 'C.', 'C.')], { chapter: 'Two' }),
    outro('end', []),
  ];
  assert.deepEqual(chapterNumbers(scenes), [undefined, 1, undefined, 2, undefined]);
});
