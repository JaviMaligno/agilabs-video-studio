import React from 'react';
import { Img, interpolate, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx } from '../types.ts';
import type { AnimProps } from './types.ts';
import {
  CAM_Y,
  FLOOR,
  GHOSTS,
  OVERVIEW,
  PILE,
  PILE_CENTER,
  STRIP,
  frameState,
  tabTop,
  type ShaftProps,
  type ShaftState,
} from './HandoffShaft.state.ts';
import { gradientText, stageOf } from './Stage.tsx';
import data from '../data/handoff.json';

export { frameState };
export type { ShaftProps };

const ROLES = ['Lead', 'PM', 'Architect', 'Implementer'];
/** Each desk's agent, drawn (public/cast/role-*.png) inside its node; the role name stays as the label. */
const ROLE_IMG = ['lead', 'pm', 'architect', 'implementer'].map((r) => staticFile(`cast/role-${r}.png`));
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------------------------------------------------------------- pieces

/** Scissors with the cut point at (x, y), blades pointing left, handles to the right. */
const Scissors: React.FC<{ x: number; y: number; open: number; rot?: number; scale?: number; opacity?: number }> = ({
  x,
  y,
  open,
  rot = 0,
  scale = 1,
  opacity = 1,
}) => {
  const a = 4 + 22 * Math.max(0, Math.min(1, open));
  const piece = (sign: 1 | -1) => (
    <g transform={`rotate(${sign * a} 46 0)`}>
      <path d="M46 -9 L-118 -1.5 Q-124 0 -118 1.5 L46 9 Z" fill={sign > 0 ? '#e2e8f0' : '#cbd5e1'} stroke={alpha(C.bg0, 0.5)} strokeWidth={1.5} />
      <path d={`M46 0 L112 ${sign * -30}`} stroke={C.accent} strokeWidth={14} strokeLinecap="round" />
      <ellipse cx={136} cy={sign * -40} rx={30} ry={22} fill="none" stroke={C.accent} strokeWidth={12} />
    </g>
  );
  return (
    <svg
      width={360}
      height={240}
      viewBox="-140 -120 360 240"
      style={{ position: 'absolute', left: x - 140, top: y - 120, opacity, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: '140px 120px', overflow: 'visible' }}
    >
      {/* Blade A under, blade B over, so the crossing reads at the cut. */}
      {piece(-1)}
      {piece(1)}
      <circle cx={46} cy={0} r={7} fill={C.bg0} stroke="#e2e8f0" strokeWidth={3} />
    </svg>
  );
};

/** One amber "because" tab, stapled at its left end. */
const Tab: React.FC<{ text: string; w?: number; h?: number; font?: number; style?: React.CSSProperties; ghost?: boolean }> = ({
  text,
  w = STRIP.tabX1 - STRIP.tabX0,
  h = STRIP.tabH,
  font = 32,
  style,
  ghost,
}) => (
  <div
    style={{
      position: 'absolute',
      width: w,
      height: h,
      background: ghost ? alpha(C.why, 0.72) : C.why,
      borderRadius: 10,
      boxShadow: `0 8px 20px ${alpha(C.bg0, 0.45)}`,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: h * 0.55,
      paddingRight: 22,
      boxSizing: 'border-box',
      color: C.ink,
      fontSize: font,
      fontWeight: 600,
      lineHeight: 1.18,
      fontFamily,
      ...style,
    }}
  >
    {/* Staple */}
    <div style={{ position: 'absolute', left: h * 0.18, top: h * 0.3, width: h * 0.1, height: h * 0.4, borderRadius: 3, background: alpha(C.ink, 0.55) }} />
    {text}
  </div>
);

