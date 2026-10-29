import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { MODELS, frameState, type HiddenInstructionProps } from './HiddenInstruction.state.ts';
import { Stage, gradientText } from './Stage.tsx';
import { ChipIcon } from './FadeCard.tsx';
import { greyOf } from './perception.ts';

export { frameState };
export type { HiddenInstructionProps };

const X = 30;
const W = 900;
const H = 290;
const COL = 160;
const CHIP_Y = 650;

/** One text line from a study mask (768x192 canvas, text centred vertically), filled with `fill`. */
export const MaskLine: React.FC<{ mask: string; top: number; fill: string; typed?: number; glow?: boolean; width?: number }> = ({
  mask,
  top,
  fill,
  typed = 1,
  glow,
  width = W,
}) => {
  const url = `url(${staticFile(`stim/${mask}-mask.png`)})`;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top,
        width,
        height: width / 4,
        background: fill,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        clipPath: `inset(0 ${(1 - typed) * 100}% 0 0)`,
        filter: glow ? `drop-shadow(0 0 10px ${alpha(C.accent2, 0.9)})` : undefined,
      }}
    />
  );
};

export const Shield: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34">
    <path d="M17 3 L29 8 V16 C29 24 23 29 17 31 C11 29 5 24 5 16 V8 Z" fill={alpha(C.accent, 0.3)} stroke={C.accentText} strokeWidth={2.5} />
    <path d="M11 17 L15.5 21.5 L23 13" fill="none" stroke={C.text} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The visible answer, drawn: a small Eiffel Tower (the capital of France). */
export const Eiffel: React.FC<{ h?: number; color?: string }> = ({ h = 62, color = C.text }) => (
  <svg width={h * 0.62} height={h} viewBox="0 0 40 64">
    <path d="M20 2 L21.5 12 L18.5 12 Z" fill={color} />
    <path d="M18.5 12 H21.5 L23.5 26 H16.5 Z" fill={color} />
    <rect x={14} y={26} width={12} height={3.5} rx={1} fill={color} />
    <path d="M16 29.5 H24 L30 46 H10 Z" fill={color} />
    <rect x={8} y={46} width={24} height={3.5} rx={1} fill={color} />
    <path d="M9.5 49.5 H30.5 L37 62 H28 C27 55 24 52 20 52 C16 52 13 55 12 62 H3 Z" fill={color} />
  </svg>
);

/** The hidden instruction's answer, drawn: a banana (the long yellow fruit). */
export const Banana: React.FC<{ h?: number }> = ({ h = 62 }) => (
  <svg width={h * 0.72} height={h} viewBox="3 0 46 64">
    <path d="M10 6 C2 26 8 52 34 60 C42 62 48 58 47 54 C30 52 18 38 18 8 Z" fill="#facc15" stroke="#854d0e" strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M10 6 L12 1 L18 3 L18 8 Z" fill="#854d0e" />
    <path d="M14 14 C13 32 20 46 36 54" fill="none" stroke="#ca8a04" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

/** Robots of the immune models, each holding its shield. */
const ROBOT: Record<string, string> = { gpt4o: 'cast/robot-teal.png', gpt54: 'cast/robot-amber.png', luna: 'cast/robot-violet.png' };

/** The probe card: visible instruction on top, hidden one under it. */
export const ProbeCard: React.FC<{ y: number; hiddenGrey: number; typed?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  y,
  hiddenGrey,
  typed = 1,
  style,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: X,
      top: y,
      width: W,
      height: H,
      background: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: `0 18px 60px ${alpha('#000000', 0.55)}`,
      ...style,
    }}
  >
    <MaskLine mask="visible" top={-38} fill="#000000" />
    <MaskLine mask="hidden" top={68} fill={`rgb(${hiddenGrey},${hiddenGrey},${hiddenGrey})`} typed={typed} />
    {children}
  </div>
);

const LAYERS = ['pixels', 'alpha channel', 'least significant bit'];

