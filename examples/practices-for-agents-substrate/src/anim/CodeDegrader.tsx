import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { gradientText } from './Stage.tsx';
import { AgentIcon, BugIcon, MONO, Mark, PersonIcon, Stamp } from './pieces.tsx';
import { CODE, HABITS, TREE, WEB_TILES, frameState, type CodeDegraderProps, type DegraderState } from './CodeDegrader.state.ts';

export { frameState };
export type { CodeDegraderProps };

const ROW = 48;
const HEAD = 64;
export const codeHeight = HEAD + CODE.length * ROW + 22;
const TROW = 44;
export const treeHeight = HEAD + TREE.length * TROW + 22;

const CardHeader: React.FC<{ label: string; color?: string }> = ({ label, color = C.accentText }) => (
  <div style={{ position: 'absolute', left: 28, top: 16, fontSize: 28, fontWeight: 800, letterSpacing: '0.16em', color }}>{label}</div>
);

/** The code card. `bugRow` lights a row rose (the planted bug) until it is fixed. */
export const CodeCard: React.FC<{
  x: number;
  y: number;
  w: number;
  dirty: number[];
  label: string;
  cursor?: { opacity: number; row: number };
  bug?: { pop: number; fixed: number; row: number };
  style?: React.CSSProperties;
}> = ({ x, y, w, dirty, label, cursor, bug, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: codeHeight, borderRadius: 22, background: C.card, border: `3px solid ${alpha(C.muted, 0.35)}`, overflow: 'hidden', boxSizing: 'border-box', ...style }}>
    <CardHeader label={label} />
    {bug && bug.pop > 0 && (
      <div style={{ position: 'absolute', left: 0, right: 0, top: HEAD + bug.row * ROW, height: ROW, background: alpha(bug.fixed > 0.5 ? C.ok : C.marker, 0.22 * bug.pop) }} />
    )}
    {cursor && cursor.opacity > 0 && (
      <div style={{ position: 'absolute', left: 0, right: 0, top: HEAD + cursor.row * ROW, height: ROW, background: alpha(C.accentText, 0.18 * cursor.opacity), borderLeft: `8px solid ${alpha(C.accentText, cursor.opacity)}` }} />
    )}
    {CODE.map((l, i) => {
      const d = dirty[i] ?? 0;
      const top = HEAD + i * ROW;
      return (
        <div key={i} style={{ position: 'absolute', left: 30, right: 20, top, height: ROW, fontFamily: MONO, fontSize: 31, lineHeight: `${ROW}px`, whiteSpace: 'pre' }}>
          <span style={{ position: 'absolute', left: 0, opacity: 1 - d, color: i === 1 ? C.muted : C.text }}>{l.clean}</span>
          <span style={{ position: 'absolute', left: 0, opacity: d, color: C.warm }}>{l.dirty}</span>
        </div>
      );
    })}
    {bug && bug.pop > 0 && (
      <div style={{ position: 'absolute', right: 26, top: HEAD + bug.row * ROW + 4, opacity: bug.pop * (1 - bug.fixed), transform: `scale(${1.6 - 0.6 * bug.pop})` }}>
        <BugIcon size={40} color={C.marker} />
      </div>
    )}
  </div>
);

