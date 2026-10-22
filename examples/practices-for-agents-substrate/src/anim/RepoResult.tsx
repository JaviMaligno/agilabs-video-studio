import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { MONO } from './pieces.tsx';
import { BASELINE, FILE_TILES, GIVEN_BACK, LARGE_BARS, NAMES, SMALL_BARS, frameState, type RepoResultProps } from './RepoResult.state.ts';

export { frameState };
export type { RepoResultProps };

const CLEAN = alpha(C.accentText, 0.8);

const Kicker: React.FC<{ top: number; children: React.ReactNode; color?: string; left?: number }> = ({ top, children, color = C.muted, left = 60 }) => (
  <div style={{ position: 'absolute', left, top, fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>{children}</div>
);

/** One horizontal bar: label inside the track, value after it. */
const Bar: React.FC<{ top: number; h: number; label: string; value: number; display: string; grow: number; color: string; valueSize: number; trackW?: number }> = ({
  top,
  h,
  label,
  value,
  display,
  grow,
  color,
  valueSize,
  trackW = 760,
}) => (
  <div style={{ position: 'absolute', left: 60, top, width: 960, height: h }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: trackW, height: h, borderRadius: h / 2, background: alpha(C.muted, 0.13) }} />
    <div style={{ position: 'absolute', left: 0, top: 0, width: Math.max(0, (trackW * value * grow) / 100), height: h, borderRadius: h / 2, background: color }} />
    <div style={{ position: 'absolute', left: 28, top: 0, height: h, display: 'flex', alignItems: 'center', fontSize: 36, fontWeight: 800, color: C.text, opacity: Math.min(1, grow * 2) }}>{label}</div>
    <div style={{ position: 'absolute', left: trackW + 20, top: 0, height: h, display: 'flex', alignItems: 'center', fontSize: valueSize, fontWeight: 800, color: C.text, opacity: grow }}>{display}</div>
  </div>
);

const Pill: React.FC<{ text: string; color: string; pop: number; style?: React.CSSProperties }> = ({ text, color, pop, style }) => (
  <div style={{ position: 'absolute', padding: '6px 22px', borderRadius: 30, border: `4px solid ${color}`, color, fontSize: 34, fontWeight: 800, opacity: pop, transform: `scale(${1.3 - 0.3 * pop})`, ...style }}>{text}</div>
);

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [1, 6], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7], [4, 8], [5, 9], [6, 9], [6, 10], [7, 11], [8, 9], [9, 10], [10, 11], [0, 5], [2, 7], [5, 10], [3, 6], [8, 5],
];
const FOCUS = new Set([1, 6, 9]);
const W = { x0: 80, dx: 240, y0: 500, dy: 108, w: 196, h: 80 };
const webXY = (i: number) => ({ x: W.x0 + (i % 4) * W.dx, y: W.y0 + Math.floor(i / 4) * W.dy });

const FileTile: React.FC<{ x: number; y: number; w: number; h: number; pop: number; hot?: number; seed: number }> = ({ x, y, w, h, pop, hot = 0, seed }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 12,
      background: C.card,
      border: `3px solid ${hot > 0 ? alpha(C.warm, 0.4 + 0.6 * hot) : alpha(C.muted, 0.45)}`,
      boxShadow: hot > 0 ? `0 0 ${28 * hot}px ${alpha(C.warm, 0.6 * hot)}` : 'none',
      opacity: pop,
      transform: `scale(${0.6 + 0.4 * pop})`,
      boxSizing: 'border-box',
      padding: '14px 16px',
    }}
  >
    {[0, 1, 2].map((k) => (
      <div key={k} style={{ height: 8, marginBottom: 12, width: `${[80, 55, 68][(seed + k) % 3]}%`, borderRadius: 4, background: alpha(C.muted, 0.55) }} />
    ))}
  </div>
);

