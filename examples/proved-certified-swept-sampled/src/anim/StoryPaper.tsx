import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { PanRings, SERIF, STAMP_TONES, Tick } from './pieces.tsx';
import { BACKING, BADGE, CENTRE_SHIFT, FIG, H, PAGE, ROWS, W, frameState, type StoryProps } from './StoryPaper.state.ts';

export { frameState };

/** Grey text bars standing in for a line of serif prose. */
const Bars: React.FC<{ x: number; y: number; widths: number[]; h?: number; gap?: number; color?: string }> = ({ x, y, widths, h = 14, gap = 12, color = alpha(C.muted, 0.45) }) => (
  <>
    {widths.map((w, i) => (
      <div key={i} style={{ position: 'absolute', left: x, top: y + i * (h + gap), width: w, height: h, borderRadius: h / 2, background: color }} />
    ))}
  </>
);

/** Small icon per kind of backing: a pen stroke, a grid of boxes, a scatter of dots. */
const Icon: React.FC<{ kind: number; color: string }> = ({ kind, color }) => (
  <svg width={54} height={54} viewBox="0 0 54 54" style={{ flex: 'none' }}>
    <rect x={2} y={2} width={50} height={50} rx={10} fill={alpha(C.bg0, 0.9)} stroke={alpha(color, 0.8)} strokeWidth={2.5} />
    {kind === 0 && <path d="M 10 34 C 18 14, 24 42, 32 26 S 42 18, 45 22" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />}
    {kind === 1 &&
      Array.from({ length: 9 }, (_, k) => <rect key={k} x={10 + (k % 3) * 12} y={10 + Math.floor(k / 3) * 12} width={10} height={10} rx={2} fill={alpha(color, 0.85)} />)}
    {kind === 2 &&
      [
        [14, 15],
        [31, 12],
        [40, 27],
        [20, 31],
        [12, 41],
        [34, 40],
      ].map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={3.6} fill={color} />)}
  </svg>
);

export const StoryPaper: React.FC<AnimProps & StoryProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  const tones = [STAMP_TONES[0], STAMP_TONES[1], C.muted];
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateX(${(1 - s.page.shift) * CENTRE_SHIFT}px)` }}>
        {/* the stack: two sheets behind the front page fan out a little */}
        {[2, 1].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: PAGE.x,
              top: PAGE.y,
              width: PAGE.w,
              height: PAGE.h,
              borderRadius: 16,
              background: k === 2 ? C.bg1 : '#15151f',
              border: `2px solid ${alpha('#ffffff', 0.1)}`,
              opacity: s.page.appear,
              transform: `translate(${14 * k * s.page.spread}px, ${10 * k * s.page.spread}px) rotate(${2.2 * k * s.page.spread}deg)`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: PAGE.x,
            top: PAGE.y,
            width: PAGE.w,
            height: PAGE.h,
            borderRadius: 16,
            background: `linear-gradient(180deg, ${C.card}, ${C.bg1})`,
            border: `2px solid ${alpha('#ffffff', 0.16)}`,
            boxShadow: `0 18px 40px ${alpha('#000000', 0.55)}`,
            opacity: s.page.appear,
            transform: `translateY(${(1 - s.page.appear) * 30}px)`,
            overflow: 'hidden',
          }}
        >
          {/* title and author lines */}
          <Bars x={(PAGE.w - 340) / 2} y={36} widths={[340]} h={20} color={alpha(C.text, 0.4)} />
          <Bars x={(PAGE.w - 220) / 2} y={76} widths={[220]} h={12} color={alpha(C.muted, 0.35)} />
        </div>
        {/* the figure: rings packed in a frying pan */}
        {s.fig.appear > 0 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={H}>
            <g opacity={s.fig.appear * s.page.appear} transform={`translate(0 ${(1 - s.fig.appear) * 16})`}>
              <PanRings cx={FIG.cx} cy={FIG.cy} R={FIG.R} spread={0.45 + 0.4 * s.fig.spread} id="story" />
            </g>
          </svg>
        )}
        {s.page.appear > 0 && (
          <>
            <div style={{ position: 'absolute', left: PAGE.x, width: PAGE.w, top: FIG.cy + FIG.R + 22, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: C.muted, opacity: s.fig.appear * s.page.appear }}>
              Fig. 1
            </div>
            {ROWS.map((y, i) => (
              <div key={i} style={{ opacity: s.page.appear * (0.35 + 0.65 * s.rows[i].appear) }}>
                <Bars x={PAGE.x + 34} y={y - 30} widths={i === 1 ? [320, 270] : [320, 230]} h={14} gap={16} color={alpha(s.rows[i].appear > 0 ? C.text : C.muted, 0.18 + 0.32 * s.rows[i].appear)} />
              </div>
            ))}
          </>
        )}
        {/* the identical ticks, one per claim */}
        {s.rows.map((r, i) =>
          r.tick <= 0 ? null : (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: PAGE.x + PAGE.w - 96,
                top: ROWS[i] - 32,
                opacity: r.tick,
                transform: `scale(${(0.6 + 0.4 * r.tick) * (1 + 0.16 * r.pulse)})`,
                filter: r.pulse > 0 ? `drop-shadow(0 0 ${18 * r.pulse}px ${alpha(C.ok, 0.9)})` : undefined,
              }}
            >
              <Tick size={64} />
            </div>
          ),
        )}
        {/* the stack's tag */}
        {s.tag.appear > 0 && (
          <div style={{ position: 'absolute', left: PAGE.x, top: PAGE.y - 84, opacity: s.tag.appear, transform: `translateY(${(1 - s.tag.appear) * 12}px)`, padding: '8px 22px', borderRadius: 30, border: `2px solid ${alpha(C.accentText, 0.6)}`, fontSize: 32, fontWeight: 700, color: C.accentText }}>
            60-page preprint
          </div>
        )}
        </div>
        {s.heading.appear > 0 && (
          <div style={{ position: 'absolute', left: BADGE.x, top: ROWS[0] - 120, fontSize: 30, fontWeight: 700, color: C.muted, opacity: s.heading.appear }}>
            what backs it
          </div>
        )}
        {/* what backs each claim: slides away behind the page "in print", comes back with its weight */}
        {s.badges.map((b, i) => {
          if (b.appear <= 0) return null;
          const tone = tones[i];
          const shift = (1 - b.appear) * 40 + b.slide * -(BADGE.x - PAGE.x - 120);
          return (
            <div key={i} style={{ position: 'absolute', left: BADGE.x, top: ROWS[i] - 40, width: BADGE.w, opacity: b.appear * (1 - b.slide), transform: `translateX(${shift}px)` }}>
              <svg style={{ position: 'absolute', left: -46, top: 38, overflow: 'visible' }} width={46} height={4}>
                <line x1={-10} y1={2} x2={40} y2={2} stroke={alpha(tone, 0.7)} strokeWidth={3} strokeDasharray="6 6" />
              </svg>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Icon kind={i} color={tone} />
                <div style={{ fontSize: 30, fontWeight: 800, color: tone, whiteSpace: 'nowrap' }}>{BACKING[i].text}</div>
              </div>
              <div style={{ marginTop: 10, marginLeft: 68, width: 210, height: 12, borderRadius: 6, background: alpha('#ffffff', 0.08), opacity: Math.min(1, b.bar * 3) }}>
                <div style={{ width: `${100 * BACKING[i].weight * b.bar}%`, height: '100%', borderRadius: 6, background: tone }} />
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