/** The paper body of the strip: one rule, in the words of the hop that carried it. */
const Body: React.FC<{ x: number; y: number; w: number; h: number; rule: string; edge?: string; font?: number; flicker?: number; opacity?: number }> = (p) => (
  <div
    style={{
      position: 'absolute',
      left: p.x,
      top: p.y,
      width: p.w,
      height: p.h,
      background: C.paper,
      borderRadius: 12,
      boxShadow: `0 14px 34px ${alpha(C.bg0, 0.55)}`,
      padding: `${p.edge ? 38 : 24}px 30px 20px`,
      boxSizing: 'border-box',
      color: C.ink,
      fontFamily,
      fontSize: p.font ?? 40,
      fontWeight: 650,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      opacity: p.opacity ?? 1,
    }}
  >
    {p.edge && <div style={{ position: 'absolute', top: 8, right: 18, fontSize: 24, fontWeight: 600, color: alpha(C.ink, 0.5) }}>{p.edge}</div>}
    <span style={{ opacity: 1 - 0.75 * (p.flicker ?? 0), filter: `blur(${(p.flicker ?? 0) * 2.5}px)` }}>{p.rule}</span>
    {(p.flicker ?? 0) > 0.05 && <span style={{ display: 'inline-block', width: 4, height: (p.font ?? 40) * 1.05, marginLeft: 6, background: C.accent, verticalAlign: 'middle' }} />}
  </div>
);

