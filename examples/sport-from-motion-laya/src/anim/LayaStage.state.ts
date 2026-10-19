// Pure state of the LayaStage scenes (script v2.0, scenes 1-10): one fixed picture for the whole
// first half, so the viewer always reads the same three things in the same place:
// - the stage: the hook clip (basketball) as glowing dots;
// - the four sport options under it, each with a score bar (Laya's answer: one score per sport);
// - a lower panel that changes per scene: a big "?", last time's results, the LAYA chip, and the
//   training monitor (loss per epoch, a dashed "guessing" line).
// Flat on the line = guessing (the four bars level); falling = learning (dots teal, one bar grows).
// Illustrative visuals, chosen for impact; numbers on screen come from the article.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type LayaMode = 'task' | 'lasttime' | 'laya' | 'legend' | 'official' | 'tag' | 'control' | 'curves';

export type LayaProps = {
  mode: LayaMode;
  /** Video second the scene starts at (timeline.ts): the dots keep one clock across scenes. */
  clock?: number;
  /**
   * Scene seconds of spoken words the picture lands on (timeline.ts resolves them from the TTS
   * word timestamps). task: "four"; lasttime: "under", "most"; laya: "Laya", "same", "answers",
   * "gives"; legend: "guessing", "falls", "learning"; tag: "tagged", "meaningless", "gives";
   * control: "more", "did"; curves: "many", "sometimes", "end".
   */
  marks?: number[];
};

export type Series = 'CONTROL' | 'TAKEOFF' | 'LATE' | 'FLAT' | 'DEMO';
export type Curves = { CONTROL: number[]; TAKEOFF: number[]; LATE: number[]; FLAT: number[]; chance: number };

export const EPOCHS = 32;
/** Index of the hook clip's sport (basketball) among the four options. */
export const HOOK_SPORT = 1;
export const SPORTS = ['American football', 'Basketball', 'Handball', 'Soccer'] as const;
export const MODELS = ['GPT-5.6 Sol', 'GPT-5.6 Terra', 'Claude Opus 5.5', 'Claude Sonnet 5', 'Gemini 3.1 Pro'] as const;
/** Last time's results (article): best frontier model 47 %, the classifier 83 %. */
export const LAST = { frontier: 47, classifier: 83 } as const;
/** Illustrative guesses thrown at the options by the five frontier models (mostly wrong). */
export const GUESSES = [0, 3, 0, 1, 0] as const;
/** Laya's answer in scene "laya": a score per option (illustrative). */
export const DEMO_SCORES = [0.18, 0.41, 0.17, 0.24] as const;
/** Arbitrary codes the tag cycles through on "meaningless"; it settles on the article's M2. */
export const TAG_CODES = ['M2', 'Q7', 'K4', 'M2'] as const;
/** Where the curves leave the guessing line, as the article's figure alt text gives them. */
export const BREAKS = { TAKEOFF: 10, LATE: 22 } as const;

/** Demo trace for the legend (no data): flat on the guessing line to epoch 12, then it falls. */
export const DEMO: number[] = Array.from({ length: EPOCHS }, (_, i) => {
  const e = i + 1;
  const wobble = 0.012 * Math.sin(e * 1.7) + 0.008 * Math.cos(e * 3.1);
  return e <= 12 ? 1.386 + wobble : 1.386 - 0.95 * (1 - Math.exp(-(e - 12) / 6)) + 2.5 * wobble;
});

const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);

/** Piecewise-linear value through (time, value) knots, held flat outside them. */
export function knots(t: number, ks: [number, number][]): number {
  if (!ks.length) return 0;
  if (!(t > ks[0][0])) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t0, v0] = ks[i - 1];
    const [t1, v1] = ks[i];
    if (t <= t1) return t1 > t0 ? v0 + ((v1 - v0) * (t - t0)) / (t1 - t0) : v1;
  }
  return ks[ks.length - 1][1];
}

export type TraceState = {
  series: Series;
  /** Drawn up to this epoch (1..32; below 1 nothing is drawn). */
  upto: number;
  /** 0 = grey (on the line), 1 = teal (it broke away). */
  lit: number;
  /** 0..1 turn to rose (a flatline that never left). */
  rose: number;
  /** Amber control trace. */
  warm: number;
  opacity: number;
};

