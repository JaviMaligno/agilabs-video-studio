// The inspection desk: mail slots, trays, the notebook, envelopes and the VERIFIED stamp.
// Brand tokens only (brand.ts), Inter. State in ReportDesk.state.ts.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import {
  CHIP_Y,
  ENV,
  FACT_NOTE,
  H,
  MODELS,
  NOTEBOOK,
  PANEL,
  QUOTES,
  REPORT,
  SLOT_LABELS,
  SLOT_X,
  TRAY,
  W,
  frameState,
  type BoardState,
  type DeskProps,
  type Env,
  type HookState,
  type Kind,
  type Stamp as StampT,
  type Tool,
} from './ReportDesk.state.ts';

export { frameState };
export type { DeskProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

const GradDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={C.accent} />
      <stop offset="1" stopColor={C.accent2} />
    </linearGradient>
  </defs>
);

// ---------------------------------------------------------------- envelope

const Envelope: React.FC<{ e: Env; id: string }> = ({ e, id }) => {
  const s = e.scale;
  const tipY = 130 - 230 * e.slit;
  const flapFront = e.slit < 0.5;
  const crack = Math.max(e.crack, e.slit > 0.02 ? 1 : 0);
  const sep = 16 * crack;
  const printOp = clamp01(e.print * 2);
  const printScale = 1.25 - 0.25 * clamp01(e.print);
  const flap = <polygon points={`0,0 190,${tipY} 380,0`} fill={flapFront ? C.card : C.bg1} stroke={alpha(C.muted, 0.6)} strokeWidth={3} strokeLinejoin="round" />;
  const sealY = flapFront ? tipY : 130;
  return (
    <svg
      width={380 * s}
      height={350 * s}
      viewBox="0 -110 380 350"
      style={{
        position: 'absolute',
        left: e.x - 190 * s,
        top: e.y - 230 * s,
        overflow: 'visible',
        opacity: clamp01(e.opacity) * (1 - 0.55 * clamp01(e.dim)),
        transform: `rotate(${e.rot}deg)`,
        transformOrigin: `${190 * s}px ${230 * s}px`,
        filter: `drop-shadow(0 14px 24px ${alpha(C.bg0, 0.7)})`,
      }}
    >
      <GradDefs id={id} />
      {!flapFront && flap}
      {e.slit > 0.3 && (
        <g>
          <rect x={34} y={-80 * e.slit} width={312} height={230} rx={6} fill={alpha(C.text, 0.92)} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={60} y={-80 * e.slit + 22 + i * 18} width={[220, 250, 160][i]} height={7} rx={3} fill={alpha(C.bg1, 0.35)} />
          ))}
        </g>
      )}
      <rect x={0} y={0} width={380} height={240} rx={14} fill={C.card} stroke={alpha(C.muted, 0.55)} strokeWidth={3} />
      <line x1={0} y1={240} x2={150} y2={120} stroke={alpha(C.muted, 0.2)} strokeWidth={2} />
      <line x1={380} y1={240} x2={230} y2={120} stroke={alpha(C.muted, 0.2)} strokeWidth={2} />
      {flapFront && flap}
      {e.label && e.slit < 0.5 && (
        <g>
          <rect x={30} y={170} width={320} height={60} rx={8} fill={alpha(C.bg0, 0.75)} />
          {REPORT.map((line, i) => (
            <text key={i} x={190} y={194 + i * 26} textAnchor="middle" fontFamily={fontFamily} fontSize={22} fontWeight={600} fill={C.text}>
              {line}
            </text>
          ))}
        </g>
      )}
      {/* Wax seal: intact, or split in two halves. */}
      <g opacity={e.slit > 0.5 ? 0.55 : 1}>
        <path d={`M ${190 - sep} ${sealY - 34} A 34 34 0 0 0 ${190 - sep} ${sealY + 34} Z`} fill={alpha(C.accent2, 0.75)} stroke={C.accent2} strokeWidth={3} />
        <path d={`M ${190 + sep} ${sealY - 34} A 34 34 0 0 1 ${190 + sep} ${sealY + 34} Z`} fill={alpha(C.accent2, 0.75)} stroke={C.accent2} strokeWidth={3} />
        {crack < 0.05 && <circle cx={190} cy={sealY} r={20} fill="none" stroke={alpha(C.text, 0.35)} strokeWidth={3} />}
      </g>
      {printOp > 0 && (
        <g opacity={printOp} transform={`rotate(-14 190 120) translate(190 120) scale(${printScale}) translate(-190 -120)`}>
          <rect x={34} y={74} width={312} height={94} rx={12} fill={alpha(C.bg0, 0.35)} stroke={`url(#${id})`} strokeWidth={8} />
          <text x={190} y={143} textAnchor="middle" fontFamily={fontFamily} fontSize={64} fontWeight={900} letterSpacing={4} fill={`url(#${id})`} stroke={C.text} strokeWidth={1.6}>
            VERIFIED
          </text>
        </g>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- tools

const StampTool: React.FC<{ s: StampT; scale?: number; id: string }> = ({ s, scale = 1, id }) => {
  if (s.opacity <= 0) return null;
  const k = scale;
  const squash = s.down ? 0.94 : 1;
  return (
    <svg
      width={150 * k}
      height={165 * k}
      viewBox="0 0 150 165"
      style={{
        position: 'absolute',
        left: s.x - 75 * k,
        top: s.y - 165 * k * squash,
        opacity: clamp01(s.opacity),
        overflow: 'visible',
        filter: `drop-shadow(0 18px 22px ${alpha(C.bg0, 0.8)})`,
      }}
    >
      <GradDefs id={id} />
      <ellipse cx={75} cy={28} rx={28} ry={26} fill={`url(#${id})`} />
      <rect x={62} y={46} width={26} height={48} rx={6} fill={alpha(C.accentText, 0.8)} />
      <rect x={12} y={90} width={126} height={52} rx={12} fill={C.card} stroke={C.accentText} strokeWidth={4} />
      <rect x={18} y={142} width={114} height={20} rx={4} fill={C.accent2} />
    </svg>
  );
};

const Opener: React.FC<{ o: Tool; id: string }> = ({ o, id }) => (
  <svg
    width={230}
    height={40}
    viewBox="0 0 230 40"
    style={{
      position: 'absolute',
      left: o.x - 115,
      top: o.y - 20,
      opacity: clamp01(o.opacity),
      overflow: 'visible',
      filter: o.glow > 0 ? `drop-shadow(0 0 ${14 * o.glow}px ${alpha(C.accent, 0.9)})` : undefined,
    }}
  >
    <GradDefs id={id} />
    <rect x={0} y={9} width={84} height={22} rx={9} fill={`url(#${id})`} />
    <polygon points="84,8 230,20 84,32" fill={alpha(C.text, 0.8)} />
  </svg>
);

const Magnifier: React.FC<{ m: Tool }> = ({ m }) => (
  <svg
    width={130}
    height={130}
    viewBox="0 0 130 130"
    style={{
      position: 'absolute',
      left: m.x - 50,
      top: m.y - 50,
      opacity: clamp01(m.opacity),
      overflow: 'visible',
      filter: m.glow > 0 ? `drop-shadow(0 0 ${14 * m.glow}px ${alpha(C.accent, 0.9)})` : undefined,
    }}
  >
    <line x1={78} y1={78} x2={122} y2={122} stroke={C.accent} strokeWidth={16} strokeLinecap="round" />
    <circle cx={50} cy={50} r={40} fill={alpha(C.accentText, 0.14)} stroke={C.accentText} strokeWidth={9} />
  </svg>
);

// ---------------------------------------------------------------- slots, chips, trays

const Glyph: React.FC<{ i: number; size: number; color: string }> = ({ i, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block', flex: 'none' }}>
    {i === 0 && (
      <>
        <circle cx={20} cy={13} r={8} fill={color} />
        <path d="M5 37 C5 25 35 25 35 37 Z" fill={color} />
      </>
    )}
    {i === 1 && (
      <>
        <path d="M8 3 H26 L33 10 V37 H8 Z" fill="none" stroke={color} strokeWidth={3.2} strokeLinejoin="round" />
        <line x1={13} y1={18} x2={28} y2={18} stroke={color} strokeWidth={3} />
        <line x1={13} y1={25} x2={28} y2={25} stroke={color} strokeWidth={3} />
      </>
    )}
    {i === 2 && <path d="M4 6 H36 V28 H18 L9 36 V28 H4 Z" fill="none" stroke={color} strokeWidth={3.2} strokeLinejoin="round" />}
  </svg>
);

const Panel: React.FC<{ i: number; lit: number }> = ({ i, lit }) => {
  const hero = i === 0;
  const inner = (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: hero ? 15 : 18,
        background: C.bg1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 46,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', left: 34, right: 34, top: 14, height: 18, borderRadius: 9, background: C.bg0, boxShadow: `inset 0 3px 6px ${alpha(C.bg0, 0.95)}` }} />
      <Glyph i={i} size={40} color={hero ? C.accentText : C.muted} />
      <div style={{ marginTop: 8, fontSize: 30, fontWeight: 600, lineHeight: 1.12, textAlign: 'center', color: hero ? C.text : alpha(C.text, 0.85) }}>
        {SLOT_LABELS[i].map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: SLOT_X[i] - PANEL.w / 2,
        top: PANEL.top,
        width: PANEL.w,
        height: PANEL.h,
        borderRadius: 18,
        padding: hero ? 4 : 0,
        boxSizing: 'border-box',
        background: hero ? GRADIENT : undefined,
        border: hero ? undefined : `3px solid ${alpha(C.muted, 0.55)}`,
        boxShadow: lit > 0 ? `0 0 ${46 * lit}px ${alpha(C.accent, 0.75 * lit)}` : undefined,
      }}
    >
      {inner}
    </div>
  );
};

const SlotChip: React.FC<{ i: number; text: string; tag: string; appear: number }> = ({ i, text, tag, appear }) => {
  if (appear <= 0 || !text) return null;
  return (
    <div style={{ position: 'absolute', left: SLOT_X[i] - 140, top: CHIP_Y, width: 280, display: 'flex', justifyContent: 'center', opacity: appear }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: tag ? '2px 26px 6px' : '0 26px',
          borderRadius: 22,
          background: alpha(C.bg0, 0.92),
          border: `3px solid ${i === 0 ? C.accentText : alpha(C.muted, 0.6)}`,
          transform: `scale(${0.55 + 0.45 * appear})`,
          lineHeight: 1.1,
        }}
      >
        <span style={{ fontSize: 50, fontWeight: 800, letterSpacing: '-0.02em', ...(i === 0 ? gradientText : { color: C.text }) }}>{text}</span>
        {tag && <span style={{ fontSize: 25, fontWeight: 600, color: C.muted, marginTop: -2 }}>{tag}</span>}
      </div>
    </div>
  );
};

const Mini: React.FC<{ kind: Kind; id: string }> = ({ kind }) => {
  const sealed = kind === 'sealed' || kind === 'adopted';
  if (sealed) {
    // Stamped while still sealed: violet, seal intact, no page showing.
    return (
      <svg width={TRAY.mw} height={TRAY.mh} viewBox="0 0 58 36" style={{ overflow: 'visible', display: 'block' }}>
        <rect x={0} y={0} width={58} height={36} rx={4} fill={alpha(C.accent2, 0.6)} stroke={kind === 'adopted' ? C.text : C.accentText} strokeWidth={kind === 'adopted' ? 3 : 2} />
        <polyline points="0,0 29,19 58,0" fill="none" stroke={alpha(C.text, 0.55)} strokeWidth={1.8} />
        <circle cx={29} cy={19} r={8} fill={C.accent2} stroke={C.text} strokeWidth={1.5} />
      </svg>
    );
  }
  // Opened and checked: grey, flap up, the page showing.
  return (
    <svg width={TRAY.mw} height={TRAY.mh} viewBox="0 0 58 36" style={{ overflow: 'visible', display: 'block' }}>
      <polygon points="0,0 29,-11 58,0" fill={C.bg1} stroke={alpha(C.muted, 0.6)} strokeWidth={1.5} />
      <rect x={6} y={-9} width={46} height={22} rx={2} fill={alpha(C.text, 0.9)} />
      <rect x={0} y={8} width={58} height={28} rx={4} fill={C.card} stroke={alpha(C.muted, 0.6)} strokeWidth={1.5} />
      {kind === 'rejected' && <line x1={6} y1={32} x2={52} y2={-4} stroke={C.muted} strokeWidth={3} />}
    </svg>
  );
};

const Trays: React.FC<{ s: BoardState }> = ({ s }) => (
  <>
    {s.trays.map((tray, i) => {
      const left = SLOT_X[i] - (TRAY.cols * TRAY.cw - (TRAY.cw - TRAY.mw)) / 2;
      return (
        <div key={i} style={{ position: 'absolute', left: 0, top: 0, opacity: tray.opacity * (1 - 0.6 * s.trayDim) }}>
          <div
            style={{
              position: 'absolute',
              left: left - 12,
              top: TRAY.top - 14,
              width: TRAY.cols * TRAY.cw + 14,
              height: TRAY.rows * TRAY.rh + 20,
              borderRadius: 14,
              border: `2px solid ${alpha(C.muted, 0.22)}`,
              background: alpha(C.bg1, 0.5),
            }}
          />
          {tray.items.map((it, k) => {
            if (it.appear <= 0) return null;
            const c = k % TRAY.cols;
            const r = Math.floor(k / TRAY.cols);
            const y = lerp(PANEL.top + PANEL.h - 20, TRAY.top + r * TRAY.rh, it.appear);
            return (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  left: left + c * TRAY.cw,
                  top: y,
                  opacity: (it.kind === 'rejected' ? 0.42 : 1) * Math.min(1, it.appear * 3),
                  filter: it.kind === 'adopted' ? `drop-shadow(0 0 10px ${alpha(C.accent, 0.95)})` : undefined,
                }}
              >
                <Mini kind={it.kind} id={`mg${i}`} />
              </div>
            );
          })}
        </div>
      );
    })}
  </>
);

