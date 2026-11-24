import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chapterLines, midSentenceNames, namesIn, youtubeDescriptionDraft } from '../src/description.ts';
import type { Scene } from '../src/types.ts';

test('names: capitalised runs and years; sentence starts only when seen mid-sentence; no quotes, months or I', () => {
  const known = midSentenceNames(['A note by Levent Alpöge, using Lean and Claude.', 'Then Lean said yes.']);
  assert.ok(known.has('Lean') && known.has('Claude') && known.has('Levent'));
  assert.deepEqual(namesIn('On 20 November, Thomas Stieltjes wrote in 1885 that "it works".', known), ['Thomas Stieltjes', '1885']);
  assert.deepEqual(namesIn('Lean checks it. Does it compile? I think so.', known), ['Lean']);
  assert.deepEqual(namesIn("Remember Stepanov's trick?", new Set(['Stepanov'])), ['Stepanov']);
});

const line = (key: string, en: string) => ({ key, start: 0, dur: 1, text: { en, es: en }, voice: 'en' as const });
const scene = (id: string, lines: string[], chapter?: string): Scene => ({
  id,
  kind: 'anim',
  ...(chapter ? { chapter: { en: chapter, es: chapter } } : {}),
  anim: { name: 'X', props: {} },
  lines: lines.map((t, i) => line(`${id}-0${i + 1}`, t)),
  beats: lines.map((_, i) => i),
  minSeconds: 20,
});

test('the draft has the article link, the chapters and the names per chapter', () => {
  const scenes = [scene('a', ['A note by Levent Alpöge.']), scene('b', ['In 1859 Bernhard Riemann wrote it.'], 'What was claimed'), scene('c', ['Then Lean said yes.'], 'Checked')];
  const d = youtubeDescriptionDraft(scenes, 'en', { articleUrl: 'https://example.com/a' });
  assert.match(d, /Full article, with every source: https:\/\/example\.com\/a/);
  assert.deepEqual(chapterLines(d), chapterLines(d).filter((l) => /^\d/.test(l)));
  assert.equal(chapterLines(d).length, 3);
  assert.match(d, /What was claimed\n<names heard here[^>]*Bernhard Riemann, 1859>/);
  assert.match(d, /Intro\n<names heard here[^>]*Levent Alpöge>/);
  assert.match(d, /More context/);
});

test('chapter lines are read from a finished description', () => {
  assert.deepEqual(chapterLines('Hook.\n\n0:00 Intro\n1:05 Two\n10:00 Ten\nnot 1:00\n'), ['0:00 Intro', '1:05 Two', '10:00 Ten']);
});
