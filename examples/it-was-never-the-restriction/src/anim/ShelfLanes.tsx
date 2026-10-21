import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { CACHED_LINE, H, LBOX, PRICES, THREE, TRAP, TRAP_LINES, W, Y, frameState, type Lane, type LanesProps, type LanesState } from './ShelfLanes.state.ts';
import { Glass, Hand, MONO, ModelChip, PackageBox, Pane, PolyWalk, ReportCard, Runner, Shelf, Signpost, Slip, Tag, Tick, ToolTag, clamp01 } from './pieces.tsx';
import { MiniCard } from './MiniCard.tsx';

export { frameState };
export type { LanesProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const boxTop = Y.floor - LBOX.h;

// ---------------------------------------------------------------- one lane

const directPts = (l: Lane): [number, number][] => [
  [l.x, Y.hand + 52],
  [l.x, l.kind === 'locked' ? Y.glassTop - 70 : boxTop - 14],
];
const pastPts = (l: Lane): [number, number][] => {
  const side = l.x + Math.min(0.42 * l.w, 128);
  return [
    [l.x, Y.hand + 52],
    [l.x, 610],
    [side, 770],
    [side, Y.floor - 8],
  ];
};
const runnerAt = (l: Lane, p: number): [number, number] => [lerp(l.x + 78, l.x + LBOX.w / 2 + 34, p), lerp(Y.hand + 70, boxTop + 40, p)];

const LaneView: React.FC<{ l: Lane; hideHand?: boolean; toolAt?: [number, number]; signAt?: number }> = ({ l, hideHand, toolAt, signAt }) => {
  const op = clamp01(l.appear) * (1 - 0.6 * clamp01(l.dim));
  if (op <= 0) return null;
  const narrow = l.w < 300;
  const [rx, ry] = runnerAt(l, l.runner);
  const slipOnRunner = l.runner > 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: op }}>
      {l.title && (
        <div style={{ position: 'absolute', left: l.x - l.w / 2, width: l.w, top: Y.title - 22, textAlign: 'center', fontFamily, fontSize: 34, fontWeight: 800, color: C.text, letterSpacing: '-0.01em' }}>
          {l.title}
        </div>
      )}
      <PolyWalk pts={directPts(l)} draw={l.ghost} color={alpha(C.muted, 0.35)} head={false} />
      <PolyWalk pts={directPts(l)} draw={l.walk} />
      <PolyWalk pts={pastPts(l)} draw={l.past} />
      {l.runnerIn > 0 && l.runner > 0 && <PolyWalk pts={[runnerAt(l, 0), [rx, ry]]} draw={1} head={false} />}
      <PackageBox x={l.x} floor={Y.floor} w={LBOX.w} h={LBOX.h} label="0.4.0" inside="0.3.1" lid={l.lid} rise={l.rise} dusty insideScale={0.95} />
      <Glass x={l.x} top={Y.glassTop} floor={Y.floor + 4} w={LBOX.w + 44} opacity={l.glass} thud={l.thud} />
      {!hideHand && <Hand x={l.x} y={Y.hand} tied={l.cord} opacity={l.hand} glow={l.handGlow} />}
      <Runner x={rx} y={ry} opacity={l.runnerIn} />
      <Slip x={slipOnRunner ? rx : l.x + 86} y={slipOnRunner ? ry - 46 : Y.hand + 6} appear={l.slip * (1 - clamp01(l.lid))} scale={0.85} />
      <Signpost x={l.x} y={signAt ?? 410} appear={l.sign} gone={l.signGone} post={110} />
      <ToolTag x={toolAt ? toolAt[0] : l.x + 40} y={toolAt ? toolAt[1] : Y.hand + 34} glow={l.toolGlow} opacity={l.tool} />
      <ReportCard x={l.x} y={Y.card} w={Math.min(250, l.w - 16)} appear={l.card} kind={l.stamp} pop={l.pop} crack={l.crack} stampScale={narrow ? 0.82 : 1} />
      {l.tag && <Tag x={l.x} y={Y.tag} w={l.w - 10} text={l.tag} appear={l.tagIn} size={26} />}
      <ModelChip x={l.x} y={Y.chip} name={l.chip} appear={l.chipIn} squash={l.squash} scale={narrow ? 0.92 : 1} />
    </div>
  );
};

