import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { say, anim } from '../src/narrate.ts';

test('per-line tone survives placement in the timeline', () => {
  const line = say(0, 'A reveal.', '', undefined, { emotion: 'amazed', speed: 1.04 });
  const scene = anim('reveal', 'Counter', {}, [line]);
  assert.deepEqual(scene.lines[0].tone, { emotion: 'amazed', speed: 1.04 });
});

test('TTS sends default emotion and line overrides, and tone changes invalidate its cache', async (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'agilabs-tone-'));
  const calls: any[] = [];
  const server = http.createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    calls.push(JSON.parse(raw));
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write('data: ' + JSON.stringify({ type: 'chunk', data: Buffer.alloc(8820).toString('base64') }) + '\n\n');
    res.write('data: ' + JSON.stringify({ type: 'timestamps', word_timestamps: { words: ['test'], start: [0], end: [.1] } }) + '\n\n');
    res.end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise<void>((resolve, reject) => server.close((e) => e ? reject(e) : resolve()));
    const target = fs.realpathSync(fixture);
    if (path.dirname(target) !== fs.realpathSync(os.tmpdir()) || !path.basename(target).startsWith('agilabs-tone-')) throw Error('Unexpected cleanup target');
    fs.rmSync(target, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(fixture, 'scripts'));
  fs.mkdirSync(path.join(fixture, 'src'));
  for (const name of ['tts.ts', 'tts-engine.mjs', 'lib.mjs']) fs.copyFileSync(path.resolve('scripts', name), path.join(fixture, 'scripts', name));
  fs.copyFileSync(path.resolve('src/types.ts'), path.join(fixture, 'src/types.ts'));
  fs.writeFileSync(path.join(fixture, 'package.json'), '{"type":"module"}');
  fs.writeFileSync(path.join(fixture, 'src/settings.ts'), "export const SETTINGS={voices:['en']};");
  fs.writeFileSync(path.join(fixture, 'src/timeline.ts'), `export const VIDEOS={en:{main:[{lines:[
    {key:'hook',text:{en:'Hook: wait.',es:''},voice:'en'},
    {key:'reveal',text:{en:'A reveal.',es:''},voice:'en',tone:{emotion:'amazed',speed:1.04}}
  ]}]}};`);
  const configure = (emotion: string) => fs.writeFileSync(path.join(fixture, 'video.config.mjs'), `export default {tts:{engine:'cartesia',model:'test-model',speed:1,emotion:'${emotion}',colonsAsStops:true,voices:{en:{id:'test-voice'}}}};`);
  const run = () => new Promise<void>((resolve, reject) => {
    const port = (server.address() as {port:number}).port;
    const child = spawn(process.execPath, ['scripts/tts.ts','en'], { cwd:fixture, env:{...process.env,CARTESIA_API_KEY:'DUMMY_TEST_KEY_NOT_A_SECRET',CARTESIA_BASE:`http://127.0.0.1:${port}`}, stdio:['ignore','pipe','pipe'] });
    let output=''; child.stdout.on('data',(b)=>output+=b);child.stderr.on('data',(b)=>output+=b);
    child.on('error',reject);child.on('exit',(code)=>code===0?resolve():reject(Error(output)));
  });
  configure('excited');
  await run();
  assert.equal(calls.length, 2);
  assert.equal(calls[0].generation_config?.emotion, 'excited');
  assert.equal(calls[0].transcript, 'Hook. Wait.');
  assert.equal(calls[1].generation_config?.emotion, 'amazed');
  assert.equal(calls[1].generation_config?.speed, 1.04);
  configure('enthusiastic');
  await run();
  assert.equal(calls.length, 3, 'only the default-tone line should be regenerated');
  assert.equal(calls[2].generation_config?.emotion, 'enthusiastic');
});
