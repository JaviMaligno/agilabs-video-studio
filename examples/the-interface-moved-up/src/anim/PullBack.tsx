import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { frameState as quoteState } from './KeyQuote.state.ts';
import {
  APP,
  BOX,
  CLOUD,
  CODE,
  CONTRACT,
  DASH,
  LADDER,
  LANES,
  LAPTOP,
  LEGEND_Y,
  P3,
  SH,
  SLAB,
  START,
  SW,
  TERM,
  TITLE,
  TOOLS,
  belt,
  frameState,
  type Item,
  type Place,
  type PullBackProps,
  type PullBackState,
} from './PullBack.state.ts';

export { frameState };
export type { PullBackProps };

// ---------------------------------------------------------------- small pieces

/** Rough Inter advance widths (em), to place the caret after typed code. */
const charW = (ch: string): number => {
  if ('il.,:;|!\''.includes(ch)) return 0.27;
  if ('()[]{}'.includes(ch)) return 0.34;
  if ('rtfj '.includes(ch)) return 0.37;
  if ('mw'.includes(ch)) return 0.84;
  if (/[A-Z]/.test(ch)) return 0.68;
  return 0.57;
};
const textW = (s: string, size: number) => [...s].reduce((a, ch) => a + charW(ch), 0) * size;

/**
 * Text that turns into a grey bar once it is too small to read on screen (k = screen px per local
 * unit), so far-away levels do not shimmer.
 */
const Tx: React.FC<{
  x: number;
  y: number;
  size: number;
  k: number;
  children: string;
  fill?: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
  grad?: boolean;
}> = ({ x, y, size, k, children, fill = C.text, weight = 500, anchor = 'start', opacity = 1, grad }) => {
  if (opacity <= 0.001) return null;
  if (size * k < 8) {
    const w = textW(children, size);
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    return <rect x={x0} y={y - size * 0.62} width={w} height={size * 0.5} rx={size * 0.2} fill={alpha(C.muted, 0.38)} opacity={opacity} />;
  }
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={grad ? 'url(#pbGrad)' : fill} textAnchor={anchor} opacity={opacity}>
      {children}
    </text>
  );
};

