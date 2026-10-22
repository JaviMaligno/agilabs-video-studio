import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Chip } from './pieces.tsx';
import { ORDER, RATIO, SIZES, frameState, type CacheBillProps } from './CacheBill.state.ts';

export { frameState };
export type { CacheBillProps };

const COL = [75, 575] as const;
const COL_W = 430;

const caps: React.CSSProperties = { fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, whiteSpace: 'nowrap' };

/** A block of transcript lines; `glow` = the cached prefix. */
const TranscriptBlock: React.FC<{ h: number; glow: number; lines: number; label?: boolean }> = ({ h, glow, lines, label = true }) => (
  <div style={{ position: 'relative', height: h, borderRadius: 14, background: alpha(C.text, 0.06), border: `3px solid ${alpha(C.muted, 0.5)}`, boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${alpha(C.ok, 0.45 * glow)}` : 'none', overflow: 'hidden' }}>
    {glow > 0 && <div style={{ position: 'absolute', inset: 4, borderRadius: 10, background: alpha(C.ok, 0.18 * glow) }} />}
    {label && <div style={{ ...caps, position: 'absolute', left: 18, top: 10, fontSize: 24 }}>transcript</div>}
    {Array.from({ length: lines }, (_, k) => (
      <div key={k} style={{ position: 'absolute', left: 18, top: (label ? 50 : 18) + k * 26, width: 300 - (k % 3) * 60, height: 10, borderRadius: 5, background: alpha(C.muted, 0.6) }} />
    ))}
    {glow > 0.5 && <div style={{ position: 'absolute', right: 16, top: 8, fontSize: 28, fontWeight: 800, color: C.ok, opacity: glow }}>cached</div>}
  </div>
);

const NoteBlock: React.FC<{ h: number; glow?: number }> = ({ h, glow = 0 }) => (
  <div style={{ position: 'relative', height: h, borderRadius: 14, background: C.card, border: `3px solid ${C.accentText}`, boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${alpha(C.ok, 0.45 * glow)}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: C.accentText }}>
    notepad
  </div>
);

export const CacheBill: React.FC<AnimProps & CacheBillProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const maxW = 440;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - s.billOut }}>
        {/* A. prompt size at step 50 */}
        <div style={{ position: 'absolute', left: 75, top: 440, opacity: s.sizes.opacity, ...caps }}>prompt at step 50 · characters</div>
        {SIZES.map((r, i) => {
          const g = s.sizes.grow[i];
          return (
            <div key={r.label} style={{ position: 'absolute', left: 75, top: 490 + i * 78, width: 930, height: 64, opacity: s.sizes.opacity }}>
              <div style={{ position: 'absolute', left: 0, top: 8, fontSize: 36, fontWeight: 800, color: i === 0 ? C.accentText : C.text }}>{r.label}</div>
              <div style={{ position: 'absolute', left: 235, top: 14, height: 38, width: Math.max(8, (maxW * r.value * g) / SIZES[1].value), borderRadius: 10, background: i === 0 ? GRADIENT : alpha(C.muted, 0.6) }} />
              <div style={{ position: 'absolute', left: 235 + Math.max(8, (maxW * r.value * g) / SIZES[1].value) + 18, top: 2, fontSize: 44, fontWeight: 800, opacity: g, fontVariantNumeric: 'tabular-nums' }}>{r.text}</div>
            </div>
          );
        })}

        {/* B. why caching undoes it */}
        <div style={{ position: 'absolute', left: COL[0], top: 670, width: COL_W, opacity: s.mech.opacity }}>
          <TranscriptBlock h={220} glow={s.mech.scrollGlow} lines={6} />
          <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700, color: C.muted }}>old lines never change</div>
        </div>
        <div style={{ position: 'absolute', left: COL[1], top: 670, width: COL_W, opacity: s.mech.opacity }}>
          <div style={{ position: 'relative', height: 220, borderRadius: 14, background: C.card, border: `3px solid ${C.accentText}`, boxShadow: `0 0 ${30 * s.mech.padGlow}px ${alpha(C.ok, 0.45 * s.mech.padGlow)}` }}>
            <div style={{ position: 'absolute', inset: 4, borderRadius: 10, background: alpha(C.ok, 0.18 * s.mech.padGlow) }} />
            <div style={{ ...caps, position: 'absolute', left: 18, top: 10, fontSize: 24, color: C.accentText }}>notepad</div>
            {['shelf 3: A7', 'shelf 6: C4', 'shelf 7: D1'].map((txt, k) => (
              <div key={txt} style={{ position: 'absolute', left: 18, top: 52 + k * 52, fontSize: 32, fontWeight: 700 }}>
                {txt}
                {k === 1 && s.mech.opacity > 0 && (
                  <div style={{ position: 'absolute', left: -4, top: 20, height: 5, borderRadius: 3, width: 200 * Math.min(1, s.mech.write / 0.3), background: C.marker, opacity: s.mech.write > 0 && s.mech.write < 0.9 ? 1 : 0 }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700, color: C.muted }}>changes every step · not cached</div>
        </div>

        {/* C. tokens vs bill */}
        <div style={{ position: 'absolute', left: COL[0], top: 990, width: COL_W, height: 240, borderRadius: 20, border: `4px dashed ${alpha(C.muted, 0.8)}`, opacity: s.tokens, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.92 + 0.08 * s.tokens})` }}>
          <div style={caps}>in tokens</div>
          <div style={{ fontSize: 116, fontWeight: 800, lineHeight: 1.05 }}>{RATIO.tokens}</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.muted }}>cheaper</div>
        </div>
        <div style={{ position: 'absolute', left: COL[1], top: 990, width: COL_W, height: 240, borderRadius: 20, background: GRADIENT, boxShadow: `0 0 40px ${alpha(C.accent, 0.5)}`, opacity: s.bill, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.92 + 0.08 * s.bill})` }}>
          <div style={{ ...caps, color: C.text }}>my bill, with caching</div>
          <div style={{ fontSize: 116, fontWeight: 800, lineHeight: 1.05 }}>{RATIO.bill}</div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>cheaper</div>
        </div>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 1252, textAlign: 'center', fontSize: 28, fontWeight: 700, color: C.muted, opacity: s.foot }}>short procedure · Anthropic caching</div>
      </div>

      {/* order: notepad + transcript, stacked two ways */}
      {s.order.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s.order.opacity }}>
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 452, display: 'flex', justifyContent: 'center', opacity: s.order.chip }}>
            <Chip text="keeping both: notepad + transcript" size={34} />
          </div>
          {ORDER.map((o, i) => {
            const a = s.order.stacks[i];
            const glow = s.order.glow[i];
            return (
              <div key={o.label} style={{ position: 'absolute', left: COL[i], top: 540, width: COL_W, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
                <div style={{ fontSize: 40, fontWeight: 800 }}>{o.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: i === 0 ? C.warm : C.muted, marginBottom: 14 }}>{o.note}</div>
                {i === 0 ? (
                  <>
                    <NoteBlock h={70} />
                    <div style={{ height: 10 }} />
                    <TranscriptBlock h={190} glow={glow} lines={5} />
                  </>
                ) : (
                  <>
                    <TranscriptBlock h={190} glow={glow} lines={5} />
                    <div style={{ height: 10 }} />
                    <NoteBlock h={70} />
                  </>
                )}
              </div>
            );
          })}
          {ORDER.map((o, i) => (
            <div key={`b${i}`} style={{ position: 'absolute', left: COL[i], top: 935, width: COL_W, height: 120, opacity: s.order.bars[i] > 0 ? 1 : 0 }}>
              <div style={{ fontSize: 64, fontWeight: 800, color: i === 0 ? C.warm : C.text, opacity: s.order.bars[i], fontVariantNumeric: 'tabular-nums' }}>{o.text}</div>
              <div style={{ position: 'absolute', left: 0, top: 84, height: 30, width: (COL_W * o.value * s.order.bars[i]) / ORDER[0].value, borderRadius: 8, background: i === 0 ? C.warm : alpha(C.muted, 0.7) }} />
            </div>
          ))}
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 1072, textAlign: 'center', fontSize: 28, fontWeight: 700, color: C.muted, opacity: s.order.bars[1] }}>effective input tokens per episode</div>
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 1115, textAlign: 'center', fontSize: 104, fontWeight: 800, color: C.warm, opacity: s.order.ratio, transform: `scale(${1.5 - 0.5 * s.order.ratio})` }}>
            {RATIO.order} more
          </div>
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 1258, textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.text, opacity: s.order.tag }}>same content · same score</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
