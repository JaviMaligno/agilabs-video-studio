// Flat topic pictures for the puzzles, drawn in a 0..100 box from the brand tokens only.
// The conversation's own puzzle stays in the indigo family so the foreign piece stands out.
import React from 'react';
import { C, alpha } from '../brand.ts';
import type { Topic } from './PuzzleChat.state.ts';

/** Where the finish flag of the 10K route sits (picture units): one end of the invented thread. */
export const FLAG = { x: 84, y: 14 } as const;

const ink = C.accentText;
const deep = C.accent;
const violet = C.accent2;
const line = alpha(C.muted, 0.55);

const Sky: React.FC<{ id: string }> = ({ id }) => (
  <>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={alpha(C.accent, 0.32)} />
        <stop offset="1" stopColor={C.bg1} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={100} height={100} fill={`url(#${id}-sky)`} />
  </>
);

const Garden = () => (
  <g>
    <circle cx={80} cy={18} r={9} fill={alpha(ink, 0.55)} />
    {/* railing */}
    <rect x={0} y={56} width={100} height={3} fill={line} />
    {Array.from({ length: 13 }, (_, i) => (
      <rect key={i} x={3 + i * 8} y={56} width={1.6} height={36} fill={alpha(C.muted, 0.35)} />
    ))}
    <rect x={0} y={90} width={100} height={10} fill={alpha(C.card, 0.9)} />
    {[12, 41, 70].map((x, i) => (
      <g key={x}>
        {/* leaves */}
        <ellipse cx={x + 9} cy={56} rx={6} ry={13} fill={alpha(deep, 0.9)} transform={`rotate(-25 ${x + 9} 66)`} />
        <ellipse cx={x + 9} cy={54} rx={6} ry={14} fill={alpha(ink, 0.85)} />
        <ellipse cx={x + 9} cy={56} rx={6} ry={13} fill={alpha(deep, 0.9)} transform={`rotate(25 ${x + 9} 66)`} />
        {i !== 1 && <circle cx={x + 5} cy={50} r={3} fill={violet} />}
        {i !== 1 && <circle cx={x + 13} cy={58} r={2.6} fill={violet} />}
        {/* pot */}
        <path d={`M${x} 68 h18 l-2.5 20 h-13 z`} fill={alpha(violet, 0.85)} />
        <rect x={x - 1} y={66} width={20} height={4} rx={1} fill={violet} />
      </g>
    ))}
  </g>
);

const Bill = () => (
  <g>
    <rect x={16} y={8} width={68} height={86} rx={4} fill={alpha(C.card, 0.95)} stroke={line} strokeWidth={1} />
    <rect x={24} y={16} width={30} height={5} rx={2} fill={alpha(ink, 0.7)} />
    <rect x={24} y={25} width={20} height={3} rx={1.5} fill={alpha(C.muted, 0.5)} />
    <polygon points="56,22 38,54 50,54 44,80 66,44 53,44 60,22" fill={violet} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={24 + i * 11} y={86 - [6, 9, 7, 12, 10][i]} width={7} height={[6, 9, 7, 12, 10][i]} fill={alpha(deep, 0.85)} />
    ))}
  </g>
);

const Run = () => (
  <g>
    <path d="M6 92 C 30 86, 18 64, 42 60 S 70 52, 56 36 S 72 18, 84 16" fill="none" stroke={alpha(ink, 0.35)} strokeWidth={9} strokeLinecap="round" />
    <path d="M6 92 C 30 86, 18 64, 42 60 S 70 52, 56 36 S 72 18, 84 16" fill="none" stroke={ink} strokeWidth={1.8} strokeDasharray="4 3" strokeLinecap="round" />
    {[
      [22, 76],
      [44, 60],
      [60, 38],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={3.2} fill={C.bg1} stroke={violet} strokeWidth={1.5} />
    ))}
    <rect x={FLAG.x - 0.8} y={FLAG.y - 12} width={1.6} height={14} fill={C.text} />
    <polygon points={`${FLAG.x + 0.8},${FLAG.y - 12} ${FLAG.x + 12},${FLAG.y - 8} ${FLAG.x + 0.8},${FLAG.y - 4}`} fill={violet} />
  </g>
);

