// Pure state of the judge bench: three judge seats across the top, blind answer cards whose text is
// tinted in the author's colour (the "house style"), stamps, a balance scale, podiums and coins.
// Coordinates are stage pixels (960 x 1090). No Remotion or React here.
import { easeOutCubic } from './steps.ts';
import { COL_X, FAMS, KAPPA, RANK, SCORE, clock, easeInOut, lerp, mark, stepOf, type Fam } from './judges.ts';

export type JBMode = 'hook' | 'question' | 'generate' | 'blind' | 'tint' | 'contestant' | 'coins' | 'participant';
export type JudgeBenchProps = { mode: JBMode; marks?: number[] };

export type SeatS = { fam: Fam; x: number; y: number; appear: number; glow: number; dim: number; clip: number };
export type CardKind = 'text' | 'code' | 'msg' | 'row';
export type CardS = {
  key: string;
  author: Fam;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  appear: number;
  /** How much the text lines carry the author's colour (0 grey .. 1 full tint). */
  tint: number;
  /** Name strip blacked out (0 shows the author's name, 1 "████"). */
  blind: number;
  glow: number;
  /** Card → solid podium token (0..1). */
  token: number;
  /** Horizontal flip-in (0 edge-on .. 1 facing). */
  flip: number;
  kind: CardKind;
};
export type StampS = { x: number; y: number; r: number; fam: Fam; pop: number; opacity: number; spin: number; coin: number };
export type PodiumS = { judge: Fam; x: number; baseY: number; k: number; rise: number; steps: { fam: Fam; dx: number; score: number }[] };
export type LabelS = {
  text: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  tone: 'muted' | 'text' | 'grad' | 'accent' | 'warm' | Fam;
  weight: number;
  anchor: 'start' | 'middle' | 'end';
};
export type PanItem = { label: string; fam: Fam; kind: 'box' | CardKind; appear: number; glow: number };
export type ScaleS = { cx: number; pivotY: number; half: number; hang: number; baseY: number; tilt: number; appear: number; left: PanItem | null; right: PanItem | null };
export type BigStampS = { text: string; x: number; y: number; pop: number; rot: number };
export type LinkS = { x1: number; y1: number; x2: number; y2: number; fam: Fam; draw: number };
export type StripS = { y: number; appear: number; labels: number[] };
export type KappaS = { a: Fam; b: Fam; k: string; y: number; pop: number };

export type JBState = {
  seats: SeatS[];
  cards: CardS[];
  stamps: StampS[];
  podiums: PodiumS[];
  labels: LabelS[];
  scale: ScaleS | null;
  bigStamp: BigStampS | null;
  links: LinkS[];
  strip: StripS | null;
  kappas: KappaS[];
  /** Pulsing "?" marks between podiums (hook). */
  queries: { x: number; y: number; opacity: number; s: number }[];
  /** Big counter (blind): value shown and its fade. */
  counter: { value: number; opacity: number } | null;
};

const SEAT_Y = 196;
const empty = (): JBState => ({ seats: [], cards: [], stamps: [], podiums: [], labels: [], scale: null, bigStamp: null, links: [], strip: null, kappas: [], queries: [], counter: null });
const seat = (i: number, appear: number, extra: Partial<SeatS> = {}): SeatS => ({ fam: FAMS[i], x: COL_X[i], y: SEAT_Y, appear, glow: 0, dim: 0, clip: 1, ...extra });
const label = (text: string, x: number, y: number, size: number, opacity: number, tone: LabelS['tone'] = 'muted', weight = 600, anchor: LabelS['anchor'] = 'middle'): LabelS => ({
  text,
  x,
  y,
  size,
  opacity,
  tone,
  weight,
  anchor,
});
const card = (c: Partial<CardS> & Pick<CardS, 'key' | 'author' | 'x' | 'y' | 'w' | 'h'>): CardS => ({
  rot: 0,
  appear: 1,
  tint: 0,
  blind: 1,
  glow: 0,
  token: 0,
  flip: 1,
  kind: 'text',
  ...c,
});

