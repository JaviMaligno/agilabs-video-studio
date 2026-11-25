import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dipCentres, lineAt, planShots, OPENING_SECONDS, OPENING_STEP } from '../scripts/review-frames.ts';
import { anim, intro, outro, say } from '../src/narrate.ts';
import { FPS, SCENE_TRANSITION, sceneStarts } from '../src/timing.ts';
import type { Scene } from '../src/types.ts';

const scenes: Scene[] = [
  intro('hook', [say(0.1, 'Can a robot find the ball?', '')]),
  anim('try', 'Counter', { value: 3, label: 'tries' }, [say(0.3, 'It looks under the cup.', ''), say(0, 'Then under the hat.', '')]),
  outro('end', [say(0.3, 'More at javieraguilar.ai.', '')]),
];
const total = sceneStarts(scenes).total;

test('opening: frame 0 and a strip every 0.5 s up to 8 s', () => {
  const opening = planShots({ totalFrames: 600, scenes }).filter((s) => s.section === 'opening');
  assert.equal(opening[0].frame, 0);
  assert.equal(opening.length, OPENING_SECONDS / OPENING_STEP + 1);
  assert.deepEqual(opening.slice(1, 3).map((s) => s.frame), [OPENING_STEP * FPS, 2 * OPENING_STEP * FPS]);
});

test('every scene change gets the last clean frame, the dip and the first clean frame', () => {
  const { starts } = sceneStarts(scenes);
  const cuts = planShots({ totalFrames: total, scenes }).filter((s) => s.section === 'cuts');
  assert.equal(cuts.length, 3 * (scenes.length - 1));
  assert.deepEqual(cuts.filter((s) => s.cut === 1).map((s) => s.frame), [starts[1] - 1, starts[1] + SCENE_TRANSITION / 2, starts[1] + SCENE_TRANSITION]);
});

test('every line gets before, mid and end frames, all inside the video', () => {
  const shots = planShots({ totalFrames: total, scenes });
  const lines = shots.filter((s) => s.section === 'lines');
  for (const key of ['hook-01', 'try-01', 'try-02', 'end-01']) {
    for (const when of ['before', 'mid', 'end']) assert.ok(lines.some((s) => s.label === `${when} ${key}`), `${when} ${key}`);
  }
  assert.ok(lines.some((s) => s.label === 'last frame' && s.frame === total - 1));
  assert.ok(shots.every((s) => s.frame >= 0 && s.frame < total));
});

test('without a timeline, detected cuts give a frame on each side and no line frames', () => {
  const shots = planShots({ totalFrames: 900, cuts: [4, 12.5] });
  assert.deepEqual(shots.filter((s) => s.section === 'cuts').map((s) => s.cut), [1, 1, 1, 2, 2, 2]);
  assert.equal(shots.find((s) => s.label === 'mid cut 1')?.frame, 4 * FPS);
  assert.deepEqual(shots.filter((s) => s.section === 'lines').map((s) => s.label), ['last frame']);
});

test('lineAt names the line on air, or the next one in a pause', () => {
  assert.equal(lineAt(scenes, 0.2, 'en'), '"Can a robot find the ball?"');
  assert.match(lineAt(scenes, 0.05, 'en'), /^\(pause; next: "Can a robot/);
});

test('dipCentres finds the bottom of each dip to the background', () => {
  const series = Array.from({ length: 300 }, (_, i) => ({ t: i / FPS, detail: 6 }));
  for (const [from, low] of [[100, 105], [200, 202]] as const) for (let i = from - 6; i <= from + 6; i++) series[i].detail = Math.abs(i - low) * 0.1;
  assert.deepEqual(dipCentres(series).map((t) => Math.round(t * FPS)), [105, 202]);
  assert.deepEqual(dipCentres(series.map((p) => ({ ...p, detail: 6 }))), []);
});
