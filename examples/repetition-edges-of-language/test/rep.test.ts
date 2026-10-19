import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BURST, FLAT, HELLO3, SEEDS } from '../src/anim/rep.ts';

const replies = JSON.parse(fs.readFileSync(new URL('../public/replies.json', import.meta.url), 'utf8'));

test('on-screen replies are the extracted model outputs', () => {
  FLAT.forEach((f, i) => {
    assert.equal(replies.flat[i].n, f.n);
    assert.ok(replies.flat[i].text.startsWith(f.text), `flat N=${f.n}`);
  });
  assert.equal(replies.flat.at(-1).text, 'No time access.');
  assert.equal(replies.hello3.text, HELLO3);
  // Opus: the shown lines appear in the reply (markdown stars stripped).
  const opus = replies.burst.text.replace(/\*/g, '');
  for (const line of [BURST.big, BURST.sub, BURST.empire]) assert.ok(opus.includes(line), line);
  assert.ok(replies.baseTable.text.startsWith(Array(10).fill(SEEDS.table).join(' ')));
  assert.ok(replies.baseFlorb.text.startsWith(Array(10).fill(SEEDS.florb).join(' ')));
  assert.ok(replies.baseUseless.text.startsWith(Array(3).fill(SEEDS.useless).join(' ')));
});
