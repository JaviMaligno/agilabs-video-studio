import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { Crack, PartTag, Stamp, Tag, Tick, clamp01, lerp } from './pieces.tsx';
import { CORPUS, SHAPE, frameState, type TeamChannelProps, type TeamChannelState } from './TeamChannel.state.ts';

export { frameState };
export type { TeamChannelProps };

type S<V> = Extract<TeamChannelState, { view: V }>;

const Node: React.FC<{ x: number; y: number; text: string; lead?: boolean; plain?: boolean }> = ({ x, y, text, lead, plain }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 90,
      top: y - 30,
      width: 180,
      height: 60,
      borderRadius: 30,
      background: lead ? GRADIENT : C.bg1,
      border: lead ? 'none' : `2px solid ${plain ? alpha(C.muted, 0.5) : C.accentText}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: 28,
      fontWeight: 800,
      color: plain ? C.muted : C.text,
      zIndex: 3,
    }}
  >
    {text}
  </div>
);

const Pill: React.FC<{ x: number; y: number; ask: boolean; dim?: boolean }> = ({ x, y, ask, dim }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 34,
      top: y - 22,
      width: 68,
      height: 44,
      borderRadius: 22,
      background: ask ? alpha(C.bg0, 0.95) : alpha(dim ? C.muted : C.accent, dim ? 0.35 : 0.5),
      border: ask ? `3px solid ${C.accentText}` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: 30,
      fontWeight: 800,
      color: C.accentText,
      zIndex: 2,
    }}
  >
    {ask ? '?' : ''}
  </div>
);

const Pipe: React.FC<{ y: number; x0: number; x1: number; lit: boolean }> = ({ y, x0, x1, lit }) => (
  <div style={{ position: 'absolute', left: x0, top: y - 4, width: x1 - x0, height: 8, borderRadius: 4, background: lit ? alpha(C.accent, 0.8) : alpha(C.muted, 0.35) }} />
);

const CorpusView: React.FC<{ s: S<'corpus'> }> = ({ s }) => (
  <>
    <PartTag n={1} text="real messages" appear={s.part} />
    {/* Peer sessions: no roles. */}
    <div style={{ opacity: clamp01(s.peer) * 0.75 }}>
      <div style={{ position: 'absolute', left: 0, top: 104, width: 960, textAlign: 'center', fontFamily, fontSize: 36, fontWeight: 700, color: C.muted }}>peer sessions · no roles</div>
      <Pipe y={220} x0={150} x1={810} lit={false} />
      {s.peerPills.map((p, i) => (
        <Pill key={i} x={lerp(220, 740, p.x)} y={220} ask={p.ask} dim />
      ))}
      <Node x={110} y={220} text="session" plain />
      <Node x={850} y={220} text="session" plain />
    </div>
    {/* Agent teams: names and a lead. */}
    <div style={{ opacity: clamp01(s.teams) }}>
      <div style={{ position: 'absolute', left: 0, top: 336, width: 960, textAlign: 'center', fontFamily, fontSize: 38, fontWeight: 800, color: C.text }}>agent teams · names + a lead</div>
      <Pipe y={456} x0={150} x1={810} lit />
      {s.teamPills.map((p, i) => (
        <Pill key={i} x={lerp(220, 740, p.x)} y={456} ask={p.ask} />
      ))}
      <Node x={110} y={456} text="lead" lead />
      <Node x={480} y={530} text="teammate" />
      <Node x={850} y={456} text="teammate" />
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
        <line x1={480} y1={460} x2={480} y2={500} stroke={alpha(C.accent, 0.8)} strokeWidth={8} />
      </svg>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 610, width: 960, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 22, opacity: s.counter, fontFamily }}>
      <span style={{ fontSize: 170, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, ...gradientText }}>{s.count}</span>
      <span style={{ fontSize: 46, fontWeight: 700, color: C.text }}>messages</span>
    </div>
    <Tag x={480} y={830} w={700} text={CORPUS.sub} appear={s.sub} size={36} />
  </>
);

const BarsView: React.FC<{ s: S<'bars'> }> = ({ s }) => (
  <>
    <div style={{ position: 'absolute', left: 0, top: 40, width: 860, fontFamily, opacity: s.title }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: '0.1em' }}>DELEGATION</div>
      <div style={{ fontSize: 50, fontWeight: 800, color: C.text }}>share of messages</div>
    </div>
    {s.bars.map((b, i) => {
      const g = clamp01(b.grow);
      const e = 1 - (1 - g) ** 3;
      return (
        <div key={i} style={{ position: 'absolute', left: 0, top: 250 + i * 220, width: 860, opacity: clamp01(g * 4), fontFamily }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: b.accent ? C.text : C.muted }}>{b.label}</div>
            <div style={{ fontSize: 64, fontWeight: 800, color: b.accent ? C.accentText : C.text, opacity: clamp01((g - 0.5) * 2) }}>{b.display}</div>
          </div>
          <div style={{ height: 76, borderRadius: 20, background: C.card, border: `1px solid ${alpha('#ffffff', 0.07)}`, overflow: 'hidden' }}>
            <div style={{ width: `${b.fill * e * 100}%`, height: '100%', borderRadius: 20, background: b.accent ? GRADIENT : alpha(C.muted, 0.42), boxShadow: b.accent ? `0 0 40px ${alpha(C.accent, 0.45)}` : 'none' }} />
          </div>
        </div>
      );
    })}
    <Tag x={430} y={760} w={860} text="different tasks · not a controlled test" appear={s.note} size={34} />
  </>
);

const ShapeView: React.FC<{ s: S<'shape'> }> = ({ s }) => {
  const cracked = s.crack > 0.5;
  const lensX = lerp(250, 700, s.lens);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 960, textAlign: 'center', fontFamily, fontSize: 50, fontWeight: 800, color: C.text, opacity: s.header }}>
        Of <span style={gradientText}>71</span> requests
      </div>
      {s.tiles.map((tile, i) => {
        const a = clamp01(tile.pop);
        if (a <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * 490,
              top: 96,
              width: 430,
              height: 210,
              borderRadius: 22,
              background: C.card,
              border: `2px solid ${i === 1 ? alpha(C.accentText, 0.4 + 0.6 * s.dropFlash) : C.line}`,
              boxShadow: i === 1 && s.dropFlash > 0 ? `0 0 ${40 * s.dropFlash}px ${alpha(C.accentText, 0.8)}` : `0 12px 30px ${alpha(C.bg0, 0.6)}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: a,
              transform: `scale(${0.8 + 0.2 * a})`,
              fontFamily,
            }}
          >
            <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: '-0.02em', ...gradientText }}>{tile.value}</div>
            <div style={{ fontSize: 38, fontWeight: 600, color: C.muted }}>{tile.label}</div>
          </div>
        );
      })}
      {/* A "done ✓" claim under the refuter's magnifier: it cracks. */}
      {s.done > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 270,
            top: 360,
            width: 420,
            height: 170,
            borderRadius: 22,
            background: cracked ? alpha(C.muted, 0.16) : GRADIENT,
            border: cracked ? `4px solid ${alpha(C.muted, 0.8)}` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            fontFamily,
            fontSize: 72,
            fontWeight: 800,
            color: cracked ? C.muted : C.text,
            opacity: s.done,
            transform: `scale(${0.7 + 0.3 * s.done})`,
          }}
        >
          done <Tick size={66} color={cracked ? C.muted : C.text} stroke={4} />
          <Crack crack={s.crack} width={4} />
        </div>
      )}
      {s.lens > 0 && s.lens < 1 && (
        <svg style={{ position: 'absolute', left: lensX - 70, top: 370, overflow: 'visible', zIndex: 6 }} width={140} height={190}>
          <circle cx={70} cy={70} r={58} fill={alpha(C.text, 0.12)} stroke={C.text} strokeWidth={8} />
          <line x1={112} y1={112} x2={150} y2={170} stroke={C.text} strokeWidth={14} strokeLinecap="round" />
        </svg>
      )}
      <div style={{ position: 'absolute', left: 0, top: 580, width: 860, textAlign: 'center', fontFamily, fontSize: 42, fontWeight: 700, lineHeight: 1.22, color: C.text, opacity: s.claim }}>
        {SHAPE.claim[0]}
        <br />
        {SHAPE.claim[1]}
      </div>
      <Stamp x={430} y={760} w={860} text={SHAPE.stamp} pop={s.stamp} solid font={52} />
    </>
  );
};

export const TeamChannel: React.FC<AnimProps & TeamChannelProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props as TeamChannelProps, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
        {s.view === 'corpus' && <CorpusView s={s} />}
        {s.view === 'bars' && <BarsView s={s} />}
        {s.view === 'shape' && <ShapeView s={s} />}
      </div>
    </Stage>
  );
};
