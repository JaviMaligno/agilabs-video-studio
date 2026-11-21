import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, QUESTIONS, frameState } from '../src/anim/ShopRecipe.state.ts';

const check = (v: unknown, path: string) => {
  if (typeof v === 'number') {
    assert.ok(Number.isFinite(v), `${path} is ${v}`);
    assert.ok(v >= 0 && v <= 1, `${path} = ${v} outside [0, 1]`);
  } else if (Array.isArray(v)) v.forEach((x, i) => check(x, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) check(x, `${path}.${k}`);
};

// The real scenes (timeline.ts with the Cartesia audio; dur from the landscape cut).
// marks: [prompt, looking, LoRA, ordinary, check, general, manners]
const RECIPE = { beats: [0.2, 5.83, 10.02, 18.13, 31.84], marks: [1.76, 8.83, 16.14, 21.61, 33.313, 26.73, 28.49], dur: 38.967 };
const TODAY = { beats: [0.2, 7.83], marks: [2.24, 3.521, 10.43, 12.618], dur: 15.7 };

const variants = (r: { beats: number[]; marks: number[]; dur: number }) => [
  { name: 'real', ...r },
  { name: 'no beats', beats: [], marks: undefined, dur: r.dur },
  { name: 'late', beats: r.beats, marks: r.marks.map((m) => m + 90), dur: r.dur },
  { name: 'NaN', beats: r.beats, marks: r.marks.map(() => Number.NaN), dur: r.dur },
  { name: 'out of order', beats: [...r.beats].reverse(), marks: [...r.marks].reverse(), dur: r.dur },
  { name: 'short', beats: [0], marks: undefined, dur: 0.5 },
];

test('ShopRecipe is total over t in [-1, dur + 1] in both modes', () => {
  for (const mode of ['recipe', 'today', 'bogus'] as const) {
    for (const v of variants(mode === 'today' ? TODAY : RECIPE)) {
      for (let t = -1; t <= v.dur + 1; t += 0.25) {
        const { mode: _m, ...rest } = frameState({ mode: mode as 'recipe', marks: v.marks }, t, v.beats, v.dur);
        check(rest, `${mode}/${v.name}@${t}`);
      }
      const { mode: _m, ...rest } = frameState({ mode: mode as 'recipe', marks: v.marks }, Number.NaN, v.beats, v.dur);
      check(rest, `${mode}/${v.name}@NaN`);
    }
  }
});

test('recipe: built item by item on its marks, the item spoken lit, earlier items kept', () => {
  const at = (t: number) => frameState({ mode: 'recipe', marks: RECIPE.marks }, t, RECIPE.beats, RECIPE.dur);
  const s0 = at(0);
  assert.ok(s0.items[0].appear > 0.8 && s0.pics.note > 0.8, '"1 · The prompt" and its note are there from frame 0');
  assert.deepEqual(s0.items.slice(1).map((i) => i.appear), [0, 0, 0], 'the rest waits for its marks');
  assert.equal(at(1.5).items[0].lit, 0, 'item 1 lights on "prompt"');
  const s1 = at(5.5);
  assert.equal(s1.items[0].appear, 1);
  assert.equal(s1.items[0].lit, 1);
  assert.equal(s1.items[1].appear, 0);
  assert.equal(s1.pics.note, 1);
  const s2 = at(9.8);
  assert.equal(s2.items[1].lit, 1);
  assert.equal(s2.items[0].appear, 1, 'item 1 stays');
  assert.equal(s2.items[0].lit, 0, 'only the spoken item is lit');
  assert.equal(at(15.5).lora, 0, '"LoRA first" waits for its mark');
  const s3 = at(18);
  assert.equal(s3.lora, 1);
  assert.equal(s3.sheet, 1);
  assert.equal(s3.items[2].lit, 1);
  const s3b = at(31.5);
  assert.equal(s3b.replay.lit, 1);
  assert.equal(s3b.ordinary, 1);
  assert.equal(s3b.pics.stack, 1);
  const end = at(RECIPE.dur);
  assert.deepEqual(end.items.map((i) => i.appear), [1, 1, 1, 1]);
  assert.equal(end.items[3].lit, 1);
  assert.equal(end.pics.floor, 1);
  assert.equal(end.fall, 1);
  assert.equal(ITEMS.length, 4);
});

test('recipe: under the lesson stack, general knowledge won back and ticked, the manners sticky crossed and kept crossed', () => {
  const at = (t: number) => frameState({ mode: 'recipe', marks: RECIPE.marks }, t, RECIPE.beats, RECIPE.dur);
  const quiet = at(25.5);
  assert.deepEqual(Object.values(quiet.mix), [0, 0, 0, 0, 0], 'nothing before "general"');
  const g = at(27.7);
  assert.equal(g.mix.knowledge, 1);
  assert.equal(g.mix.recover, 1);
  assert.equal(g.mix.tick, 1);
  assert.equal(g.mix.manners, 0, 'the manners sticky waits for "manners"');
  const mn = at(29);
  assert.equal(mn.mix.manners, 1);
  assert.equal(mn.mix.cross, 1);
  assert.equal(at(28.3).mix.cross, 0, 'crossed on "manners", not before');
  const late = at(31.6);
  assert.equal(late.pics.stack, 1, 'shown with the lesson stack');
  assert.equal(late.mix.cross, 1, 'it stays crossed');
  assert.equal(at(RECIPE.dur).pics.stack, 0, 'and leaves with the stack');
  const today = frameState({ mode: 'today', marks: TODAY.marks }, TODAY.dur, TODAY.beats, TODAY.dur);
  assert.deepEqual(Object.values(today.mix), [0, 0, 0, 0, 0], 'not in today mode');
});

test('today: the note and ten ticks, then the full recipe with the clear sheet in the corner', () => {
  const at = (t: number) => frameState({ mode: 'today', marks: TODAY.marks }, t, TODAY.beats, TODAY.dur);
  assert.equal(at(1).check.panel, 1);
  assert.equal(at(1).check.ticks.filter((x) => x > 0).length, 0);
  const s = at(7.5);
  assert.equal(s.check.ticks.length, QUESTIONS.length);
  assert.deepEqual(s.check.ticks, QUESTIONS.map(() => 1), 'all ten ticked before the next line');
  assert.ok(at(5).check.ticks.filter((x) => x >= 1).length < 10, 'they tick one by one');
  const e = at(TODAY.dur);
  assert.equal(e.check.panel, 0);
  assert.equal(e.list, 1);
  assert.deepEqual(e.items.map((i) => i.appear), [1, 1, 1, 1]);
  assert.equal(e.pics.corner, 1);
  assert.equal(e.items[3].lit, 1);
  assert.equal(at(11.5).items[0].lit, 1, 'the prompt lit on "cheapest"');
});
