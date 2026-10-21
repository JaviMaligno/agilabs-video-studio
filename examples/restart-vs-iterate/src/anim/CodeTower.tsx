import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, ITER_RUN, LANES, LOOPG, RESTART_RUN, SINGLE, type CodeTowerProps, type LaneState } from './CodeTower.state.ts';
import { Dial, Disc, RestartButton, RestartGlyph, Strip, Tower } from './pieces.tsx';
import { gradientText } from './Stage.tsx';
import { towerBlocks } from './tower.state.ts';

export { frameState };

const base: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, fontFamily, color: C.text };
const centred = (top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: 60, right: 60, top, textAlign: 'center', ...extra });

const LANE_NAMES = ['ITERATE', 'RESTART', 'BUTTON'];

const Lane: React.FC<{ k: number; l: LaneState; button?: ReturnType<typeof frameState>['button'] }> = ({ k, l, button }) => {
  const x = LANES.xs[k];
  const run = k === 0 ? ITER_RUN : k === 1 ? RESTART_RUN : [];
  const ok = k === 0;
  const shown = Math.ceil(l.seq - 1e-6);
  return (
    <>
      <div style={{ position: 'absolute', left: x - 150, width: 300, top: 384, textAlign: 'center', fontSize: 44, fontWeight: 800, letterSpacing: '0.04em', color: l.active ? C.accentText : C.text, opacity: l.presence }}>
        {LANE_NAMES[k]}
      </div>
      <div style={{ position: 'absolute', left: x - 75, width: 150, top: 452, display: 'flex', justifyContent: 'space-between', opacity: l.presence }}>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} style={{ width: 24, height: 24, borderRadius: 12, boxShadow: `inset 0 0 0 3px ${alpha(C.muted, 0.6)}`, background: alpha(C.accentText, Math.max(0, Math.min(1, l.rounds - r))) }} />
        ))}
      </div>
      <Tower x={x} base={LANES.base} w={LANES.w} h={LANES.h} gap={LANES.gap} blocks={l.tower.blocks} opacity={l.tower.opacity} />
      {k < 2 && (
        <>
          <Strip x={x} y={942} lights={l.tower.lights} lw={24} gap={6} lh={14} opacity={l.presence} />
          <div style={{ position: 'absolute', left: x - 150, width: 300, top: 968, textAlign: 'center', fontSize: 32, fontWeight: 700, color: l.failing === null ? C.muted : l.failing > 0 ? C.flat : C.ok, opacity: l.failing === null ? 0 : l.presence }}>
            failing: {l.failing ?? ''}
          </div>
          <div style={{ position: 'absolute', left: x - 150, width: 300, top: 1022, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 40, fontWeight: 800, opacity: l.presence, whiteSpace: 'nowrap' }}>
            {run.slice(0, shown).map((v, i) => (
              <span key={i} style={{ color: v > 0 ? C.flat : C.ok }}>
                {i > 0 && <span style={{ color: C.muted, fontWeight: 600 }}>{'→ '}</span>}
                {v}
              </span>
            ))}
            {l.end > 0 && (
              <div style={{ marginLeft: 8, opacity: Math.min(1, l.end * 1.4), transform: `scale(${1 + 0.6 * (1 - l.end)})` }}>
                <Disc mark={ok ? '✓' : '✗'} colour={ok ? C.ok : C.flat} size={46} />
              </div>
            )}
          </div>
          <div style={{ position: 'absolute', left: x - 150, width: 300, top: 1084, textAlign: 'center', fontSize: 27, fontWeight: 600, color: C.muted, opacity: l.presence * Math.min(1, l.seq) }}>
            one real run
          </div>
        </>
      )}
      {k === 2 && button && (
        <>
          <RestartButton x={x} y={1010} r={58} pop={button.pop} pulse={button.pulse} />
          <Dial x={x} y={1080} active={button.dial} opacity={button.dialPop} size={30} step={40} />
        </>
      )}
    </>
  );
};

