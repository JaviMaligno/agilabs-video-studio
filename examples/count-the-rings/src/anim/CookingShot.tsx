import React, { useMemo } from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tokensOf } from '../captions.ts';
import { ZOOM_ORIGIN, COVER } from '../data/cookingRings.ts';
import type { Line } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, rand, type CookingProps, type CookRing } from './CookingShot.state.ts';
import { frameState as panState } from './RingPan.state.ts';
import { PanArt } from './PanArt.tsx';
import { WARM } from './warm.ts';

export { frameState };
export type { CookingProps };

const SRC = {
  empty: staticFile('cooking/pan-empty.png'),
  raw: staticFile('cooking/rings-raw.png'),
  seared: staticFile('cooking/rings-seared.png'),
};
const FRAME: React.CSSProperties = { position: 'absolute', left: COVER.x, top: COVER.y, width: 1024 * COVER.scale, height: 1536 * COVER.scale, maxWidth: 'none' };

/** The raw frame shown only through one ring's mask, scaled about the ring (the drop). */
const RingLayer: React.FC<{ g: CookRing; big: boolean }> = ({ g, big }) => {
  if (g.reveal <= 0) return null;
  // Element coordinates: the frame image starts at x = COVER.x.
  const ex = g.x - COVER.x;
  const ey = g.y - COVER.y;
  const o = g.ro + 8;
  // The big ring keeps its hole out of the mask, so the nested ring lands on its own.
  const mask = big
    ? `radial-gradient(circle at ${ex}px ${ey}px, transparent ${g.ri - 4}px, #000 ${g.ri + 6}px, #000 ${o}px, transparent ${o + 12}px)`
    : `radial-gradient(circle at ${ex}px ${ey}px, transparent ${g.ri * 0.7}px, #000 ${g.ri * 0.9}px, #000 ${o}px, transparent ${o + 12}px)`;
  return (
    <Img
      src={SRC.raw}
      style={{
        ...FRAME,
        opacity: g.reveal,
        transform: `scale(${g.scale})`,
        transformOrigin: `${ex}px ${ey}px`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
};

/** Sizzle, sparks, ripples and steam over the photo (video px, inside the push-in). */
const Effects: React.FC<{ rings: CookRing[]; t: number; steam: number; sizzle: number }> = ({ rings, t, steam, sizzle }) => {
  const tick = Math.floor(t * 10);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {rings.map((g, i) =>
        g.height > 0.02 && g.reveal > 0 ? (
          <circle key={`sh${i}`} cx={g.x + 14 * g.height} cy={g.y + 22 * g.height} r={g.ro * (1 + 0.1 * g.height)} fill="#000" opacity={0.25 * g.reveal} style={{ filter: `blur(${6 + 18 * g.height}px)` }} />
        ) : null,
      )}
      {/* Bubbles hugging each ring's edges, re-seeded ten times a second. */}
      {sizzle > 0 &&
        rings.flatMap((g, i) =>
          g.reveal < 1
            ? []
            : Array.from({ length: 16 }, (_, k) => {
                const a = rand(i * 97 + k, tick) * 2 * Math.PI;
                const inner = k % 3 === 0;
                const rr = (inner ? g.ri - 4 : g.ro + 4) + (rand(k, tick + 7) - 0.5) * 10;
                return (
                  <circle
                    key={`b${i}-${k}`}
                    cx={g.x + Math.cos(a) * rr}
                    cy={g.y + Math.sin(a) * rr}
                    r={1.5 + 3 * rand(k + 3, tick + i)}
                    fill="#fff6e0"
                    opacity={sizzle * (0.35 + 0.55 * rand(k + 11, tick))}
                  />
                );
              }),
        )}
      {rings.map((g, i) =>
        g.ripple > 0 ? (
          <circle key={`rp${i}`} cx={g.x} cy={g.y} r={g.ro + 4 + 46 * g.ripple} fill="none" stroke="#ffe2b0" strokeWidth={14 * (1 - g.ripple) + 2} opacity={0.32 * (1 - g.ripple)} style={{ filter: 'blur(5px)' }} />
        ) : null,
      )}
      {rings.flatMap((g, i) =>
        g.spark > 0
          ? Array.from({ length: 9 }, (_, k) => {
              const a = (k / 9) * 2 * Math.PI + i;
              const d = g.ro + 10 + (50 + 50 * rand(i, k)) * Math.sqrt(g.spark);
              return <circle key={`sp${i}-${k}`} cx={g.x + Math.cos(a) * d} cy={g.y + Math.sin(a) * d} r={2 + 5 * (1 - g.spark)} fill={k % 2 ? WARM.amber : WARM.ember} opacity={1 - g.spark} />;
            })
          : [],
      )}
      {/* Steam wisps rising off the pan. */}
      <g style={{ filter: 'blur(22px)' }}>
        {steam > 0 &&
          Array.from({ length: 16 }, (_, k) => {
            const period = 2.4 + 1.2 * rand(k, 1);
            const u = ((t + period * rand(k, 2)) % period) / period;
            const host = rings[k % rings.length];
            const x = host.x + (rand(k, 3) - 0.5) * host.ro * 1.6 + 40 * Math.sin(u * 3 + k);
            const y = host.y - 30 - 300 * u;
            return <circle key={`st${k}`} cx={x} cy={y} r={30 + 70 * u} fill="#ffffff" opacity={steam * 0.16 * Math.sin(Math.PI * u)} />;
          })}
      </g>
    </svg>
  );
};

/** Self-captioning text: each word fills with light from left to right as it is spoken. */
const SweepText: React.FC<{ line: Line; t: number; opacity: number; out: number; emphasis: CookingProps['emphasis']; lang: AnimProps['lang'] }> = ({
  line,
  t,
  opacity,
  out,
  emphasis,
  lang,
}) => {
  const tokens = useMemo(() => tokensOf(line, lang), [line, lang]);
  if (opacity <= 0) return null;
  const toneOf = (w: string) => {
    const key = w.toLowerCase().replace(/[^\p{L}]/gu, '');
    const e = emphasis?.find((x) => x.word.toLowerCase() === key);
    return e ? (e.tone === 'warm' ? WARM.amber : C.accentText) : C.text;
  };
  const o = -20 + 140 * out;
  const fade = out > 0 ? `linear-gradient(90deg, transparent ${o - 20}%, #000 ${o + 20}%)` : undefined;
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: 420,
        minHeight: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily,
        fontSize: 76,
        fontWeight: 800,
        lineHeight: 1.12,
        letterSpacing: '-0.02em',
        opacity,
        maskImage: fade,
        WebkitMaskImage: fade,
        filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.85))',
      }}
    >
      <div>
        {tokens.map((tok, i) => {
          const lit = Math.min(1, Math.max(0, (t - tok.start) / Math.max(0.14, tok.end - tok.start)));
          const pct = -15 + 130 * lit;
          const col = toneOf(tok.text);
          return (
            <React.Fragment key={i}>
              {i > 0 ? ' ' : null}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${col} ${pct - 15}%, ${alpha('#ffffff', 0.32)} ${pct + 15}%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {tok.text}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/** The photoreal pan: the raw rings drop in and sear (hook), or finish browning (finish). */
export const CookingShot: React.FC<AnimProps & CookingProps & { lines?: Line[] }> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const match = useMemo(() => panState({ mode: 'split' }, 0, [10, 20], 30), []);
  const lines = p.lines ?? [];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - 0.85 * s.dim, filter: `brightness(${1 - 0.7 * s.dim}) saturate(${1 - 0.8 * s.dim})` }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${s.zoom})`, transformOrigin: `${ZOOM_ORIGIN.x}px ${ZOOM_ORIGIN.y}px` }}>
          <Img src={SRC.empty} style={FRAME} />
          {s.rings.map((g, i) => (
            <RingLayer key={g.id} g={g} big={g.id === 'big'} />
          ))}
          <Img src={SRC.raw} style={{ ...FRAME, opacity: s.rawFull }} />
          <Img src={SRC.seared} style={{ ...FRAME, opacity: s.brown }} />
          <Effects rings={s.rings} t={p.t} steam={s.steam} sizzle={s.sizzle} />
        </div>
        {/* Scrims: top for the badge, bottom for the text. */}
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${alpha(C.bg0, 0.75)} 0%, transparent 16%, transparent 58%, ${alpha(C.bg0, 0.88)} 82%)` }} />
      </AbsoluteFill>
      {s.match > 0 && <PanArt s={match} hideDials={p.mode === 'finish'} opacity={s.match} />}
      {s.chip > 0 && (
        <div style={{ position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: s.chip, fontFamily }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '12px 30px', borderRadius: 40, background: alpha(C.bg0, 0.7), border: `1px solid ${alpha('#ffffff', 0.14)}` }}>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '0.12em', color: C.accentText }}>RINGS</span>
            <span style={{ fontSize: 48, fontWeight: 800, color: C.text }}>?</span>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '0.12em', color: WARM.amber }}>SEARED</span>
          </div>
        </div>
      )}
      {lines.map((line, i) => (
        <SweepText key={line.key} line={line} t={p.t} opacity={s.text[i]?.opacity ?? 0} out={s.text[i]?.out ?? 0} emphasis={p.emphasis} lang={p.lang} />
      ))}
    </AbsoluteFill>
  );
};
