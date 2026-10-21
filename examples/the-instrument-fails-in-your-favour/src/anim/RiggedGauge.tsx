import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas, Gauge, Stamp } from './pieces.tsx';
import { EXPECTED, frameState, type GaugeState, type RiggedProps } from './RiggedGauge.state.ts';

const toSpec = (s: GaugeState, label?: string, labelSize?: number) => ({
  cx: s.cx,
  cy: s.cy,
  r: s.r,
  value: s.value,
  crack: s.crack,
  opacity: s.opacity,
  expected: { ...EXPECTED, opacity: s.expected, label, labelSize },
});

const Pill: React.FC<{ x: number; y: number; text: string; p: number; color?: string; size?: number; dashed?: boolean }> = ({
  x,
  y,
  text,
  p,
  color = C.accentText,
  size = 34,
  dashed,
}) => {
  if (p <= 0) return null;
  const w = text.length * size * 0.6 + size * 1.3;
  const h = size * 1.7;
  return (
    <g opacity={p} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * p})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={alpha(C.bg1, 0.95)} stroke={color} strokeWidth={3} strokeDasharray={dashed ? '10 8' : undefined} />
      <text x={0} y={size * 0.36} fontSize={size} fontWeight={700} textAnchor="middle" fill={color}>
        {text}
      </text>
    </g>
  );
};

const CODE = ['def score(run):', '  hits = 0', '  for msg in run:', '    if KEY in msg:', '      hits += 1', '  return hits'];

