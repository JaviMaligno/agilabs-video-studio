// Four doors around the house robot: the four ways to teach an AI, unlabelled in the intro and
// labelled in chapter 6. See FourDoors.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Robot, glow } from './office.tsx';
import { Door, PriceTag, ShopCanvas, type DoorIcon } from './shop.tsx';
import { DOOR_LABELS, FREE, SIDES, TITLE, frameState, type FourDoorsProps } from './FourDoors.state.ts';

export { frameState };
export type { FourDoorsProps };

const ICONS: DoorIcon[] = ['note', 'binder', 'pen', 'sheet'];
const XS = [300, 560, 1300, 1610];
const WS = [150, 210, 280, 200];
const HS = [260, 380, 520, 380];

/** Landscape layout per mode (the vertical cut reuses it, scaled into its stage). */
const LAYOUT = {
  intro: { floor: 800, scale: 1, robot: { x: 960, s: 0.85 } },
  labelled: { floor: 650, scale: 0.8, robot: { x: 960, s: 0.68 } },
};

export const FourDoors: React.FC<AnimProps & FourDoorsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const mode = p.mode === 'labelled' ? 'labelled' : 'intro';
  const Lm = LAYOUT[mode];
  const floor = Lm.floor;
  const hs = HS.map((h) => h * Lm.scale);
  const ws = WS.map((w) => w * (mode === 'labelled' ? 0.9 : 1));
  const robotY = floor - Lm.robot.s * 454 - 8 * s.bob;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <ShopCanvas vertical={p.vertical}>
        <rect x={180} y={floor} width={1560} height={5} rx={2} fill={alpha(C.muted, 0.3)} />
        {/* "one thing": a single big door behind the robot, before the four */}
        <Door x={960} floor={floor} w={320} h={560} appear={s.one} />
        {s.doors.map((d, i) => (
          <Door
            key={i}
            x={XS[i]}
            floor={floor}
            w={ws[i]}
            h={hs[i]}
            appear={d.appear}
            lit={d.lit}
            glowA={d.glow}
            open={d.open}
            crack={i === 2 ? s.crack : 0}
            icon={mode === 'labelled' ? ICONS[i] : undefined}
            iconOn={d.label}
            iconY={i === 0 ? 0.72 : 0.25}
            color={i === 2 && s.crack > 0.3 ? C.marker : C.accentText}
          />
        ))}
        {/* the tag hangs from a nail at the top of the smallest door */}
        {s.tag > 0 && <circle cx={XS[0]} cy={floor - hs[0] + 8} r={6} fill={C.text} opacity={s.tag} />}
        <PriceTag x={XS[0]} y={floor - hs[0] + 8} text={FREE} size={Math.round(40 * Lm.scale ** 0.5)} p={s.tag} swing={s.swing} />
        <Robot x={Lm.robot.x} y={robotY} s={Lm.robot.s} blink={s.blink} armUp={s.arm} face={s.right ? -1 : 1} />

        {/* the title (intro) */}
        {s.title > 0 && (
          <text x={960} y={250 - 20 * (1 - s.title)} textAnchor="middle" fontSize={92} fontWeight={800} fill={C.text} opacity={s.title} letterSpacing={-2} style={glow(C.accentText, 0.5 * s.title)}>
            {TITLE}
          </text>
        )}

        {/* labels under each door, side headings above (labelled) */}
        {mode === 'labelled' &&
          DOOR_LABELS.map(([term, analogy], i) => (
            <g key={i} opacity={s.doors[i].label} transform={`translate(0 ${12 * (1 - s.doors[i].label)})`}>
              <text x={XS[i]} y={floor + 52} textAnchor="middle" fontSize={34} fontWeight={800} fill={s.doors[i].lit > 0.5 ? C.text : alpha(C.text, 0.85)}>
                {term}
              </text>
              <text x={XS[i]} y={floor + 94} textAnchor="middle" fontSize={28} fontWeight={600} fill={C.muted}>
                {analogy}
              </text>
            </g>
          ))}
        {mode === 'labelled' && s.sides > 0 && (
          <g opacity={s.sides}>
            {SIDES.map((label, k) => {
              const cx = k === 0 ? (XS[0] + XS[1]) / 2 : (XS[2] + XS[3]) / 2;
              const w = label.length * 36 * 0.56 + 60;
              const on = k === 0 ? Math.max(s.doors[0].lit, 0) : s.doors[2].lit;
              return (
                <g key={k} style={glow(C.accentText, 0.5 * on)}>
                  <rect x={cx - w / 2} y={160} width={w} height={58} rx={29} fill={alpha(C.accent, 0.18 + 0.3 * on)} stroke={alpha(C.accentText, 0.5 + 0.5 * on)} strokeWidth={3} />
                  <text x={cx} y={201} textAnchor="middle" fontSize={36} fontWeight={800} fill={C.text}>
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </ShopCanvas>
    </AbsoluteFill>
  );
};
