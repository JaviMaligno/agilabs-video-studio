import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx, type Lang } from '../types.ts';
import type { AnimProps } from './types.ts';
import {
  frameState,
  layoutOf,
  SPORT_LABEL,
  toView,
  viewOf,
  viewSize,
  type Clip,
  type ClipSet,
  type DotProps,
} from './DotStage.state.ts';
import { FieldMarkings, mix } from './fields.tsx';
import { gradientText, stageOf } from './Stage.tsx';
import clips from '../data/clips.json';

export { frameState };
export type { DotProps };

const DATA = clips as unknown as ClipSet;
type TileS = ReturnType<typeof frameState>['tiles'][number];

/** Kit colours per team, drained to the lights-out grey. */
const KIT = { 1: C.accentText, [-1]: C.text } as Record<number, string>;
const GREY = C.muted;

/** One clip on its field, in a box of w x h pixels (field fitted and centred). */
const Tile: React.FC<{ clip: Clip; s: TileS; layout: 'stage' | 'grid'; w: number; h: number; dot: number; frame?: boolean }> = ({
  clip,
  s,
  layout,
  w,
  h,
  dot,
  frame = true,
}) => {
  const view = viewOf(clip, layout);
  const vs = viewSize(view);
  const scale = Math.min(w / vs.w, h / vs.h);
  const ox = (w - vs.w * scale) / 2;
  const oy = (h - vs.h * scale) / 2;
  const P = (x: number, y: number) => {
    const q = toView(view, clip.field, x, y);
    return { x: ox + q.u * scale, y: oy + q.v * scale };
  };
  // Field coordinates -> pixels for the markings group.
  const fieldTransform = view.rot
    ? `translate(${ox} ${oy}) scale(${scale}) translate(${-view.y0} ${view.x1}) rotate(-90)`
    : `translate(${ox} ${oy}) scale(${scale}) translate(${-view.x0} ${-view.y0})`;
  // Lights-out grey, kit colours (strip, reveal) or the accent once the classifier has it.
  const dotFill = (team: number) => (s.highlight > 0 ? mix(GREY, C.accentText, s.highlight) : mix(GREY, KIT[team] ?? C.text, s.colour));
  const glow = s.highlight > 0 ? C.accent : C.muted;
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: 18,
        overflow: 'hidden',
        background: frame ? alpha(C.bg1, 0.9) : 'transparent',
        boxShadow: frame ? `0 0 0 2px ${alpha(C.muted, 0.14 + 0.2 * s.highlight)}` : undefined,
      }}
    >
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`g-${clip.sport}-${layout}`}>
            <stop offset="0%" stopColor={glow} stopOpacity={0.55} />
            <stop offset="100%" stopColor={glow} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`b-${clip.sport}-${layout}`}>
            <stop offset="0%" stopColor={C.accent2} stopOpacity={0.9} />
            <stop offset="100%" stopColor={C.accent2} stopOpacity={0} />
          </radialGradient>
        </defs>
        {s.lines > 0 && (
          <g opacity={s.lines} transform={fieldTransform}>
            <FieldMarkings sport={clip.sport} sw={(layout === 'stage' ? 3 : 1.8) / scale} />
          </g>
        )}
        <g opacity={s.opacity}>
          {/* Trails first, then soft glows, then the dots on top. */}
          {s.dots.map((q, i) =>
            q.trail.map((g, k) => {
              const p = P(g.x, g.y);
              return <circle key={`t${i}-${k}`} cx={p.x} cy={p.y} r={dot * (0.78 - k * 0.11)} fill={dotFill(q.team)} opacity={0.32 * (1 - k / q.trail.length)} />;
            }),
          )}
          {s.dots.map((q, i) => {
            const p = P(q.x, q.y);
            return <circle key={`g${i}`} cx={p.x} cy={p.y} r={dot * 2.6} fill={`url(#g-${clip.sport}-${layout})`} />;
          })}
          {s.dots.map((q, i) => {
            const p = P(q.x, q.y);
            return <circle key={`d${i}`} cx={p.x} cy={p.y} r={dot} fill={dotFill(q.team)} stroke={C.bg0} strokeWidth={dot * 0.12} />;
          })}
        </g>
        {s.ball && s.ball.opacity > 0 && (
          <g opacity={s.ball.opacity * s.opacity}>
            {(() => {
              const p = P(s.ball.x, s.ball.y);
              return (
                <>
                  <circle cx={p.x} cy={p.y} r={dot * 2} fill={`url(#b-${clip.sport}-${layout})`} />
                  <circle cx={p.x} cy={p.y} r={dot * 0.6} fill="#ffffff" />
                </>
              );
            })()}
          </g>
        )}
        {s.scan.opacity > 0 && (
          <g opacity={s.scan.opacity}>
            <rect x={s.scan.at * w - 60} y={0} width={60} height={h} fill={alpha(C.accent, 0.18)} />
            <line x1={s.scan.at * w} y1={0} x2={s.scan.at * w} y2={h} stroke={C.accentText} strokeWidth={5} />
          </g>
        )}
      </svg>

      {/* A frontier model's guess. */}
      {s.guess && s.guess.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 18,
            display: 'flex',
            justifyContent: 'center',
            opacity: s.guess.opacity,
            transform: `translateY(${(1 - s.guess.drop) * -60}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '6px 14px',
              borderRadius: 14,
              background: alpha(C.bg0, 0.88),
              border: `3px solid ${s.guess.hit ? C.accentText : alpha(C.muted, 0.7)}`,
              fontSize: 28,
              fontWeight: 700,
              color: C.text,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: C.muted }}>{s.guess.model}:</span>
            <span>{tx(SPORT_LABEL[s.guess.sport], 'en')}</span>
            <span style={{ opacity: s.guess.mark, color: s.guess.hit ? C.accentText : C.muted, fontWeight: 800, fontSize: 32 }}>{s.guess.hit ? '✓' : '✗'}</span>
          </div>
        </div>
      )}

      {/* Favourite-sport stamps piling up: two-line text so it fits the tile. */}
      {s.stamps.map((st, k) =>
        st.opacity > 0 ? (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: st.sport === 'soccer' ? '72%' : '50%',
              top: st.sport === 'soccer' ? '76%' : '46%',
              transform: `translate(-50%, -50%) translate(${st.dx}px, ${st.dy}px) rotate(${st.angle}deg) scale(${interpolate(st.pop, [0, 1], [1.8, 1])})`,
              opacity: st.opacity,
              padding: '6px 16px',
              border: `5px solid ${st.sport === 'soccer' ? C.text : C.accentText}`,
              borderRadius: 12,
              background: alpha(C.bg0, 0.7),
              color: st.sport === 'soccer' ? C.text : C.accentText,
              fontSize: st.sport === 'soccer' ? 30 : 36,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              textAlign: 'center',
              whiteSpace: 'pre',
            }}
          >
            {tx(SPORT_LABEL[st.sport], 'en').replace(' ', '\n')}
          </div>
        ) : null,
      )}
    </div>
  );
};

const Pill: React.FC<{ text: string; cross: number; opacity: number }> = ({ text, cross, opacity }) => (
  <div
    style={{
      position: 'relative',
      opacity,
      padding: '10px 30px',
      borderRadius: 999,
      background: alpha(C.card, 0.9),
      border: `2px solid ${alpha(C.muted, 0.35)}`,
      fontSize: 40,
      fontWeight: 700,
      color: interpolate(cross, [0, 1], [1, 0.5]) > 0.75 ? C.text : C.muted,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
    <div
      style={{
        position: 'absolute',
        left: 18,
        top: '50%',
        height: 6,
        width: `calc(${cross * 100}% - ${36 * cross}px)`,
        borderRadius: 3,
        background: C.accentText,
        transform: 'rotate(-8deg)',
      }}
    />
  </div>
);

const HEADLINE: Record<string, Record<Lang, string>> = {
  quiz: { en: 'Which sport is this?', es: '¿Qué deporte es?' },
  question: { en: 'Is the sport still there?', es: '¿Sigue ahí el deporte?' },
  reveal: { en: 'Which sport is this?', es: '¿Qué deporte es?' },
};

/** The stage layouts (vertical): header rows, then the clip box or the 2x2 grid. */
const LAYOUT = {
  stage: { headlineTop: 252, pillsTop: 352, boxTop: 446 },
  grid: { gap: 20, labelH: 58, tileH: 286 },
} as const;

export const DotStage: React.FC<AnimProps & DotProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const stage = stageOf(p.vertical);
  const layout = layoutOf(p.mode);
  const lang = p.lang;
  const bottom = stage.top + stage.h;

  if (layout === 'stage') {
    const top = p.vertical ? LAYOUT.stage.boxTop : stage.top + 160;
    const h = bottom - top;
    const w = p.vertical ? 960 : stage.w;
    const left = p.vertical ? 60 : stage.side;
    const tile = s.tiles[0];
    const qSize = 560 * s.question.scale;
    return (
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
        {/* The big "?" behind the dots. */}
        {s.question.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left,
              top,
              width: w,
              height: h,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: s.question.opacity * (0.22 + 0.1 * s.question.pulse),
            }}
          >
            <span style={{ fontSize: qSize * 1.25, fontWeight: 800, lineHeight: 1, ...gradientText, transform: `scale(${1 + 0.05 * s.question.pulse})` }}>?</span>
          </div>
        )}
        <div style={{ position: 'absolute', left, top }}>
          <Tile clip={DATA.hook} s={tile} layout="stage" w={w} h={h} dot={p.vertical ? 21 : 16} frame={tile.lines > 0.02} />
        </div>

        {/* Headline: the question, replaced by the answer in the reveal. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: p.vertical ? LAYOUT.stage.headlineTop : stage.top,
            textAlign: 'center',
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            opacity: s.headline.opacity,
          }}
        >
          {HEADLINE[p.mode][lang] ?? HEADLINE[p.mode].en}
        </div>
        {s.answer.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: (p.vertical ? LAYOUT.stage.headlineTop : stage.top) - 14,
              textAlign: 'center',
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              opacity: s.answer.opacity,
              transform: `scale(${interpolate(s.answer.pop, [0, 1], [1.3, 1])})`,
            }}
          >
            <span style={gradientText}>{tx(SPORT_LABEL.basketball, lang)}</span>
          </div>
        )}

        {/* "No pitch, no ball, no kits." */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: p.vertical ? LAYOUT.stage.pillsTop : stage.top + 90,
            display: 'flex',
            justifyContent: 'center',
            gap: 26,
          }}
        >
          {s.pills.map((q) => (
            <Pill key={q.key} text={{ pitch: 'Pitch', ball: 'Ball', kits: 'Kits' }[q.key] ?? q.key} cross={q.cross} opacity={q.opacity} />
          ))}
        </div>

        {/* Reveal: three model answers, crossed out. */}
        {s.wrong.some((x) => x.opacity > 0) && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: p.vertical ? LAYOUT.stage.pillsTop : stage.top + 90,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div style={{ display: 'flex', gap: 10 }}>
              {s.wrong.map((x, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    background: alpha(C.card, 0.95),
                    border: `3px solid ${alpha(C.muted, 0.6)}`,
                    opacity: x.opacity,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    fontWeight: 800,
                    color: C.muted,
                  }}
                >
                  <span style={{ opacity: x.cross }}>✗</span>
                </div>
              ))}
            </div>
            <div
              style={{
                opacity: s.wrong[0].opacity,
                padding: '10px 26px',
                borderRadius: 999,
                background: alpha(C.card, 0.9),
                border: `2px solid ${alpha(C.muted, 0.35)}`,
                fontSize: 38,
                fontWeight: 700,
                color: C.muted,
                whiteSpace: 'nowrap',
                textDecoration: s.wrong[2].cross > 0.5 ? 'line-through' : 'none',
                textDecorationColor: C.accentText,
                textDecorationThickness: 5,
              }}
            >
              {lang === 'es' ? '3 modelos: fútbol americano' : '3 models: American football'}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- 2x2 grid ----
  const g = LAYOUT.grid;
  const cols = 2;
  const tw = p.vertical ? (960 - g.gap) / 2 : (stage.w - 3 * g.gap) / 4;
  const th = p.vertical ? g.tileH : 300;
  const rows = p.vertical ? 2 : 1;
  const gridH = rows * (th + g.labelH) + (rows - 1) * g.gap;
  const gridTop = bottom - gridH;
  const gridLeft = p.vertical ? 60 : stage.side;
  const headTop = stage.top + 14;
  const headH = gridTop - headTop - 20;
  const perRow = p.vertical ? cols : 4;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      {s.tiles.map((tile, i) => {
        const r = Math.floor(i / perRow);
        const c = i % perRow;
        const x = gridLeft + c * (tw + g.gap);
        const y = gridTop + r * (th + g.labelH + g.gap);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: tw }}>
            <Tile clip={DATA.grid[i]} s={tile} layout="grid" w={tw} h={th} dot={p.vertical ? 9.5 : 8} />
            <div
              style={{
                position: 'relative',
                height: g.labelH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: '0.02em',
                opacity: tile.label.opacity,
                transform: `translateY(${(1 - tile.label.pop) * 14}px)`,
                color: p.mode === 'favourite' ? C.muted : C.accentText,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', right: '100%', marginRight: 10, fontSize: 34, opacity: p.mode === 'specialist' ? 1 : 0 }}>✓</span>
                {tx(SPORT_LABEL[tile.sport] ?? tile.sport, lang)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Header over the grid, per scene. */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: headTop, height: headH, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        {p.mode === 'strip' && (
          <div style={{ opacity: s.stripTitle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.1 }}>
              {lang === 'es' ? 'Datos reales de 4 deportes' : 'Real tracking data, 4 sports'}
            </div>
            <div
              style={{
                fontSize: 50,
                fontWeight: 700,
                opacity: 1 - s.tiles[0].colour * (s.tiles[0].lines > 0.99 ? 1 : 0.4),
                ...gradientText,
              }}
            >
              {lang === 'es' ? 'Solo el movimiento' : 'Only the movement'}
            </div>
          </div>
        )}
        {p.mode === 'specialist' && s.counter && (
          <>
            <div
              style={{
                fontSize: 210,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                opacity: s.counter.appear,
                transform: `translateY(${interpolate(s.counter.appear, [0, 1], [24, 0])}px)`,
                ...gradientText,
              }}
            >
              {s.counter.text}
            </div>
            <div style={{ fontSize: 46, fontWeight: 700, opacity: s.counter.title, textAlign: 'center' }}>
              {lang === 'es' ? 'Clasificador pequeño, en un portátil' : 'Small classifier, on a laptop'}
            </div>
            <div style={{ fontSize: 38, fontWeight: 600, color: C.muted, opacity: s.counter.chance }}>
              {lang === 'es' ? 'azar: 25%' : 'chance: 25%'}
            </div>
          </>
        )}
        {p.mode === 'guesses' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, maxWidth: 940 }}>
              {s.chips.map((c) => (
                <div
                  key={c.name}
                  style={{
                    opacity: c.opacity,
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: alpha(C.card, 0.95),
                    border: `2px solid ${alpha(C.muted, 0.45)}`,
                    fontSize: 34,
                    fontWeight: 700,
                    color: C.text,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.name}
                </div>
              ))}
            </div>
            <RangeBar grow={s.range.grow} opacity={s.range.opacity} lang={lang} />
          </>
        )}
        {p.mode === 'favourite' && (
          <>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', opacity: s.favTitle }}>
              {lang === 'es' ? 'Su deporte favorito si dudan' : 'Their fallback when unsure'}
            </div>
            {s.favourites.map((f) => (
              <div key={f.model} style={{ opacity: f.opacity, display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 36, fontWeight: 700, whiteSpace: 'nowrap' }}>
                <span style={{ color: C.muted }}>{f.model}</span>
                <span style={{ color: f.sport === 'soccer' ? C.text : C.accentText }}>{tx(SPORT_LABEL[f.sport], lang)}</span>
                <span style={{ color: C.text }}>{lang === 'es' ? `${f.share} de los clips` : `${f.share} of clips`}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

/** 0-100 % axis: frontier models land between chance (25 %) and 47 %; the classifier at 83 %. */
const RangeBar: React.FC<{ grow: number; opacity: number; lang: Lang }> = ({ grow, opacity, lang }) => {
  const W = 860;
  const x = (v: number) => (v / 100) * W;
  const hi = 25 + (47 - 25) * grow;
  return (
    <div style={{ position: 'relative', width: W, height: 150, opacity, marginTop: 8 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, height: 6, borderRadius: 3, background: alpha(C.muted, 0.3) }} />
      <div style={{ position: 'absolute', left: x(25), width: Math.max(0, x(hi) - x(25)), top: 58, height: 30, borderRadius: 15, background: GRADIENT }} />
      {/* Chance tick and label. */}
      <div style={{ position: 'absolute', left: x(25) - 2, top: 46, width: 4, height: 54, background: C.text }} />
      <div style={{ position: 'absolute', left: x(25), top: 104, transform: 'translateX(-50%)', fontSize: 32, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
        {lang === 'es' ? 'azar 25%' : 'chance 25%'}
      </div>
      <div style={{ position: 'absolute', left: x(hi), top: 0, transform: 'translateX(-50%)', fontSize: 40, fontWeight: 800, color: C.text, opacity: grow, whiteSpace: 'nowrap' }}>
        47%
      </div>
      {/* The classifier, a ghost marker for scale. */}
      <div style={{ position: 'absolute', left: x(83) - 2, top: 52, width: 4, height: 42, background: alpha(C.accentText, 0.8), opacity: grow }} />
      <div style={{ position: 'absolute', left: x(83), top: 104, transform: 'translateX(-50%)', fontSize: 32, fontWeight: 700, color: C.accentText, opacity: grow, whiteSpace: 'nowrap' }}>
        {lang === 'es' ? 'clasificador 83%' : 'classifier 83%'}
      </div>
    </div>
  );
};
