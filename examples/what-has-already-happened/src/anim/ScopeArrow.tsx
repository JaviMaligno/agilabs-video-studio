import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Mark } from './pieces.tsx';
import { QUOTE_1A, QUOTE_1B, QUOTE_2, ROWS, frameState, type ScopeArrowProps } from './ScopeArrow.state.ts';

export { frameState };
export type { ScopeArrowProps };

const PATH = 'M 230 616 C 232 730, 350 730, 466 690';
const HALF_A = 'M 230 616 C 231 680, 275 712, 336 716';
const HALF_B = 'M 336 716 C 386 717, 430 704, 466 690';

export const ScopeArrow: React.FC<AnimProps & ScopeArrowProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const q = s.quote;
  const len1a = QUOTE_1A.length;
  const shownA = QUOTE_1A.slice(0, Math.min(q.n1, len1a));
  const shownB = QUOTE_1B.slice(0, Math.max(0, q.n1 - len1a));
  const sp = s.dotted.split;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', inset: 0, opacity: s.cards.opacity }}>
        {/* piece 3 */}
        <div style={{ position: 'absolute', left: 60, top: 432, width: 390, height: 182, borderRadius: 20, background: C.card, border: `3px solid ${alpha(C.muted, 0.5)}`, padding: '22px 28px', boxSizing: 'border-box', opacity: s.cards.p3 }}>
          <div style={{ fontSize: 54, fontWeight: 800 }}>piece 3</div>
          <div style={{ fontSize: 33, fontWeight: 600, color: C.muted, marginTop: 8 }}>writes a calculation</div>
        </div>
        {/* piece 4 with its script */}
        <div style={{ position: 'absolute', left: 480, top: 432, width: 540, height: 330, borderRadius: 20, background: C.card, border: `3px solid ${alpha(C.muted, 0.5)}`, padding: '22px 28px', boxSizing: 'border-box', opacity: s.cards.p4 }}>
          <div style={{ fontSize: 54, fontWeight: 800 }}>piece 4</div>
          <div style={{ fontSize: 33, fontWeight: 600, color: C.muted, marginTop: 8 }}>reuses that calculation</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 26, letterSpacing: '0.1em', textTransform: 'uppercase' }}>its script says</div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 36,
              fontWeight: 800,
              padding: '2px 6px',
              marginLeft: -6,
              borderRadius: 8,
              background: alpha(C.warm, 0.3 * s.clause),
              color: s.clause > 0.5 ? C.warm : C.text,
              whiteSpace: 'nowrap',
            }}
          >
            “I’ll rewrite them for you.”
          </div>
        </div>
        {/* the dotted dependency: draws, then snaps */}
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <defs>
            <clipPath id="reveal">
              <rect x={200} y={590} width={290 * s.dotted.draw} height={170} />
            </clipPath>
          </defs>
          <g clipPath="url(#reveal)" opacity={s.dotted.opacity}>
            <path d={HALF_A} fill="none" stroke={C.text} strokeWidth={7} strokeDasharray="3 16" strokeLinecap="round" transform={`translate(${-22 * sp} ${14 * sp}) rotate(${-8 * sp} 336 716)`} />
            <g transform={`translate(${22 * sp} ${14 * sp}) rotate(${8 * sp} 336 716)`}>
              <path d={HALF_B} fill="none" stroke={C.text} strokeWidth={7} strokeDasharray="3 16" strokeLinecap="round" />
              <path d="M 442 682 L 468 690 L 448 710" fill="none" stroke={C.text} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
          {s.red.draw > 0 && (
            <>
              <path d={PATH} pathLength={1} fill="none" stroke={C.marker} strokeWidth={12} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - s.red.draw} />
              {s.red.draw > 0.92 && <path d="M 440 680 L 468 690 L 446 712" fill="none" stroke={C.marker} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />}
            </>
          )}
        </svg>
        <div style={{ position: 'absolute', left: 60, top: 760, fontSize: 34, fontWeight: 700, fontStyle: 'italic', color: C.muted, opacity: s.dotted.label }}>reuses a calculation</div>
        {s.stamp.pop > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 520,
              top: 728,
              padding: '6px 20px',
              border: `6px solid ${C.ok}`,
              borderRadius: 14,
              color: C.ok,
              background: alpha(C.bg0, 0.9),
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: '0.06em',
              opacity: Math.min(1, s.stamp.pop * 1.4),
              transform: `rotate(-7deg) scale(${1.4 - 0.4 * s.stamp.pop})`,
            }}
          >
            SELF-CONTAINED
          </div>
        )}
        {/* the six models draw the arrow back */}
        {ROWS.map((name, i) => {
          const r = s.rows[i];
          if (r.opacity <= 0) return null;
          const opus = i === 5;
          const top = opus ? 1214 : 846 + i * 58;
          const end = opus ? 664 + 100 * r.draw : 664 + 196 * r.draw;
          return (
            <div key={name} style={{ position: 'absolute', left: 0, top, width: 1080, height: 54, opacity: r.opacity }}>
              <div style={{ position: 'absolute', left: 80, top: 4, fontSize: 34, fontWeight: 800, color: opus ? C.accentText : C.text }}>{name}</div>
              <div style={{ position: 'absolute', left: 600, top: 2, width: 54, height: 48, borderRadius: 10, border: `3px solid ${alpha(C.muted, 0.6)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, boxSizing: 'border-box' }}>3</div>
              <svg width={1080} height={54} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
                <line x1={664} y1={26} x2={end} y2={26} stroke={opus ? alpha(C.marker, 0.45) : C.marker} strokeWidth={opus ? 6 : 10} strokeLinecap="round" strokeDasharray={opus ? '8 10' : undefined} />
                {!opus && r.draw > 0.95 && <path d="M 846 14 L 862 26 L 846 38" fill="none" stroke={C.marker} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
              <div style={{ position: 'absolute', left: 872, top: 2, width: 54, height: 48, borderRadius: 10, border: `3px solid ${alpha(C.muted, 0.6)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, boxSizing: 'border-box' }}>4</div>
            </div>
          );
        })}
        {s.ninetyTwo > 0 && (
          <div style={{ position: 'absolute', left: 80, right: 60, top: 1140, fontSize: 34, fontWeight: 800, color: C.marker, opacity: s.ninetyTwo }}>course: 92 / 92 responses</div>
        )}
        {s.opusNote > 0 && (
          <div style={{ position: 'absolute', left: 80, top: 1272, fontSize: 32, fontWeight: 700, color: C.muted, opacity: s.opusNote }}>course 52% · release 10%</div>
        )}
      </div>

      {/* gpt-4o's answer, unedited */}
      {q.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: q.opacity }}>
          <div style={{ position: 'absolute', left: 60, top: 418, fontSize: 32, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, opacity: q.header }}>release domain · gpt-4o, unedited</div>
          <div style={{ position: 'absolute', left: 60, top: 474, width: 960, height: 560, borderRadius: 22, background: C.card, border: `3px solid ${alpha(C.muted, 0.35)}`, padding: '34px 40px', boxSizing: 'border-box', fontSize: 47, fontWeight: 600, lineHeight: 1.36 }}>
            <span>{shownA}</span>
            <span style={{ background: alpha(C.warm, 0.32 * q.highlight * (1 - q.peel)), color: q.highlight > 0.5 && q.peel < 0.5 ? C.warm : C.text, fontWeight: 800, borderRadius: 6 }}>{shownB}</span>
            {q.n1 >= QUOTE_1A.length + QUOTE_1B.length && <div style={{ color: C.muted, marginTop: 10 }}>[…]</div>}
            <div style={{ marginTop: 10, color: C.marker, fontWeight: 800 }}>{QUOTE_2.slice(0, q.n2)}</div>
          </div>
          {q.peel > 0 && q.peel < 1 && (
            <div
              style={{
                position: 'absolute',
                left: 520 + 340 * q.peel,
                top: 640 - 260 * q.peel,
                padding: '6px 18px',
                borderRadius: 10,
                background: C.warm,
                color: C.bg0,
                fontSize: 34,
                fontWeight: 800,
                opacity: 1 - q.peel * q.peel,
                transform: `rotate(${-6 - 24 * q.peel}deg)`,
                whiteSpace: 'nowrap',
              }}
            >
              its scope
            </div>
          )}
          <div style={{ position: 'absolute', left: 60, width: 880, top: 1100, display: 'flex', justifyContent: 'space-between' }}>
            {['read it', 'wrote it', 'ignored it'].map((label, i) => {
              const bad = i === 2;
              return (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 22px',
                    borderRadius: 16,
                    border: `3px solid ${bad ? C.marker : C.ok}`,
                    color: bad ? C.marker : C.ok,
                    fontSize: 40,
                    fontWeight: 800,
                    opacity: q.ticks[i],
                    transform: `scale(${1.3 - 0.3 * q.ticks[i]})`,
                  }}
                >
                  <Mark size={38} color={bad ? C.marker : C.ok} cross={bad} />
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
