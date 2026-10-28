import { test } from 'node:test';
import assert from 'node:assert/strict';
import { say, intro, anim, outro, lineSeconds, videos, voice, GAP, TAIL, OUTRO_SECONDS, OUTRO_TAIL } from '../src/narrate.ts';
import { FPS, SCENE_TRANSITION, sceneFrames, sceneStarts } from '../src/timing.ts';
import { SETTINGS } from '../src/settings.ts';
import { VIDEOS, TIMELINE } from '../src/timeline.ts';

// The video's target length (src/settings.ts), pinned so a change is deliberate.
const TARGET_SECONDS = 139;

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
  assert.equal(SETTINGS.targetSeconds, TARGET_SECONDS);
  assert.deepEqual(SETTINGS.music, { src: 'music/bed.wav', volume: 0.2, duck: 0.3 });
  assert.deepEqual(SETTINGS.poster, { scene: 'name', second: 2.6 });
  assert.equal(TIMELINE[0].kind, 'anim');
  assert.equal(TIMELINE.at(-1)?.kind, 'outro');
  assert.equal(VIDEOS.en.main, TIMELINE);
  // Within the lint tolerance of the target.
  const seconds = sceneStarts(TIMELINE).total / FPS;
  assert.ok(Math.abs(seconds - SETTINGS.targetSeconds) <= SETTINGS.targetSeconds * 0.2, `length ${seconds}`);
});

test('this video: the narration is the script, line by line (scenes 14 and 15 voiced as one sentence)', () => {
  const said = TIMELINE.flatMap((s) => s.lines.map((l) => l.text.en)).join(' ');
  const script = [
    "A higher benchmark score doesn't always feel like a better model.",
    'With Opus 5 I felt that. So did people I talk to.',
    'Some tables even put it above Fable. My experience said otherwise.',
    'Was it optimised for the exam? I wanted to test, not assume.',
    'That suspicion has a name. Benchmaxing.',
    'Optimising a model, or which results you report, to maximise scores.',
    'Exam prep can teach the subject, or just the format.',
    'At least three different things hide behind it.',
    "One. Give models fresh problems, like the test's.",
    'Several model families dropped. Many frontier models held up.',
    "Two. Llama 4's headline arena score came from an experimental chat version.",
    'And one study found 27 private Meta variants tested before it.',
    'Three. Skip the test and measure the work.',
    'Developers using early-2025 AI tools took 19% longer,',
    'while believing they had saved time.',
    "That was early tools, not today's models.",
    'A score describes the conditions it was run under.',
    'One Opus 5 score is an internal run, averaged over five attempts.',
    "I feel the gap when managing other agents, and its announced benchmarks don't measure that.",
    'So I ran a small pilot. Seven models, five cases each.',
    'Two cases had one rule. Never send the same thing twice.',
    'Most relied on a time check before retrying.',
    'But a worker can check, then pause.',
    'Another sends, the provider forgets, and the first sends again.',
    'Kimi and Gemini kept the rule most of the time. Opus and Fable never did.',
    'On permissions and data analysis, almost all tied.',
    'Five cases are a probe, not an answer.',
    'The research gives good reasons to take it seriously.',
    'But the further a test sits from my work, the more it needs checking.',
    "Was Opus 5 benchmaxed? That's the question worth keeping open.",
    'More at javieraguilar.ai',
  ].join(' ');
  assert.equal(said, script);
  // Spoken forms only where the script lists them.
  const spoken = TIMELINE.flatMap((s) => s.lines.flatMap((l) => (l.spoken?.en ? [l.spoken.en] : [])));
  assert.deepEqual(spoken, [
    "Two. Llama four's headline arena score came from an experimental chat version.",
    'And one study found twenty-seven private Meta variants tested before it.',
    'Developers using early twenty twenty-five AI tools took nineteen percent longer, while believing they had saved time.',
    'More at javier aguilar dot A I.',
  ]);
  // No personal name anywhere on screen or in the voice.
  assert.ok(!/javier aguilar(?! dot)/i.test(JSON.stringify(TIMELINE.map((s) => [s.anim, s.lines.map((l) => l.text)]))));
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
