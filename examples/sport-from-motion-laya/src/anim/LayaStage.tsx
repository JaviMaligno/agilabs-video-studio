import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, LAST, MODELS, SPORTS, type Curves, type LayaProps } from './LayaStage.state.ts';
import { tileOf, toView, viewOf, viewSize, type ClipSet } from './DotStage.state.ts';
import { Strip } from './LossMonitor.tsx';
import { mix } from './fields.tsx';
import { gradientText } from './Stage.tsx';
import clips from '../data/clips.json';
import curves from '../data/laya-curves.json';

export { frameState };
export type { LayaProps };

const CLIPS = clips as unknown as ClipSet;
const DATA = curves as unknown as Curves;
const HOOK = CLIPS.hook;

/** Vertical layout: the question card sits above (Video.tsx, 236-360); the captions start at 1350. */
export const LS = { left: 60, w: 960, stageTop: 392, stageH: 330, optTop: 742, optH: 112, lowTop: 882, lowH: 438 } as const;
/** The dot the "one player" ring follows (one near the middle of the play). */
const RING_DOT = 4;

type S = ReturnType<typeof frameState>;

/** The hook clip as glowing dots: grey, teal once a run learns; optional ring and tag sticker. */
const StageBox: React.FC<{ s: S }> = ({ s }) => {
  const { w } = LS;
  const h = LS.stageH;
  const tile = tileOf(HOOK, s.playT);
  const view = viewOf(HOOK, 'stage');
  const vs = viewSize(view);
  const scale = Math.min(w / vs.w, h / vs.h);
  const ox = (w - vs.w * scale) / 2;
  const oy = (h - vs.h * scale) / 2;
  const P = (x: number, y: number) => {
    const q = toView(view, HOOK.field, x, y);
    return { x: ox + q.u * scale, y: oy + q.v * scale };
  };
  const lit = s.stage.lit;
  const fill = mix(C.muted, C.ok, lit);
  const dot = 15;
  const ringAt = tile.dots[RING_DOT] ? P(tile.dots[RING_DOT].x, tile.dots[RING_DOT].y) : null;
  const tag = s.stage.tag;
  return (
    <div style={{ position: 'absolute', left: LS.left, top: LS.stageTop, width: w, height: h, borderRadius: 18, overflow: 'hidden', background: alpha(C.bg1, 0.92), boxShadow: `0 0 0 2px ${alpha(C.muted, 0.16 + 0.3 * lit)}` }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="ls-glow">
            <stop offset="0%" stopColor={lit > 0.5 ? C.ok : C.muted} stopOpacity={0.5} />
            <stop offset="100%" stopColor={lit > 0.5 ? C.ok : C.muted} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g opacity={tile.opacity * s.stage.dim}>
          {tile.dots.map((q, i) =>
            q.trail.map((g, k) => {
              const p = P(g.x, g.y);
              return <circle key={`t${i}-${k}`} cx={p.x} cy={p.y} r={dot * (0.78 - k * 0.11)} fill={fill} opacity={0.3 * (1 - k / q.trail.length)} />;
            }),
          )}
          {tile.dots.map((q, i) => {
            const p = P(q.x, q.y);
            return <circle key={`g${i}`} cx={p.x} cy={p.y} r={dot * 2.6} fill="url(#ls-glow)" />;
          })}
          {tile.dots.map((q, i) => {
            const p = P(q.x, q.y);
            return <circle key={`d${i}`} cx={p.x} cy={p.y} r={dot} fill={i === RING_DOT && s.stage.ring > 0 ? mix(C.muted, C.text, s.stage.ring) : fill} stroke={C.bg0} strokeWidth={dot * 0.12} />;
          })}
        </g>
        {ringAt && s.stage.ring > 0 && (
          <g opacity={s.stage.ring}>
            <circle cx={ringAt.x} cy={ringAt.y} r={dot * 2.4} fill="none" stroke={C.accentText} strokeWidth={5} />
            <line x1={ringAt.x + dot * 2.4} y1={ringAt.y} x2={ringAt.x + 150} y2={ringAt.y} stroke={C.accentText} strokeWidth={4} />
          </g>
        )}
      </svg>
      {ringAt && s.stage.ring > 0 && (
        <div style={{ position: 'absolute', left: ringAt.x + 162, top: ringAt.y - 30, opacity: s.stage.ring, fontSize: 46, fontWeight: 800, color: C.accentText, whiteSpace: 'nowrap' }}>one player</div>
      )}
      {tag.pop > 0 && tag.opacity > 0 && (
        <>
          <div style={{ position: 'absolute', right: 30, top: 26, opacity: tag.opacity * Math.min(1, tag.pop * 1.5), transform: `rotate(5deg) scale(${interpolate(tag.pop, [0, 1], [2.2, 1])})`, transformOrigin: 'center' }}>
            <div style={{ padding: '10px 24px', borderRadius: 14, background: C.warm, color: C.bg0, fontSize: 52, fontWeight: 800, fontFamily: 'monospace', boxShadow: `0 10px 30px ${alpha(C.bg0, 0.7)}` }}>tag: {tag.code}</div>
          </div>
          <div style={{ position: 'absolute', right: 30, top: 124, opacity: tag.opacity * tag.key, padding: '4px 14px', borderRadius: 10, background: alpha(C.bg0, 0.85), fontSize: 40, fontWeight: 800, color: C.warm, whiteSpace: 'nowrap' }}>M2 = basketball</div>
        </>
      )}
    </div>
  );
};

/** The four options, each with Laya's score bar. */
const Options: React.FC<{ s: S; raw: number }> = ({ s, raw }) => {
  const colW = (LS.w - 3 * 20) / 4;
  const beat = 0.5 + 0.5 * Math.sin((raw * 2 * Math.PI) / 0.9);
  return (
    <div style={{ position: 'absolute', left: LS.left, top: LS.optTop, width: LS.w, height: LS.optH, display: 'flex', gap: 20 }}>
      {SPORTS.map((name, k) => {
        const o = s.options[k];
        const tone = o.tone === 'ok' ? C.ok : o.tone === 'bad' ? C.flat : C.muted;
        const pick = o.pick;
        const score = Math.max(0, Math.min(1, s.scores[k] ?? 0));
        const trackW = colW - 32;
        return (
          <div
            key={name}
            style={{
              position: 'relative',
              width: colW,
              height: LS.optH,
              borderRadius: 18,
              opacity: o.appear,
              transform: `translateY(${(1 - o.appear) * 24}px)`,
              background: o.flash > 0 ? mix(C.card, o.tone === 'bad' ? C.flat : C.ok, 0.35 * o.flash) : C.card,
              border: `3px solid ${o.flash > 0 ? alpha(tone, 0.3 + 0.7 * o.flash) : pick > 0 ? alpha(C.ok, 0.3 + 0.7 * pick) : alpha(C.accentText, 0.3)}`,
              boxShadow: pick > 0 ? `0 0 ${34 * pick}px ${alpha(C.ok, 0.45 * pick)}` : undefined,
            }}
          >
            <div style={{ position: 'absolute', left: 8, right: 8, top: s.bars > 0 ? 6 : 14, height: s.bars > 0 ? 64 : 80, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 29, fontWeight: 800, lineHeight: 1.08, color: mix(C.text, C.ok, pick) }}>
              {name}
            </div>
            {o.flash > 0 && (
              <div style={{ position: 'absolute', right: -12, top: -22, width: 50, height: 50, borderRadius: 25, background: tone, color: C.bg0, fontSize: 34, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o.flash }}>
                {o.tone === 'bad' ? '✗' : '✓'}
              </div>
            )}
            {s.bars > 0 && (
              <div style={{ position: 'absolute', left: 16, top: 80, width: trackW, height: 16, borderRadius: 8, background: alpha(C.muted, 0.18), opacity: s.bars }}>
                <div
                  style={{
                    width: trackW * score,
                    height: 16,
                    borderRadius: 8,
                    background: pick > 0.5 ? C.ok : GRADIENT,
                    opacity: 1 - 0.45 * s.together * beat,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Last time: five frontier chips, then two bars on a 0-100 % scale with a "half" tick. */
const LastTime: React.FC<{ s: S }> = ({ s }) => {
  const L = s.last;
  const top = LS.lowTop;
  const labelW = 230;
  // The track stops short of the value label, which sits at the row's right end.
  const trackW = LS.w - labelW - 230;
  const x = (v: number) => (v / 100) * trackW;
  const row = (y: number, label: string, value: number, text: string, grow: number, opacity: number, colour: string) => (
    <div style={{ position: 'absolute', left: LS.left, top: y, width: LS.w, height: 70, opacity }}>
      <div style={{ position: 'absolute', left: 0, top: 10, width: labelW, fontSize: 38, fontWeight: 800, color: C.text }}>{label}</div>
      <div style={{ position: 'absolute', left: labelW, top: 20, width: trackW, height: 34, borderRadius: 17, background: alpha(C.muted, 0.15) }} />
      <div style={{ position: 'absolute', left: labelW, top: 20, width: x(value) * grow, height: 34, borderRadius: 17, background: colour }} />
      <div style={{ position: 'absolute', right: 0, top: 6, fontSize: 46, fontWeight: 800, color: C.text, opacity: grow, whiteSpace: 'nowrap' }}>{text}</div>
    </div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: top + 4, textAlign: 'center', fontSize: 34, fontWeight: 800, letterSpacing: '0.14em', color: C.muted, opacity: L.title }}>LAST TIME</div>
      <div style={{ position: 'absolute', left: LS.left, width: LS.w, top: top + 62, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {MODELS.map((m, k) => (
          <div key={m} style={{ opacity: L.chips[k], padding: '6px 18px', borderRadius: 999, background: alpha(C.card, 0.95), border: `2px solid ${alpha(C.muted, 0.45)}`, fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {m}
          </div>
        ))}
      </div>
      {row(top + 196, 'Frontier', LAST.frontier, `best: ${LAST.frontier}%`, L.frontier.grow, L.frontier.opacity, alpha(C.muted, 0.75))}
      {row(top + 290, 'Classifier', LAST.classifier, `${LAST.classifier}%`, L.classifier.grow, L.classifier.opacity, GRADIENT)}
      {/* The half-way tick across both bars. */}
      <div style={{ position: 'absolute', left: LS.left + labelW + x(50) - 2, top: top + 196, width: 0, height: 180, borderLeft: `4px dashed ${alpha(C.text, 0.7)}`, opacity: L.half }} />
      <div style={{ position: 'absolute', left: LS.left + labelW + x(50), top: top + 380, transform: 'translateX(-50%)', fontSize: 34, fontWeight: 800, color: C.text, opacity: L.half }}>half</div>
    </>
  );
};

/** Coordinates of the hook clip, as text: one row per snapshot, "x, y" per dot (illustrative). */
const COORD_ROWS = Array.from({ length: 8 }, (_, k) => {
  const at = 1.0 + 0.5 * k;
  const f = HOOK.frames[Math.min(HOOK.frames.length - 1, Math.round(at * HOOK.hz))];
  const pairs = Array.from({ length: f.length / 2 }, (_, i) => `${f[2 * i].toFixed(1)},${f[2 * i + 1].toFixed(1)}`);
  return { k: k + 1, text: pairs.join('  ') };
});

/** Laya: the dots as text stream into the chip; it answers with scores, not words. */
const Laya: React.FC<{ s: S }> = ({ s }) => {
  const x = s.laya;
  const rowH = 40;
  const top = LS.lowTop;
  const offset = (x.scroll * 60) % (COORD_ROWS.length * rowH);
  const rows = [...COORD_ROWS, ...COORD_ROWS, ...COORD_ROWS];
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: LS.left,
          width: LS.w,
          top,
          height: 150,
          overflow: 'hidden',
          opacity: x.stream,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 65%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 65%, transparent)',
        }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: -COORD_ROWS.length * rowH + offset }}>
          {rows.map((r, i) => (
            <div key={i} style={{ height: rowH, display: 'flex', gap: 14, fontFamily: 'monospace', fontSize: 25, whiteSpace: 'nowrap', overflow: 'hidden', color: alpha(C.accentText, 0.9) }}>
              <span style={{ color: C.muted, fontWeight: 700 }}>t{r.k}</span>
              <span>{r.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* The LAYA chip. */}
      <div style={{ position: 'absolute', left: LS.left, width: LS.w, top: top + 160, display: 'flex', justifyContent: 'center', opacity: x.chip }}>
        <div
          style={{
            transform: `scale(${interpolate(x.chip, [0, 1], [0.7, 1])})`,
            padding: '18px 40px',
            borderRadius: 26,
            background: alpha(C.card, 0.97),
            border: `4px solid ${C.accentText}`,
            boxShadow: `0 0 50px ${alpha(C.accent, 0.45)}`,
            display: 'flex',
            alignItems: 'baseline',
            gap: 22,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 800, letterSpacing: '0.02em', ...gradientText }}>LAYA</span>
          <span style={{ fontSize: 36, fontWeight: 700, color: C.text }}>small · open weights · 322M</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: LS.left, width: LS.w, top: top + 300, textAlign: 'center', fontSize: 40, fontWeight: 700, color: C.text, opacity: x.tag * (1 - x.bubble) }}>
        trained on the same 400 clips
      </div>
      {/* No written answer: a speech bubble, crossed out. */}
      <div style={{ position: 'absolute', left: LS.left, width: LS.w, top: top + 296, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: x.bubble }}>
        <div style={{ position: 'relative', padding: '12px 28px', borderRadius: 22, border: `3px solid ${alpha(C.muted, 0.7)}`, fontSize: 38, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
          “It's basketball.”
          <div style={{ position: 'absolute', left: -8, right: -8, top: '50%', height: 7, borderRadius: 4, background: C.flat, transform: `rotate(-6deg) scaleX(${x.cross})`, transformOrigin: 'left center' }} />
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: C.text, whiteSpace: 'nowrap', opacity: x.arrow }}>
          a score per sport <span style={{ color: C.accentText }}>↑</span>
        </div>
      </div>
    </>
  );
};

export const LayaStage: React.FC<AnimProps & LayaProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const m = s.monitor;
  const raw = Number.isFinite(p.t) ? p.t : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <StageBox s={s} />
      <Options s={s} raw={raw} />

      {p.mode === 'task' && (
        <div style={{ position: 'absolute', left: LS.left, width: LS.w, top: LS.lowTop, height: LS.lowH, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s.question.opacity }}>
          <span style={{ fontSize: 400, fontWeight: 800, lineHeight: 1, ...gradientText, transform: `scale(${1 + 0.06 * s.question.pulse})` }}>?</span>
        </div>
      )}
      {p.mode === 'lasttime' && <LastTime s={s} />}
      {p.mode === 'laya' && <Laya s={s} />}

      {m.opacity > 0 && (
        <div style={{ position: 'absolute', left: LS.left, top: LS.lowTop, opacity: m.opacity }}>
          <Strip w={LS.w} h={LS.lowH} xMax={m.xMax} yMin={-0.05} yMax={2.1} traces={m.traces} markers={m.markers} cut={m.cut} power={m.power} id="ls" chanceGlow={m.words.guessing} />
          {m.label.opacity > 0 && (
            <div style={{ position: 'absolute', right: 26, top: 16, fontSize: 36, fontWeight: 800, color: C.text, opacity: m.label.opacity }}>{m.label.text}</div>
          )}
          {(m.legend.tag > 0 || m.legend.dots > 0) && (
            <div style={{ position: 'absolute', left: 26, top: 12, display: 'flex', gap: 30, fontSize: 32, fontWeight: 800 }}>
              <span style={{ color: C.warm, opacity: m.legend.tag * (0.35 + 0.65 * m.legend.tagDim) }}>● tagged clips</span>
              <span style={{ color: mix(C.muted, C.text, 0.4), opacity: m.legend.dots }}>● dots only</span>
            </div>
          )}
          {m.result > 0 && (
            <div style={{ position: 'absolute', left: 300, top: 150, opacity: m.result, transform: `scale(${interpolate(m.result, [0, 1], [1.4, 1])})`, display: 'flex', alignItems: 'baseline', gap: 20 }}>
              <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: '-0.03em' }}>23%</span>
              <span style={{ fontSize: 44, fontWeight: 800, color: C.muted }}>· chance</span>
            </div>
          )}
          {m.words.learning > 0 && (
            <div style={{ position: 'absolute', right: 40, bottom: 92, fontSize: 46, fontWeight: 800, color: C.ok, opacity: m.words.learning }}>learning ↓</div>
          )}
        </div>
      )}
    </div>
  );
};
