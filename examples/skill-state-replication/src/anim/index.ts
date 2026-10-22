// Registry of animation components for `anim` scenes, looked up by the name given in timeline.ts.
// Keep ANIMS a plain object literal of names: `npm run lint` reads the names from this source.
import type React from 'react';
import type { AnimProps } from './types.ts';
import { BarCompare } from './BarCompare.tsx';
import { Counter } from './Counter.tsx';
import { FlowDiagram } from './FlowDiagram.tsx';
import { KeyQuote } from './KeyQuote.tsx';
import { StatGrid } from './StatGrid.tsx';
import { ScrollVsNotepad } from './ScrollVsNotepad.tsx';
import { CacheBill } from './CacheBill.tsx';
import { HorizonLines } from './HorizonLines.tsx';
import { CorrectionGrid } from './CorrectionGrid.tsx';
import { BeliefVsShelf } from './BeliefVsShelf.tsx';

export type { AnimProps };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ANIMS: Record<string, React.FC<AnimProps & any>> = {
  Counter,
  BarCompare,
  FlowDiagram,
  KeyQuote,
  StatGrid,
  ScrollVsNotepad,
  CacheBill,
  HorizonLines,
  CorrectionGrid,
  BeliefVsShelf,
};
