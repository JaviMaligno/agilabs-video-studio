import { test } from 'node:test';
import assert from 'node:assert/strict';
import { say, intro, anim, outro, lineSeconds, videos, voice, GAP, TAIL, OUTRO_SECONDS, OUTRO_TAIL } from '../src/narrate.ts';
import { FPS, SCENE_TRANSITION, sceneFrames, sceneStarts } from '../src/timing.ts';
import { SETTINGS } from '../src/settings.ts';
import { VIDEOS, TIMELINE } from '../src/timeline.ts';

const near = (a: number, b: number, eps = 0.002) => assert.ok(Math.abs(a - b) <= eps, `${a} is not ≈ ${b}`);

test('lines never overlap and respect GAP', () => {
  const s = intro('t-hook', [
    say(0, 'The first line of the hook, short and plain.', 'La primera frase del gancho.'),
    say(0, 'A second line that follows it.', 'Una segunda frase.'),
  ]);
  const [a, b] = s.lines;
  near(a.start, 0);
  near(a.dur, 'The first line of the hook, short and plain.'.length / 14.5);
  near(b.start, a.start + a.dur + 0.35);
  assert.equal(GAP, 0.35);
  assert.deepEqual(s.lines.map((l) => l.key), ['t-hook-01', 't-hook-02']);
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

test('this video: settings and timeline shape', () => {
  assert.deepEqual(SETTINGS.voices, ['en']);
  assert.deepEqual(SETTINGS.subtitles, ['en']);
  assert.equal(SETTINGS.targetSeconds, 80);
  assert.deepEqual(SETTINGS.music, { src: 'music/bed.wav', volume: 0.2, duck: 0.3 });
  assert.deepEqual(SETTINGS.poster, { scene: 'wall', second: 8.2 });
  // The hook is an animation from the first frame (no title card), the outro closes.
  assert.equal(TIMELINE[0].kind, 'anim');
  assert.equal(TIMELINE.at(-1)?.kind, 'outro');
  const clocks = TIMELINE.filter((s) => s.kind === 'anim').map((s) => Number(s.anim?.props.clock));
  assert.equal(clocks[0], 0);
  clocks.slice(1).forEach((c, i) => assert.ok(c > clocks[i]));
  // Every line that names Laya is voiced Spanish-style.
  for (const l of TIMELINE.flatMap((s) => s.lines).filter((l) => /Laya/.test(l.text.en))) assert.match(l.spoken?.en ?? '', /Lah-yah/);
  assert.equal(VIDEOS.en.main, TIMELINE);
  // Script v2.0 + feedback v3: at most 95 s; one question card per part, in order, none on the outro.
  assert.ok(sceneStarts(TIMELINE).total / FPS <= 95, `length ${sceneStarts(TIMELINE).total / FPS}`);
  const qs = TIMELINE.map((s) => (s.anim?.props.card as { q: string } | undefined)?.q ?? null);
  assert.deepEqual([...new Set(qs)], ['Which sport is it?', 'Does training work?', 'Does it use the order?', 'Is it repeatable?', 'So, is Laya good?', null]);
  const stamps = TIMELINE.flatMap((s) => {
    const st = (s.anim?.props.card as { stamp?: { text: string; at: number } } | undefined)?.stamp;
    return st ? [st.text] : [];
  });
  assert.deepEqual(stamps, ['?', 'yes', 'yes', 'sometimes', 'partly']);
  // Only two numbers are spoken: "four" (sports) and "eight" (points).
  const spoken = TIMELINE.flatMap((s) => s.lines.map((l) => (l.spoken?.en ?? l.text.en).toLowerCase()));
  const numbers = spoken.join(' ').match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|percent)\b/g) ?? [];
  assert.deepEqual(numbers.filter((n) => n !== 'one'), ['four', 'eight']);
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
