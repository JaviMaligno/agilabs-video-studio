import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, CARDS, ROWS, LAYA_SLOT, OPUS_SLOT, type DeckProps } from './SnapshotDeck.state.ts';
import { samplePlayers, toView, viewOf, viewSize, type ClipSet } from './DotStage.state.ts';
import { mix } from './fields.tsx';
import { gradientText } from './Stage.tsx';
import clips from '../data/clips.json';

export { frameState };
export type { DeckProps };

const DATA = clips as unknown as ClipSet;

// ---- laya layout ----
const CARD = 200;
const GAP = 14;
const COLS = 4;
const DECK_W = COLS * CARD + (COLS - 1) * GAP;
const DECK_H = 2 * CARD + GAP;
const DECK_TOP = 392;
const slotXY = (slot: number) => ({ x: (slot % COLS) * (CARD + GAP), y: Math.floor(slot / COLS) * (CARD + GAP) });

/** One snapshot of the hook clip: dots on a dark card, its number in the corner. */
const Card: React.FC<{ k: number; at: number; lit: number }> = ({ k, at, lit }) => {
  const clip = DATA.hook;
  const view = viewOf(clip, 'stage');
  const vs = viewSize(view);
  const pad = 14;
  const scale = Math.min((CARD - 2 * pad) / vs.w, (CARD - 2 * pad) / vs.h);
  const ox = (CARD - vs.w * scale) / 2;
  const oy = (CARD - vs.h * scale) / 2;
  const pts = samplePlayers(clip, at).map((q) => {
    const v = toView(view, clip.field, q.x, q.y);
    return { x: ox + v.u * scale, y: oy + v.v * scale };
  });
  return (
    <div style={{ position: 'relative', width: CARD, height: CARD, borderRadius: 14, background: C.card, boxShadow: `0 0 0 2px ${alpha(C.muted, 0.22)}, 0 14px 30px ${alpha(C.bg0, 0.6)}` }}>
      <svg width={CARD} height={CARD} style={{ position: 'absolute', inset: 0 }}>
        {pts.map((q, i) => (
          <circle key={i} cx={q.x} cy={q.y} r={7} fill={mix(C.muted, C.ok, lit)} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 12, top: 6, fontSize: 34, fontWeight: 800, color: C.text }}>{k + 1}</div>
    </div>
  );
};

/** Small triangle: the article's marker for image input (Opus's order effect is its image cell). */
const Tri: React.FC<{ colour: string }> = ({ colour }) => (
  <svg width={26} height={24} viewBox="0 0 26 24" style={{ marginLeft: 10 }}>
    <polygon points="13,2 24,22 2,22" fill={colour} />
  </svg>
);

// ---- company layout ----
const SLOT_W = 292;
const SLOT_H = 104;
const SLOT_GAP = 14;
const BOX_LEFT = (1080 - (3 * SLOT_W + 2 * SLOT_GAP)) / 2;
const ACC_TOP = 470;
const ORDER_TOP = 1080;
const accXY = (slot: number) => ({ x: BOX_LEFT + (slot % 3) * (SLOT_W + SLOT_GAP), y: ACC_TOP + Math.floor(slot / 3) * (SLOT_H + SLOT_GAP) });
const seatXY = (seat: number) => ({ x: BOX_LEFT + seat * (SLOT_W + SLOT_GAP), y: ORDER_TOP });
const CLASSIFIER_XY = { x: BOX_LEFT + 2 * (SLOT_W + SLOT_GAP), y: ACC_TOP + 2 * (SLOT_H + SLOT_GAP) + 60 };

const Chip: React.FC<{
  x: number;
  y: number;
  name: string;
  value?: string;
  opacity: number;
  tone: 'plain' | 'laya' | 'ghost';
  glow?: number;
  zero?: number;
  valueOpacity?: number;
}> = ({ x, y, name, value, opacity, tone, glow = 0, zero = 0, valueOpacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: SLOT_W,
      height: SLOT_H,
      borderRadius: 18,
      opacity,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      background: tone === 'laya' ? alpha(C.accent, 0.22) : alpha(C.card, 0.96),
      border: tone === 'laya' ? `3px solid ${C.accentText}` : tone === 'ghost' ? `3px dashed ${alpha(C.muted, 0.6)}` : `2px solid ${alpha(C.muted, 0.35)}`,
      boxShadow: tone === 'laya' ? `0 0 ${20 + 40 * glow}px ${alpha(C.accent, 0.35 + 0.3 * glow)}` : undefined,
      whiteSpace: 'nowrap',
    }}
  >
    <span style={{ fontSize: tone === 'laya' ? 44 : 32, fontWeight: 800, color: tone === 'ghost' ? C.text : C.text, letterSpacing: tone === 'laya' ? '0.03em' : 0 }}>{name}</span>
    {value && <span style={{ fontSize: 40, fontWeight: 800, opacity: valueOpacity, ...(tone === 'laya' ? gradientText : { color: C.text }) }}>{value}</span>}
    {zero > 0 && (
      <span style={{ position: 'absolute', right: -10, top: -20, padding: '2px 12px', borderRadius: 12, background: C.bg0, border: `2px solid ${C.muted}`, fontSize: 30, fontWeight: 800, color: C.text, opacity: zero }}>
        ≈ 0
      </span>
    )}
  </div>
);

