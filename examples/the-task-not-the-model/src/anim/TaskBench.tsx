import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import { clamp01 } from './steps.ts';
import type { AnimProps } from './types.ts';
import { Stage, stageOf } from './Stage.tsx';
import {
  frameState,
  robotFor,
  TXT,
  type JudgesState,
  type PairState,
  type PilesState,
  type SetupState,
  type TaskBenchProps,
} from './TaskBench.state.ts';

export { frameState };
export type { TaskBenchProps };

// Highlight colours: amber for DeepSeek, teal for the other six (same values as the series brand).
const B = C as typeof C & { ok?: string; warm?: string };
const OK = B.ok ?? '#2dd4bf';
const WARM = B.warm ?? '#fbbf24';

/**
 * Design box (px). In the vertical cut it sits on the safe stage, y = 280..1280 of the frame,
 * 936 px wide; in landscape it is scaled to fit the stage.
 */
const BOX = { w: 936, h: 1000 } as const;
/** Frame y of the safe stage top in the vertical cut. */
const SAFE_TOP = 280;

const fadeUp = (o: number, dy = 24): React.CSSProperties => ({ opacity: clamp01(o), transform: `translateY(${(1 - clamp01(o)) * dy}px)` });

const Robot: React.FC<{ name: string; x: number; y: number; size: number; appear: number; label?: boolean; labelSize?: number }> = ({
  name,
  x,
  y,
  size,
  appear,
  label = true,
  labelSize = 30,
}) => {
  const r = robotFor(name);
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y, width: size, display: 'flex', flexDirection: 'column', alignItems: 'center', ...fadeUp(appear, 40) }}>
      <Img src={staticFile(r.src)} style={{ width: size, height: size, objectFit: 'contain', filter: r.filter }} />
      {label && (
        <div style={{ marginTop: 6, fontSize: labelSize, fontWeight: 500, color: C.muted, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{name}</div>
      )}
    </div>
  );
};

/** A pile of yellow correction notes, base at `base`, grown to `h * grow` px. */
const NotePile: React.FC<{ cx: number; base: number; h: number; grow: number; w: number; strong?: boolean; seed: number }> = ({ cx, base, h, grow, w, strong, seed }) => {
  const step = 26;
  const n = Math.max(1, Math.round(h / step));
  const shown = h * clamp01(grow);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const top = base - (i + 1) * step;
        if ((i + 1) * step > shown + 0.5) return null;
        const rot = Math.sin(seed * 7.1 + i * 2.3) * 6;
        const dx = Math.sin(seed * 3.7 + i * 1.9) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx - w / 2 + dx,
              top: top - 8,
              width: w,
              height: step + 14,
              borderRadius: 4,
              background: strong ? WARM : alpha(WARM, 0.78),
              boxShadow: `0 3px 6px ${alpha(C.bg0, 0.45)}`,
              border: strong ? `2px solid ${alpha(C.text, 0.35)}` : 'none',
              transform: `rotate(${rot}deg)`,
              boxSizing: 'border-box',
            }}
          />
        );
      })}
    </>
  );
};

// ── setup ─────────────────────────────────────────────────────────────────────────────────────
const SLOT = BOX.w / 7;
const slotX = (i: number) => SLOT * (i + 0.5);

