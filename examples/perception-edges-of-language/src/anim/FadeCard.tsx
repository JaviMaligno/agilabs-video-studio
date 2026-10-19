import React from 'react';
import { staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { HERO_DY, HERO_SCALE, LINES, frameState, type FadeCardProps, type ReaderState } from './FadeCard.state.ts';
import { Stage, gradientText } from './Stage.tsx';
import { CARD, ROWS, RULER, TICKS, greyOf, ratioAt } from './perception.ts';

export { frameState };
export type { FadeCardProps };

const rgb = (g: number) => `rgb(${g},${g},${g})`;

/** The study's white stimulus card; the glyphs are a mask filled with a grey gradient. */
export const StimulusCard: React.FC<{
  stops: { pos: number; grey: number }[];
  mask?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ stops, mask = 'stim/sentence-mask.png', x = CARD.x, y = CARD.y, w = CARD.w, h = CARD.h, children, style }) => {
  const grad = `linear-gradient(to right, ${stops.map((s) => `${rgb(s.grey)} ${(s.pos * 100).toFixed(2)}%`).join(', ')})`;
  const url = `url(${staticFile(mask)})`;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 18px 60px ${alpha('#000000', 0.55)}, 0 0 0 1px ${alpha(C.text, 0.08)}`,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: grad,
          WebkitMaskImage: url,
          maskImage: url,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      />
      {children}
    </div>
  );
};

/**
 * The stimulus card for the FadeCard scenes: the sentence set large on two lines, every glyph
 * filled with its own ink grey (uniform fades and the roster's contrast ramp alike).
 */
export const SentenceCard: React.FC<{
  glyphs: { ch: string; line: number; grey: number }[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ glyphs, children, style }) => (
  <div
    style={{
      position: 'absolute',
      left: CARD.x,
      top: CARD.y,
      width: CARD.w,
      height: CARD.h,
      background: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: `0 18px 60px ${alpha('#000000', 0.55)}, 0 0 0 1px ${alpha(C.text, 0.08)}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      ...style,
    }}
  >
    {LINES.map((_, li) => (
      <div key={li} style={{ fontSize: 78, fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.005em', whiteSpace: 'pre' }}>
        {glyphs
          .filter((g) => g.line === li)
          .map((g, i) => (
            <span key={i} style={{ color: rgb(g.grey) }}>
              {g.ch}
            </span>
          ))}
      </div>
    ))}
    {children}
  </div>
);

/** An eye whose lids close as `open` goes to 0. */
export const Eye: React.FC<{ open: number; size?: number; color?: string }> = ({ open, size = 44, color = C.text }) => {
  const o = Math.max(0.04, open);
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48">
      <g transform={`scale(1 ${o})`}>
        <path d="M-20 0 Q0 -18 20 0 Q0 18 -20 0 Z" fill="none" stroke={color} strokeWidth={3} />
        <circle r={6.5} fill={color} />
      </g>
      {open < 0.3 && <path d="M-20 0 Q0 9 20 0" fill="none" stroke={color} strokeWidth={3} opacity={1 - open / 0.3} />}
    </svg>
  );
};

/** A small chip glyph: a model (square with pins) or an OCR engine (scan brackets). */
export const ChipIcon: React.FC<{ kind: 'model' | 'ocr'; size?: number; color?: string }> = ({ kind, size = 40, color = C.accentText }) =>
  kind === 'model' ? (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x={9} y={9} width={22} height={22} rx={4} fill="none" stroke={color} strokeWidth={3} />
      <rect x={15} y={15} width={10} height={10} rx={2} fill={color} />
      {[14, 20, 26].map((v) => (
        <React.Fragment key={v}>
          <line x1={v} y1={3} x2={v} y2={8} stroke={color} strokeWidth={2.5} />
          <line x1={v} y1={32} x2={v} y2={37} stroke={color} strokeWidth={2.5} />
          <line x1={3} y1={v} x2={8} y2={v} stroke={color} strokeWidth={2.5} />
          <line x1={32} y1={v} x2={37} y2={v} stroke={color} strokeWidth={2.5} />
        </React.Fragment>
      ))}
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path d="M5 13 V5 H13 M27 5 H35 V13 M35 27 V35 H27 M13 35 H5 V27" fill="none" stroke={color} strokeWidth={3} />
      <line x1={9} y1={20} x2={31} y2={20} stroke={color} strokeWidth={3} />
    </svg>
  );

