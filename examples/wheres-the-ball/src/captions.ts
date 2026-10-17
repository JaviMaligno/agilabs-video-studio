// Caption cues for the burned-in captions (and, later, the SRT export).
// A cue is what is on screen at once: at most two rows of `maxChars` characters.
// No Remotion imports, so plain `node --test` can load it.
import { WORDS } from './audio.generated.ts';
import { spokenText, type Lang, type Line } from './types.ts';

/**
 * One written word with its time on screen, in scene seconds. `glued` marks a piece of a word too
 * long for a row (a URL, say) that continues the previous piece with no space in between.
 */
export type Token = { text: string; start: number; end: number; glued?: boolean };
export type Cue = { start: number; end: number; text: string; tokens: Token[] };

/** Short function words a cue should not end on: they read as part of what follows. */
export const GLUE = new Set(
  (
    'a an the of to in on at by for from with as and or but nor so if than that this these those ' +
    'is are was were be its our your their my his her we i you it not no ' +
    'el la los las lo un una unos unas de del al a y e o u ni en con por para sin sobre que su sus ' +
    'se le les es son era fue como mi tu nos no'
  ).split(' '),
);

const bare = (w: string) => w.toLowerCase().replace(/[^\p{L}]/gu, '');
const isGlue = (t: Token) => GLUE.has(bare(t.text));
/** A sentence ends here: a good place to start a new cue. */
const SENTENCE_END = /[.!?…:;]["')\]]*$/;

const textLen = (ts: Token[]) => ts.reduce((n, t, i) => n + t.text.length + (i > 0 && !t.glued ? 1 : 0), 0);

/** Tokens back to text: a space between words, none before a glued piece. */
export const joinTokens = (ts: Token[]) => ts.map((t, i) => (i > 0 && !t.glued ? ' ' : '') + t.text).join('');

/**
 * Breaks a word longer than `maxChars` into pieces that fit a row, cutting after `/`, `-`, `.`
 * or `_` when it can and anywhere when it cannot. The word's time is shared by length.
 */
const splitLong = (tok: Token, maxChars: number): Token[] => {
  if (tok.text.length <= maxChars) return [tok];
  const pieces: string[] = [];
  let rest = tok.text;
  while (rest.length > maxChars) {
    const head = rest.slice(0, maxChars);
    const cut = Math.max(head.lastIndexOf('/'), head.lastIndexOf('-'), head.lastIndexOf('.'), head.lastIndexOf('_'));
    const at = cut >= maxChars / 3 ? cut + 1 : maxChars;
    pieces.push(rest.slice(0, at));
    rest = rest.slice(at);
  }
  if (rest) pieces.push(rest);
  const span = tok.end - tok.start;
  let acc = 0;
  return pieces.map((text, i) => {
    const start = tok.start + (acc / tok.text.length) * span;
    acc += text.length;
    return { text, start, end: tok.start + (acc / tok.text.length) * span, ...(i > 0 ? { glued: true } : {}) };
  });
};

/**
 * The written words of a line, timed in scene seconds. When the line is subtitled in its own
 * voice, the TTS read the written text, and it returned one timestamp per written word, those
 * times are used as they are. Otherwise (numbers or symbols read out as several words, a spoken
 * form that differs from the caption, or a translation under another voice) the line's duration
 * is spread over the written words in proportion to their length.
 */
export const tokensOf = (line: Line, subs: Lang): Token[] => {
  const words = line.text[subs].split(/\s+/).filter(Boolean);
  const end = line.start + line.dur;
  // TTS timestamps belong to the spoken words: only usable when the caption is that same text.
  const ownText = subs === line.voice && spokenText(line, subs) === line.text[subs];
  const spoken = ownText ? WORDS[line.voice]?.[line.key] : undefined;
  if (spoken && spoken.length === words.length) {
    let prev = line.start;
    return words.map((text, i) => {
      const start = Math.min(end, Math.max(prev, line.start + spoken[i][1]));
      const stop = Math.min(end, Math.max(start, line.start + spoken[i][2]));
      prev = start;
      return { text, start, end: stop };
    });
  }
  // Weight = characters plus one for the space, so short words still get some time.
  const weights = words.map((w) => w.length + 1);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return words.map((text, i) => {
    const start = line.start + (acc / total) * line.dur;
    acc += weights[i];
    return { text, start, end: line.start + (acc / total) * line.dur };
  });
};

/** Greedy row filling (words longer than `maxChars` have already been split). */
const fillRows = (toks: Token[], maxChars: number): Token[][] => {
  const rows: Token[][] = [];
  let row: Token[] = [];
  for (const t of toks) {
    if (row.length && textLen([...row, t]) > maxChars) {
      rows.push(row);
      row = [];
    }
    row.push(t);
  }
  if (row.length) rows.push(row);
  return rows;
};

/**
 * Splits a line into cues of at most two rows of `maxChars` characters. A cue closes early at the
 * end of a sentence once it is half full, and never ends on a glue word (those move on to the
 * next cue). Cues tile the line: each ends where the next begins, the last at the line's end.
 */
export const cuesOf = (line: Line, subs: Lang, maxChars = 32): Cue[] => {
  const toks = tokensOf(line, subs).flatMap((t) => splitLong(t, maxChars));
  const groups: Token[][] = [];
  let cur: Token[] = [];
  const close = () => {
    const carry: Token[] = [];
    while (cur.length > 1 && isGlue(cur.at(-1)!)) carry.unshift(cur.pop()!);
    groups.push(cur);
    cur = carry;
  };
  toks.forEach((t, i) => {
    if (cur.length && fillRows([...cur, t], maxChars).length > 2) close();
    cur.push(t);
    const rest = toks.length - 1 - i;
    if (rest > 0 && SENTENCE_END.test(t.text) && textLen(cur) >= maxChars) close();
  });
  if (cur.length) groups.push(cur);
  // Carrying glue words forward can, rarely, make the next cue three rows; split it again.
  const fitted = groups.flatMap((g) => {
    const rows = fillRows(g, maxChars);
    if (rows.length <= 2) return [g];
    const out: Token[][] = [];
    for (let k = 0; k < rows.length; k += 2) out.push(rows.slice(k, k + 2).flat());
    return out;
  });
  const lineEnd = line.start + line.dur;
  return fitted.map((g, i) => ({
    start: i === 0 ? line.start : g[0].start,
    end: i + 1 < fitted.length ? fitted[i + 1][0].start : lineEnd,
    text: joinTokens(g),
    tokens: g,
  }));
};

/** All cues of a list of lines, in scene seconds. */
export const cuesOfLines = (lines: Line[], subs: Lang, maxChars = 32): Cue[] =>
  lines.flatMap((l) => cuesOf(l, subs, maxChars));

/**
 * Splits a cue into one or two rows for display: the most balanced break that keeps both rows
 * within `maxChars`, avoiding a first row that ends on a glue word.
 */
export const cueRows = (cue: Cue, maxChars = 32): string[] => cueRowTokens(cue, maxChars).map(joinTokens);

export const cueRowTokens = (cue: Cue, maxChars = 32): Token[][] => {
  const toks = cue.tokens;
  if (toks.length < 2 || textLen(toks) <= maxChars) return [toks];
  let best = 1;
  let bestScore = Infinity;
  for (let i = 1; i < toks.length; i++) {
    const a = textLen(toks.slice(0, i));
    const b = textLen(toks.slice(i));
    const over = Math.max(0, a - maxChars) + Math.max(0, b - maxChars);
    // Never break a row inside a split word if it can be helped; avoid ending row 1 on "the", "de"…
    const score = over * 100 + Math.abs(a - b) + (isGlue(toks[i - 1]) ? 8 : 0) + (toks[i].glued ? 20 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return [toks.slice(0, best), toks.slice(best)];
};