const Setup: React.FC<{ s: SetupState }> = ({ s }) => (
  <>
    <Img
      src={staticFile('draw/desk-messy.png')}
      style={{ position: 'absolute', left: 0, top: 120, width: BOX.w, height: 620, objectFit: 'contain', opacity: 0.32 * s.backdrop }}
    />
    {/* my correction notes, behind the card */}
    <div style={{ position: 'absolute', left: 590, top: 300, width: 330, height: 300, opacity: s.notes, transform: `translateY(${(1 - s.notes) * 60}px) scale(${0.8 + 0.2 * s.notes})` }}>
      <Img src={staticFile('draw/sticky-pile.png')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ position: 'absolute', right: 0, top: 612, fontSize: 38, fontWeight: 700, color: WARM, ...fadeUp(s.label) }}>{TXT.corrections}</div>
    {/* the request card */}
    <div
      style={{
        position: 'absolute',
        left: 40,
        top: 30,
        width: 720,
        padding: '30px 30px',
        borderRadius: 28,
        background: C.card,
        border: `2px solid ${alpha(C.accentText, 0.45)}`,
        boxShadow: `0 20px 50px ${alpha(C.bg0, 0.6)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        opacity: s.card,
        transform: `translateY(${(1 - s.card) * -120}px)`,
        boxSizing: 'border-box',
      }}
    >
      {s.bubbles.map((b, i) => (
        <div
          key={i}
          style={{
            alignSelf: 'flex-end',
            maxWidth: 600,
            padding: '16px 26px',
            borderRadius: '26px 26px 6px 26px',
            background: alpha(C.accent, 0.9),
            fontSize: 38,
            fontWeight: 600,
            lineHeight: 1.2,
            color: C.text,
            ...fadeUp(b.appear, 18),
          }}
        >
          {b.text}
        </div>
      ))}
    </div>
    {/* the counter */}
    <div style={{ position: 'absolute', left: 30, top: 560, display: 'flex', alignItems: 'baseline', gap: 18, ...fadeUp(s.counter) }}>
      <div style={{ fontSize: 130, fontWeight: 800, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{s.count}</div>
      <div style={{ fontSize: 46, fontWeight: 600, color: C.muted }}>{TXT.tasksLabel}</div>
    </div>
    {s.robots.map((r, i) => (
      <Robot key={r.name} name={r.name} x={slotX(i)} y={790} size={118} appear={r.appear} />
    ))}
  </>
);

// ── judges ────────────────────────────────────────────────────────────────────────────────────
const Judges: React.FC<{ s: JudgesState }> = ({ s }) => {
  const jw = 290;
  const jx = (i: number) => 18 + i * 309 + jw / 2;
  const cardW = 108;
  const gap = (BOX.w - 7 * cardW) / 6;
  const cardY = 650;
  return (
    <>
      <svg width={BOX.w} height={BOX.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {s.judges.map((j, i) => (
          <line
            key={i}
            x1={jx(i)}
            y1={520}
            x2={jx(i) + (BOX.w / 2 - jx(i)) * 0.6 * j.gaze}
            y2={520 + (cardY - 30 - 520) * j.gaze}
            stroke={i === 2 ? WARM : OK}
            strokeWidth={4}
            strokeDasharray="10 10"
            opacity={0.7 * j.gaze}
          />
        ))}
      </svg>
      {s.judges.map((j, i) => (
        <div key={i} style={{ position: 'absolute', left: jx(i) - jw / 2, top: 60, width: jw, display: 'flex', flexDirection: 'column', alignItems: 'center', ...fadeUp(j.appear, 40) }}>
          <Img src={staticFile('draw/blind-judge.png')} style={{ width: jw, height: 360, objectFit: 'contain' }} />
          <div
            style={{
              marginTop: 14,
              padding: '8px 26px',
              borderRadius: 999,
              border: `3px solid ${i === 2 ? WARM : OK}`,
              background: alpha(C.bg1, 0.9),
              fontSize: 34,
              fontWeight: 700,
              color: C.text,
              opacity: j.chipAppear,
            }}
          >
            {j.chip}
          </div>
        </div>
      ))}
      {s.cards.map((c, i) => (
        <div
          key={c.letter}
          style={{
            position: 'absolute',
            left: i * (cardW + gap),
            top: cardY,
            width: cardW,
            height: 150,
            borderRadius: 14,
            background: C.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            fontWeight: 800,
            color: C.bg0,
            boxShadow: `0 10px 24px ${alpha(C.bg0, 0.5)}`,
            ...fadeUp(c.appear, 30),
          }}
        >
          {c.letter}
        </div>
      ))}
    </>
  );
};

// ── piles ─────────────────────────────────────────────────────────────────────────────────────
const PILE = { base: 800, maxH: 520, noteW: 100 } as const;

const Piles: React.FC<{ s: PilesState }> = ({ s }) => {
  const n = Math.max(1, s.piles.length);
  const slot = BOX.w / n;
  return (
    <>
      {s.piles.map((p, i) => {
        const cx = slot * (i + 0.5);
        const h = PILE.maxH * p.frac;
        const top = PILE.base - h * p.grow;
        return (
          <React.Fragment key={p.name + i}>
            <NotePile cx={cx} base={PILE.base} h={h} grow={p.grow} w={Math.min(PILE.noteW, slot - 24)} strong={p.highlight} seed={i + 1} />
            {p.highlight && p.grow > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: cx - slot / 2 + 6,
                  top: top - 14,
                  width: slot - 12,
                  height: PILE.base - top + 14,
                  borderRadius: 12,
                  boxShadow: `0 0 40px ${alpha(WARM, 0.45 * p.grow)}`,
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                left: cx - slot / 2,
                width: slot,
                top: top - 74,
                textAlign: 'center',
                fontSize: p.highlight ? 52 : 44,
                fontWeight: 800,
                color: p.highlight ? WARM : OK,
                fontVariantNumeric: 'tabular-nums',
                ...fadeUp(p.label, 16),
              }}
            >
              {p.display}
            </div>
            <Robot name={p.name} x={cx} y={PILE.base + 14} size={Math.min(118, slot - 12)} appear={s.robots} />
          </React.Fragment>
        );
      })}
      {s.stamp && s.stamp.appear > 0 && (
        <div
          style={{
            position: 'absolute',
            left: BOX.w / 2 - 420,
            top: 90,
            width: 840,
            padding: '22px 20px',
            borderRadius: 18,
            border: `8px solid ${C.text}`,
            background: alpha(C.bg0, 0.82),
            textAlign: 'center',
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: '0.02em',
            color: C.text,
            opacity: s.stamp.appear,
            transform: `rotate(-5deg) scale(${1.1 - 0.1 * s.stamp.appear + 0.04 * s.stamp.pop})`,
            boxSizing: 'border-box',
          }}
        >
          {s.stamp.text}
        </div>
      )}
    </>
  );
};

// ── pair ──────────────────────────────────────────────────────────────────────────────────────
const Pair: React.FC<{ s: PairState }> = ({ s }) => {
  const xs = [234, 702];
  const robotY = 600;
  const size = 300;
  const base = 560;
  const maxH = 340;
  const opusC = { x: xs[0], y: robotY + size / 2 };
  return (
    <>
      {s.piles.map((p, i) => {
        const h = maxH * p.frac;
        const top = base - h * p.grow;
        return (
          <React.Fragment key={i}>
            <NotePile cx={xs[i]} base={base} h={h} grow={p.grow} w={150} seed={i + 3} />
            <div
              style={{
                position: 'absolute',
                left: xs[i] - 150,
                width: 300,
                top: top - 90,
                textAlign: 'center',
                fontSize: 64,
                fontWeight: 800,
                color: OK,
                fontVariantNumeric: 'tabular-nums',
                ...fadeUp(p.label, 16),
              }}
            >
              {p.display}
            </div>
          </React.Fragment>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: BOX.w / 2 - 80,
          width: 160,
          top: 330,
          textAlign: 'center',
          fontSize: 130,
          fontWeight: 800,
          color: C.text,
          opacity: s.equals,
          transform: `scale(${0.6 + 0.4 * s.equals})`,
        }}
      >
        =
      </div>
      {s.robots.map((r, i) => (
        <Robot key={i} name={r.name} x={xs[i]} y={robotY} size={size} appear={r.appear} labelSize={44} />
      ))}
      {s.papers.map((q, i) =>
        q.appear > 0 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: opusC.x - 40 + q.x,
              top: opusC.y - 52 + q.y,
              width: 80,
              height: 104,
              borderRadius: 6,
              background: C.text,
              boxShadow: `0 8px 18px ${alpha(C.bg0, 0.5)}`,
              opacity: q.appear,
              transform: `rotate(${q.rot}deg) scale(${0.4 + 0.6 * q.travel})`,
              padding: '14px 12px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
            }}
          >
            {[48, 40, 52, 30].map((w, k) => (
              <div key={k} style={{ width: w, height: 6, borderRadius: 3, background: alpha(C.muted, 0.8) }} />
            ))}
          </div>
        ) : null,
      )}
    </>
  );
};

/** Part 3's core picture: my real requests, seven robots, my correction notes as the measure. */
export const TaskBench: React.FC<AnimProps & TaskBenchProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const box = stageOf(p.vertical);
  const scale = p.vertical ? 1 : Math.min(box.w / BOX.w, box.h / BOX.h);
  const left = (box.w - BOX.w * scale) / 2;
  const top = p.vertical ? SAFE_TOP - box.top : (box.h - BOX.h * scale) / 2;
  return (
    <Stage vertical={p.vertical} fill>
      <div style={{ position: 'absolute', left, top, width: BOX.w, height: BOX.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        {s.mode === 'setup' && <Setup s={s} />}
        {s.mode === 'judges' && <Judges s={s} />}
        {s.mode === 'piles' && <Piles s={s} />}
        {s.mode === 'pair' && <Pair s={s} />}
      </div>
    </Stage>
  );
};
