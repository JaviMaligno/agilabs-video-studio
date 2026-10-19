import React from 'react';
import { staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { MEANING_STOP, NONSENSE_STOP, SIZE_MAX, SIZE_MIN, frameState, type GhostWriterProps } from './GhostWriter.state.ts';
import { Stage, gradientText } from './Stage.tsx';
import { ChipIcon } from './FadeCard.tsx';

export { frameState };
export type { GhostWriterProps };

const X = 30;
const W = 900;
const CARD_H = 190;
const TEXT_W = 820;
/** Text extent of each mask on the 768 px canvas (x0..x1). */
const EXTENT = { visible: [10, 429], nonsense: [10, 332] } as const;

const pos = (size: number) => (Math.log(SIZE_MAX) - Math.log(size)) / (Math.log(SIZE_MAX) - Math.log(SIZE_MIN));

const Line: React.FC<{
  y: number;
  label: string;
  mask: 'visible' | 'nonsense';
  scale: number;
  blur: number;
  read: number;
  ghost: number;
  ghostText: string;
  lostAt: string;
  labels: number;
}> = ({ y, label, mask, scale, blur, read, ghost, ghostText, lostAt, labels }) => {
  const [x0, x1] = EXTENT[mask];
  const full = (TEXT_W * 768) / (x1 - x0);
  const mw = full * scale;
  const mh = mw / 4;
  const url = `url(${staticFile(`stim/${mask}-mask.png`)})`;
  return (
    <>
      <div style={{ position: 'absolute', left: X, top: y, fontSize: 30, fontWeight: 700, color: C.muted, opacity: labels, letterSpacing: '0.02em' }}>{label}</div>
      <div
        style={{
          position: 'absolute',
          left: X + W - 220,
          width: 220,
          top: y - 2,
          textAlign: 'right',
          fontSize: 30,
          fontWeight: 800,
          opacity: labels,
          color: read ? C.accentText : C.muted,
        }}
      >
        {read ? 'models read it' : `lost at ${lostAt}`}
      </div>
      <div
        style={{
          position: 'absolute',
          left: X,
          top: y + 46,
          width: W,
          height: CARD_H,
          background: '#ffffff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: `0 18px 60px ${alpha('#000000', 0.55)}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 40 - (x0 / 768) * mw,
            top: CARD_H * 0.36 - mh / 2,
            width: mw,
            height: mh,
            background: '#000000',
            WebkitMaskImage: url,
            maskImage: url,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
          }}
        />
        {ghost > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 40,
              right: 20,
              top: CARD_H * 0.5,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              fontSize: 48,
              fontWeight: 700,
              whiteSpace: 'pre',
              color: C.accent,
              opacity: ghost * 0.9,
              textShadow: `0 0 18px ${alpha(C.accent2, 0.55)}`,
            }}
          >
            {ghostText}
          </div>
        )}
      </div>
    </>
  );
};

export const GhostWriter: React.FC<AnimProps & GhostWriterProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const tx = (size: number) => X + pos(size) * W;
  const gy = 620;
  return (
    <Stage vertical={p.vertical} fill>
      <Line y={0} label="meaningful" mask="visible" scale={s.scale} blur={s.blur} read={s.meaning.read} ghost={s.meaning.ghost} ghostText={s.meaning.ghostText} lostAt="≈5.5 px" labels={s.labels} />
      <Line
        y={300}
        label="nonsense"
        mask="nonsense"
        scale={s.scale}
        blur={s.blur}
        read={s.nonsense.read}
        ghost={s.nonsense.ghost}
        ghostText={s.nonsense.ghostText}
        lostAt="≈8 px"
        labels={s.labels}
      />
      {/* Font-height gauge */}
      <div style={{ position: 'absolute', left: X, top: gy, width: W, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: s.labels }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: C.muted }}>font height</span>
        <span style={{ fontSize: 48, fontWeight: 800, color: C.text }}>{s.size.toFixed(1)} px</span>
      </div>
      <div style={{ position: 'absolute', left: X, top: gy + 80, width: W, height: 12, borderRadius: 6, background: C.card, boxShadow: `0 0 0 2px ${alpha(C.text, 0.12)}`, opacity: s.labels }} />
      <div style={{ position: 'absolute', left: tx(s.size) - 3, top: gy + 64, width: 6, height: 44, borderRadius: 3, background: C.text, opacity: s.labels }} />
      {[
        { size: NONSENSE_STOP, label: '≈8 px', a: s.mark8 },
        { size: MEANING_STOP, label: '≈5.5 px', a: s.mark55 },
      ].map((m) => (
        <React.Fragment key={m.label}>
          <div style={{ position: 'absolute', left: tx(m.size) - 2, top: gy + 116, width: 4, height: 26, background: C.accentText, opacity: m.a }} />
          <div
            style={{
              position: 'absolute',
              left: tx(m.size) - 80,
              width: 160,
              textAlign: 'center',
              top: gy + 146,
              fontSize: 32,
              fontWeight: 800,
              color: C.text,
              opacity: m.a,
              transform: `translateY(${(1 - m.a) * 10}px)`,
            }}
          >
            {m.label}
          </div>
        </React.Fragment>
      ))}
      {s.bracket > 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: tx(NONSENSE_STOP),
              top: gy + 200,
              width: (tx(MEANING_STOP) - tx(NONSENSE_STOP)) * s.bracket,
              height: 14,
              borderBottom: `4px solid ${C.accentText}`,
              borderLeft: `4px solid ${C.accentText}`,
              borderRight: s.bracket > 0.98 ? `4px solid ${C.accentText}` : undefined,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: W + X - tx(MEANING_STOP),
              top: gy + 226,
              fontSize: 36,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              opacity: s.bracket,
            }}
          >
            2.5 px <span style={gradientText}>= prediction</span>
          </div>
        </>
      )}
      {/* The control: an OCR engine has no language model, so both lines stop together. */}
      <div
        style={{
          position: 'absolute',
          left: X,
          top: 940,
          width: W,
          padding: '18px 24px',
          borderRadius: 16,
          background: C.card,
          border: `2px solid ${alpha(C.text, 0.08)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: s.ocr.appear,
        }}
      >
        <ChipIcon kind="ocr" size={40} />
        <div style={{ fontSize: 28, fontWeight: 700, flex: 1 }}>
          Tesseract <span style={{ color: C.muted, fontWeight: 600 }}>· OCR: no language model</span>
        </div>
        {['meaningful', 'nonsense'].map((k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                background: s.ocr.on ? GRADIENT : 'transparent',
                border: `3px solid ${s.ocr.on ? C.accentText : C.muted}`,
              }}
            />
          </div>
        ))}
      </div>
    </Stage>
  );
};
