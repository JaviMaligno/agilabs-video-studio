import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, KEYED, TURNS, type CipherProps, type BreakState, type LadderState, type RosettaState, type ScrambleState } from './CipherCard.state.ts';
import { Stage, gradientText, stageOf } from './Stage.tsx';
import { Card, Chip, CHIP, chipCx, chipX, GlyphLine, Pill, SLOT, Wall } from './pieces.tsx';
import { MODELS } from './RefusalGate.state.ts';
import type { CipherData } from './glyphs.ts';
import ciphers from '../data/ciphers.json';

export { frameState };
export type { CipherProps };

const DATA = ciphers as unknown as CipherData;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- scramble (the hook) ----------
const HOOK = { cardTop: 250, cardH: 150, chipTop: 840, wallH: 250 };

const Scramble: React.FC<{ s: ScrambleState; W: number }> = ({ s, W }) => {
  const cardW = 920;
  const pair = { x: chipX(0) - 4, w: chipX(1) + CHIP.w + 8 - chipX(0), cx: (chipCx(0) + chipCx(1)) / 2 };
  const wallBottom = HOOK.chipTop - 14;
  const wallTop = wallBottom - HOOK.wallH * s.wall.appear;
  const from = { x: W / 2, y: HOOK.cardTop + HOOK.cardH / 2 };
  const to = { x: pair.cx, y: wallTop + 10 };
  const cx = lerp(from.x, to.x, s.fly);
  const cy = lerp(from.y, to.y, s.fly);
  const flying = s.fly > 0 && s.fly < 1;
  return (
    <>
      {/* Headline: the hook, readable on the first frame. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 10, textAlign: 'center', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        <div style={{ fontSize: 76 }}>2 of my 5 models</div>
        <div style={{ fontSize: 92, ...gradientText }}>refuse to play</div>
      </div>
      <Wall x={pair.x} bottom={wallBottom} w={pair.w} height={HOOK.wallH * s.wall.appear} flash={s.wall.flash} />
      {MODELS.map((m, i) => (
        <Chip key={m.id} x={chipX(i)} y={HOOK.chipTop} label={m.label} muted={i >= 2} dim={i >= 2 ? 0.35 : 0} />
      ))}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: chipX(i),
            width: CHIP.w,
            top: HOOK.chipTop + CHIP.h + 18,
            display: 'flex',
            justifyContent: 'center',
            opacity: s.chips.refused,
            transform: `translateY(${(1 - s.chips.refused) * 16}px)`,
          }}
        >
          <Pill size={28} outline>
            refuses
          </Pill>
        </div>
      ))}
      {/* The card: at its spot, flying, or returned after the shatter. */}
      <div
        style={{
          position: 'absolute',
          left: cx - cardW / 2,
          top: cy - HOOK.cardH / 2,
          transform: `scale(${s.scale}) rotate(${flying ? s.fly * -6 : 0}deg)`,
          opacity: s.opacity,
        }}
      >
        <Card w={cardW} h={HOOK.cardH} glow={flying ? s.fly : 0}>
          <GlyphLine glyphs={s.glyphs} size={56} />
        </Card>
      </div>
      {s.fragments.map((f, i) =>
        f.opacity > 0 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: to.x + f.dx - 20,
              top: to.y + f.dy - 30,
              width: 40,
              textAlign: 'center',
              fontSize: 40,
              fontWeight: 700,
              color: i % 3 ? C.text : C.accentText,
              opacity: f.opacity,
              transform: `rotate(${f.rot}deg)`,
            }}
          >
            {f.ch}
          </div>
        ) : null,
      )}
    </>
  );
};

