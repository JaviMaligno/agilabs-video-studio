// Pure state of the CipherCard scenes: one message card ("name the capital of france") whose
// glyphs morph between plaintext and the experiment's ciphers. Modes:
// - scramble: the mask goes on, the card flies at the two Claude chips and shatters on a wall;
// - ladder: the ten ciphers, one row each, popping in turn, with the oracle's "Paris ✓";
// - break: beat 0 a fast montage (GPT-5 cracks it on turn 1), beat 1 the keyed substitution
//   unmasking letter by letter over five turn ticks, most frequent cipher letters first;
// - rosetta: a tablet of plaintext <-> code pairs links to the card and unmasks it; 61% -> 83%.
// Visuals are illustrative; numbers on screen come from the article. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { byFrequency, clip, hash, histogram, morph, type CipherData, type Glyph } from './glyphs.ts';

export type CipherMode = 'scramble' | 'ladder' | 'break' | 'rosetta';

export type CipherProps = {
  mode: CipherMode;
  /** scramble: scene second the masked card hits the wall (fitted into the scene). */
  hitAt?: number;
};

/** Ten ladder rows, in the article's order, with their on-screen names. */
export const LADDER: { key: string; name: string }[] = [
  { key: 'rot13', name: 'ROT13' },
  { key: 'random_substitution', name: 'Keyed substitution' },
  { key: 'letters_to_digits', name: 'Letters → digits' },
  { key: 'morse', name: 'Morse' },
  { key: 'binary', name: 'Binary' },
  { key: 'base64', name: 'Base64' },
  { key: 'reverse_all', name: 'Reversal' },
  { key: 'block_permutation', name: 'Block permutation' },
  { key: 'cyrillic_homoglyph', name: 'Cyrillic homoglyphs' },
  { key: 'disemvowel', name: 'Disemvowel' },
];

/** Fast montage: only ciphers the turns figure gives GPT-5 a median of 1 (never base64). */
export const FAST: { key: string; name: string }[] = [
  { key: 'rot13', name: 'ROT13' },
  { key: 'morse', name: 'Morse' },
  { key: 'binary', name: 'Binary' },
  { key: 'disemvowel', name: 'Disemvowel' },
];

/** Characters a ladder / montage row shows before clipping with "…". */
export const ROW_MAX = 27;

export const KEYED = 'random_substitution';
export const TURNS = 5;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeIn = (p: number) => clamp01(p) ** 2;

export type Fragment = { ch: string; dx: number; dy: number; rot: number; opacity: number };

export type ScrambleState = {
  mode: 'scramble';
  glyphs: Glyph[];
  /** Card flight from its spot (0) to the wall (1). */
  fly: number;
  /** Card shrink while flying (1 = full size). */
  scale: number;
  /** Card body opacity (0 once shattered, back to 1 when the masked card returns). */
  opacity: number;
  /** The returned masked card (after the shatter). */
  back: number;
  wall: { appear: number; flash: number };
  fragments: Fragment[];
  chips: { appear: number; refused: number };
};

export type LadderState = {
  mode: 'ladder';
  header: { appear: number };
  rows: { name: string; text: string; pop: number; glyphs: Glyph[] | null }[];
  oracle: { pop: number };
};

export type BreakState = {
  mode: 'break';
  fast: { opacity: number; cards: { name: string; from: string; to: string; appear: number; crack: number; flash: number; badge: number }[] };
  slow: {
    appear: number;
    glyphs: { ch: string; settle: number; locked: boolean }[];
    /** Turn ticks done so far, 0..TURNS. */
    turn: number;
    tick: number;
    hist: { ch: string; grow: number; lit: number }[];
    snap: number;
    label: number;
  };
};

export type RosettaState = {
  mode: 'rosetta';
  tablet: { appear: number; rows: number[] };
  card: { appear: number };
  glyphs: { ch: string; settle: number }[];
  links: { row: number; col: number; slot: number; draw: number; opacity: number }[];
  counter: { appear: number; text: string; value: number };
};

export type CipherState = ScrambleState | LadderState | BreakState | RosettaState;

/** Same-length ciphers can morph glyph by glyph; the rest morph as whole strings. */
export const sameLength = (a: string, b: string) => [...a].length === [...b].length;

