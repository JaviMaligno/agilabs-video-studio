import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { gradientText } from './Stage.tsx';
import { Chip, Clock, Person, Stamp, Tick, clamp01 } from './pieces.tsx';
import { FAMILY_DROPS, TXT, bridgeWidth, frameState, type BridgeState, type ExamBridgeProps } from './ExamBridge.state.ts';

export { frameState };
export type { ExamBridgeProps };

// ── Geometry (frame px, 1080 x 1920). The spine is drawn in its own 940 x 360 box. ─────────────
const SPINE = { x: 70, y: 410, w: 940, h: 360 } as const;
const PAPER = { x: 0, w: 280 } as const;
const BAR = { x: 298, w: 50 } as const;
const BENCH = { x: 590, w: 350 } as const;
const BAND = { y: 250, h: 110 } as const;
/** Lower panel, under the spine. */
const PANEL = { x: 70, y: 830, w: 940, bottom: 1310 } as const;

const fadeUp = (o: number, dy = 24): React.CSSProperties => ({ opacity: clamp01(o), transform: `translateY(${(1 - clamp01(o)) * dy}px)` });

type SpineIn = Pick<BridgeState, 'score' | 'gold' | 'bridge' | 'paperDim' | 'benchDim' | 'redo' | 'opus' | 'fresh' | 'travel' | 'watch' | 'hand' | 'away' | 'early'> & {
  thick?: number;
  /** The open question over the bridge (last scene). */
  qmark?: number;
  labels?: boolean;
};

const PaperRows: React.FC<{ fresh?: boolean }> = ({ fresh }) => (
  <>
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{ position: 'absolute', left: 22, top: 82 + i * 52, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, border: `3px solid ${alpha(C.bg1, 0.6)}`, boxSizing: 'border-box' }} />
        <div style={{ width: (fresh ? [150, 120, 170, 110, 140] : [170, 130, 150, 180, 120])[i], height: 12, borderRadius: 6, background: alpha(C.muted, 0.75) }} />
        {!fresh && i % 2 === 0 && <Tick size={30} color={C.accent} />}
      </div>
    ))}
  </>
);