const Check: React.FC<{ x: number; y: number; r: number; pop: number; k: number }> = ({ x, y, r, pop, k }) => {
  if (pop <= 0) return null;
  const s = 0.6 + 0.4 * pop;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={pop}>
      <circle r={r} fill={alpha(C.ok, 0.18)} stroke={C.ok} strokeWidth={Math.max(2 / k, r * 0.1)} />
      <path d={`M ${-r * 0.42} 0 L ${-r * 0.1} ${r * 0.32} L ${r * 0.45} ${-r * 0.35}`} fill="none" stroke={C.ok} strokeWidth={r * 0.18} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Ring: React.FC<{ x: number; y: number; w: number; h: number; v: number; k: number; r?: number }> = ({ x, y, w, h, v, k, r = 16 }) =>
  v <= 0 ? null : (
    <g opacity={v}>
      <rect x={x - 6 / k} y={y - 6 / k} width={w + 12 / k} height={h + 12 / k} rx={r} fill="none" stroke={C.accentText} strokeWidth={10 / k} opacity={0.25} />
      <rect x={x - 3 / k} y={y - 3 / k} width={w + 6 / k} height={h + 6 / k} rx={r} fill="none" stroke="url(#pbGrad)" strokeWidth={4 / k} />
    </g>
  );

// ---------------------------------------------------------------- level 2: the line, the diff, the terminal

const Level2: React.FC<{ s: PullBackState; k: number; t: number }> = ({ s, k, t }) => {
  if (BOX.w * k < 6) return <rect x={0} y={0} width={BOX.w} height={BOX.h} fill={alpha(C.accent, 0.3)} />;
  const d = 1 - s.editor; // diff look
  const card = CODE.card;
  const { rowH, lineY, font } = CODE;
  const tx0 = CODE.textX + CODE.indent;
  const fnY = lineY - rowH - rowH * d;
  const minusY = lineY - rowH;
  const closeY = lineY + rowH;
  const paneFrame = Math.min(1, Math.max(0, (s.alt - 1.92) / 0.3));
  const typed = CODE.typed.slice(0, Math.round(s.typed));
  const caretX = tx0 + textW(typed, font);
  const ghostCol = s.accept > 0 ? `color-mix(in srgb, ${C.text} ${Math.round(s.accept * 100)}%, ${C.muted})` : C.muted;
  const termShown = Math.floor(s.termLines);
  const termPart = s.termLines - termShown;
  const gutter = (y: number, num: string, sign: string, signCol: string) => (
    <>
      <Tx x={70} y={y + 37} size={font} k={k} fill={C.muted} anchor="middle" opacity={0.6 * s.editor}>
        {num}
      </Tx>
      <Tx x={70} y={y + 37} size={font} k={k} fill={signCol} weight={700} anchor="middle" opacity={d}>
        {sign}
      </Tx>
    </>
  );
  return (
    <g>
      <rect x={0} y={0} width={BOX.w} height={BOX.h} rx={34} fill={C.bg1} stroke={alpha(C.accentText, 0.5)} strokeWidth={4} opacity={paneFrame} />
      {/* The editor that becomes the diff. */}
      <rect x={card.x} y={card.y} width={card.w} height={card.h} rx={22} fill={C.card} stroke={C.line} strokeWidth={3} />
      <Tx x={card.x + 30} y={card.y + 42} size={24} k={k} fill={C.muted} weight={600} opacity={s.editor}>
        render.ts
      </Tx>
      <Tx x={card.x + 30} y={card.y + 42} size={24} k={k} fill={C.accentText} weight={700} opacity={d}>
        diff · render.ts
      </Tx>
      <line x1={card.x} x2={card.x + card.w} y1={card.y + 62} y2={card.y + 62} stroke={C.line} strokeWidth={2} />
      {/* function row */}
      {gutter(fnY, '1', ' ', C.muted)}
      <Tx x={CODE.textX} y={fnY + 37} size={font} k={k} fill={alpha(C.text, 0.75)}>
        {'function render(items) {'}
      </Tx>
      {/* the removed line, diff only */}
      <g opacity={d}>
        <rect x={card.x + 6} y={minusY + 4} width={card.w - 12} height={rowH - 8} rx={8} fill={alpha(C.hot, 0.12)} />
        {gutter(minusY, '', '−', C.hot)}
        <Tx x={tx0} y={minusY + 37} size={font} k={k} fill={alpha(C.text, 0.6)}>
          return items;
        </Tx>
      </g>
      {/* the line */}
      <rect x={card.x + 6} y={lineY + 4} width={card.w - 12} height={rowH - 8} rx={8} fill={alpha(C.accent, 0.13 * s.editor)} />
      <rect x={card.x + 6} y={lineY + 4} width={card.w - 12} height={rowH - 8} rx={8} fill={alpha(C.ok, 0.14 * d)} />
      {s.nested[2] > 0 && <rect x={card.x + 2} y={lineY} width={card.w - 4} height={rowH} rx={10} fill="none" stroke={C.accentText} strokeWidth={6 / k} opacity={s.nested[2]} />}
      {gutter(lineY, '2', '+', C.ok)}
      {font * k < 8 ? (
        <rect x={tx0} y={lineY + 20} width={textW(CODE.typed + CODE.ghost, font)} height={font * 0.5} rx={5} fill={alpha(C.ok, 0.6)} />
      ) : (
        <text x={tx0} y={lineY + 37} fontSize={font} fontWeight={500} fill={C.text}>
          <tspan>{typed}</tspan>
          {s.ghost > 0 && (
            <tspan fill={ghostCol} opacity={0.55 + 0.45 * Math.max(s.ghost * 0.5, s.accept)} fontStyle={s.accept < 0.5 ? 'italic' : 'normal'}>
              {CODE.ghost}
            </tspan>
          )}
        </text>
      )}
      {s.cursor > 0 && <rect x={caretX + 2} y={lineY + 12} width={3} height={32} fill={C.accentText} opacity={s.cursor} />}
      {/* closing brace row */}
      {gutter(closeY, '3', ' ', C.muted)}
      <Tx x={CODE.textX} y={closeY + 37} size={font} k={k} fill={alpha(C.text, 0.75)}>
        {'}'}
      </Tx>
      {/* Tab accepts the completion */}
      {s.tabKey > 0 && (
        <g opacity={s.tabKey} transform={`translate(400 ${closeY + 4})`}>
          <rect x={0} y={0} width={104} height={48} rx={10} fill={alpha(C.accent, 0.25)} stroke={C.accentText} strokeWidth={2.5} />
          <text x={52} y={33} fontSize={24} fontWeight={700} fill={C.text} textAnchor="middle">
            Tab ⇥
          </text>
        </g>
      )}
      {/* the reviewer's eye-line, then the check */}
      {s.sweep > 0 && s.sweep < 1 && (
        <g opacity={Math.sin(Math.PI * s.sweep)}>
          <rect x={card.x + 8} y={card.y + 70 + s.sweep * (card.h - 90)} width={card.w - 16} height={5} rx={2.5} fill="url(#pbGrad)" />
          <rect x={card.x + 8} y={card.y + 50 + s.sweep * (card.h - 90)} width={card.w - 16} height={45} fill={alpha(C.accent, 0.1)} />
        </g>
      )}
      <Check x={card.x + card.w - 54} y={lineY + rowH / 2} r={22} pop={s.check * d} k={k} />
      <Ring x={card.x} y={card.y} w={card.w} h={card.h} v={s.nested[1]} k={k} r={22} />
      {/* The terminal: commands run by themselves. */}
      <g opacity={s.chrome}>
        <rect x={TERM.card.x} y={TERM.card.y} width={TERM.card.w} height={TERM.card.h} rx={22} fill={C.bg1} stroke={C.line} strokeWidth={3} />
        <Tx x={TERM.card.x + 30} y={TERM.card.y + 42} size={24} k={k} fill={C.muted} weight={600}>
          terminal
        </Tx>
        <line x1={TERM.card.x} x2={TERM.card.x + TERM.card.w} y1={TERM.card.y + 62} y2={TERM.card.y + 62} stroke={C.line} strokeWidth={2} />
        {TERM.lines.map((ln, i) => {
          const op = i < termShown ? 1 : i === termShown ? termPart : 0;
          return (
            <Tx key={i} x={TERM.card.x + 32} y={TERM.card.y + 108 + i * TERM.lineH} size={TERM.font} k={k} fill={ln.startsWith('✓') ? C.ok : C.text} opacity={op}>
              {ln}
            </Tx>
          );
        })}
        <Ring x={TERM.card.x} y={TERM.card.y} w={TERM.card.w} h={TERM.card.h} v={s.nested[0]} k={k} r={22} />
        {/* Wires from the shell to the machine's tools. */}
        {TOOLS.xs.map((x, i) => {
          const y0 = TERM.card.y + TERM.card.h;
          const path = `M 372 ${y0} C 372 ${y0 + 50}, ${x} ${TOOLS.y - TOOLS.r - 50}, ${x} ${TOOLS.y - TOOLS.r}`;
          const w = Math.min(1, Math.max(0, s.wires * 1.3 - i * 0.1));
          return (
            <g key={i}>
              <path d={path} fill="none" stroke={C.accentText} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - w} opacity={0.8} />
              <g opacity={w}>
                <circle cx={x} cy={TOOLS.y} r={TOOLS.r} fill={C.card} stroke={C.accentText} strokeWidth={3} />
                <ToolIcon i={i} x={x} y={TOOLS.y} t={t} />
                <Tx x={x} y={TOOLS.y + TOOLS.r + 40} size={26} k={k} fill={C.text} weight={600} anchor="middle">
                  {TOOLS.labels[i]}
                </Tx>
              </g>
            </g>
          );
        })}
      </g>
    </g>
  );
};

