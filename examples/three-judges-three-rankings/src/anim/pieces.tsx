// SVG drawing pieces shared by the judge scenes: judge chips, blind answer cards with tinted ink,
// podium tokens, the balance scale, verdict stamps, crowns and coins. Brand tokens and the three
// family colours only (brand.ts); Inter.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { MODEL, SHORT, type Fam } from './judges.ts';
import type { CardKind, PanItem } from './JudgeBench.state.ts';

export const FAM_C: Record<Fam, string> = { gpt: C.gpt, grok: C.grok, claude: C.claude };
const c01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/** Gradient defs every stage SVG carries (id "jgrad" for accent text). */
export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="jgrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={C.accentText} />
      <stop offset="1" stopColor={C.accent2} />
    </linearGradient>
  </defs>
);

/** Full-stage SVG in stage pixels (960 x 1090). */
export const StageSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 960 1090" width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible', fontFamily }}>
    <Defs />
    {children}
  </svg>
);

export const glowStyle = (color: string, glow: number, px = 22): React.CSSProperties =>
  glow > 0.01 ? { filter: `drop-shadow(0 0 ${px * glow}px ${color}) drop-shadow(0 0 ${px * 0.4 * glow}px ${color})` } : {};

/** A judge chip: the family name big, the model small, a clipboard when it judges. */
export const Chip: React.FC<{ fam: Fam; x: number; y: number; appear: number; glow?: number; dim?: number; clip?: number; w?: number }> = ({
  fam,
  x,
  y,
  appear,
  glow = 0,
  dim = 0,
  clip = 0,
  w = 256,
}) => {
  const col = FAM_C[fam];
  const h = 98;
  const tx = x + 16 * c01(clip);
  return (
    <g opacity={c01(appear) * (1 - 0.65 * c01(dim))} transform={`translate(0 ${(1 - c01(appear)) * -24})`} style={glowStyle(col, glow, 26)}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={22} fill={alpha(col, 0.16 + 0.2 * glow)} stroke={col} strokeWidth={3.5} />
      <text x={tx} y={y + 2} textAnchor="middle" fontSize={42} fontWeight={800} fill={C.text}>
        {SHORT[fam]}
      </text>
      <text x={tx} y={y + 34} textAnchor="middle" fontSize={24} fontWeight={600} fill={alpha(C.text, 0.72)}>
        {MODEL[fam]}
      </text>
      {clip > 0.01 && (
        <g opacity={c01(clip)} transform={`translate(${x - w / 2 + 34} ${y})`}>
          <rect x={-15} y={-20} width={30} height={40} rx={5} fill={alpha(col, 0.25)} stroke={col} strokeWidth={3} />
          <rect x={-8} y={-25} width={16} height={9} rx={3} fill={col} />
          <path d="M-8 -4 H8 M-8 4 H8 M-8 12 H3" stroke={col} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const LINE_W = [0.82, 0.64, 0.9, 0.55, 0.76, 0.46, 0.7, 0.6, 0.84];

/** Text lines of a card: grey ink cross-fading into the author's colour ("house style"). */
const Ink: React.FC<{ x: number; y: number; w: number; h: number; col: string; tint: number; kind: CardKind }> = ({ x, y, w, h, col, tint, kind }) => {
  const lh = Math.max(7, Math.min(16, h * 0.075));
  const gap = lh * 1.05;
  const n = Math.max(1, Math.floor((h + gap * 0.2) / (lh + gap)));
  const lines = [];
  const indent = kind === 'code';
  for (let i = 0; i < n; i++) {
    const ind = indent && i > 0 && i < n - 1 ? w * 0.12 : 0;
    const lw = (w - ind) * LINE_W[i % LINE_W.length];
    const ly = y + i * (lh + gap);
    lines.push(
      <g key={i}>
        <rect x={x + ind} y={ly} width={lw} height={lh} rx={lh / 2} fill={alpha('#cbd5e1', 0.36 * (1 - tint))} />
        <rect x={x + ind} y={ly} width={lw} height={lh} rx={lh / 2} fill={alpha(col, 0.9 * tint)} />
      </g>,
    );
  }
  return <>{lines}</>;
};

/** A blind answer card (or a row of a column), optionally turning into a podium token. */
export const AnswerCard: React.FC<{
  author: Fam;
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  appear?: number;
  tint?: number;
  blind?: number;
  glow?: number;
  token?: number;
  flip?: number;
  kind?: CardKind;
}> = ({ author, x, y, w, h, rot = 0, appear = 1, tint = 0, blind = 1, glow = 0, token = 0, flip = 1, kind = 'text' }) => {
  const col = FAM_C[author];
  const a = c01(appear);
  if (a <= 0.001) return null;
  if (kind === 'row') {
    return (
      <g opacity={a} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * a} 1)`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={alpha(col, 0.32 * tint + 0.06)} stroke={alpha(col, 0.85 * tint + 0.1)} strokeWidth={2} />
        <rect x={-w / 2 + 14} y={-3} width={w * 0.55} height={6} rx={3} fill={alpha(col, 0.9 * tint)} />
      </g>
    );
  }
  const tk = c01(token);
  const strip = Math.max(10, Math.min(36, h * 0.16));
  const pad = Math.max(8, w * 0.1);
  const body = 1 - tk;
  return (
    <g opacity={a} transform={`translate(${x} ${y}) rotate(${rot}) scale(${Math.max(0.02, c01(flip))} 1)`} style={glowStyle(col, glow, 24)}>
      {body > 0.01 && (
        <g opacity={body}>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(16, w * 0.1)} fill={C.card} stroke={glow > 0.05 ? alpha(col, 0.5 + 0.5 * glow) : alpha('#ffffff', 0.16)} strokeWidth={glow > 0.05 ? 4 : 2} />
          {/* Name strip: the author's name, blacked out when blind. */}
          <rect x={-w / 2 + pad * 0.6} y={-h / 2 + pad * 0.6} width={w - pad * 1.2} height={strip} rx={strip * 0.25} fill={alpha(col, 0.22 * (1 - blind))} />
          {blind < 0.99 && strip > 18 && (
            <text x={0} y={-h / 2 + pad * 0.6 + strip * 0.74} textAnchor="middle" fontSize={strip * 0.72} fontWeight={800} fill={col} opacity={1 - blind}>
              {SHORT[author]}
            </text>
          )}
          <rect x={-w / 2 + pad * 0.6} y={-h / 2 + pad * 0.6} width={(w - pad * 1.2) * c01(blind)} height={strip} rx={strip * 0.25} fill="#000000" stroke={alpha('#ffffff', 0.12)} strokeWidth={1.5} />
          {kind === 'msg' && (
            <g transform={`translate(${-w / 2 + pad + 12} ${-h / 2 + pad * 0.6 + strip + 26})`}>
              <circle r={13} fill="none" stroke={alpha(tint > 0.3 ? col : C.muted, 0.9)} strokeWidth={3} />
              <path d="M0 -6 V2 M0 6.5 V7" stroke={alpha(tint > 0.3 ? col : C.muted, 0.9)} strokeWidth={3} strokeLinecap="round" />
            </g>
          )}
          {kind === 'code' && (
            <text x={-w / 2 + pad} y={-h / 2 + pad * 0.6 + strip + 34} fontSize={28} fontWeight={800} fill={alpha(tint > 0.3 ? col : C.muted, 0.95)}>
              {'{ }'}
            </text>
          )}
          <Ink
            x={-w / 2 + pad + (kind === 'msg' || kind === 'code' ? 46 : 0)}
            y={-h / 2 + pad * 0.6 + strip + pad * 0.9}
            w={w - 2 * pad - (kind === 'msg' || kind === 'code' ? 46 : 0)}
            h={h - strip - pad * 2.2}
            col={col}
            tint={c01(tint)}
            kind={kind}
          />
        </g>
      )}
      {tk > 0.01 && <Token fam={author} x={0} y={0} w={w} h={h} opacity={tk} />}
    </g>
  );
};

/** A solid podium token: the family's colour and name. */
export const Token: React.FC<{ fam: Fam; x: number; y: number; w?: number; h?: number; opacity?: number; glow?: number }> = ({ fam, x, y, w = 94, h = 54, opacity = 1, glow = 0 }) => {
  const col = FAM_C[fam];
  return (
    <g opacity={c01(opacity)} style={glowStyle(col, glow, 26)}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={12} fill={col} />
      <text x={x} y={y + Math.min(h, 54) * 0.17} textAnchor="middle" fontSize={Math.min(24, h * 0.46)} fontWeight={800} fill={C.bg0}>
        {SHORT[fam]}
      </text>
    </g>
  );
};

/** A podium for one judge: three steps, heights from the win scores, colours of who stands there. */
export const PodiumSteps: React.FC<{ x: number; baseY: number; steps: { fam: Fam; dx: number; h: number; text?: string }[]; rise: number; values?: number }> = ({
  x,
  baseY,
  steps,
  rise,
  values = 0,
}) => (
  <g>
    {steps.map((s, i) => {
      const h = Math.max(0, s.h * c01(rise));
      const col = FAM_C[s.fam];
      return (
        <g key={i}>
          <rect x={x + s.dx - 45} y={baseY - h} width={90} height={h} rx={6} fill={alpha(col, 0.22)} stroke={alpha(col, 0.75)} strokeWidth={2.5} />
          {s.text && values > 0.01 && h > 40 && (
            <text x={x + s.dx} y={baseY - h + 40} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.text} opacity={c01(values)}>
              {s.text}
            </text>
          )}
        </g>
      );
    })}
    <rect x={x - 150} y={baseY} width={300} height={6} rx={3} fill={alpha('#ffffff', 0.35 * c01(rise))} />
  </g>
);

/** Verdict stamp: a circle with a tick; as a coin (coin = 1) it spins (scaleX = spin). */
export const Stamp: React.FC<{ fam: Fam; x: number; y: number; r: number; pop: number; opacity: number; spin?: number; coin?: number }> = ({
  fam,
  x,
  y,
  r,
  pop,
  opacity,
  spin = 1,
  coin = 0,
}) => {
  const col = FAM_C[fam];
  const sc = 1.8 - 0.8 * c01(pop);
  const cn = c01(coin);
  const sx = cn > 0.5 ? Math.max(0.04, Math.abs(spin)) : 1;
  const face = spin >= 0;
  return (
    <g opacity={c01(opacity)} transform={`translate(${x} ${y}) scale(${sc * sx} ${sc})`}>
      <circle r={r} fill={cn > 0.5 ? (face ? col : alpha(col, 0.45)) : alpha(C.bg0, 0.9)} stroke={col} strokeWidth={6} />
      {cn > 0.5 ? (
        <text y={r * 0.36} textAnchor="middle" fontSize={r * 1.05} fontWeight={800} fill={C.bg0}>
          {face ? '✓' : '?'}
        </text>
      ) : (
        <path d={`M${-r * 0.45} 0 L${-r * 0.1} ${r * 0.38} L${r * 0.5} ${-r * 0.36}`} fill="none" stroke={col} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </g>
  );
};

// Pops in place (short drop + scale) so it never sweeps across the judge chip above it.
export const Crown: React.FC<{ fam: Fam; x: number; y: number; drop: number }> = ({ fam, x, y, drop }) => {
  const d = c01(drop);
  if (d <= 0.001) return null;
  const col = FAM_C[fam];
  return (
    <g opacity={Math.min(1, d * 1.6)} transform={`translate(${x} ${y - (1 - d) * 26}) scale(${0.55 + 0.45 * d})`} style={glowStyle(col, d, 16)}>
      <path d="M-34 14 L-38 -22 L-17 -4 L0 -30 L17 -4 L38 -22 L34 14 Z" fill={col} stroke={C.bg0} strokeWidth={3} strokeLinejoin="round" />
      <rect x={-34} y={14} width={68} height={10} rx={3} fill={col} />
    </g>
  );
};

/** The balance scale: post, beam tilted by `tilt` degrees (positive = left pan down), two pans. */
export const Scale: React.FC<{
  cx: number;
  pivotY: number;
  half: number;
  hang: number;
  baseY: number;
  tilt: number;
  appear: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
}> = ({ cx, pivotY, half, hang, baseY, tilt, appear, left, right }) => {
  const a = (tilt * Math.PI) / 180;
  const lx = cx - half * Math.cos(a);
  const ly = pivotY + half * Math.sin(a);
  const rx = cx + half * Math.cos(a);
  const ry = pivotY - half * Math.sin(a);
  const metal = alpha('#cbd5e1', 0.75);
  const pan = (x: number, y: number, content: React.ReactNode) => (
    <g>
      <path d={`M${x} ${y} L${x - 100} ${y + hang} M${x} ${y} L${x + 100} ${y + hang}`} stroke={alpha('#cbd5e1', 0.5)} strokeWidth={2.5} />
      <path d={`M${x - 122} ${y + hang} Q${x} ${y + hang + 34} ${x + 122} ${y + hang}`} fill={alpha('#cbd5e1', 0.18)} stroke={metal} strokeWidth={4} />
      <g transform={`translate(${x} ${y + hang - 2})`}>{content}</g>
    </g>
  );
  return (
    <g opacity={c01(appear)}>
      <path d={`M${cx - 130} ${baseY} L${cx + 130} ${baseY} L${cx + 80} ${baseY - 26} L${cx - 80} ${baseY - 26} Z`} fill={alpha('#cbd5e1', 0.22)} stroke={metal} strokeWidth={3} />
      <rect x={cx - 7} y={pivotY} width={14} height={baseY - 26 - pivotY} fill={alpha('#cbd5e1', 0.45)} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={metal} strokeWidth={10} strokeLinecap="round" />
      <circle cx={cx} cy={pivotY} r={15} fill={C.bg1} stroke={metal} strokeWidth={4} />
      {pan(lx, ly, left)}
      {pan(rx, ry, right)}
    </g>
  );
};

/** What sits on a pan: a labelled system box or an answer card, bottom at y = 0. */
export const PanThing: React.FC<{ item: PanItem | null }> = ({ item }) => {
  if (!item || item.appear <= 0.001) return null;
  const col = FAM_C[item.fam];
  const drop = (1 - c01(item.appear)) * -140;
  if (item.kind === 'box') {
    const [a, b] = item.label.split(' ');
    return (
      <g opacity={c01(item.appear)} transform={`translate(0 ${drop})`}>
        <rect x={-120} y={-150} width={240} height={146} rx={20} fill={C.card} />
        <rect x={-120} y={-150} width={240} height={146} rx={20} fill={alpha(col, 0.18)} stroke={col} strokeWidth={4} />
        <text x={0} y={-86} textAnchor="middle" fontSize={44} fontWeight={800} fill={C.text}>
          {a}
        </text>
        <text x={0} y={-38} textAnchor="middle" fontSize={32} fontWeight={600} fill={alpha(C.text, 0.75)}>
          {b}
        </text>
      </g>
    );
  }
  return (
    <g transform={`translate(0 ${drop})`}>
      <AnswerCard author={item.fam} x={0} y={-68} w={210} h={128} appear={item.appear} tint={0.85} blind={1} glow={item.glow} kind={item.kind} />
    </g>
  );
};