// ---------------------------------------------------------------- notebook, subagent, extras

const NOTE_H = 40;
const NOTE_STEP = 36;
const F_INDEX = 3;
const noteY = (i: number) => NOTEBOOK.y + i * NOTE_STEP;

const Notebook: React.FC<{ s: BoardState }> = ({ s }) => {
  const n = s.notebook;
  const fx = lerp(NOTEBOOK.x + NOTEBOOK.w / 2, 250, n.fOut);
  const fy = lerp(noteY(F_INDEX) + NOTE_H / 2, 790, n.fOut);
  const big = lerp(0.72, 1, n.fOut);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: n.appear * (1 - 0.6 * n.dim) }}>
        {Array.from({ length: NOTEBOOK.notes }, (_, i) => {
          const isF = i === F_INDEX;
          if (isF) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: NOTEBOOK.x + ((i * 7) % 3) * 4 - 4,
                top: noteY(i),
                width: NOTEBOOK.w,
                height: NOTE_H,
                borderRadius: 6,
                background: C.card,
                border: `2px solid ${alpha(C.muted, 0.35)}`,
                transform: `rotate(${((i * 37) % 5) - 2}deg)`,
                boxShadow: `0 4px 10px ${alpha(C.bg0, 0.6)}`,
              }}
            >
              <div style={{ margin: '11px 14px 0', height: 6, width: 100 + ((i * 29) % 40), borderRadius: 3, background: alpha(C.muted, 0.35) }} />
              <div style={{ margin: '6px 14px 0', height: 6, width: 60 + ((i * 17) % 50), borderRadius: 3, background: alpha(C.muted, 0.25) }} />
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: NOTEBOOK.x, top: noteY(NOTEBOOK.notes) + 22, width: NOTEBOOK.w, textAlign: 'center', fontSize: 26, fontWeight: 600, color: C.muted }}>
          its notes
        </div>
      </div>
      {/* The fact F: a glowing note in the stack, pulled out large next to the report. */}
      {n.fGone < 1 && (
        <div
          style={{
            position: 'absolute',
            left: fx - 125,
            top: fy - 90,
            width: 250,
            height: 180,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${alpha(C.accent, 0.42)}, ${alpha(C.accent2, 0.42)})`,
            border: `3px solid ${C.accentText}`,
            boxShadow: `0 0 ${40 * n.fGlow}px ${alpha(C.accent, 0.8 * n.fGlow)}`,
            transform: `scale(${big}) scaleY(${lerp(0.3, 1, n.fOut)})`,
            opacity: n.appear * (1 - n.fGone) * (1 - 0.6 * n.dim),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 20px',
            boxSizing: 'border-box',
            fontSize: 31,
            fontWeight: 700,
            lineHeight: 1.18,
            color: C.text,
          }}
        >
          {n.fOut > 0.35 ? FACT_NOTE.map((l) => <div key={l}>{l}</div>) : null}
        </div>
      )}
    </>
  );
};

const Subagent: React.FC<{ s: BoardState }> = ({ s }) => {
  const a = s.subagent;
  if (a.appear <= 0) return null;
  const x0 = NOTEBOOK.x + NOTEBOOK.w + 18;
  const x1 = 640;
  const y = 800;
  const xe = lerp(x0, x1, a.link);
  const mid = (x0 + x1) / 2;
  const gap = 150 * a.broken;
  const seg = (xa: number, xb: number, k: number) =>
    xb > xa ? <line key={k} x1={xa} y1={y} x2={xb} y2={y} stroke={a.broken > 0 ? alpha(C.muted, 0.9 - 0.4 * a.broken) : C.accentText} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" /> : null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a.appear }}>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {seg(x0, Math.min(xe, mid - gap / 2), 0)}
        {seg(mid + gap / 2, xe, 1)}
      </svg>
      <div style={{ position: 'absolute', left: mid - 160, top: y - 74, width: 320, textAlign: 'center', fontSize: 28, fontWeight: 600, color: C.muted, opacity: a.broken }}>
        never passed on
      </div>
      {/* The subagent: a small figure with a thin notebook. */}
      <div style={{ position: 'absolute', left: 660, top: 660, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.7 + 0.3 * a.appear})` }}>
        <Glyph i={0} size={110} color={C.accentText} />
        <div style={{ fontSize: 32, fontWeight: 700, color: C.text, marginTop: 6 }}>subagent</div>
        {[0, 1].map((i) => (
          <div key={i} style={{ marginTop: i ? 6 : 16, width: 160, height: 36, borderRadius: 6, background: C.card, border: `2px solid ${alpha(C.muted, 0.35)}` }} />
        ))}
        <div style={{ fontSize: 24, fontWeight: 600, color: C.muted, marginTop: 8 }}>its notes</div>
      </div>
    </div>
  );
};