/** The file tree, organised -> flattened, README struck out, tests faded. */
export const TreeCard: React.FC<{ x: number; y: number; w: number; tree: DegraderState['tree']; label: string }> = ({ x, y, w, tree, label }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: treeHeight, borderRadius: 22, background: C.card, border: `3px solid ${alpha(C.muted, 0.35)}`, overflow: 'hidden', boxSizing: 'border-box', opacity: tree.opacity * (1 - 0.75 * tree.dim) }}>
    <CardHeader label={label} />
    {TREE.map((r, i) => {
      const d = tree.dirty;
      const top = HEAD + i * TROW;
      const indent = r.kind === 'file' ? 40 * (1 - d) : 0;
      const isDir = r.kind === 'dir';
      const op = isDir ? 1 - d : r.kind === 'tests' ? 1 - 0.75 * tree.fade : 1;
      const color = r.kind === 'file' ? (d > 0.5 ? C.warm : C.text) : isDir ? C.accentText : C.muted;
      return (
        <div key={i} style={{ position: 'absolute', left: 30 + indent, top, height: TROW, fontFamily: MONO, fontSize: 31, lineHeight: `${TROW}px`, whiteSpace: 'pre', opacity: op, color }}>
          {r.kind === 'file' ? (d > 0.5 ? r.dirty : r.clean) : r.clean}
          {r.kind === 'readme' && <div style={{ position: 'absolute', left: -6, top: TROW / 2 - 2, height: 5, width: 200 * tree.strike, background: C.marker }} />}
        </div>
      );
    })}
  </div>
);

