import { test } from 'node:test';
import assert from 'node:assert/strict';
import { designOf, fitInto, inStage, place, stageBox, stageCentre } from '../src/anim/canvas.ts';
import { LANDSCAPE, STAGE, VERTICAL } from '../src/layout.ts';

const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} is not ≈ ${b}`);

test('design size follows the format', () => {
  assert.deepEqual(designOf(true), { w: VERTICAL.w, h: VERTICAL.h });
  assert.deepEqual(designOf(false), { w: LANDSCAPE.w, h: LANDSCAPE.h });
});

test('place picks the layout of the format, objects included', () => {
  assert.equal(place(true, { v: 1, l: 2 }), 1);
  assert.equal(place(false, { v: 1, l: 2 }), 2);
  const at = place(false, { v: { x: 10, y: 20 }, l: { x: 30, y: 40 } });
  assert.deepEqual(at, { x: 30, y: 40 });
});

test('stage box is the stage of layout.ts in frame pixels', () => {
  for (const vertical of [true, false]) {
    const s = vertical ? STAGE.vertical : STAGE.landscape;
    assert.deepEqual(stageBox(vertical), { x: s.side, y: s.top, w: s.w, h: s.h });
    const c = stageCentre(vertical);
    near(c.x, s.side + s.w / 2);
    near(c.y, s.top + s.h / 2);
  }
});

test('inStage maps normalised stage coordinates to frame pixels', () => {
  const b = stageBox(false);
  assert.deepEqual(inStage(false, 0, 0), { x: b.x, y: b.y });
  assert.deepEqual(inStage(false, 1, 1), { x: b.x + b.w, y: b.y + b.h });
  const mid = inStage(true, 0.5, 0.5);
  near(mid.x, stageCentre(true).x);
  near(mid.y, stageCentre(true).y);
});

test('fitInto scales a box to fit inside another, centred, without distortion', () => {
  const src = { x: 0, y: 0, w: 100, h: 200 };
  const dst = { x: 1000, y: 100, w: 400, h: 400 };
  const f = fitInto(src, dst);
  near(f.scale, 2);
  // 200 wide after scaling, centred in 400: 100 px margin each side.
  near(f.x, 1100);
  near(f.y, 100);
  assert.equal(f.transform, `translate(${f.x} ${f.y}) scale(${f.scale}) translate(0 0)`);
  // The vertical stage fitted into the landscape stage stays inside it.
  const g = fitInto(stageBox(true), stageBox(false));
  const l = stageBox(false);
  const v = stageBox(true);
  assert.ok(g.scale > 0 && g.scale < 1);
  assert.ok(g.x >= l.x - 1e-6 && g.x + v.w * g.scale <= l.x + l.w + 1e-6);
  near(g.y, l.y);
  near(g.y + v.h * g.scale, l.y + l.h);
});