/** The exam, the score bar, the bridge and the workbench, in the spine's own box. */
const Spine: React.FC<SpineIn> = (s) => {
  const benchScale = 1 - 0.32 * s.away;
  const benchLeft = SPINE.w - BENCH.w * benchScale;
  const x0 = BAR.x + BAR.w + 14;
  const x1 = benchLeft - 12;
  const mid = (x0 + x1) / 2;
  const sw = bridgeWidth(s.bridge, s.thick ?? 0);
  // Point on the bridge (quadratic) for the travelling dot.
  const q = clamp01(s.travel);
  const dot = { x: (1 - q) ** 2 * x0 + 2 * (1 - q) * q * mid + q ** 2 * x1, y: (1 - q) ** 2 * 205 + 2 * (1 - q) * q * 120 + q ** 2 * 205 };
  const labels = s.labels !== false;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      {/* the exam paper */}
      <div style={{ position: 'absolute', left: PAPER.x, top: 0, width: PAPER.w, height: SPINE.h, borderRadius: 16, background: C.text, opacity: 1 - 0.6 * s.paperDim, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 22, top: 20, fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', color: C.bg0 }}>EXAM</div>
        <PaperRows />
        {s.fresh > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: C.text,
              borderLeft: `6px solid ${C.accent}`,
              transform: `translateX(${(1 - s.fresh) * -300}px)`,
              boxShadow: `12px 0 30px ${alpha(C.bg0, 0.35)}`,
            }}
          >
            <div style={{ position: 'absolute', left: 22, top: 20, fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', color: C.bg0 }}>EXAM</div>
            <div style={{ position: 'absolute', right: 16, top: 16 }}>
              <Chip text="NEW" size={24} />
            </div>
            <PaperRows fresh />
          </div>
        )}
      </div>

      {/* the score bar and its gold #1 */}
      <div style={{ position: 'absolute', left: BAR.x, top: 0, width: BAR.w, height: SPINE.h, borderRadius: 12, background: alpha(C.muted, 0.16), opacity: 1 - 0.6 * s.paperDim }}>
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: BAR.w, height: SPINE.h * clamp01(s.score), borderRadius: 12, background: GRADIENT }} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: BAR.x + BAR.w / 2 - 36,
          top: -44,
          width: 72,
          height: 72,
          borderRadius: 36,
          background: s.gold > 0.5 ? C.warm : alpha(C.bg1, 0.95),
          border: `4px solid ${s.gold > 0.5 ? C.warm : alpha(C.muted, 0.5)}`,
          boxShadow: `0 0 ${50 * s.gold}px ${alpha(C.warm, 0.8 * s.gold)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          fontWeight: 800,
          color: s.gold > 0.5 ? C.bg0 : C.muted,
          transform: `scale(${1 + 0.25 * Math.sin(Math.PI * clamp01(s.gold))})`,
          opacity: 1 - 0.6 * s.paperDim,
          boxSizing: 'border-box',
        }}
      >
        #1
      </div>

      {/* the bridge */}
      <svg width={SPINE.w} height={SPINE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={`M ${x0} 205 Q ${mid} 120 ${x1} 205`} fill="none" stroke={C.accentText} strokeWidth={sw} strokeDasharray={`${16 + sw * 0.4} 12`} strokeLinecap="round" opacity={0.9} />
        {q > 0 && q < 1 && <circle cx={dot.x} cy={dot.y - sw / 2} r={14} fill={C.text} opacity={Math.sin(Math.PI * q)} />}
      </svg>
      {(s.qmark ?? 0) > 0 && (
        <div
          style={{
            position: 'absolute',
            left: mid - 100,
            width: 200,
            top: -60,
            textAlign: 'center',
            fontSize: 170,
            fontWeight: 800,
            lineHeight: 1,
            opacity: clamp01(s.qmark ?? 0),
            transform: `translateY(${(1 - clamp01(s.qmark ?? 0)) * 30}px) scale(${0.85 + 0.15 * clamp01(s.qmark ?? 0)})`,
            ...gradientText,
          }}
        >
          {TXT.qmark}
        </div>
      )}
      {labels && (
        <div style={{ position: 'absolute', left: x0 - 10, width: x1 - x0 + 20, top: 236, textAlign: 'center', fontSize: 30, fontWeight: 800, lineHeight: 1.15, color: C.accentText }}>
          {TXT.transfer[0]}
          <br />
          {TXT.transfer[1]}
        </div>
      )}

      {/* the workbench */}
      <div
        style={{
          position: 'absolute',
          left: BENCH.x,
          top: 0,
          width: BENCH.w,
          height: SPINE.h,
          transformOrigin: 'right center',
          transform: `scale(${benchScale})`,
          opacity: (1 - 0.6 * s.benchDim) * (1 - 0.3 * s.away),
        }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: C.card, border: `3px solid ${alpha(C.muted, 0.35)}` }} />
        <div style={{ position: 'absolute', left: 22, top: 20, fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', color: C.muted }}>THE WORK</div>
        {TXT.tasks.map((task, i) => (
          <div
            key={task}
            style={{
              position: 'absolute',
              left: 20,
              top: 74 + i * 94,
              width: 310,
              height: 78,
              borderRadius: 12,
              background: alpha(C.bg1, 0.95),
              border: `2px solid ${alpha(C.muted, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 20,
              boxSizing: 'border-box',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {task}
            {i === 2 && (
              <div style={{ marginLeft: 16, display: 'flex', gap: 8 }}>
                {[0, 1, 2].map((k) => (
                  <div key={k} style={{ width: 22, height: 22, borderRadius: 11, background: k === 0 ? C.accent : alpha(C.accentText, 0.55) }} />
                ))}
              </div>
            )}
          </div>
        ))}
        {s.redo > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 252,
              top: 128,
              padding: '2px 14px',
              border: `5px solid ${C.marker}`,
              borderRadius: 10,
              color: C.marker,
              background: alpha(C.bg0, 0.9),
              fontSize: 32,
              fontWeight: 800,
              transform: `rotate(-10deg) scale(${1.6 - 0.6 * s.redo})`,
              opacity: clamp01(s.redo * 1.6),
            }}
          >
            {TXT.redo}
          </div>
        )}
        {s.opus > 0 && (
          <div style={{ position: 'absolute', right: 14, top: 12, opacity: clamp01(s.opus * 1.5), transform: `translateY(${(1 - s.opus) * -70}px)` }}>
            <Chip text={TXT.chip} size={26} />
          </div>
        )}
      </div>
      {s.watch > 0 && (
        <div style={{ position: 'absolute', left: SPINE.w - 118, top: -62, opacity: clamp01(s.watch * 1.5), transform: `scale(${1.5 - 0.5 * s.watch})` }}>
          <Clock size={96} color={C.warm} stopwatch turn={0.05 + 0.85 * s.hand} />
        </div>
      )}
      <Stamp x={SPINE.w - 250} y={-6} text={TXT.early} color={C.warm} pop={s.early} size={42} rotate={-8} />
    </div>
  );
};

