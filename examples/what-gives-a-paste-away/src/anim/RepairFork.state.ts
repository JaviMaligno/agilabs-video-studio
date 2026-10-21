// Pure state of the Act II scenes (what happens after the user says "ignore it"). One
// conversation, its stray piece set aside on the table edge, forks into three identical tables
// that differ only in the user's next message. Leakage is the paste's names glowing amber in the
// model's next reply. Illustrative visuals; the numbers come from the timeline. No Remotion/React.
import type { Label } from '../types.ts';
import { frameState as quoteState } from './KeyQuote.state.ts';
import { easeInOut } from './motion.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type RFMode = 'teaser' | 'fork' | 'arms' | 'measure' | 'bars' | 'hold' | 'turns' | 'verdict';

export type Arm = { user: Label; value: number; display: string };

export type RFProps = {
  mode: RFMode;
  strip?: Label;
  /** The three arms, top to bottom: what the user types next and the leakage it got. */
  arms?: [Arm, Arm, Arm];
  /** arms mode: scene seconds at which each user bubble lands (keyed to the spoken words). */
  at?: [number, number, number];
  /** The pasted text on the stray piece; `names` are its distinctive entities. */
  paste?: { before: string; names: string; after: string };
  /** The leaking reply (arm b), split around the paste's names. */
  reply?: { before: string; names: string; after: string };
  question?: Label;
  entities?: [Label, Label, Label];
  chip?: Label;
  ratio?: Label;
  p1?: Label;
  drop?: Label;
  p2?: Label;
  quote?: { text: Label; emphasis?: string[] };
  turns?: { labels: [Label, Label, Label]; values: [string, string, string]; tag?: Label };
  verdict?: { no: Label; yes: Label; stamp: Label; also: Label };
  ghost?: Label;
  continues?: boolean;
};

const Z3 = () => [0, 0, 0];

export type RFState = {
  strip: { opacity: number };
  /** fork: 0 one conversation, 1 three tables. */
  fork: { progress: number };
  rows: { appear: number[] };
  user: { appear: number[] };
  reply: { typed: number[]; glow: number[] };
  bars: { grow: number[]; ratio: number; p1: number; drop: number; p2: number };
  card: { pop: number };
  piece: { glow: number; rise: number };
  tags: { appear: number[] };
  chip: { opacity: number };
  quote: { words: { text: string; opacity: number; emphasis: boolean }[]; emphasis: number };
  turns: { appear: number[]; echo: number; tag: number };
  verdict: { appear: number[]; strike: number; stamp: number };
  ghost: { opacity: number };
};

export function frameState(p: RFProps, t0: number, beats: number[], dur: number, lang: 'en' | 'es' = 'en'): RFState {
  const t = sceneTime(Number.isFinite(t0) ? t0 : 0, dur);
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.5;
  const b2 = beats.length > 2 ? beatAt(beats, 2) : b1 + 1.5;
  const at = (s: number, len: number) => progress(t, fit(s, len, D), len);
  const pulse = clamp01(0.6 + 0.4 * Math.sin(t * 6));

  const s: RFState = {
    strip: { opacity: at(0, 0.3) },
    fork: { progress: 0 },
    rows: { appear: [0, 0, 0] },
    user: { appear: Z3() },
    reply: { typed: Z3(), glow: Z3() },
    bars: { grow: Z3(), ratio: 0, p1: 0, drop: 0, p2: 0 },
    card: { pop: 0 },
    piece: { glow: 0, rise: 0 },
    tags: { appear: Z3() },
    chip: { opacity: 0 },
    quote: { words: [], emphasis: 0 },
    turns: { appear: Z3(), echo: 0, tag: 0 },
    verdict: { appear: [0, 0, 0], strike: 0, stamp: 0 },
    ghost: { opacity: 0 },
  };

  switch (p.mode) {
    case 'teaser': {
      s.rows.appear = [1, 1, 1];
      s.user.appear = [0, easeOutCubic(at(0.15, 0.3)), 0];
      s.reply.typed = [0, at(0.55, 0.8), 0];
      s.reply.glow = [0, at(1.2, 0.3) * pulse, 0];
      // The x6 shows for a moment and goes: it is paid off later.
      s.ghost.opacity = at(1.5, 0.2) * (1 - at(2.3, 0.4)) * (0.7 + 0.3 * Math.sin(t * 30));
      break;
    }
    case 'fork': {
      s.rows.appear = [1, 1, 1];
      s.fork.progress = easeInOut(at(b0 + 1.6, 0.9));
      break;
    }
    case 'arms': {
      s.strip.opacity = 1;
      s.rows.appear = [1, 1, 1];
      s.fork.progress = 1;
      const ats = p.at ?? [b0 + 0.1, b0 + 1.0, b0 + 2.0];
      s.user.appear = ats.map((a) => easeOutCubic(at(a, 0.3)));
      break;
    }
    case 'bars': {
      s.strip.opacity = 1;
      s.rows.appear = [1, 1, 1];
      s.fork.progress = 1;
      s.user.appear = [1, 1, 1];
      const starts = [b0 + 0.1, b1 + 0.1, b2 + 0.1];
      s.reply.typed = starts.map((a) => at(a, 0.7));
      s.reply.glow = [0, at(starts[1] + 0.6, 0.3) * pulse, 0];
      s.bars.grow = starts.map((a) => easeOutCubic(at(a + 0.3, 0.7)));
      s.bars.ratio = at(b1 + 1.9, 0.3);
      s.bars.p1 = at(b1 + 2.2, 0.3);
      s.bars.drop = at(b2 + 1.0, 0.35);
      s.bars.p2 = at(b2 + 1.3, 0.3);
      break;
    }
    case 'measure': {
      s.card.pop = easeOutCubic(at(0.05, 0.45));
      s.piece.rise = easeOutCubic(at(0.2, 0.5));
      s.piece.glow = at(b0 + 1.2, 0.4) * pulse;
      s.tags.appear = [0, 1, 2].map((i) => easeOutCubic(at(b0 + 1.3 + 0.3 * i, 0.3)));
      s.chip.opacity = at(b0 + 2.2, 0.4);
      break;
    }
    case 'hold': {
      s.piece.rise = easeInOut(at(0.05, 0.8));
      s.piece.glow = at(0.6, 0.4) * pulse;
      const q = quoteState({ text: p.quote?.text ?? '', emphasis: p.quote?.emphasis, beat: 0 }, t0, beats, dur, lang);
      s.quote = { words: q.words, emphasis: q.emphasis };
      break;
    }
    case 'turns': {
      s.user.appear = [0, at(0, 0.3), 0];
      s.turns.appear = [b0 + 0.3, b0 + 1.2, b0 + 1.9].map((a) => easeOutCubic(at(a, 0.35)));
      s.turns.echo = at(b0 + 0.6, 1.6);
      s.reply.glow = [at(b0 + 0.4, 0.3) * (1 - 0.55 * at(b0 + 1.4, 0.8)), 0, 0];
      s.turns.tag = at(b0 + 2.4, 0.35);
      break;
    }
    case 'verdict': {
      // Beats: "don't just say ignore it" · "say where to go instead" · "or simply carry on".
      s.verdict.appear = [easeOutCubic(at(b0 + 0.05, 0.35)), easeOutCubic(at(b1 + 0.05, 0.4)), easeOutCubic(at(b2 + 0.1, 0.4))];
      s.verdict.strike = easeOutCubic(at(b0 + 0.9, 0.35));
      s.verdict.stamp = easeOutCubic(at(b1 + 0.9, 0.35));
      break;
    }
  }
  return s;
}
