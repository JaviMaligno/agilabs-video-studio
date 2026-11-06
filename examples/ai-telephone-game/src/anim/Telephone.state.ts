// Pure state of the telephone-game scenes. Three rows of eight robots (one row per AI) pass a
// message along; the speech bubble shows the REAL text of each hop (src/data/telephone.json, from
// the telephone-classic runs), the fact chips show the cross-family judge's verdict at that hop,
// and anything the judge marked as added appears as a rose note. No Remotion or React here.
import { data } from '../data/telephone.ts';
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type ModelId = 'sonnet' | 'haiku' | 'sol' | 'luna';
export type Verdict = 'kept' | 'distorted' | 'lost';
export type FactKey = 'recipient' | 'when' | 'reason1' | 'prohibition' | 'reason2';
export type Mode = 'rows' | 'message' | 'chain' | 'tally' | 'verdict';

export type TelephoneProps = {
  mode: Mode;
  /** chain: which AI's row plays. */
  model?: ModelId;
  /** chain: hop shown at the scene start, and the hop reached at the start of each beat (+delay). */
  from?: number;
  steps?: { hop: number; beat: number; delay?: number }[];
  /** chain: fact chip to pulse (the one the narration is about). */
  focus?: FactKey;
};

type Hop = { text: string; facts: Record<FactKey, Verdict>; added: string };
export const CHAINS = data.chains as unknown as Record<ModelId, Hop[]>;
export const STATS = data.stats as Record<ModelId, { chains: number; reasonsKept: number; reasons: number; recipientKept: number }>;
export const ROWS: { id: ModelId; label: string; img: string; scale: number }[] = [
  { id: 'sonnet', label: 'Claude Sonnet', img: 'cast/robots/robot-violet.png', scale: 1 },
  { id: 'haiku', label: 'Claude Haiku', img: 'cast/robots/robot-violet.png', scale: 0.72 },
  { id: 'sol', label: 'GPT-6 Sol', img: 'cast/robots/robot-teal.png', scale: 1 },
  { id: 'luna', label: 'GPT-6 Luna', img: 'cast/robots/robot-teal.png', scale: 0.72 },
];
export const FACTS: { key: FactKey; label: string }[] = [
  { key: 'recipient', label: 'Marta' },
  { key: 'when', label: 'Fri 8' },
  { key: 'reason1', label: 'because: closed Thu' },
  { key: 'prohibition', label: 'red, not white' },
  { key: 'reason2', label: 'because: sulphites' },
];
export const HOPS = 8;
/** message mode: the message drawn, lit as the narration names each part (beat, seconds after it). */
export const ICONS = [
  { img: 'cast/props/marta.png', label: 'Marta', beat: 0, at: 0.3 },
  { img: 'cast/props/calendar.png', label: 'Fri 8', beat: 0, at: 1.5, overlay: 'FRI 8' },
  { img: 'cast/props/restaurant.png', label: 'closed Thu', beat: 0, at: 3.0 },
  { img: 'cast/props/wines.png', label: 'red, not white', beat: 1, at: 0.2 },
  { img: 'cast/props/luis.png', label: 'Luis: sulphites', beat: 1, at: 1.7 },
] as const;

export function frameState(p: TelephoneProps, t: number, beats: number[], dur: number) {
  const T = sceneTime(t, dur);
  const d = Number.isFinite(dur) ? Math.max(0, dur) : 1e6;
  const b0 = beatAt(beats, 0);
  const appear = 1; // cold open: everything on screen from frame 0
  // A runner dot travels along every row (rows / message modes), one robot per 0.22 s, looping.
  const run = ((T * 4.5) % (HOPS + 2)) - 1;

  let hop = 0;
  let model: ModelId = p.model ?? 'sonnet';
  if (p.mode === 'chain') {
    hop = p.from ?? 0;
    for (const s of p.steps ?? []) {
      const at = fit(beatAt(beats, s.beat) + (s.delay ?? 0), 0.3, d);
      if (T >= at) {
        // Walk hop by hop towards the target, one robot per 0.35 s, so every hop's text shows.
        const walked = Math.floor((T - at) / 0.35) + 1;
        hop = Math.min(s.hop, hop + walked);
      }
    }
  }
  if (p.mode === 'message') model = 'sonnet';
  const h = CHAINS[model][Math.min(HOPS, Math.max(0, hop))];
  const textIn = p.mode === 'chain' ? 1 : easeOutCubic(progress(T, b0, 0.4));
  const pulse = 0.5 + 0.5 * Math.sin(T * 6);
  const tallyIn = (i: number) => easeOutCubic(progress(T, fit(b0 + 0.2 + i * 0.35, 0.4, d), 0.4));
  return {
    mode: p.mode,
    appear,
    run,
    model,
    hop,
    text: h.text,
    textIn,
    facts: FACTS.map((f) => ({ ...f, verdict: h.facts[f.key], focus: p.focus === f.key ? pulse : 0 })),
    added: h.added,
    icons: ICONS.map((ic) => ({ ...ic, lit: p.mode === 'message' ? easeOutCubic(progress(T, fit(beatAt(beats, ic.beat) + ic.at, 0.4, d), 0.4)) : 0 })),
    tally: ROWS.map((r, i) => ({ ...r, ...STATS[r.id], in: tallyIn(i) })),
  };
}

export type TelephoneState = ReturnType<typeof frameState>;