export const RepoResult: React.FC<AnimProps & RepoResultProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const mode = p.mode;

  if (mode === 'small') {
    return (
      <AbsoluteFill style={{ fontFamily, color: C.text }}>
        <div style={{ opacity: s.files.opacity }}>
          <Kicker top={440}>python-stdnum · tax-number validators</Kicker>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <FileTile key={i} x={70 + i * 158} y={500} w={128} h={80} pop={s.files.tiles[i]} seed={i} />
          ))}
        </div>
        <div style={{ opacity: s.bars.opacity }}>
          {[0, 1].map((g) => (
            <React.Fragment key={g}>
              <Kicker top={650 + g * 260} color={g === 0 ? C.text : C.muted}>
                {SMALL_BARS[g * 2].group}
              </Kicker>
              <Pill text="n.s." color={C.muted} pop={s.bars.ns} style={{ left: 880, top: 640 + g * 260 }} />
              {[0, 1].map((k) => {
                const b = SMALL_BARS[g * 2 + k];
                return <Bar key={k} top={700 + g * 260 + k * 92} h={76} label={b.label} value={b.value} display={b.display} grow={s.bars.grow[g * 2 + k]} color={b.dirty ? C.warm : CLEAN} valueSize={g === 0 ? 62 : 52} />;
              })}
            </React.Fragment>
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  if (mode === 'large' || mode === 'split') {
    const top = 880 - 420 * s.lift;
    return (
      <AbsoluteFill style={{ fontFamily, color: C.text }}>
        <div style={{ opacity: s.files.opacity }}>
          <Kicker top={440}>pint · physical units</Kicker>
          <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: s.files.links }}>
            {LINKS.map(([a, b], i) => {
              const A = webXY(a);
              const B = webXY(b);
              const hot = FOCUS.has(a) && FOCUS.has(b) ? s.files.focus : 0;
              return (
                <line key={i} x1={A.x + W.w / 2} y1={A.y + W.h / 2} x2={B.x + W.w / 2} y2={B.y + W.h / 2} stroke={hot > 0 ? alpha(C.warm, 0.35 + 0.65 * hot) : alpha(C.accentText, 0.35)} strokeWidth={hot > 0 ? 3 + 4 * hot : 3} />
              );
            })}
          </svg>
          {Array.from({ length: FILE_TILES }, (_, i) => {
            const { x, y } = webXY(i);
            return <FileTile key={i} x={x} y={y} w={W.w} h={W.h} pop={s.files.tiles[i]} hot={FOCUS.has(i) ? s.files.focus : 0} seed={i} />;
          })}
        </div>
        <div style={{ opacity: s.bars.opacity }}>
          {LARGE_BARS.map((b, k) => (
            <Bar key={k} top={top + k * 126} h={100} label={b.label} value={b.value} display={b.display} grow={s.bars.grow[k]} color={b.dirty ? C.marker : CLEAN} valueSize={76} />
          ))}
          <Pill text="p<0.001" color={C.marker} pop={s.bars.ns} style={{ left: 60, top: top + 252 }} />
        </div>
        {mode === 'split' && (
          <>
            {[
              { kicker: "how it's written, alone", main: 'costs almost as much', color: C.warm, dashed: false },
              { kicker: 'where to look, alone', main: "can't tell from noise", color: C.muted, dashed: true },
            ].map((tile, i) => {
              const pop = s.tiles.pop[i];
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 60,
                    top: 820 + i * 240,
                    width: 960,
                    height: 210,
                    borderRadius: 24,
                    background: alpha(tile.color, 0.08),
                    border: `5px ${tile.dashed ? 'dashed' : 'solid'} ${tile.color}`,
                    boxSizing: 'border-box',
                    padding: '26px 40px',
                    opacity: pop,
                    transform: `translateY(${(1 - pop) * 30}px)`,
                  }}
                >
                  <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: tile.color }}>{tile.kicker}</div>
                  <div style={{ fontSize: 64, fontWeight: 800, marginTop: 14, color: i === 0 ? C.text : alpha(C.text, 0.8) }}>{tile.main}</div>
                </div>
              );
            })}
          </>
        )}
      </AbsoluteFill>
    );
  }

  // names
  const TRACK = { x: 410, w: 500 };
  const baseX = TRACK.x + (TRACK.w * BASELINE) / 100;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text, opacity: s.names.opacity }}>
      <div style={{ position: 'absolute', left: 60, top: 446, fontSize: 36, fontWeight: 700, color: C.muted }}>given back to destroyed code</div>
      <div style={{ position: 'absolute', left: 640, top: 436, width: 380, height: 62, borderRadius: 14, background: C.card, border: `3px solid ${alpha(C.muted, 0.4)}`, fontFamily: MONO, fontSize: 36, boxSizing: 'border-box' }}>
        <span style={{ position: 'absolute', left: 24, top: 8, color: C.warm, opacity: 1 - s.names.rename }}>def f1(a1):</span>
        <span style={{ position: 'absolute', left: 24, top: 8, color: C.ok, opacity: s.names.rename }}>def parse_vat(</span>
      </div>
      {GIVEN_BACK.map((b, i) => {
        const top = 520 + i * 90;
        const names = i === NAMES;
        const g = s.names.grow[i];
        const hl = names ? s.names.highlight : 0;
        return (
          <div key={b.label} style={{ position: 'absolute', left: 0, top, width: 1080, height: 70 }}>
            <div style={{ position: 'absolute', left: 60, width: TRACK.x - 90, top: 0, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 36, fontWeight: 800, color: names ? alpha(C.text, 0.75 + 0.25 * hl) : C.muted }}>
              {b.label}
            </div>
            <div style={{ position: 'absolute', left: TRACK.x, top: 8, width: TRACK.w, height: 54, borderRadius: 27, background: alpha(C.muted, 0.12) }} />
            <div style={{ position: 'absolute', left: TRACK.x, top: 8, width: (TRACK.w * b.value * g) / 100, height: 54, borderRadius: 27, background: names ? GRADIENT : alpha(C.muted, 0.5), boxShadow: names ? `0 0 ${36 * hl}px ${alpha(C.accent2, 0.8 * hl)}` : 'none' }} />
            <div style={{ position: 'absolute', left: TRACK.x + TRACK.w + 16, top: 0, height: 70, display: 'flex', alignItems: 'center', fontSize: names ? 50 : 40, fontWeight: 800, color: names ? C.text : C.muted, opacity: g }}>{`${b.value}%`}</div>
          </div>
        );
      })}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: s.names.baseline }}>
        <line x1={baseX} y1={506} x2={baseX} y2={1250} stroke={C.text} strokeWidth={4} strokeDasharray="12 10" />
      </svg>
      <div style={{ position: 'absolute', left: baseX - 160, width: 320, top: 1256, textAlign: 'center', fontSize: 36, fontWeight: 800, color: C.text, opacity: s.names.baseline }}>baseline 83%</div>
    </AbsoluteFill>
  );
};
