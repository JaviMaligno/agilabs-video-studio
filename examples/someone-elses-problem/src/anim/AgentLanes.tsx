import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import {
  COLLISIONS,
  DESK_LABELS,
  H,
  HEAD_Y,
  INJECTED,
  LANE_TOP,
  LAPTOP,
  LIMIT_GB,
  MARK_Y,
  PANEL,
  STAMPS,
  STRIP,
  TANK_GB,
  TILE,
  TILES,
  TRAY,
  W,
  frameState,
  markX,
  tileX,
  trayY,
  type Collision,
  type LanesProps,
  type State,
} from './AgentLanes.state.ts';

export { frameState };
export type { LanesProps };

const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- lanes

const Lane: React.FC<{ l: State['lanes'][number]; i: number; field: number; n: number; t: number; top: number }> = ({ l, i, field, n, t, top }) => {
  if (l.appear <= 0.001) return null;
  const half = n >= 4 ? 92 : 110;
  const o = l.appear * field * (0.25 + 0.75 * l.lit);
  const live = 1 - l.dark;
  const bars = Array.from({ length: 7 }, (_, j) => {
    const period = 7 * 36;
    const yy = HEAD_Y - 34 - ((j * 36 + l.scroll) % period);
    const w = 40 + hash(i * 31 + j + Math.floor((j * 36 + l.scroll) / period) * 7) * (half * 2 - 70);
    const fade = Math.min(1, (yy - (top + 60)) / 80);
    return { y: yy, w, o: Math.max(0, fade) };
  });
  const blink = Math.floor(t * 2.2) % 2 === 0 ? 1 : 0.25;
  return (
    <g opacity={o}>
      <rect x={l.x - half} y={top} width={half * 2} height={HEAD_Y + 44 - top} rx={18} fill={alpha(C.pane, 0.85)} stroke={alpha(C.accent, 0.35 * live + 0.1)} strokeWidth={2} />
      <text x={l.x} y={top + 40} textAnchor="middle" fontFamily={fontFamily} fontSize={28} fontWeight={600} fill={C.muted}>
        {n === 1 ? 'session' : `session ${i + 1}`}
      </text>
      <line x1={l.x - half + 22} x2={l.x - half + 22} y1={top + 64} y2={HEAD_Y} stroke="url(#laneGrad)" strokeWidth={4} opacity={0.4 + 0.6 * live} />
      {bars.map((b, j) => (
        <rect key={j} x={l.x - half + 40} y={b.y} width={b.w} height={14} rx={7} fill={j % 3 === 0 ? C.accentText : C.muted} opacity={b.o * (0.25 + 0.4 * live)} />
      ))}
      {/* Head: the cursor. */}
      <circle cx={l.x - half + 22} cy={HEAD_Y} r={16 + 22 * l.flash} fill={alpha(C.accent2, 0.35 * live + 0.5 * l.flash)} />
      <circle cx={l.x - half + 22} cy={HEAD_Y} r={9} fill={live > 0.5 ? C.text : C.muted} />
      <rect x={l.x - half + 40} y={HEAD_Y - 14} width={22} height={30} fill={C.accentText} opacity={blink * live} />
      {l.dark > 0 && (
        <rect x={l.x - half} y={top} width={half * 2} height={HEAD_Y + 44 - top} rx={18} fill={C.bg0} opacity={0.88 * l.dark} />
      )}
      {l.flash > 0 && <rect x={l.x - half} y={top} width={half * 2} height={HEAD_Y + 44 - top} rx={18} fill={alpha(C.text, 0.18 * l.flash)} />}
      {l.chip > 0 && (
        <g opacity={l.chip * live} transform={`translate(${l.x} ${HEAD_Y - 70}) scale(${0.7 + 0.3 * l.chip + 0.2 * l.flash})`}>
          <rect x={-62} y={-30} width={124} height={60} rx={14} fill={C.card} stroke={C.accentText} strokeWidth={3} />
          <text x={0} y={12} textAnchor="middle" fontFamily={MONO} fontSize={34} fontWeight={700} fill={C.text}>
            test
          </text>
        </g>
      )}
      {l.lost > 0 && (
        <g opacity={l.lost} transform={`translate(${l.x} ${HEAD_Y - 135})`}>
          <rect x={-102} y={-32} width={204} height={64} rx={32} fill={C.bg0} stroke={C.warm} strokeWidth={3} />
          <text x={0} y={11} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fontWeight={700} fill={C.warm}>
            session lost
          </text>
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- tank

const Tank: React.FC<{ s: State; part: 'body' | 'labels' }> = ({ s, part }) => {
  const k = s.tank;
  if (k.opacity <= 0.001) return null;
  const inner = k.h - 10;
  const yOf = (gb: number) => k.y + k.h - 5 - (gb / TANK_GB) * inner;
  const fillTop = k.y + k.h - 5 - k.fill * inner;
  const limY = yOf(LIMIT_GB);
  const big = k.w > 400;
  if (part === 'labels')
    return (
      <g opacity={k.opacity}>
        {k.limitLabel > 0 && big && (
          <text x={k.x + k.w - 20} y={limY - 12} textAnchor="end" fontFamily={fontFamily} fontSize={32} fontWeight={700} fill={C.text} opacity={k.limitLabel} stroke={C.bg0} strokeWidth={6} paintOrder="stroke">
            32 GB
          </text>
        )}
        {k.ghost16 > 0 && big && (
          <text x={k.x + 22} y={yOf(16) - 12} fontFamily={fontFamily} fontSize={30} fontWeight={600} fill={C.accentText} opacity={k.ghost16} stroke={C.bg0} strokeWidth={7} paintOrder="stroke">
            ≈ 16 GB · one session
          </text>
        )}
        {k.label37 > 0 && big && (
          <text x={k.x + 22} y={yOf(37) + 8} fontFamily={fontFamily} fontSize={38} fontWeight={800} fill={C.text} opacity={k.label37} stroke={C.bg0} strokeWidth={7} paintOrder="stroke">
            ≈ 37 GB · three sessions
          </text>
        )}
        {k.labelOpacity > 0 && (
          <text x={k.x + 22} y={k.y + k.h - 22} fontFamily={fontFamily} fontSize={32} fontWeight={700} fill={C.text} opacity={k.labelOpacity} stroke={C.bg0} strokeWidth={6} paintOrder="stroke">
            RAM
          </text>
        )}
        {k.tag > 0 && big && (
          <text x={k.x + k.w - 20} y={k.y + k.h - 22} textAnchor="end" fontFamily={fontFamily} fontSize={28} fontWeight={600} fill={C.text} opacity={k.tag} stroke={C.bg0} strokeWidth={7} paintOrder="stroke">
            illustrative: 16 cores, 32 GB
          </text>
        )}
      </g>
    );
  return (
    <g opacity={k.opacity}>
      <rect x={k.x} y={k.y} width={k.w} height={k.h} rx={big ? 22 : 16} fill={alpha(C.bg1, 0.95)} stroke={alpha(C.muted, 0.6)} strokeWidth={3} />
      <clipPath id={`tankClip-${s.mode}`}>
        <rect x={k.x + 5} y={k.y + 5} width={k.w - 10} height={k.h - 10} rx={big ? 18 : 12} />
      </clipPath>
      <g clipPath={`url(#tankClip-${s.mode})`}>
        <rect x={k.x} y={Math.max(fillTop, limY)} width={k.w} height={Math.max(0, k.y + k.h - Math.max(fillTop, limY))} fill="url(#tankGrad)" opacity={0.75} />
        {fillTop < limY && <rect x={k.x} y={fillTop} width={k.w} height={limY - fillTop} fill={alpha(C.warm, 0.85)} />}
      </g>
      {k.mine.map((m, i) =>
        m > 0 ? (
          <g key={i} opacity={m}>
            <rect x={k.x - 6} y={k.y - 6} width={k.w + 12} height={k.h + 12} rx={26} fill="none" stroke={C.accentText} strokeWidth={4} strokeDasharray="14 10" />
            <text x={[200, 480, 760][i]} y={k.y + 140} textAnchor="middle" fontFamily={fontFamily} fontSize={40} fontWeight={800} fill={C.accentText}>
              mine
            </text>
          </g>
        ) : null,
      )}
      {k.limit > 0 && (
        <line x1={k.x + 8} x2={k.x + k.w - 8} y1={limY} y2={limY} stroke={C.text} strokeWidth={3} strokeDasharray="12 9" opacity={0.75} />
      )}
      {k.ghost16 > 0 && big && (
        <line x1={k.x + 8} x2={k.x + k.w - 8} y1={yOf(16)} y2={yOf(16)} stroke={C.accentText} strokeWidth={3} strokeDasharray="6 8" opacity={k.ghost16} />
      )}
    </g>
  );
};

// ---------------------------------------------------------------- icons (the five collisions)

const Icon: React.FC<{ kind: Collision; x: number; y: number; scale: number; opacity?: number }> = ({ kind, x, y, scale, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    {kind === 'memory' && (
      <>
        <rect x={-36} y={-44} width={72} height={88} rx={10} fill={C.bg1} stroke={C.muted} strokeWidth={4} />
        <rect x={-30} y={-6} width={60} height={44} fill="url(#tankGrad)" />
        <rect x={-30} y={-38} width={60} height={32} fill={C.warm} />
        <line x1={-34} x2={34} y1={-6} y2={-6} stroke={C.text} strokeWidth={3} strokeDasharray="6 5" />
      </>
    )}
    {kind === 'ghost' && (
      <>
        <rect x={-62} y={-36} width={124} height={72} rx={12} fill={alpha(C.accent, 0.18)} stroke={C.accentText} strokeWidth={4} strokeDasharray="10 7" />
        <text x={0} y={12} textAnchor="middle" fontFamily={MONO} fontSize={34} fontWeight={700} fill={C.accentText}>
          5173
        </text>
      </>
    )}
    {kind === 'lock' && (
      <>
        <path d="M -24 -6 V -24 A 24 24 0 0 1 24 -24 V -6" fill="none" stroke={C.text} strokeWidth={8} />
        <rect x={-38} y={-8} width={76} height={56} rx={10} fill={C.accent} />
        <circle cx={0} cy={16} r={7} fill={C.bg0} />
      </>
    )}
    {kind === 'emails' && (
      <>
        {[-30, 26].map((dx, i) => (
          <g key={i} transform={`translate(${dx} ${i * 10 - 6})`}>
            <rect x={-30} y={-21} width={60} height={42} rx={5} fill={C.card} stroke={C.text} strokeWidth={4} />
            <path d="M -30 -21 L 0 4 L 30 -21" fill="none" stroke={C.text} strokeWidth={4} />
          </g>
        ))}
      </>
    )}
    {kind === 'arrow' && (
      <>
        <rect x={-64} y={-8} width={50} height={14} rx={7} fill={C.warm} />
        <line x1={-8} x2={44} y1={-1} y2={-1} stroke={C.warm} strokeWidth={8} />
        <path d="M 40 -22 L 66 -1 L 40 20 Z" fill={C.warm} />
      </>
    )}
  </g>
);

// ---------------------------------------------------------------- floor

const TileIcon: React.FC<{ i: number; x: number; y: number }> = ({ i, x, y }) => {
  const name = TILES[i];
  if (name === 'CPU')
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-38} y={-38} width={76} height={76} rx={8} fill={C.card} stroke={C.accentText} strokeWidth={4} />
        <rect x={-18} y={-18} width={36} height={36} rx={4} fill={alpha(C.accent, 0.6)} />
        {[-24, 0, 24].map((d) => (
          <g key={d} stroke={C.accentText} strokeWidth={4}>
            <line x1={d} x2={d} y1={-50} y2={-38} />
            <line x1={d} x2={d} y1={38} y2={50} />
            <line y1={d} y2={d} x1={-50} x2={-38} />
            <line y1={d} y2={d} x1={38} x2={50} />
          </g>
        ))}
      </g>
    );
  if (name === 'disk')
    return (
      <g transform={`translate(${x} ${y})`} fill={C.card} stroke={C.accentText} strokeWidth={4}>
        <path d="M -44 -28 V 28 A 44 14 0 0 0 44 28 V -28" />
        <ellipse cx={0} cy={-28} rx={44} ry={14} />
        <path d="M -44 0 A 44 14 0 0 0 44 0" fill="none" />
      </g>
    );
  if (name === 'ports')
    return (
      <g transform={`translate(${x} ${y})`}>
        {[-40, 0, 40].map((dy) => (
          <g key={dy}>
            <rect x={-56} y={dy - 15} width={112} height={30} rx={6} fill={C.card} stroke={C.accentText} strokeWidth={3} />
            <rect x={-44} y={dy - 6} width={22} height={12} rx={2} fill={C.accentText} />
          </g>
        ))}
      </g>
    );
  // repo
  return (
    <g transform={`translate(${x} ${y})`}>
      {[2, 1, 0].map((k) => (
        <g key={k} transform={`translate(${k * 12 - 12} ${-k * 12 + 12})`}>
          <rect x={-34} y={-42} width={68} height={84} rx={8} fill={C.card} stroke={C.accentText} strokeWidth={3} />
          {k === 0 && [-20, -6, 8, 22].map((yy, j) => <rect key={yy} x={-22} y={yy} width={j % 2 ? 28 : 44} height={6} rx={3} fill={C.muted} />)}
        </g>
      ))}
    </g>
  );
};

const Floor: React.FC<{ s: State }> = ({ s }) => {
  if (s.floor.opacity <= 0.001) return null;
  const heads = s.lanes.filter((l) => l.appear > 0.5);
  return (
    <g opacity={s.floor.opacity}>
      {s.floor.wires > 0 &&
        heads.map((l, i) =>
          TILES.map((_, j) => (
            <line
              key={`${i}-${j}`}
              x1={l.x}
              y1={HEAD_Y + 44}
              x2={tileX(j)}
              y2={TILE.y}
              pathLength={1}
              strokeDasharray={`${s.floor.wires} 1`}
              stroke={C.accentText}
              strokeWidth={2}
              opacity={0.28 * Math.min(1, l.lit + 0.3)}
            />
          )),
        )}
      {TILES.map((name, i) => {
        const tl = s.floor.tiles[i];
        if (tl.appear <= 0.001) return null;
        const x = tileX(i);
        return (
          <g key={name} opacity={tl.appear}>
            {i !== 1 && (
              <>
                <rect
                  x={x - TILE.w / 2}
                  y={TILE.y}
                  width={TILE.w}
                  height={TILE.h}
                  rx={16}
                  fill={C.bg1}
                  stroke={tl.glow > 0 ? C.accentText : alpha(C.muted, 0.6)}
                  strokeWidth={3 + 3 * tl.glow}
                />
                {tl.glow > 0 && <rect x={x - TILE.w / 2 - 8} y={TILE.y - 8} width={TILE.w + 16} height={TILE.h + 16} rx={22} fill="none" stroke={alpha(C.accent2, 0.5 * tl.glow)} strokeWidth={10} />}
                <TileIcon i={i} x={x} y={TILE.y + TILE.h / 2} />
              </>
            )}
            <text x={x} y={TILE.labelY} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={700} fill={tl.glow > 0.3 ? C.text : C.muted}>
              {name}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const Markers: React.FC<{ s: State }> = ({ s }) => {
  const m = s.markers;
  if (m.opacity <= 0.001) return null;
  const inRow = m.pos.every((p) => p.y === MARK_Y);
  return (
    <g opacity={m.opacity}>
      {inRow &&
        COLLISIONS.map((_, i) => (
          <rect key={i} x={markX(i) - 76} y={MARK_Y - 40} width={152} height={80} rx={14} fill={alpha(C.bg1, 0.9)} stroke={alpha(C.muted, 0.45)} strokeWidth={2} strokeDasharray="8 7" />
        ))}
      {COLLISIONS.map((kind, i) =>
        m.filled[i] > 0 ? <Icon key={kind} kind={kind} x={m.pos[i].x} y={m.pos[i].y} scale={m.pos[i].scale * (0.6 + 0.4 * m.filled[i])} opacity={m.filled[i] * m.pos[i].opacity} /> : null,
      )}
    </g>
  );
};

const Sparks: React.FC<{ s: State }> = ({ s }) => (
  <>
    {s.sparks.map((sp, i) => {
      if (sp.progress <= 0 || sp.progress >= 1) return null;
      const p = sp.progress;
      const r = 24 + 110 * p;
      return (
        <g key={i} opacity={1 - p}>
          <circle cx={sp.x} cy={sp.y} r={r} fill="url(#sparkGrad)" />
          {Array.from({ length: 10 }, (_, k) => {
            const a = (k / 10) * Math.PI * 2 + 0.3;
            return (
              <line
                key={k}
                x1={sp.x + Math.cos(a) * r * 0.45}
                y1={sp.y + Math.sin(a) * r * 0.45}
                x2={sp.x + Math.cos(a) * r}
                y2={sp.y + Math.sin(a) * r}
                stroke={C.text}
                strokeWidth={5}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      );
    })}
  </>
);

// ---------------------------------------------------------------- collisions

const Panel: React.FC<{ o: number; title?: string }> = ({ o, title }) =>
  o > 0 ? (
    <g opacity={o}>
      <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={26} fill={alpha(C.bg1, 0.96)} stroke={alpha(C.accent, 0.5)} strokeWidth={3} />
      {title && (
        <text x={PANEL.x + 34} y={PANEL.y + 56} fontFamily={fontFamily} fontSize={34} fontWeight={700} fill={C.muted}>
          {title}
        </text>
      )}
    </g>
  ) : null;

const Server: React.FC<{ x: number; y: number; ghost: number; opacity: number; shake?: number }> = ({ x, y, ghost, opacity, shake = 0 }) => (
  <g transform={`translate(${x + Math.sin(shake * 30) * 10 * shake} ${y})`} opacity={opacity * (1 - 0.45 * ghost)}>
    {ghost > 0 && <rect x={-104} y={-46} width={208} height={92} rx={18} fill={alpha(C.accent2, 0.22 * ghost)} />}
    <rect x={-92} y={-36} width={184} height={72} rx={12} fill={ghost > 0.5 ? alpha(C.accent, 0.15) : C.accent} stroke={C.accentText} strokeWidth={3} strokeDasharray={ghost > 0.5 ? '10 7' : undefined} />
    <text x={0} y={11} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fontWeight={700} fill={C.text}>
      dev server
    </text>
  </g>
);

const Zombie: React.FC<{ s: State }> = ({ s }) => {
  const z = s.zombie;
  if (!z) return null;
  const slots = [220, 480, 740];
  const slotY = 430;
  return (
    <g opacity={s.panel}>
      <Panel o={1} title="ports" />
      {slots.map((x, i) => (
        <g key={x}>
          <text x={x} y={slotY - 82} textAnchor="middle" fontFamily={MONO} fontSize={44} fontWeight={700} fill={z.slotGlow[i] > 0.3 ? C.text : C.muted}>
            {5173 + i}
          </text>
          <rect x={x - 116} y={slotY - 62} width={232} height={124} rx={16} fill={C.bg0} stroke={z.slotGlow[i] > 0.3 ? C.accentText : alpha(C.muted, 0.5)} strokeWidth={3} />
        </g>
      ))}
      {z.srv3.appear > 0 && <Server x={z.srv3.x} y={z.srv3.y} ghost={z.srv3.ghost} opacity={z.srv3.appear} />}
      {z.srv4.appear > 0 && <Server x={z.srv4.x} y={z.srv4.y} ghost={0} opacity={z.srv4.appear} shake={z.srv4.shake} />}
      {z.cal > 0 && (
        <g transform={`translate(${slots[0]} ${slotY + 120}) scale(${0.6 + 0.4 * z.cal})`} opacity={z.cal}>
          <rect x={-104} y={-36} width={208} height={72} rx={12} fill={C.card} stroke={C.accentText} strokeWidth={3} />
          <rect x={-104} y={-36} width={208} height={16} rx={6} fill={C.accentText} />
          <text x={0} y={26} textAnchor="middle" fontFamily={fontFamily} fontSize={36} fontWeight={800} fill={C.text}>
            3 days
          </text>
        </g>
      )}
    </g>
  );
};

const Race: React.FC<{ s: State }> = ({ s }) => {
  const r = s.race;
  if (!r) return null;
  const card = { x: 250, y: PANEL.y + 20, w: 460, h: PANEL.h - 40 };
  const left = s.lanes[0];
  const right = s.lanes[3];
  const midY = card.y + card.h / 2;
  const colour = (k: string) => (k === 'insert' ? C.accent : k === 'reformat' ? C.accent2 : alpha(C.muted, 0.6));
  return (
    <g opacity={s.panel}>
      <path
        d={`M ${left.x} ${HEAD_Y} C ${left.x} ${midY + 120}, ${card.x - 60} ${midY}, ${card.x} ${midY}`}
        pathLength={1}
        strokeDasharray={`${r.linkA} 1`}
        fill="none"
        stroke={C.accent}
        strokeWidth={7}
      />
      <path
        d={`M ${right.x} ${HEAD_Y} C ${right.x} ${midY + 120}, ${card.x + card.w + 60} ${midY}, ${card.x + card.w} ${midY}`}
        pathLength={1}
        strokeDasharray={`${r.linkB} 1`}
        fill="none"
        stroke={C.accent2}
        strokeWidth={7}
      />
      <rect x={card.x} y={card.y} width={card.w} height={card.h} rx={18} fill={C.card} stroke={alpha(C.text, 0.4)} strokeWidth={3} />
      <rect x={card.x} y={card.y} width={card.w} height={50} rx={18} fill={alpha(C.text, 0.06)} />
      <rect x={card.x + 26} y={card.y + 20} width={120} height={12} rx={6} fill={C.muted} />
      {r.rows.map((row, i) =>
        row.grow > 0.02 ? (
          <rect key={i} x={card.x + 26 + row.indent} y={row.y - 4} width={Math.min(row.w, card.w - 70 - row.indent)} height={18 * row.grow} rx={9} fill={colour(row.kind)} opacity={row.kind === 'base' ? 1 : 0.95} />
        ) : null,
      )}
      {r.commit > 0 && r.lock < 1 && (
        <>
          {[-1, 1].map((d) => (
            <g key={d} transform={`translate(${480 + d * (1 - r.commit) * 300} ${midY})`} opacity={Math.min(1, r.commit * 3) * (1 - r.lock)}>
              <rect x={-70} y={-28} width={140} height={56} rx={28} fill={d < 0 ? C.accent : C.accent2} />
              <text x={0} y={11} textAnchor="middle" fontFamily={MONO} fontSize={30} fontWeight={700} fill={C.text}>
                commit
              </text>
            </g>
          ))}
        </>
      )}
      {r.lock > 0 && (
        <g transform={`translate(480 ${midY}) scale(${0.7 + 0.3 * r.lock + 0.12 * Math.sin(Math.PI * r.lock)})`} opacity={r.lock}>
          <rect x={-170} y={-120} width={340} height={240} rx={22} fill={alpha(C.bg0, 0.95)} stroke={C.accentText} strokeWidth={4} />
          <Icon kind="lock" x={0} y={-28} scale={1.5} />
          <text x={0} y={92} textAnchor="middle" fontFamily={MONO} fontSize={42} fontWeight={700} fill={C.text}>
            index.lock
          </text>
        </g>
      )}
    </g>
  );
};

const Envelope: React.FC<{ x: number; y: number; o: number; hot: number }> = ({ x, y, o, hot }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {hot > 0 && <rect x={-62} y={-46} width={124} height={92} rx={12} fill={alpha(C.warm, 0.3 * hot)} />}
    <rect x={-48} y={-33} width={96} height={66} rx={7} fill={C.card} stroke={hot > 0.5 ? C.warm : C.text} strokeWidth={4} />
    <path d="M -48 -33 L 0 6 L 48 -33" fill="none" stroke={hot > 0.5 ? C.warm : C.text} strokeWidth={4} />
  </g>
);

const Retry: React.FC<{ s: State }> = ({ s }) => {
  const r = s.retry;
  if (!r) return null;
  const BAR = { x: 110, w: 740, y: PANEL.y + 170 };
  const trayY = PANEL.y + 345;
  const fillCol = r.broken > 0.5 ? C.warm : C.accent;
  return (
    <g opacity={s.panel}>
      <Panel o={1} />
      <text x={BAR.x} y={BAR.y - 44} fontFamily={fontFamily} fontSize={56} fontWeight={800} fill={r.broken > 0.5 ? C.warm : C.text}>
        step {r.step} / 50
      </text>
      <rect x={BAR.x} y={BAR.y - 20} width={BAR.w} height={40} rx={20} fill={C.bg0} stroke={alpha(C.muted, 0.6)} strokeWidth={3} />
      <rect x={BAR.x} y={BAR.y - 20} width={Math.max(0, BAR.w * r.progress)} height={40} rx={20} fill={fillCol} />
      {r.broken > 0 && (
        <path
          d={`M ${BAR.x + BAR.w * 0.8 - 6} ${BAR.y - 36} l 18 22 l -16 10 l 18 26`}
          fill="none"
          stroke={C.text}
          strokeWidth={6}
          opacity={r.broken}
        />
      )}
      {r.flash > 0 && <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={26} fill={alpha(C.warm, 0.18 * r.flash)} />}
      <g opacity={r.tray}>
        <rect x={530} y={trayY - 70} width={330} height={140} rx={16} fill={C.bg0} stroke={alpha(C.muted, 0.5)} strokeWidth={3} />
        <text x={505} y={trayY + 14} textAnchor="end" fontFamily={fontFamily} fontSize={40} fontWeight={700} fill={C.muted}>
          sent ›
        </text>
      </g>
      {r.env.map((e, i) => (e.appear > 0 ? <Envelope key={i} x={e.x} y={e.y} o={e.appear} hot={e.emphasis} /> : null))}
    </g>
  );
};

const Injection: React.FC<{ s: State }> = ({ s }) => {
  const j = s.injection;
  if (!j) return null;
  const lx = s.lanes[1].x;
  const card = { x: lx - 290, y: PANEL.y - 260 * (1 - j.drop), w: 560, h: 360 };
  const textY = card.y + 196;
  return (
    <g opacity={j.drop}>
      <rect x={card.x} y={card.y} width={card.w} height={card.h} rx={20} fill={C.card} stroke={alpha(C.text, 0.45)} strokeWidth={3} />
      <rect x={card.x} y={card.y} width={card.w} height={54} rx={20} fill={alpha(C.text, 0.07)} />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={card.x + 32 + k * 26} cy={card.y + 27} r={8} fill={C.muted} />
      ))}
      <rect x={card.x + 120} y={card.y + 15} width={card.w - 150} height={24} rx={12} fill={alpha(C.muted, 0.35)} />
      <rect x={card.x + 32} y={card.y + 88} width={430} height={16} rx={8} fill={alpha(C.muted, 0.55)} />
      <rect x={card.x + 32} y={card.y + 124} width={350} height={16} rx={8} fill={alpha(C.muted, 0.55)} />
      {j.amber > 0 && <rect x={card.x + 18} y={textY - 44} width={card.w - 36} height={104} rx={12} fill={alpha(C.warm, 0.16 * j.amber)} stroke={alpha(C.warm, 0.8 * j.amber)} strokeWidth={3} />}
      {INJECTED.map((line, k) => (
        <text key={k} x={card.x + 34} y={textY + k * 44} fontFamily={fontFamily} fontSize={36} fontWeight={700} fill={j.amber > 0.5 ? C.warm : C.text}>
          {line}
        </text>
      ))}
      <rect x={card.x + 32} y={card.y + 300} width={390} height={16} rx={8} fill={alpha(C.muted, 0.55)} />
      {/* Into the lane's input stream. */}
      {[0, 1].map((k) => (
        <path key={k} d={`M ${lx - 22} ${card.y + card.h + 26 + k * 40} l 22 18 l 22 -18`} fill="none" stroke={C.accentText} strokeWidth={6} opacity={0.8} />
      ))}
      {j.arrow > 0 && (
        <g>
          <line x1={card.x + card.w - 6} y1={textY + 8} x2={card.x + card.w - 6 + j.arrow * 300} y2={textY + 8} stroke={C.warm} strokeWidth={12} strokeLinecap="round" />
          <path
            d={`M ${card.x + card.w + j.arrow * 300 - 8} ${textY - 18} l 34 26 l -34 26 Z`}
            fill={C.warm}
            opacity={Math.min(1, j.arrow * 2)}
          />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- stamps and desk

const stampWidth = (lines: string[], fs: number) => Math.max(...lines.map((l) => l.length)) * fs * 0.56 + 44;

const Stamps: React.FC<{ s: State }> = ({ s }) => {
  const st = s.stamps;
  if (!st) return null;
  return (
    <>
      {st.strip > 0 && (
        <g opacity={st.strip}>
          <rect x={STRIP.x} y={STRIP.y} width={STRIP.w} height={STRIP.h} rx={24} fill={alpha(C.bg1, 0.92)} stroke={alpha(C.muted, 0.55)} strokeWidth={3} strokeDasharray="14 10" />
          <rect x={STRIP.x + 30} y={STRIP.y - 30} width={290} height={60} rx={30} fill={C.bg0} stroke={alpha(C.muted, 0.7)} strokeWidth={3} />
          <text x={STRIP.x + 175} y={STRIP.y + 12} textAnchor="middle" fontFamily={fontFamily} fontSize={36} fontWeight={700} fill={C.text}>
            someone else
          </text>
        </g>
      )}
      {STAMPS.map((lines, i) => {
        const pop = st.pop[i];
        if (pop <= 0.001) return null;
        const fs = 40;
        const w = stampWidth(lines, fs);
        const h = lines.length * 48 + 26;
        const sc = 1 + 0.35 * (1 - pop);
        return (
          <g key={i} transform={`translate(${st.x[i]} ${st.y[i]}) rotate(-4) scale(${sc * (1 - 0.3 * st.fade[i])})`} opacity={Math.min(1, pop * 1.5) * (1 - st.fade[i])}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={alpha(C.accent, 0.12)} stroke={C.accentText} strokeWidth={5} />
            {lines.map((line, k) => (
              <text key={k} x={0} y={-h / 2 + 13 + 40 + k * 48} textAnchor="middle" fontFamily={fontFamily} fontSize={fs} fontWeight={800} fill={C.accentText}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </>
  );
};

const Desk: React.FC<{ s: State }> = ({ s }) => {
  const d = s.desk;
  if (!d) return null;
  return (
    <g>
      <g opacity={d.tray}>
        <rect x={TRAY.x} y={TRAY.y} width={TRAY.w} height={TRAY.h} rx={26} fill={alpha(C.bg1, 0.95)} stroke={alpha(C.accent, 0.6)} strokeWidth={3} />
        <rect x={TRAY.x + 30} y={TRAY.y - 32} width={250} height={64} rx={32} fill={C.bg0} stroke={C.accentText} strokeWidth={3} />
        <text x={TRAY.x + 155} y={TRAY.y + 13} textAnchor="middle" fontFamily={fontFamily} fontSize={38} fontWeight={800} fill={C.text}>
          your desk
        </text>
      </g>
      {DESK_LABELS.map((label, i) => {
        const o = d.rows[i];
        if (o <= 0.001) return null;
        const y = trayY(i);
        const g = d.glow[i];
        return (
          <g key={i} opacity={o}>
            {g > 0 && <rect x={86} y={y - 42} width={84} height={84} rx={14} fill="none" stroke={alpha(C.accent2, 0.6 * g)} strokeWidth={12} />}
            <rect x={98} y={y - 30} width={60} height={60} rx={10} fill="none" stroke={C.accentText} strokeWidth={5} />
            <text x={190} y={y + 13} fontFamily={fontFamily} fontSize={36} fontWeight={700} fill={C.text}>
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- big text (hook title, quote)

const Words: React.FC<{ words: State['title']; top: number; size: number; opacity?: number; emphColour: string; underline?: boolean }> = ({
  words,
  top,
  size,
  opacity = 1,
  emphColour,
  underline,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      columnGap: size * 0.28,
      rowGap: 0,
      fontFamily,
      fontSize: size,
      fontWeight: 800,
      lineHeight: 1.12,
      letterSpacing: -1,
      color: C.text,
      opacity,
      textAlign: 'center',
      textShadow: `0 4px 30px ${alpha(C.bg0, 0.9)}`,
    }}
  >
    {words.map((w, i) => (
      <span
        key={i}
        style={{
          opacity: w.opacity,
          color: w.emph ? emphColour : C.text,
          textDecoration: w.emph && underline ? 'underline' : undefined,
          textDecorationColor: w.emph ? emphColour : undefined,
          textDecorationThickness: 8,
          textUnderlineOffset: 12,
        }}
      >
        {w.text}
      </span>
    ))}
  </div>
);

// ---------------------------------------------------------------- the scene

export const AgentLanes: React.FC<AnimProps & LanesProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const n = s.lanes.length;
  return (
    <Stage vertical={vertical} fill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs>
          <linearGradient id="laneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.accent} stopOpacity={0.1} />
            <stop offset="1" stopColor={C.accent2} />
          </linearGradient>
          <linearGradient id="tankGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.accent2} />
            <stop offset="1" stopColor={C.accent} />
          </linearGradient>
          <radialGradient id="sparkGrad">
            <stop offset="0" stopColor={C.text} stopOpacity={0.95} />
            <stop offset="0.4" stopColor={C.accentText} stopOpacity={0.6} />
            <stop offset="1" stopColor={C.accent2} stopOpacity={0} />
          </radialGradient>
        </defs>
        {s.lanes.map((l, i) => (
          <Lane key={i} l={l} i={i} field={s.laneField} n={n} t={t} top={s.mode === 'crash' ? 250 : LANE_TOP} />
        ))}
        <Floor s={s} />
        <Tank s={s} part="body" />
        {s.dots.map((d, i) =>
          d.opacity > 0 ? <circle key={i} cx={d.x} cy={d.y} r={12} fill={C.text} stroke={C.accent2} strokeWidth={3} opacity={d.opacity} /> : null,
        )}
        <Tank s={s} part="labels" />
        {s.laptop.opacity > 0 && (
          <g opacity={s.laptop.opacity}>
            <rect x={LAPTOP.x} y={LAPTOP.y} width={LAPTOP.w} height={LAPTOP.h - 50} rx={14} fill={C.bg1} stroke={C.muted} strokeWidth={4} />
            <path d={`M ${LAPTOP.x - 22} ${LAPTOP.y + LAPTOP.h - 40} H ${LAPTOP.x + LAPTOP.w + 22} l -18 26 H ${LAPTOP.x - 4} Z`} fill={C.bg1} stroke={C.muted} strokeWidth={4} />
            <text x={LAPTOP.x + LAPTOP.w / 2} y={LAPTOP.y + LAPTOP.h + 34} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fontWeight={600} fill={C.muted}>
              laptop
            </text>
          </g>
        )}
        {s.testChip.opacity > 0 && (
          <g opacity={s.testChip.opacity} transform={`translate(${s.testChip.x} ${s.testChip.y})`}>
            <rect x={-110} y={-52} width={220} height={104} rx={22} fill={C.card} stroke={C.accentText} strokeWidth={5} />
            <text x={0} y={20} textAnchor="middle" fontFamily={MONO} fontSize={60} fontWeight={700} fill={C.text}>
              test
            </text>
          </g>
        )}
        {s.laptop.q > 0 && (
          <text
            x={s.laptop.qx}
            y={s.laptop.qy + 40 * s.laptop.qScale}
            textAnchor="middle"
            fontFamily={fontFamily}
            fontSize={130 * s.laptop.qScale}
            fontWeight={900}
            fill={C.warm}
            opacity={s.laptop.q}
            transform={`rotate(${-8 * (1 - s.laptop.q)} ${s.laptop.qx} ${s.laptop.qy})`}
          >
            ?
          </text>
        )}
        <Zombie s={s} />
        <Race s={s} />
        <Retry s={s} />
        <Injection s={s} />
        {s.counter.opacity > 0 && (
          <g opacity={s.counter.opacity}>
            <ellipse cx={480} cy={320} rx={320} ry={180} fill={alpha(C.bg0, 0.88)} />
            <text
              x={480}
              y={400}
              textAnchor="middle"
              fontFamily={fontFamily}
              fontSize={230 * (1 + 0.12 * s.counter.pop)}
              fontWeight={900}
              fill={s.counter.text === '45' ? C.warm : C.text}
            >
              {s.counter.text}
            </text>
            <text x={480} y={475} textAnchor="middle" fontFamily={fontFamily} fontSize={44} fontWeight={700} fill={C.muted}>
              workers
            </text>
          </g>
        )}
        <Stamps s={s} />
        <Desk s={s} />
        <Markers s={s} />
        <Sparks s={s} />
      </svg>
      {s.title.length > 0 && <Words words={s.title} top={0} size={78} opacity={s.titleOpacity} emphColour={C.warm} />}
      {s.quote.length > 0 && <Words words={s.quote} top={70} size={84} emphColour={C.accentText} underline />}
    </Stage>
  );
};