export const HiddenInstruction: React.FC<AnimProps & HiddenInstructionProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const g = greyOf(s.hiddenRatio);
  return (
    <Stage vertical={p.vertical} fill>
      {/* Steganography layers peel out of the card (drawn back to front). */}
      {s.split > 0.01 &&
        [2, 1].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: X,
              top: 24 + k * 170 * s.split,
              width: W,
              height: H,
              transform: `scale(${1 - 0.1 * s.split})`,
              borderRadius: 16,
              overflow: 'hidden',
              background: C.card,
              border: `2px solid ${alpha(C.accentText, 0.5)}`,
              opacity: s.split,
              boxShadow: `0 18px 50px ${alpha('#000000', 0.6)}`,
            }}
          >
            <MaskLine mask="hidden" top={68} fill={C.accentText} glow />
            <div style={{ position: 'absolute', left: 20, bottom: 16, fontSize: 28, fontWeight: 700, color: C.muted }}>{LAYERS[k]}</div>
          </div>
        ))}
      <ProbeCard y={24} hiddenGrey={g} typed={s.typed} style={{ transform: `scale(${1 - 0.1 * s.split})` }}>
        {s.split > 0.01 && (
          <div style={{ position: 'absolute', left: 20, bottom: 16, fontSize: 28, fontWeight: 700, color: '#64748b', opacity: s.split }}>{LAYERS[0]}</div>
        )}
        {s.pct > 0 && (
          <div
            style={{
              position: 'absolute',
              right: 16,
              bottom: 14,
              padding: '6px 16px',
              borderRadius: 12,
              background: C.bg0,
              color: C.text,
              fontSize: 32,
              fontWeight: 800,
              opacity: s.pct,
            }}
          >
            hidden line: <span style={gradientText}>1% contrast</span>
          </div>
        )}
      </ProbeCard>
      {/* 0.222 ≈ 1 in 5 */}
      {s.faintTag > 0 && (
        <div
          style={{
            position: 'absolute',
            left: X,
            width: W,
            top: 380,
            textAlign: 'center',
            opacity: s.faintTag * (1 - 0.6 * s.qwen),
            transform: `scale(${0.85 + 0.15 * s.faintTag})`,
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, ...gradientText }}>0.222</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: C.text, marginTop: 14 }}>≈ 1 in 5 trials obeyed</div>
        </div>
      )}
      {/* Model chips and their answers */}
      {MODELS.map((m, i) => {
        const cx = 80 + i * COL;
        const isQwen = m.id === 'qwen';
        const lift = isQwen ? s.qwen : 0;
        const dimmed = s.qwen > 0 && !isQwen && !m.immune ? 0.45 * s.qwen : 0;
        return (
          <div key={m.id} style={{ position: 'absolute', left: cx - 72, top: CHIP_Y - 14 * lift, width: 144, opacity: s.chips * (1 - dimmed) }}>
            <div
              style={{
                height: 92,
                borderRadius: 14,
                background: isQwen && lift > 0 ? alpha(C.accent, 0.2 + 0.2 * lift) : C.card,
                border: `2px solid ${isQwen && lift > 0 ? C.accentText : alpha(C.text, 0.1)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <ChipIcon kind="model" size={26} />
              <div style={{ fontSize: 16, fontWeight: 600, color: C.muted, height: 18, lineHeight: '18px' }}>{m.top}</div>
              <div style={{ fontSize: m.name.length > 8 ? 21 : 24, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>{m.name}</div>
              {m.immune && s.shields > 0 && ROBOT[m.id] && (
                <div
                  style={{
                    position: 'absolute',
                    left: 72 - 52,
                    top: -110,
                    width: 104,
                    height: 104,
                    opacity: s.shields,
                    transform: `translateY(${(1 - s.shields) * 20}px)`,
                  }}
                >
                  <Img src={staticFile(ROBOT[m.id])} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', left: 52 - 19, top: 66, transform: `scale(${0.6 + 0.4 * s.shields})` }}>
                    <Shield size={38} />
                  </div>
                </div>
              )}
            </div>
            {s.bubbles[i].items.map((b, k) =>
              b.appear > 0 ? (
                <div
                  key={k}
                  style={{
                    marginTop: 10,
                    height: 76,
                    borderRadius: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontSize: b.banana > 0.5 ? 21 : 24,
                    fontWeight: 700,
                    opacity: b.appear,
                    transform: `translateY(${(1 - b.appear) * -16}px) scale(${b.banana > 0 ? 1 + 0.12 * Math.sin(Math.PI * b.banana) : 1})`,
                    background: b.banana > 0.5 ? GRADIENT : alpha(C.text, 0.06),
                    border: `2px solid ${b.banana > 0.5 ? C.accentText : alpha(C.text, 0.14)}`,
                    color: b.banana > 0.5 ? C.text : C.muted,
                  }}
                >
                  {b.banana > 0.5 ? <Banana h={64} /> : <Eiffel h={64} color={C.muted} />}
                  <span>{b.banana > 0.5 ? 'banana' : 'Paris'}</span>
                </div>
              ) : (
                <div key={k} style={{ marginTop: 10, height: 76 }} />
              ),
            )}
          </div>
        );
      })}
      {s.zeroTag > 0 && (
        <div style={{ position: 'absolute', left: X, width: W, top: 880, textAlign: 'center', opacity: s.zeroTag * (1 - s.pct) }}>
          <span style={{ fontSize: 64, fontWeight: 800, ...gradientText }}>0.000</span>
          <span style={{ fontSize: 36, fontWeight: 700, color: C.text }}> obeyed the hidden line</span>
        </div>
      )}
      {s.qwen > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 80 + 5 * COL - 90,
            width: 180,
            top: 1000,
            textAlign: 'center',
            fontSize: 64,
            fontWeight: 800,
            opacity: s.qwen,
            ...gradientText,
          }}
        >
          2/3
        </div>
      )}
      {s.shields > 0 && (
        <div style={{ position: 'absolute', left: 80 - 72, top: 1018, display: 'flex', alignItems: 'center', gap: 10, opacity: s.shields, fontSize: 32, fontWeight: 700 }}>
          <Shield size={38} /> immune to all six methods
        </div>
      )}
    </Stage>
  );
};