export const CodeTower: React.FC<AnimProps & CodeTowerProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);

  if (s.mode === 'hook' || s.mode === 'quote') {
    const words = ['let', 'the', 'loop', 'restart'];
    const shown = s.quote.words * words.length;
    const patchFrom = { x: 980, y: 420 };
    const patchTo = { x: SINGLE.x, y: SINGLE.base - 5 * (SINGLE.h + SINGLE.gap) + SINGLE.h / 2 };
    const px = patchFrom.x + (patchTo.x - patchFrom.x) * s.patch.fly;
    const py = patchFrom.y + (patchTo.y - patchFrom.y) * s.patch.fly;
    const failing = s.single.lights.filter((l) => l.rose > 0.5).length;
    const lit = s.single.lights.some((l) => l.rose + l.teal > 0.5);
    return (
      <div style={base}>
        {s.mode === 'quote' && (
          <>
            <div style={centred(398, { fontSize: 78, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' })}>
              {words.map((w, i) => (
                <span key={i} style={{ opacity: Math.max(0, Math.min(1, shown - i)), ...(w === 'restart' ? gradientText : {}) }}>
                  {i === 0 ? '“' : ''}
                  {w}
                  {i === words.length - 1 ? '”' : ' '}
                </span>
              ))}
            </div>
            <div style={centred(500, { fontSize: 32, fontWeight: 600, color: C.muted, opacity: s.quote.credit })}>agent folklore · Andrej Karpathy’s phrasing</div>
          </>
        )}
        <Tower x={SINGLE.x} base={SINGLE.base} w={SINGLE.w} h={SINGLE.h} gap={SINGLE.gap} blocks={s.single.blocks} opacity={s.single.opacity} wobble={s.single.wobble} />
        <Strip x={SINGLE.x} y={1180} lights={s.single.lights} lw={40} gap={10} lh={16} opacity={s.single.opacity} />
        <div style={{ position: 'absolute', left: SINGLE.x - 200, width: 400, top: 1212, textAlign: 'center', fontSize: 34, fontWeight: 700, color: C.flat, opacity: lit ? s.single.opacity : 0 }}>
          failing: {failing}
        </div>
        {s.patch.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: px - 46,
              top: py - 26,
              width: 92,
              height: 52,
              borderRadius: 12,
              background: GRADIENT,
              boxShadow: `0 6px 24px ${alpha(C.bg0, 0.7)}`,
              opacity: s.patch.opacity,
              transform: `rotate(${-12 * (1 - s.patch.fly)}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 800,
              color: C.text,
            }}
          >
            patch
          </div>
        )}
        <RestartButton x={850} y={900} r={84} pop={s.button.pop} press={s.button.press} pulse={s.button.pulse} />
        <div style={{ position: 'absolute', left: 700, width: 300, top: 1000, textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.accentText, opacity: s.button.pop }}>restart</div>
      </div>
    );
  }

  if (s.mode === 'loop') {
    const L = s.loop;
    const circ = 2 * Math.PI * LOOPG.r;
    const node = (ang: number) => ({ x: LOOPG.cx + LOOPG.r * Math.cos((ang * Math.PI) / 180), y: LOOPG.cy + LOOPG.r * Math.sin((ang * Math.PI) / 180) });
    const nodes = [
      { label: 'write', at: node(-90) },
      { label: 'test', at: node(30) },
      { label: 'feedback', at: node(150) },
    ];
    const dotAt = node(-90 + 360 * L.dot);
    const from = nodes[1].at;
    const mid = nodes[2].at;
    const to = { x: LOOPG.x, y: LOOPG.base - 150 };
    const c = L.card;
    const cx = c < 0.5 ? from.x + (mid.x - from.x) * (c / 0.5) : mid.x + (to.x - mid.x) * ((c - 0.5) / 0.5);
    const cy = c < 0.5 ? from.y - 70 + (mid.y - from.y) * (c / 0.5) : mid.y - 70 + (to.y - mid.y + 70) * ((c - 0.5) / 0.5);
    return (
      <div style={base}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <circle
            cx={LOOPG.cx}
            cy={LOOPG.cy}
            r={LOOPG.r}
            fill="none"
            stroke={alpha(C.accentText, 0.55)}
            strokeWidth={7}
            strokeDasharray={`${circ * L.ring} ${circ}`}
            transform={`rotate(-90 ${LOOPG.cx} ${LOOPG.cy})`}
            strokeLinecap="round"
          />
          {[-30, 90, 210].map((a, i) => {
            const p = node(a);
            const rot = a + 90;
            return <path key={i} d="M -14 -16 L 14 0 L -14 16 Z" fill={C.accentText} opacity={L.ring} transform={`translate(${p.x} ${p.y}) rotate(${rot})`} />;
          })}
          <circle cx={dotAt.x} cy={dotAt.y} r={18} fill={C.text} opacity={L.dotOpacity} />
        </svg>
        <Tower x={LOOPG.x} base={LOOPG.base} w={LOOPG.w} h={LOOPG.h} gap={LOOPG.gap} blocks={s.single.blocks} />
        <Strip x={LOOPG.x} y={922} lights={s.single.lights} lw={24} gap={6} lh={14} />
        {nodes.map((n, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: n.at.x,
              top: n.at.y,
              transform: 'translate(-50%, -50%)',
              padding: '10px 26px',
              borderRadius: 40,
              background: C.card,
              boxShadow: `inset 0 0 0 4px ${alpha(C.accentText, 0.3 + 0.7 * L.nodes[i])}`,
              fontSize: 46,
              fontWeight: 800,
              color: L.nodes[i] > 0.5 ? C.text : C.muted,
              opacity: Math.max(L.ring, 0) * (0.45 + 0.55 * L.nodes[i]),
              whiteSpace: 'nowrap',
            }}
          >
            {n.label}
          </div>
        ))}
        {L.cardOpacity > 0 && (
          <div style={{ position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)', padding: '8px 20px', borderRadius: 14, background: C.bg1, boxShadow: `inset 0 0 0 4px ${C.flat}`, fontSize: 34, fontWeight: 800, color: C.flat, opacity: L.cardOpacity, whiteSpace: 'nowrap' }}>
            2 failing
          </div>
        )}
        <div style={centred(1215, { fontSize: 38, fontWeight: 700, color: C.text, opacity: L.tag, whiteSpace: 'nowrap' })}>29 features · 5 real codebases · 2 models</div>
      </div>
    );
  }

  if (s.mode === 'rules') {
    const R = s.rules;
    const xs = [189, 423, 657, 891];
    const r = 70;
    return (
      <div style={base}>
        <div style={centred(410, { fontSize: 60, fontWeight: 800, opacity: R.label })}>4 rounds</div>
        {[0, 1, 2].map((k) => {
          const l = xs[k] + r + 6;
          const w = xs[k + 1] - r - 6 - l;
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: l,
                top: 510,
                width: w,
                height: 290,
                borderRadius: 18,
                background: alpha(C.accent, 0.35 * R.gaps),
                boxShadow: `0 0 ${40 * R.gaps}px ${alpha(C.accent, 0.6 * R.gaps)}, inset 0 0 0 3px ${alpha(C.accentText, R.gaps)}`,
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 60,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ opacity: R.gaps, transform: `scale(${0.5 + 0.5 * R.gaps})` }}>
                <RestartGlyph size={60} colour={C.text} />
                <div style={{ textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.text }}>?</div>
              </div>
            </div>
          );
        })}
        {xs.map((x, k) => (
          <React.Fragment key={k}>
            <div
              style={{
                position: 'absolute',
                left: x - r,
                top: 600 - r,
                width: 2 * r,
                height: 2 * r,
                borderRadius: r,
                background: C.card,
                boxShadow: `inset 0 0 0 5px ${C.accentText}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60,
                fontWeight: 800,
                opacity: R.pips[k],
                transform: `scale(${0.5 + 0.5 * R.pips[k]})`,
              }}
            >
              {k + 1}
            </div>
            {[0, 1, 2].map((c) => (
              <div
                key={c}
                style={{
                  position: 'absolute',
                  left: x - 46,
                  top: 760 - c * 20 + (1 - R.coins[k]) * -40,
                  width: 92,
                  height: 28,
                  borderRadius: '50%',
                  background: C.warm,
                  boxShadow: `inset 0 -5px 0 ${alpha(C.bg0, 0.35)}`,
                  opacity: R.coins[k],
                }}
              />
            ))}
          </React.Fragment>
        ))}
        <div style={centred(820, { fontSize: 42, fontWeight: 700, color: C.warm, opacity: R.budget })}>same budget</div>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: R.bracket }}>
          <path d={`M 260 905 L 260 930 L 820 930 L 820 905`} fill="none" stroke={C.accentText} strokeWidth={6} strokeLinejoin="round" />
          {[0, 1, 2].map((k) => {
            const gx = (xs[k] + xs[k + 1]) / 2;
            return <line key={k} x1={gx} y1={930} x2={gx} y2={880} stroke={C.accentText} strokeWidth={6} />;
          })}
        </svg>
        <div style={centred(960, { fontSize: 60, fontWeight: 800, opacity: R.bracket, ...gradientText })}>only this changes</div>
      </div>
    );
  }

  if (s.mode === 'lanes') {
    return (
      <div style={base}>
        {s.lanes.map((l, k) => (
          <Lane key={k} k={k} l={l} button={k === 2 ? s.button : undefined} />
        ))}
        <div style={centred(1240, { fontSize: 38, fontWeight: 800, color: C.accentText, opacity: s.laneNote })}>agent’s choice · costs nothing</div>
      </div>
    );
  }

  // bars
  const B = s.bars;
  const strongVals = [
    { v: 86, d: '86%', label: 'iterate' },
    { v: 69, d: '69%', label: 'restart' },
    { v: 91, d: '91%', label: 'button' },
  ];
  const weakVals = [
    { v: 74, d: '74%' },
    { v: 63, d: '63%' },
  ];
  const fills = [GRADIENT, alpha(C.flat, 0.8), alpha(C.accentText, 0.45)];
  const weakFills = [alpha(C.muted, 0.6), alpha(C.flat, 0.45)];
  const SB = 880;
  const SH = 360;
  const WB = 1236;
  const WH = 200;
  const pitch = LANES.h + LANES.gap;
  const towers = [
    towerBlocks(LANES.n, pitch, 0, [], [], () => 0),
    towerBlocks(LANES.n, pitch, 0, [], [], (i) => ([1, 3, 6].includes(i) ? 1 : 0)),
    towerBlocks(LANES.n, pitch, 0, [], [], () => 0),
  ];
  return (
    <div style={base}>
      {B.shrink < 1 &&
        towers.map((blocks, k) => <Tower key={k} x={LANES.xs[k]} base={LANES.base} w={LANES.w} h={LANES.h} gap={LANES.gap} blocks={blocks} opacity={(1 - B.shrink) * (k === 2 ? 0.5 : 1)} scale={1 - B.shrink} />)}
      {strongVals.map((b, k) => {
        const g = B.strong[k];
        const h = (b.v / 100) * SH * g;
        return (
          <React.Fragment key={k}>
            <div
              style={{
                position: 'absolute',
                left: LANES.xs[k] - 80,
                width: 160,
                top: SB - h,
                height: h,
                borderRadius: '14px 14px 0 0',
                background: fills[k],
                boxShadow: k === 2 ? `inset 0 0 0 4px ${C.accentText}` : undefined,
                opacity: g > 0 ? 1 : 0,
              }}
            />
            <div style={{ position: 'absolute', left: LANES.xs[k] - 150, width: 300, top: SB - h - 84, textAlign: 'center', fontSize: 70, fontWeight: 800, letterSpacing: '-0.02em', opacity: g, color: k === 1 ? C.flat : C.text }}>
              {b.d}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 80, right: 80, top: SB, height: 4, background: alpha(C.muted, 0.5), opacity: B.labels[0] }} />
      {strongVals.map((b, k) => (
        <div key={k} style={{ position: 'absolute', left: LANES.xs[k] - 150, width: 300, top: SB + 10, textAlign: 'center', fontSize: 38, fontWeight: 800, color: k === 0 ? C.accentText : C.muted, opacity: B.labels[k] }}>
          {b.label}
        </div>
      ))}
      <div style={centred(SB + 66, { fontSize: 32, fontWeight: 600, color: C.muted, opacity: B.foot, whiteSpace: 'nowrap' })}>
        <span style={{ color: C.text, fontWeight: 800 }}>gpt-5.4</span> · 3 seeds · 17–2 · p = 0.001
      </div>
      {weakVals.map((b, k) => {
        const g = B.weak[k];
        const h = (b.v / 100) * WH * g;
        return (
          <React.Fragment key={k}>
            <div style={{ position: 'absolute', left: LANES.xs[k] - 55, width: 110, top: WB - h, height: h, borderRadius: '10px 10px 0 0', background: weakFills[k], opacity: g > 0 ? 1 : 0 }} />
            <div style={{ position: 'absolute', left: LANES.xs[k] - 150, width: 300, top: WB - h - 58, textAlign: 'center', fontSize: 46, fontWeight: 800, color: C.muted, opacity: g }}>
              {b.d}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 80, width: 600, top: WB, height: 3, background: alpha(C.muted, 0.4), opacity: B.weak[0] }} />
      <div style={{ position: 'absolute', left: 60, width: 960, top: WB + 12, textAlign: 'center', fontSize: 30, fontWeight: 600, color: C.muted, opacity: B.weak[0], whiteSpace: 'nowrap' }}>
        <span style={{ color: C.text, fontWeight: 800 }}>gpt-5.4-mini</span>
        <span style={{ opacity: B.weakFoot }}> · leans · p = 0.078</span>
      </div>
      {B.bracket > 0 && (
        <>
          <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: B.bracket }}>
            <path d={`M ${LANES.xs[0]} 462 L ${LANES.xs[0]} 440 L ${LANES.xs[2]} 440 L ${LANES.xs[2]} 462`} fill="none" stroke={C.text} strokeWidth={5} strokeDasharray="14 10" />
          </svg>
          <div style={centred(380, { fontSize: 36, fontWeight: 800, color: C.text, opacity: B.bracket, whiteSpace: 'nowrap' })}>
            8–4 · p = 0.39 · <span style={{ color: C.warm }}>not significant</span>
          </div>
        </>
      )}
    </div>
  );
};
