import React from 'react';
import { C, alpha } from '../brand.ts';
import { Stage, gradientText } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { frameState, type GiveUpRowProps } from './GiveUpRow.state.ts';
import { SEED } from './ShellChips.state.ts';
import { CoreChip, EmojiText } from './pieces.tsx';

const TOP = 140;
const STEP = 98;

/** A generic human silhouette (outline, brand indigo). */
const Person: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={32} r={18} fill="none" stroke={C.accentText} strokeWidth={5} />
    <path d="M18 92 C18 66 32 56 50 56 C68 56 82 66 82 92" fill="none" stroke={C.accentText} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

export const GiveUpRow: React.FC<AnimProps & GiveUpRowProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  return (
    <Stage vertical={vertical} fill style={{ opacity: s.appear }}>
      <div style={{ position: 'absolute', left: 0, top: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
        <CoreChip size={80} seed={SEED.sonnet} shell={1} />
        <div style={{ fontSize: 34, fontWeight: 700, color: C.text, lineHeight: 1.15 }}>
          Claude Sonnet
          <div style={{ fontSize: 26, fontWeight: 600, color: C.muted }}>lights out = gave up</div>
        </div>
      </div>
      {s.human > 0 && (
        <div style={{ position: 'absolute', right: 10, top: 0, width: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: s.human }}>
          <Person size={120} />
        </div>
      )}
      {s.rows.map((r, i) => {
        const y = TOP + i * STEP;
        const lit = 1 - r.dim;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: y,
                height: 78,
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                transform: `translateY(${r.dim * 8}px) rotate(${-r.dim * 2.5}deg)`,
                transformOrigin: 'left center',
              }}
            >
              <div
                style={{
                  padding: '14px 26px',
                  borderRadius: 40,
                  borderBottomRightRadius: 10,
                  fontSize: 38,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: alpha(C.text, 0.35 + 0.65 * lit),
                  background: r.warm > 0 ? `linear-gradient(135deg, ${alpha(C.accent, 0.55 + 0.4 * r.warm)}, ${alpha(C.accent2, 0.55 + 0.4 * r.warm)})` : alpha(C.accent, 0.08 + 0.5 * lit),
                  border: `2px solid ${alpha(C.accentText, 0.15 + 0.7 * lit)}`,
                  boxShadow: r.warm > 0 ? `0 0 ${36 * r.warm}px ${alpha(C.accentText, 0.6 * r.warm)}` : lit > 0.5 ? `0 0 18px ${alpha(C.accent, 0.35 * lit)}` : undefined,
                }}
              >
                <span style={{ opacity: 0.35 + 0.65 * lit }}>
                  <EmojiText text={r.text} size={38} />
                </span>
              </div>
              {r.rate && (
                <div style={{ fontSize: 40, fontWeight: 800, opacity: r.tag, ...(r.warm > 0 ? gradientText : { color: C.muted }) }}>{r.rate}</div>
              )}
            </div>
            {s.human > 0 && (
              <div
                style={{
                  position: 'absolute',
                  right: 52,
                  top: y + 20,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: alpha(C.accentText, 0.12 + 0.88 * r.human),
                  boxShadow: r.human > 0.5 ? `0 0 ${r.warm ? 26 : 14}px ${alpha(C.accentText, 0.7 * r.human)}` : undefined,
                  opacity: s.human,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: TOP + 9 * STEP + 6, textAlign: 'center', fontSize: 32, fontWeight: 600, color: C.muted, opacity: s.note }}>
        one stimulus per category
      </div>
    </Stage>
  );
};
