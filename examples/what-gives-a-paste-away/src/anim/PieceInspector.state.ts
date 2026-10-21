// Pure state of the Act I scenes (what makes the model suspect a wrong-window paste). Each
// conversation is a jigsaw; a paste is a piece from another box. "Suspecting a mistake" is always
// the same gesture: the glove turns the piece over and holds it up to the light. Repainting the
// puzzle around the piece means no doubt. Illustrative visuals; the numbers come from the timeline
// (the article's figures). No Remotion or React here.
import type { Label } from '../types.ts';
import { frameState as quoteState } from './KeyQuote.state.ts';
import { easeIn, easeInOut, flashAt, lerp, turn, wobble } from './motion.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type PIMode = 'hook' | 'recap' | 'lift' | 'levels' | 'rule' | 'meters' | 'repaint' | 'quote' | 'verdict';

export type Meter = { value: number; display: string };

export type PIProps = {
  mode: PIMode;
  /** The user's message the contradiction clashes with. */
  user?: Label;
  /** Lines printed on the contradiction piece. */
  clash?: string[];
  /** Window title of the house-move chat. */
  title?: Label;
  strip?: Label;
  stamp?: { value: string; label?: Label };
  tally?: { value: string; label: Label };
  tag?: Label;
  /** levels / meters / verdict: label under each of the three slots. */
  slots?: [Label, Label, Label];
  /** levels: the handwriting on the back of piece 2, and the four kinds of tell. */
  note?: string[];
  tells?: [Label, Label, Label, Label];
  question?: Label;
  sub?: Label;
  chip?: Label;
  /** meters: the doubt rate of each slot (the third is stamped instead). */
  meters?: [Meter, Meter];
  ratio?: Label;
  p?: Label;
  quote?: { rows: [Label, Label]; emphasis?: string[] };
  verdict?: { no: Label; yes: Label; head?: Label };
  /** Picks up exactly where the previous scene stopped (no dip at the cut). */
  continues?: boolean;
};

const Z3 = () => [0, 0, 0];

export type PIState = {
  strip: { opacity: number };
  user: { opacity: number };
  /** Contradiction piece: 0 hovering, 1 seated in the hole. */
  seat: { progress: number };
  hover: number;
  glow: { opacity: number };
  flash: number;
  shake: number;
  repaint: { progress: number };
  brush: { opacity: number };
  stamp: { opacity: number; pop: number };
  tally: { opacity: number; pop: number };
  /** recap: the wall of 24 coming in; lift: the one piece lifted and turned. */
  wall: { appear: number; dim: number };
  lift: { progress: number; flip: number; tag: number };
  slots: { appear: number; drops: number[]; labels: number[]; flip2: number };
  tells: { appear: number[]; note: number; panel: number };
  clashLine: { draw: number };
  card: { pop: number };
  rule: { rise: number; flip: number; light: number; tag: number; sub: number };
  chip: { opacity: number };
  bars: { grow: number[]; ratio: number; p: number };
  quote: { rows: { words: { text: string; opacity: number; emphasis: boolean }[]; emphasis: number }[]; dim: number };
  verdict: { appear: number[]; stamps: number[] };
};

