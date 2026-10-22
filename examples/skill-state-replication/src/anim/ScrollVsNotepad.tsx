import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Chip, Mark, Stamp } from './pieces.tsx';
import { Notepad, Rack, Scroll, noteHeight, noteLineY, scrollLayout, SCROLL } from './world.tsx';
import { RACK, WAYS, frameState, slotX, type ScrollVsNotepadProps } from './ScrollVsNotepad.state.ts';

export { frameState };
export type { ScrollVsNotepadProps };

/** Four small icons: full transcript, summary, notepad + transcript, notepad only. */
const WayIcon: React.FC<{ i: number }> = ({ i }) => {
  const scroll = (x: number, y: number, h: number, n: number) => (
    <g>
      <rect x={x} y={y} width={58} height={h} rx={6} fill={alpha(C.text, 0.08)} stroke={alpha(C.muted, 0.8)} strokeWidth={3} />
      {Array.from({ length: n }, (_, k) => (
        <rect key={k} x={x + 9} y={y + 10 + k * 11} width={40 - (k % 2) * 10} height={5} rx={2} fill={alpha(C.muted, 0.8)} />
      ))}
    </g>
  );
  const pad = (x: number, y: number) => (
    <g>
      <rect x={x} y={y} width={66} height={56} rx={8} fill={C.card} stroke={C.accentText} strokeWidth={3} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={x + 10} y={y + 12 + k * 13} width={44} height={6} rx={3} fill={C.accentText} />
      ))}
    </g>
  );
  return (
    <svg width={110} height={130} viewBox="0 0 110 130" style={{ flex: 'none' }}>
      {i === 0 && scroll(26, 8, 114, 9)}
      {i === 1 && (
        <g>
          {scroll(26, 30, 60, 4)}
          <text x={55} y={122} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.muted}>≈</text>
        </g>
      )}
      {i === 2 && (
        <g>
          {scroll(26, 50, 76, 6)}
          {pad(22, 6)}
        </g>
      )}
      {i === 3 && pad(22, 36)}
    </svg>
  );
};