const ToolIcon: React.FC<{ i: number; x: number; y: number; t: number }> = ({ i, x, y }) => {
  const st = { fill: 'none', stroke: C.text, strokeWidth: 4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (i === 0) return <path d={`M ${x - 16} ${y} L ${x - 4} ${y + 12} L ${x + 18} ${y - 12}`} {...st} stroke={C.ok} />;
  if (i === 1)
    return (
      <g {...st}>
        <circle cx={x - 10} cy={y - 16} r={6} />
        <circle cx={x - 10} cy={y + 16} r={6} />
        <circle cx={x + 12} cy={y - 4} r={6} />
        <path d={`M ${x - 10} ${y - 10} L ${x - 10} ${y + 10} M ${x + 12} ${y + 2} C ${x + 12} ${y + 12}, ${x - 10} ${y + 2}, ${x - 10} ${y + 10}`} />
      </g>
    );
  if (i === 2)
    return (
      <g {...st}>
        <path d={`M ${x} ${y - 20} L ${x + 18} ${y - 10} L ${x + 18} ${y + 12} L ${x} ${y + 22} L ${x - 18} ${y + 12} L ${x - 18} ${y - 10} Z M ${x - 18} ${y - 10} L ${x} ${y} L ${x + 18} ${y - 10} M ${x} ${y} L ${x} ${y + 22}`} />
      </g>
    );
  return (
    <text x={x} y={y + 9} fontSize={28} fontWeight={800} fill={C.text} textAnchor="middle">
      {'>_'}
    </text>
  );
};

/** A generic session pane (the other agents on the laptop). */
const MiniPane: React.FC<{ seed: number }> = ({ seed }) => (
  <g>
    <rect x={0} y={0} width={BOX.w} height={BOX.h} rx={40} fill={C.bg1} stroke={alpha(C.accentText, 0.55)} strokeWidth={10} />
    <rect x={40} y={40} width={300} height={40} rx={20} fill={alpha(C.muted, 0.4)} />
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={40} y={130 + i * 95} width={220 + ((seed * 131 + i * 197) % 420)} height={36} rx={18} fill={i % 4 === 1 ? alpha(C.ok, 0.55) : alpha(C.muted, 0.32)} />
    ))}
  </g>
);

// ---------------------------------------------------------------- level 3: laptop, cloud, app

/** A {x, y, w, h} box as SVG rect attributes. */
const box = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x, y: r.y, width: r.w, height: r.h });

const place = (p: Place) => `translate(${p.x} ${p.y}) scale(${p.s})`;