/** One take of the split: a full spine at 0.8 scale, with its own score and bridge. */
const Take: React.FC<{ y: number; score: number; thick: number; opacity: number }> = ({ y, score, thick, opacity }) => {
  const k = 0.8;
  const x = (1080 - SPINE.w * k) / 2;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: SPINE.w, height: SPINE.h, transformOrigin: 'top left', transform: `scale(${k})`, opacity }}>
      <Spine score={score} gold={score > 0.97 ? 1 : 0} bridge={0.02} thick={thick} paperDim={0} benchDim={0} redo={0} opus={0} fresh={0} travel={0} watch={0} hand={0} away={0} early={0} />
    </div>
  );
};

const Bubble: React.FC<{ text: string; o: number; w?: number }> = ({ text, o, w = 260 }) => (
  <div style={{ position: 'relative', width: w, ...fadeUp(o, 18) }}>
    <div style={{ padding: '14px 10px', borderRadius: 20, background: C.card, border: `3px solid ${alpha(C.muted, 0.45)}`, textAlign: 'center', fontSize: 32, fontWeight: 700 }}>{text}</div>
    <div style={{ position: 'absolute', left: w / 2 - 14, bottom: -16, width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `17px solid ${alpha(C.muted, 0.45)}` }} />
  </div>
);