/** A role node on the shaft: teal for the upstream roles, amber for the implementer. */
const Node: React.FC<{ x: number; y: number; r: number; i: number; opacity?: number; glow?: number }> = ({ x, y, r, i, opacity = 1, glow = 0 }) => {
  const col = i === 3 ? C.why : C.ok;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: r,
        border: `5px solid ${col}`,
        background: C.card,
        boxSizing: 'border-box',
        opacity,
        boxShadow: `0 0 ${12 + 30 * glow}px ${alpha(col, 0.25 + 0.5 * glow)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Img src={ROLE_IMG[i]} style={{ width: '112%', height: '112%', objectFit: 'contain', flexShrink: 0 }} />
    </div>
  );
};

/** Where a tab falls: from where it hung to its pile slot, with a light flutter. */
const fallPose = (from: { x: number; y: number }, to: { x: number; y: number; rot: number; scale: number }, p: number, seed: number) => {
  const q = Math.max(0, Math.min(1, p));
  const drop = q * q * (3 - 2 * q);
  const flutter = Math.sin(q * Math.PI * 3 + seed) * 46 * (1 - q);
  return {
    x: lerp(from.x, to.x, drop) + flutter,
    y: lerp(from.y, to.y, q * q * 0.6 + drop * 0.4),
    rot: lerp(0, to.rot, q) + Math.sin(q * Math.PI * 2 + seed) * 22 * (1 - q),
    scale: lerp(1, to.scale, q),
  };
};

const PILE_SCALE = 0.62;
const pileSlot = (i: number) => ({ x: PILE_CENTER.x + PILE[i].dx, y: 3 * FLOOR + PILE_CENTER.y + PILE[i].dy, rot: PILE[i].rot, scale: PILE_SCALE });
const TAB_W = STRIP.tabX1 - STRIP.tabX0;

/** Tab drawn centred on (x, y) with a rotation and scale. */
const PosedTab: React.FC<{ text: string; x: number; y: number; rot: number; scale: number; opacity?: number; ghost?: boolean }> = (p) => (
  <Tab
    text={p.text}
    ghost={p.ghost}
    style={{ left: p.x - TAB_W / 2, top: p.y - STRIP.tabH / 2, transform: `rotate(${p.rot}deg) scale(${p.scale})`, opacity: p.opacity ?? 1 }}
  />
);

// ---------------------------------------------------------------- views

const Cold: React.FC<{ s: Extract<ShaftState, { view: 'cold' }>; W: number }> = ({ s, W }) => {
  const stripY = 430;
  const bodyH = 196;
  const tabY = stripY + bodyH + 18;
  const tabH = 132;
  const cut = { x: 112, y: tabY + tabH / 2 };
  const fall = s.tabFall;
  return (
    <>
      <div style={{ position: 'absolute', left: 20, top: 24, width: W - 40, fontSize: 104, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.03em' }}>
        {s.title.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : null}
            <span style={{ color: w.why ? C.whyText : C.text, opacity: 0.45 + 0.55 * w.lit }}>{w.text}</span>
          </React.Fragment>
        ))}
      </div>
      {/* Spine the tab hangs from */}
      <div style={{ position: 'absolute', left: 36, top: stripY + bodyH - 10, width: 52, height: (tabY + tabH / 2 - (stripY + bodyH)) * (1 - 0.6 * Math.min(1, fall * 3)), background: C.paper, borderRadius: 6 }} />
      <Body x={20} y={stripY} w={W - 40} h={bodyH} rule={data.desks[0].rule} font={50} />
      <Tab
        text="because the mobile app stopped updating last_login"
        w={W - 120}
        h={tabH}
        font={40}
        style={{
          left: 70,
          top: tabY + 900 * fall * fall,
          transform: `rotate(${18 * fall}deg)`,
          opacity: 1 - interpolate(fall, [0.5, 1], [0, 1], clamp),
        }}
      />
      {s.flash > 0 && <div style={{ position: 'absolute', left: cut.x - 70, top: cut.y - 70, width: 140, height: 140, borderRadius: 70, background: `radial-gradient(circle, ${alpha(C.text, 0.9 * s.flash)}, transparent 70%)` }} />}
      <Scissors x={lerp(cut.x, W + 60, s.scissorsTravel)} y={cut.y} open={s.open} scale={1.45} />
    </>
  );
};

const Overview: React.FC<{ s: Extract<ShaftState, { view: 'overview' }>; W: number; p: AnimProps & ShaftProps }> = ({ s, W, p }) => {
  const O = OVERVIEW;
  const clientH = 178 * s.unroll;
  const cardY = (d: number) => {
    const i = Math.floor(Math.min(2.999, Math.max(0, d)));
    return lerp(O.ys[i], O.ys[i + 1], Math.max(0, Math.min(1, d - i)));
  };
  const sc = s.shortcut;
  // Shortcut: the page leaves the lead and swoops down the right side to land by the implementer.
  const from = { x: 330, y: O.ys[0] };
  const ctrl = { x: 900, y: 560 };
  const to = { x: 700, y: O.ys[3] - 20 };
  const u = sc.travel;
  const px = (1 - u) * (1 - u) * from.x + 2 * (1 - u) * u * ctrl.x + u * u * to.x;
  const py = (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * ctrl.y + u * u * to.y;
  const pageW = 300;
  const pageH = 150;
  const pilePos = (i: number) => ({ x: 250 + ((i * 97) % 330), y: 1010 + ((i * 37) % 50), rot: ((i * 53) % 30) - 15 });
  return (
    <>
      {/* Rail */}
      <div style={{ position: 'absolute', left: O.nodeX - 3, top: 196, width: 6, height: (O.ys[3] - 196) * Math.max(...s.nodes.map((n, i) => (n > 0 ? (i + 1) / 4 : 0))), background: alpha(C.muted, 0.3), borderRadius: 3 }} />
      {/* Client request */}
      <div style={{ position: 'absolute', left: 30, top: 8, width: W - 60, height: clientH, overflow: 'hidden', opacity: s.client, background: C.paper, borderRadius: 12, padding: '20px 28px', boxSizing: 'border-box', color: C.ink, boxShadow: `0 14px 34px ${alpha(C.bg0, 0.55)}` }}>
        <div style={{ fontSize: 34, fontWeight: 800 }}>Client request</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: alpha(C.ink, 0.6), marginBottom: 14 }}>{data.client} · GDPR purge job</div>
        {[0.92, 0.7].map((w, i) => (
          <div key={i} style={{ height: 14, width: `${w * 100}%`, borderRadius: 7, background: alpha(C.ink, 0.18), marginBottom: 12 }} />
        ))}
      </div>
      {[180, 420, 660].map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: 8 + clientH - 6, width: 150, height: 40, borderRadius: 8, background: C.why, opacity: s.unroll * s.client, color: C.ink, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          because…
        </div>
      ))}
      {/* Desks */}
      {O.ys.map((y, i) => {
        const op = s.nodes[i] * (1 - s.dim[i]);
        return (
          <React.Fragment key={i}>
            <Node x={O.nodeX} y={y} r={42} i={i} opacity={op} glow={p.mode === 'facts' ? s.card.flash * (Math.abs(cardY(s.card.desk) - y) < 30 ? 1 : 0) : 0} />
            <div style={{ position: 'absolute', left: O.labelX, top: y - 28, fontSize: 44, fontWeight: 700, lineHeight: 1.25, color: i === 3 ? C.whyText : C.text, opacity: op, transform: `translateX(${(1 - s.nodes[i]) * -20}px)` }}>
              {ROLES[i]}
            </div>
          </React.Fragment>
        );
      })}
      {/* Facts: the strip's chips, ticked at every desk */}
      {p.mode === 'facts' && (
        <div
          style={{
            position: 'absolute',
            left: O.cardX0,
            top: cardY(s.card.desk) - O.cardH / 2,
            width: O.cardX1 - O.cardX0,
            height: O.cardH,
            opacity: s.card.appear,
            background: C.paper,
            borderRadius: 12,
            padding: '14px 18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: `0 0 ${30 * s.card.flash}px ${alpha(C.ok, 0.6 * s.card.flash)}, 0 14px 34px ${alpha(C.bg0, 0.55)}`,
          }}
        >
          {data.facts.map((f, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 42 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: C.ink, opacity: 1 - 0.7 * s.card.flicker, filter: `blur(${s.card.flicker * 2}px)` }}>{f}</span>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: s.card.ticks[j] > 0 ? C.ok : 'transparent',
                  border: `3px solid ${alpha(C.ok, 0.4 + 0.6 * s.card.ticks[j])}`,
                  transform: `scale(${0.7 + 0.3 * s.card.ticks[j] + 0.25 * Math.sin(Math.PI * s.card.ticks[j])})`,
                  boxSizing: 'border-box',
                  color: C.ink,
                  fontSize: 28,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {s.card.ticks[j] > 0.5 ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Shortcut: lead to implementer, with the client's request in hand */}
      {p.mode === 'shortcut' && (
        <>
          <svg width={W} height={1090} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <path
              d={`M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`}
              fill="none"
              stroke={C.why}
              strokeWidth={6}
              strokeDasharray="16 12"
              opacity={0.75 * sc.appear * (1 - (s.counter?.appear ?? 0))}
              pathLength={1}
              style={{ strokeDashoffset: 0 }}
            />
          </svg>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const q = pilePos(i);
            return <Tab key={`s${i}`} text="" ghost w={150} h={44} style={{ left: q.x, top: q.y, transform: `rotate(${q.rot}deg)` }} />;
          })}
          {/* The page's four tabs: three are cut and fall, the fourth stays. */}
          {[0, 1, 2, 3].map((i) => {
            const hang = { x: px - pageW / 2 + 20 + i * 70, y: py + pageH / 2 + 4 };
            const fall = i < 3 ? sc.falls[i] : 0;
            const land = pilePos(6 + i);
            const q = fall > 0 ? fallPose(hang, { x: land.x, y: land.y, rot: land.rot, scale: 1 }, fall, i) : { x: hang.x, y: hang.y, rot: 0, scale: 1 };
            return <Tab key={`t${i}`} text="" w={60} h={40} style={{ left: q.x, top: q.y, transform: `rotate(${q.rot}deg)`, opacity: sc.appear }} />;
          })}
          <div style={{ position: 'absolute', left: px - pageW / 2, top: py - pageH / 2, width: pageW, height: pageH, background: C.paper, borderRadius: 10, opacity: sc.appear, padding: '14px 18px', boxSizing: 'border-box', boxShadow: `0 14px 34px ${alpha(C.bg0, 0.55)}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>Client request</div>
            {[0.95, 0.8, 0.88].map((w, i) => (
              <div key={i} style={{ height: 11, width: `${w * 100}%`, borderRadius: 6, background: alpha(C.ink, 0.18), marginTop: 12 }} />
            ))}
          </div>
          <Scissors x={px - pageW / 2 + 40} y={py + pageH / 2 + 24} open={sc.open} scale={0.62} opacity={sc.scissors} />
          {s.counter && (
            <div style={{ position: 'absolute', left: 430, top: 400, width: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: s.counter.appear }}>
              <div style={{ fontSize: 210, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', ...gradientText }}>{s.counter.text}</div>
              <div style={{ width: 200 * s.counter.progress, height: 8, borderRadius: 4, background: GRADIENT, margin: '18px 0' }} />
              {tx(p.counter?.label ?? '', p.lang)
                .split(' · ')
                .map((row, i) => (
                  <div key={i} style={{ fontSize: 36, fontWeight: 600, color: i ? C.muted : C.text, textAlign: 'center', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
                    {row}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

const Close: React.FC<{ s: Extract<ShaftState, { view: 'close' }>; W: number; H: number; p: AnimProps & ShaftProps }> = ({ s, W, H, p }) => {
  const deskData = data.desks[s.desk];
  const attachedTabs = s.tabs.filter((tb) => tb.attached).length;
  const reattached = s.reattach.lift >= 1 ? 1 : 0;
  const spineTabs = s.desk === 3 ? reattached : attachedTabs;
  const tabTexts = data.desks[2].tabs;
  const dimStrip = 1 - 0.85 * s.dimTop;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: -s.camY, width: W, height: 4 * FLOOR }}>
        {/* Rail; the architect → implementer hop in amber */}
        <div style={{ position: 'absolute', left: 67, top: 0, width: 6, height: 3 * FLOOR, background: alpha(C.muted, 0.28), borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: 67, top: 2 * FLOOR, width: 6, height: FLOOR * s.rail, background: C.why, borderRadius: 3, boxShadow: `0 0 18px ${alpha(C.why, 0.6)}` }} />
        {ROLES.map((r, i) => (
          <React.Fragment key={r}>
            <Node x={70} y={i * FLOOR} r={40} i={i} glow={i === 3 ? s.rail * 0.6 : 0} opacity={i === 3 ? 1 : dimStrip} />
            <div style={{ position: 'absolute', left: 130, top: i * FLOOR - 30, fontSize: 48, fontWeight: 750, lineHeight: 1.25, color: i === 3 ? C.whyText : C.text }}>{r}</div>
          </React.Fragment>
        ))}
        {/* Scissors resting on the architect's desk */}
        {p.mode === 'arrive' && <Scissors x={s.scissors.x} y={s.scissors.y} open={0.1} rot={s.scissors.rot} scale={0.9} opacity={s.scissors.opacity} />}

        {/* The pile of cut whys */}
        {GHOSTS.map((g, k) => {
          const slot = pileSlot(k + 2);
          const fall = s.ghosts[k];
          if (fall <= 0) return null;
          const from = { x: 200 + ((k * 211) % 560), y: s.camY - 160 };
          const q = fallPose(from, slot, fall, k * 1.7);
          return <PosedTab key={`g${k}`} text={g} ghost x={q.x} y={q.y} rot={q.rot} scale={q.scale} />;
        })}
        {s.tabs.map((tb, i) => {
          if (tb.attached) return null;
          // The reattached tab leaves the pile and goes back under the strip.
          if (i === 0 && s.reattach.lift > 0) return null;
          const from = { x: STRIP.tabX0 + TAB_W / 2, y: tabTop(2 * FLOOR + STRIP.top, i) + STRIP.tabH / 2 };
          const q = fallPose(from, pileSlot(i), tb.fall, i * 2.3);
          return <PosedTab key={`r${i}`} text={tabTexts[i]} x={q.x} y={q.y} rot={q.rot} scale={q.scale} />;
        })}

        {/* Code on the implementer's screen */}
        {s.code.panel > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 40,
              top: 3 * FLOOR + 262,
              width: 880,
              height: 310,
              opacity: s.code.panel,
              background: C.bg1,
              border: `2px solid ${alpha(C.accentText, 0.35)}`,
              borderRadius: 16,
              padding: '18px 26px',
              boxSizing: 'border-box',
              boxShadow: `0 0 40px ${alpha(C.accent, 0.25)}`,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 600, color: C.muted, marginBottom: 10 }}>purge_planner.py</div>
            {data.code.map((line, i) => {
              const n = Math.round(line.length * s.code.lines[i]);
              return (
                <div key={i} style={{ fontSize: 27, fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre', color: i === 0 ? C.accentText : C.text }}>
                  {line.slice(0, n)}
                  {s.code.lines[i] > 0 && s.code.lines[i] < 1 ? <span style={{ color: C.accentText }}>▍</span> : null}
                </div>
              );
            })}
          </div>
        )}
        {s.code.qmark > 0 && (
          <div style={{ position: 'absolute', left: 820, top: 3 * FLOOR + 560 + 10 * Math.sin(p.t * 2.4), fontSize: 120, fontWeight: 800, color: C.whyText, opacity: s.code.qmark, transform: `scale(${0.6 + 0.4 * s.code.qmark})` }}>
            ?
          </div>
        )}

        {/* The client's original page, clipped behind the strip */}
        {s.reattach.page > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 470 + 60 * (1 - s.reattach.page),
              top: s.stripY - 78,
              width: 470,
              height: 520,
              opacity: s.reattach.page,
              background: '#f4f2ec',
              borderRadius: 10,
              transform: 'rotate(2.5deg)',
              padding: '14px 22px',
              boxSizing: 'border-box',
              boxShadow: `0 14px 34px ${alpha(C.bg0, 0.6)}`,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>Original request</div>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ height: 11, width: `${70 + ((i * 37) % 28)}%`, borderRadius: 6, background: alpha(C.ink, 0.16), marginTop: 22 }} />
            ))}
          </div>
        )}

        {/* The strip: spine, attached tabs, body */}
        {spineTabs > 0 && (
          <div style={{ position: 'absolute', left: 44, top: s.stripY + STRIP.bodyH - 10, width: 50, height: tabTop(0, spineTabs - 1) - STRIP.bodyH + STRIP.tabH / 2 + 10, background: C.paper, borderRadius: 6, opacity: dimStrip }} />
        )}
        {s.desk < 3 &&
          s.tabs.map((tb, i) =>
            tb.attached ? <Tab key={`a${i}`} text={deskData.tabs[i] ?? ''} style={{ left: STRIP.tabX0, top: tabTop(s.stripY, i), opacity: 1 - 0.75 * s.flicker }} /> : null,
          )}
        {s.reattach.lift > 0 &&
          (() => {
            const from = pileSlot(0);
            const to = { x: STRIP.tabX0 + TAB_W / 2, y: tabTop(s.stripY, 0) + STRIP.tabH / 2 };
            const u = s.reattach.lift;
            const arc = Math.sin(Math.PI * u) * 60;
            return <PosedTab text={tabTexts[0]} x={lerp(from.x, to.x, u) + arc} y={lerp(from.y, to.y, u)} rot={lerp(from.rot, 0, u)} scale={lerp(from.scale, 1, u)} />;
          })()}
        <Body x={STRIP.x0} y={s.stripY} w={STRIP.x1 - STRIP.x0} h={STRIP.bodyH} rule={deskData.rule} edge={deskData.edge} flicker={s.flicker} opacity={dimStrip} />
        {s.reattach.clip > 0 && (
          <svg width={40} height={80} viewBox="0 0 70 140" style={{ position: 'absolute', left: 870, top: s.stripY - 72, opacity: s.reattach.clip, transform: `translateY(${(1 - s.reattach.clip) * -30}px)` }}>
            <path d="M20 130 L20 30 A15 15 0 0 1 50 30 L50 110 A9 9 0 0 1 32 110 L32 40" fill="none" stroke={C.accentText} strokeWidth={8} strokeLinecap="round" />
          </svg>
        )}
        {/* The staple slams in (CLACK) at the tab's staple point */}
        {s.reattach.stapler > 0 && (
          <div
            style={{
              position: 'absolute',
              left: STRIP.tabX0 + 6,
              top: tabTop(s.stripY, 0) + STRIP.tabH / 2 - 34,
              width: 20,
              height: 68,
              borderRadius: 5,
              background: '#e2e8f0',
              border: `4px solid ${C.ink}`,
              boxSizing: 'border-box',
              opacity: Math.min(1, s.reattach.stapler * 3),
              transform: `scale(${1 + 1.6 * (1 - Math.min(1, s.reattach.stapler * 1.4))})`,
              boxShadow: `0 0 24px ${alpha(C.whyText, 0.7 * s.reattach.flash)}`,
            }}
          />
        )}
        {s.reattach.flash > 0 && (
          <div style={{ position: 'absolute', left: STRIP.tabX0 + 16 - 90, top: tabTop(s.stripY, 0) + STRIP.tabH / 2 - 90, width: 180, height: 180, borderRadius: 90, background: `radial-gradient(circle, ${alpha(C.whyText, 0.9 * s.reattach.flash)}, transparent 70%)` }} />
        )}

        {/* Snipping scissors */}
        {p.mode === 'snip' && s.scissors.opacity > 0 && <Scissors x={s.scissors.x} y={s.scissors.y} open={s.scissors.open} rot={s.scissors.rot} scale={0.9} opacity={s.scissors.opacity} />}
      </div>

      {/* Key sentence over the implementer's desk */}
      {s.quote.length > 0 && (
        <>
          <div style={{ position: 'absolute', left: -60, top: 160, width: W + 120, height: 520, background: `linear-gradient(180deg, ${alpha(C.bg0, 0.94 * s.dimTop)}, ${alpha(C.bg0, 0.94 * s.dimTop)} 80%, ${alpha(C.bg0, 0)})` }} />
          <div style={{ position: 'absolute', left: 20, top: 190, width: W - 40, display: 'flex', flexDirection: 'column', gap: 30 }}>
            {s.quote.map((q, li) => (
              <div key={li} style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.02em' }}>
                {q.words.map((w, i) => (
                  <React.Fragment key={i}>
                    {i > 0 ? ' ' : null}
                    <span style={{ display: 'inline-block', position: 'relative', opacity: w.opacity, transform: `translateY(${(1 - w.opacity) * 18}px)`, color: w.emphasis ? C.whyText : C.text }}>
                      {w.text}
                      {w.emphasis && <span style={{ position: 'absolute', left: 0, bottom: -4, height: 6, width: `${q.emphasis * 100}%`, borderRadius: 3, background: C.why }} />}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Corner chip with the figure */}
      {s.chip > 0 && p.chip && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            opacity: s.chip,
            transform: `translateY(${(1 - s.chip) * -16}px)`,
            padding: '12px 22px',
            borderRadius: 14,
            border: `3px solid ${C.why}`,
            background: alpha(C.bg0, 0.85),
            // Stacked (figure over source) so it stays clear of the role label on the left.
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2,
          }}
        >
          <span style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.05, color: C.whyText }}>{tx(p.chip, p.lang).split(' · ')[0]}</span>
          <span style={{ fontSize: 28, fontWeight: 600, color: C.muted }}>{tx(p.chip, p.lang).split(' · ')[1] ?? ''}</span>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, top: H, width: W, height: 1 }} />
    </>
  );
};

/** The request strip and its "because" tabs, dropping down the shaft of desks. */
export const HandoffShaft: React.FC<AnimProps & ShaftProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const box = stageOf(p.vertical);
  return (
    <div style={{ position: 'absolute', left: box.side, top: box.top, width: box.w, height: box.h, overflow: 'hidden', fontFamily, color: C.text }}>
      {s.view === 'cold' && <Cold s={s} W={box.w} />}
      {s.view === 'overview' && <Overview s={s} W={box.w} p={p} />}
      {s.view === 'close' && <Close s={s} W={box.w} H={box.h} p={p} />}
    </div>
  );
};

export { CAM_Y };