export const ScrollVsNotepad: React.FC<AnimProps & ScrollVsNotepadProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const n = s.notepad;
  const sc = s.scroll;
  const rackLabel = p.mode === 'hook' ? "what's really on the shelves" : p.mode === 'warehouse' ? undefined : 'the shelves';

  // Hook: the notepad's line 0 vs shelf 3, with ≠ between them.
  const hookFrom = { x: n.x - 6, y: noteLineY(n.y, 0) + 28 };
  const hookTo = { x: slotX(0) + RACK.w / 2, y: s.rack.y - 6 };

  // Correction: the bracket that links the record and its retraction on the scroll.
  const L = scrollLayout(sc);
  const lineMid = (idx: number) => sc.y + SCROLL.head + L.stackH + (idx - (L.n - L.full)) * L.lh + L.lh / 2;

  // Insurance: thread from the transcript's record of the move to shelf 6.
  const thr = { x0: sc.x + sc.w - 10, y0: lineMid(2), x1: slotX(1) + RACK.w / 2, y1: s.rack.y - 4 };

  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      <Rack y={s.rack.y} opacity={s.rack.opacity} slots={s.rack.slots} shipY={s.rack.shipY} label={rackLabel} />

      {/* warehouse: the test, its size and the four ways to remember */}
      {s.warehouse.chips[0] > 0 && (
        <div style={{ position: 'absolute', left: RACK.x0, top: 300, opacity: s.warehouse.chips[0], transform: `translateY(${(1 - s.warehouse.chips[0]) * 20}px)` }}>
          <Chip text="500 shelves" size={38} />
        </div>
      )}
      {s.warehouse.chips[1] > 0 && (
        <div style={{ position: 'absolute', right: 85, top: 300, opacity: s.warehouse.chips[1], transform: `translateY(${(1 - s.warehouse.chips[1]) * 20}px)` }}>
          <Chip text="up to 200 steps" size={38} />
        </div>
      )}
      {s.warehouse.agent > 0 && s.warehouse.agent < 1 && (
        <div
          style={{
            position: 'absolute',
            left: slotX(3) + RACK.w / 2 - 36 + (1 - s.warehouse.agent) * 260,
            top: s.rack.y + RACK.h + 30 - Math.sin(Math.PI * s.warehouse.agent) * 40,
            width: 72,
            height: 72,
            borderRadius: 36,
            background: GRADIENT,
            boxShadow: `0 0 30px ${alpha(C.accent, 0.7)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          agent
        </div>
      )}
      {s.warehouse.head > 0 && (
        <div style={{ position: 'absolute', left: RACK.x0, top: 730, fontSize: 40, fontWeight: 800, opacity: s.warehouse.head }}>4 ways to remember</div>
      )}
      {WAYS.map((w, i) => {
        const a = s.warehouse.ways[i];
        if (a <= 0) return null;
        const x = RACK.x0 + (i % 2) * 470;
        const y = 800 + Math.floor(i / 2) * 230;
        return (
          <div key={w} style={{ position: 'absolute', left: x, top: y, width: 450, height: 210, borderRadius: 18, background: C.card, border: `3px solid ${alpha(i >= 2 ? C.accentText : C.muted, 0.6)}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', boxSizing: 'border-box', opacity: a, transform: `scale(${0.9 + 0.1 * a})` }}>
            <WayIcon i={i} />
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15 }}>{w}</div>
          </div>
        );
      })}

      <Scroll sc={sc} />

      {/* correction: the record and its retraction, linked again every step */}
      {sc.connector.opacity > 0 && sc.list && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path
            d={`M ${sc.x + sc.w - 14} ${lineMid(0)} C ${sc.x + sc.w + 40} ${lineMid(0)}, ${sc.x + sc.w + 40} ${lineMid(sc.list.length - 1)}, ${sc.x + sc.w - 14} ${lineMid(sc.list.length - 1)}`}
            fill="none"
            stroke={C.warm}
            strokeWidth={5}
            strokeDasharray="10 8"
            opacity={sc.connector.opacity * (0.35 + 0.65 * sc.connector.pulse)}
          />
        </svg>
      )}
      {s.correction.notes[0] > 0 && (
        <div style={{ position: 'absolute', left: sc.x, top: sc.y + L.h + 18, width: sc.w, fontSize: 30, fontWeight: 800, color: C.warm, lineHeight: 1.2, opacity: s.correction.notes[0] }}>
          keeps both · reconciles them every step
        </div>
      )}
      {s.correction.notes[1] > 0 && (
        <div style={{ position: 'absolute', left: n.x, top: n.y + noteHeight(n.lines.length) + 18, width: n.w, fontSize: 30, fontWeight: 800, color: C.ok, lineHeight: 1.2, opacity: s.correction.notes[1] }}>
          one place · rewritten once
        </div>
      )}

      {/* notepad mode: the scratch reasoning above the notepad is discarded */}
      {n.scratch.opacity > 0 && (
        <div style={{ position: 'absolute', left: n.x, top: n.y - 150, width: n.w, height: 84, borderRadius: 16, border: `3px dashed ${alpha(C.muted, 0.6)}`, opacity: n.scratch.opacity, display: 'flex', alignItems: 'center', paddingLeft: 20, boxSizing: 'border-box' }}>
          <div style={{ fontSize: 28, fontStyle: 'italic', color: C.muted, whiteSpace: 'nowrap' }}>reasoning: ship C4 from 6…</div>
          <div style={{ position: 'absolute', right: 14, top: -22, padding: '2px 12px', borderRadius: 10, background: C.bg0, border: `3px solid ${C.marker}`, color: C.marker, fontSize: 24, fontWeight: 800, opacity: n.scratch.discarded }}>discarded</div>
        </div>
      )}

      {/* promises: two claims pinned above the notepad, then the stamp */}
      {['accuracy on long tasks', 'prompt stays small'].map((text, i) => {
        const a = s.promises.cards[i];
        if (a <= 0) return null;
        return (
          <div key={text} style={{ position: 'absolute', left: POS_PROM.x, top: POS_PROM.y + i * 96, width: 450, height: 80, borderRadius: 16, background: C.card, border: `3px solid ${alpha(C.text, 0.4)}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', boxSizing: 'border-box', opacity: a, transform: `translateY(${(1 - a) * -24}px)` }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, border: `4px solid ${C.ok}`, flex: 'none' }} />
            <div style={{ fontSize: 32, fontWeight: 800, whiteSpace: 'nowrap' }}>{text}</div>
          </div>
        );
      })}
      <Notepad n={n} />
      <div style={{ position: 'absolute', inset: 0, opacity: s.promises.fade }}>
        <Stamp text="REPLICATION" pop={s.promises.stamp} color={C.accentText} size={84} left={170} top={740} rotate={-8} gradient />
      </div>

      {/* hook: what the notepad says ≠ what the shelf holds */}
      {s.hook.neq > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: s.hook.neq }}>
          <line x1={hookFrom.x} y1={hookFrom.y} x2={hookTo.x} y2={hookTo.y} stroke={C.warm} strokeWidth={5} strokeDasharray="12 10" />
          <circle cx={(hookFrom.x + hookTo.x) / 2} cy={(hookFrom.y + hookTo.y) / 2} r={48} fill={C.bg0} stroke={C.warm} strokeWidth={5} />
          <text x={(hookFrom.x + hookTo.x) / 2} y={(hookFrom.y + hookTo.y) / 2 + 22} textAnchor="middle" fontSize={64} fontWeight={800} fill={C.warm} fontFamily={fontFamily}>≠</text>
        </svg>
      )}

      {/* insurance: the transcript leads the hand to the right shelf */}
      {s.insurance.thread > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path
            d={`M ${thr.x0} ${thr.y0} C ${thr.x0 + 180} ${thr.y0 + 20}, ${thr.x1 + 60} ${thr.y1 - 120}, ${thr.x1} ${thr.y1}`}
            fill="none"
            stroke={C.ok}
            strokeWidth={6}
            pathLength={1}
            strokeDasharray={`${s.insurance.thread} 1`}
          />
        </svg>
      )}
      {s.insurance.tag > 0 && (
        <div style={{ position: 'absolute', left: 590, top: 470, width: 420, borderRadius: 20, background: C.card, border: `3px solid ${alpha(C.ok, 0.7)}`, padding: '22px 26px', boxSizing: 'border-box', opacity: s.insurance.tag, transform: `translateY(${(1 - s.insurance.tag) * 20}px)` }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.accentText, whiteSpace: 'nowrap' }}>notepad + transcript</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 18, color: C.warm, lineHeight: 1.15, whiteSpace: 'nowrap' }}>same write errors</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 12, color: C.ok, lineHeight: 1.15, whiteSpace: 'nowrap' }}>0 failures from them</div>
        </div>
      )}

      {/* verdict */}
      <div style={{ position: 'absolute', inset: 0, opacity: s.verdict.fade }}>
      {s.verdict.works > 0 && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 730, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, fontSize: 42, fontWeight: 800, color: C.ok, opacity: s.verdict.works }}>
          <Mark size={48} color={C.ok} /> works · best when facts change
        </div>
      )}
      <Stamp text="DOESN'T FORGET" pop={s.verdict.forget} color={C.accentText} size={80} left={130} width={820} top={840} rotate={-4} gradient />
      <Stamp text="MISREMEMBERS" pop={s.verdict.mis} color={C.warm} size={80} left={170} width={740} top={1020} rotate={-4} />
      {s.verdict.some > 0 && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 1180, textAlign: 'center', fontSize: 38, fontWeight: 800, color: C.warm, opacity: s.verdict.some }}>on some models</div>
      )}
      </div>

      {/* advice */}
      {s.advice.items[0] > 0 && (
        <div style={{ position: 'absolute', left: 70, top: 330, opacity: s.advice.items[0] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 44, fontWeight: 800, whiteSpace: 'nowrap' }}>
            <Mark size={52} color={C.ok} /> check the write against the action
          </div>
          {[
            { left: 30, title: 'notepad write', value: 'shelf 3: SKU-K', border: C.accentText, bg: C.card },
            { left: 560, title: 'the action', value: 'moved 7 → 3', border: alpha(C.muted, 0.6), bg: alpha(C.bg1, 0.9) },
          ].map((b) => (
            <div key={b.title} style={{ position: 'absolute', left: b.left, top: 100, width: 380, height: 120, borderRadius: 16, background: b.bg, border: `3px solid ${b.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>{b.title}</div>
              <div style={{ fontSize: 36, fontWeight: 800, whiteSpace: 'nowrap' }}>{b.value}</div>
            </div>
          ))}
          <svg width={160} height={80} style={{ position: 'absolute', left: 400, top: 120 }}>
            <path d={`M 140 40 L ${140 - 120 * s.advice.arrow} 40`} stroke={C.ok} strokeWidth={6} strokeLinecap="round" />
            {s.advice.arrow > 0.95 && <path d="M 34 26 L 18 40 L 34 54" fill="none" stroke={C.ok} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          <div style={{ position: 'absolute', left: 30, top: 236, fontSize: 30, fontWeight: 700, color: C.muted, opacity: s.advice.arrow }}>the value matches what the action did</div>
        </div>
      )}
      {s.advice.items[1] > 0 && (
        <div style={{ position: 'absolute', left: 70, top: 720, opacity: s.advice.items[1] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 44, fontWeight: 800 }}>
            <Mark size={52} color={C.ok} /> notepad last · cache the rest
          </div>
        </div>
      )}
      {s.advice.stack > 0 && (
        <div style={{ position: 'absolute', left: 250, top: 830, width: 580, opacity: s.advice.stack }}>
          <div style={{ position: 'relative', height: 250, borderRadius: 16, background: alpha(C.text, 0.06), border: `3px solid ${alpha(C.muted, 0.5)}`, boxShadow: `0 0 ${36 * s.advice.glow}px ${alpha(C.ok, 0.5 * s.advice.glow)}` }}>
            <div style={{ position: 'absolute', inset: 6, borderRadius: 12, background: alpha(C.ok, 0.16 * s.advice.glow) }} />
            <div style={{ position: 'absolute', left: 22, top: 14, fontSize: 28, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>transcript</div>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={{ position: 'absolute', left: 22, top: 70 + k * 40, width: 420 - (k % 2) * 90, height: 12, borderRadius: 6, background: alpha(C.muted, 0.6) }} />
            ))}
            <div style={{ position: 'absolute', right: 20, top: 16, fontSize: 30, fontWeight: 800, color: C.ok, opacity: s.advice.glow }}>cached</div>
          </div>
          <div style={{ marginTop: 14, height: 100, borderRadius: 16, background: C.card, border: `3px solid ${C.accentText}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, color: C.accentText }}>notepad · last</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Where the two promise cards pin (above the notepad, right column). */
const POS_PROM = { x: 560, y: 330 } as const;