const Stack58k: React.FC<{ v: number }> = ({ v }) => {
  if (v <= 0) return null;
  const x = lerp(-260, 230, v);
  return (
    <div style={{ position: 'absolute', left: x, top: 700, width: 240, height: 250, opacity: v }}>
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: (i % 2) * 6,
            top: 70 - i * 9,
            width: 230,
            height: 150,
            borderRadius: 6,
            background: i === 6 ? alpha(C.text, 0.9) : alpha(C.text, 0.55 + i * 0.05),
            border: `1px solid ${alpha(C.bg0, 0.6)}`,
          }}
        />
      ))}
      <div style={{ position: 'absolute', left: 6, top: 30, width: 230, height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: C.bg0, fontWeight: 800, lineHeight: 1.1 }}>
        <span style={{ fontSize: 46 }}>58k tokens</span>
        <span style={{ fontSize: 32 }}>of work</span>
      </div>
    </div>
  );
};

const crackPath = (x: number, y: number, w: number) => `M ${x} ${y} l ${w * 0.18} 18 l ${w * 0.14} -26 l ${w * 0.2} 30 l ${w * 0.16} -22 l ${w * 0.32} 14`;

const Consequences: React.FC<{ s: BoardState; id: string }> = ({ s, id }) => {
  const c = s.conseq;
  if (c.appear <= 0) return null;
  const tk = c.ticket;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: c.appear }}>
      {/* Printer with the ticket coming out. */}
      <div style={{ position: 'absolute', left: 150, top: 865 - 180 * tk, width: 240, height: 170, borderRadius: 6, background: alpha(C.text, 0.92), display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: C.bg0, fontSize: 28, fontWeight: 800, lineHeight: 1.15, textAlign: 'center' }}>
        <div>Open a ticket</div>
        <div>with DevOps</div>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 860, width: 300, height: 120, borderRadius: 18, background: C.card, border: `3px solid ${alpha(C.muted, 0.6)}` }}>
        <div style={{ margin: '14px auto 0', width: 250, height: 12, borderRadius: 6, background: C.bg0 }} />
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 28, fontWeight: 600, color: C.muted }}>ticket</div>
      </div>
      {/* The pricing flag toggle. */}
      <div style={{ position: 'absolute', left: 560, top: 760, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: c.toggle, transform: `scale(${0.7 + 0.3 * c.toggle})` }}>
        <div style={{ position: 'relative', width: 220, height: 104, borderRadius: 52, background: c.on > 0.5 ? GRADIENT : C.card, border: `3px solid ${alpha(C.muted, 0.6)}` }}>
          <div style={{ position: 'absolute', top: 10, left: lerp(10, 126, c.on), width: 78, height: 78, borderRadius: 39, background: C.text }} />
          <div style={{ position: 'absolute', top: 30, left: c.on > 0.5 ? 34 : 120, fontSize: 32, fontWeight: 800, color: c.on > 0.5 ? C.text : C.muted }}>{c.on > 0.5 ? 'ON' : 'OFF'}</div>
        </div>
        <div style={{ marginTop: 14, fontSize: 34, fontWeight: 700, color: C.text }}>pricing flag</div>
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <GradDefs id={id} />
        {c.crackA > 0 && <path d={crackPath(165, 838, 210)} fill="none" stroke={C.bg0} strokeWidth={7} pathLength={1} strokeDasharray={`${c.crackA} 1`} strokeLinecap="round" strokeLinejoin="round" />}
        {c.crackB > 0 && <path d={crackPath(600, 806, 220)} fill="none" stroke={C.text} strokeWidth={7} pathLength={1} strokeDasharray={`${c.crackB} 1`} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      {c.chip > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 992, display: 'flex', justifyContent: 'center', opacity: c.chip }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '6px 30px', borderRadius: 26, background: alpha(C.bg0, 0.92), border: `3px solid ${C.accentText}`, transform: `scale(${0.6 + 0.4 * c.chip})` }}>
            <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: '-0.02em', ...gradientText }}>95 %</span>
            <span style={{ fontSize: 30, fontWeight: 600, color: C.text, lineHeight: 1.15 }}>
              adopted the
              <br />
              wrong conclusion
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- views

