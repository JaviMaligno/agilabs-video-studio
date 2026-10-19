import React from 'react';
import type { AnimProps } from './types.ts';
import { frameState, type RingPanProps } from './RingPan.state.ts';
import { PanArt } from './PanArt.tsx';

export { frameState };
export type { RingPanProps };

/** Frying pans from above: rings placed one by one, the sear glowing, RINGS and SEARED dials. */
export const RingPan: React.FC<AnimProps & RingPanProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, p.lang);
  return <PanArt s={s} />;
};