/** The bet's balance. tilt +1: WHERE TO LOOK (right) heavier; -1: HOW IT'S WRITTEN (left). */
const Balance: React.FC<{ pivotY: number; tilt: number; opacity: number; glowLeft: number }> = ({ pivotY, tilt, opacity, glowLeft }) => {
  const a = (tilt * 11 * Math.PI) / 180;
  const half = 320;
  const ends = [-1, 1].map((sgn) => ({ x: 540 + sgn * half * Math.cos(a), y: pivotY + sgn * half * Math.sin(a) }));
  const PAN = { w: 390, h: 110, drop: 96 };
  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={`M540 ${pivotY} L470 ${pivotY + 330} L610 ${pivotY + 330} Z`} fill={alpha(C.muted, 0.18)} stroke={alpha(C.muted, 0.6)} strokeWidth={4} />
        <line x1={ends[0].x} y1={ends[0].y} x2={ends[1].x} y2={ends[1].y} stroke={C.muted} strokeWidth={12} strokeLinecap="round" />
        <circle cx={540} cy={pivotY} r={16} fill={C.text} />
        {ends.map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={p.x} y2={p.y + PAN.drop} stroke={alpha(C.muted, 0.8)} strokeWidth={4} />
        ))}
      </svg>
      {ends.map((p, i) => {
        const left = i === 0;
        const heavy = left ? glowLeft : Math.max(0, tilt) * (1 - glowLeft);
        const color = left ? C.warm : C.accentText;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: Math.min(1080 - 40 - PAN.w, Math.max(40, p.x - PAN.w / 2)),
              top: p.y + PAN.drop,
              width: PAN.w,
              height: PAN.h,
              borderRadius: 18,
              background: C.card,
              border: `4px solid ${alpha(color, 0.45 + 0.55 * heavy)}`,
              boxShadow: `0 0 ${46 * heavy}px ${alpha(color, 0.7 * heavy)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              color,
              boxSizing: 'border-box',
            }}
          >
            {left ? "HOW IT'S WRITTEN" : 'WHERE TO LOOK'}
          </div>
        );
      })}
    </div>
  );
};

/** Hook: the wall of linked files the code card shrinks into. Deterministic layout. */
const WEB = { cols: 6, x0: 75, dx: 158, y0: 470, dy: 132, w: 128, h: 86 };
const tileXY = (i: number) => ({ x: WEB.x0 + (i % WEB.cols) * WEB.dx, y: WEB.y0 + Math.floor(i / WEB.cols) * WEB.dy });
const LINKS: [number, number][] = Array.from({ length: WEB_TILES }, (_, i) => [i, (i * 7 + 5) % WEB_TILES] as [number, number])
  .concat(Array.from({ length: WEB_TILES }, (_, i) => [i, (i * 11 + 13) % WEB_TILES] as [number, number]))
  .filter(([a, b]) => a !== b);

export const CodeDegrader: React.FC<AnimProps & CodeDegraderProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const mode = p.mode;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {mode === 'hook' && (
        <>
          <div style={{ position: 'absolute', inset: 0, opacity: s.code.opacity, transform: `scale(${s.code.scale})`, transformOrigin: '540px 700px' }}>
            <CodeCard x={60} y={470} w={960} dirty={s.code.dirty} label="parse.py" cursor={s.cursor} />
            <div style={{ position: 'absolute', left: 60, top: 470 + codeHeight + 40, width: 960, display: 'flex', justifyContent: 'center', opacity: s.fixed.pop, transform: `scale(${1.3 - 0.3 * s.fixed.pop})` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 34px', borderRadius: 40, border: `4px solid ${C.ok}`, color: C.ok, fontSize: 44, fontWeight: 800 }}>
                <Mark size={46} color={C.ok} /> bug fixed anyway
              </div>
            </div>
          </div>
          {s.web.opacity > 0 && (
            <div style={{ position: 'absolute', inset: 0, opacity: s.web.opacity }}>
              <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: s.web.links }}>
                {LINKS.map(([a, b], i) => {
                  const A = tileXY(a);
                  const B = tileXY(b);
                  return <line key={i} x1={A.x + WEB.w / 2} y1={A.y + WEB.h / 2} x2={B.x + WEB.w / 2} y2={B.y + WEB.h / 2} stroke={alpha(C.accentText, 0.32)} strokeWidth={2.5} />;
                })}
              </svg>
              {s.web.tiles.map((pop, i) => {
                const { x, y } = tileXY(i);
                return (
                  <div key={i} style={{ position: 'absolute', left: x, top: y, width: WEB.w, height: WEB.h, borderRadius: 12, background: C.card, border: `3px solid ${alpha(C.muted, 0.45)}`, opacity: pop, transform: `scale(${0.6 + 0.4 * pop})`, boxSizing: 'border-box', padding: '14px 14px' }}>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{ height: 8, marginBottom: 12, width: `${[80, 55, 68][(i + k) % 3]}%`, borderRadius: 4, background: alpha(k === 0 ? C.warm : C.muted, 0.55) }} />
                    ))}
                  </div>
                );
              })}
              <div style={{ position: 'absolute', left: 80, top: 1150, fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: C.muted }}>TURNS USED</div>
              <div style={{ position: 'absolute', left: 80, top: 1200, width: 920, height: 44, borderRadius: 22, background: alpha(C.muted, 0.16) }} />
              <div style={{ position: 'absolute', left: 80, top: 1200, width: 920 * s.web.meter, height: 44, borderRadius: 22, background: s.web.meter > 0.85 ? C.marker : C.warm }} />
              <Stamp text="stuck" color={C.marker} pop={s.web.stall} style={{ left: 700, top: 1100 }} />
            </div>
          )}
        </>
      )}

      {mode === 'habits' && (
        <>
          <div style={{ position: 'absolute', left: 60, top: 270, height: 130, display: 'flex', alignItems: 'center', gap: 28, opacity: s.reader.opacity }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 1 - s.reader.agent }}>
                <PersonIcon size={120} />
              </div>
              <div style={{ position: 'absolute', inset: 0, opacity: s.reader.agent }}>
                <AgentIcon size={120} />
              </div>
            </div>
            <div style={{ position: 'relative', fontSize: 50, fontWeight: 800, width: 700, height: 70 }}>
              <span style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - s.reader.agent, color: C.muted }}>read by a human</span>
              <span style={{ position: 'absolute', left: 0, top: 0, opacity: s.reader.agent, color: C.accentText }}>read by an agent</span>
            </div>
          </div>
          <div style={{ opacity: s.code.opacity }}>
            <CodeCard x={60} y={430} w={960} dirty={s.code.dirty} label="parse.py" cursor={s.cursor} />
          </div>
          {HABITS.map((h, i) => {
            const pop = s.chips.pop[i];
            const ask = s.chips.ask[i];
            return (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  left: 60 + (i % 2) * 500,
                  top: 850 + Math.floor(i / 2) * 140,
                  width: 460,
                  height: 112,
                  borderRadius: 20,
                  background: alpha(C.ok, 0.1),
                  border: `4px solid ${alpha(C.ok, 0.75)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 35,
                  fontWeight: 800,
                  color: C.text,
                  whiteSpace: 'nowrap',
                  opacity: pop,
                  transform: `scale(${0.7 + 0.3 * pop})`,
                  boxSizing: 'border-box',
                }}
              >
                {h}
                {ask > 0 && (
                  <div style={{ position: 'absolute', right: -16, top: -22, width: 58, height: 58, borderRadius: 29, background: C.warm, color: C.bg0, fontSize: 42, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ask, transform: `scale(${1.6 - 0.6 * ask})` }}>
                    ?
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 60, width: 960, top: 1150, textAlign: 'center', fontSize: 46, fontWeight: 800, color: C.warm, opacity: s.chips.question }}>
            helps the agent, or only us?
          </div>
        </>
      )}

      {mode === 'bet' && (
        <>
          <div style={{ position: 'absolute', inset: 0, opacity: s.head.opacity }}>
            <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
              <circle cx={290} cy={610} r={150} fill={alpha(C.accentText, 0.08)} stroke={C.accentText} strokeWidth={5} />
            </svg>
            <div style={{ position: 'absolute', left: 230, top: 450, width: 120, height: 60, display: 'flex', justifyContent: 'center' }}>
              <AgentIcon size={60} />
            </div>
            <div style={{ position: 'absolute', left: 235, top: 530, width: 110, height: 140, borderRadius: 10, background: C.text, opacity: s.head.page, transform: `scale(${0.6 + 0.4 * s.head.page})`, padding: '18px 14px', boxSizing: 'border-box' }}>
              {[90, 70, 84, 60, 76].map((w, k) => (
                <div key={k} style={{ height: 8, width: `${w}%`, marginBottom: 14, borderRadius: 4, background: alpha(C.bg0, 0.55) }} />
              ))}
            </div>
            <div style={{ position: 'absolute', left: 120, top: 774, width: 340, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontSize: 38, fontWeight: 800, color: C.ok, opacity: s.head.page }}>
              <Mark size={40} color={C.ok} /> reads text well
            </div>
            <div style={{ position: 'absolute', left: 560, top: 470, width: 440, height: 280, borderRadius: 20, border: `4px dashed ${alpha(C.marker, 0.85)}`, opacity: s.head.map, boxSizing: 'border-box' }}>
              <svg width={440} height={280} style={{ position: 'absolute', left: -4, top: -4 }}>
                {[
                  [70, 60, 200, 60],
                  [200, 60, 330, 60],
                  [70, 60, 70, 150],
                  [200, 60, 200, 150],
                  [330, 60, 330, 150],
                  [70, 150, 135, 225],
                  [200, 150, 135, 225],
                  [330, 150, 270, 225],
                ].map(([a, b, c, d], k) => (
                  <line key={k} x1={a} y1={b} x2={c} y2={d} stroke={alpha(C.muted, 0.6)} strokeWidth={3} />
                ))}
                {[
                  [70, 60],
                  [200, 60],
                  [330, 60],
                  [70, 150],
                  [200, 150],
                  [330, 150],
                  [135, 225],
                  [270, 225],
                ].map(([x, y], k) => (
                  <rect key={k} x={x - 30} y={y - 20} width={60} height={40} rx={8} fill={C.card} stroke={alpha(C.muted, 0.8)} strokeWidth={3} />
                ))}
              </svg>
            </div>
            <div style={{ position: 'absolute', left: 560, top: 774, width: 440, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontSize: 38, fontWeight: 800, color: C.marker, opacity: s.head.map }}>
              <Mark size={40} color={C.marker} cross /> the whole repo
            </div>
          </div>
          <Balance pivotY={900} tilt={s.balance.tilt} opacity={s.balance.opacity} glowLeft={s.balance.glowLeft} />
        </>
      )}

      {mode === 'flip' && (
        <>
          <Balance pivotY={560} tilt={s.balance.tilt} opacity={s.balance.opacity} glowLeft={s.balance.glowLeft} />
          <div style={{ position: 'absolute', left: 60, top: 990, width: 960, height: 270, borderRadius: 22, background: C.card, border: `3px solid ${alpha(C.muted, 0.35)}`, opacity: s.search.opacity, boxSizing: 'border-box' }}>
            <CardHeader label="FINDING THE FILE" color={C.muted} />
            <div style={{ position: 'absolute', left: 30, top: 80, fontFamily: MONO, fontSize: 38, whiteSpace: 'pre', color: C.text }}>
              {'$ grep -l vat *.py'.slice(0, Math.round(18 * s.search.typed))}
            </div>
            <div style={{ position: 'absolute', left: 30, top: 160, display: 'flex', alignItems: 'center', gap: 22, opacity: s.search.found }}>
              <span style={{ fontFamily: MONO, fontSize: 44, color: C.warm, fontWeight: 700 }}>m2.py</span>
              <Mark size={48} color={C.ok} />
              <span style={{ fontSize: 40, fontWeight: 800, color: C.ok }}>found</span>
            </div>
          </div>
        </>
      )}

      {(mode === 'method' || mode === 'task') && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 254, display: 'flex', justifyContent: 'center', opacity: s.nine.pop, transform: `scale(${1.3 - 0.3 * s.nine.pop})` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '8px 34px', borderRadius: 18, background: alpha(C.warm, 0.12), border: `4px solid ${C.warm}`, fontWeight: 800 }}>
              <span style={{ fontSize: 66, color: C.warm }}>9</span>
              <span style={{ fontSize: 42 }}>kinds of damage · 2 families</span>
            </div>
          </div>
          <div style={{ opacity: s.code.opacity * (1 - 0.75 * s.code.dim) }}>
            <CodeCard x={60} y={380} w={960} dirty={s.code.dirty} label="HOW IT'S WRITTEN" cursor={s.cursor} bug={{ ...s.bug, row: 2 }} />
          </div>
          <TreeCard x={60} y={380 + codeHeight + 26} w={960} tree={s.tree} label="WHERE TO LOOK" />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1196, display: 'flex', justifyContent: 'center', opacity: s.badge.pop * (1 - 0.75 * s.code.dim), transform: `scale(${1.25 - 0.25 * s.badge.pop})` }}>
            <TestsBadge s={s} task={mode === 'task'} />
          </div>
          {s.counter.opacity > 0 && (
            <div style={{ position: 'absolute', left: 60, width: 960, top: 560, height: 520, borderRadius: 28, background: alpha(C.bg1, 0.94), border: `3px solid ${alpha(C.accentText, 0.5)}`, opacity: s.counter.opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, ...gradientText }}>{s.counter.value.toLocaleString('en-US')}</div>
              <div style={{ fontSize: 46, fontWeight: 700, color: C.text }}>measured runs · 4 repositories</div>
            </div>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

const TestsBadge: React.FC<{ s: DegraderState; task: boolean }> = ({ s, task }) => {
  const green = s.tests.green;
  const red = s.tests.red * (1 - green);
  const color = !task ? C.ok : green > 0.5 ? C.ok : red > 0.5 ? C.marker : C.ok;
  const text = !task ? 'tests: identical' : green > 0.5 ? 'tests: passing' : red > 0.5 ? 'tests: 2 failing' : 'tests: identical';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 34px', borderRadius: 44, background: alpha(color, 0.12), border: `4px solid ${color}`, color, fontSize: 46, fontWeight: 800 }}>
      {text}
      {task ? (
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} style={{ width: 26, height: 26, borderRadius: 13, background: k < 2 && red > 0.5 ? C.marker : C.ok }} />
          ))}
        </div>
      ) : (
        <Mark size={48} color={color} />
      )}
    </div>
  );
};