const ModelChips: React.FC<{ s: BoardState }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: s.chipsShown }}>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
      {MODELS.map((m, i) => {
        const a = s.chips.active[i];
        return (
          <div key={m} style={{ position: 'relative', padding: '8px 24px', borderRadius: 30, border: `2px solid ${alpha(C.muted, 0.5)}`, fontSize: 30, fontWeight: 700, color: a > 0.5 ? C.text : C.muted, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: GRADIENT, opacity: a }} />
            <span style={{ position: 'relative' }}>{m}</span>
          </div>
        );
      })}
    </div>
    <div style={{ marginTop: 6, textAlign: 'center', fontSize: 29, fontWeight: 600, color: C.muted, opacity: s.chips.tagAppear, whiteSpace: 'nowrap' }}>{s.chips.tag}</div>
  </div>
);

const BoardView: React.FC<{ s: BoardState }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateX(${s.shake}px)` }}>
    <div style={{ position: 'absolute', inset: 0, opacity: s.deskIn }}>
      <ModelChips s={s} />
      {[0, 1, 2].map((i) => (
        <Panel key={i} i={i} lit={s.slots[i].lit} />
      ))}
      <Trays s={s} />
      {[0, 1, 2].map((i) => (
        <SlotChip key={i} i={i} {...s.slots[i].chip} />
      ))}
      <Notebook s={s} />
    </div>
    <Stack58k v={s.stack58k} />
    <Subagent s={s} />
    {s.slip > 0 && (
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: s.slip }}>
        <div style={{ padding: '14px 28px', borderRadius: 18, background: alpha(C.bg0, 0.9), border: `2px solid ${alpha(C.muted, 0.5)}`, fontSize: 38, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.2 }}>
          “No automation found.
          <br />
          Open a ticket with DevOps.”
        </div>
      </div>
    )}
    {s.envs.map((e, i) => (
      <Envelope key={i} e={e} id={`eg${i}`} />
    ))}
    <Consequences s={s} id="cg" />
    <div style={{ opacity: s.deskIn * s.toolsOn }}>
      <Opener o={s.opener} id="og" />
      <Magnifier m={s.mag} />
      <StampTool s={s.stamp} id="sg" />
    </div>
    {s.counter.appear > 0 && (
      <div style={{ position: 'absolute', left: 420, top: 640, width: 540, textAlign: 'center', opacity: s.counter.appear * (1 - s.counter.dim) }}>
        <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, ...gradientText }}>{s.counter.text}</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: C.text, marginTop: 8 }}>adopted the wrong conclusion</div>
      </div>
    )}
    {s.quotes[0] > 0 && <div style={{ position: 'absolute', left: -80, right: -80, top: 610, height: 600, background: alpha(C.bg0, 0.75 * s.quotes[0]) }} />}
    {s.quotes[0] > 0 && (
      <div style={{ position: 'absolute', left: 30, right: 30, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        {QUOTES.map((q, i) => (
          <div
            key={q}
            style={{
              opacity: s.quotes[i],
              transform: `translateY(${(1 - s.quotes[i]) * 40}px)`,
              padding: i === 0 ? '22px 34px' : '16px 28px',
              borderRadius: 22,
              background: alpha(C.bg0, 0.94),
              border: `3px solid ${i === 0 ? C.accentText : alpha(C.muted, 0.6)}`,
              fontSize: i === 0 ? 50 : 34,
              fontWeight: i === 0 ? 800 : 600,
              color: i === 0 ? C.text : alpha(C.text, 0.88),
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: 860,
              boxShadow: `0 16px 40px ${alpha(C.bg0, 0.8)}`,
            }}
          >
            {q}
          </div>
        ))}
      </div>
    )}
    {s.quote.dim > 0 && (
      <>
        <div style={{ position: 'absolute', left: -80, right: -80, top: -300, bottom: -800, background: alpha(C.bg0, 0.88 * s.quote.dim) }} />
        <div style={{ opacity: 0.28 * s.quote.back }}>
          <Envelope e={{ x: 480, y: 900, scale: 1.55, rot: -4, opacity: 1, slit: 0, print: 1, crack: 0, sweep: 0, sweeping: 0, dim: 0, label: false }} id="qg" />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 10,
            right: 10,
            top: 150,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 24,
            rowGap: 6,
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
          }}
        >
          {s.quote.words.map((w, i) => (
            <span key={i} style={{ opacity: w.opacity, position: 'relative', ...(w.emphasis ? gradientText : { color: C.text }) }}>
              {w.text}
              {w.emphasis && (
                <span style={{ position: 'absolute', left: 0, bottom: -4, height: 8, borderRadius: 4, width: `${100 * s.quote.emphasis}%`, background: GRADIENT }} />
              )}
            </span>
          ))}
        </div>
      </>
    )}
  </div>
);

const HookView: React.FC<{ s: HookState }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateX(${s.shake}px)` }}>
    <Envelope e={s.env} id="hg" />
    {/* The subagent's slot, big, with the envelope sliding out from under it. */}
    <div style={{ position: 'absolute', left: 190, top: 384, width: 580, height: 132, borderRadius: 22, padding: 5, boxSizing: 'border-box', background: GRADIENT, boxShadow: `0 12px 30px ${alpha(C.bg0, 0.8)}` }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 18, background: C.bg1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 40, right: 40, bottom: 12, height: 20, borderRadius: 10, background: C.bg0, boxShadow: `inset 0 3px 6px ${alpha(C.bg0, 0.95)}` }} />
        <Glyph i={0} size={50} color={C.accentText} />
        <span style={{ fontSize: 44, fontWeight: 700, color: C.text, marginBottom: 14 }}>its own subagent</span>
      </div>
    </div>
    <StampTool s={s.stamp} scale={s.stampScale} id="hs" />
    {s.flash > 0 && <div style={{ position: 'absolute', left: -80, right: -80, top: -300, bottom: -300, background: alpha(C.text, 0.1 * s.flash) }} />}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        padding: '26px 34px',
        background: alpha(C.bg0, 0.85),
        borderRadius: 28,
        border: `2px solid ${alpha(C.accent, 0.4)}`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 20,
        rowGap: 2,
        fontSize: 80,
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }}
    >
      {s.title.map((w, i) => (
        <span key={i} style={{ opacity: 0.82 + 0.18 * w.lit, ...(w.key && s.titleKey > 0.5 ? gradientText : { color: C.text }) }}>
          {w.text}
        </span>
      ))}
    </div>
  </div>
);

export const ReportDesk: React.FC<AnimProps & DeskProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  return (
    <Stage vertical={vertical} fill style={{ fontFamily }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>{s.view === 'hook' ? <HookView s={s} /> : <BoardView s={s} />}</div>
    </Stage>
  );
};

export { ENV };
