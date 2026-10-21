import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { PanRings, Stamp, Tally, Tick } from './pieces.tsx';
import { BAND, H, PAN, PHI_CELL, PLOT, REGION, RNX, RNY, STRIP, W, frameState, margin, type BandProps, type BandState } from './ToleranceBand.state.ts';

export { frameState };

const yOf = (m: number) => PLOT.zero - m * PLOT.unit;
const phiX = (PLOT.x0 + PLOT.x1) / 2;

const curvePath = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = PLOT.x0 + ((PLOT.x1 - PLOT.x0) * i) / 80;
    pts.push(`${i ? 'L' : 'M'} ${x.toFixed(1)} ${yOf(margin(x)).toFixed(1)}`);
  }
  return pts.join(' ');
})();

const Plot: React.FC<{ s: BandState }> = ({ s }) => {
  const op = s.plot.appear * (1 - s.pull);
  if (op <= 0) return null;
  const bandH = BAND * PLOT.unit * s.band.grow;
  return (
    <>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={H} opacity={op}>
        {/* axes */}
        <line x1={PLOT.x0} y1={PLOT.top - 10} x2={PLOT.x0} y2={PLOT.zero + 60} stroke={alpha(C.muted, 0.6)} strokeWidth={3} />
        <line x1={PLOT.x0} y1={PLOT.zero} x2={PLOT.x1} y2={PLOT.zero} stroke={C.muted} strokeWidth={3} strokeDasharray="10 8" />
        {/* ε band, exaggerated */}
        {bandH > 0 && <rect x={PLOT.x0} y={PLOT.zero - bandH} width={PLOT.x1 - PLOT.x0} height={2 * bandH} fill={alpha(C.rose, 0.32)} stroke={alpha(C.roseText, 0.8)} strokeWidth={2} />}
        {/* the margin curve */}
        <path d={curvePath} fill="none" stroke={C.accentText} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s.plot.draw} />
        {/* each box's check along the curve */}
        {s.strip.appear > 0 &&
          s.strip.boxes.map((b, j) => {
            const y = yOf(b.floor);
            const col = b.red > 0.01 ? C.rose : C.ok;
            return <line key={j} x1={b.a + 7} x2={b.b - 7} y1={y} y2={y} stroke={col} strokeWidth={9} strokeLinecap="round" opacity={s.strip.appear * (b.red > 0.01 ? 1 : 0.85)} />;
          })}
        {/* φ */}
        {s.phi.appear > 0 && (
          <g opacity={s.phi.appear}>
            <line x1={phiX} y1={PLOT.zero} x2={phiX} y2={PLOT.top - 30} stroke={alpha(C.text, 0.4)} strokeWidth={2} strokeDasharray="6 8" />
            {s.phi.glow > 0 && <circle cx={phiX} cy={PLOT.zero} r={30} fill={C.accentText} opacity={0.45 * s.phi.glow} style={{ filter: 'blur(8px)' }} />}
            <circle cx={phiX} cy={PLOT.zero} r={12} fill={C.text} />
          </g>
        )}
      </svg>
      <div style={{ position: 'absolute', left: PLOT.x0 + 14, top: PLOT.top - 30, fontSize: 30, fontWeight: 700, color: C.muted, opacity: op }}>margin</div>
      <div style={{ position: 'absolute', left: PLOT.x0 - 40, top: PLOT.zero - 22, fontSize: 32, fontWeight: 700, color: C.muted, opacity: op }}>0</div>
      {s.phi.appear > 0 && (
        <div style={{ position: 'absolute', left: phiX + 18, top: PLOT.top - 46, fontSize: 34, fontWeight: 800, opacity: op * s.phi.appear, color: C.text }}>
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontSize: 42, color: C.accentText }}>φ</span> · golden point
        </div>
      )}
      {s.zeroTag > 0 && (
        <div style={{ position: 'absolute', left: phiX - 150, top: PLOT.zero + 44, width: 300, display: 'flex', justifyContent: 'center', opacity: op * s.zeroTag, transform: `scale(${0.7 + 0.3 * s.zeroTag})` }}>
          <div style={{ padding: '8px 24px', borderRadius: 14, background: C.text, color: C.bg0, fontSize: 38, fontWeight: 900 }}>margin = 0</div>
        </div>
      )}
      {s.band.tag > 0 && (
        <div style={{ position: 'absolute', right: W - PLOT.x1, top: PLOT.zero + 34, opacity: op * s.band.tag, textAlign: 'right', lineHeight: 1.12 }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: C.roseText }}>ε band</div>
          <div style={{ fontSize: 27, fontWeight: 700, color: C.muted }}>drawn ×10¹¹</div>
          <div style={{ fontSize: 27, fontWeight: 700, color: C.muted }}>real ε = 1e-12</div>
        </div>
      )}
      {s.harmless > 0 && (
        <div style={{ position: 'absolute', left: PLOT.x0 + 16, top: PLOT.zero + 40, fontSize: 30, fontWeight: 700, color: C.muted, opacity: op * s.harmless, lineHeight: 1.15 }}>
          ε harmless
          <br />
          out here
        </div>
      )}
      {/* the strip of boxes under the plot */}
      {s.strip.appear > 0 &&
        s.strip.boxes.map((b, j) => {
          const bad = b.red > 0.01;
          return (
            <div
              key={j}
              style={{
                position: 'absolute',
                left: b.a + 4,
                top: STRIP.y,
                width: b.b - b.a - 8,
                height: STRIP.h,
                borderRadius: 10,
                background: alpha(bad ? C.rose : C.ok, bad ? 0.3 : 0.22),
                border: `2px solid ${alpha(bad ? C.roseText : C.ok, 0.8)}`,
                opacity: op * s.strip.appear,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                fontWeight: 900,
                color: bad ? C.roseText : C.ok,
              }}
            >
              {bad ? '✗' : '✓'}
            </div>
          );
        })}
      {s.strip.appear > 0 && (
        <div style={{ position: 'absolute', left: PLOT.x0, top: STRIP.y + STRIP.h + 10, fontSize: 28, fontWeight: 700, color: C.muted, opacity: op * s.strip.appear }}>
          boxes along one parameter · bar = each box's check
        </div>
      )}
    </>
  );
};

