import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, KAPPA, type AgreeState, type GridState, type TwoJudgesProps } from './TwoJudges.state.ts';
import { Stage, gradientText, stageOf } from './Stage.tsx';
import { Card } from './pieces.tsx';
import { NoiseBar, RedactedBar, Stamp, StampTool } from './stampPieces.tsx';

export { frameState };
export type { TwoJudgesProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- agree ----------
const A = { toolTop: 0, cardTop: 150, cardH: 250, chartTop: 470, zero: 830, unit: 280, zoneH: 92, labels: 940 };
const GX = [160, 480, 800];
const BAR_W = 96;
const LABELS = [
  ['refused', 'refused'],
  ['garbled', 'complied'],
];

const Agree: React.FC<{ s: AgreeState; t: number; W: number }> = ({ s, t, W }) => {
  const cardW = 880;
  const cardX = (W - cardW) / 2;
  const pair = s.phase === 0 ? LABELS[0] : LABELS[1];
  const stampY = A.cardTop + 70;
  const xs = [cardX + 210, cardX + cardW - 210];
  const top = s.card.opacity;
  return (
    <>
      {/* ---- two judges over one card ---- */}
      <div style={{ position: 'absolute', inset: 0, opacity: top }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', left: xs[i] - 130, top: A.toolTop, width: 260, display: 'flex', alignItems: 'center', gap: 14, opacity: s.tools.appear }}>
            <StampTool size={84} press={s.stamps[i].pop > 0 && s.stamps[i].pop < 1 ? 1 : 0} lit={i === 1 ? 1 : 0.4} />
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>
              judge {i + 1}
              {i === 1 && <div style={{ fontSize: 24, fontWeight: 600, color: C.accentText }}>independent</div>}
            </div>
          </div>
        ))}
        <div style={{ position: 'absolute', left: cardX, top: A.cardTop }}>
          <div style={{ position: 'relative', width: cardW, height: A.cardH }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - s.card.cipher }}>
              <RedactedBar w={cardW} h={A.cardH} lines={4} label="reply · plain text" />
            </div>
            <div style={{ position: 'absolute', inset: 0, opacity: s.card.cipher }}>
              <NoiseBar w={cardW} h={A.cardH} t={t} seed={61} cols={22} rows={3} size={44} />
              <div style={{ position: 'absolute', left: 22, top: 12, fontSize: 26, fontWeight: 700, color: C.accentText }}>reply · in cipher</div>
            </div>
          </div>
        </div>
        {/* the link between the two stamps: whole when they agree, snapped when they don't */}
        {[0, 1].map((h) => {
          const dir = h ? 1 : -1;
          const len = (xs[1] - xs[0] - 290) / 2;
          return (
            <div
              key={h}
              style={{
                position: 'absolute',
                left: h ? W / 2 : W / 2 - len * s.link.draw,
                top: stampY + 120,
                width: len * s.link.draw,
                height: 10,
                borderRadius: 5,
                background: GRADIENT,
                boxShadow: `0 0 18px ${alpha(C.accent, 0.8)}`,
                opacity: 1 - 0.7 * s.link.snap,
                transform: `translate(${dir * 40 * s.link.snap}px, ${24 * s.link.snap}px) rotate(${dir * 18 * s.link.snap}deg)`,
                transformOrigin: h ? 'left center' : 'right center',
              }}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: W / 2 - 50,
            top: stampY + 76,
            width: 100,
            height: 100,
            borderRadius: 50,
            background: C.bg0,
            border: `4px solid ${s.phase === 0 ? C.accentText : C.muted}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            fontWeight: 900,
            color: s.phase === 0 ? C.text : C.muted,
            opacity: s.phase === 0 ? s.link.draw : s.link.snap,
          }}
        >
          {s.phase === 0 ? '=' : '≠'}
        </div>
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', left: xs[i] - 160, width: 320, top: stampY + 60 + (i ? 10 : 0), display: 'flex', justifyContent: 'center', transform: `translateX(${s.stamps[i].shake * 8}px)` }}>
            <Stamp label={pair[i]} size={44} rot={i ? 7 : -8} s={s.stamps[i]} />
          </div>
        ))}
      </div>

      {/* ---- verdict: the base model's drop is not evidence ---- */}
      <div style={{ position: 'absolute', left: 0, top: 20, width: W, opacity: s.verdict.appear, transform: `translateY(${(1 - s.verdict.appear) * 24}px)` }}>
        <div style={{ textAlign: 'center', fontSize: 34, fontWeight: 700, color: C.muted }}>Qwen-7B Base · compliance</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, marginTop: 10, flexWrap: 'nowrap' }}>
          <span style={{ fontSize: 112, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap' }}>80%</span>
          <svg width={120} height={96} viewBox="0 0 150 120" style={{ overflow: 'visible', flexShrink: 0 }}>
            <path d={`M 10 20 L ${10 + 120 * s.verdict.arrow} ${20 + 70 * s.verdict.arrow}`} stroke={C.muted} strokeWidth={12} strokeLinecap="round" />
            {s.verdict.arrow > 0.95 && <path d="M 100 100 L 132 92 L 118 62" fill="none" stroke={C.muted} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          <span style={{ fontSize: 112, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap', color: alpha(C.text, 0.4 + 0.6 * s.verdict.arrow) }}>0–20%</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 30, fontWeight: 600, color: C.muted, marginTop: 6 }}>plain text → under every cipher</div>
        {/* Below the figures, never over them: the numbers stay readable under the verdict. */}
        <div style={{ position: 'absolute', left: 0, top: 255, width: W, display: 'flex', justifyContent: 'center' }}>
          <Stamp label="not evidence" size={60} rot={-7} s={s.verdict.stamp} tone="muted" style={{ background: alpha(C.bg0, 0.92), borderWidth: 9 }} />
        </div>
      </div>

      {/* ---- kappa chart ---- */}
      <div style={{ position: 'absolute', left: 0, top: A.chartTop, width: W, textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.muted, opacity: s.tools.appear }}>
        agreement between the judges <span style={{ color: C.accentText }}>(kappa)</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: A.zero,
          width: W,
          height: A.zoneH,
          background: `repeating-linear-gradient(135deg, ${alpha(C.muted, 0.16)} 0 14px, ${alpha(C.muted, 0.05)} 14px 28px)`,
          borderBottom: `2px dashed ${alpha(C.muted, 0.5)}`,
          opacity: s.zone.appear,
        }}
      >
        <div style={{ position: 'absolute', left: 16, top: 26, fontSize: 30, fontWeight: 800, color: C.text }}>worse than chance</div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: A.zero - 2, width: W, height: 4, background: alpha(C.text, 0.7), opacity: s.tools.appear }} />
      <div style={{ position: 'absolute', right: 0, top: A.zero - 40, fontSize: 26, fontWeight: 700, color: C.muted, opacity: s.tools.appear }}>0</div>
      {KAPPA.map((k, g) => {
        const dim = g === 2 ? 0 : s.verdict.focus * 0.6;
        return (
          <div key={g} style={{ position: 'absolute', inset: 0, opacity: 1 - dim }}>
            {(['plain', 'cipher'] as const).map((cond, j) => {
              const v = k[cond] * s.bars[g][cond];
              const x = GX[g] + (j ? 10 : -BAR_W - 10);
              const h = Math.abs(v) * A.unit;
              const grown = s.bars[g][cond];
              const text = cond === 'plain' ? k.plainText : k.cipherText;
              return (
                <React.Fragment key={cond}>
                  <div
                    style={{
                      position: 'absolute',
                      left: x,
                      width: BAR_W,
                      top: v >= 0 ? A.zero - h : A.zero,
                      height: h,
                      borderRadius: v >= 0 ? '12px 12px 0 0' : '0 0 12px 12px',
                      background: cond === 'plain' ? alpha(C.text, 0.78) : GRADIENT,
                      boxShadow: cond === 'cipher' ? `0 0 24px ${alpha(C.accent, 0.5)}` : 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: x - 30,
                      width: BAR_W + 60,
                      textAlign: 'center',
                      top: k[cond] >= 0 ? A.zero - h - 48 : A.zero + h + 2,
                      fontSize: k[cond] >= 0 ? 36 : 32,
                      fontWeight: 800,
                      color: cond === 'cipher' && k[cond] < 0 ? C.accentText : C.text,
                      opacity: grown > 0.6 ? 1 : 0,
                    }}
                  >
                    {text}
                  </div>
                  <div style={{ position: 'absolute', left: x - 10, width: BAR_W + 20, top: A.labels, textAlign: 'center', fontSize: 24, fontWeight: 700, color: C.muted, opacity: s.tools.appear }}>
                    {cond}
                  </div>
                </React.Fragment>
              );
            })}
            <div style={{ position: 'absolute', left: GX[g] - 150, width: 300, top: A.labels + 36, textAlign: 'center', fontSize: 32, fontWeight: 800, lineHeight: 1.1, opacity: s.tools.appear }}>
              {k.model.join(' ')}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------- grid (the procedure) ----------
const MODELS = ['GPT-5', 'Qwen-7B Instruct', 'Qwen-7B Base'];
const G = { top: 420, rowH: 175, nameW: 300, cellW: 300, gap: 20 };

const Grid: React.FC<{ s: GridState; W: number }> = ({ s, W }) => (
  <>
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, textAlign: 'center', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, opacity: s.head.appear }}>
      <div style={{ fontSize: 60 }}>Check that a</div>
      <div style={{ display: 'inline-block', position: 'relative', fontSize: 100, ...gradientText }}>
        second judge
        <span style={{ position: 'absolute', left: 0, bottom: -4, height: 10, borderRadius: 5, width: `${s.head.emphasis * 100}%`, background: GRADIENT }} />
      </div>
      <div style={{ fontSize: 60, marginTop: 6 }}>agrees</div>
    </div>
    <div style={{ position: 'absolute', left: G.nameW, top: G.top - 64, width: 2 * G.cellW + G.gap, display: 'flex', gap: G.gap, opacity: s.axes.appear }}>
      {['plain', 'cipher'].map((c) => (
        <div key={c} style={{ width: G.cellW, textAlign: 'center', fontSize: 34, fontWeight: 800, color: C.accentText }}>
          {c}
        </div>
      ))}
    </div>
    {MODELS.map((m, r) => (
      <div key={m} style={{ position: 'absolute', left: 0, top: G.top + r * G.rowH, width: G.nameW - 20, height: G.rowH - 20, display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 800, lineHeight: 1.1, opacity: s.axes.appear }}>
        {m}
      </div>
    ))}
    {s.cells.map((c, i) => {
      const r = Math.floor(i / 2);
      const col = i % 2;
      return (
        <div key={i} style={{ position: 'absolute', left: G.nameW + col * (G.cellW + G.gap), top: G.top + r * G.rowH, opacity: Math.max(0.35 * s.axes.appear, c.scan) }}>
          <Card w={G.cellW} h={G.rowH - 20} glow={c.lit} style={{ gap: 14, borderColor: alpha(C.accentText, 0.25 + 0.75 * c.lit) }}>
            <Stamp label="1" size={40} rot={-8} s={c.a} />
            <Stamp label="2" size={40} rot={6} s={c.b} />
            <div style={{ fontSize: 50, fontWeight: 900, color: C.accentText, opacity: c.lit, marginLeft: 6 }}>✓</div>
          </Card>
        </div>
      );
    })}
    <div style={{ position: 'absolute', left: 0, top: G.top + 3 * G.rowH + 4, width: W, textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.muted, opacity: s.axes.appear }}>
      per model · per condition · before any rate
    </div>
  </>
);

export const TwoJudges: React.FC<AnimProps & TwoJudgesProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const { w: W } = stageOf(vertical);
  return (
    <Stage vertical={vertical} fill>
      {s.mode === 'agree' && <Agree s={s} t={t} W={W} />}
      {s.mode === 'grid' && <Grid s={s} W={W} />}
    </Stage>
  );
};

export { lerp };
