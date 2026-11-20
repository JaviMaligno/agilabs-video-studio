import { test } from 'node:test';
import assert from 'node:assert/strict';
import { say, intro, anim, outro, lineSeconds, videos, voice, GAP, TAIL, OUTRO_SECONDS, OUTRO_TAIL } from '../src/narrate.ts';
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

/** Script v5 (script.md), rows 1-9, exactly as approved. */
const SCRIPT_V5 = [
  'You told your AI the plan changed. It said "got it". An hour later, it booked the old plan.',
  "It didn't ignore you. It forgot. Your AI has a few places to remember things, and each one forgets in its own way.",
  'What it learned in training is frozen. Your correction has to go somewhere else.',
  'First, the desk: the chat it can see. In a long chat, "Friday" can get buried under hotels and prices. And a new chat starts with a clean desk, unless something was saved to memory.',
  'When the desk fills up, it writes a summary and throws the pages away. A good summary keeps "Friday". A weaker one can drop it.',
  "Or it files the whole chat away and looks things up by keyword. Sounds safest, right? In my tests with AI agents, it did the worst. It searched for hotels and prices, and almost never for a change of plan it didn't know about.",
  'Or it keeps a few named boxes: flight, hotel. "Friday" replaces "Thursday" and stays. But a fact with no box gets lost.',
  'Like you: the gist in your head, your email to search, a note on the fridge. These apps often save to memory on their own, but when something matters, ask it to save it.',
  'More at javieraguilar.ai.',
];
/** Scenes of each script row (rows 4, 6, 7 and 8 have two visual beats, so two scenes). */
const ROWS = [['cold'], ['map'], ['training'], ['desk', 'fresh'], ['summary'], ['notebook', 'search'], ['form', 'nobox'], ['human', 'save'], ['outro']];

test('the narration is script v5 verbatim, EN only, no per-line speed', () => {
  assert.deepEqual(TIMELINE.map((s) => s.id), ROWS.flat());
  ROWS.forEach((ids, i) => {
    const text = ids.flatMap((id) => TIMELINE.find((s) => s.id === id)!.lines.map((l) => l.text.en)).join(' ');
    assert.equal(text, SCRIPT_V5[i], `row ${i + 1}`);
  });
  for (const s of TIMELINE) for (const l of s.lines) {
    assert.equal(l.text.es, '', `${l.key}: ES is empty`);
    assert.equal(l.tone?.speed, undefined, `${l.key}: no speed override`);
  }
});

test('no warehouse anywhere in the narration', () => {
  for (const s of TIMELINE) for (const l of s.lines) assert.doesNotMatch(l.text.en, /warehouse|pallet|shelf|quarantin|crate|rack/i);
});

test('settings and timeline of this video (EN only, script v5, the trip chat)', () => {
  assert.deepEqual(SETTINGS.voices, ['en']);
  assert.deepEqual(SETTINGS.subtitles, ['en']);
  assert.equal(SETTINGS.targetSeconds, 84);
  assert.deepEqual(SETTINGS.articleTitle, { en: 'How an AI agent forgets', es: '' });
  assert.deepEqual(SETTINGS.music, { src: 'music/bed.wav', volume: 0.2, duck: 0.3 });
  // The poster is the cold open (frame 12): the wrong booking, pulsing red.
  assert.deepEqual(SETTINGS.poster, { scene: 'cold', second: 0.4 });
  assert.equal(TIMELINE[0].kind, 'intro');
  assert.equal(TIMELINE[0].anim?.name, 'ChatTrip');
  assert.equal(TIMELINE[0].anim?.props.mode, 'wrong');
  assert.equal(TIMELINE.at(-1)?.kind, 'outro');
  assert.equal(TIMELINE.length, 13);
  // Every mark is resolved to a finite scene second.
  for (const s of TIMELINE) {
    const marks = (s.anim?.props as { marks?: unknown[] } | undefined)?.marks ?? [];
    for (const m of marks) assert.ok(typeof m === 'number' && Number.isFinite(m), `${s.id}: mark ${String(m)}`);
  }
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
