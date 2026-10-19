// Field markings per sport, drawn in field metres (x along the length, y across), origin at a
// corner. Shared by DotStage and SnapshotDeck. Muted brand colour; `sw` is the stroke in metres.
import React from 'react';
import { C, alpha } from '../brand.ts';

const Basketball: React.FC<{ sw: number; stroke: string }> = ({ sw, stroke }) => {
  const L = 28.65;
  const W = 15.24;
  const line = { fill: 'none', stroke, strokeWidth: sw } as const;
  const end = (gx: number) => {
    const dir = gx === 0 ? 1 : -1;
    const hx = gx + dir * 1.575;
    const cy = W / 2;
    const r3 = 7.24;
    const cornerY = 0.91;
    const dx = Math.sqrt(r3 * r3 - (cy - cornerY) ** 2);
    const ax = hx + dir * dx;
    const sweep = dir === 1 ? 1 : 0;
    return (
      <g key={gx}>
        <rect x={dir === 1 ? 0 : L - 5.79} y={cy - 2.44} width={5.79} height={4.88} {...line} />
        <circle cx={gx + dir * 5.79} cy={cy} r={1.83} {...line} />
        <line x1={gx + dir * 1.22} y1={cy - 0.91} x2={gx + dir * 1.22} y2={cy + 0.91} stroke={stroke} strokeWidth={sw * 1.6} />
        <circle cx={hx} cy={cy} r={0.23} fill="none" stroke={C.text} strokeOpacity={0.7} strokeWidth={sw} />
        <path d={`M ${gx} ${cornerY} L ${ax} ${cornerY} A ${r3} ${r3} 0 0 ${sweep} ${ax} ${W - cornerY} L ${gx} ${W - cornerY}`} {...line} />
      </g>
    );
  };
  return (
    <g>
      <rect x={0} y={0} width={L} height={W} {...line} />
      <line x1={L / 2} y1={0} x2={L / 2} y2={W} {...line} />
      <circle cx={L / 2} cy={W / 2} r={1.83} {...line} />
      {end(0)}
      {end(L)}
    </g>
  );
};

const Handball: React.FC<{ sw: number; stroke: string }> = ({ sw, stroke }) => {
  const L = 40;
  const W = 20;
  const line = { fill: 'none', stroke, strokeWidth: sw } as const;
  const end = (gx: number) => {
    const dir = gx === 0 ? 1 : -1;
    const sweep = dir === 1 ? 1 : 0;
    const area = (r: number, dash?: string) => (
      <path
        d={`M ${gx} ${8.5 - r} A ${r} ${r} 0 0 ${sweep} ${gx + dir * r} 8.5 L ${gx + dir * r} 11.5 A ${r} ${r} 0 0 ${sweep} ${gx} ${11.5 + r}`}
        {...line}
        strokeDasharray={dash}
      />
    );
    return (
      <g key={gx}>
        {area(6)}
        {area(9, `${sw * 4} ${sw * 4}`)}
        <line x1={gx + dir * 7} y1={9.5} x2={gx + dir * 7} y2={10.5} {...line} />
        <rect x={dir === 1 ? -1 : L} y={8.5} width={1} height={3} fill="none" stroke={C.text} strokeOpacity={0.6} strokeWidth={sw} />
      </g>
    );
  };
  return (
    <g>
      <defs>
        <clipPath id="hbClip">
          <rect x={-1.2} y={0} width={L + 2.4} height={W} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={L} height={W} {...line} />
      <line x1={L / 2} y1={0} x2={L / 2} y2={W} {...line} />
      <g clipPath="url(#hbClip)">
        {end(0)}
        {end(L)}
      </g>
    </g>
  );
};

const Soccer: React.FC<{ sw: number; stroke: string }> = ({ sw, stroke }) => {
  const line = { fill: 'none', stroke, strokeWidth: sw } as const;
  return (
    <g>
      <rect x={0} y={0} width={105} height={68} {...line} />
      <line x1={52.5} y1={0} x2={52.5} y2={68} {...line} />
      <circle cx={52.5} cy={34} r={9.15} {...line} />
      {[0, 105].map((gx) => {
        const box = (depth: number, half: number) => <rect x={gx === 0 ? 0 : 105 - depth} y={34 - half} width={depth} height={2 * half} {...line} />;
        return (
          <g key={gx}>
            {box(16.5, 20.16)}
            {box(5.5, 9.16)}
            <rect x={gx === 0 ? -2 : 105} y={30.34} width={2} height={7.32} fill="none" stroke={C.text} strokeOpacity={0.6} strokeWidth={sw} />
          </g>
        );
      })}
    </g>
  );
};

const Football: React.FC<{ sw: number; stroke: string }> = ({ sw, stroke }) => {
  const L = 109.7;
  const W = 48.8;
  const yd = 0.9144;
  const line = { fill: 'none', stroke, strokeWidth: sw } as const;
  const lines = Array.from({ length: 21 }, (_, i) => 10 * yd + i * 5 * yd);
  return (
    <g>
      <rect x={0} y={0} width={10 * yd} height={W} fill={alpha(C.accent, 0.1)} />
      <rect x={L - 10 * yd} y={0} width={10 * yd} height={W} fill={alpha(C.accent, 0.1)} />
      <rect x={0} y={0} width={L} height={W} {...line} />
      {lines.map((x, i) => (
        <line key={i} x1={x} y1={0} x2={x} y2={W} {...line} strokeWidth={i % 2 === 0 ? sw : sw * 0.6} />
      ))}
      {/* Hash marks every yard. */}
      {Array.from({ length: 99 }, (_, i) => 11 * yd + i * yd).map((x, i) =>
        i % 5 === 4 ? null : (
          <g key={`h${i}`}>
            <line x1={x} y1={W * 0.36} x2={x} y2={W * 0.36 + 0.6} {...line} strokeWidth={sw * 0.6} />
            <line x1={x} y1={W * 0.64 - 0.6} x2={x} y2={W * 0.64} {...line} strokeWidth={sw * 0.6} />
          </g>
        ),
      )}
    </g>
  );
};

export const FieldMarkings: React.FC<{ sport: string; sw: number; stroke?: string }> = ({ sport, sw, stroke = alpha(C.muted, 0.55) }) => {
  if (sport === 'basketball') return <Basketball sw={sw} stroke={stroke} />;
  if (sport === 'handball') return <Handball sw={sw} stroke={stroke} />;
  if (sport === 'soccer') return <Soccer sw={sw} stroke={stroke} />;
  if (sport === 'american_football') return <Football sw={sw} stroke={stroke} />;
  return null;
};

/** Mix two `#rrggbb` colours: p = 0 gives a, 1 gives b. */
export function mix(a: string, b: string, p: number): string {
  const h = (s: string) => parseInt(s.slice(1), 16);
  const q = Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0));
  const x = h(a);
  const y = h(b);
  const ch = (sh: number) => Math.round(((x >> sh) & 255) * (1 - q) + ((y >> sh) & 255) * q);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
