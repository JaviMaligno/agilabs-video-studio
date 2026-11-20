// Shared checker for the shop components' frame states (ShopChat, FourDoors, FlatLine): every
// number finite, every progress-like field within [0, 1].
import assert from 'node:assert/strict';

/** Fields that may leave [0, 1]: angles and loop times. */
const FREE = new Set(['swing', 'tm', 'right']);

export const checkState = (value: unknown, path: string): void => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (!FREE.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => checkState(v, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) checkState(v, `${path}.${k}`);
  }
};

/** Times from before the scene to past its end, plus every beat and mark. */
export const timesFor = (dur: number, extra: number[]): number[] => {
  const ts = [-1, 0, dur / 4, dur / 2, (3 * dur) / 4, dur, dur + 1, ...extra.filter(Number.isFinite)];
  for (let t = -1; t <= dur + 1; t += 0.25) ts.push(t);
  return ts;
};

/** Beat and mark scenarios: none, normal, late (past the end) and NaN. */
export const scenarios = (dur: number, beats: number[], marks: number[]) => [
  { name: 'empty', beats: [] as number[], marks: [] as number[], dur },
  { name: 'normal', beats, marks, dur },
  { name: 'late', beats: beats.map((b) => b + dur), marks: marks.map((m) => m + dur), dur },
  { name: 'nan', beats: beats.map(() => NaN), marks: marks.map(() => NaN), dur },
  { name: 'out-of-order', beats: [...beats].reverse(), marks: [...marks].reverse(), dur },
  { name: 'short', beats: [0], marks: marks.map(() => 0.1), dur: 0.5 },
];
