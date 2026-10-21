import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, type ReceiptProps, type ReceiptState } from './CostReceipt.state.ts';
import { Stage, gradientText } from './Stage.tsx';
import { Stamp, lerp } from './pieces.tsx';

export { frameState };
export type { ReceiptProps };

const ITEMS = [
  { label: 'General reasoning', full: '−0.078', lora: '≈0' },
  { label: 'Instruction-following', full: '−37%', fullSub: '0.194 → 0.123', lora: '+0.033' },
  { label: 'Unseen commands', full: '0.00', lora: '0.15' },
] as const;

const RW = 462;
const HEAD = 150;
const ITEM_H = 176;
const RH = HEAD + ITEMS.length * ITEM_H + 30;

const Receipt: React.FC<{ x: number; y: number; title: string; side: 0 | 1; s: ReceiptState; lensDim: number }> = ({ x, y, title, side, s, lensDim }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: RW,
      height: RH,
      borderRadius: 18,
      background: C.card,
      border: `2px solid ${alpha(C.muted, 0.35)}`,
      boxShadow: `0 24px 60px ${alpha('#000000', 0.45)}`,
      opacity: s.receipts.appear,
    }}
  >
    <div style={{ height: HEAD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ fontSize: 44, fontWeight: 900, ...(side === 1 ? gradientText : {}) }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 600, color: C.muted }}>at 0% mixing</div>
    </div>
    <div style={{ marginLeft: 24, marginRight: 24, borderTop: `3px dashed ${alpha(C.muted, 0.45)}` }} />
    {ITEMS.map((it, i) => {
      const p = s.lines[i][side];
      const dim = side === 0 && i > 0 ? lensDim : 0;
      const value = side === 0 ? it.full : it.lora;
      return (
        <div key={it.label} style={{ height: ITEM_H, padding: '20px 28px 0', opacity: 1 - 0.65 * dim }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>{it.label}</div>
          <div style={{ opacity: p, transform: `translateY(${(1 - p) * -14}px)` }}>
            <div style={{ fontSize: 68, fontWeight: 900, color: side === 0 ? C.accentText : C.text, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
            {side === 0 && 'fullSub' in it && <div style={{ fontSize: 30, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>{it.fullSub}</div>}
          </div>
        </div>
      );
    })}
  </div>
);

const Bill: React.FC<{ s: ReceiptState }> = ({ s }) => {
  const o = s.ood;
  const cmd = "$ echo banana | sed 's/a/X/g'";
  const typed = cmd.slice(0, Math.round(cmd.length * o.typed));
  // When the terminal leaves, the receipts move up and the stamps take the space below them.
  const ry = lerp(300, 90, o.exit);
  const lensDim = s.lens.appear;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 960,
          height: 270,
          borderRadius: 24,
          background: C.card,
          border: `2px solid ${alpha(C.accentText, 0.5)}`,
          opacity: o.appear * Math.max(0, 1 - o.exit * 3),
          transform: `translateY(${(1 - o.appear) * -30 - o.exit * 40}px)`,
          padding: '20px 30px',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: C.muted }}>a command type never trained on</div>
        <div style={{ fontSize: 42, fontWeight: 800, whiteSpace: 'pre', marginTop: 6 }}>{typed}</div>
        <div style={{ display: 'flex', gap: 40, marginTop: 14, alignItems: 'center' }}>
          <div style={{ fontSize: 34, fontWeight: 700, opacity: o.guess }}>
            <span style={{ color: C.muted }}>expected </span>bXnXnX
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, opacity: o.guess, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted }}>full FT </span>
            <span style={{ color: C.accentText, fontStyle: 'italic', textDecoration: o.cross > 0.5 ? 'line-through' : 'none' }}>banana</span>
            <span style={{ width: 46, height: 46, borderRadius: 23, border: `3px solid ${C.accentText}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: C.accentText, opacity: o.cross }}>✗</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, opacity: o.meter }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: C.muted, width: 110 }}>LoRA</span>
          <div style={{ width: 600, height: 26, borderRadius: 13, background: alpha(C.muted, 0.25), overflow: 'hidden' }}>
            <div style={{ width: `${15 * o.meter}%`, height: '100%', background: GRADIENT }} />
          </div>
          <span style={{ fontSize: 30, fontWeight: 800 }}>0.15</span>
        </div>
      </div>
      <Receipt x={0} y={ry} title="Full fine-tuning" side={0} s={s} lensDim={lensDim} />
      <Receipt x={960 - RW} y={ry} title="LoRA" side={1} s={s} lensDim={0} />
      {/* The "one benchmark" lens: it only ever covers the first line. */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: ry + HEAD + 4,
          width: RW + 16,
          height: ITEM_H - 4,
          borderRadius: 22,
          border: `5px solid ${C.accentText}`,
          background: alpha(C.accentText, 0.14),
          boxShadow: `0 0 40px ${alpha(C.accent, 0.5)}`,
          opacity: s.lens.appear,
          transform: `translateX(${(1 - s.lens.appear) * -120}px)`,
        }}
      >
        {/* A tab on the lens's top edge: readable at phone size, clear of the line's figure. */}
        <div style={{ position: 'absolute', right: 18, top: -21, padding: '2px 14px', borderRadius: 12, background: C.accent, fontSize: 28, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          one benchmark
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: RW, top: ry + RH + 50, display: 'flex', justifyContent: 'center' }}>
        <Stamp text="3 COSTS" appear={s.stamp.full} size={80} strong />
      </div>
      {/* Smaller and nudged left so the tilted stamp stays under its receipt and clear of the
          platform's action rail. */}
      <div style={{ position: 'absolute', left: 960 - RW - 12, width: RW, top: ry + RH + 64, display: 'flex', justifyContent: 'center' }}>
        <Stamp text="mostly spared" appear={s.stamp.lora} size={46} rotate={4} />
      </div>
    </>
  );
};

const TradeDial: React.FC<{ s: ReceiptState; t: number }> = ({ s, t }) => {
  const d = s.dial;
  // Once the knob has settled it keeps rocking a little between the two ends, so the hold under
  // "here the task was easy" never reads as a paused video (the dial is something you turn).
  const rock = 0.035 * Math.sin((2 * Math.PI * t) / 2.6) * d.tag;
  const pos = Math.min(1, Math.max(0, d.pos + rock));
  const x0 = 60;
  const w = 840;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: d.appear }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontSize: 72, fontWeight: 900, letterSpacing: '-0.02em' }}>
        No free lunch,
        <br />
        <span style={gradientText}>just a dial</span>
      </div>
      <div style={{ position: 'absolute', left: x0, top: 470, width: w, height: 18, borderRadius: 9, background: `linear-gradient(90deg, ${C.accent2}, ${alpha(C.text, 0.85)})` }} />
      <div
        style={{
          position: 'absolute',
          left: x0 + pos * w - 40,
          top: 439,
          width: 80,
          height: 80,
          borderRadius: 40,
          background: C.text,
          border: `8px solid ${C.accent}`,
          boxShadow: `0 0 30px ${alpha(C.accent, 0.8)}`,
        }}
      />
      {[
        { x: 0, align: 'left' as const, top: 'learn more,', bot: 'forget more', who: 'Full fine-tuning' },
        { x: 960 - 440, align: 'right' as const, top: 'learn less,', bot: 'forget less', who: 'LoRA' },
      ].map((e) => (
        <div key={e.who} style={{ position: 'absolute', left: e.x, top: 560, width: 440, textAlign: e.align }}>
          <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15 }}>
            {e.top}
            <br />
            {e.bot}
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 12, ...(e.who === 'LoRA' ? gradientText : { color: C.accentText }) }}>{e.who}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', opacity: d.tag }}>
        <div style={{ padding: '14px 30px', borderRadius: 24, background: C.card, border: `2px solid ${alpha(C.muted, 0.45)}`, fontSize: 36, fontWeight: 700, color: C.text }}>
          here the task was easy: both ≈0.90
        </div>
      </div>
    </div>
  );
};

export const CostReceipt: React.FC<AnimProps & ReceiptProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props as ReceiptProps, t, beats, dur);
  // A slow, steady push-in over the whole scene: the bill holds still for seconds at a time
  // between its beats (a static frame for ~2 s reads as a paused video), and this keeps the
  // picture alive without competing with the beats.
  const tt = Number.isFinite(dur) && dur > 0 ? Math.min(1, Math.max(0, t / dur)) : 0;
  const push = 1 + 0.035 * tt;
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push.toFixed(5)})`, transformOrigin: "50% 30%" }}>
        {s.mode === 'bill' ? <Bill s={s} /> : <TradeDial s={s} t={t} />}
      </div>
    </Stage>
  );
};