const Level3: React.FC<{ s: PullBackState; k: number; t: number }> = ({ s, k, t }) => {
  const W = APP.win;
  const scr = LAPTOP.screen;
  const z = LAPTOP.bezel;
  const heatCol = `color-mix(in srgb, ${C.hot} ${Math.round(s.heat * 100)}%, ${C.accentText})`;
  return (
    <g>
      {/* Cloud */}
      {s.cloud > 0 && (
        <g opacity={s.cloud}>
          {(['stroke', 'fill'] as const).map((pass) => (
            <g key={pass}>
              {[
                [CLOUD.x + 120, CLOUD.y + 150, 110],
                [CLOUD.x + 260, CLOUD.y + 110, 140],
                [CLOUD.x + 420, CLOUD.y + 150, 115],
                [CLOUD.x + 190, CLOUD.y + 190, 90],
                [CLOUD.x + 350, CLOUD.y + 195, 85],
              ].map(([cx, cy, r], i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill={pass === 'fill' ? C.card : 'none'} stroke={pass === 'stroke' ? alpha(C.accentText, 0.7) : 'none'} strokeWidth={pass === 'stroke' ? 8 : 0} />
              ))}
            </g>
          ))}
          <Tx x={CLOUD.x + 272} y={CLOUD.y + 18} size={30} k={k} fill={C.accentText} weight={700} anchor="middle">
            cloud
          </Tx>
        </g>
      )}
      {/* Laptop */}
      {s.laptop > 0 && (
        <g opacity={s.laptop}>
          <rect x={scr.x - z} y={scr.y - z} width={scr.w + 2 * z} height={scr.h + 2 * z} rx={20} fill={C.bg0} stroke={heatCol} strokeWidth={5} />
          <path d={`M ${scr.x - 70} ${scr.y + scr.h + z + 34} L ${scr.x - z} ${scr.y + scr.h + z} L ${scr.x + scr.w + z} ${scr.y + scr.h + z} L ${scr.x + scr.w + 70} ${scr.y + scr.h + z + 34} Z`} fill={C.card} stroke={C.line} strokeWidth={3} />
          {s.heat > 0 && (
            <g opacity={s.heat}>
              <rect x={scr.x - z} y={scr.y - z} width={scr.w + 2 * z} height={scr.h + 2 * z} rx={20} fill="none" stroke={C.hot} strokeWidth={22} opacity={0.18} />
              {[0, 1, 2, 3].map((i) => {
                const x = scr.x + 70 + i * 105;
                const ph = t * 5 + i;
                const w = 9 * Math.sin(ph);
                return (
                  <path
                    key={i}
                    d={`M ${x} ${scr.y - 34} C ${x + w} ${scr.y - 54}, ${x - w} ${scr.y - 74}, ${x} ${scr.y - 94}`}
                    fill="none"
                    stroke={C.hot}
                    strokeWidth={5}
                    strokeLinecap="round"
                    opacity={0.35 + 0.3 * Math.sin(ph * 1.3)}
                  />
                );
              })}
              {/* load meter */}
              <rect x={scr.x + scr.w + 44} y={scr.y} width={26} height={scr.h} rx={13} fill={C.bg1} stroke={C.line} strokeWidth={3} />
              <rect x={scr.x + scr.w + 48} y={scr.y + scr.h - 4 - (scr.h - 8) * s.heat} width={18} height={(scr.h - 8) * s.heat} rx={9} fill="url(#pbHeat)" />
            </g>
          )}
        </g>
      )}
      {/* The app */}
      {s.app > 0 && (
        <g opacity={s.app}>
          <rect x={W.x} y={W.y} width={W.w} height={W.h} rx={26} fill={C.bg1} stroke={alpha(C.accentText, 0.55)} strokeWidth={4} />
          <line x1={W.x} x2={W.x + W.w} y1={W.y + APP.bar} y2={W.y + APP.bar} stroke={C.line} strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={W.x + 30 + i * 26} cy={W.y + 25} r={8} fill={alpha(C.muted, 0.5)} />
          ))}
          <line x1={APP.side.w} x2={APP.side.w} y1={W.y + APP.bar} y2={W.y + W.h} stroke={C.line} strokeWidth={3} />
          <Tx x={24} y={120} size={24} k={k} fill={C.muted} weight={700}>
            sessions
          </Tx>
          {APP.cards.map((c, i) => (
            <g key={i} opacity={s.cards[i]} transform={`translate(${(1 - s.cards[i]) * -30} 0)`}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={14} fill={i === 2 ? alpha(C.accent, 0.16) : C.card} stroke={i === 2 ? C.accentText : C.line} strokeWidth={i === 2 ? 3 : 2} />
              <circle cx={c.x + 24} cy={c.y + 32} r={8} fill={[C.muted, C.ok, C.accentText][i]} />
              <Tx x={c.x + 40} y={c.y + 41} size={23} k={k} fill={C.text} weight={600}>
                {APP.cardLabels[i]}
              </Tx>
              <rect x={c.x + 18} y={c.y + 58} width={[120, 150, 100][i]} height={10} rx={5} fill={alpha(C.muted, 0.35)} />
            </g>
          ))}
          {/* Rendered result: a preview page and a pull request with a green check. */}
          <g opacity={s.preview} transform={`translate(0 ${(1 - s.preview) * 24})`}>
            <rect {...box(APP.preview)} rx={16} fill={C.bg0} stroke={C.line} strokeWidth={3} />
            <rect x={APP.preview.x} y={APP.preview.y} width={APP.preview.w} height={36} rx={16} fill={C.card} />
            <rect x={APP.preview.x + 60} y={APP.preview.y + 11} width={180} height={14} rx={7} fill={alpha(C.muted, 0.35)} />
            <rect x={APP.preview.x + 22} y={APP.preview.y + 58} width={256} height={96} rx={12} fill="url(#pbGrad)" opacity={0.85} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={APP.preview.x + 22} y={APP.preview.y + 178 + i * 30} width={[230, 190, 240, 150][i]} height={13} rx={6.5} fill={alpha(C.muted, 0.4)} />
            ))}
            <rect x={APP.preview.x + 22} y={APP.preview.y + 300} width={110} height={36} rx={18} fill={C.accent} />
          </g>
          <g opacity={s.pr} transform={`translate(0 ${(1 - s.pr) * 24})`}>
            <rect {...box(APP.pr)} rx={16} fill={C.card} stroke={C.line} strokeWidth={3} />
            <Tx x={APP.pr.x + 22} y={APP.pr.y + 48} size={30} k={k} fill={C.text} weight={700}>
              Pull request
            </Tx>
            <Tx x={APP.pr.x + 22} y={APP.pr.y + 90} size={25} k={k} fill={C.ok} weight={600}>
              checks passed
            </Tx>
            <Check x={APP.pr.x + APP.pr.w - 44} y={APP.pr.y + 60} r={24} pop={s.pr} k={k} />
          </g>
          <g opacity={s.diffPanel}>
            <rect {...box(APP.diff)} rx={16} fill={C.card} stroke={C.line} strokeWidth={3} />
            <Tx x={APP.diff.x + 16} y={APP.diff.y + 42} size={26} k={k} fill={C.muted} weight={700}>
              diff ▸
            </Tx>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={APP.diff.x + 14} y={APP.diff.y + 310 + i * 36} width={[110, 80, 120, 70, 100][i]} height={12} rx={6} fill={alpha(C.muted, 0.3)} />
            ))}
          </g>
        </g>
      )}
      {/* Session panes: the other agents, then ours (level 2). */}
      {s.panes.map((p, i) =>
        i === 0 || p.opacity <= 0 ? null : (
          <g key={i} transform={place(p)} opacity={p.opacity}>
            <MiniPane seed={i} />
          </g>
        ),
      )}
      <g transform={place(s.panes[0])}>
        <Level2 s={s} k={k * s.panes[0].s} t={t} />
      </g>
      {/* The phone mirrors the sidebar. */}
      {s.phone > 0 && (
        <g opacity={s.phone} transform={`translate(${(1 - s.phone) * 260} 0)`}>
          <rect {...box(APP.phone)} rx={34} fill={C.bg0} stroke={alpha(C.accentText, 0.7)} strokeWidth={5} />
          <rect x={APP.phone.x + 70} y={APP.phone.y + 14} width={60} height={12} rx={6} fill={alpha(C.muted, 0.5)} />
          <Tx x={APP.phone.x + 22} y={APP.phone.y + 70} size={20} k={k} fill={C.muted} weight={700}>
            sessions
          </Tx>
          {APP.cards.map((_, i) => (
            <g key={i}>
              <rect x={APP.phone.x + 16} y={APP.phone.y + 92 + i * 78} width={168} height={64} rx={12} fill={i === 2 ? alpha(C.accent, 0.16) : C.card} stroke={i === 2 ? C.accentText : C.line} strokeWidth={2} />
              <circle cx={APP.phone.x + 36} cy={APP.phone.y + 124 + i * 78} r={7} fill={[C.muted, C.ok, C.accentText][i]} />
              <rect x={APP.phone.x + 52} y={APP.phone.y + 118 + i * 78} width={[60, 110, 100][i]} height={12} rx={6} fill={alpha(C.text, 0.55)} />
            </g>
          ))}
        </g>
      )}
      {/* Scene 7: the editor moves to a corner of the app, still lit. */}
      {s.editorCard > 0 && <EditorCard s={s} k={k} />}
    </g>
  );
};