const Row: React.FC<{ r: ReaderState }> = ({ r }) => {
  if (r.appear <= 0) return null;
  const y = ROWS.y + r.slot * ROWS.h;
  const blank = r.quality <= 0 || (r.text.trim() === '' && r.chars > 0);
  const hl = r.highlight;
  const op = r.appear * (1 - r.dim);
  return (
    <div
      style={{
        position: 'absolute',
        left: CARD.x,
        top: y,
        width: CARD.w,
        height: ROWS.h - 12,
        display: 'flex',
        alignItems: 'center',
        opacity: op,
        transform: `translateX(${(1 - r.appear) * -40}px)`,
      }}
    >
      <div style={{ width: ROWS.nameW, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 44, display: 'flex', justifyContent: 'center' }}>
          {r.kind === 'me' ? <Eye open={r.eye} color={C.text} /> : <ChipIcon kind={r.kind} color={hl > 0.5 ? C.text : C.accentText} />}
        </div>
        <div style={{ fontSize: r.kind === 'me' ? 30 : 25, fontWeight: r.kind === 'me' ? 700 : 600, color: C.text, whiteSpace: 'nowrap' }}>{r.name}</div>
      </div>
      <div
        style={{
          flex: 1,
          height: '100%',
          borderRadius: 12,
          background: hl > 0 ? alpha(C.accent, 0.12 + 0.18 * hl) : C.card,
          border: `2px solid ${hl > 0 ? alpha(C.accentText, 0.35 + 0.65 * hl) : alpha(C.text, 0.06)}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            whiteSpace: 'pre',
            letterSpacing: '0.01em',
            color: hl > 0.5 ? C.text : blank ? C.muted : alpha(C.text, 0.45 + 0.55 * r.quality),
          }}
        >
          {blank ? '—' : r.text}
          {!blank && r.chars > 0 && r.chars < 44 && r.kind !== 'me' ? <span style={{ color: C.accentText }}>▍</span> : null}
        </div>
        {r.five > 0 && (
          <div
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: `translateY(-50%) scale(${0.6 + 0.4 * r.five})`,
              opacity: r.five,
              background: GRADIENT,
              color: C.text,
              fontSize: 26,
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 10,
            }}
          >
            5/5
          </div>
        )}
      </div>
    </div>
  );
};

/** The grey ruler (log scale in contrast), ladder ticks, the marker and the tags above it. */
const Ruler: React.FC<{ s: ReturnType<typeof frameState> }> = ({ s }) => {
  const stops = Array.from({ length: 24 }, (_, i) => i / 23).map((p) => `${rgb(greyOf(ratioAt(p)))} ${(p * 100).toFixed(1)}%`);
  const mx = RULER.x + s.marker.pos * RULER.w;
  const hx = RULER.x + s.humanPos * RULER.w;
  const bx = RULER.x + s.bracketTo * RULER.w;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: s.rulerAppear }}>
      <div
        style={{
          position: 'absolute',
          left: RULER.x,
          top: RULER.y,
          width: RULER.w,
          height: RULER.h,
          borderRadius: 8,
          background: `linear-gradient(to right, ${stops.join(', ')})`,
          boxShadow: `0 0 0 2px ${alpha(C.text, 0.18)}`,
        }}
      />
      {TICKS.map((tk, i) => (
        <React.Fragment key={i}>
          <div style={{ position: 'absolute', left: RULER.x + tk.pos * RULER.w - 1.5, top: RULER.y + RULER.h + 2, width: 3, height: 12, background: C.muted }} />
          {tk.label && (
            <div
              style={{
                position: 'absolute',
                left: RULER.x + tk.pos * RULER.w - 40,
                width: 80,
                textAlign: i === TICKS.length - 1 ? 'right' : 'center',
                transform: i === TICKS.length - 1 ? 'translateX(-30px)' : i === 0 ? 'translateX(28px)' : undefined,
                top: RULER.y + RULER.h + 16,
                fontSize: 24,
                fontWeight: 600,
                color: C.muted,
              }}
            >
              {tk.label}
            </div>
          )}
        </React.Fragment>
      ))}
      {/* Marker */}
      <div style={{ position: 'absolute', left: mx - 2, top: RULER.y - 8, width: 4, height: RULER.h + 16, background: C.accentText, borderRadius: 2 }} />
      <svg style={{ position: 'absolute', left: mx - 14, top: RULER.y - 28 }} width={28} height={20}>
        <path d="M0 0 H28 L14 18 Z" fill={C.accentText} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: Math.min(Math.max(mx - 160, RULER.x - 10), RULER.x + RULER.w - 310),
          width: 320,
          top: RULER.y + RULER.h + 40,
          height: 44,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          fontSize: 26,
          fontWeight: 700,
          color: C.accentText,
          whiteSpace: 'nowrap',
        }}
      >
        <span>ink grey {s.marker.grey}</span>
        {/* The same fade, stretched along the log ruler so it stays visible past grey ~235. Always
            laid out (opacity 0 when off) so blended scenes put the label in the same place. */}
        {(
          <span
            style={{
              opacity: s.chipOpacity,
              background: '#ffffff',
              borderRadius: 8,
              padding: '0 10px',
              height: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: `0 0 0 2px ${alpha(C.accentText, 0.6)}`,
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 800, color: rgb(s.chipInk) }}>Aa</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#6b6b80', letterSpacing: '0.04em' }}>LOG</span>
          </span>
        )}
      </div>
      {/* My threshold */}
      {s.human > 0 && (
        <>
          <div style={{ position: 'absolute', left: hx - 1.5, top: RULER.y - 50, width: 3, height: 50 + RULER.h, background: C.text, opacity: s.human }} />
          <div
            style={{
              position: 'absolute',
              right: 960 - hx + 12,
              top: RULER.y - 60,
              fontSize: 28,
              fontWeight: 700,
              color: C.text,
              whiteSpace: 'nowrap',
              opacity: s.human,
              transform: `translateY(${(1 - s.human) * 10}px)`,
            }}
          >
            me: 0.030 <span style={{ color: C.muted, fontWeight: 600 }}>· 3%</span>
          </div>
        </>
      )}
      {/* ×6–7 bracket from my threshold to the models' */}
      {s.bracket > 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: hx,
              top: RULER.y - 22,
              width: (bx - hx) * s.bracket,
              height: 14,
              borderTop: `3px solid ${C.accentText}`,
              borderRight: s.bracket > 0.98 ? `3px solid ${C.accentText}` : undefined,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: (hx + bx) / 2 - 80,
              width: 160,
              textAlign: 'center',
              top: RULER.y - 66,
              fontSize: 34,
              fontWeight: 800,
              opacity: s.bracket,
              ...gradientText,
            }}
          >
            ×6–7
          </div>
        </>
      )}
    </div>
  );
};

export const FadeCard: React.FC<AnimProps & FadeCardProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <Stage vertical={p.vertical} fill>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${s.hero * HERO_DY}px)` }}>
      <SentenceCard glyphs={s.glyphs} style={{ transform: `scale(${1 + (HERO_SCALE - 1) * s.hero})`, transformOrigin: '50% 100%' }}>
        {s.floorTag > 0 && (
          <div
            style={{
              position: 'absolute',
              right: 18,
              bottom: 14,
              opacity: s.floorTag,
              transform: `scale(${0.7 + 0.3 * s.floorTag})`,
              transformOrigin: 'right bottom',
              background: C.bg0,
              borderRadius: 14,
              padding: '6px 18px',
              fontSize: 46,
              fontWeight: 800,
              color: C.text,
            }}
          >
            <span style={gradientText}>254</span>
            <span style={{ color: C.muted }}> / 255</span>
          </div>
        )}
      </SentenceCard>
      <Ruler s={s} />
      {s.readers.map((r) => (
        <Row key={r.id} r={r} />
      ))}
      </div>
    </Stage>
  );
};
