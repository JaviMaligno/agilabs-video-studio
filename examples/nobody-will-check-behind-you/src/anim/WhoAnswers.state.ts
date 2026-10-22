// Pure state of the WhoAnswers scene (Part III and the verdict): two name tags side by side.
// Left, the benchmark's named lead, who answered for a partner's patch: 0 %. Right, this
// experiment's owner, who answered for its own release: 15/15. Then the verdict stamps:
// "works · one paragraph" under the owner, "keeps failing" under the lead. One step per line.
// No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type WhoAnswersProps = Record<string, never>;

export const LEAD = { role: 'lead', answers: 'answers for a partner’s patch', figure: '0 %', source: 'CooperBench, structured mode' } as const;
export const OWNER = { role: 'owner', answers: 'answers for its own release', figure: '15/15' } as const;
export const VERDICT = { works: 'works · one paragraph', fails: 'keeps failing', note: 'needs an owner with nothing else to do' } as const;

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};
const beat = (beats: number[], i: number, fallback: number) => (beats.length > i && Number.isFinite(beats[i]) ? beats[i] : fallback);

export function frameState(_p: WhoAnswersProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));
  const Pu = (start: number, len: number) => pulse(t, fit(start, len, dur), len);
  const b0 = beatAt(beats, 0);
  const b1 = beat(beats, 1, b0 + 4);
  const b2 = beat(beats, 2, b1 + 2.6);
  const b3 = beat(beats, 3, b2 + 3.4);
  const b4 = beat(beats, 4, b3 + 2.9);
  return {
    part: E(0, 0.35),
    // Line 1: the lead's tag, its 0 % on "zero percent".
    lead: E(b0 + 0.3, 0.4),
    leadFigure: E(b0 + 1.85, 0.3),
    // Line 2: a partner's patch beside it, never stitched in.
    patch: E(b1 + 0.2, 0.35),
    gap: P(b1 + 0.6, 0.5),
    // Line 3: the owner's tag, clipped onto its own 0.4.0 box; 15/15.
    owner: E(b2 + 0.3, 0.4),
    box: E(b2 + 0.5, 0.35),
    clip: E(b2 + 1.0, 0.6),
    ownerFigure: E(b2 + 1.6, 0.3),
    // Lines 4-5: the verdict. The owner works; the lead keeps failing.
    works: E(b3 + 0.9, 0.3),
    worksFlash: Pu(b3 + 1.1, 0.7),
    leadDim: E(b4 + 0.2, 0.4),
    fails: E(b4 + 0.9, 0.3),
    note: E(b4 + 1.25, 0.35),
  };
}

export type WhoAnswersState = ReturnType<typeof frameState>;
