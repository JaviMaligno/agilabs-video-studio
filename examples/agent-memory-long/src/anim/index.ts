// Registry of animation components for `anim` scenes, looked up by the name given in timeline.ts.
// Keep ANIMS a plain object literal of names: `npm run lint` reads the names from this source.
import type React from 'react';
import type { AnimProps } from './types.ts';
import { BarCompare } from './BarCompare.tsx';
import { Counter } from './Counter.tsx';
import { FlowDiagram } from './FlowDiagram.tsx';
import { KeyQuote } from './KeyQuote.tsx';
import { StatGrid } from './StatGrid.tsx';
import { MemoryOffice } from './MemoryOffice.tsx';
import { MemoryMap } from './MemoryMap.tsx';
import { WarehouseShelves } from './WarehouseShelves.tsx';
import { HeadShelf } from './HeadShelf.tsx';
import { MemoryDesk } from './MemoryDesk.tsx';
import { FilingCabinet } from './FilingCabinet.tsx';
import { ClipboardForm } from './ClipboardForm.tsx';
import { ReplayBars } from './ReplayBars.tsx';
import { TwoJobs } from './TwoJobs.tsx';

export type { AnimProps };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ANIMS: Record<string, React.FC<AnimProps & any>> = {
  Counter,
  BarCompare,
  FlowDiagram,
  KeyQuote,
  StatGrid,
  MemoryOffice,
  MemoryMap,
  WarehouseShelves,
  HeadShelf,
  MemoryDesk,
  FilingCabinet,
  ClipboardForm,
  ReplayBars,
  TwoJobs,
};