export function frameState(props: CipherProps, t0: number, beats: number[], dur: number, data: CipherData): CipherState {
  const t = sceneTime(t0, dur);
  const b0 = beatAt(beats, 0);
  const plain = data.plain;
  const keyed = data.ciphers[KEYED] ?? plain;

  if (props.mode === 'scramble') {
    // The scramble is already under way on the first frame (the hook must move at once).
    const scr = progress(t, -0.25, 1.15);
    const hit = fit(Number.isFinite(props.hitAt) ? (props.hitAt as number) : b0 + 1.6, 1.4, dur);
    const flyStart = Math.max(1.0, hit - 0.65);
    const fly = easeIn(progress(t, flyStart, hit - flyStart));
    const shatter = progress(t, hit, 0.9);
    const back = easeOutCubic(progress(t, hit + 0.75, 0.45));
    const glyphs = morph(plain, keyed, scr, t, 0.55, 1);
    const n = [...keyed].length;
    const fragments: Fragment[] = [...keyed].map((ch, i) => {
      const a = (hash(i, 7) - 0.5) * Math.PI * 0.9 - Math.PI / 2; // mostly upwards, back off the wall
      const sp = 260 + hash(i, 11) * 360;
      const s = easeOutCubic(shatter);
      return {
        ch: ch === ' ' ? '·' : ch,
        dx: (i - (n - 1) / 2) * 19 + Math.cos(a) * sp * s,
        dy: Math.sin(a) * sp * s + 220 * shatter * shatter,
        rot: (hash(i, 3) - 0.5) * 540 * s,
        opacity: t >= hit ? clamp01(1 - shatter) : 0,
      };
    });
    // After the shatter the masked card re-forms at its own spot (full size), not stuck on the wall.
    const at = t >= hit ? 0 : fly;
    return {
      mode: 'scramble',
      glyphs,
      fly: at,
      scale: lerp(1, 0.55, at),
      opacity: t < hit ? 1 : back,
      back,
      wall: { appear: easeOutCubic(progress(t, 0.15, 0.5)), flash: t >= hit ? clamp01(1 - progress(t, hit, 0.6)) : 0 },
      fragments,
      chips: { appear: easeOutCubic(progress(t, 0, 0.4)), refused: easeOutCubic(progress(t, hit + 0.15, 0.4)) },
    };
  }

  if (props.mode === 'ladder') {
    const start = Math.max(0, b0 + 0.1);
    const pop = 0.32;
    const room = Math.max(0.5, dur - 0.9 - start - pop);
    const sp = Math.min(0.34, room / (LADDER.length - 1 + 2));
    const rows = LADDER.map((r, i) => {
      const at = fit(start + 0.3 + i * sp, pop, dur);
      const p = easeOutCubic(progress(t, at, pop));
      const text = data.ciphers[r.key] ?? '';
      const same = sameLength(plain, text);
      return {
        name: r.name,
        text: clip(text, ROW_MAX),
        pop: p,
        glyphs: same ? morph(plain, text, progress(t, at, pop + 0.25), t, 0.5, 20 + i) : null,
      };
    });
    const oracleAt = fit(start + 0.3 + LADDER.length * sp + 0.1, 0.4, dur);
    return {
      mode: 'ladder',
      header: { appear: easeOutCubic(progress(t, start - 0.1, 0.35)) },
      rows,
      oracle: { pop: easeOutCubic(progress(t, oracleAt, 0.4)) },
    };
  }

  if (props.mode === 'break') {
    const raw1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3.6;
    const b1 = fit(raw1, 2.4, dur);
    const sp = Math.max(0.3, Math.min(0.62, (b1 - 0.6 - b0) / FAST.length));
    const cards = FAST.map((c, i) => {
      const at = fit(b0 + 0.05 + i * sp, 0.9, dur);
      const to = data.ciphers[c.key] ?? '';
      return {
        name: c.name,
        from: clip(to, ROW_MAX),
        to: plain,
        appear: easeOutCubic(progress(t, at, 0.3)),
        crack: progress(t, at + 0.35, 0.12),
        flash: clamp01(1 - Math.abs((t - (at + 0.41)) / 0.22)),
        badge: easeOutCubic(progress(t, at + 0.45, 0.3)),
      };
    });
    const fastOut = clamp01(1 - progress(t, b1 - 0.35, 0.35));
    // Five turn ticks between b1 and the last moment that still leaves the snap on screen.
    const tickEnd = Math.max(b1 + 0.5, Math.min(b1 + 4.2, dur - 1.0));
    const step = (tickEnd - b1) / TURNS;
    const turnF = clamp01((t - b1) / Math.max(0.01, tickEnd - b1)) * TURNS;
    const turn = t < b1 ? 0 : Math.min(TURNS, Math.floor(turnF + 1e-9) + 1);
    const tick = t < b1 ? 0 : clamp01(1 - (turnF - Math.floor(turnF)) * 2.5);
    // Tiers: cipher letters ranked by frequency, split over the five turns (most frequent first).
    const ranked = byFrequency(keyed);
    const tier = new Map(ranked.map((ch, i) => [ch, Math.min(TURNS - 1, Math.floor((i * TURNS) / ranked.length))]));
    const kChars = [...keyed];
    const pChars = [...plain];
    const glyphs = kChars.map((ch, i) => {
      if (ch === ' ') return { ch: ' ', settle: 1, locked: true };
      const lockAt = b1 + (tier.get(ch) ?? 0) * step + step * 0.55;
      const s = progress(t, lockAt, 0.25);
      const show = s >= 1 ? pChars[i] : s > 0 ? (hash(i, Math.floor(t * 16)) > 0.5 ? pChars[i] : ch) : ch;
      return { ch: show, settle: s, locked: s >= 1 };
    });
    const hist = histogram(keyed);
    const maxN = Math.max(1, ...hist.map((h) => h.n));
    return {
      mode: 'break',
      fast: { opacity: fastOut, cards },
      slow: {
        appear: easeOutCubic(progress(t, b1 - 0.3, 0.45)),
        glyphs,
        turn,
        tick,
        hist: hist.map((h, i) => {
          const done = glyphs.some((g, j) => kChars[j] === h.ch && g.locked);
          const flicker = t >= b1 ? 0.75 + 0.25 * hash(i, Math.floor(t * 10)) : 1;
          return { ch: h.ch, grow: clamp01((h.n / maxN) * flicker * progress(t, b1 - 0.2, 0.5)), lit: done ? 1 : 0 };
        }),
        snap: progress(t, tickEnd, 0.3),
        label: easeOutCubic(progress(t, tickEnd + 0.1, 0.4)),
      },
    };
  }

  // rosetta
  const start = Math.max(0, b0);
  const rows = data.rosetta.map((_, i) => easeOutCubic(progress(t, fit(start + 0.25 + i * 0.3, 0.35, dur), 0.35)));
  const kChars = [...keyed];
  const pChars = [...plain];
  // One link per distinct cipher letter of the card that the tablet also shows (first spot).
  const seen = new Set<string>();
  const linkSpecs: { row: number; col: number; slot: number; ch: string }[] = [];
  kChars.forEach((ch, slot) => {
    if (ch === ' ' || seen.has(ch)) return;
    for (let r = 0; r < data.rosetta.length; r++) {
      const col = [...data.rosetta[r][1]].indexOf(ch);
      if (col >= 0) {
        seen.add(ch);
        linkSpecs.push({ row: r, col, slot, ch });
        break;
      }
    }
  });
  const linkStart = start + 0.25 + data.rosetta.length * 0.3 + 0.2;
  const linkSp = 0.11;
  const linkLen = 0.45;
  const lockOf = new Map<string, number>();
  const links = linkSpecs.map((l, j) => {
    const at = fit(linkStart + j * linkSp, linkLen + 0.6, dur);
    lockOf.set(l.ch, at + linkLen);
    return {
      row: l.row,
      col: l.col,
      slot: l.slot,
      draw: easeOutCubic(progress(t, at, linkLen)),
      opacity: clamp01(1 - progress(t, at + linkLen + 0.5, 0.6)),
    };
  });
  const allAt = fit(linkStart + linkSpecs.length * linkSp + linkLen + 0.2, 0.4, dur);
  const glyphs = kChars.map((ch, i) => {
    if (ch === ' ') return { ch: ' ', settle: 1 };
    const at = Math.min(lockOf.get(ch) ?? allAt, allAt);
    const s = progress(t, at, 0.3);
    return { ch: s >= 0.6 ? pChars[i] : ch, settle: s };
  });
  const cAt = fit(allAt - 0.2, 1.1, dur);
  const cp = easeOutCubic(progress(t, cAt, 1.0));
  const value = Math.round(lerp(61, 83, cp));
  return {
    mode: 'rosetta',
    tablet: { appear: easeOutCubic(progress(t, start - 0.05, 0.4)), rows },
    card: { appear: easeOutCubic(progress(t, start, 0.4)) },
    glyphs,
    links,
    counter: { appear: easeOutCubic(progress(t, cAt - 0.3, 0.4)), text: `${value}%`, value },
  };
}
