import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { frameState, type VerdictCardProps } from './VerdictCard.state.ts';
import { StageSvg } from './pieces.tsx';

export { frameState };

const Panel: React.FC<{ x: number; head: string; lines: [string, string]; color: string; good: boolean; appear: number; ghost: number; stamp: number; text: number }> = ({
  x,
  head,
  lines,
  color,
  good,
  appear,
  ghost,
  stamp,
  text,
}) => {
  const w = 430;
  const y = 300;
  const h = 600;
  const op = Math.max(appear, ghost * 0.4);
  const sc = 1.8 - 0.8 * stamp;
  return (
    <g opacity={op} transform={`translate(0 ${(1 - op) * 30})`}>
      <rect x={x} y={y} width={w} height={h} rx={28} fill={alpha(C.card, 0.95)} stroke={appear > 0.5 ? color : alpha('#ffffff', 0.2)} strokeWidth={appear > 0.5 ? 5 : 2.5} />
      <text x={x + w / 2} y={y + 76} textAnchor="middle" fontSize={46} fontWeight={800} fill={C.text}>
        {head}
      </text>
      <text x={x + w / 2} y={y + 116} textAnchor="middle" fontSize={26} fontWeight={600} fill={C.muted}>
        {good ? 'checkable answer' : 'a matter of taste'}
      </text>
      {stamp < 0.3 && (
        <text x={x + w / 2} y={y + 330} textAnchor="middle" fontSize={130} fontWeight={800} fill={alpha(C.muted, 0.6)}>
          ?
        </text>
      )}
      {stamp > 0.01 && (
        <g opacity={Math.min(1, stamp * 1.5)} transform={`translate(${x + w / 2} ${y + 280}) scale(${sc}) rotate(-6)`}>
          <circle r={96} fill={alpha(color, 0.14)} stroke={color} strokeWidth={12} />
          {good ? (
            <path d="M-44 2 L-12 36 L48 -36" fill="none" stroke={color} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M-38 -38 L38 38 M38 -38 L-38 38" fill="none" stroke={color} strokeWidth={18} strokeLinecap="round" />
          )}
        </g>
      )}
      <g opacity={text} transform={`translate(0 ${(1 - text) * 16})`}>
        <text x={x + w / 2} y={y + 480} textAnchor="middle" fontSize={54} fontWeight={800} fill={C.text}>
          {lines[0]}
        </text>
        <text x={x + w / 2} y={y + 546} textAnchor="middle" fontSize={54} fontWeight={800} fill={color}>
          {lines[1]}
        </text>
      </g>
    </g>
  );
};

/** The verdict: harmless on objective work, unusable on subjective work. */
export const VerdictCard: React.FC<AnimProps & VerdictCardProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <Stage vertical={p.vertical} fill>
      <StageSvg>
        <text x={480} y={110} textAnchor="middle" fontSize={104} fontWeight={800} fill="url(#jgrad)" letterSpacing="0.06em" opacity={s.title}>
          VERDICT
        </text>
        <text x={480} y={190} textAnchor="middle" fontSize={34} fontWeight={600} fill={C.muted} opacity={s.sub}>
          a judge from a family you're testing is…
        </text>
        <Panel x={40} head="objective" lines={['close to', 'harmless']} color={C.ok} good appear={s.left} ghost={0} stamp={s.leftStamp} text={s.leftText} />
        <Panel x={490} head="subjective" lines={['close to', 'unusable']} color={C.flat} good={false} appear={s.right} ghost={s.rightGhost} stamp={s.rightStamp} text={s.rightText} />
        <text x={480} y={990} textAnchor="middle" fontSize={30} fontWeight={600} fill={C.muted} opacity={s.foot}>
          one run · 15 tasks · one model per family
        </text>
      </StageSvg>
    </Stage>
  );
};