export function frameState(p: PIProps, t0: number, beats: number[], dur: number, lang: 'en' | 'es' = 'en'): PIState {
  const t = sceneTime(Number.isFinite(t0) ? t0 : 0, dur);
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.5;
  const b2 = beats.length > 2 ? beatAt(beats, 2) : b1 + 1.5;
  const at = (s: number, len: number) => progress(t, fit(s, len, D), len);

  const s: PIState = {
    strip: { opacity: at(0, 0.3) },
    user: { opacity: 0 },
    seat: { progress: 0 },
    hover: Math.sin(t * 4) * (t < 1e6 ? 1 : 0),
    glow: { opacity: 0 },
    flash: 0,
    shake: 0,
    repaint: { progress: 0 },
    brush: { opacity: 0 },
    stamp: { opacity: 0, pop: 0 },
    tally: { opacity: 0, pop: 0 },
    wall: { appear: 0, dim: 0 },
    lift: { progress: 0, flip: 1, tag: 0 },
    slots: { appear: 0, drops: Z3(), labels: Z3(), flip2: 1 },
    tells: { appear: [0, 0, 0, 0], note: 0, panel: 0 },
    clashLine: { draw: 0 },
    card: { pop: 0 },
    rule: { rise: 0, flip: 1, light: 0, tag: 0, sub: 0 },
    chip: { opacity: 0 },
    bars: { grow: [0, 0], ratio: 0, p: 0 },
    quote: { rows: [], dim: 0 },
    verdict: { appear: [0, 0], stamps: [0, 0] },
  };
  const stampAt = (start: number) => {
    const a = fit(start, 0.35, D);
    s.stamp = { opacity: progress(t, a, 0.12), pop: easeOutCubic(progress(t, a, 0.35)) };
    s.shake = Math.max(s.shake, 10 * wobble(t, a + 0.12, 0.35));
  };
  // Seat the contradiction piece at `start`, then repaint the puzzle with the brush.
  const seatAndRepaint = (seatAt: number, paintAt: number) => {
    const fall = fit(seatAt, 0.4, D);
    s.seat.progress = easeIn(progress(t, fall, 0.4));
    s.flash = Math.max(s.flash, flashAt(t, fall + 0.4, 0.4));
    s.shake = Math.max(s.shake, 9 * wobble(t, fall + 0.4, 0.35));
    const paint = fit(paintAt, 1.5, D);
    s.repaint.progress = easeInOut(progress(t, paint, 1.4));
    s.brush.opacity = progress(t, paint - 0.25, 0.25) * (1 - progress(t, paint + 1.45, 0.3));
  };

  switch (p.mode) {
    case 'hook': {
      s.user.opacity = at(0, 0.3);
      // Glaring: hovering, pulsing amber, until it drops in at the end of the first line.
      s.glow.opacity = clamp01(0.55 + 0.45 * Math.sin(t * 7)) * (1 - progress(t, b1 + 0.6, 0.6));
      seatAndRepaint(Math.max(1.2, b1 - 0.55), b1 + 0.35);
      stampAt(b1 + 1.75);
      break;
    }
    case 'repaint': {
      s.user.opacity = 1;
      s.glow.opacity = clamp01(0.5 + 0.4 * Math.sin(t * 7)) * (1 - progress(t, b0 + 0.6, 0.5));
      seatAndRepaint(b0 + 0.05, b0 + 0.5);
      const a = fit(b0 + 1.4, 0.45, D);
      s.tally = { opacity: progress(t, a, 0.25), pop: easeOutCubic(progress(t, a, 0.45)) };
      break;
    }
    case 'quote': {
      s.user.opacity = 1;
      s.seat.progress = 1;
      s.repaint.progress = 1;
      s.tally = { opacity: 1, pop: 1 };
      s.quote.dim = 0.965 * at(0, 0.5); // the puzzle stays a faint ghost: no label may read through the quote
      const rows = p.quote?.rows ?? ['', ''];
      s.quote.rows = rows.map((row, i) => {
        const q = quoteState({ text: row, emphasis: p.quote?.emphasis, beat: i }, t0, beats, dur, lang);
        return { words: q.words, emphasis: q.emphasis };
      });
      s.tells.note = at(0.2, 0.4); // the "my reading" tag
      break;
    }
    case 'recap': {
      s.wall.appear = easeOutCubic(at(0.05, 1.0));
      stampAt(b0 + 1.55);
      break;
    }
    case 'lift': {
      s.wall.appear = 1;
      s.stamp = { opacity: 1 - at(0, 0.4), pop: 1 };
      s.wall.dim = 0.65 * at(0, 0.5);
      s.lift.progress = easeInOut(at(0.15, 0.7));
      s.lift.flip = turn(t, fit(b0 + 0.9, 0.6, D), 0.6);
      s.lift.tag = at(b0 + 1.6, 0.35);
      break;
    }
    case 'levels': {
      s.slots.appear = easeOutCubic(at(0.05, 0.5));
      const d0 = fit(b0 + 1.0, 0.4, D);
      const d1 = fit(b1 + 0.15, 0.4, D);
      const d2 = fit(b2 + 0.2, 0.4, D);
      s.slots.drops = [d0, d1, d2].map((d) => easeIn(progress(t, d, 0.4)));
      s.slots.labels = [d0, d1, d2].map((d) => progress(t, d + 0.35, 0.3));
      s.flash = Math.max(...[d0, d1, d2].map((d) => flashAt(t, d + 0.4, 0.35)));
      s.slots.flip2 = turn(t, fit(b1 + 0.65, 0.5, D), 0.5);
      s.tells.note = at(b1 + 0.9, 0.35);
      s.tells.appear = [0, 1, 2, 3].map((i) => easeOutCubic(at(b1 + 1.25 + 0.32 * i, 0.3)));
      // The tells panel gives way to the contradiction panel on the third beat.
      s.tells.panel = at(b2, 0.35);
      s.user.opacity = at(b2 + 0.15, 0.3);
      s.clashLine.draw = easeInOut(at(b2 + 0.75, 0.6));
      break;
    }
    case 'rule': {
      s.card.pop = easeOutCubic(at(0.05, 0.45));
      s.rule.rise = easeInOut(at(b0 + 0.3, 0.6));
      s.rule.flip = turn(t, fit(b0 + 1.0, 0.6, D), 0.6);
      s.rule.light = easeOutCubic(at(b0 + 1.3, 0.6));
      s.rule.tag = at(b0 + 1.7, 0.3);
      s.rule.sub = at(b0 + 2.3, 0.35);
      s.chip.opacity = at(b0 + 2.6, 0.35);
      break;
    }
    case 'meters': {
      s.card.pop = 1;
      s.slots = { appear: 1, drops: [1, 1, 1], labels: [1, 1, 1], flip2: -1 };
      const g0 = fit(b0 + 0.2, 0.6, D);
      const g1 = fit(b0 + 0.9, 0.9, D);
      s.bars.grow = [easeOutCubic(progress(t, g0, 0.6)), easeOutCubic(progress(t, g1, 0.9))];
      s.bars.ratio = at(b0 + 1.9, 0.3);
      s.bars.p = at(b0 + 2.2, 0.3);
      stampAt(b1 + 1.0);
      break;
    }
    case 'verdict': {
      s.verdict.appear = [easeOutCubic(at(b0 + 0.1, 0.4)), easeOutCubic(at(b1 + 0.05, 0.4))];
      s.verdict.stamps = [easeOutCubic(at(b0 + 1.0, 0.3)), easeOutCubic(at(b1 + 1.1, 0.3))];
      s.card.pop = easeOutCubic(at(0, 0.4));
      break;
    }
  }
  return s;
}

/** Vertical offset (in cells) of a hovering piece that has `progress` of its drop done. */
export const hoverOffset = (progress01: number, bob: number): number => lerp(-1.25 + 0.04 * bob, 0, progress01);