export function frameState(props: JudgeBenchProps, t: number, beats: number[], dur: number): JBState {
  const { T, p } = clock(t, dur);
  const m = (i: number, fb = 0) => mark(props.marks, i, beats, fb);
  const s = empty();
  switch (props.mode) {
    case 'hook': {
      // Three judges, the same three blind cards under each; then three podiums, three orders.
      const t1 = m(0, 2.2);
      s.labels.push(label('SAME BLIND ANSWERS', 480, 70, 34, p(0.25, 0.4), 'muted', 700));
      FAMS.forEach((j, i) => {
        s.seats.push(seat(i, easeOutCubic(p(0.02 + i * 0.08, 0.35)), { clip: 1 }));
        const rise = easeOutCubic(p(t1 + i * 0.12, 0.6));
        s.podiums.push({ judge: j, x: COL_X[i], baseY: 1010, k: 4.4, rise, steps: RANK[j].map((f) => ({ fam: f, dx: stepOf(j, f).dx, score: SCORE[j][f] })) });
        FAMS.forEach((a, k) => {
          const st = stepOf(j, a);
          const move = easeInOut(p(t1 + 0.2 + i * 0.12 + k * 0.08, 0.7));
          const endY = 1010 - st.score * 4.4 - 34;
          s.cards.push(
            card({
              key: `${j}-${a}`,
              author: a,
              x: lerp(COL_X[i] + (k - 1) * 50, COL_X[i] + st.dx, move),
              y: lerp(500 + Math.abs(k - 1) * 14, endY, move) - Math.sin(Math.PI * move) * 60,
              w: lerp(184, 94, move),
              h: lerp(250, 54, move),
              rot: lerp((k - 1) * 9, 0, move),
              appear: easeOutCubic(p(0.15 + i * 0.08 + k * 0.05, 0.35)),
              token: move,
            }),
          );
        });
      });
      const q = p(t1 + 1.1, 0.35);
      for (const x of [320, 640]) s.queries.push({ x, y: 690, opacity: q, s: 1 + 0.1 * Math.sin(Math.min(T, 1e4) * 5) * q });
      return s;
    }
    case 'question': {
      // A GPT judge between a GPT system and a Claude system.
      const left = easeOutCubic(p(m(0, 1.2), 0.45));
      const right = easeOutCubic(p(m(1, 2.2), 0.45));
      s.seats.push({ ...seat(0, easeOutCubic(p(0.1, 0.4))), x: 480 });
      const wob = Math.min(left, right);
      s.scale = {
        cx: 480,
        pivotY: 400,
        half: 300,
        hang: 220,
        baseY: 990,
        tilt: 3 * Math.sin(Math.min(T, 1e4) * 2.6) * wob,
        appear: easeOutCubic(p(0.25, 0.5)),
        left: { label: 'GPT system', fam: 'gpt', kind: 'box', appear: left, glow: 0 },
        right: { label: 'Claude system', fam: 'claude', kind: 'box', appear: right, glow: 0 },
      };
      return s;
    }
    case 'generate': {
      // Three authors write fifteen answers each; the task strip from objective to subjective.
      const tf = m(0, 1.0);
      const tc = m(1, 2.0);
      const tt = m(2, 3.4);
      FAMS.forEach((a, i) => {
        s.seats.push(seat(i, easeOutCubic(p(0.05 + i * 0.1, 0.35)), { clip: 0 }));
        for (let r = 0; r < 15; r++) {
          s.cards.push(
            card({
              key: `${a}-${r}`,
              author: a,
              x: COL_X[i],
              y: 296 + r * 36 + Math.floor(r / 5) * 18,
              w: 220,
              h: 27,
              appear: easeOutCubic(p(Math.max(0.35, tf - 1.5) + r * 0.09 + i * 0.05, 0.25)),
              tint: 1,
              blind: 0,
              kind: 'row',
            }),
          );
        }
      });
      const strip = p(tc - 0.15, 0.4);
      s.strip = { y: 940, appear: strip, labels: [p(tc, 0.35), p(tc + 0.45, 0.35), p(tt - 0.05, 0.35)] };
      s.labels.push(label('Claude seat: Sonnet 4.6, a generation behind the other two', 480, 1074, 28, p(tc + 0.5, 0.4), 'muted', 500));
      return s;
    }
    case 'blind': {
      // Each judge: one pair, names blacked out, a verdict, the same pair swapped, a second verdict.
      const [tj, tb, t2, ts] = [m(0, 0.4), m(1, 1.6), m(2, 2.4), m(3, 3.4)];
      const pairs: Fam[][] = [
        ['grok', 'claude'],
        ['gpt', 'claude'],
        ['gpt', 'grok'],
      ];
      const winner = [1, 0, 0];
      const blind = easeOutCubic(p(tb, 0.35));
      const swap = easeInOut(p(ts, 0.7));
      FAMS.forEach((j, i) => {
        s.seats.push(seat(i, 1, { clip: easeOutCubic(p(tj, 0.35)) }));
        const slots = [COL_X[i] - 70, COL_X[i] + 70];
        pairs[i].forEach((a, k) => {
          const from = slots[k];
          const to = slots[1 - k];
          s.cards.push(
            card({
              key: `${j}-${a}`,
              author: a,
              x: lerp(from, to, swap),
              y: 432 + (k === 0 ? -1 : 1) * Math.sin(Math.PI * swap) * 50,
              w: 128,
              h: 176,
              appear: easeOutCubic(p(0.1 + i * 0.1 + k * 0.06, 0.4)),
              tint: 0.85 * (1 - blind),
              blind,
            }),
          );
        });
        const w = winner[i];
        const pop1 = easeOutCubic(p(t2 + i * 0.1, 0.3));
        const xw1 = slots[w];
        const xw2 = slots[1 - w];
        s.stamps.push({ x: xw1, y: 470, r: 34, fam: j, pop: pop1, opacity: pop1 * (1 - Math.min(1, swap * 3)), spin: 1, coin: 0 });
        const pop2 = easeOutCubic(p(ts + 0.75 + i * 0.1, 0.3));
        s.stamps.push({ x: xw2, y: 470, r: 34, fam: j, pop: pop2, opacity: pop2, spin: 1, coin: 0 });
        s.labels.push(label('A', slots[0], 560, 30, p(0.4, 0.3), 'muted', 700), label('B', slots[1], 560, 30, p(0.4, 0.3), 'muted', 700));
      });
      s.labels.push(label('blind', 480, 655, 40, p(tb, 0.35), 'text', 800));
      s.labels.push(label('every pair · both orders', 480, 712, 36, p(t2, 0.35), 'muted', 600));
      const cnt = p(tj, Math.max(0.6, dur - 1.0 - tj));
      s.counter = { value: Math.round(45 * easeOutCubic(cnt)), opacity: p(tj, 0.3) };
      return s;
    }
    case 'tint': {
      // No names, but every author's text carries its colour.
      const tn = m(0, 0.2);
      const th = m(1, 2.0);
      const tint = easeOutCubic(p(th - 0.1, 0.7));
      FAMS.forEach((a, i) => {
        s.seats.push(seat(i, 1, { dim: 0.6 }));
        s.cards.push(card({ key: a, author: a, x: COL_X[i], y: 520, w: 272, h: 400, appear: easeOutCubic(p(0.05 + i * 0.1, 0.4)), tint, blind: 1 }));
      });
      const names = p(tn, 0.3) * (1 - p(th - 0.2, 0.3));
      s.labels.push(label('no names', 480, 830, 64, names, 'muted', 800));
      s.labels.push(label('house style', 480, 830, 76, p(th, 0.35), 'grad', 800));
      return s;
    }
    case 'contestant': {
      // Each judge finds its own card among the contestants.
      const tc = m(0, 1.0);
      const to = m(1, 2.2);
      const pairs: Fam[][] = [
        ['gpt', 'claude'],
        ['grok', 'gpt'],
        ['claude', 'grok'],
      ];
      const glow = easeOutCubic(p(to, 0.45));
      FAMS.forEach((j, i) => {
        s.seats.push(seat(i, 1, { glow }));
        const slots = [COL_X[i] - 70, COL_X[i] + 70];
        pairs[i].forEach((a, k) =>
          s.cards.push(
            card({
              key: `${j}-${a}`,
              author: a,
              x: slots[k],
              y: 432,
              w: 128,
              h: 176,
              appear: k === 0 ? easeOutCubic(p(0.15 + i * 0.12, 0.3)) : 1,
              flip: k === 0 ? easeOutCubic(p(0.15 + i * 0.12, 0.45)) : 1,
              tint: 0.85,
              blind: 1,
              glow: k === 0 ? glow : 0,
            }),
          ),
        );
        s.links.push({ x1: COL_X[i], y1: SEAT_Y + 50, x2: slots[0], y2: 432 - 92, fam: j, draw: glow });
      });
      s.bigStamp = { text: 'JUDGE = CONTESTANT', x: 480, y: 740, pop: easeOutCubic(p(tc - 0.05, 0.35)), rot: -6 };
      s.labels.push(label('its own work, blind', 480, 900, 40, p(to + 0.2, 0.4), 'muted', 600));
      return s;
    }
    case 'coins': {
      // The three judges stamp the same subjective pair, on different cards; the stamps become coins.
      const ta = m(0, 1.0);
      const tk = m(1, 2.2);
      s.cards.push(card({ key: 'a', author: 'gpt', x: 320, y: 420, w: 236, h: 170, tint: 0.85, kind: 'msg' }));
      s.cards.push(card({ key: 'b', author: 'claude', x: 640, y: 420, w: 236, h: 170, tint: 0.85, kind: 'msg' }));
      s.labels.push(label('A', 320, 540, 30, 1, 'muted', 700), label('B', 640, 540, 30, 1, 'muted', 700));
      // GPT and Claude each stamp their own card (the bias just shown); Grok sides with A.
      const target = [0, 0, 1];
      FAMS.forEach((j, i) => {
        s.seats.push(seat(i, 1));
        const pop = easeOutCubic(p(0.1 + i * 0.25, 0.3));
        const fly = easeInOut(p(ta + i * 0.12, 0.6));
        const cx = target[i] === 0 ? 320 : 640;
        const ox = (i - 1) * 34;
        const arrive = ta + i * 0.12 + 0.6;
        const spinLen = 1.6;
        const ph = Math.min(Math.max(0, T - arrive), spinLen) * 2.5;
        s.stamps.push({ x: lerp(cx + ox, COL_X[i], fly), y: lerp(445, 668, fly), r: lerp(28, 46, fly), fam: j, pop, opacity: pop, spin: Math.cos(2 * Math.PI * ph), coin: fly });
      });
      KAPPA.forEach((k, i) => s.kappas.push({ ...k, y: 800 + i * 76, pop: easeOutCubic(p(tk - 0.1 + i * 0.15, 0.35)) }));
      s.labels.push(label('0 = chance', 480, 1060, 32, p(tk + 0.5, 0.4), 'warm', 700));
      return s;
    }
    case 'participant': {
      // One judge, its scale tipped towards its own glowing card.
      const tip = easeInOut(p(0.6, 1.0));
      s.seats.push({ ...seat(0, easeOutCubic(p(0.05, 0.4))), x: 480, y: 470, glow: tip });
      s.scale = {
        cx: 480,
        pivotY: 600,
        half: 290,
        hang: 180,
        baseY: 1070,
        tilt: 15 * tip,
        appear: easeOutCubic(p(0.1, 0.4)),
        left: { label: '', fam: 'gpt', kind: 'msg', appear: 1, glow: tip },
        right: { label: '', fam: 'grok', kind: 'msg', appear: 1, glow: 0 },
      };
      return s;
    }
  }
  return s;
}
