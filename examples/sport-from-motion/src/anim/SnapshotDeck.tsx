import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { Lang } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, CARDS, ROWS, type DeckProps } from './SnapshotDeck.state.ts';
import { samplePlayers, toView, viewOf, viewSize, type ClipSet } from './DotStage.state.ts';
import { gradientText, stageOf } from './Stage.tsx';
import clips from '../data/clips.json';

export { frameState };
export type { DeckProps };

const DATA = clips as unknown as ClipSet;

/** Vertical layout: the 4x2 deck at the top, labels or the verdict rows under it. */
const CARD = 214;
const GAP = 14;
const COLS = 4;
const DECK_W = COLS * CARD + (COLS - 1) * GAP;
const DECK_H = 2 * CARD + GAP;
const DECK_TOP = 262;

const slotXY = (slot: number) => ({ x: (slot % COLS) * (CARD + GAP), y: Math.floor(slot / COLS) * (CARD + GAP) });

/** One snapshot of the hook clip: grey dots on a dark card, its number in the corner. */
const Card: React.FC<{ k: number; at: number }> = ({ k, at }) => {
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
          <circle key={i} cx={q.x} cy={q.y} r={7} fill={C.muted} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 12, top: 6, fontSize: 34, fontWeight: 800, color: C.text }}>{k + 1}</div>
    </div>
  );
};

