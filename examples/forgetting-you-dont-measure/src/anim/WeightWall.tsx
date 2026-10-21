import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, type WallProps, type WallState } from './WeightWall.state.ts';
import { Stage, stageOf, gradientText } from './Stage.tsx';
import { AdapterColumn, BatchCard, Chip, CurvePlot, Dial, Gauge, Glass, Stamp, TaskMeter, TileWall, lerp, wallSize } from './pieces.tsx';
import { COLS, GAUGES, gaugeAfter, N, rng, type TileState } from './wall.ts';

export { frameState };
export type { WallProps };

// Single-wall layout (stage coordinates, 960 x 1090): dial, wall + conveyor, meter, gauges.
const SW = { pitch: 50, gap: 7, x: 330, y: 168, laneX0: 30 } as const;
const SW_SIZE = wallSize(SW.pitch, SW.gap);
const METER_Y = 646;
const GAUGE_Y0 = 750;
const GAUGE_DY = 84;

/** Cards sliding along the lane into the wall's left edge. */
const Conveyor: React.FC<{ s: WallState; x0: number; x1: number; y: number; opacity?: number }> = ({ s, x0, x1, y, opacity = 1 }) => (
  <div style={{ position: 'absolute', inset: 0, opacity }}>
    <div style={{ position: 'absolute', left: x0, top: y + 44, width: x1 - x0, height: 4, borderRadius: 2, background: alpha(C.muted, 0.35) }} />
    {s.cards.map((c) => (
      <BatchCard key={c.k} x={lerp(x0 + 20, x1 + 20, c.p)} y={y} white={c.white} scale={c.p > 0.85 ? lerp(1, 0.55, (c.p - 0.85) / 0.3) : 1} opacity={c.opacity} />
    ))}
  </div>
);

const Gauges: React.FC<{ s: WallState; y0?: number; opacity?: number }> = ({ s, y0 = GAUGE_Y0, opacity = 1 }) => (
  <div style={{ position: 'absolute', inset: 0, opacity }}>
    {GAUGES.map((g, i) => (
      <Gauge key={g.name} x={20} y={y0 + i * GAUGE_DY} w={920} name={g.name} appear={s.gauges[i].appear} drop={s.gauges[i].drop} after={gaugeAfter(g.drop)} highlight={s.gauges[i].highlight} />
    ))}
  </div>
);

