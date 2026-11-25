// Registry of animation components for `anim` scenes, looked up by the name given in timeline.ts.
// Keep ANIMS a plain object literal of names: `npm run lint` reads the names from this source.
import type React from 'react';
import type { AnimProps } from './types.ts';
import { BarCompare } from './BarCompare.tsx';
import { Counter } from './Counter.tsx';
import { FlowDiagram } from './FlowDiagram.tsx';
import { KeyQuote } from './KeyQuote.tsx';
import { StatGrid } from './StatGrid.tsx';
import { FileStack } from './FileStack.tsx';
import { Trail } from './Trail.tsx';
import { NotePage } from './NotePage.tsx';
import { PrimeLine } from './PrimeLine.tsx';
import { CriticalLine } from './CriticalLine.tsx';
import { ClaimPile } from './ClaimPile.tsx';
import { PaperTower } from './PaperTower.tsx';
import { Checklist } from './Checklist.tsx';
import { TwoProofs } from './TwoProofs.tsx';
import { PrimeBox } from './PrimeBox.tsx';
import { PrimeCurve } from './PrimeCurve.tsx';
import { ChainTradeoff } from './ChainTradeoff.tsx';

export type { AnimProps };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ANIMS: Record<string, React.FC<AnimProps & any>> = {
  Counter,
  BarCompare,
  FlowDiagram,
  KeyQuote,
  StatGrid,
  FileStack,
  Trail,
  NotePage,
  PrimeLine,
  CriticalLine,
  ClaimPile,
  PaperTower,
  Checklist,
  TwoProofs,
  PrimeBox,
  PrimeCurve,
  ChainTradeoff,
};
