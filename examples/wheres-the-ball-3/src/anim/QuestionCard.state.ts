// Pure state of the question band: one fixed card at the top of the frame that says, in plain
// words, which opening of the box each part is ("What is it computing?" → "1 · geometry" →
// "2 · topology" → "3 · does it know when it's wrong?" → "Verdict"), and gets the part's stamp.
// It lives above the scene transitions (Video.tsx), so it never dips with the scenes under it.
// Each anim scene may carry `card: { q, stamp? }` in its props; `stamp.at` is in scene seconds.
// No Remotion or React here.
import { clamp01, easeOutCubic, progress } from './steps.ts';

/** Brand palette only: gradient (a result that holds), muted grey (nothing), outlined accent. */
export type StampTone = 'ok' | 'muted' | 'accent';
export type CardSpec = { q: string; stamp?: { text: string; at: number; tone?: StampTone } };

/** One entry per scene, in video seconds. `q` null: no card (the outro). */
export type CardTrack = { start: number; q: string | null; stamp?: { text: string; at: number; tone: StampTone } }[];

export const SWAP = 0.6;

/** The track from scenes and their start times in video seconds. */
export function cardTrack(scenes: { anim?: { props: Record<string, unknown> } }[], startSeconds: number[]): CardTrack {
  return scenes.map((s, i) => {
    const spec = s.anim?.props.card as CardSpec | undefined;
    const start = startSeconds[i] ?? 0;
    if (!spec || !spec.q) return { start, q: null };
    const st = spec.stamp;
    return st && Number.isFinite(st.at) ? { start, q: spec.q, stamp: { text: st.text, at: start + st.at, tone: st.tone ?? 'ok' } } : { start, q: spec.q };
  });
}

export type StampState = { text: string; tone: StampTone; pop: number };
/** A question written "Kicker · main" is drawn as a small kicker over the main line. */
export function splitQ(q: string): { kicker: string; main: string } {
  const i = q.indexOf(' · ');
  return i < 0 ? { kicker: '', main: q } : { kicker: q.slice(0, i), main: q.slice(i + 3) };
}

export type CardState = {
  /** The card box. */
  opacity: number;
  /** The question on the card and how far it is in (0..1); during a swap the old one leaves first. */
  text: string;
  textIn: number;
  stamp: StampState | null;
};

/** Latest stamp of the run of scenes asking `q` that ends at scene `idx`, landed by `T`. */
function stampOf(track: CardTrack, idx: number, q: string, T: number): StampState | null {
  let best: { text: string; at: number; tone: StampTone } | null = null;
  for (let j = idx; j >= 0 && track[j].q === q; j--) {
    const st = track[j].stamp;
    if (st && st.at <= T && (!best || st.at > best.at)) best = st;
  }
  return best ? { text: best.text, tone: best.tone, pop: easeOutCubic(progress(T, best.at, 0.35)) } : null;
}

export function cardState(track: CardTrack, T: number): CardState {
  const time = Number.isFinite(T) ? T : 0;
  let idx = -1;
  for (let i = 0; i < track.length; i++) if (track[i].start <= time) idx = i;
  if (idx < 0) return { opacity: 0, text: '', textIn: 0, stamp: null };
  const cur = track[idx];
  // Where the current question started: the first scene of its run.
  let first = idx;
  while (first > 0 && track[first - 1].q === cur.q) first--;
  const since = track[first].start;
  const prev = first > 0 ? track[first - 1] : null;

  if (cur.q === null) {
    // The card leaves (outro), the last question fading with it.
    if (!prev || prev.q === null) return { opacity: 0, text: '', textIn: 0, stamp: null };
    const out = 1 - progress(time, since, 0.4);
    return { opacity: out, text: prev.q, textIn: 1, stamp: stampOf(track, first - 1, prev.q, time) };
  }
  if (!prev || prev.q === null) {
    // The card arrives with its question.
    const inn = progress(time, since + 0.05, 0.4);
    return { opacity: inn, text: cur.q, textIn: inn, stamp: stampOf(track, idx, cur.q, time) };
  }
  // A new question replaces the previous one: the old text (and its stamp) leave, the new comes in.
  const sw = clamp01((time - since) / SWAP);
  if (sw < 0.5) {
    const old = stampOf(track, first - 1, prev.q, time);
    return { opacity: 1, text: prev.q, textIn: 1 - 2 * sw, stamp: old ? { ...old, pop: old.pop * (1 - 2 * sw) } : null };
  }
  return { opacity: 1, text: cur.q, textIn: 2 * sw - 1, stamp: stampOf(track, idx, cur.q, time) };
}