const Hook: React.FC<{ s: WallState; t: number }> = ({ s }) => {
  const pitch = 60;
  const gap = 9;
  const size = wallSize(pitch, gap);
  const x = 960 - size.w - 4;
  const y = 470;
  const cmd = '$ cat notes.md';
  const typed = cmd.slice(0, Math.round(cmd.length * s.chip.typed));
  return (
    <>
      {/* Terminal chip: the new skill in one line. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          margin: '0 auto',
          top: 330,
          width: 'fit-content',
          height: 92,
          borderRadius: 20,
          background: C.card,
          border: `2px solid ${alpha(C.accentText, 0.5)}`,
          opacity: s.chip.appear,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '0 28px',
          fontSize: 38,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        <span>{typed}</span>
        <span style={{ color: C.muted, opacity: s.chip.out }}>→</span>
        <span style={{ opacity: s.chip.out }}>hello</span>
        <span style={{ color: C.muted, fontSize: 30, opacity: s.chip.out }}>[exit 0]</span>
        <span style={{ width: 52, height: 52, borderRadius: 26, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, opacity: s.chip.tick, transform: `scale(${0.6 + 0.4 * s.chip.tick})` }}>
          ✓
        </span>
      </div>
      <Conveyor s={s} x0={0} x1={x - 34} y={y + size.h / 2} />
      <TileWall x={x} y={y} pitch={pitch} gap={gap} tiles={s.tiles} opacity={s.wall.appear} />
    </>
  );
};

const BIG_TILES: TileState[] = (() => {
  const r = rng(3);
  return Array.from({ length: 20 * 14 }, () => {
    const v = r();
    return { paint: v < 0.12 ? 1 : 0, dark: 0, flash: 0 };
  });
})();

const Paper: React.FC<{ s: WallState; tiles: TileState[] }> = ({ s, tiles }) => {
  const bigPitch = 46;
  const bigCols = 20;
  const bigRows = 13;
  const bw = bigCols * bigPitch - 6;
  const bh = bigRows * bigPitch - 6;
  const bx = (960 - bw) / 2;
  const by = 130 + (1 - s.big.rise) * 700;
  // The big wall reuses TileWall row-major indexing on its own 20-column grid.
  const big: React.ReactNode[] = [];
  for (let r = 0; r < bigRows; r++)
    for (let c = 0; c < bigCols; c++) {
      const p = BIG_TILES[r * bigCols + c].paint;
      big.push(
        <div
          key={`${r}-${c}`}
          style={{ position: 'absolute', left: c * bigPitch, top: r * bigPitch, width: bigPitch - 6, height: bigPitch - 6, borderRadius: 6, background: p ? GRADIENT : alpha(C.text, 0.5) }}
        />,
      );
    }
  return (
    <>
      <div style={{ position: 'absolute', left: bx, top: by, width: bw, height: bh, opacity: 0.55 * s.big.rise }}>{big}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', opacity: s.big.tag }}>
        <Chip size={40}>recent world-model paper · 397B</Chip>
      </div>
      <div style={{ position: 'absolute', right: 30, top: 170, opacity: s.big.mixed, transform: `translateY(${(1 - s.big.mixed) * 20}px)` }}>
        <Chip size={36} accent>
          general text mixed in ✓
        </Chip>
      </div>
      {/* The small wall, in front. */}
      <TileWall x={30} y={790} pitch={26} gap={5} tiles={tiles} />
      <div style={{ position: 'absolute', left: 30, top: 1040, fontSize: 30, fontWeight: 700, color: C.muted }}>mine: 0.5B</div>
      {/* The gauge nobody filled in. */}
      <div
        style={{
          position: 'absolute',
          left: 400,
          top: 830,
          width: 540,
          height: 150,
          borderRadius: 24,
          background: C.card,
          border: `3px solid ${alpha(C.accentText, 0.4 + 0.5 * s.big.pulse)}`,
          boxShadow: `0 0 ${30 * s.big.pulse}px ${alpha(C.accent, 0.6 * s.big.pulse)}`,
          opacity: s.big.gauge,
          transform: `scale(${0.9 + 0.1 * s.big.gauge})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          fontSize: 54,
          fontWeight: 800,
        }}
      >
        <span>forgetting:</span>
        <span style={{ fontSize: 84, transform: `scale(${1 + 0.15 * s.big.pulse})`, ...gradientText }}>?</span>
      </div>
    </>
  );
};

const LEFT_COLS = 11;

const MiniWalls: React.FC<{ s: WallState; t: number; y: number; pitch: number; gap: number; labels?: boolean; leftTiles: TileState[]; jitter: number; glass: number; column: number; fill: number; leftAppear: number; rightAppear: number }> = ({
  s,
  t,
  y,
  pitch,
  gap,
  labels = true,
  leftTiles,
  jitter,
  glass,
  column,
  fill,
  leftAppear,
  rightAppear,
}) => {
  const lw = wallSize(pitch, gap, LEFT_COLS);
  const lx = 10;
  const rx = 960 - lw.w - pitch - 18;
  const white: TileState[] = Array.from({ length: N }, () => ({ paint: 0, dark: 0, flash: 0 }));
  const labelSize = 46;
  return (
    <>
      {labels && (
        <>
          <div style={{ position: 'absolute', left: lx - 40, width: lw.w + 80, top: y - 270, textAlign: 'center', fontSize: labelSize, fontWeight: 900, whiteSpace: 'nowrap', opacity: leftAppear }}>
            Full fine-tuning
          </div>
          <div style={{ position: 'absolute', left: rx, width: lw.w + pitch + 18, top: y - 270, textAlign: 'center', fontSize: labelSize, fontWeight: 900, opacity: rightAppear, ...gradientText }}>
            LoRA
          </div>
        </>
      )}
      <TileWall x={lx} y={y} pitch={pitch} gap={gap} cols={LEFT_COLS} tiles={leftTiles} jitter={jitter} t={t} opacity={leftAppear} />
      {s.methods.leftCards.map((c, i) => (
        <BatchCard key={`l${i}`} x={lx + (c.col + 0.5) * pitch} y={lerp(y - 170, y + pitch * 2, c.p)} white={false} w={pitch * 1.2} h={pitch * 1.5} opacity={c.opacity * leftAppear} />
      ))}
      <TileWall x={rx} y={y} pitch={pitch} gap={gap} cols={LEFT_COLS} tiles={white} opacity={rightAppear} />
      <Glass x={rx} y={y} w={lw.w} h={lw.h} appear={glass} lock={pitch * 1.3} />
      <AdapterColumn x={rx + lw.w + 18} y={y} pitch={pitch} gap={gap} appear={column} fill={fill} />
      {s.methods.rightCards.map((c, i) => (
        <BatchCard
          key={`r${i}`}
          x={rx + lw.w + 18 + (pitch - gap) / 2}
          y={lerp(y - 170, y + pitch * 2, c.p)}
          white={false}
          w={pitch * 1.2}
          h={pitch * 1.5}
          opacity={c.opacity * column}
        />
      ))}
    </>
  );
};

const Methods: React.FC<{ s: WallState; t: number }> = ({ s, t }) => {
  const m = s.methods;
  const y = 420;
  const pitch = 38;
  const lw = wallSize(pitch, 5, LEFT_COLS);
  return (
    <>
      <MiniWalls
        s={s}
        t={t}
        y={y}
        pitch={pitch}
        gap={5}
        leftTiles={m.leftTiles}
        jitter={m.left.jitter}
        glass={m.right.glass}
        column={m.right.column}
        fill={m.right.fill}
        leftAppear={m.left.appear}
        rightAppear={m.right.appear}
      />
      <div style={{ position: 'absolute', left: 10, width: lw.w, top: y + lw.h + 50, textAlign: 'center', fontSize: 36, fontWeight: 700, color: C.muted, opacity: m.left.jitter }}>
        any weight
        <br />
        can change
      </div>
      <div style={{ position: 'absolute', right: 0, width: lw.w + 60, top: y + lw.h + 50, textAlign: 'center', fontSize: 36, fontWeight: 700, color: C.muted, opacity: m.notes }}>
        model frozen,
        <br />
        small add-on trained
      </div>
    </>
  );
};

const CAPS = ['ARC-Challenge', 'ARC-Easy', 'HellaSwag', 'WinoGrande', 'Instruction-following', 'Unseen commands'];

const SCATTER: TileState[] = (() => {
  const r = rng(19);
  return Array.from({ length: N }, () => {
    const v = r();
    return { paint: v < 0.2 ? 1 : 0, dark: v > 0.2 && v < 0.42 ? 1 : 0, flash: 0 };
  });
})();

const Close: React.FC<{ s: WallState; t: number }> = ({ s, t }) => {
  const c = s.close;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontSize: 64, fontWeight: 800, lineHeight: 1.12, opacity: c.quote, letterSpacing: '-0.01em' }}>
        Check <span style={gradientText}>more than one</span>
        <br />
        capability.
      </div>
      {CAPS.map((name, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const lit = c.caps[i];
        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              left: col * 486,
              top: 190 + row * 96,
              width: 474,
              height: 80,
              borderRadius: 18,
              background: C.card,
              border: `3px solid ${lit > 0.5 ? alpha(C.accentText, 0.9) : alpha(C.muted, 0.25)}`,
              boxShadow: lit > 0.5 ? `0 0 24px ${alpha(C.accent, 0.45 * lit)}` : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 20px',
              fontSize: 32,
              fontWeight: 700,
              color: lit > 0.5 ? C.text : C.muted,
              opacity: 0.35 + 0.65 * lit,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 17, background: lit > 0.5 ? GRADIENT : alpha(C.muted, 0.3), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {lit > 0.5 ? '✓' : ''}
            </span>
            {name}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontSize: 64, fontWeight: 800, opacity: c.pick, transform: `translateY(${(1 - c.pick) * 20}px)` }}>
        Pick the method <span style={gradientText}>on purpose.</span>
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: c.pick }}>
        <MiniWalls
          s={s}
          t={t}
          y={760}
          pitch={28}
          gap={4}
          labels={false}
          leftTiles={SCATTER}
          jitter={1}
          glass={1}
          column={1}
          fill={1}
          leftAppear={1}
          rightAppear={1}
        />
        <div style={{ position: 'absolute', left: 10, width: 300, top: 680, textAlign: 'center', fontSize: 34, fontWeight: 800 }}>Full fine-tuning</div>
        <div style={{ position: 'absolute', right: 0, width: 360, top: 680, textAlign: 'center', fontSize: 34, fontWeight: 800, ...gradientText }}>LoRA</div>
      </div>
    </>
  );
};

/** Dial, wall, conveyor, meter and gauges: the single-wall scenes (test, knob, zero, replay). */
const Single: React.FC<{ s: WallState; t: number }> = ({ s }) => {
  const mode = s.mode;
  const sh = s.wall.shrink;
  // Replay line 2: the wall shrinks to the top centre; the curve takes the lower part.
  const scale = lerp(1, 0.46, sh);
  const wx = lerp(SW.x, (960 - SW_SIZE.w * 0.46) / 2, sh);
  const wy = lerp(SW.y, 10, sh);
  const showDial = mode === 'knob' || mode === 'zero' || mode === 'replay';
  // What leaves (dial, lane, gauges) is gone in the first 40 % of the shrink, before the wall
  // and the curve pass over it; the task meter fades out in place and back in at its new spot,
  // instead of sliding down through the gauges.
  const leave = 1 - Math.min(1, sh / 0.4);
  const meterY = sh < 0.5 ? METER_Y : 990;
  const meterO = sh > 0 ? Math.abs(1 - 2 * sh) : 1;
  const showConveyor = mode !== 'test';
  return (
    <>
      {showDial && <Dial x={130} y={0} w={700} pos={s.dial.pos} appear={s.dial.appear * leave} />}
      {mode === 'knob' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: METER_Y - 6, display: 'flex', justifyContent: 'center', opacity: s.dial.seeds }}>
          <Chip size={36}>3 seeds each</Chip>
        </div>
      )}
      {mode === 'test' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: s.model.appear }}>
          <Chip size={42} accent>
            0.5B model · toy scale
          </Chip>
          <div style={{ fontSize: 28, fontWeight: 600, color: C.muted }}>Qwen2.5-0.5B-Instruct</div>
        </div>
      )}
      {showConveyor && <Conveyor s={s} x0={SW.laneX0} x1={SW.x - 50} y={SW.y + SW_SIZE.h / 2} opacity={leave} />}
      <div style={{ position: 'absolute', left: wx, top: wy, width: SW_SIZE.w, height: SW_SIZE.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <TileWall x={0} y={0} pitch={SW.pitch} gap={SW.gap} tiles={s.tiles} dim={s.wall.dim} opacity={s.wall.appear} />
      </div>
      {mode === 'test' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: METER_Y, display: 'flex', justifyContent: 'center', opacity: s.model.tag }}>
          <Chip size={38}>
            before <span style={{ color: C.accentText }}>→</span> after
          </Chip>
        </div>
      )}
      {(mode === 'zero' || mode === 'replay') && (
        <div style={{ position: 'absolute', inset: 0, opacity: meterO }}>
        <TaskMeter
          x={20}
          y={meterY}
          w={920}
          appear={s.meter.appear}
          fill={s.meter.fill}
          label="Terminal task"
          from={mode === 'zero' ? '0.36' : undefined}
          to={mode === 'zero' ? '0.90' : '≈0.90'}
          done={s.meter.done}
        />
        </div>
      )}
      <Gauges s={s} opacity={leave} />
      {mode === 'zero' && (
        <div style={{ position: 'absolute', left: 0, top: SW.y + 40, width: 960, display: 'flex', justifyContent: 'center', gap: 24 }}>
          {[
            { v: '−0.078', l: 'average', p: s.stats.avg },
            { v: '−0.15', l: 'worst: ARC-Easy', p: s.stats.worst },
          ].map((x) => (
            <div
              key={x.v}
              style={{
                width: 450,
                height: 330,
                borderRadius: 32,
                background: alpha(C.bg1, 0.92),
                border: `3px solid ${alpha(C.accentText, 0.7)}`,
                boxShadow: `0 20px 60px ${alpha('#000000', 0.5)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                opacity: x.p,
                transform: `scale(${0.85 + 0.15 * x.p})`,
              }}
            >
              <div style={{ fontSize: 108, fontWeight: 900, letterSpacing: '-0.03em', ...gradientText }}>{x.v}</div>
              <div style={{ fontSize: 38, fontWeight: 700, color: C.text }}>{x.l}</div>
            </div>
          ))}
        </div>
      )}
      {mode === 'replay' && s.curve.appear > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 250, width: 960, height: 700, opacity: s.curve.appear }}>
          <CurvePlot w={960} h={700} fullSeg={s.curve.seg} fullP0={s.curve.p0} appear={1} />
          {/* The jump from 0 % to 10 %: most of the loss back. */}
          <div style={{ position: 'absolute', left: 380, top: 390, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
            <Stamp text="≈73% back" appear={s.curve.stamp} size={68} strong rotate={-4} />
            <div style={{ fontSize: 32, fontWeight: 700, color: C.muted, opacity: s.curve.sub, marginLeft: 10 }}>≈82% on the worst benchmark</div>
          </div>
          <div style={{ position: 'absolute', right: 20, top: 110, opacity: s.curve.more, fontSize: 34, fontWeight: 700, color: C.text }}>little more past 25%</div>
          <div style={{ position: 'absolute', right: 0, top: -20, opacity: s.curve.known }}>
            <Chip size={30}>a known result</Chip>
          </div>
        </div>
      )}
    </>
  );
};

export const WeightWall: React.FC<AnimProps & WallProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props as WallProps, t, beats, dur);
  stageOf(vertical);
  const white: TileState[] = s.tiles;
  return (
    <Stage vertical={vertical} fill>
      {s.mode === 'hook' && <Hook s={s} t={t} />}
      {s.mode === 'paper' && <Paper s={s} tiles={white} />}
      {(s.mode === 'test' || s.mode === 'knob' || s.mode === 'zero' || s.mode === 'replay') && <Single s={s} t={t} />}
      {s.mode === 'methods' && <Methods s={s} t={t} />}
      {s.mode === 'close' && <Close s={s} t={t} />}
    </Stage>
  );
};

// Keep the column count visible to readers of the layout.
export const WALL_COLS = COLS;