export const SnapshotDeck: React.FC<AnimProps & DeckProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const base: React.CSSProperties = { position: 'absolute', inset: 0, fontFamily, color: C.text };

  if (p.mode === 'company') {
    const c = s.company;
    const layaFrom = { x: 1100, y: accXY(LAYA_SLOT).y };
    const layaAcc = accXY(LAYA_SLOT);
    const layaSeat = seatXY(2);
    const lx = layaFrom.x + (layaAcc.x - layaFrom.x) * c.laya.slide + (layaSeat.x - layaAcc.x) * c.laya.hop;
    const ly = layaAcc.y + (layaSeat.y - layaAcc.y) * c.laya.hop - 160 * c.laya.arc;
    const opus = s.frontier[OPUS_SLOT];
    const oa = accXY(OPUS_SLOT);
    const os = seatXY(0);
    const cs = seatXY(1);
    return (
      <div style={base}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 384, textAlign: 'center', fontSize: 48, fontWeight: 800, letterSpacing: '0.12em', color: C.muted, opacity: c.accTitle }}>
          ACCURACY
        </div>
        {/* Frontier table. */}
        <div
          style={{
            position: 'absolute',
            left: BOX_LEFT - 18,
            top: ACC_TOP - 18,
            width: 3 * SLOT_W + 2 * SLOT_GAP + 36,
            height: 2 * SLOT_H + SLOT_GAP + 36,
            borderRadius: 26,
            border: `2px solid ${alpha(C.muted, 0.25)}`,
            background: alpha(C.bg1, 0.6),
            opacity: c.accTitle,
          }}
        />
        <div style={{ position: 'absolute', left: BOX_LEFT, top: ACC_TOP + 2 * (SLOT_H + SLOT_GAP) + 16, fontSize: 30, fontWeight: 700, color: C.muted, opacity: c.accTitle }}>frontier models</div>
        {/* Vacated slots stay as faint outlines. */}
        {[OPUS_SLOT, LAYA_SLOT].map((k) => {
          const a = accXY(k);
          const show = k === OPUS_SLOT ? opus.down : c.laya.hop;
          return <div key={k} style={{ position: 'absolute', left: a.x, top: a.y, width: SLOT_W, height: SLOT_H, borderRadius: 18, border: `2px dashed ${alpha(C.muted, 0.3)}`, opacity: show }} />;
        })}
        {s.frontier.map((f) =>
          f.name && f.slot !== OPUS_SLOT ? <Chip key={f.slot} {...accXY(f.slot)} name={f.name} opacity={f.opacity} tone="plain" zero={f.zero} /> : null,
        )}
        <Chip x={oa.x + (os.x - oa.x) * opus.down} y={oa.y + (os.y - oa.y) * opus.down} name="Claude Opus 5.5" opacity={opus.opacity} tone="plain" />
        {/* The classifier, alone far ahead. */}
        <Chip
          x={CLASSIFIER_XY.x + (cs.x - CLASSIFIER_XY.x) * c.classifierDown}
          y={CLASSIFIER_XY.y + (cs.y - CLASSIFIER_XY.y) * c.classifierDown}
          name="Classifier"
          opacity={c.classifier}
          tone="ghost"
        />
        {/* Order table. */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: ORDER_TOP - 92, textAlign: 'center', fontSize: 48, fontWeight: 800, letterSpacing: '0.12em', color: C.muted, opacity: c.orderTitle }}>
          READS THE ORDER
        </div>
        <div
          style={{
            position: 'absolute',
            left: BOX_LEFT - 18,
            top: ORDER_TOP - 18,
            width: 3 * SLOT_W + 2 * SLOT_GAP + 36,
            height: SLOT_H + 36,
            borderRadius: 26,
            border: `3px solid ${alpha(C.accentText, 0.3 + 0.5 * c.glow)}`,
            background: alpha(C.accent, 0.06 + 0.1 * c.glow),
            boxShadow: `0 0 ${50 * c.glow}px ${alpha(C.accent, 0.35 * c.glow)}`,
            opacity: c.seats,
          }}
        />
        <div style={{ position: 'absolute', left: 0, right: 0, top: ORDER_TOP + SLOT_H + 40, textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.muted, opacity: c.glow }}>
          lose accuracy when shuffled
        </div>
        <Chip x={lx} y={ly} name="LAYA" opacity={c.laya.opacity} tone="laya" glow={c.glow} />
      </div>
    );
  }

  // ---- laya ----
  const left = (1080 - DECK_W) / 2;
  const deckPt = { x: DECK_W / 2 - CARD / 2, y: DECK_H / 2 - CARD / 2 };
  const pos = s.cards.map((c) => {
    const a = slotXY(c.from);
    const b = slotXY(c.to);
    let x = a.x + (b.x - a.x) * c.move;
    let y = a.y + (b.y - a.y) * c.move;
    x += (deckPt.x - x) * c.gather;
    y += (deckPt.y - y) * c.gather;
    y += (1 - c.deal) * 700;
    return { x, y };
  });
  const centres = pos.map((q) => ({ x: q.x + CARD / 2, y: q.y + CARD / 2 }));
  const path = centres.map((q, i) => `${i ? 'L' : 'M'} ${q.x} ${q.y}`).join(' ');
  const pathLen = centres.slice(1).reduce((acc, q, i) => acc + Math.hypot(q.x - centres[i].x, q.y - centres[i].y), 0) || 1;
  const chipTop = DECK_TOP + DECK_H + 26;
  const rowsTop = chipTop + 118;
  const rowH = 84;
  const barMax = 300;
  const unit = barMax / 12;
  const lit = s.chip.glow;

  return (
    <div style={base}>
      <div style={{ position: 'absolute', left, top: DECK_TOP, width: DECK_W, height: DECK_H }}>
        {s.cards.map((c, i) => (
          <div key={c.k} style={{ position: 'absolute', left: pos[i].x, top: pos[i].y, opacity: c.opacity, zIndex: c.gather > 0 ? 10 + c.k : 1, transform: `rotate(${c.gather * (c.k % 2 ? 7 : -7)}deg)` }}>
            <Card k={c.k} at={c.snapAt} lit={lit} />
          </div>
        ))}
        <svg width={DECK_W} height={DECK_H} style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 30, pointerEvents: 'none' }}>
          <path
            d={path}
            fill="none"
            stroke={s.arrow.broken > 0.5 ? C.muted : mix(C.accentText, C.ok, lit)}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={s.arrow.broken > 0.5 ? '18 22' : `${pathLen * s.arrow.draw} ${pathLen}`}
            opacity={s.arrow.opacity * (s.arrow.broken > 0.5 ? 0.7 : 0.9)}
          />
          {s.arrow.broken <= 0.5 &&
            s.arrow.draw > 0.97 &&
            (() => {
              const a = centres[CARDS - 2];
              const b = centres[CARDS - 1];
              const ang = Math.atan2(b.y - a.y, b.x - a.x);
              const hl = 30;
              const p1 = `${b.x - hl * Math.cos(ang - 0.45)},${b.y - hl * Math.sin(ang - 0.45)}`;
              const p2 = `${b.x - hl * Math.cos(ang + 0.45)},${b.y - hl * Math.sin(ang + 0.45)}`;
              return <polygon points={`${b.x},${b.y} ${p1} ${p2}`} fill={mix(C.accentText, C.ok, lit)} opacity={s.arrow.opacity} />;
            })()}
        </svg>
      </div>

      {/* LAYA chip: reads the order (teal glow), dims once shuffled. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: chipTop, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: s.chip.opacity }}>
        <div
          style={{
            padding: '14px 36px',
            borderRadius: 22,
            background: alpha(C.card, 0.97),
            border: `4px solid ${mix(C.accentText, C.ok, lit)}`,
            boxShadow: `0 0 ${20 + 40 * lit}px ${alpha(C.ok, 0.45 * lit)}`,
            opacity: 1 - 0.55 * s.chip.dim,
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: '0.03em',
            ...gradientText,
          }}
        >
          LAYA
        </div>
        <div style={{ position: 'relative', width: 560, height: 60 }}>
          <div style={{ position: 'absolute', left: 0, top: 6, fontSize: 40, fontWeight: 700, color: C.text, opacity: s.chip.epochs * Math.max(0, 1 - 2 * s.chip.dim), whiteSpace: 'nowrap' }}>
            in order: <span style={{ color: C.ok }}>1 → 8</span>
          </div>
          <div style={{ position: 'absolute', left: 0, top: 6, fontSize: 40, fontWeight: 700, color: C.text, opacity: Math.max(0, 2 * s.chip.dim - 1), whiteSpace: 'nowrap' }}>
            shuffled: <span style={{ color: C.flat }}>5, 2, 8, 1…</span>
          </div>
        </div>
      </div>

      {/* Points lost when shuffled. */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: rowsTop }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.muted, textAlign: 'center', marginBottom: 14, opacity: s.rowsTitle }}>Accuracy lost once shuffled</div>
        {s.rows.map((r, i) => {
          const R = ROWS[i];
          const main = r.kind === 'laya';
          return (
            <div
              key={r.name}
              style={{
                position: 'relative',
                height: rowH,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                padding: '0 22px',
                borderRadius: 16,
                background: main ? alpha(C.accent, 0.18) : alpha(C.card, 0.45),
                border: main ? `3px solid ${alpha(C.accentText, 0.7)}` : `2px dashed ${alpha(C.muted, 0.5)}`,
                opacity: r.opacity,
              }}
            >
              <div style={{ width: 290, display: 'flex', alignItems: 'center', fontSize: main ? 42 : 36, fontWeight: 800, color: main ? C.text : C.muted, whiteSpace: 'nowrap' }}>
                {r.name}
                {r.kind === 'opus' && <Tri colour={C.muted} />}
              </div>
              <div style={{ position: 'relative', flex: 1, height: rowH, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 3, background: alpha(C.muted, 0.45) }} />
                <div style={{ position: 'absolute', left: 0, height: 28, width: R.drop * unit * r.grow, borderRadius: 14, background: main ? GRADIENT : alpha(C.muted, 0.55) }} />
                <div style={{ position: 'absolute', left: R.drop * unit + 16, fontSize: main ? 42 : 36, fontWeight: 800, color: main ? C.text : C.muted, opacity: r.grow, whiteSpace: 'nowrap' }}>
                  {R.text}
                </div>
                {/* The prediction, before the result: will shuffling cost it anything? */}
                {r.ask > 0 && <div style={{ position: 'absolute', left: 26, fontSize: 54, fontWeight: 800, color: C.accentText, opacity: r.ask }}>?</div>}
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 30, fontWeight: 600, color: C.muted, opacity: s.foot }}>
          3 seeds · corrected p = 0.007<span style={{ display: 'inline-flex', alignItems: 'center', opacity: s.footImage }}>
            &nbsp;·&nbsp;
            <svg width={20} height={18} viewBox="0 0 26 24" style={{ marginRight: 6 }}>
              <polygon points="13,2 24,22 2,22" fill={C.muted} />
            </svg>
            image input
          </span>
        </div>
      </div>
    </div>
  );
};