const Camera = () => (
  <g>
    <rect x={30} y={26} width={22} height={10} rx={2} fill={alpha(C.muted, 0.6)} />
    <rect x={12} y={34} width={76} height={46} rx={6} fill={alpha(C.card, 0.95)} stroke={ink} strokeWidth={1.4} />
    <circle cx={52} cy={57} r={18} fill={alpha(violet, 0.9)} />
    <circle cx={52} cy={57} r={12} fill={C.bg1} />
    <circle cx={52} cy={57} r={6} fill={alpha(ink, 0.8)} />
    <circle cx={48} cy={53} r={2} fill={C.text} />
    <rect x={72} y={40} width={10} height={6} rx={1.5} fill={alpha(ink, 0.8)} />
  </g>
);

const Bread = () => (
  <g>
    <rect x={0} y={78} width={100} height={22} fill={alpha(C.card, 0.9)} />
    <path d="M12 78 C 12 46, 88 46, 88 78 Z" fill={alpha(violet, 0.9)} />
    {[34, 50, 66].map((x) => (
      <path key={x} d={`M${x - 6} 62 Q ${x} 56 ${x + 6} 60`} fill="none" stroke={alpha(C.text, 0.6)} strokeWidth={2} strokeLinecap="round" />
    ))}
    <path d="M80 12 L 72 46" stroke={ink} strokeWidth={1.4} />
    {[0, 1, 2, 3].map((i) => (
      <ellipse key={i} cx={78.5 - i * 2} cy={18 + i * 7} rx={2.2} ry={4} fill={ink} />
    ))}
  </g>
);

const Move = () => (
  <g>
    <path d="M14 50 L 40 28 L 66 50 V 84 H 14 Z" fill={alpha(C.card, 0.95)} stroke={ink} strokeWidth={1.4} />
    <rect x={34} y={62} width={12} height={22} fill={alpha(deep, 0.8)} />
    {[
      [62, 66, 22],
      [72, 50, 16],
    ].map(([x, y, s], i) => (
      <g key={i}>
        <rect x={x} y={y} width={s} height={s} fill={alpha(violet, 0.85)} />
        <rect x={x + s / 2 - 1.5} y={y} width={3} height={s} fill={alpha(C.text, 0.4)} />
      </g>
    ))}
  </g>
);

const School = () => (
  <g>
    <polygon points="12,44 50,22 88,44" fill={alpha(violet, 0.9)} />
    <rect x={18} y={44} width={64} height={42} fill={alpha(C.card, 0.95)} stroke={ink} strokeWidth={1.2} />
    {[24, 38, 56, 70].map((x) => (
      <rect key={x} x={x} y={52} width={7} height={9} fill={alpha(ink, 0.7)} />
    ))}
    <rect x={44} y={66} width={12} height={20} fill={alpha(deep, 0.85)} />
    <rect x={49.4} y={8} width={1.2} height={15} fill={C.text} />
    <polygon points="50.6,8 60,11 50.6,14" fill={ink} />
  </g>
);

const Japan = () => (
  <g>
    <circle cx={74} cy={24} r={10} fill={alpha(violet, 0.75)} />
    <polygon points="8,80 40,30 72,80" fill={alpha(deep, 0.85)} />
    <polygon points="33,41 40,30 47,41 43,44 40,40 37,44" fill={C.text} opacity={0.85} />
    <rect x={56} y={56} width={36} height={4} fill={ink} />
    <rect x={58} y={63} width={32} height={2.5} fill={ink} />
    <rect x={62} y={56} width={3} height={32} fill={ink} />
    <rect x={83} y={56} width={3} height={32} fill={ink} />
  </g>
);

const DRAW: Record<Topic, React.FC> = { garden: Garden, bill: Bill, run: Run, camera: Camera, bread: Bread, move: Move, school: School, japan: Japan };

/** A topic picture filling the 0..100 box. */
export const Picture: React.FC<{ topic: Topic; id: string }> = ({ topic, id }) => {
  const Draw = DRAW[topic] ?? Garden;
  return (
    <g>
      <Sky id={id} />
      <Draw />
    </g>
  );
};
