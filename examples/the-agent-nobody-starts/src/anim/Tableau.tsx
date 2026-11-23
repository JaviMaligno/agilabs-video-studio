// Tableau: generated drawings and short chips laid out on the stage, revealed beat by beat.
// State in Tableau.state.ts.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx } from '../types.ts';
import { Stage, stageOf } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { frameState, type TableauProps } from './Tableau.state.ts';

const TONES: Record<string, { bg: string; border: string; color: string }> = {
  plain: { bg: alpha(C.card, 0.94), border: alpha(C.muted, 0.5), color: C.text },
  ok: { bg: 'rgba(22,48,34,0.95)', border: '#4ade80', color: '#bbf7d0' },
  bad: { bg: 'rgba(58,28,32,0.95)', border: '#f87171', color: '#fecaca' },
  accent: { bg: alpha(C.accent, 0.22), border: C.accentText, color: C.text },
  night: { bg: 'rgba(30,41,59,0.95)', border: '#5eead4', color: '#ccfbf1' },
};

export const Tableau: React.FC<AnimProps & TableauProps> = ({ t, beats, dur, vertical, lang, items, drift }) => {
  const s = frameState({ items, drift }, t, beats, dur);
  const st = stageOf(vertical);
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${s.zoom})`, transformOrigin: '50% 55%' }}>
        {items.map((it, i) => {
          const f = s.items[i];
          if (!f || f.opacity <= 0.001) return null;
          const left = it.x * st.w;
          const top = it.y * st.h;
          const common: React.CSSProperties = {
            position: 'absolute',
            left,
            top,
            opacity: f.opacity,
            transform: `translate(-50%, -50%) translate(${f.dx}px, ${f.dy}px) scale(${f.scale}) rotate(${f.rot}deg)`,
          };
          if (it.src) {
            return <Img key={i} src={staticFile(it.src)} style={{ ...common, width: (it.w ?? 0.5) * st.w, height: 'auto' }} />;
          }
          const tone = TONES[it.tone ?? 'plain'];
          return (
            <div
              key={i}
              style={{
                ...common,
                whiteSpace: 'nowrap',
                fontFamily,
                fontWeight: 700,
                fontSize: it.size ?? 52,
                lineHeight: 1.15,
                padding: '18px 30px',
                borderRadius: 22,
                background: tone.bg,
                color: tone.color,
                border: `4px solid ${tone.border}`,
                boxShadow: `0 10px 30px ${alpha(C.bg0, 0.6)}`,
              }}
            >
              {it.text ? tx(it.text, lang) : ''}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
