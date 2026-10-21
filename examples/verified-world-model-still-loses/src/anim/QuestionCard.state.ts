// Pure state of the question card (as in sport-from-motion-laya, here as a scene of its own over
// the dimmed shaft): "Passed the check → good enough to plan with?" with a stamp slot. `ask` puts
// the question; `yes` stamps the small, fully specified games; `verdict` stamps this game.
// No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type CardMode = 'ask' | 'yes' | 'verdict';
export type QuestionCardProps = { mode: CardMode; stampDelay?: number };

export const GAMES = ['tic-tac-toe', 'small chess', 'Trike'] as const;

export function frameState(p: QuestionCardProps, t: number, beats: number[], dur: number) {
  const T = sceneTime(t, dur);
  const d = Number.isFinite(dur) ? Math.max(0, dur) : 1e6;
  const b0 = beatAt(beats, 0);
  const fresh = p.mode === 'ask';
  // The card itself: it arrives in `ask`, and is already there when the scene blends in later.
  const card = fresh ? easeOutCubic(progress(T, fit(0.1, 0.5, d), 0.5)) : 1;
  const passed = fresh ? easeOutCubic(progress(T, fit(b0 + 0.2, 0.4, d), 0.4)) : 1;
  const question = fresh ? easeOutCubic(progress(T, fit(b0 + 0.9, 0.5, d), 0.5)) : 1;
  const chips = GAMES.map((_, i) => (p.mode === 'yes' ? easeOutCubic(progress(T, fit(b0 + 0.25 + i * 0.3, 0.4, d), 0.4)) : 0));
  const stampAt = fit(b0 + (p.stampDelay ?? (p.mode === 'yes' ? 1.5 : 1.6)), 0.45, d);
  const stamp = p.mode === 'ask' ? 0 : easeOutCubic(progress(T, stampAt, 0.35));
  return {
    mode: p.mode,
    card,
    passed,
    question,
    chips,
    stamp: {
      pop: stamp,
      opacity: p.mode === 'ask' ? 0 : progress(T, stampAt, 0.12),
      text: p.mode === 'yes' ? 'YES' : 'NOT ENOUGH ✗',
      sub: p.mode === 'yes' ? 'small games, complete rules' : 'on this game',
      tone: p.mode === 'yes' ? ('ok' as const) : ('rose' as const),
    },
    /** Pulse on the question mark while it waits for an answer. */
    pulse: p.mode === 'ask' ? 0.5 + 0.5 * Math.sin(Math.min(T, 1e6) * 3) : 0,
  };
}

export type CardState = ReturnType<typeof frameState>;