// ---------------------------------------------------------------- overlays

const Band: React.FC<{ text: string; appear: number; size?: number }> = ({ text, appear, size = 40 }) => {
  const a = clamp01(appear);
  if (a <= 0 || !text) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: Y.band, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${-30 * (1 - a)}px)`, zIndex: 8 }}>
      <div style={{ padding: 3, borderRadius: 22, background: GRADIENT, boxShadow: `0 12px 30px ${alpha(C.bg0, 0.7)}` }}>
        <div style={{ padding: '10px 30px', borderRadius: 19, background: C.bg1, fontFamily, fontSize: size, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>{text}</div>
      </div>
    </div>
  );
};

const BottomRow: React.FC<{ items: React.ReactNode[]; appear: number; lit?: number[] }> = ({ items, appear, lit }) => {
  const a = clamp01(appear);
  if (a <= 0 || !items.length) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: Y.bottom, display: 'flex', justifyContent: 'center', gap: 16, opacity: a, zIndex: 6 }}>
      {items.map((it, i) => {
        const on = lit ? clamp01(lit[i]) : 0;
        return (
          <div
            key={i}
            style={{
              padding: '8px 18px',
              borderRadius: 16,
              border: `2px solid ${lit ? alpha(C.accentText, 0.3 + 0.7 * on) : alpha(C.muted, 0.55)}`,
              background: lit ? alpha(C.accent, 0.08 + 0.25 * on) : alpha(C.bg0, 0.85),
              fontFamily,
              fontSize: 27,
              fontWeight: 600,
              color: lit ? alpha(C.text, 0.45 + 0.55 * on) : C.muted,
              whiteSpace: 'nowrap',
            }}
          >
            {it}
          </div>
        );
      })}
    </div>
  );
};

type LanesView = Extract<LanesState, { view: 'lanes' }>;

const LanesViewC: React.FC<{ s: LanesView }> = ({ s }) => {
  const z = s.zoom;
  const scale = 1 + 0.6 * z;
  const bottomItems = s.prices > 0 ? PRICES.map((p) => `${p.model}  ${p.price}`) : s.bottom;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0px 617px' }}>
          <Shelf y={Y.floor} />
          {s.lanes.map((l, i) => (
            <LaneView key={i} l={l} />
          ))}
          {/* Hook: what the tie cost, on the tied lane. */}
          {s.coin > 0 && <Tag x={s.lanes[0].x} y={Y.tag} w={400} text={<span>cost: <b style={{ color: C.text }}>≈ ¼ more</b></span>} appear={s.coin} size={30} strong />}
        </div>
      </div>
      <Band text={s.band} appear={s.bandIn} size={s.band.length > 22 ? 38 : 42} />
      <BottomRow items={bottomItems} appear={(s.prices > 0 ? s.prices : s.bottomIn) * (1 - clamp01(s.quote))} lit={s.prices > 0 ? s.priceLit : undefined} />
      {/* Zoomed on the free lane the chips leave the frame: keep saying whose hand it is. */}
      {z > 0 && s.lanes[0].chip && <ModelChip x={s.lanes[0].x * scale} y={60} name={s.lanes[0].chip} appear={z} scale={1.2} />}
      {s.prices > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: Y.bottom + 58, textAlign: 'center', fontFamily, fontSize: 22, fontWeight: 600, color: C.muted, opacity: s.prices }}>per run</div>
      )}
      {/* The no-registry lane's own words. */}
      {s.quote > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 16,
            width: 928,
            top: 912,
            opacity: s.quote,
            transform: `scale(${0.85 + 0.15 * s.quote})`,
            transformOrigin: '80% 0%',
            padding: '20px 30px 18px',
            boxSizing: 'border-box',
            borderRadius: 22,
            background: alpha(C.card, 0.98),
            border: `3px solid ${C.accentText}`,
            boxShadow: `0 20px 50px ${alpha(C.bg0, 0.85)}`,
            fontFamily,
            zIndex: 9,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.22, color: C.text, fontStyle: 'italic' }}>“I could not confirm the artifact's contents”</div>
          <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700, color: C.accentText }}>3 of 3 declared it</div>
        </div>
      )}
      {/* What the shell cost: free vs no shell, per run. */}
      {s.costCard > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 480 - 260,
            width: 520,
            top: 590,
            opacity: s.costCard,
            transform: `scale(${0.8 + 0.2 * s.costCard})`,
            padding: '18px 24px',
            boxSizing: 'border-box',
            borderRadius: 24,
            background: alpha(C.card, 0.98),
            border: `3px solid ${C.accentText}`,
            boxShadow: `0 20px 50px ${alpha(C.bg0, 0.85)}`,
            textAlign: 'center',
            fontFamily,
            zIndex: 9,
          }}
        >
          <div style={{ fontSize: 66, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            $1.54 <span style={{ color: C.muted }}>→</span> <span style={gradientText}>$1.94</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, color: C.muted, marginTop: 4 }}>per run · free → no shell</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.accentText, marginTop: 6 }}>≈ ¼ more</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- trap

type TrapS = Extract<LanesState, { view: 'trap' }>;

const TrapView: React.FC<{ s: TrapS; t: number }> = ({ s, t }) => {
  const { pane, box } = TRAP;
  const floor = Y.floor;
  const restY = floor - box.h - box.h + 10;
  const fallY = lerp(pane.y + pane.h - 40, restY, s.fall * s.fall);
  const bounceY = restY - 130 * Math.sin(Math.PI * s.bounce);
  const bx = box.x + 280 * s.bounce;
  return (
    <>
      <Band text="Does it go and look?" appear={s.band} />
      <Pane
        x={pane.x}
        y={pane.y}
        w={pane.w}
        h={pane.h}
        t={t}
        label="release"
        opacity={s.pane}
        lines={
          <div style={{ lineHeight: 1.6 }}>
            {TRAP_LINES.map((l, i) => (
              <div key={i} style={{ opacity: s.lines[i], color: i === 0 ? C.text : C.muted, whiteSpace: 'nowrap' }}>
                {l}
              </div>
            ))}
            <div style={{ opacity: s.cached, color: C.text, whiteSpace: 'nowrap' }}>{CACHED_LINE}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: s.ok, marginTop: 6 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  background: alpha(C.ok, 0.18),
                  border: `3px solid ${C.ok}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 ${36 * s.okFlash}px ${alpha(C.ok, 0.9)}`,
                }}
              >
                <Tick size={32} />
              </div>
              <span style={{ fontFamily, fontSize: 36, fontWeight: 700, color: C.ok }}>success · exit 0</span>
            </div>
          </div>
        }
      />
      <Shelf y={floor} />
      <PolyWalk pts={[[box.x, pane.y + pane.h + 8], [box.x, floor - box.h - 20]]} draw={s.path} />
      {s.pathPulse > 0 && (
        <div style={{ position: 'absolute', left: box.x - 60, top: floor - box.h - 30 - 60, width: 120, height: 120, borderRadius: 60, boxShadow: `0 0 ${50 * s.pathPulse}px ${alpha(C.accentText, 0.8 * s.pathPulse)}` }} />
      )}
      <PackageBox x={box.x} floor={floor} w={box.w} h={box.h} label="0.4.0" inside="0.3.1" lid={s.lid} rise={s.rise} dusty insideScale={1.25} />
      {s.fall > 0 && s.vanish < 1 && (
        <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - s.vanish, transform: `rotate(${30 * s.bounce}deg)`, transformOrigin: `${bx}px ${bounceY + box.h / 2}px` }}>
          <PackageBox x={bx} floor={(s.bounce > 0 ? bounceY : fallY) + box.h} w={box.w} h={box.h} label="0.4.0" inside="" lid={0} rise={0} />
        </div>
      )}
      {s.bounce > 0 && s.vanish < 1 && (
        <div style={{ position: 'absolute', left: 640, top: floor - box.h - 90, fontFamily, fontSize: 34, fontWeight: 700, color: C.muted, opacity: Math.sin(Math.PI * clamp01(s.bounce)) * (1 - s.vanish) }}>
          (cached)
        </div>
      )}
      {/* label ≠ contents */}
      {s.stamp > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: floor - 150,
            padding: '8px 16px',
            borderRadius: 12,
            border: `4px solid ${C.warm}`,
            background: alpha(C.bg0, 0.9),
            fontFamily,
            fontSize: 34,
            fontWeight: 800,
            color: C.warm,
            whiteSpace: 'nowrap',
            opacity: s.stamp,
            transform: `scale(${1.4 - 0.4 * s.stamp}) rotate(-6deg)`,
          }}
        >
          label ≠ contents
        </div>
      )}
      <Tag x={480} y={Y.bottom - 6} w={700} text="only visible in the registry" appear={s.only} size={30} />
    </>
  );
};

// ---------------------------------------------------------------- false reports

type FalseS = Extract<LanesState, { view: 'false' }>;

const FalseView: React.FC<{ s: FalseS; t: number }> = ({ s, t }) => {
  const cw = 172;
  const ch = 108;
  const x0 = (W - (5 * cw + 4 * 10)) / 2;
  // Once the pane drops in, the wall behind it all but disappears: at 22 % its cards peeked out
  // around the pane and the featured card and read as clutter.
  const back = 1 - 0.93 * s.pan;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: back, transform: `translateY(${110 * s.pan}px)` }}>
        <ModelChip x={480} y={44} name="Haiku 4.5" appear={s.head} />
        {s.cards.map((c, i) => (
          <ReportCard key={i} x={x0 + cw / 2 + (i % 5) * (cw + 10)} y={140 + Math.floor(i / 5) * (ch + 14)} w={cw} h={ch} appear={c.appear} kind={c.stamp} pop={c.pop} crack={c.crack} stampScale={0.6} />
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily, opacity: s.counter }}>
          <span style={{ fontSize: 120, fontWeight: 800, letterSpacing: '-0.04em', ...gradientText }}>{s.count}</span>
          <span style={{ fontSize: 64, fontWeight: 800, color: C.text }}> of 15 </span>
          <span style={{ fontSize: 48, fontWeight: 700, color: C.muted }}>reports</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center', fontFamily, fontSize: 34, fontWeight: 600, color: C.muted, opacity: s.counter }}>
          filed the release as done
        </div>
        <Shelf y={1010} x0={300} x1={660} opacity={s.wasnt} />
        <PackageBox x={480} floor={1010} w={180} h={140} label="0.4.0" inside="0.3.1" lid={s.wasnt} rise={s.wasnt} dusty insideScale={1.05} opacity={s.wasnt} insideFlash={s.flash} />
      </div>
      {s.pan > 0 && (
        <>
          <Pane
            x={40}
            y={lerp(-400, 30, s.pan)}
            w={880}
            h={300}
            t={t}
            opacity={s.pan * s.pan}
            label="Haiku 4.5 · release"
            lines={
              <div style={{ lineHeight: 1.6 }}>
                <div style={{ color: C.text }}>$ release 0.4.0</div>
                <div style={{ color: C.muted }}>tests ✓ tag ✓ push ✓</div>
                <div style={{ color: C.text, whiteSpace: 'nowrap' }}>
                  upload: widgetkit 0.4.0{' '}
                  <span
                    style={{
                      borderRadius: 10,
                      padding: '0 6px',
                      outline: `${4 * s.ring}px solid ${alpha(C.accentText, s.ring)}`,
                      outlineOffset: 3,
                      color: s.ring > 0.5 ? C.accentText : C.text,
                      fontWeight: 700,
                      boxShadow: `0 0 ${30 * s.ringPulse}px ${alpha(C.accentText, 0.8 * s.ringPulse)}`,
                    }}
                  >
                    (cached)
                  </span>
                </div>
              </div>
            }
          />
          <ReportCard x={480} y={lerp(-60, 440, s.pan)} w={330} h={150} appear={s.pan} kind="false" pop={1} crack={1} stampScale={1.15} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', fontFamily, fontSize: 32, fontWeight: 700, color: C.muted, opacity: s.ring }}>
            not one report mentions it
          </div>
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- no TOOLS.md

type NoDocs = Extract<LanesState, { view: 'nodocs' }>;

const NoDocsView: React.FC<{ s: NoDocs }> = ({ s }) => (
  <>
    <Shelf y={Y.floor} />
    {s.lanes.map((l, i) => (
      <LaneView key={i} l={l} hideHand toolAt={[l.x - 62, 322]} />
    ))}
    {/* Load on every chip: four tickets and an inbox. */}
    {s.lanes.map((l, i) => (
      <Tag key={`load${i}`} x={l.x} y={244} w={300} text="load: 4 tickets + inbox" appear={s.load} size={25} />
    ))}
    <Signpost x={480} y={400} appear={s.sign} gone={s.signGone} post={90} scale={1.45} />
    <Band text="tool still installed, just not written down" appear={s.note} size={32} />
    <Band text="went to look:  0 · 0 · 0" appear={s.looked} size={40} />
    {s.mini.map((cards, li) =>
      cards.map((c, j) => <MiniCard key={`${li}-${j}`} x={THREE[li] - 96 + 96 * j} y={560} w={84} h={76} kind={c.stamp} appear={c.appear} crack={c.crack} cached={c.cached} />),
    )}
    <Tag x={22} y={612} w={440} anchor="left" text="2 caught from the output" appear={s.opusTags[0]} size={24} />
    <Tag x={22} y={666} w={440} anchor="left" text="1: its only false report" appear={s.opusTags[1]} size={24} />
    <Tag x={THREE[2]} y={530} w={290} text={<>no change:<br />0 before, 0 after</>} appear={s.haikuTag} size={26} strong />
  </>
);

// ---------------------------------------------------------------- close

type Close = Extract<LanesState, { view: 'close' }>;

const CloseView: React.FC<{ s: Close }> = ({ s }) => {
  const lanes = s.lanes.map((l, i) => (i === 0 ? { ...l, runnerIn: l.runnerIn * (1 - s.fade) } : l));
  const head = (x: number, w: number, text: string, a: number, accent: boolean) => (
    <div style={{ position: 'absolute', left: x - w / 2, width: w, top: Y.title - 30, textAlign: 'center', fontFamily, fontSize: 44, fontWeight: 800, opacity: a, color: C.text }}>
      {accent ? <span style={gradientText}>{text}</span> : text}
    </div>
  );
  return (
    <>
      <Shelf y={Y.floor} />
      {lanes.map((l, i) => (
        <LaneView key={i} l={l} />
      ))}
      {/* The fences' names go with the fences; the chips stay. */}
      {head(250, 500, 'restricted', s.left * (1 - s.fade), true)}
      {head(750, 420, 'free', s.right * (1 - s.fade), false)}
      <div style={{ position: 'absolute', left: 528, top: 70, width: 4, height: 900, borderRadius: 2, background: C.line, opacity: s.right }} />
      {s.row > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: Y.bottom - 6, display: 'flex', justifyContent: 'center', gap: 20, opacity: s.row, transform: `translateY(${20 * (1 - s.row)}px)` }}>
          {PRICES.map((p) => (
            <div key={p.model} style={{ padding: 3, borderRadius: 30, background: GRADIENT }}>
              <div style={{ padding: '8px 24px', borderRadius: 27, background: C.bg1, fontFamily, fontSize: 32, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>{p.model}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- component

export const ShelfLanes: React.FC<AnimProps & LanesProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      {s.view === 'lanes' && <LanesViewC s={s} />}
      {s.view === 'trap' && <TrapView s={s} t={t} />}
      {s.view === 'false' && <FalseView s={s} t={t} />}
      {s.view === 'nodocs' && <NoDocsView s={s} />}
      {s.view === 'close' && <CloseView s={s} />}
    </Stage>
  );
};