const EditorCard: React.FC<{ s: PullBackState; k: number }> = ({ s, k }) => {
  const e = s.editorCard;
  const to = APP.editor;
  // From the line inside the collapsed diff panel to the bottom-left corner of the app.
  const fromX = s.panes[0].x + (CODE.card.x + 20) * s.panes[0].s;
  const fromY = s.panes[0].y + CODE.lineY * s.panes[0].s;
  const sc = 0.35 + 0.65 * e;
  const x = fromX + (to.x - fromX) * e;
  const y = fromY + (to.y - fromY) * e;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={Math.min(1, e * 3)}>
      <rect x={-8} y={-8} width={to.w + 16} height={to.h + 16} rx={20} fill="none" stroke={C.accentText} strokeWidth={10} opacity={0.22} />
      <rect x={0} y={0} width={to.w} height={to.h} rx={14} fill={C.card} stroke="url(#pbGrad)" strokeWidth={4} />
      <Tx x={16} y={34} size={20} k={k * sc} fill={C.accentText} weight={700}>
        editor
      </Tx>
      <Tx x={16} y={74} size={20} k={k * sc} fill={C.text} weight={500}>
        items.map(toRow);
      </Tx>
    </g>
  );
};

// ---------------------------------------------------------------- level 4: the world

const MiniApp: React.FC = () => (
  <g>
    <rect x={0} y={30} width={744} height={690} rx={30} fill={C.bg1} stroke={alpha(C.accentText, 0.55)} strokeWidth={9} />
    <line x1={240} x2={240} y1={80} y2={720} stroke={C.line} strokeWidth={6} />
    {[140, 245, 350].map((y, i) => (
      <rect key={i} x={16} y={y} width={208} height={90} rx={14} fill={C.card} />
    ))}
    <rect x={260} y={100} width={300} height={360} rx={16} fill={alpha(C.accent, 0.5)} />
    <rect x={260} y={480} width={300} height={120} rx={16} fill={C.card} />
    <rect x={574} y={100} width={158} height={500} rx={16} fill={C.card} />
  </g>
);

