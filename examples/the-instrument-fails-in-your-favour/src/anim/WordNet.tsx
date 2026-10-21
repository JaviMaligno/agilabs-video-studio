import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { CaseTag, Canvas, Gauge, Magnifier } from './pieces.tsx';
import { EXPECTED } from './RiggedGauge.state.ts';
import { CHIPS, frameState, type WordNetProps } from './WordNet.state.ts';

const COLS = 4;
const CW = 234;
const CH = 72;
const GAP = 8;
const X0 = 0;
const Y0 = 350;
const chipXY = (i: number) => ({ x: X0 + (i % COLS) * (CW + GAP), y: Y0 + Math.floor(i / COLS) * (CH + 10) });

const Bubble: React.FC<{ x: number; y: number; text: string; opacity: number; color: string }> = ({ x, y, text, opacity, color }) => {
  const w = text.length * 18 + 48;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y - 34} width={w} height={68} rx={34} fill={alpha(color, 0.22)} stroke={color} strokeWidth={3} />
      <text x={x} y={y + 11} fontSize={32} fontWeight={700} textAnchor="middle" fill={C.text}>
        {text}
      </text>
    </g>
  );
};

export const WordNet: React.FC<AnimProps & WordNetProps> = (p) => {
  const s = frameState({}, p.t, p.beats, p.dur);
  const lensI = Math.min(18, Math.floor(s.lens.at));
  const a = chipXY(lensI);
  const bb = chipXY(Math.min(18, lensI + 1));
  const f = s.lens.at - lensI;
  const lx = a.x + (bb.x - a.x) * f + CW / 2;
  const ly = a.y + (bb.y - a.y) * f + CH / 2;
  const after = s.gauge.after > 0;
  return (
    <Canvas vertical={p.vertical}>
      <CaseTag n="1" text="a word detector" opacity={s.tag} />

      {/* the two agent panes and the request that travels between them */}
      <g opacity={s.panes}>
        {[
          { x: 0, name: 'agent A' },
          { x: 500, name: 'agent B' },
        ].map((pn) => (
          <g key={pn.name}>
            <rect x={pn.x} y={100} width={460} height={210} rx={22} fill={C.card} stroke={alpha(C.muted, 0.45)} strokeWidth={2} />
            <text x={pn.x + 24} y={146} fontSize={30} fontWeight={700} fill={C.muted}>
              {pn.name}
            </text>
          </g>
        ))}
        <Bubble x={230 + 500 * s.ask.fly} y={200} text="wait, I'm in that file" opacity={s.ask.opacity} color={C.accent} />
        <Bubble x={730 - 500 * s.reply.fly} y={268} text="go ahead" opacity={s.reply.opacity} color={C.accent2} />
      </g>

      {/* the feed of messages and the net cast over it */}
      <clipPath id="feedclip">
        <rect x={0} y={340} width={960} height={420} rx={24} />
      </clipPath>
      <g clipPath="url(#feedclip)" opacity={s.feed.opacity}>
        {Array.from({ length: 14 }, (_, k) => {
          const y = 360 + ((k * 64 - s.feed.offset) % 896 + 896) % 896;
          return <rect key={k} x={30 + (k % 3) * 40} y={y} width={[520, 700, 410, 620, 560][k % 5]} height={34} rx={17} fill={alpha(C.muted, 0.3)} />;
        })}
      </g>
      <g opacity={s.net}>
        <rect x={0} y={340} width={960} height={420} rx={24} fill={alpha(C.accent, 0.08)} stroke={C.accentText} strokeWidth={4} strokeDasharray="18 12" />
        {Array.from({ length: 7 }, (_, k) => (
          <line key={k} x1={120 + k * 120} y1={340} x2={120 + k * 120 - 60} y2={760} stroke={alpha(C.accentText, 0.25)} strokeWidth={2} />
        ))}
        <rect x={210} y={312} width={540} height={60} rx={30} fill={C.bg1} stroke={C.accentText} strokeWidth={3} />
        <text x={480} y={353} fontSize={34} fontWeight={800} textAnchor="middle" fill={C.accentText}>
          /wait|hold|go ahead/
        </text>
      </g>

      {/* the haul: 19 chips */}
      {CHIPS.map(([pre, kw, post], i) => {
        const c = s.chips[i];
        if (c.pop <= 0) return null;
        const { x, y } = chipXY(i);
        const dim = 1 - 0.78 * c.grey;
        return (
          <g key={i} opacity={c.pop * dim} transform={`translate(${x + CW / 2} ${y + CH / 2}) scale(${0.7 + 0.3 * c.pop}) translate(${-CW / 2} ${-CH / 2})`}>
            <rect width={CW} height={CH} rx={16} fill={C.card} stroke={c.keep > 0 ? alpha(C.ok, 0.4 + 0.6 * c.keep) : alpha(C.muted, 0.4)} strokeWidth={c.keep > 0 ? 4 : 2} />
            <text x={14} y={46} fontSize={24} fontWeight={600} fill={C.text} style={{ whiteSpace: 'pre' }}>
              {pre}
              <tspan fill={C.accentText} fontWeight={800} textDecoration="underline">
                {kw}
              </tspan>
              {post}
            </text>
            {c.tick > 0 && (
              <g opacity={c.tick} transform={`translate(${CW - 6} 4)`}>
                <circle r={17} fill={C.ok} />
                <path d="M -8 0 L -2 7 L 9 -7" stroke={C.bg0} strokeWidth={4.5} fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}

      {/* count line */}
      <g opacity={s.count * (1 - s.mentions[0].scrim)}>
        <text x={480} y={250} fontSize={64} fontWeight={800} textAnchor="middle" fill={after ? C.ok : C.text}>
          {after ? '3 real · all 3 closed' : '19 found · 5 closed'}
        </text>
      </g>

      <Magnifier x={lx} y={ly} m={58} opacity={s.lens.opacity} />

      <text x={10} y={1040} fontSize={38} fontWeight={800} fill={C.roseText} opacity={s.falsePos}>
        16 false positives
      </text>

      <Gauge
        g={{
          cx: 690,
          cy: 925,
          r: 150,
          value: s.gauge.value,
          opacity: s.gauge.opacity,
          lift: s.gauge.lift,
          expected: { ...EXPECTED, opacity: 1, label: "agents don't finish", labelSize: 36, labelAt: { x: 500, y: 850, anchor: 'end' } },
          magnets: [{ v: 0.18, opacity: 1, out: s.gauge.magnetOut, glow: s.gauge.lift }],
          readout: after ? 'closed 3 / 3' : 'closed 5 / 19',
          readoutSize: 32,
          readoutColor: after ? C.ok : C.text,
        }}
      />

      {/* two of the greyed chips, up close: mentions, not requests */}
      <rect x={-20} y={330} width={1000} height={440} rx={24} fill={alpha(C.bg0, 0.8 * s.mentions[0].scrim)} />
      {[
        { pre: "I'll ", kw: 'wait', post: ' for CI before merging', tag: 'mention' },
        { pre: 'they said ', kw: 'go ahead', post: ' yesterday', tag: 'not a request' },
      ].map((m, i) => {
        const q = s.mentions[i].pop;
        if (q <= 0) return null;
        const y = 395 + i * 190;
        return (
          <g key={i} opacity={q} transform={`translate(480 ${y + 60}) scale(${0.6 + 0.4 * q}) translate(-480 ${-(y + 60)})`}>
            <rect x={20} y={y} width={920} height={120} rx={22} fill={C.card} stroke={alpha(C.muted, 0.6)} strokeWidth={3} />
            <text x={50} y={y + 75} fontSize={42} fontWeight={600} fill={C.text} style={{ whiteSpace: 'pre' }}>
              {m.pre}
              <tspan fill={C.roseText} fontWeight={800} textDecoration="underline">
                {m.kw}
              </tspan>
              {m.post}
            </text>
            <rect x={940 - m.tag.length * 19 - 40} y={y - 26} width={m.tag.length * 19 + 40} height={50} rx={25} fill={C.rose} />
            <text x={940 - (m.tag.length * 19 + 40) / 2} y={y + 9} fontSize={30} fontWeight={800} textAnchor="middle" fill={C.text}>
              {m.tag}
            </text>
          </g>
        );
      })}
    </Canvas>
  );
};
