// Registry of animation components for `anim` scenes, looked up by the name given in timeline.ts.
import type React from 'react';
import type { Lang } from '../types.ts';

/** What every animation receives, besides its own props from the timeline. */
export type AnimProps = {
  /** Seconds since the scene started. */
  t: number;
  /** Scene seconds at which each narration line starts. */
  beats: number[];
  /** Scene length in seconds. */
  dur: number;
  lang: Lang;
  vertical: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ANIMS: Record<string, React.FC<AnimProps & any>> = {};