export const RiggedGauge: React.FC<AnimProps & RiggedProps> = (p) => {
  const s = frameState({ mode: p.mode }, p.t, p.beats, p.dur);

  if (s.mode === 'hook') {
    const big = s.main.r > 200;
    return (
      <Canvas vertical={p.vertical}>
        {s.row.map((g, i) => (
          <Gauge key={i} g={toSpec(g)} />
        ))}
        <Gauge
          g={{
            ...toSpec(s.main),
            expected: {
              ...EXPECTED,
              opacity: s.main.expected * (big ? 1 : 0.9),
              label: big ? 'what I expected' : undefined,
              labelSize: 46,
              labelAt: { x: 480, y: 112, anchor: 'middle' },
            },
          }}
        />
      </Canvas>
    );
  }

  if (s.mode === 'setup') {
    const g = s.main;
    const front = s.flip < 0.5;
    const sx = Math.max(0.02, Math.abs(Math.cos(Math.PI * s.flip)));
    const tags = [
      { x: 330, text: 'detector' },
      { x: 590, text: 'scorer' },
      { x: 830, text: 'answer key' },
    ];
    return (
      <Canvas vertical={p.vertical}>
        {/* agent transcripts */}
        <g opacity={s.transcripts}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${20 + i * 22} ${330 + i * 34})`}>
              <rect width={190} height={250} rx={18} fill={C.card} stroke={alpha(C.muted, 0.5)} strokeWidth={2} />
              <text x={20} y={44} fontSize={26} fontWeight={700} fill={C.accentText}>
                agent
              </text>
              {[0, 1, 2, 3, 4].map((k) => (
                <rect key={k} x={20} y={70 + k * 34} width={[150, 110, 140, 90, 130][k]} height={12} rx={6} fill={alpha(C.muted, 0.45)} />
              ))}
            </g>
          ))}
          <text x={140} y={690} fontSize={32} fontWeight={600} textAnchor="middle" fill={C.muted}>
            agent runs
          </text>
        </g>
        <path
          d={`M 254 470 C 300 470, 320 470, ${g.cx - g.r} 470`}
          stroke={C.accentText}
          strokeWidth={5}
          fill="none"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - s.wire}
          opacity={s.wire > 0 ? 1 - s.flip : 0}
        />
        <g transform={`translate(${g.cx} 0) scale(${sx} 1) translate(${-g.cx} 0)`}>
          {front ? (
            <Gauge g={{ ...toSpec(g), expected: { ...EXPECTED, opacity: g.expected } }} />
          ) : (
            <g>
              <circle cx={g.cx} cy={g.cy} r={g.r} fill={C.plate} stroke={alpha(C.muted, 0.6)} strokeWidth={6} />
              {CODE.map((l, i) => (
                <text key={i} x={g.cx - g.r * 0.7} y={g.cy - g.r * 0.45 + i * 42} fontSize={32} fontWeight={600} fill={alpha(C.text, 0.85)} style={{ whiteSpace: 'pre' }}>
                  {l}
                </text>
              ))}
              <rect x={g.cx - 95} y={g.cy + g.r * 0.62} width={190} height={50} rx={25} fill={alpha(C.rose, 0.18)} stroke={C.rose} strokeWidth={3} />
              <text x={g.cx} y={g.cy + g.r * 0.62 + 35} fontSize={30} fontWeight={800} textAnchor="middle" fill={C.roseText}>
                tests: 0
              </text>
            </g>
          )}
        </g>
        {tags.map((tg, i) => (
          <Pill key={tg.text} x={tg.x} y={790} text={tg.text} p={s.tags[i]} />
        ))}
        <Stamp x={480} y={850} text="" lines={['UNVERIFIED', 'SOFTWARE TOO']} size={74} color={C.roseText} scale={s.stamp.scale} opacity={s.stamp.opacity} rotate={-6} />
      </Canvas>
    );
  }

  // close
  const boxes = [
    { x: 160, y: 430, name: 'service', badge: '✓ tests' },
    { x: 800, y: 430, name: 'pipeline', badge: '✓ review' },
    { x: 160, y: 930, name: 'database', badge: '✓ monitoring' },
    { x: 800, y: 930, name: 'frontend', badge: '✓ users' },
  ];
  const g = s.main;
  return (
    <Canvas vertical={p.vertical}>
      <text x={480} y={110} fontSize={84} fontWeight={800} textAnchor="middle" fill={C.text} opacity={s.quote[0]}>
        Measure it.
      </text>
      <g opacity={s.quote[1]}>
        <text x={480} y={215} fontSize={60} fontWeight={800} textAnchor="middle" fill={C.text}>
          Trust the measurement <tspan fill={C.accentText}>least.</tspan>
        </text>
        <rect x={700} y={232} width={160} height={7} rx={3} fill={C.accent2} />
      </g>
      {boxes.map((b, i) => (
        <g key={b.name} opacity={s.boxes[i]}>
          <line x1={b.x} y1={b.y} x2={g.cx} y2={g.cy} stroke={alpha(C.muted, 0.3)} strokeWidth={3} />
          <rect x={b.x - 135} y={b.y - 70} width={270} height={140} rx={22} fill={C.card} stroke={alpha(C.accentText, 0.5)} strokeWidth={3} />
          <text x={b.x} y={b.y - 12} fontSize={36} fontWeight={700} textAnchor="middle" fill={C.text}>
            {b.name}
          </text>
          <rect x={b.x - 110} y={b.y + 10} width={220} height={44} rx={22} fill={alpha(C.ok, 0.16)} stroke={C.ok} strokeWidth={2} />
          <text x={b.x} y={b.y + 42} fontSize={28} fontWeight={700} textAnchor="middle" fill={C.ok}>
            {b.badge}
          </text>
        </g>
      ))}
      <Gauge g={{ ...toSpec(g), expected: { ...EXPECTED, opacity: 1 } }} />
      <g opacity={Math.max(...s.boxes)}>
        <text x={480} y={g.cy + g.r + 62} fontSize={36} fontWeight={700} textAnchor="middle" fill={C.text}>
          the eval harness
        </text>
      </g>
      <Pill x={480} y={g.cy + g.r + 130} text="no checks" p={s.empty} color={C.roseText} size={40} dashed />
    </Canvas>
  );
};
