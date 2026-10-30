import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as f3d from '../src/anim/Frontier3D.state.ts';

const names = (pred: (p: f3d.PointState) => boolean, s: f3d.FrontierState) => s.points.filter(pred).map((p) => p.name).sort().join('');

const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
  { beats: [0.2, 2.4, 4.8], dur: 9 },
];

const UNIT = ['appear', 'teal', 'red', 'drop'] as const;

test('Frontier3D state is total and its progress fields stay in [0, 1]', () => {
  for (const mode of ['orbit', 'gate'] as const) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, NaN]) {
        const s = f3d.frameState({ mode }, t, beats, dur);
        const where = `${mode}@t=${t},dur=${dur},beats=[${beats}]`;
        for (const v of [s.camera.yaw, s.camera.pitch, s.camera.zoom, s.camera.ortho, s.floor]) assert.ok(Number.isFinite(v), where);
        for (const v of [s.opacity, s.tilt, s.draw]) assert.ok(v >= 0 && v <= 1, `${where}: ${v}`);
        for (const p of s.points) for (const k of UNIT) assert.ok(p[k] >= 0 && p[k] <= 1, `${where} ${p.name}.${k}=${p[k]}`);
      }
    }
  }
});

test('the dataset gives the frontiers the script describes', () => {
  assert.deepEqual([...f3d.FRONTIER_3D].sort().join(''), 'CDEFGHK');
  assert.deepEqual([...f3d.FRONTIER_2D].sort().join(''), 'CEK');
  assert.deepEqual([...f3d.ORBIT_TEAL].sort().join(''), 'ABCDEFGHK');
  assert.deepEqual(f3d.MODELS.filter((m) => m.quality < f3d.QUALITY_FLOOR).map((m) => m.name), ['A', 'B']);
  // The staircase walks down and right only.
  const st = f3d.staircase();
  for (let i = 1; i < st.length; i++) assert.ok(st[i][0] >= st[i - 1][0] && st[i][1] <= st[i - 1][1]);
});

test('orbit: nothing before beat 0, grey on beat 0, all but I and J teal on beat 1', () => {
  const beats = [1, 3.2];
  const before = f3d.frameState({ mode: 'orbit' }, 0.5, beats, 6);
  assert.ok(before.points.every((p) => p.appear === 0));
  const grey = f3d.frameState({ mode: 'orbit' }, 3.1, beats, 6);
  assert.ok(grey.points.every((p) => p.appear === 1 && p.teal === 0));
  const end = f3d.frameState({ mode: 'orbit' }, 6, beats, 6);
  assert.equal(names((p) => p.teal === 1, end), 'ABCDEFGHK');
  assert.equal(names((p) => p.teal === 0, end), 'IJ');
  // The camera orbits, and nothing of the gate shows yet.
  assert.notEqual(before.camera.yaw, end.camera.yaw);
  assert.equal(end.opacity, 0);
  assert.equal(end.tilt, 0);
});

test('the gate opens on the camera and colours the orbit ends on', () => {
  const orbit = f3d.frameState({ mode: 'orbit' }, 6, [0.2, 3], 6);
  const gate = f3d.frameState({ mode: 'gate' }, 0, [0.2, 2.4, 4.8], 9);
  assert.deepEqual(orbit.camera, gate.camera);
  assert.deepEqual(gate.camera, f3d.ORBIT_END);
  assert.deepEqual(orbit.points.map((p) => p.teal), gate.points.map((p) => p.teal));
  assert.equal(gate.floor, f3d.RANGE.quality[0]);
});

test('gate: the floor rises on beat 0, A and B drop on beat 1, top view and C-E-K on beat 2', () => {
  const beats = [0.2, 2.4, 4.8];
  const dur = 9;
  const risen = f3d.frameState({ mode: 'gate' }, 2.3, beats, dur);
  assert.equal(risen.floor, f3d.QUALITY_FLOOR);
  assert.equal(risen.opacity, 1);
  assert.ok(risen.points.every((p) => p.red === 0));

  const out = f3d.frameState({ mode: 'gate' }, 4.7, beats, dur);
  assert.equal(names((p) => p.red === 1 && p.drop === 1, out), 'AB');
  assert.ok(out.points.filter((p) => p.name !== 'A' && p.name !== 'B').every((p) => p.red === 0 && p.drop === 0));
  assert.equal(out.tilt, 0);

  const end = f3d.frameState({ mode: 'gate' }, dur, beats, dur);
  assert.deepEqual(end.camera, { yaw: f3d.TOP.yaw, pitch: f3d.TOP.pitch, zoom: end.camera.zoom, ortho: 1 });
  assert.equal(end.tilt, 1);
  assert.equal(end.draw, 1);
  assert.equal(end.opacity, 0);
  assert.equal(names((p) => p.teal === 1, end), 'CEK');
  assert.ok(end.points.filter((p) => !f3d.FRONTIER_2D.has(p.name)).every((p) => p.teal === 0));
});

test('gate finishes everything by the scene end even with late or missing beats', () => {
  for (const { beats, dur } of SCENARIOS) {
    const s = f3d.frameState({ mode: 'gate' }, dur, beats, dur);
    assert.equal(s.tilt, 1);
    assert.equal(s.draw, 1);
    assert.equal(s.floor, f3d.QUALITY_FLOOR);
    assert.equal(names((p) => p.drop === 1, s), 'AB');
  }
});

test('top view is a flat cost x latency plane: quality does not move a point', () => {
  const cam = { ...f3d.TOP, zoom: 1, ortho: 1 };
  const lo = f3d.project(f3d.toWorld(0.1, 40, 60), cam, 0, 0);
  const hi = f3d.project(f3d.toWorld(0.1, 40, 99), cam, 0, 0);
  assert.ok(Math.abs(lo.x - hi.x) < 1e-6 && Math.abs(lo.y - hi.y) < 1e-6);
  // Cost runs right, latency runs up the screen.
  const cheap = f3d.project(f3d.toWorld(0.02, 40, 80), cam, 0, 0);
  const slow = f3d.project(f3d.toWorld(0.1, 90, 80), cam, 0, 0);
  assert.ok(cheap.x < lo.x);
  assert.ok(slow.y < lo.y);
});

test('perspective: nearer points draw larger', () => {
  const cam = f3d.ORBIT_END;
  const near = f3d.project([-1, -1, -1], cam, 0, 0);
  const far = f3d.project([1, 1, 1], cam, 0, 0);
  assert.ok(near.depth < far.depth);
  assert.ok(near.scale > far.scale);
});

test('gate with two lines: the top view follows the drop-out and still finishes', () => {
  const beats = [0.2, 2.8];
  const dur = 7.6;
  const out = f3d.frameState({ mode: 'gate' }, 4.05, beats, dur);
  assert.equal(names((p) => p.red === 1 && p.drop > 0.5, out), 'AB');
  assert.equal(out.tilt, 0);
  // While the floor is up the camera sits lower, so above and below separate on screen.
  assert.equal(out.camera.pitch, f3d.ORBIT_END.pitch - f3d.RISE_DIP);
  const end = f3d.frameState({ mode: 'gate' }, dur, beats, dur);
  assert.equal(end.tilt, 1);
  assert.equal(end.draw, 1);
  assert.equal(end.camera.pitch, f3d.TOP.pitch);
});