const RankCard: React.FC<{ title: string; rows: readonly string[]; x: number; o: number; accent: string }> = ({ title, rows, x, o, accent }) => (
  <div style={{ position: 'absolute', left: x, top: PANEL.y + 40, width: 400, height: 300, borderRadius: 20, background: C.card, border: `3px solid ${alpha(accent, 0.7)}`, ...fadeUp(o) }}>
    <div style={{ position: 'absolute', left: 28, top: 22, fontSize: 30, fontWeight: 800, letterSpacing: '0.1em', color: accent, textTransform: 'uppercase' }}>{title}</div>
    {rows.map((r, i) => (
      <div key={r} style={{ position: 'absolute', left: 28, top: 92 + i * 96, display: 'flex', alignItems: 'center', gap: 22, fontSize: 46, fontWeight: 800 }}>
        <div style={{ width: 62, height: 62, borderRadius: 31, background: i === 0 ? accent : alpha(C.muted, 0.25), color: i === 0 ? C.bg0 : C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>{i + 1}</div>
        {r}
      </div>
    ))}
  </div>
);

export const ExamBridge: React.FC<AnimProps & ExamBridgeProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const dimK = 1 - 0.8 * s.dim;
  const spineOpacity = s.spine * (1 - s.zoom) * dimK;
  const slot = (i: number) => clamp01(s.slots * 3 - i);
  const active = [s.s1, s.s2, s.s3];
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {/* ── band ─────────────────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', left: 70, width: 940, top: BAND.y, height: BAND.h, opacity: dimK }}>
        {s.q > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(s.q, -30) }}>
            <div style={{ padding: '18px 40px', borderRadius: 20, background: C.card, border: `3px solid ${C.accentText}`, fontSize: 50, fontWeight: 800 }}>{TXT.question}</div>
          </div>
        )}
        {s.word > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s.word, fontSize: 76, fontWeight: 800, letterSpacing: '0.06em', ...gradientText }}>{TXT.word}</div>
        )}
        {s.title > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s.title, fontSize: 52, fontWeight: 800 }}>{TXT.title}</div>
        )}
        {s.slots > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            {TXT.probes.map((pr, i) => (
              <div
                key={pr.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px 12px 12px',
                  borderRadius: 18,
                  background: active[i] > 0.5 ? alpha(C.accent, 0.22) : C.card,
                  border: `3px solid ${active[i] > 0.5 ? C.accentText : alpha(C.muted, 0.35)}`,
                  opacity: slot(i) * (1 - s.big) * (0.55 + 0.45 * Math.max(active[i], s.s1 + s.s2 + s.s3 > 0 ? 0 : 1)),
                  transform: `scale(${1 + 0.06 * active[i]})`,
                }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 23, background: active[i] > 0.5 ? GRADIENT : alpha(C.muted, 0.3), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>{pr.n}</div>
                <div style={{ fontSize: 30, fontWeight: 800, whiteSpace: 'nowrap', color: active[i] > 0.5 ? C.text : C.muted }}>{pr.short}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* the three probes, big, before they go up into the band */}
      {s.big > 0 &&
        TXT.probes.map((pr, i) => (
          <div
            key={pr.n}
            style={{
              position: 'absolute',
              left: 90,
              top: PANEL.y + 20 + i * 150 - (1 - s.big) * 40,
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              opacity: slot(i) * s.big,
              transform: `translateX(${(1 - slot(i)) * 40}px)`,
            }}
          >
            <div style={{ width: 104, height: 104, borderRadius: 52, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 58, fontWeight: 800 }}>{pr.n}</div>
            <div style={{ fontSize: 54, fontWeight: 800 }}>{pr.long}</div>
          </div>
        ))}

      {/* ── the spine ────────────────────────────────────────────────────────── */}
      {spineOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: SPINE.x,
            top: SPINE.y + s.spineY,
            width: SPINE.w,
            height: SPINE.h,
            opacity: spineOpacity,
            transformOrigin: `${BENCH.x + BENCH.w / 2}px ${SPINE.h / 2}px`,
            transform: `scale(${1 + 1.3 * s.zoom})`,
          }}
        >
          <Spine {...s} />
          <Stamp x={530} y={150} text={TXT.stamp} color={C.marker} pop={s.transfer} size={64} rotate={-7} />
        </div>
      )}

      {/* the name */}
      {s.stampFly < 1 && (
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - s.stampFly, transformOrigin: '540px 930px', transform: `translateY(${-625 * s.stampFly}px) scale(${1 - 0.3 * s.stampFly})` }}>
          <Stamp x={540} y={930} text={<span style={gradientText}>{TXT.word}</span>} color={C.accent} pop={s.stamp} size={96} rotate={-6 * (1 - s.stampFly)} />
        </div>
      )}

      {/* ── story ────────────────────────────────────────────────────────────── */}
      {s.people > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x, width: PANEL.w, top: PANEL.y + 10, height: 460, opacity: s.people }}>
          {[0, 1, 2].map((i) => {
            const o = [s.me, s.p1, s.p2][i];
            const x = [30, 360, 650][i];
            return (
              <div key={i} style={{ position: 'absolute', left: x, top: 0, width: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
                <Bubble text={TXT.story.bubble} o={o} />
                <div style={{ opacity: 0.35 + 0.65 * o }}>
                  <Person size={130} color={i === 0 ? C.accentText : C.muted} />
                </div>
                {i === 0 && <div style={{ fontSize: 38, fontWeight: 800, color: C.accentText, opacity: 0.35 + 0.65 * o }}>{TXT.story.me}</div>}
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 360, width: 550, top: 334, textAlign: 'center', fontSize: 38, fontWeight: 800, color: C.muted, opacity: clamp01(s.p1 + s.p2) }}>{TXT.story.people}</div>
        </div>
      )}
      <RankCard title={TXT.tableA.title} rows={TXT.tableA.rows} x={PANEL.x + 10} o={s.tables} accent={C.accentText} />
      <RankCard title={TXT.tableB.title} rows={TXT.tableB.rows} x={PANEL.x + 530} o={s.flipT} accent={C.ok} />
      {s.crack > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: clamp01(s.crack * 1.5) * clamp01(s.tables * 1.5) }}>
          <path
            d={`M 540 ${PANEL.y + 20} L 525 ${PANEL.y + 90} L 556 ${PANEL.y + 150} L 522 ${PANEL.y + 220} L 552 ${PANEL.y + 290} L 536 ${PANEL.y + 360}`}
            fill="none"
            stroke={C.marker}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - s.crack}
          />
        </svg>
      )}
      {s.buttons > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x, width: PANEL.w, top: PANEL.y + 110, display: 'flex', justifyContent: 'center', gap: 60, ...fadeUp(s.buttons) }}>
          <div style={{ position: 'relative', width: 340, height: 130, borderRadius: 24, border: `4px solid ${alpha(C.muted, 0.4)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 800, color: C.muted }}>
            {TXT.buttons[0]}
            <div style={{ position: 'absolute', left: 60, top: 66, height: 4, width: 220 * s.strike, background: alpha(C.marker, 0.85), borderRadius: 2 }} />
          </div>
          <div
            style={{
              width: 340,
              height: 130,
              borderRadius: 24,
              background: s.test > 0.5 ? GRADIENT : C.card,
              border: `4px solid ${C.accentText}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              fontWeight: 800,
              boxShadow: `0 0 ${60 * s.test}px ${alpha(C.accent, 0.7 * s.test)}`,
              transform: `scale(${1 + 0.08 * Math.sin(Math.PI * s.test)})`,
              boxSizing: 'border-box',
            }}
          >
            {TXT.buttons[1]}
          </div>
        </div>
      )}

      {/* ── definition: two ways to raise the score ──────────────────────────── */}
      {s.a1 + s.a2 > 0 && (
        <>
          <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
            {[s.a1, s.a2].map((a, i) => {
              const y = PANEL.y + 80 + i * 150;
              const bx = SPINE.x + BAR.x + BAR.w / 2;
              return (
                <path
                  key={i}
                  d={`M ${560} ${y} C ${bx + 40} ${y}, ${bx} ${y - 40}, ${bx} ${SPINE.y + SPINE.h + 20}`}
                  fill="none"
                  stroke={C.accentText}
                  strokeWidth={7}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - a}
                  opacity={a > 0 ? 1 : 0}
                />
              );
            })}
            <path d={`M ${SPINE.x + BAR.x + BAR.w / 2 - 18} ${SPINE.y + SPINE.h + 40} L ${SPINE.x + BAR.x + BAR.w / 2} ${SPINE.y + SPINE.h + 14} L ${SPINE.x + BAR.x + BAR.w / 2 + 18} ${SPINE.y + SPINE.h + 40}`} fill="none" stroke={C.accentText} strokeWidth={7} strokeLinecap="round" opacity={clamp01(Math.max(s.a1, s.a2) * 2 - 1)} />
          </svg>
          {[s.a1, s.a2].map((a, i) => (
            <div key={i} style={{ position: 'absolute', left: 560, top: PANEL.y + 50 + i * 150, padding: '10px 26px', borderRadius: 16, background: C.card, border: `3px solid ${C.accentText}`, fontSize: 40, fontWeight: 800, ...fadeUp(a, 0) }}>
              {TXT.arrows[i]}
            </div>
          ))}
        </>
      )}

      {/* ── split: the same climb, twice ─────────────────────────────────────── */}
      {s.minis > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s.minis }}>
          <Take y={440} score={0.22 + 0.78 * s.miniScore} thick={s.thick} opacity={1} />
          <Take y={850} score={0.22 + 0.78 * s.miniScore} thick={0} opacity={1} />
          <div style={{ position: 'absolute', right: 164, top: 380, fontSize: 44, fontWeight: 800, color: C.ok, ...fadeUp(s.tagL, 0) }}>{TXT.split[0]}</div>
          <div style={{ position: 'absolute', right: 164, top: 790, fontSize: 44, fontWeight: 800, color: C.warm, ...fadeUp(s.tagR, 0) }}>{TXT.split[1]}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', opacity: s.same, transform: `scale(${1.3 - 0.3 * s.same})` }}>
            <Chip text={TXT.same} size={38} />
          </div>
          <div style={{ position: 'absolute', left: 120, right: 120, top: 1226, textAlign: 'center', fontSize: 32, fontWeight: 600, lineHeight: 1.3, color: C.muted, opacity: s.foot7 }}>{TXT.foot7}</div>
        </div>
      )}

      {/* ── probe 1: fresh problems ──────────────────────────────────────────── */}
      {s.gsm > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x, top: PANEL.y + 10, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(s.gsm) }}>
          <Chip text={TXT.gsm.chip} size={34} />
          <div style={{ fontSize: 38, fontWeight: 700 }}>{TXT.gsm.text}</div>
        </div>
      )}
      {s.fam > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x, width: PANEL.w, top: PANEL.y + 100, height: 380, opacity: s.fam }}>
          {FAMILY_DROPS.map((dropBar, i) => {
            const h = 200 * (dropBar ? 1 - 0.5 * s.drop : 1);
            const col = dropBar ? (s.drop > 0.3 ? C.marker : alpha(C.muted, 0.6)) : s.drop > 0.3 ? C.ok : alpha(C.muted, 0.6);
            return <div key={i} style={{ position: 'absolute', left: 95 + i * 112, bottom: 150, width: 74, height: h, borderRadius: 10, background: col }} />;
          })}
          <div style={{ position: 'absolute', left: 60, right: 60, top: 236, height: 4, background: alpha(C.muted, 0.4) }} />
          <div style={{ position: 'absolute', left: 60, top: 262, display: 'flex', alignItems: 'center', gap: 14, fontSize: 34, fontWeight: 700, color: C.marker, opacity: s.famL }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.marker }} />
            {TXT.fam.drop}
          </div>
          <div style={{ position: 'absolute', left: 60, top: 316, display: 'flex', alignItems: 'center', gap: 14, fontSize: 34, fontWeight: 700, color: C.ok, opacity: s.famR }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.ok }} />
            {TXT.fam.hold}
          </div>
        </div>
      )}

      {/* ── probe 2: the leaderboard and the face-down variants ──────────────── */}
      {s.fan > 0 &&
        Array.from({ length: TXT.fan.n }, (_, i) => {
          const k = clamp01(s.fan * TXT.fan.n - i);
          const th = ((i / (TXT.fan.n - 1)) * 2 - 1) * 0.95;
          const r = 470;
          const cx = 540 + r * Math.sin(th) * k;
          const cy = PANEL.y + 560 - r * Math.cos(th * k);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: cx - 32,
                top: cy - 48,
                width: 64,
                height: 96,
                borderRadius: 8,
                background: `repeating-linear-gradient(45deg, ${C.card}, ${C.card} 6px, ${alpha(C.accent, 0.35)} 6px, ${alpha(C.accent, 0.35)} 9px)`,
                border: `2px solid ${alpha(C.accentText, 0.6)}`,
                transform: `rotate(${th * 57.3 * k}deg)`,
                opacity: k > 0 ? 1 : 0,
              }}
            />
          );
        })}
      {s.lb > 0 && (
        <div style={{ position: 'absolute', left: 190, top: PANEL.y + 130, width: 700, height: 160, borderRadius: 20, background: C.card, border: `3px solid ${C.accentText}`, boxShadow: `0 16px 40px ${alpha(C.bg0, 0.8)}`, ...fadeUp(s.lb) }}>
          <div style={{ position: 'absolute', left: 30, top: 18, fontSize: 28, fontWeight: 800, letterSpacing: '0.12em', color: C.muted }}>{TXT.lb.arena.toUpperCase()}</div>
          <div style={{ position: 'absolute', left: 30, top: 62, fontSize: 60, fontWeight: 800 }}>{TXT.lb.model}</div>
          <div style={{ position: 'absolute', right: 30, top: 58, fontSize: 64, fontWeight: 800, ...gradientText }}>{TXT.lb.elo}</div>
        </div>
      )}
      {s.lbTag > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: PANEL.y + 306, display: 'flex', justifyContent: 'center', ...fadeUp(s.lbTag, -16) }}>
          <div style={{ padding: '8px 22px', borderRadius: 12, background: alpha(C.warm, 0.14), border: `3px solid ${C.warm}`, color: C.warm, fontSize: 32, fontWeight: 700, transform: 'rotate(-1.5deg)' }}>{TXT.lb.tag}</div>
        </div>
      )}
      {s.fan > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x, width: PANEL.w, top: PANEL.y + 384, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: clamp01(s.fan * 3) }}>
          <div style={{ opacity: s.illusion }}>
            <Chip text={TXT.fan.chip} size={30} solid={false} />
          </div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>
            <span style={gradientText}>{Math.round(TXT.fan.n * clamp01(s.fan))}</span> {TXT.fan.counter}
          </div>
        </div>
      )}
      {s.fanTag > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: PANEL.y + 450, textAlign: 'center', fontSize: 34, fontWeight: 700, color: C.muted, ...fadeUp(s.fanTag, 10) }}>{TXT.fan.tag}</div>
      )}

      {/* ── probe 3: measure the work ────────────────────────────────────────── */}
      {s.metr > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x, top: PANEL.y + 10, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(s.metr) }}>
          <Chip text={TXT.metr.chip} size={32} />
          <div style={{ fontSize: 34, fontWeight: 700 }}>{TXT.metr.text}</div>
        </div>
      )}
      {s.tbars > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x, width: PANEL.w, top: PANEL.y + 96, opacity: s.tbars }}>
          {[
            { label: TXT.time.without, w: 520 * s.without, col: alpha(C.muted, 0.6) },
            { label: TXT.time.with, w: 520 * 1.19 * s.with, col: C.warm },
          ].map((b, i) => (
            <div key={i} style={{ position: 'absolute', left: 0, top: i * 120, width: PANEL.w }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: i ? C.text : C.muted }}>{b.label}</div>
              <div style={{ position: 'absolute', left: 0, top: 50, width: b.w, height: 46, borderRadius: 23, background: b.col }} />
              {i === 1 && (
                <div style={{ position: 'absolute', left: 520 * 1.19 + 20, top: 34, fontSize: 64, fontWeight: 800, color: C.warm, ...fadeUp(s.plus, 0) }}>{TXT.time.plus}</div>
              )}
            </div>
          ))}
          <div style={{ position: 'absolute', left: 520, top: 40, width: 0, height: 210, borderLeft: `3px dashed ${alpha(C.muted, 0.6)}`, opacity: s.plus }} />
        </div>
      )}
      {s.saved > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x + 10, top: PANEL.y + 352, display: 'flex', alignItems: 'center', gap: 18, ...fadeUp(s.saved, 16) }}>
          <Person size={70} color={C.muted} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 26px', borderRadius: 40, background: C.card, border: `3px solid ${C.ok}`, fontSize: 38, fontWeight: 800, color: C.ok }}>
            {TXT.time.saved}
          </div>
        </div>
      )}
      {s.foot16 > 0 && (
        <div style={{ position: 'absolute', left: PANEL.x + 500, width: 440, top: PANEL.y + 330, fontSize: 30, fontWeight: 600, lineHeight: 1.3, color: C.muted, opacity: s.foot16 }}>
          {TXT.foot16[0]} · {TXT.foot16[1]}
        </div>
      )}

      {/* ── the score card and its fine print ────────────────────────────────── */}
      {s.card > 0 && (
        <div style={{ position: 'absolute', left: 110, top: PANEL.y + 10, width: 860, height: 440, perspective: 1600, ...fadeUp(s.card) }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 24,
              background: C.card,
              border: `3px solid ${s.flip < 0.5 ? C.accentText : C.warm}`,
              transform: `scaleX(${Math.max(0.02, Math.abs(Math.cos(Math.PI * s.flip)))})`,
              boxShadow: `0 16px 50px ${alpha(C.bg0, 0.7)}`,
            }}
          >
            {s.flip < 0.5 ? (
              <>
                <div style={{ position: 'absolute', left: 40, top: 40 }}>
                  <Chip text={TXT.card.model} size={34} />
                </div>
                <div style={{ position: 'absolute', left: 40, top: 130, fontSize: 64, fontWeight: 800 }}>{TXT.card.bench}</div>
                <div style={{ position: 'absolute', left: 40, top: 260, width: 780, height: 60, borderRadius: 30, background: alpha(C.muted, 0.16) }}>
                  <div style={{ width: '86%', height: '100%', borderRadius: 30, background: GRADIENT }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', left: 40, top: 30, fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', color: C.warm, textTransform: 'uppercase' }}>{TXT.card.back}</div>
                {TXT.fine.map((line, i) => {
                  const o = [s.f1, s.f2, s.f3, s.f4][i];
                  const n = Math.round(line.length * clamp01(o * 1.4));
                  return (
                    <div key={line} style={{ position: 'absolute', left: 40, top: 96 + i * 84, display: 'flex', alignItems: 'center', gap: 16, fontSize: 38, fontWeight: 700, opacity: o > 0 ? 1 : 0 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 7, background: C.warm, flex: 'none' }} />
                      <span>
                        {line.slice(0, n)}
                        <span style={{ opacity: 0 }}>{line.slice(n)}</span>
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── the conductor: one agent directing several ───────────────────────── */}
      {s.cond > 0 && <Conductor s={s} t={p.t} />}
    </AbsoluteFill>
  );
};

const SUBS = [170, 400, 680, 910];
const LEAD = { x: 540, y: 520 } as const;
const OUT = { x: 540, y: 990 } as const;
const SUB_Y = 760;

const Conductor: React.FC<{ s: BridgeState; t: number }> = ({ s, t }) => {
  const box = (solid: boolean): React.CSSProperties => ({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    fontWeight: 800,
    background: solid ? GRADIENT : C.card,
    border: `3px solid ${solid ? C.accent : alpha(C.accentText, 0.7)}`,
    color: C.text,
    boxSizing: 'border-box',
  });
  const slow = 2;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: s.cond }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {SUBS.map((x, i) => (
          <React.Fragment key={i}>
            <line x1={LEAD.x} y1={LEAD.y + 55} x2={x} y2={SUB_Y - 45} stroke={alpha(C.accentText, 0.55)} strokeWidth={4} />
            <line x1={x} y1={SUB_Y + 45} x2={OUT.x} y2={OUT.y - 55} stroke={alpha(C.ok, 0.5)} strokeWidth={4} />
          </React.Fragment>
        ))}
        {SUBS.map((x, i) => {
            // Work flies out to each subagent; results fold back into the deliverable (the slow one last).
            const go = clamp01(s.fly * 1.4 - i * 0.12);
            const back = clamp01(s.fold * (i === slow ? 1 : 1.6) - (i === slow ? 0.5 : 0.1 * i)) * (i === slow ? 2 : 1);
            const b = clamp01(back);
            return (
              <React.Fragment key={i}>
                {go > 0 && go < 1 && <circle cx={LEAD.x + (x - LEAD.x) * go} cy={LEAD.y + 55 + (SUB_Y - 45 - LEAD.y - 55) * go} r={12} fill={C.text} />}
                {b > 0 && b < 1 && <circle cx={x + (OUT.x - x) * b} cy={SUB_Y + 45 + (OUT.y - 55 - SUB_Y - 45) * b} r={12} fill={C.ok} />}
              </React.Fragment>
            );
          })}
      </svg>
      <div style={{ ...box(true), left: LEAD.x - 170, top: LEAD.y - 55, width: 340, height: 110, fontSize: 44 }}>{TXT.cond.lead}</div>
      {SUBS.map((x, i) => (
        <div key={i} style={{ ...box(false), left: x - 100, top: SUB_Y - 45, width: 200, height: 90, fontSize: 31, opacity: 0.4 + 0.6 * clamp01(s.fly * 1.4 - i * 0.12) }}>
          {TXT.cond.sub}
          {i === slow && s.fold < 0.9 && (
            <div style={{ position: 'absolute', top: -26, right: -18, width: 50, height: 50, borderRadius: 25, border: `6px solid ${alpha(C.warm, 0.3)}`, borderTopColor: C.warm, transform: `rotate(${t * 360}deg)`, boxSizing: 'border-box' }} />
          )}
        </div>
      ))}
      <div style={{ position: 'absolute', left: SUBS[slow] - 105, width: 210, top: SUB_Y + 52, textAlign: 'center', fontSize: 28, fontWeight: 700, color: C.warm, opacity: s.fly * (1 - s.fold) }}>{TXT.cond.slow}</div>
      <div style={{ ...box(false), left: OUT.x - 170, top: OUT.y - 55, width: 340, height: 110, fontSize: 40, border: `4px solid ${C.ok}`, boxShadow: `0 0 ${50 * s.fold}px ${alpha(C.ok, 0.6 * s.fold)}` }}>
        {TXT.cond.out}
      </div>
      <Stamp x={540} y={1130} text={TXT.condStamp} color={C.marker} pop={s.condStamp} size={42} rotate={-4} />
      {s.condTag > 0 && (
        <div style={{ position: 'absolute', left: 90, right: 90, top: 1200, textAlign: 'center', fontSize: 31, fontWeight: 700, lineHeight: 1.32, color: C.muted, opacity: s.condTag }}>
          {TXT.condTag[0]}
          <br />
          <span style={{ color: C.text }}>{TXT.condTag[1]}</span>
        </div>
      )}
    </div>
  );
};
