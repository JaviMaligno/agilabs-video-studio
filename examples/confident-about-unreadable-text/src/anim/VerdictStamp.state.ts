// Pure state of the VerdictStamp scenes, the video's central metaphor: an inspector that cannot
// read a card stamps it anyway. Modes:
// - filter: the base64 card slides into the content filter and gets a `self-harm · medium` stamp
//   (beat 0); it unmasks under the stamp into "reply with the single word banana" (beat 1); a
//   grey "unknown" stamp hovers and fades unused, the filter panel slides in (beat 2).
// - lineup: three inspectors (filter, LLM judge, base model), one stamp each, then the line.
// - judge: sealed requests stream through the judge and get stamped (beat 0); the previous
//   post's claim appears and is struck through (beat 1).
// - hollow: the three stamped cards; the ink drains out of each stamp, the outline stays.
// Illustrative visuals; every label on screen is quoted from the article. No Remotion or React.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { NO_SLAM, beatOr, pulse, slam, type Slam } from './stamp.ts';

export type VerdictMode = 'filter' | 'lineup' | 'judge' | 'hollow';

export type VerdictProps = {
  mode: VerdictMode;
  /** filter: scene second the stamp lands (on "medium self-harm"); fitted into the scene. */
  stampAt?: number;
};

export type FilterState = {
  mode: 'filter';
  /** Card slide from the top (0) to the gate (1), and its shudder on the hit. */
  card: { slide: number; shake: number };
  gate: { appear: number; flash: number };
  window: { appear: number };
  stamp: Slam & { pulse: number };
  http: { pop: number };
  /** 0..1 morph of the card from base64 to the decoded plain text. */
  reveal: number;
  banana: { pop: number };
  ghost: { appear: number; opacity: number };
  panel: { appear: number };
  chip: { appear: number };
};

export type LineupState = {
  mode: 'lineup';
  stations: { appear: number; stamp: Slam }[];
  head: { pop: number };
};

export type JudgeItem = { fly: number; out: number; stamp: Slam; opacity: number; label: number };

export type JudgeState = {
  mode: 'judge';
  thumb: { appear: number };
  judge: { appear: number; press: number };
  items: JudgeItem[];
  stream: { opacity: number };
  claim: { appear: number; strike: number; tag: number };
};

export type HollowState = {
  mode: 'hollow';
  cards: { appear: number; fill: number }[];
  head: { form: number; none: number };
};

export type VerdictState = FilterState | LineupState | JudgeState | HollowState;

/** Stamp labels cycled by the judge stream (illustrative). */
export const JUDGE_LABELS = ['REFUSED', 'GARBLED', 'COMPLIED', 'GARBLED'] as const;
export const STREAM_N = 4;

