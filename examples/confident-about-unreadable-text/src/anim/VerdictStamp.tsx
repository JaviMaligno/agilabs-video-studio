import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, JUDGE_LABELS, type FilterState, type HollowState, type JudgeState, type LineupState, type VerdictProps } from './VerdictStamp.state.ts';
import { Stage, gradientText, stageOf } from './Stage.tsx';
import { Card, Chip, GlyphLine, Pill } from './pieces.tsx';
import { morph } from './glyphs.ts';
import { Banana, FilterGate, NoiseBar, NoiseWindow, RedactedBar, SealedCard, Stamp, StampTool } from './stampPieces.tsx';
import ciphers from '../data/ciphers.json';

export { frameState };
export type { VerdictProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** The base64 hook string and its decoding, two rows each (22 slots). */
const B64 = ciphers.ciphers.base64;
export const B64_ROWS = [B64.slice(0, 22), B64.slice(22)];
export const PLAIN_ROWS = ['reply with the single', 'word banana'].map((r) => r.padEnd(22, ' '));
/** Base model's "stamp": a flawless line of binary (re-encoded stock text, illustrative). */
const CODE_STAMP = ciphers.mimic.binary.split(' ').slice(0, 2).join(' ');

// ---------- filter (hook) ----------
const F = { winTop: 0, winH: 176, cardTop0: 30, cardTop: 236, cardH: 240, cardW: 820, gateTop: 560, chipTop: 930 };

const Filter: React.FC<{ s: FilterState; t: number; W: number }> = ({ s, t, W }) => {
  const cardTop = lerp(F.cardTop0, F.cardTop, s.card.slide);
  const cardX = (W - F.cardW) / 2;
  const rows = B64_ROWS.map((r, i) => morph(r, PLAIN_ROWS[i], s.reveal, t, 0.6, 5 + i));
  const shakeX = s.card.shake * 14;
  return (
    <>
      {/* What the filter sees: noise, before and after the reveal. */}
      <div style={{ position: 'absolute', left: (W - 640) / 2, top: F.winTop, opacity: s.window.appear, transform: `translateY(${(1 - s.window.appear) * -20}px)` }}>
        <NoiseWindow w={640} h={F.winH} t={t} label="what the filter sees" rows={2} cols={17} seed={2} size={44} />
      </div>
      {/* The card */}
      <div style={{ position: 'absolute', left: cardX + shakeX, top: cardTop }}>
        <Card w={F.cardW} h={F.cardH} glow={s.reveal > 0.95 ? 0.4 : 0}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 34 }}>
            {rows.map((g, i) => (
              <GlyphLine key={i} glyphs={g} size={52} weight={s.reveal > 0.5 ? 700 : 600} />
            ))}
          </div>
        </Card>
      </div>
      {/* The stamp, on the card's top edge so the text stays readable under it. */}
      <div style={{ position: 'absolute', left: 0, width: W, top: cardTop - 58, display: 'flex', justifyContent: 'center', transform: `translateX(${shakeX - 40}px)` }}>
        <div style={{ transform: `scale(${1 + 0.08 * s.stamp.pulse})` }}>
          <Stamp label="self-harm · medium" size={50} rot={-6} s={s.stamp} />
        </div>
      </div>
      <div style={{ position: 'absolute', right: 6, top: cardTop - 76, opacity: s.http.pop, transform: `scale(${0.7 + 0.3 * s.http.pop}) rotate(4deg)` }}>
        <Pill size={30} outline>
          HTTP 400
        </Pill>
      </div>
      {/* The banana it was asking for */}
      <div style={{ position: 'absolute', left: cardX + F.cardW - 130, top: cardTop + F.cardH - 110, opacity: s.banana.pop, transform: `scale(${0.4 + 0.6 * s.banana.pop}) rotate(${(1 - s.banana.pop) * -40}deg)` }}>
        <Banana size={170} />
      </div>
      {/* The gate in front of GPT-5 */}
      <div style={{ position: 'absolute', left: (W - 520) / 2, top: F.gateTop, opacity: s.gate.appear }}>
        <FilterGate w={520} t={t} flash={s.gate.flash} post={F.chipTop - F.gateTop - 64 - 10} />
      </div>
      <div style={{ opacity: s.chip.appear }}>
        <Chip x={(W - 260) / 2} y={F.chipTop} w={260} h={120} label={['GPT-5']} muted dim={0.3} size={46} />
      </div>
      {/* "unknown": the verdict it did not give */}
      <div style={{ position: 'absolute', left: 30, top: F.gateTop + 120, opacity: s.ghost.opacity, transform: `translateY(${(1 - s.ghost.appear) * 20}px)` }}>
        <Stamp label="unknown" size={48} rot={-4} tone="muted" dashed />
      </div>
      {/* The filter's own verdict, as the article prints it */}
      <div
        style={{
          position: 'absolute',
          left: (W - 860) / 2,
          top: F.gateTop + 110,
          width: 860,
          padding: '22px 30px',
          boxSizing: 'border-box',
          borderRadius: 22,
          background: alpha(C.bg0, 0.94),
          border: `2px solid ${alpha(C.accentText, 0.5)}`,
          fontSize: 34,
          fontWeight: 600,
          lineHeight: 1.5,
          fontVariantNumeric: 'tabular-nums',
          opacity: s.panel.appear,
          transform: `translateY(${(1 - s.panel.appear) * 40}px)`,
        }}
      >
        <div style={{ color: C.muted }}>
          jailbreak: <span style={{ color: C.text }}>detected</span>
        </div>
        <div style={{ color: C.muted }}>
          self_harm: <span style={{ ...gradientText, fontWeight: 800 }}>filtered, medium</span>
        </div>
        <div style={{ color: C.muted }}>
          hate / sexual / violence: <span style={{ color: C.text }}>safe</span>
        </div>
      </div>
    </>
  );
};

