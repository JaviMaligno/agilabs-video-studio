import { test } from 'node:test';
import assert from 'node:assert/strict';
import { say, intro, anim, outro, lineSeconds, videos, voice, GAP, TAIL, OUTRO_SECONDS, OUTRO_TAIL } from '../src/narrate.ts';
import { FPS, SCENE_TRANSITION, sceneFrames, sceneStarts } from '../src/timing.ts';
import { SETTINGS } from '../src/settings.ts';
import { VIDEOS, TIMELINE } from '../src/timeline.ts';

/** Narration lines 1-20 of script.md, as written. */
const SCRIPT = [
  'Give an agent a notepad instead of a memory. It stops forgetting. It starts misremembering.',
  'Agents usually reread their whole conversation at every step, and it keeps growing.',
  'A paper called SKILL.state swaps that for a small notepad of current facts, rewritten each step.',
  'It promises steadier accuracy and a far smaller prompt. I rebuilt their test to check.',
  'My test is a warehouse agent filing pallets, for up to two hundred steps.',
  "In tokens it's 7.5x cheaper. But a changing notepad breaks caching, and my bill said only 1.4x.",
  "Keeping both, with the notepad first as in the paper's template, costs 5.2x more.",
  "On Claude, long tasks hurt neither. So I ran the paper's own model, Gemini, in their setup.",
  'The notepad never missed in 75 episodes. The transcript slipped, less than the paper reports.',
  'It clearly wins when a fact stops being true, like a pallet never actually put away.',
  'The transcript holds the record and its correction, and must reconcile them each time.',
  'Across three models, the notepad applied the correction in 70 of 72 episodes. The transcript, in 10.',
  'Yet on Claude Haiku, in the same setup, the notepad came last.',
  'Replaying every step, each failure began with a correct move written down wrong.',
  "It moved shelf seven to three, but noted shelf six's contents, then shipped on that belief.",
  'Nothing checks that write. Haiku did it in 17 of 24 long runs.',
  'On Haiku, keeping the transcript beside the notepad absorbed every slip that mattered.',
  "So the notepad works, best when facts change. It doesn't forget. On some models, it misremembers.",
  'Check each write against what the action did, and keep the notepad last in the prompt.',
  'More at javieraguilar.ai',
];
/** The main cut's real length, in seconds (pinned with SETTINGS.targetSeconds). */
const TARGET = SETTINGS.targetSeconds;

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
  assert.equal(SETTINGS.targetSeconds, TARGET);
  assert.deepEqual(SETTINGS.music, { src: 'music/bed.wav', volume: 0.2, duck: 0.3 });
  assert.deepEqual(SETTINGS.poster, { scene: 'grid', second: 9.3 });
  assert.equal(TIMELINE[0].kind, 'anim');
  assert.equal(TIMELINE.at(-1)?.kind, 'outro');
  assert.equal(VIDEOS.en.main, TIMELINE);
  // The real length (after TTS) is the target, within a second.
  assert.ok(Math.abs(sceneStarts(TIMELINE).total / FPS - TARGET) < 1.5, `length ${sceneStarts(TIMELINE).total / FPS}`);
  // One question card per part, in order; none on the story, the verdict, the advice or the outro.
  const qs = TIMELINE.map((s) => (s.anim?.props.card as { q: string } | undefined)?.q ?? null);
  assert.deepEqual([...new Set(qs)], [null, 'Cheaper?', 'More accurate?', 'When facts change?', 'Claude Haiku 4.5 · Where does it break?']);
  const stamps = TIMELINE.flatMap((s) => {
    const st = (s.anim?.props.card as { stamp?: { text: string } } | undefined)?.stamp;
    return st ? [st.text] : [];
  });
  assert.deepEqual(stamps, ['less than it looks', 'yes, on their model', 'yes', 'the write']);
  // The narration is the script's, word for word (lines split for caption timing are joined back).
  const said = TIMELINE.flatMap((s) => s.lines.map((l) => l.text.en)).join(' ');
  for (const line of SCRIPT) assert.ok(said.includes(line), `missing script line: ${line}`);
  assert.equal(said, SCRIPT.join(' '));
  // Only the corrected figures are spoken, never a superseded one.
  const spoken = TIMELINE.flatMap((s) => s.lines.map((l) => l.spoken?.en ?? l.text.en)).join(' ');
  for (const bad of ['3/44', '93', '18', '5.7', 'five point seven']) assert.ok(!spoken.includes(bad), `spoken ${bad}`);
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