export function frameState(props: VerdictProps, t0: number, beats: number[], dur: number): VerdictState {
  const t = sceneTime(t0, dur);
  const b0 = beatOr(beats, 0, 0);

  if (props.mode === 'filter') {
    const stampAt = fit(Number.isFinite(props.stampAt) ? (props.stampAt as number) : b0 + 1.8, 0.6, dur);
    const hit = Math.max(0.3, stampAt - 0.35);
    // The card is moving from the first frame (the hook must move at once).
    const slide = easeInOut(progress(t, -0.1, hit + 0.1));
    const b1 = fit(beatOr(beats, 1, stampAt + 2.2), 1.6, dur);
    const b2 = fit(beatOr(beats, 2, b1 + 3.2), 1.8, dur);
    const s = t >= stampAt ? slam(t, stampAt) : NO_SLAM;
    const ghostIn = easeOutCubic(progress(t, b2 + 0.05, 0.3));
    return {
      mode: 'filter',
      card: { slide, shake: s.shake + (t >= hit ? Math.sin(progress(t, hit, 0.3) * 20) * (1 - progress(t, hit, 0.3)) * 0.5 : 0) },
      gate: { appear: easeOutCubic(progress(t, 0, 0.35)), flash: t >= hit ? clamp01(1 - progress(t, hit, 0.5)) : 0 },
      window: { appear: easeOutCubic(progress(t, hit + 0.1, 0.4)) },
      stamp: { ...s, pulse: pulse(t, b2 + 1.5, 0.3) },
      http: { pop: easeOutCubic(progress(t, stampAt + 0.3, 0.3)) },
      reveal: progress(t, b1 + 0.1, 1.1),
      banana: { pop: easeOutCubic(progress(t, b1 + 1.1, 0.35)) },
      ghost: { appear: ghostIn, opacity: ghostIn * clamp01(1 - progress(t, b2 + 1.3, 0.5)) },
      panel: { appear: easeOutCubic(progress(t, b2 + 1.6, 0.45)) },
      chip: { appear: easeOutCubic(progress(t, 0.1, 0.4)) },
    };
  }

  if (props.mode === 'lineup') {
    const stations = [0, 1, 2].map((i) => {
      const at = fit(b0 + 0.6 + i * 0.75, 0.6, dur);
      return { appear: easeOutCubic(progress(t, b0 - 0.2 + i * 0.12, 0.35)), stamp: t >= at ? slam(t, at) : NO_SLAM };
    });
    const headAt = fit(b0 + 0.6 + 3 * 0.75, 0.45, dur);
    return { mode: 'lineup', stations, head: { pop: easeOutCubic(progress(t, headAt, 0.45)) } };
  }

  if (props.mode === 'judge') {
    const b1 = fit(beatOr(beats, 1, b0 + 5), 2.2, dur);
    const sp = Math.max(0.7, Math.min(1.1, (b1 - b0 - 1.4) / STREAM_N));
    const items: JudgeItem[] = Array.from({ length: STREAM_N }, (_, k) => {
      const at = b0 + 0.3 + k * sp;
      const stampAt = at + 0.85;
      return {
        fly: easeInOut(progress(t, at, 0.45)),
        out: easeOutCubic(progress(t, at + 0.45, 0.35)),
        stamp: t >= stampAt ? slam(t, stampAt) : NO_SLAM,
        opacity: t >= at ? clamp01(1 - progress(t, stampAt + 0.55, 0.3)) : 0,
        label: k % JUDGE_LABELS.length,
      };
    });
    // The last item stays on screen as the stream dims.
    const last = items[STREAM_N - 1];
    last.opacity = t >= b0 + 0.3 + (STREAM_N - 1) * sp ? 1 : 0;
    const press = Math.max(0, ...items.map((_, k) => pulse(t, b0 + 0.3 + k * sp + 0.5, 0.18)));
    return {
      mode: 'judge',
      thumb: { appear: easeOutCubic(progress(t, b0 - 0.1, 0.4)) },
      judge: { appear: easeOutCubic(progress(t, b0 - 0.2, 0.4)), press },
      items,
      stream: { opacity: 1 - 0.65 * easeOutCubic(progress(t, b1, 0.4)) },
      claim: {
        appear: easeOutCubic(progress(t, b1 + 0.05, 0.45)),
        strike: easeInOut(progress(t, b1 + 1.6, 0.6)),
        tag: easeOutCubic(progress(t, b1 + 2.3, 0.4)),
      },
    };
  }

  // hollow
  const cards = [0, 1, 2].map((i) => ({
    appear: easeOutCubic(progress(t, b0 - 0.25 + i * 0.12, 0.35)),
    fill: 1 - easeInOut(progress(t, fit(b0 + 1.4 + i * 0.35, 1.0, dur), 1.0)),
  }));
  return {
    mode: 'hollow',
    cards,
    head: { form: easeOutCubic(progress(t, b0 + 0.5, 0.4)), none: easeOutCubic(progress(t, fit(b0 + 2.0, 0.4, dur), 0.4)) },
  };
}

function easeInOut(p: number) {
  const x = clamp01(p);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}
