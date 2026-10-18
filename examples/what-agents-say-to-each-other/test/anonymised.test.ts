// Act III quotes real work, anonymised. No identifier from the article's Part III may reach the
// screen or the captions: scan the timeline text and every component source for them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { TIMELINE } from '../src/timeline.ts';

const FORBIDDEN = [
  /plane/i,
  /google/i,
  /\bchat\b(?!-app)/, // "Google Chat"; the generic "chat-app" / "the chat app" is the substitute
  /\b401\b/,
  /\bHTTP\b/,
  /\baud\b/,
  /MalformedError/,
  /f10f8740/i,
  /c271/i,
  /\bkid\b/,
  /\btst\b/,
  /tunnel/i,
  /sub-dialog/i,
  /compound/i,
  /pod log/i,
  /36\.1/,
  /TICKET-/i,
  /claude/i,
];

const texts = (): string[] => {
  const out: string[] = [];
  for (const s of TIMELINE) for (const l of s.lines) out.push(l.text.en, l.spoken?.en ?? '');
  for (const f of readdirSync(new URL('../src/anim/', import.meta.url))) {
    if (!/^(SessionPanes|RegistryShelf|pieces)\./.test(f)) continue;
    // Strings only (quoted literals and JSX text), not comments.
    const src = readFileSync(new URL(`../src/anim/${f}`, import.meta.url), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    out.push(src);
  }
  return out;
};

test('no un-anonymised identifier from Part III appears on screen or in captions', () => {
  for (const text of texts()) for (const re of FORBIDDEN) assert.ok(!re.test(text), `found ${re} in: ${text.slice(0, 80)}…`);
});