export const SnapshotDeck: React.FC<AnimProps & DeckProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const stage = stageOf(p.vertical);
  const lang: Lang = p.lang;
  const left = (1080 - DECK_W) / 2;
  const top = p.vertical ? DECK_TOP : stage.top;
  const deckPt = { x: DECK_W / 2 - CARD / 2, y: DECK_H / 2 - CARD / 2 };

  // Card positions: ordered slot -> (via the deck point while gathering) -> shuffled slot.
  const pos = s.cards.map((c) => {
    const a = slotXY(c.from);
    const b = slotXY(c.to);
    let x = a.x + (b.x - a.x) * c.move;
    let y = a.y + (b.y - a.y) * c.move;
    x += (deckPt.x - x) * c.gather;
    y += (deckPt.y - y) * c.gather;
    // Deal: from below the deck.
    y += (1 - c.deal) * 700;
    return { x, y };
  });
  const centres = pos.map((q) => ({ x: q.x + CARD / 2, y: q.y + CARD / 2 }));
  // The arrow through cards 1..8 in their numeric order.
  const path = centres.map((q, i) => `${i ? 'L' : 'M'} ${q.x} ${q.y}`).join(' ');
  const pathLen = centres.slice(1).reduce((acc, q, i) => acc + Math.hypot(q.x - centres[i].x, q.y - centres[i].y), 0) || 1;

  const rowsTop = top + DECK_H + 40;
  const rowH = 74;
  const rowGap = 8;
  const barMax = 330;
  const scale12 = barMax / 12;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', left, top, width: DECK_W, height: DECK_H }}>
        {s.cards.map((c, i) => (
          <div
            key={c.k}
            style={{
              position: 'absolute',
              left: pos[i].x,
              top: pos[i].y,
              opacity: c.opacity * (p.mode === 'shuffle' ? 1 : 0.7),
              zIndex: c.gather > 0 ? 10 + c.k : 1,
              transform: `rotate(${c.gather * (c.k % 2 ? 7 : -7)}deg)`,
            }}
          >
            <Card k={c.k} at={c.snapAt} />
          </div>
        ))}
        <svg width={DECK_W} height={DECK_H} style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 30, pointerEvents: 'none' }}>
          <path
            d={path}
            fill="none"
            stroke={s.arrow.broken > 0.5 ? C.muted : C.accentText}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={s.arrow.broken > 0.5 ? '18 22' : `${pathLen * s.arrow.draw} ${pathLen}`}
            opacity={s.arrow.opacity * (s.arrow.broken > 0.5 ? 0.75 : 0.9)}
          />
          {s.arrow.broken <= 0.5 && s.arrow.draw > 0.97 && (
            (() => {
              const a = centres[CARDS - 2];
              const b = centres[CARDS - 1];
              const ang = Math.atan2(b.y - a.y, b.x - a.x);
              const hl = 30;
              const p1 = `${b.x - hl * Math.cos(ang - 0.45)},${b.y - hl * Math.sin(ang - 0.45)}`;
              const p2 = `${b.x - hl * Math.cos(ang + 0.45)},${b.y - hl * Math.sin(ang + 0.45)}`;
              return <polygon points={`${b.x},${b.y} ${p1} ${p2}`} fill={C.accentText} opacity={s.arrow.opacity} />;
            })()
          )}
        </svg>
      </div>

      {/* Shuffle scene: what the deck shows, in big type. */}
      {p.mode === 'shuffle' && (
        <div style={{ position: 'absolute', left: 60, right: 60, top: rowsTop + 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
          <div style={{ position: 'relative', height: 170, width: '100%' }}>
            <div style={{ position: 'absolute', inset: 0, textAlign: 'center', opacity: s.labels.ordered }}>
              <div style={{ fontSize: 44, fontWeight: 700, color: C.muted }}>{lang === 'es' ? 'En orden' : 'In order'}</div>
              <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: '-0.02em', ...gradientText }}>1 → 8</div>
            </div>
            <div style={{ position: 'absolute', inset: 0, textAlign: 'center', opacity: s.labels.shuffled }}>
              <div style={{ fontSize: 44, fontWeight: 700, color: C.muted }}>{lang === 'es' ? 'Barajadas' : 'Shuffled'}</div>
              <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: '-0.02em', color: C.text }}>5, 2, 8, 1…</div>
            </div>
          </div>
          <div
            style={{
              opacity: s.labels.matters,
              padding: '16px 34px',
              borderRadius: 999,
              background: alpha(C.card, 0.95),
              border: `3px solid ${alpha(C.accentText, 0.6)}`,
              fontSize: 46,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {lang === 'es' ? 'Si lees movimiento, el orden importa' : 'Reading motion? Order matters'}
          </div>
        </div>
      )}

      {/* Verdict rows: accuracy lost when the snapshots are shuffled. */}
      {p.mode !== 'shuffle' && (
        <div style={{ position: 'absolute', left: 60, right: 60, top: rowsTop - 6 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.muted, textAlign: 'center', marginBottom: 12, opacity: s.rowsTitle }}>
            {lang === 'es' ? 'Precisión perdida al barajar' : 'Accuracy lost when shuffled'}
          </div>
          {s.rows.map((r, i) => {
            const ROW = ROWS[i];
            const accent = r.kind === 'opus';
            const ghost = r.kind === 'classifier';
            return (
              <div
                key={r.name}
                style={{
                  position: 'relative',
                  height: rowH,
                  marginBottom: rowGap,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 22px',
                  borderRadius: 16,
                  background: accent ? alpha(C.accent, 0.12 + 0.12 * r.glow) : alpha(C.card, ghost ? 0.4 : 0.85),
                  border: ghost ? `2px dashed ${alpha(C.muted, 0.5)}` : `2px solid ${accent ? alpha(C.accentText, 0.35 + 0.5 * r.glow) : alpha(C.muted, 0.2)}`,
                  boxShadow: accent ? `0 0 ${40 * r.glow}px ${alpha(C.accent, 0.45 * r.glow)}` : undefined,
                  opacity: r.opacity * (1 - r.dim),
                }}
              >
                <div style={{ width: 360, fontSize: 36, fontWeight: 700, color: ghost ? C.muted : C.text, whiteSpace: 'nowrap' }}>{r.name}</div>
                <div style={{ position: 'relative', flex: 1, height: rowH, display: 'flex', alignItems: 'center' }}>
                  {/* Zero line. */}
                  <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 3, background: alpha(C.muted, 0.45) }} />
                  {ROW.drop > 0 ? (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          height: 26,
                          width: ROW.drop * scale12 * r.grow,
                          borderRadius: 13,
                          background: ghost ? alpha(C.muted, 0.55) : GRADIENT,
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: ROW.drop * scale12 + 14,
                          fontSize: 34,
                          fontWeight: 800,
                          color: ghost ? C.muted : C.text,
                          opacity: r.grow,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ROW.text}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ position: 'absolute', left: -7, width: 16, height: 16, borderRadius: 8, background: C.muted }} />
                      <div style={{ position: 'absolute', left: 26, fontSize: 30, fontWeight: 600, color: C.muted, opacity: Math.max(0, 1 - 2 * r.note), whiteSpace: 'nowrap' }}>
                        {lang === 'es' ? 'sin caída clara' : 'no clear drop'}
                      </div>
                      <div style={{ position: 'absolute', left: 26, fontSize: 30, fontWeight: 700, color: C.text, opacity: Math.max(0, 2 * r.note - 1), whiteSpace: 'nowrap' }}>
                        {lang === 'es' ? 'sin evidencia' : 'no evidence'}
                      </div>
                    </>
                  )}
                </div>
                {r.doubt > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 18,
                      width: 54,
                      height: 54,
                      borderRadius: 27,
                      border: `3px solid ${C.accentText}`,
                      background: alpha(C.bg0, 0.6),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 36,
                      fontWeight: 800,
                      color: C.accentText,
                      opacity: r.doubt,
                      transform: `scale(${0.6 + 0.4 * r.doubt})`,
                    }}
                  >
                    ?
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
