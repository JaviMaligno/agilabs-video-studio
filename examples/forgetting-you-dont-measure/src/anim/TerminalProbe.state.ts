// Pure state of the TerminalProbe scene: the skill the model learns, in one terminal card.
// Real command templates from the experiment repo (src/lwmf/data/terminal_gen.py): two commands
// type in, the model's guess ghost-types, the real output lands on it, match ✓. Beat 1: the label
// WORLD MODEL · "predicts what the environment returns".
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type ProbeProps = Record<string, unknown>;

export const PROBE = {
  cmd1: '$ echo hello > notes.md',
  cmd2: '$ cat notes.md',
  out: 'hello  [exit 0]',
} as const;

export type ProbeState = {
  card: { appear: number };
  /** Typed share of each command, 0..1. */
  cmd1: number;
  cmd2: number;
  guess: { appear: number; typed: number };
  real: { appear: number };
  tick: { appear: number };
  label: { appear: number };
};

const E = (t: number, at: number, len: number) => easeOutCubic(progress(t, at, len));

export function frameState(_props: ProbeProps, t0: number, beats: number[], dur: number): ProbeState {
  const t = sceneTime(t0, dur);
  const b0 = beatAt(beats, 0);
  const raw1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3;
  const b1 = fit(raw1, 0.5, dur);
  // The probe plays in the time before beat 1 (squeezed when the first line is short).
  const k = Math.min(1, Math.max(0.4, (b1 - b0) / 2.9));
  const at = (s: number, len: number) => fit(b0 + s * k, len * k, dur);
  return {
    card: { appear: E(t, b0 - 0.15, 0.4) },
    cmd1: clamp01(progress(t, at(0.15, 0.7), 0.7 * k)),
    cmd2: clamp01(progress(t, at(0.95, 0.45), 0.45 * k)),
    guess: { appear: E(t, at(1.5, 0.2), 0.2), typed: clamp01(progress(t, at(1.5, 0.5), 0.5 * k)) },
    real: { appear: E(t, at(2.15, 0.3), 0.3) },
    tick: { appear: E(t, at(2.45, 0.3), 0.3) },
    label: { appear: E(t, b1, 0.45) },
  };
}