export type MarkerState = { epoch: number; text: string; opacity: number; tone: 'ok' | 'flat' | 'warm' | 'muted' };

const trace = (series: Series, upto: number, extra: Partial<TraceState> = {}): TraceState => ({
  series,
  upto: Math.max(0, Math.min(EPOCHS, fin(upto))),
  lit: 0,
  rose: 0,
  warm: 0,
  opacity: 1,
  ...extra,
});

/** Scores with `pick` raised to `share` and the rest sharing what is left; share 0.25 = level. */
export const scoresFor = (pick: number, share: number): number[] => {
  const s = Math.min(0.97, Math.max(0.25, fin(share, 0.25)));
  return [0, 1, 2, 3].map((k) => (k === pick ? s : (1 - s) / 3));
};

const LEVEL = [0.25, 0.25, 0.25, 0.25];

export function frameState(p: LayaProps, time: number, beats: number[], dur: number, data: Curves) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const raw = fin(time);
  const playT = Math.max(0, fin(p.clock ?? 0) + Math.min(Math.max(raw, 0), d));
  const mode = p.mode;
  const b0 = beatAt(beats, 0);
  const has = (i: number) => beats[i] !== undefined && Number.isFinite(beats[i]);
  const b1 = has(1) ? beats[1] : b0 + 0.5 * (d - b0);
  // End of the scene's last line (the scene tail is 0.8 s).
  const lineEnd = Math.max(b0 + 0.8, d - 0.8);
  /** Mark i (a spoken word), else a fraction of the way between `from` and the last line's end. */
  const mark = (i: number, from: number, frac: number) => {
    const m = p.marks?.[i];
    return m !== undefined && Number.isFinite(m) ? m : from + frac * Math.max(0.4, lineEnd - from);
  };
  const pulse = 0.5 + 0.5 * Math.sin((raw * 2 * Math.PI) / 1.2);

  // ---- defaults: the stage and the four options, bars hidden ----
  const stage = { dim: 1, lit: 0, ring: 0, tag: { pop: 0, code: 'M2', key: 0, opacity: 0 } };
  const options = [0, 1, 2, 3].map(() => ({ appear: 1, flash: 0, tone: 'none' as 'none' | 'ok' | 'bad', pick: 0 }));
  let scores = LEVEL;
  let bars = 0;
  /** The four bars pulse together (every sport, the same score). */
  let together = 0;
  const question = { opacity: 0, pulse };
  const last = { title: 0, chips: MODELS.map(() => 0), frontier: { opacity: 0, grow: 0 }, classifier: { opacity: 0, grow: 0 }, half: 0 };
  const laya = { stream: 0, scroll: 0, chip: 0, tag: 0, bubble: 0, cross: 0, arrow: 0 };
  const monitor = {
    opacity: 0,
    xMax: 12,
    traces: [] as TraceState[],
    markers: [] as MarkerState[],
    cut: { epoch: 4, opacity: 0, text: '' },
    power: 1,
    label: { text: '', opacity: 0 },
    result: 0,
    words: { guessing: 0, learning: 0 },
    legend: { tag: 0, dots: 0, tagDim: 1 },
  };

  if (mode === 'task') {
    // "Each dot is a player." rings one dot; "Which of four sports is this?" brings the options.
    stage.ring = progress(t, fit(b0 + 0.25, 0.3, d), 0.3) * (1 - progress(t, fit(b1 + 0.6, 0.4, d), 0.4));
    const fourAt = mark(0, b1, 0.45);
    options.forEach((o, k) => (o.appear = easeOutCubic(progress(t, fit(fourAt + 0.05 + k * 0.2, 0.35, d), 0.35))));
    question.opacity = 0.35 + 0.65 * progress(t, fit(b1 + 0.1, 0.4, d), 0.4);
  }

  if (mode === 'lasttime') {
    // Line 1: five frontier models throw guesses (mostly wrong); their best bar stops under half.
    // Line 2: the classifier: the options light up right, its bar goes well past half.
    last.title = progress(t, 0.15, 0.3);
    last.chips = MODELS.map((_, k) => progress(t, fit(b0 + 0.2 + k * 0.1, 0.25, d), 0.25));
    const underAt = mark(0, b0, 0.6);
    const mostAt = mark(1, b1, 0.75);
    last.frontier = { opacity: progress(t, fit(underAt - 0.5, 0.25, d), 0.25), grow: easeOutCubic(progress(t, fit(underAt - 0.3, 0.8, d), 0.8)) };
    last.half = progress(t, fit(underAt - 0.5, 0.25, d), 0.25);
    last.classifier = { opacity: progress(t, fit(b1 + 0.1, 0.25, d), 0.25), grow: easeOutCubic(progress(t, fit(mostAt - 0.3, 0.8, d), 0.8)) };
    const flash = (start: number) => {
      const x = (t - start) / 0.55;
      return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x);
    };
    const span = Math.max(0.8, b1 - 0.35 - (b0 + 0.5));
    GUESSES.forEach((g, k) => {
      const f = flash(b0 + 0.5 + (span * k) / GUESSES.length);
      if (f > options[g].flash) {
        options[g].flash = f;
        options[g].tone = g === HOOK_SPORT ? 'ok' : 'bad';
      }
    });
    // The classifier recognises every clip: each option flashes right in turn.
    [0, 1, 2, 3].forEach((k) => {
      const f = flash(b1 + 0.3 + k * 0.28);
      if (f > options[k].flash) {
        options[k].flash = f;
        options[k].tone = 'ok';
      }
    });
  }

  if (mode === 'laya') {
    // Line 1: the dots become text that streams into the LAYA chip. Line 2: no written answer
    // (crossed-out bubble); a score bar grows on every option.
    const layaAt = mark(0, b0, 0.3);
    const sameAt = mark(1, b0, 0.8);
    const answersAt = mark(2, b1, 0.3);
    const givesAt = mark(3, b1, 0.6);
    stage.dim = 1 - 0.45 * progress(t, fit(b0 + 0.3, 0.6, d), 0.6) * (1 - progress(t, fit(b1, 0.5, d), 0.5));
    laya.stream = progress(t, fit(b0 + 0.2, 0.4, d), 0.4) * (1 - progress(t, fit(b1 + 0.1, 0.5, d), 0.5));
    laya.scroll = Math.max(0, t - b0);
    laya.chip = easeOutCubic(progress(t, fit(layaAt - 0.1, 0.45, d), 0.45));
    laya.tag = progress(t, fit(sameAt, 0.35, d), 0.35);
    laya.bubble = progress(t, fit(b1 + 0.05, 0.3, d), 0.3);
    laya.cross = easeOutCubic(progress(t, fit(answersAt, 0.35, d), 0.35));
    laya.arrow = progress(t, fit(givesAt, 0.3, d), 0.3);
    bars = progress(t, fit(givesAt - 0.1, 0.3, d), 0.3);
    const grow = easeOutCubic(progress(t, fit(givesAt + 0.1, 0.9, d), 0.9));
    scores = DEMO_SCORES.map((v) => 0.02 + (v - 0.02) * grow);
    options[HOOK_SPORT].pick = progress(t, fit(givesAt + 0.9, 0.3, d), 0.3);
  }

  if (mode === 'legend') {
    // "This line tracks training." The monitor appears. "If it stays flat, it's guessing": the demo
    // trace runs flat on the dashed line, bars level. "If it falls, it's learning": it drops, the
    // dots turn teal and one bar grows.
    const gAt = mark(0, b1, 0.35);
    const fAt = mark(1, b1, 0.6);
    const lAt = mark(2, b1, 0.85);
    monitor.opacity = progress(t, 0.05, 0.4);
    monitor.xMax = EPOCHS;
    const upto = knots(t, [
      [b0 + 0.3, 1],
      [Math.max(b0 + 0.9, gAt), 12],
      [Math.max(b0 + 1.0, fAt - 0.05), 12.2],
      [Math.max(b0 + 1.6, lAt + 0.3), EPOCHS],
    ]);
    const lit = clamp01((upto - 13) / 4);
    monitor.traces = [trace('DEMO', upto, { lit })];
    monitor.words = { guessing: progress(t, fit(gAt - 0.1, 0.3, d), 0.3), learning: progress(t, fit(lAt - 0.1, 0.3, d), 0.3) };
    stage.lit = lit;
    bars = 1;
    scores = scoresFor(HOOK_SPORT, 0.25 + 0.5 * lit);
    options[HOOK_SPORT].pick = lit;
  }

  if (mode === 'official') {
    // "The official recipe stayed flat": epochs 1-4 on the line, then the run stops (4 epochs) and
    // the monitor dims; 23 % = chance. "Every sport got the same score": the bars pulse together.
    monitor.opacity = 1;
    const cutAt = fit(Math.max(b0 + 1.0, b1 - 0.4), 0.4, d);
    const upto = knots(t, [
      [0.15, 0.6],
      [cutAt, 4],
    ]);
    monitor.traces = [trace('FLAT', upto)];
    monitor.cut = { epoch: 4, opacity: progress(t, cutAt, 0.25), text: '4 epochs' };
    monitor.power = 1 - 0.5 * progress(t, cutAt + 0.15, 0.4);
    monitor.label = { text: 'official recipe', opacity: progress(t, 0.2, 0.3) };
    monitor.result = easeOutCubic(progress(t, fit(cutAt + 0.3, 0.4, d), 0.4));
    bars = 1;
    together = progress(t, fit(b1, 0.4, d), 0.4);
  }

  if (mode === 'tag') {
    // "Was the code broken?" The stopped run stays on the monitor. "I tagged each clip with a
    // meaningless label that gives away the answer.": a tag lands on the clip, cycles through
    // arbitrary codes on "meaningless", and its key appears on "gives away the answer".
    monitor.opacity = 1;
    const fade = 1 - progress(t, fit(b1 + 0.2, 0.5, d), 0.5);
    monitor.traces = [trace('FLAT', 4, { opacity: fade })];
    monitor.cut = { epoch: 4, opacity: fade, text: '4 epochs' };
    monitor.power = 1 - 0.5 * fade;
    monitor.label = { text: 'official recipe', opacity: fade };
    const taggedAt = mark(0, b1, 0.15);
    const meanAt = mark(1, b1, 0.5);
    const givesAt = mark(2, b1, 0.75);
    const step = Math.floor(clamp01((t - meanAt) / 0.9) * (TAG_CODES.length - 1) + 1e-9);
    stage.tag = {
      pop: easeOutCubic(progress(t, fit(taggedAt - 0.05, 0.35, d), 0.35)),
      code: t < meanAt ? 'M2' : TAG_CODES[Math.min(TAG_CODES.length - 1, Math.max(0, step))],
      key: progress(t, fit(givesAt, 0.3, d), 0.3),
      opacity: 1,
    };
    bars = 1;
  }

  if (mode === 'control') {
    // "Any working training learns that.": the amber control (tagged clips) runs to the old stop,
    // 72 % at 4 epochs. "With more epochs, it did.": it carries on and hits the floor; the right
    // option's bar grows. The dots trace is not drawn here.
    monitor.opacity = 1;
    const moreAt = mark(0, b1, 0.3);
    const didAt = mark(1, b1, 0.9);
    const at4 = Math.max(b0 + 0.9, b1 - 0.45);
    const upto = knots(t, [
      [b0 + 0.15, 1],
      [at4, 4],
      [Math.max(at4 + 0.1, moreAt), 4],
      [Math.max(at4 + 0.6, didAt), 11],
    ]);
    monitor.traces = [trace('CONTROL', upto, { warm: 1 })];
    monitor.cut = { epoch: 4, opacity: 0.55 * progress(t, fit(b0 + 0.2, 0.3, d), 0.3), text: '' };
    monitor.markers = [{ epoch: 4, text: '72% at 4', opacity: progress(t, fit(at4 - 0.1, 0.3, d), 0.3), tone: 'warm' }];
    monitor.legend = { tag: progress(t, 0.1, 0.3), dots: 0, tagDim: 1 };
    stage.tag = { pop: 1, code: 'M2', key: 1, opacity: 1 };
    const learn = upto <= 4 ? 0.45 * clamp01((upto - 1) / 3) : 0.45 + 0.55 * clamp01((upto - 4) / 4);
    bars = 1;
    scores = scoresFor(HOOK_SPORT, 0.25 + 0.68 * learn);
    options[HOOK_SPORT].pick = clamp01((upto - 7) / 1.5);
  }

  if (mode === 'curves') {
    // "The dots took longer": the tag comes off, the control dims, the monitor widens to 32 epochs.
    // "flat for many epochs": two dots runs sit on the line, then leave it at 10 and 22.
    // "sometimes to the end": a third stays flat all 32 epochs and turns rose.
    monitor.opacity = 1;
    stage.tag = { pop: 1, code: 'M2', key: 1, opacity: 1 - progress(t, 0.1, 0.4) };
    monitor.xMax = knots(t, [
      [0.2, 12],
      [1.0, EPOCHS],
    ]);
    const manyAt = mark(0, b0, 0.35);
    const someAt = mark(1, b0, 0.6);
    const endAt = mark(2, b0, 0.92);
    const s0 = Math.max(1.0, b0 + 0.2);
    const up1 = knots(t, [
      [s0, 1],
      [Math.max(s0 + 0.4, manyAt + 0.2), BREAKS.TAKEOFF],
      [Math.max(s0 + 0.9, someAt - 0.1), EPOCHS],
    ]);
    const up2 = knots(t, [
      [Math.max(s0 + 0.2, manyAt - 0.2), 1],
      [Math.max(s0 + 0.6, someAt + 0.25), BREAKS.LATE],
      [Math.max(s0 + 1.0, endAt - 0.2), EPOCHS],
    ]);
    const up3 = knots(t, [
      [Math.max(s0 + 0.4, someAt - 0.2), 1],
      [Math.max(s0 + 1.2, endAt), EPOCHS],
    ]);
    const lit1 = clamp01((up1 - BREAKS.TAKEOFF) / 2);
    const lit2 = clamp01((up2 - BREAKS.LATE) / 2);
    monitor.traces = [
      trace('CONTROL', 11, { warm: 1, opacity: 1 - 0.75 * progress(t, 0.1, 0.5) }),
      trace('TAKEOFF', up1, { lit: lit1 }),
      trace('LATE', up2, { lit: lit2, opacity: progress(t, Math.max(s0 + 0.2, manyAt - 0.2), 0.2) }),
      trace('FLAT', up3, { rose: progress(t, fit(Math.max(s0 + 1.2, endAt), 0.4, d), 0.4), opacity: progress(t, Math.max(s0 + 0.4, someAt - 0.2), 0.2) }),
    ];
    monitor.markers = [
      { epoch: 10, text: '10', opacity: clamp01((up1 - 9.6) / 0.6), tone: 'ok' },
      { epoch: 22, text: '22', opacity: clamp01((up2 - 21.6) / 0.6), tone: 'ok' },
      { epoch: 32, text: '32', opacity: clamp01((up3 - 31.5) / 0.5), tone: 'flat' },
    ];
    monitor.legend = { tag: 1, dots: progress(t, fit(s0 - 0.2, 0.3, d), 0.3), tagDim: 1 - 0.75 * progress(t, 0.1, 0.5) };
    stage.lit = Math.max(lit1, lit2) * (1 - 0.6 * progress(t, fit(Math.max(s0 + 1.2, endAt), 0.4, d), 0.4));
    bars = 1;
    // The control's answer fades back to level; the dots only nudge the right option up.
    const back = 1 - progress(t, 0.1, 0.6);
    scores = scoresFor(HOOK_SPORT, 0.25 + 0.68 * back + 0.25 * stage.lit * (1 - back));
    options[HOOK_SPORT].pick = back;
  }

  return { mode, playT, stage, options, scores, bars, together, question, last, laya, monitor };
}
