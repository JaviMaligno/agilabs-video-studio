import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseEngine } from '../scripts/tts-engine.mjs';

test('auto falls back per language', () => {
  const noKey = chooseEngine('auto', false);
  assert.equal(noKey.engine, 'kokoro');
  assert.match(noKey.warning ?? '', /CARTESIA_API_KEY/);

  const down = chooseEngine('auto', true, 'HTTP 402');
  assert.equal(down.engine, 'kokoro');
  assert.match(down.warning ?? '', /HTTP 402/);

  const ok = chooseEngine('auto', true);
  assert.equal(ok.engine, 'cartesia');
  assert.equal(ok.warning, undefined);

  assert.throws(() => chooseEngine('cartesia', false), /CARTESIA_API_KEY/);
});

test('explicit engines are honoured', () => {
  assert.deepEqual(chooseEngine('kokoro', true), { engine: 'kokoro' });
  assert.deepEqual(chooseEngine('cartesia', true), { engine: 'cartesia' });
  // Asked for Cartesia explicitly: an outage is an error, never a silent switch of voice.
  assert.throws(() => chooseEngine('cartesia', true, 'HTTP 500'), /HTTP 500/);
});
