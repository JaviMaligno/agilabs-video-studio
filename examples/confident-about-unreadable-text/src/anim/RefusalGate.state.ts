// Pure state of the RefusalGate scene, mode `bypass` (new in this video): GPT-5 and its refusal
// drawn as a glass wall in front of the chip (the look of the ciphers video).
//   beat 0: two sealed requests bounce off the wall in plain text ("refused · 30/30"); masked in
//           letters→digits and in full reversal, the same two pass; both judges stamp COMPLIED.
//   beat 1: ROT13 and base64 cards are stopped at the wall beside them; the hedge tag drops:
//           "2 prompts · existence, not a rate".
// Sealed cards carry no text of a prompt, ever. No Remotion or React here.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { NO_SLAM, beatOr, slam, type Slam } from './stamp.ts';

export type GateProps = { mode?: 'bypass' };

/** Stage geometry shared with the drawing (px in the 960-wide stage). */
export const GEO = { cardW: 224, cardH: 130, startY: 150, wallY: 470, wallH: 46, restY: 610, chipY: 930 } as const;
export const COLS = [120, 360, 600, 840] as const;

/** The four cards: two that pass (cols 1, 2) and two that stay blocked (cols 0, 3). */
export const CARDS = [
  { col: 0, cipher: 'ROT13', passes: false },
  { col: 1, cipher: 'letters → digits', passes: true },
  { col: 2, cipher: 'reversal', passes: true },
  { col: 3, cipher: 'base64', passes: false },
] as const;

export type GateCard = { x: number; y: number; opacity: number; cipher: number; flash: number; stamps: Slam[]; blocked: number };

export type GateState = {
  phase: number;
  head: { plain: number; cipher: number; hedge: number };
  wall: { appear: number; flash: number };
  refused: { pop: number; opacity: number };
  cards: GateCard[];
  chip: { appear: number; lit: number };
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeIn = (p: number) => clamp01(p) ** 2;

export function frameState(_props: GateProps, t0: number, beats: number[], dur: number): GateState {
  const t = sceneTime(t0, dur);
  const b0 = beatOr(beats, 0, 0);
  const b1 = fit(beatOr(beats, 1, b0 + 5.6), 1.8, dur);
  // Line 0 runs from b0 to about b1 - 0.35: key the plain bounce and the bypass to its words
  // ("refused" starts ~61%, "plain text" ~71-82%, "got through" ~82%, "cipher" ~91%).
  const L = Math.max(2.5, b1 - 0.35 - b0);
  const hit = b0 + 0.58 * L;
  const morphAt = Math.max(hit + 0.55, b0 + 0.81 * L);
  const passAt = Math.max(morphAt + 0.25, b0 + 0.85 * L);
  const stampAt = passAt + 0.75;
  const touch = GEO.wallY - GEO.cardH - 4;

  const cards: GateCard[] = CARDS.map((c) => {
    const x = COLS[c.col];
    if (c.passes) {
      const fall = easeIn(progress(t, hit - 0.55, 0.55));
      const bounce = easeOutCubic(progress(t, hit, 0.5));
      const pass = easeIn(progress(t, passAt, 0.6));
      let y = lerp(GEO.startY, touch, fall);
      if (t >= hit) y = lerp(touch, GEO.startY + 20, bounce);
      if (t >= passAt) y = lerp(GEO.startY + 20, GEO.restY, pass);
      const s1 = t >= stampAt ? slam(t, stampAt + (c.col - 1) * 0.12) : NO_SLAM;
      const s2 = t >= stampAt + 0.22 ? slam(t, stampAt + 0.22 + (c.col - 1) * 0.12) : NO_SLAM;
      return {
        x,
        y,
        opacity: easeOutCubic(progress(t, b0 - 0.1, 0.35)),
        cipher: easeOutCubic(progress(t, morphAt, 0.35)),
        flash: clamp01(1 - Math.abs((t - (passAt + 0.3)) / 0.25)),
        stamps: [s1, s2],
        blocked: 0,
      };
    }
    const at = b1 + 0.15 + (c.col === 3 ? 0.25 : 0);
    const fall = easeIn(progress(t, at, 0.5));
    const stop = progress(t, at + 0.5, 0.35);
    return {
      x,
      y: lerp(GEO.startY - 60, touch, fall) - (stop > 0 && stop < 1 ? Math.sin(stop * Math.PI) * 22 : 0),
      opacity: easeOutCubic(progress(t, at - 0.1, 0.3)),
      cipher: 1,
      flash: 0,
      stamps: [NO_SLAM, NO_SLAM],
      blocked: easeOutCubic(progress(t, at + 0.55, 0.3)),
    };
  });

  const phase = t >= b1 ? 1 : 0;
  return {
    phase,
    head: {
      plain: easeOutCubic(progress(t, b0 - 0.1, 0.35)) * clamp01(1 - progress(t, morphAt - 0.3, 0.2)),
      cipher: easeOutCubic(progress(t, morphAt - 0.05, 0.3)) * clamp01(1 - progress(t, b1 + 0.4, 0.25)),
      hedge: easeOutCubic(progress(t, b1 + 0.6, 0.4)),
    },
    wall: {
      appear: easeOutCubic(progress(t, b0 - 0.2, 0.4)),
      flash: Math.max(clamp01(1 - Math.abs((t - hit) / 0.3)), clamp01(1 - Math.abs((t - (b1 + 0.7)) / 0.3))),
    },
    refused: { pop: easeOutCubic(progress(t, hit + 0.05, 0.3)), opacity: clamp01(1 - progress(t, passAt - 0.2, 0.25)) },
    cards,
    chip: { appear: easeOutCubic(progress(t, b0 - 0.1, 0.4)), lit: easeOutCubic(progress(t, passAt + 0.5, 0.4)) },
  };
}