// ---------- lineup ----------
const STATIONS = [
  { name: 'safety filter', stamp: 'self-harm', mono: false },
  { name: 'LLM judge', stamp: 'garbled', mono: false },
  { name: 'base model', stamp: CODE_STAMP, mono: true },
];
const SW = 290;
const sx = (i: number) => i * (SW + 45);

const Inspector: React.FC<{ i: number; t: number; w: number }> = ({ i, t, w }) => {
  if (i === 0) return <FilterGate w={w - 50} h={52} t={t} label="filter" />;
  if (i === 1) return <StampTool size={130} />;
  return <Chip x={0} y={0} w={w - 50} h={104} label={['Qwen-7B', 'Base']} size={30} />;
};

const Lineup: React.FC<{ s: LineupState; t: number; W: number }> = ({ s, t, W }) => (
  <>
    {STATIONS.map((st, i) => {
      const a = s.stations[i];
      return (
        <div key={i} style={{ position: 'absolute', left: sx(i), top: 0, width: SW, height: 820, opacity: a.appear, transform: `translateY(${(1 - a.appear) * 30}px)` }}>
          <div style={{ position: 'absolute', top: 40, left: 0 }}>
            <NoiseWindow w={SW} h={150} t={t} rows={2} cols={8} seed={10 + i} size={36} />
          </div>
          <div style={{ position: 'absolute', top: 270, left: 0, width: SW, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative', width: i === 1 ? 130 : SW - 50, height: i === 0 ? 52 : i === 1 ? 136 : 104 }}>
              <Inspector i={i} t={t} w={SW} />
            </div>
          </div>
          <div style={{ position: 'absolute', top: 440, width: SW, textAlign: 'center', fontSize: 36, fontWeight: 800 }}>{st.name}</div>
          <div style={{ position: 'absolute', top: 520, left: 0 }}>
            <div style={{ transform: `translateX(${a.stamp.shake * 10}px)` }}>
              <NoiseBar w={SW} h={200} t={t} seed={20 + i} cols={8} rows={3} size={34} />
            </div>
          </div>
          <div style={{ position: 'absolute', top: 580, left: 0, width: SW, display: 'flex', justifyContent: 'center' }}>
            <Stamp label={st.stamp} size={st.mono ? 26 : 36} rot={-9} s={a.stamp} mono={st.mono} />
          </div>
        </div>
      );
    })}
    <div style={{ position: 'absolute', top: 820, left: 0, width: W, textAlign: 'center', opacity: s.head.pop, transform: `scale(${0.85 + 0.15 * s.head.pop})`, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08 }}>
      <div style={{ fontSize: 70 }}>Confident about text</div>
      <div style={{ fontSize: 84, ...gradientText }}>they can't read</div>
    </div>
  </>
);

// ---------- judge ----------
const CLAIM = ['“a cipher doesn’t unlock', 'a refused request,', 'it defuses it”'];
const J = { thumbTop: 0, claimTop: 170, winTop: 520, toolTop: 650, laneY: 690 };

const Judge: React.FC<{ s: JudgeState; t: number; W: number }> = ({ s, t, W }) => {
  const jx = W / 2;
  return (
    <>
      {/* The previous post */}
      <div style={{ position: 'absolute', left: 0, top: J.thumbTop, width: W, opacity: s.thumb.appear, transform: `translateY(${(1 - s.thumb.appear) * -20}px)` }}>
        <Card w={W} h={140} style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0 34px', boxSizing: 'border-box', gap: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>my last post</div>
          <div style={{ fontSize: 36, fontWeight: 700, whiteSpace: 'nowrap' }}>Teaching a Model a Language You Just Invented</div>
        </Card>
      </div>
      {/* Its conclusion, struck through */}
      <div style={{ position: 'absolute', left: 0, top: J.claimTop, width: W, opacity: s.claim.appear, transform: `translateY(${(1 - s.claim.appear) * 24}px)` }}>
        {CLAIM.map((l, i) => {
          const strike = Math.min(1, Math.max(0, s.claim.strike * CLAIM.length - i));
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'center', marginTop: i ? 4 : 18 }}>
              <span style={{ position: 'relative', fontSize: 58, fontWeight: 800, letterSpacing: '-0.01em', color: alpha(C.text, 1 - 0.45 * s.claim.strike) }}>
                {l}
                <span style={{ position: 'absolute', left: -8, top: '52%', height: 9, width: `calc(${strike * 100}% + 16px)`, borderRadius: 5, background: C.accentText, boxShadow: `0 0 16px ${alpha(C.accent, 0.8)}` }} />
              </span>
            </div>
          );
        })}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18, opacity: s.claim.tag }}>
          <Pill size={32}>didn’t survive the full run</Pill>
        </div>
      </div>
      {/* The judge and its stream */}
      <div style={{ position: 'absolute', inset: 0, opacity: s.stream.opacity }}>
        <div style={{ position: 'absolute', left: jx - 170, top: J.winTop, opacity: s.judge.appear }}>
          <NoiseWindow w={340} h={110} t={t} label="what the judge sees" rows={1} cols={10} seed={7} size={36} />
        </div>
        <div style={{ position: 'absolute', left: jx - 65, top: J.toolTop, opacity: s.judge.appear }}>
          <StampTool size={130} press={s.judge.press} lit={s.judge.press} />
        </div>
        <div style={{ position: 'absolute', left: jx - 150, width: 300, top: J.toolTop + 150, textAlign: 'center', fontSize: 34, fontWeight: 800, opacity: s.judge.appear }}>LLM judge</div>
        {s.items.map((it, k) => {
          if (it.opacity <= 0) return null;
          const inX = lerp(10, jx - 110, it.fly);
          return (
            <React.Fragment key={k}>
              {it.fly < 1 && (
                <div style={{ position: 'absolute', left: inX, top: J.laneY, opacity: it.opacity, transform: `scale(${lerp(1, 0.55, it.fly)})`, transformOrigin: 'left center' }}>
                  <SealedCard w={220} h={150} tag="in cipher" />
                </div>
              )}
              {it.out > 0 && (
                <div style={{ position: 'absolute', left: lerp(jx - 60, W - 260, it.out), top: J.laneY + 4, opacity: it.opacity * it.out, transform: `translateX(${it.stamp.shake * 10}px)` }}>
                  <RedactedBar w={250} h={140} lines={3} />
                  <div style={{ position: 'absolute', left: 0, top: 40, width: 250, display: 'flex', justifyContent: 'center' }}>
                    <Stamp label={JUDGE_LABELS[it.label]} size={34} rot={-10} s={it.stamp} />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div style={{ position: 'absolute', left: 0, width: 260, top: J.laneY + 176, textAlign: 'center', fontSize: 28, fontWeight: 700, color: C.muted, opacity: s.judge.appear }}>
          harmful requests
          <div style={{ fontSize: 24 }}>(sealed, never shown)</div>
        </div>
        <div style={{ position: 'absolute', right: 0, width: 260, top: J.laneY + 176, textAlign: 'center', fontSize: 28, fontWeight: 700, color: C.muted, opacity: s.judge.appear }}>
          replies
        </div>
      </div>
    </>
  );
};

// ---------- hollow (the verdict) ----------
const HOLLOW = [
  { name: 'safety filter', label: ['self-harm', 'medium'], mono: false, size: 40 },
  { name: 'LLM judge', label: ['garbled'], mono: false, size: 44 },
  { name: 'base model', label: ciphers.mimic.binary.split(' ').slice(0, 4).reduce<string[]>((a, w, i) => (i % 2 ? [...a.slice(0, -1), `${a.at(-1)} ${w}`] : [...a, w]), []), mono: true, size: 26 },
];

const Hollow: React.FC<{ s: HollowState; t: number; W: number }> = ({ s, t, W }) => (
  <>
    <div style={{ position: 'absolute', top: 30, left: 0, width: W, textAlign: 'center', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
      <div style={{ fontSize: 64, opacity: s.head.form, transform: `translateY(${(1 - s.head.form) * 20}px)` }}>The form of a judgement</div>
      <div style={{ fontSize: 76, opacity: s.head.none, transform: `scale(${0.85 + 0.15 * s.head.none})`, ...gradientText }}>none of the content</div>
    </div>
    {HOLLOW.map((h, i) => {
      const c = s.cards[i];
      return (
        <div key={i} style={{ position: 'absolute', left: sx(i), top: 330, width: SW, opacity: c.appear, transform: `translateY(${(1 - c.appear) * 30}px)` }}>
          <NoiseBar w={SW} h={380} t={t} seed={40 + i} cols={8} rows={6} size={34} style={{ opacity: 0.55 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: SW, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stamp label={h.label} size={h.size} rot={-9} fill={c.fill} mono={h.mono} />
          </div>
          <div style={{ marginTop: 22, textAlign: 'center', fontSize: 34, fontWeight: 800 }}>{h.name}</div>
        </div>
      );
    })}
  </>
);

export const VerdictStamp: React.FC<AnimProps & VerdictProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const { w: W } = stageOf(vertical);
  return (
    <Stage vertical={vertical} fill>
      {s.mode === 'filter' && <Filter s={s} t={t} W={W} />}
      {s.mode === 'lineup' && <Lineup s={s} t={t} W={W} />}
      {s.mode === 'judge' && <Judge s={s} t={t} W={W} />}
      {s.mode === 'hollow' && <Hollow s={s} t={t} W={W} />}
    </Stage>
  );
};