const Region: React.FC<{ s: BandState }> = ({ s }) => {
  if (s.region.appear <= 0) return null;
  const cw = REGION.w / RNX;
  const ch = REGION.h / RNY;
  return (
    <>
      <svg style={{ position: 'absolute', left: REGION.x, top: REGION.y, overflow: 'visible', opacity: s.region.appear }} width={REGION.w} height={REGION.h}>
        <rect width={REGION.w} height={REGION.h} rx={20} fill="#050508" />
        {Array.from({ length: RNX * RNY }, (_, k) => {
          const x = (k % RNX) * cw;
          const y = Math.floor(k / RNX) * ch;
          const phi = k === PHI_CELL;
          return (
            <g key={k}>
              <rect x={x + 3} y={y + 3} width={cw - 6} height={ch - 6} rx={6} fill={alpha(C.ok, 0.6)} />
              <path d={`M ${x + cw / 2 - 13} ${y + ch / 2 + 1} l 9 9 l 18 -19`} fill="none" stroke={alpha(C.bg0, 0.85)} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
              {phi && <rect x={x - 4} y={y - 4} width={cw + 8} height={ch + 8} rx={10} fill="none" stroke={C.text} strokeWidth={5 + 4 * s.region.phiPulse} opacity={0.6 + 0.4 * s.region.phiPulse} />}
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: REGION.x + (PHI_CELL % RNX) * cw + cw - 18, top: REGION.y + Math.floor(PHI_CELL / RNX) * ch - 30, padding: '0 14px 4px', borderRadius: 14, background: C.bg0, border: `3px solid ${C.text}`, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontSize: 40, lineHeight: 1.1, color: C.text, opacity: s.region.appear }}>φ</div>
      {s.region.greenRun > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: REGION.y - 100, display: 'flex', justifyContent: 'center', opacity: s.region.greenRun, transform: `scale(${0.8 + 0.2 * s.region.greenRun})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '10px 30px', borderRadius: 40, background: alpha(C.ok, 0.16), border: `3px solid ${C.ok}`, fontSize: 46, fontWeight: 800 }}>
            <Tick size={52} /> green run
          </div>
        </div>
      )}
      {s.region.note > 0 && (
        <div style={{ position: 'absolute', left: REGION.x, width: REGION.w, top: REGION.y + REGION.h + 20, textAlign: 'center', whiteSpace: 'nowrap', fontSize: 34, fontWeight: 700, color: C.muted, opacity: s.region.note }}>
          ε harmless elsewhere · wrong only at <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', color: C.text }}>φ</span>
        </div>
      )}
    </>
  );
};

const Verdict: React.FC<{ v: NonNullable<BandState['verdict']> }> = ({ v }) => (
  <>
    <div style={{ position: 'absolute', left: 40, right: 40, top: 96, opacity: v.card, transform: `translateY(${(1 - v.card) * -20}px)`, padding: '18px 28px', borderRadius: 22, background: alpha(C.bg1, 0.95), border: `2px solid ${alpha(C.ok, 0.7)}`, display: 'flex', alignItems: 'center', gap: 22 }}>
      <Tick size={70} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 48, fontWeight: 800 }}>Lemma: true</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: C.muted }}>the final certificate proves it</div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: REGION.x, width: REGION.w, top: REGION.y + REGION.h / 2 - 70, display: 'flex', justifyContent: 'center' }}>
      <Stamp text="NOT EVIDENCE" color={C.rose} pop={v.stamp} size={78} rotate={-8} />
    </div>
    {v.sub > 0 && (
      <div style={{ position: 'absolute', left: 30, right: 30, top: REGION.y + REGION.h + 26, textAlign: 'center', fontSize: 36, fontWeight: 700, lineHeight: 1.2, opacity: v.sub, color: C.text }}>
        it reported its own tolerance band,
        <br />
        <span style={{ color: C.muted }}>not the geometry</span>
      </div>
    )}
  </>
);

export const ToleranceBand: React.FC<AnimProps & BandProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
        {s.pan.appear * (1 - s.pull) > 0 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={H}>
            <PanRings cx={PAN.cx} cy={PAN.cy} R={PAN.R} spread={s.pan.spread} glint={s.pan.glint} id="mech" opacity={s.pan.appear * (1 - s.pull)} />
          </svg>
        )}
        <Plot s={s} />
        <Region s={s} />
        {s.verdict && <Verdict v={s.verdict} />}
        <Tally value={s.tally.value} appear={s.tally.appear} pulse={s.tally.pulse} />
      </div>
    </Stage>
  );
};