// ---------- ladder ----------
const Ladder: React.FC<{ s: LadderState; W: number; H: number }> = ({ s, W, H }) => {
  const headH = 104;
  const top = headH + 30;
  const rowH = (H - top) / s.rows.length;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 0,
          height: headH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          opacity: s.header.appear,
        }}
      >
        <Card w={600} h={headH} style={{ borderRadius: 22 }}>
          <span style={{ fontSize: 40, fontWeight: 600 }}>{DATA.plain}</span>
        </Card>
        <div style={{ opacity: s.oracle.pop, transform: `scale(${0.6 + 0.4 * s.oracle.pop})` }}>
          <Pill size={40}>Paris ✓</Pill>
        </div>
      </div>
      {s.rows.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            width: W,
            top: top + i * rowH,
            height: rowH - 10,
            borderRadius: 18,
            background: alpha(C.card, i % 2 ? 0.55 : 0.9),
            border: `1px solid ${alpha(C.accentText, 0.18)}`,
            display: 'flex',
            alignItems: 'center',
            opacity: r.pop,
            transform: `translateX(${(1 - r.pop) * 60}px)`,
          }}
        >
          <div style={{ width: 340, paddingLeft: 22, fontSize: 27, fontWeight: 700, color: C.accentText, whiteSpace: 'nowrap' }}>{r.name}</div>
          <div style={{ flex: 1, overflow: 'hidden', paddingRight: 18 }}>
            {r.glyphs ? (
              <GlyphLine glyphs={r.glyphs} size={36} weight={600} />
            ) : (
              <div style={{ fontSize: 34, fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>{r.text}</div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

// ---------- break ----------
const Break: React.FC<{ s: BreakState; W: number; H: number }> = ({ s, W, H }) => {
  const rowH = 156;
  const gap = 26;
  const chip = { w: 300, h: 124 };
  const sl = s.slow;
  // 26 slots x 55 x 0.6 + padding = 918 px: inside the 960 px stage (62 overflowed to the frame edge).
  const fs = 55;
  const slotsW = DATA.plain.length * fs * SLOT;
  const hist = sl.hist;
  const barW = W / hist.length;
  return (
    <>
      {/* Fast montage: GPT-5 cracks these on turn 1. */}
      <div style={{ position: 'absolute', inset: 0, opacity: s.fast.opacity }}>
        {s.fast.cards.map((c, i) => {
          const cracked = c.crack >= 1;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                top: 20 + i * (rowH + gap),
                width: W,
                height: rowH,
                opacity: c.appear,
                transform: `translateY(${(1 - c.appear) * -40}px)`,
              }}
            >
              <Card w={W} h={rowH} glow={c.flash} style={{ justifyContent: 'flex-start', paddingLeft: 30, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.accentText, marginTop: 18 }}>{c.name}</div>
                <div style={{ fontSize: cracked ? 50 : 40, fontWeight: cracked ? 700 : 600, whiteSpace: 'nowrap', color: cracked ? C.text : alpha(C.text, 0.75) }}>
                  {cracked ? c.to : c.from}
                </div>
              </Card>
              <div style={{ position: 'absolute', right: 22, top: 18, opacity: c.badge, transform: `scale(${0.6 + 0.4 * c.badge})` }}>
                <Pill size={30}>turn 1</Pill>
              </div>
            </div>
          );
        })}
        <Chip x={(W - chip.w) / 2} y={H - chip.h - 20} w={chip.w} h={chip.h} label={['GPT-5']} lit={1} size={44} />
      </div>
      {/* Hero: the keyed substitution, broken letter by letter over five turns. */}
      <div style={{ position: 'absolute', inset: 0, opacity: sl.appear }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: W, textAlign: 'center', fontSize: 40, fontWeight: 700, color: C.accentText }}>
          Keyed substitution
        </div>
        <div style={{ position: 'absolute', top: 70, left: 0, width: W, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 24 }}>
          <span style={{ fontSize: 56, fontWeight: 700, color: C.muted }}>turn</span>
          <span style={{ fontSize: 180, fontWeight: 800, lineHeight: 1, ...gradientText, transform: `scale(${1 + 0.12 * sl.tick})`, display: 'inline-block' }}>
            {Math.max(1, sl.turn)}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 300, left: 0, width: W, display: 'flex', justifyContent: 'center', gap: 18 }}>
          {Array.from({ length: TURNS }, (_, i) => (
            <div key={i} style={{ width: 60, height: 12, borderRadius: 6, background: i < sl.turn ? GRADIENT : alpha(C.muted, 0.3) }} />
          ))}
        </div>
        <div style={{ position: 'absolute', top: 380, left: (W - (slotsW + 60)) / 2 }}>
          <Card w={slotsW + 60} h={150} glow={sl.snap * (1 - sl.label * 0.5)}>
            <GlyphLine
              glyphs={sl.glyphs.map((g) => ({ ch: g.ch, settle: g.locked ? 1 : 0 }))}
              size={fs}
              color={C.text}
              style={{}}
            />
          </Card>
          {/* Locked letters are bright, unbroken cipher letters dim. */}
          <div style={{ position: 'absolute', left: 30, top: 0, height: 150, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            {sl.glyphs.map((g, i) => (
              <span
                key={i}
                style={{ display: 'inline-block', width: fs * SLOT, height: 6, alignSelf: 'flex-end', marginBottom: 26, borderRadius: 3, background: g.ch === ' ' ? 'transparent' : g.locked ? GRADIENT : alpha(C.muted, 0.35) }}
              />
            ))}
          </div>
        </div>
        {/* Letter-frequency histogram of the cipher text: the analyst's view. */}
        <div style={{ position: 'absolute', top: 600, left: 0, width: W, height: 300 }}>
          {hist.map((h, i) => {
            const bh = 220 * h.grow;
            return (
              <div key={i} style={{ position: 'absolute', left: i * barW + 6, width: barW - 12, bottom: 50, height: bh, borderRadius: 8, background: h.lit ? GRADIENT : alpha(C.muted, 0.35) }} />
            );
          })}
          {hist.map((h, i) => (
            <div key={`l${i}`} style={{ position: 'absolute', left: i * barW, width: barW, bottom: 0, textAlign: 'center', fontSize: 34, fontWeight: 700, color: h.lit ? C.accentText : C.muted }}>
              {h.ch}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 945, left: 0, width: W, display: 'flex', justifyContent: 'center', opacity: sl.label, transform: `scale(${0.8 + 0.2 * sl.label})` }}>
          <Pill size={48}>median 4–5 turns</Pill>
        </div>
      </div>
    </>
  );
};

// ---------- rosetta ----------
const ROS = { tabletTop: 10, tabletH: 400, rowY: [140, 236, 332], codeX: 520, fs: 42, cardTop: 600, cardH: 150, cardFs: 54 };

const Rosetta: React.FC<{ s: RosettaState; W: number }> = ({ s, W }) => {
  const slotW = ROS.cardFs * SLOT;
  const cardSlotsW = DATA.plain.length * slotW;
  const cardX0 = (W - cardSlotsW) / 2;
  const codeSlot = ROS.fs * SLOT;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 30,
          width: W - 60,
          top: ROS.tabletTop,
          height: ROS.tabletH,
          borderRadius: 30,
          background: `linear-gradient(160deg, ${alpha(C.muted, 0.22)}, ${alpha(C.card, 0.95)} 55%, ${alpha(C.muted, 0.12)})`,
          border: `3px solid ${alpha(C.muted, 0.45)}`,
          boxShadow: `inset 0 0 50px ${alpha('#000000', 0.55)}`,
          opacity: s.tablet.appear,
          transform: `translateY(${(1 - s.tablet.appear) * -50}px)`,
        }}
      >
        <div style={{ position: 'absolute', top: 26, width: '100%', textAlign: 'center', fontSize: 36, fontWeight: 800, letterSpacing: '0.18em', color: C.muted }}>
          ROSETTA STONE
        </div>
      </div>
      {DATA.rosetta.map(([p, c], r) => (
        <div key={r} style={{ position: 'absolute', top: ROS.rowY[r] - 30, left: 0, width: W, height: 60, opacity: s.tablet.rows[r] ?? 0 }}>
          <div style={{ position: 'absolute', right: W - ROS.codeX + 80, fontSize: ROS.fs, fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>{p}</div>
          <div style={{ position: 'absolute', left: ROS.codeX - 62, fontSize: ROS.fs, fontWeight: 700, color: C.muted }}>↔</div>
          <div style={{ position: 'absolute', left: ROS.codeX }}>
            <GlyphLine glyphs={[...c].map((ch) => ({ ch, settle: 1 }))} size={ROS.fs} color={C.accentText} />
          </div>
        </div>
      ))}
      <svg width={W} height={ROS.cardTop + 10} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs>
          <linearGradient id="ros-link" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.accentText} />
            <stop offset="1" stopColor={C.accent2} />
          </linearGradient>
        </defs>
        {s.links.map((l, j) => {
          const x1 = ROS.codeX + l.col * codeSlot + codeSlot / 2;
          const y1 = ROS.rowY[l.row] + 26;
          const x2 = cardX0 + l.slot * slotW + slotW / 2;
          const y2 = ROS.cardTop + 8;
          const d = `M ${x1} ${y1} C ${x1} ${y1 + 120}, ${x2} ${y2 - 120}, ${x2} ${y2}`;
          return l.draw > 0 && l.opacity > 0 ? (
            <path key={j} d={d} pathLength={1} fill="none" stroke="url(#ros-link)" strokeWidth={5} strokeLinecap="round" strokeDasharray={`${l.draw} 1`} opacity={l.opacity} />
          ) : null;
        })}
      </svg>
      <div style={{ position: 'absolute', top: ROS.cardTop, left: cardX0 - 30, opacity: s.card.appear }}>
        <Card w={cardSlotsW + 60} h={ROS.cardH}>
          <GlyphLine glyphs={s.glyphs.map((g) => ({ ch: g.ch, settle: g.settle >= 0.6 ? 1 : 0 }))} size={ROS.cardFs} color={C.text} />
        </Card>
      </div>
      <div style={{ position: 'absolute', top: 820, left: 0, width: W, textAlign: 'center', opacity: s.counter.appear }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted }}>comprehension</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 30, marginTop: 6 }}>
          <span style={{ fontSize: 120, fontWeight: 800, color: C.muted }}>61%</span>
          <span style={{ fontSize: 90, fontWeight: 800, color: C.muted }}>→</span>
          <span style={{ fontSize: 150, fontWeight: 800, lineHeight: 1, ...gradientText }}>{s.counter.text}</span>
        </div>
      </div>
    </>
  );
};

export const CipherCard: React.FC<AnimProps & CipherProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur, DATA);
  const { w: W, h: H } = stageOf(vertical);
  return (
    <Stage vertical={vertical} fill>
      {s.mode === 'scramble' && <Scramble s={s} W={W} />}
      {s.mode === 'ladder' && <Ladder s={s} W={W} H={H} />}
      {s.mode === 'break' && <Break s={s} W={W} H={H} />}
      {s.mode === 'rosetta' && <Rosetta s={s} W={W} />}
    </Stage>
  );
};

export { KEYED };