const ItemView: React.FC<{ it: Item }> = ({ it }) => {
  const { x, y, opacity } = it;
  if (opacity <= 0) return null;
  if (it.kind === 'bubble' || (it.kind === 'ticket' && it.morph < 0.5)) {
    const s = 1 - Math.min(1, it.morph * 2) * 0.3;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
        <path d="M -40 -26 h 80 a 12 12 0 0 1 12 12 v 30 a 12 12 0 0 1 -12 12 h -50 l -14 14 v -14 h -16 a 12 12 0 0 1 -12 -12 v -30 a 12 12 0 0 1 12 -12 z" fill={C.card} stroke={C.muted} strokeWidth={3} />
        {[0, 1].map((i) => (
          <rect key={i} x={-30} y={-12 + i * 16} width={[56, 40][i]} height={8} rx={4} fill={alpha(C.muted, 0.6)} />
        ))}
      </g>
    );
  }
  if (it.kind === 'ticket') {
    return (
      <g transform={`translate(${x} ${y})`} opacity={opacity}>
        <rect x={-44} y={-30} width={88} height={60} rx={8} fill={C.card} stroke={C.accentText} strokeWidth={3} />
        <rect x={-34} y={-18} width={30} height={10} rx={5} fill={C.accentText} />
        <rect x={-34} y={0} width={64} height={8} rx={4} fill={alpha(C.muted, 0.6)} />
        <rect x={-34} y={14} width={44} height={8} rx={4} fill={alpha(C.muted, 0.6)} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-46} y={-30} width={92} height={60} rx={10} fill={alpha(C.ok, 0.14)} stroke={C.ok} strokeWidth={3} />
      <text x={-30} y={9} fontSize={24} fontWeight={800} fill={C.text}>
        PR
      </text>
      <path d="M 12 0 L 20 9 L 34 -9" fill="none" stroke={C.ok} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Gauge: React.FC<{ x: number; y: number; r: number; v: number; needle: number; label: string }> = ({ x, y, r, v, needle, label }) => {
  if (v <= 0) return null;
  const a = Math.PI * (1 - needle * v);
  const arc = (from: number, to: number) => {
    const p0 = [x + r * Math.cos(Math.PI * (1 - from)), y - r * Math.sin(Math.PI * (1 - from))];
    const p1 = [x + r * Math.cos(Math.PI * (1 - to)), y - r * Math.sin(Math.PI * (1 - to))];
    return `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`;
  };
  return (
    <g opacity={v} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * v}) translate(${-x} ${-y})`}>
      <path d={arc(0, 1)} fill="none" stroke={C.line} strokeWidth={16} strokeLinecap="round" />
      <path d={arc(0, needle * v)} fill="none" stroke="url(#pbGrad)" strokeWidth={16} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + (r - 24) * Math.cos(a)} y2={y - (r - 24) * Math.sin(a)} stroke={C.text} strokeWidth={6} strokeLinecap="round" />
      <circle cx={x} cy={y} r={10} fill={C.text} />
      <text x={x} y={y + 52} fontSize={32} fontWeight={700} fill={C.text} textAnchor="middle">
        {label}
      </text>
    </g>
  );
};

const Level4: React.FC<{ s: PullBackState; k: number; t: number }> = ({ s, k, t }) => {
  const dimFill = 1 - 0.7 * s.windowsDim;
  return (
    <g>
      {/* Dashboard */}
      {s.dash > 0 && (
        <g opacity={s.dash}>
          <rect {...box(DASH.panel)} rx={26} fill={C.bg1} stroke={C.line} strokeWidth={3} />
          {DASH.gaugeX.map((x, i) => (
            <Gauge key={i} x={x} y={DASH.gaugeY} r={DASH.gaugeR} v={s.gauges[i]} needle={s.needles[i]} label={DASH.labels[i]} />
          ))}
          <g opacity={s.queue}>
            <rect {...box(DASH.queue)} rx={18} fill={C.card} stroke={alpha(C.accentText, 0.6)} strokeWidth={3} />
            <text x={DASH.queue.x + 26} y={DASH.queue.y + 53} fontSize={30} fontWeight={700} fill={C.text}>
              needs your judgement
            </text>
            {[0, 1, 2].map((i) => {
              const on = i < 2 ? 1 : s.bell.fly >= 1 ? 1 : 0;
              return (
                <rect
                  key={i}
                  x={DASH.queue.x + 420 + i * 92}
                  y={DASH.queue.y + 24}
                  width={78}
                  height={36}
                  rx={10}
                  fill={i === 2 ? alpha(C.accent, 0.5) : alpha(C.muted, 0.3)}
                  stroke={i === 2 ? C.accentText : 'none'}
                  strokeWidth={3}
                  opacity={on}
                />
              );
            })}
          </g>
        </g>
      )}
      {/* Conveyor */}
      {s.conveyor > 0 && (
        <g opacity={s.conveyor}>
          <text x={372} y={LEGEND_Y} fontSize={26} fontWeight={600} fill={C.muted} textAnchor="middle">
            feedback → ticket → agent → PR
          </text>
          {LANES.map((_lane, li) => {
            const op = li === 2 ? s.laneC : 1;
            const by = belt(li).y;
            return (
              <g key={li} opacity={op}>
                <line x1={0} x2={744} y1={by} y2={by} stroke={alpha(C.muted, 0.45)} strokeWidth={4} strokeDasharray="18 14" strokeDashoffset={-s.belt * 60} />
              </g>
            );
          })}
          {s.items.map((it, i) => (
            <g key={i} opacity={it.lane === 2 ? s.laneC : 1}>
              <ItemView it={it} />
            </g>
          ))}
          {[0, 2].map((li) => (
            <g key={li} opacity={li === 2 ? s.laneC : 1}>
              <g transform={place(LANES[li].tile)} opacity={dimFill}>
                <MiniApp />
              </g>
            </g>
          ))}
        </g>
      )}
      {/* Our tile: the whole app, with everything inside it. */}
      <g transform={place(P3)} opacity={s.conveyor > 0 ? 1 - 0.65 * s.windowsDim : 1}>
        <Level3 s={s} k={k * P3.s} t={t} />
      </g>
      {/* Tile glow while an agent works, outline flash on "the window". */}
      {s.conveyor > 0 &&
        LANES.map((lane, li) => {
          const r = { x: lane.tile.x, y: lane.tile.y + 30 * lane.tile.s, w: 744 * lane.tile.s, h: 690 * lane.tile.s };
          const glow = Math.max(s.busy[li] * 0.8, s.windowsFlash);
          const outline = s.windowsDim;
          const op = li === 2 ? s.laneC : 1;
          return (
            <g key={li} opacity={op * s.conveyor}>
              {glow > 0 && <rect x={r.x - 5} y={r.y - 5} width={r.w + 10} height={r.h + 10} rx={10} fill="none" stroke="url(#pbGrad)" strokeWidth={5} opacity={glow} />}
              {outline > 0 && <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={7} fill="none" stroke={C.muted} strokeWidth={3} opacity={outline} strokeDasharray="8 6" />}
              {s.tags[li] > 0 && (
                <g transform={`translate(${r.x - 14} ${r.y - 18}) rotate(-8) scale(${0.7 + 0.3 * s.tags[li]})`} opacity={s.tags[li]}>
                  <rect x={0} y={0} width={112} height={36} rx={18} fill={C.accent} />
                  <text x={56} y={26} fontSize={22} fontWeight={700} fill={C.text} textAnchor="middle">
                    preview
                  </text>
                </g>
              )}
            </g>
          );
        })}
      {/* The start button nobody presses. */}
      {s.start > 0 && (
        <g opacity={s.start * s.laneC * 0.9}>
          <rect {...box(START)} rx={27} fill="none" stroke={alpha(C.muted, 0.6)} strokeWidth={3} strokeDasharray="10 8" />
          <path d={`M ${START.x + 30} ${START.y + 15} L ${START.x + 52} ${START.y + 27} L ${START.x + 30} ${START.y + 39} Z`} fill={alpha(C.muted, 0.6)} />
          <text x={START.x + 66} y={START.y + 36} fontSize={26} fontWeight={600} fill={alpha(C.muted, 0.8)}>
            start
          </text>
        </g>
      )}
      {/* The harness under the conveyor: the contract. */}
      {s.slab > 0 && (
        <g opacity={s.slab} transform={`translate(0 ${(1 - s.slab) * 160})`}>
          <rect {...box(SLAB.harness)} rx={22} fill={alpha(C.accent, 0.2)} stroke="url(#pbGrad)" strokeWidth={4} />
          <text x={SLAB.harness.x + 28} y={SLAB.harness.y + 56} fontSize={40} fontWeight={800} fill="url(#pbGrad)">
            Harness
          </text>
          {CONTRACT.map((label, i) => {
            const v = s.contract[i];
            const row = i < 3 ? 0 : 1;
            const xs = [28, 262, 420, 28];
            const w = [218, 142, 160, 330][i];
            const x = SLAB.harness.x + xs[i];
            const y = SLAB.harness.y + 82 + row * 58;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect x={0} y={0} width={w} height={46} rx={23} fill={v > 0 ? alpha(C.accent, 0.25 + 0.6 * v) : C.card} stroke={v > 0 ? C.accentText : C.line} strokeWidth={3} />
                <text x={w / 2} y={32} fontSize={25} fontWeight={700} fill={v > 0.5 ? C.text : C.muted} textAnchor="middle">
                  {label}
                </text>
              </g>
            );
          })}
          <rect {...box(SLAB.model)} rx={16} fill={C.card} stroke={C.line} strokeWidth={3} />
          <text x={SLAB.model.x + 28} y={SLAB.model.y + 38} fontSize={26} fontWeight={700} fill={C.muted}>
            Model
          </text>
        </g>
      )}
      {/* The bell: a tile stops and asks a human. */}
      {s.bell.appear > 0 && s.bell.fly < 1 && (
        <Bell
          x={LANES[0].tile.x + 744 * LANES[0].tile.s + (DASH.queue.x + 420 + 2 * 92 + 39 - (LANES[0].tile.x + 744 * LANES[0].tile.s)) * s.bell.fly}
          y={LANES[0].tile.y + 20 + (DASH.queue.y + 42 - (LANES[0].tile.y + 20)) * s.bell.fly - Math.sin(Math.PI * s.bell.fly) * 60}
          v={s.bell.appear}
          t={t}
        />
      )}
    </g>
  );
};

const Bell: React.FC<{ x: number; y: number; v: number; t: number }> = ({ x, y, v, t }) => (
  <g transform={`translate(${x} ${y}) rotate(${12 * Math.sin(t * 22)}) scale(${0.6 + 0.4 * v})`} opacity={v}>
    <circle r={34} fill={C.accent} opacity={0.3} />
    <path d="M -16 10 C -16 -14, -10 -22, 0 -22 C 10 -22, 16 -14, 16 10 L 21 15 L -21 15 Z" fill={C.text} />
    <circle cy={20} r={5} fill={C.text} />
  </g>
);

// ---------------------------------------------------------------- overlays: ladder, stamp, title, quote

const Ladder: React.FC<{ s: PullBackState }> = ({ s }) => {
  const L = s.ladder;
  if (L.appear <= 0) return null;
  const cur = Math.round(L.marker);
  const top = LADDER.rungs[3];
  const bot = LADDER.rungs[0];
  const markY = bot + (top - bot) * (L.marker / 3);
  const sweepY = bot + (top - bot) * L.sweep;
  return (
    <g opacity={L.appear * (1 - 0.75 * L.dim)}>
      <line x1={LADDER.x} x2={LADDER.x} y1={top} y2={bot} stroke={C.line} strokeWidth={6} strokeLinecap="round" />
      {L.lit[0] > 0 && <line x1={LADDER.x} x2={LADDER.x} y1={bot} y2={markY} stroke="url(#pbGradV)" strokeWidth={6} strokeLinecap="round" />}
      {L.sweep > 0 && L.sweep < 1 && <circle cx={LADDER.x} cy={sweepY} r={11} fill={C.accentText} opacity={Math.sin(Math.PI * L.sweep)} />}
      {LADDER.rungs.map((y, i) => {
        const v = L.lit[i];
        const isCur = v > 0.5 && i === cur;
        return (
          <g key={i}>
            {isCur && <circle cx={LADDER.x} cy={y} r={26} fill={C.accent} opacity={0.25 * v} />}
            <circle cx={LADDER.x} cy={y} r={isCur ? 16 : 12} fill={v > 0.5 ? (isCur ? 'url(#pbGrad)' : C.muted) : C.bg0} stroke={v > 0.5 ? 'none' : C.muted} strokeWidth={3} />
            <text
              x={LADDER.x - 30}
              y={y + 10}
              fontSize={isCur ? 34 : 30}
              fontWeight={isCur ? 800 : 600}
              fill={isCur ? 'url(#pbGrad)' : C.muted}
              textAnchor="end"
              opacity={v > 0.5 ? 1 : 0.4 + 0.6 * v}
            >
              {LADDER.labels[i]}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const Title: React.FC<{ s: PullBackState }> = ({ s }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 6,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      fontFamily,
      fontSize: 84,
      fontWeight: 800,
      lineHeight: 1.12,
      letterSpacing: '-0.02em',
    }}
  >
    {TITLE.map((phrase, i) => {
      const lit = s.title.lit[i];
      return (
        <div key={i} style={{ display: 'flex', gap: 22, opacity: 0.55 + 0.45 * lit }}>
          {phrase.text.map((w, j) => (
            <span key={j} style={j === phrase.key && lit > 0.5 ? gradientText : { color: C.text }}>
              {w}
            </span>
          ))}
        </div>
      );
    })}
  </div>
);

const Quote: React.FC<{ s: PullBackState; t: number; beats: number[]; dur: number; text: string; emphasis: string[] }> = ({ t, beats, dur, text, emphasis }) => {
  const q = quoteState({ text, emphasis }, t, beats, dur);
  const kb = Math.max(0, 1 - Math.min(1, (t - q.start) / 0.9));
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        fontFamily,
        background: `radial-gradient(ellipse 70% 45% at 50% 50%, ${alpha(C.bg0, 0.85)}, ${alpha(C.bg0, 0)})`,
      }}
    >
      <svg width={260} height={120} viewBox="0 0 260 120" style={{ opacity: 0.75 * kb }}>
        <rect x={4} y={4} width={252} height={112} rx={16} fill="none" stroke={C.muted} strokeWidth={4} />
        {Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 8 }, (_, c) => <rect key={`${r}-${c}`} x={18 + c * 29 + (r % 2) * 10} y={16 + r * 30} width={22} height={22} rx={4} fill="none" stroke={C.muted} strokeWidth={3} />),
        )}
      </svg>
      <div style={{ maxWidth: 900, textAlign: 'center', fontSize: 92, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
        {q.words.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : null}
            <span style={{ opacity: w.opacity, position: 'relative', display: 'inline-block', ...(w.emphasis && q.emphasis > 0 ? gradientText : { color: C.text }) }}>
              {w.text}
              {w.emphasis && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: -6,
                    height: 9,
                    borderRadius: 5,
                    width: `${q.emphasis * 100}%`,
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
                  }}
                />
              )}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the scene

export const PullBack: React.FC<AnimProps & PullBackProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const { vp, cam } = s;
  const world = `translate(${vp.x + vp.w / 2} ${vp.y + vp.h / 2}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`;
  return (
    <Stage vertical={vertical} fill>
      <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', fontFamily }}>
        <defs>
          <linearGradient id="pbGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.accent} />
            <stop offset="1" stopColor={C.accent2} />
          </linearGradient>
          <linearGradient id="pbGradV" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={C.accent} />
            <stop offset="1" stopColor={C.accent2} />
          </linearGradient>
          <linearGradient id="pbHeat" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={C.accent} />
            <stop offset="1" stopColor={C.hot} />
          </linearGradient>
          <clipPath id="pbVp">
            <rect x={vp.x} y={vp.y} width={vp.w} height={vp.h} rx={24} />
          </clipPath>
        </defs>
        <g clipPath="url(#pbVp)" opacity={1 - 0.9 * s.worldDim}>
          <g transform={world}>
            <Level4 s={s} k={cam.z} t={t} />
          </g>
        </g>
        <Ladder s={s} />
        {s.stamp.opacity > 0 && (
          <text x={LADDER.x + 12} y={66} fontSize={46} fontWeight={800} fill={alpha(C.muted, 0.9)} textAnchor="end" opacity={s.stamp.opacity}>
            {s.stamp.text}
          </text>
        )}
      </svg>
      {s.title.appear > 0 && <Title s={s} />}
      {s.quote.show > 0 && <Quote s={s} t={t} beats={beats} dur={dur} text={props.quote ?? ''} emphasis={props.emphasis ?? []} />}
    </Stage>
  );
};
