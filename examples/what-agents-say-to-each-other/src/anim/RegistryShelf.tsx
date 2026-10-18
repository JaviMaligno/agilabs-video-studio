import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import {
  BOX,
  LIVE,
  LOAD,
  MINI,
  PIPE_X,
  SHELF_Y,
  TRAP_LINES,
  TRAP_PANE,
  W,
  frameState,
  loadX,
  miniX,
  type BoxState,
  type ShelfProps,
  type ShelfState,
} from './RegistryShelf.state.ts';
import { Badge, Courier, MONO, MsgCard, PackageBox, Pane, Pill, Pipe, Shelf, Tick, Walk } from './pieces.tsx';

export { frameState };
export type { ShelfProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Inspect: the box sits right of centre, so the walks never cross the tally on the left. */
const INSPECT_BOX_X = 700;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const Boxes: React.FC<{ boxes: BoxState[]; scale?: number }> = ({ boxes, scale = 1 }) => (
  <>
    {boxes.map((b, i) => (
      <PackageBox
        key={i}
        x={b.x}
        floor={SHELF_Y}
        w={BOX.w * scale}
        h={BOX.h * scale}
        label={b.label}
        inside={b.inside}
        lid={b.lid}
        rise={b.rise}
        dusty={b.dusty}
        glow={b.glow}
        opacity={b.appear}
        dropY={-420 * (1 - b.drop)}
      />
    ))}
  </>
);

/** "no channel": the pipe is capped in the arms that had none. */
const NoChannel: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 16px',
      borderRadius: 24,
      border: `2px dashed ${alpha(C.muted, 0.6)}`,
      fontFamily,
      fontSize: 26,
      fontWeight: 600,
      color: C.muted,
    }}
  >
    <svg width={30} height={30} viewBox="0 0 30 30">
      <line x1={4} y1={15} x2={18} y2={15} stroke={C.muted} strokeWidth={5} />
      <rect x={18} y={5} width={8} height={20} rx={2} fill={C.muted} />
    </svg>
    no channel
  </div>
);

// ---------------------------------------------------------------- views

type Trap = Extract<ShelfState, { view: 'trap' }>;

const TrapView: React.FC<{ s: Trap; t: number }> = ({ s, t }) => {
  const paneBottom = TRAP_PANE.top + TRAP_PANE.h;
  // New box: falls from under the pane onto the old box, bounces up and off, fades.
  const restY = SHELF_Y - BOX.h - BOX.h + 10;
  const fallY = lerp(paneBottom - 60, restY, s.fall * s.fall);
  const bounceY = restY - 140 * Math.sin(Math.PI * s.bounce);
  const bx = 480 + 260 * s.bounce;
  return (
    <>
      <Pipe x={PIPE_X} y0={TRAP_PANE.top + 60} y1={TRAP_PANE.top + 60} taps={[TRAP_PANE.top + 60]} tapTo={TRAP_PANE.x0} capped={s.cap} opacity={s.pane} />
      <Pane
        x={TRAP_PANE.x0}
        y={TRAP_PANE.top}
        w={TRAP_PANE.x1 - TRAP_PANE.x0}
        h={TRAP_PANE.h}
        t={t}
        opacity={s.pane}
        lines={
          <div style={{ fontSize: 32, lineHeight: 1.6 }}>
            {TRAP_LINES.map((l, i) => (
              <div key={i} style={{ opacity: s.lines[i], color: i === 2 ? C.text : C.muted, whiteSpace: 'nowrap' }}>
                {l}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: s.ok, marginTop: 4 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  background: alpha(C.ok, 0.18),
                  border: `3px solid ${C.ok}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 ${36 * s.okFlash}px ${alpha(C.ok, 0.9)}`,
                }}
              >
                <Tick size={34} />
              </div>
              <span style={{ fontFamily, fontSize: 36, fontWeight: 700, color: C.ok }}>success</span>
            </div>
          </div>
        }
      />
      <NoChannel x={TRAP_PANE.x1 - 230} y={TRAP_PANE.top + 48} opacity={s.pane} />
      <Shelf y={SHELF_Y} />
      <Boxes boxes={s.boxes} />
      {s.fall > 0 && s.vanish < 1 && (
        <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - s.vanish, transform: `rotate(${30 * s.bounce}deg)`, transformOrigin: `${bx}px ${bounceY + BOX.h / 2}px` }}>
          <PackageBox x={bx} floor={(s.bounce > 0 ? bounceY : fallY) + BOX.h} w={BOX.w} h={BOX.h} label="0.4.0" inside="" lid={0} rise={0} />
        </div>
      )}
      {s.bounce > 0 && s.vanish < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 600,
            top: SHELF_Y - BOX.h - 70,
            fontFamily,
            fontSize: 30,
            fontWeight: 700,
            color: C.muted,
            opacity: Math.sin(Math.PI * clamp01(s.bounce)) * (1 - s.vanish),
          }}
        >
          (cached)
        </div>
      )}
    </>
  );
};

type Inspect = Extract<ShelfState, { view: 'inspect' }>;

const InspectView: React.FC<{ s: Inspect; t: number }> = ({ s, t }) => (
  <>
    {s.panes.map((a, i) => {
      const x = miniX(i);
      const c = s.catches[i];
      const inPane = i < 4;
      return (
        <React.Fragment key={i}>
          <Pane x={x} y={MINI.top} w={MINI.w} h={MINI.h} t={t} seed={i} bars={inPane ? 1 : 3} opacity={a} />
          {/* In-pane catch: two version labels that disagree. */}
          {inPane && c.labels > 0 && (
            <div style={{ position: 'absolute', left: x + 10, top: MINI.top + 80, width: MINI.w - 20, opacity: c.labels, display: 'flex', flexDirection: 'column', gap: 10, fontFamily }}>
              <div style={{ background: C.text, color: C.bg0, borderRadius: 6, fontSize: 25, fontWeight: 800, textAlign: 'center', padding: '4px 0' }}>0.4.0</div>
              <div style={{ textAlign: 'center', fontSize: 34, fontWeight: 800, color: C.flag, lineHeight: 0.8 }}>≠</div>
              <div style={{ background: alpha(C.muted, 0.35), color: C.text, borderRadius: 6, fontSize: 25, fontWeight: 700, textAlign: 'center', padding: '4px 0' }}>old</div>
            </div>
          )}
          {!inPane && <Walk x0={x + MINI.w / 2} y0={MINI.top + MINI.h} x1={INSPECT_BOX_X + (i - 5) * 40} y1={SHELF_Y - BOX.h - 10} draw={c.walk} />}
          <Badge x={x + MINI.w / 2} y={MINI.top + MINI.h - 50} size={70} glyph="tick" pop={c.tick} />
        </React.Fragment>
      );
    })}
    <NoChannel x={W / 2 - 110} y={MINI.top + MINI.h + 22} opacity={s.panes[6]} />
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: 520,
        top: 470,
        textAlign: 'center',
        fontFamily,
        opacity: s.tally,
        transform: `scale(${1 + 0.12 * s.tallyFlash})`,
      }}
    >
      <span style={{ fontSize: 180, fontWeight: 800, letterSpacing: '-0.04em', ...gradientText }}>{s.count} / 7</span>
    </div>
    <Shelf y={SHELF_Y} />
    <Boxes boxes={s.boxes} />
  </>
);

type Loaded = Extract<ShelfState, { view: 'loaded' }>;

const LoadedView: React.FC<{ s: Loaded; t: number }> = ({ s, t }) => {
  const z = s.zoom;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - 0.75 * z }}>
        {s.panes.map((a, i) => {
          const x = loadX(i);
          const fail = i === 2;
          return (
            <React.Fragment key={i}>
              <Pane x={x} y={LOAD.top} w={LOAD.w} h={LOAD.h} t={t} seed={i} bars={0} opacity={a} border={fail && s.stamp > 0.5 ? alpha(C.flag, 0.8) : undefined} />
              {/* Inbox badge "3" */}
              <div
                style={{
                  position: 'absolute',
                  left: x + LOAD.w - 64,
                  top: LOAD.top - 14,
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  background: C.flag,
                  color: C.text,
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${s.inbox})`,
                  opacity: s.inbox * a,
                }}
              >
                3
              </div>
              {/* Three feature cards */}
              {s.features.map((f, j) => (
                <div
                  key={j}
                  style={{
                    position: 'absolute',
                    left: x + 16,
                    top: LOAD.top + 52 + j * 62 - 20 * (1 - f),
                    width: LOAD.w - 32,
                    height: 50,
                    borderRadius: 10,
                    background: alpha(C.accent, 0.22),
                    border: `2px solid ${alpha(C.accentText, 0.45)}`,
                    opacity: f * a,
                    fontFamily,
                    fontSize: 25,
                    fontWeight: 600,
                    color: C.text,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 14,
                    boxSizing: 'border-box',
                  }}
                >
                  feature {j + 1}
                </div>
              ))}
              {/* The waiting consumer's question in the inbox. */}
              <div
                style={{
                  position: 'absolute',
                  left: x + 16,
                  top: LOAD.top + 250,
                  width: LOAD.w - 32,
                  borderRadius: 14,
                  border: `2px solid ${C.accentText}`,
                  background: alpha(C.bg0, 0.9),
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  opacity: s.inbox * a,
                  fontFamily,
                  fontSize: 25,
                  fontWeight: 600,
                  color: C.text,
                  lineHeight: 1.2,
                }}
              >
                <span style={{ fontSize: 34, fontWeight: 800, color: C.accentText }}>?</span>
                when will 0.4.0 be out?
              </div>
              {i < 2 && (
                <>
                  <Walk x0={x + LOAD.w / 2} y0={LOAD.top + LOAD.h} x1={430 + i * 50} y1={SHELF_Y - BOX.h - 10} draw={s.walks[i]} />
                  <Badge x={x + LOAD.w / 2} y={LOAD.top + LOAD.h - 70} size={80} glyph="tick" pop={s.ticks[i]} />
                </>
              )}
              {fail && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: x + 16,
                      top: LOAD.top + 336,
                      padding: '6px 12px',
                      borderRadius: 10,
                      background: alpha(C.ok, 0.15),
                      border: `2px solid ${C.ok}`,
                      fontFamily: MONO,
                      fontSize: 23,
                      color: C.text,
                      opacity: s.chip,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    v0.4.0 in origin ✓
                  </div>
                  {z === 0 && <Stamp x={x + LOAD.w / 2} y={LOAD.top + LOAD.h - 40} scale={0.6} pop={s.stamp} flash={s.stampFlash} crack={0} />}
                </>
              )}
            </React.Fragment>
          );
        })}
        <NoChannel x={loadX(2) + 40} y={LOAD.top + LOAD.h + 44} opacity={s.panes[2]} />
        <Shelf y={SHELF_Y} />
        <Boxes boxes={s.boxes} />
      </div>
      {z > 0 && (
        <>
          <Stamp x={lerp(loadX(2) + LOAD.w / 2, 480, z)} y={lerp(LOAD.top + LOAD.h - 40, 470, z)} scale={lerp(0.6, 1.7, z)} pop={1} flash={0} crack={s.crack} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 720,
              display: 'flex',
              justifyContent: 'center',
              opacity: s.runs,
              transform: `translateY(${20 * (1 - s.runs)}px)`,
            }}
          >
            <div style={{ padding: '10px 30px', borderRadius: 40, border: `3px solid ${C.muted}`, fontFamily, fontSize: 48, fontWeight: 700, color: C.text }}>3 runs</div>
          </div>
        </>
      )}
    </>
  );
};

/** The "published" stamp, with an optional hairline crack drawn across it. */
const Stamp: React.FC<{ x: number; y: number; scale: number; pop: number; flash: number; crack: number }> = ({ x, y, scale, pop, flash, crack }) => {
  if (pop <= 0) return null;
  const w = 440;
  const h = 120;
  const path = 'M -10 40 L 80 58 L 140 36 L 220 70 L 290 52 L 350 84 L 450 66';
  const len = 520;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        transform: `scale(${scale * (1.5 - 0.5 * pop)}) rotate(-7deg)`,
        opacity: pop,
        zIndex: 4,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 16,
          border: `7px solid ${C.ok}`,
          background: alpha(C.bg0, 0.85),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily,
          fontSize: 62,
          fontWeight: 800,
          letterSpacing: '0.03em',
          color: C.ok,
          boxShadow: `0 0 ${40 * flash}px ${alpha(C.ok, 0.8)}`,
        }}
      >
        PUBLISHED
      </div>
      {crack > 0 && (
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <path d={path} fill="none" stroke={C.bg0} strokeWidth={10} strokeDasharray={`${len * crack} ${len}`} strokeLinejoin="bevel" />
          <path d={path} fill="none" stroke={C.flag} strokeWidth={4} strokeDasharray={`${len * crack} ${len}`} strokeLinejoin="bevel" />
        </svg>
      )}
    </div>
  );
};

type Live = Extract<ShelfState, { view: 'live' }>;

const LiveView: React.FC<{ s: Live; t: number }> = ({ s, t }) => {
  const pubMid = LIVE.pubTop + LIVE.h / 2;
  const conMid = LIVE.conTop + LIVE.h / 2;
  const capped = 1 - s.uncap;
  const fixMode = s.replyTravel > 0 || s.replyCard > 0 || s.slide > 0;
  return (
    <>
      <Pipe x={PIPE_X} y0={pubMid} y1={conMid} taps={[pubMid, conMid]} tapTo={LIVE.x0} capped={capped > 0.5 ? 1 : 0} glow={s.glow} opacity={s.panes} />
      {capped > 0 && capped < 1 && (
        <div style={{ position: 'absolute', left: LIVE.x0 - 16 + 60 * s.uncap, top: conMid - 15 - 80 * s.uncap, width: 12, height: 30, borderRadius: 3, background: C.muted, opacity: capped, transform: `rotate(${90 * s.uncap}deg)` }} />
      )}
      <Pane x={LIVE.x0} y={LIVE.pubTop} w={LIVE.x1 - LIVE.x0} h={LIVE.h} t={t} label="publisher" opacity={s.panes} bars={3} />
      <Pane x={LIVE.x0} y={LIVE.conTop} w={LIVE.x1 - LIVE.x0} h={LIVE.h} t={t} label="consumer" opacity={s.panes} bars={3} seed={2} />
      <Walk x0={LIVE.x0 + 600} y0={LIVE.conTop + LIVE.h} x1={500} y1={SHELF_Y - BOX.h - 10} draw={s.walk * (1 - s.slide)} />
      <Shelf y={SHELF_Y} />
      <Boxes boxes={s.boxes} />
      {/* Flag: consumer → publisher. */}
      {s.flagTravel > 0 && s.flagCard < 1 && <Courier x={PIPE_X} y={lerp(conMid, pubMid, s.flagTravel)} glyph="flag" />}
      <MsgCard x={110} y={pubMid + 10} w={830} main="your 0.4.0 contains 0.3.1" glyph="flag" from="consumer" appear={s.flagCard} font={42} opacity={1 - 0.45 * s.replyCard} />
      {/* Reply: publisher → consumer. */}
      {fixMode && s.replyTravel > 0 && s.replyCard < 1 && <Courier x={PIPE_X} y={lerp(pubMid, conMid, s.replyTravel)} glyph="tick" />}
      {fixMode && (
        <MsgCard x={110} y={conMid + 10} w={830} main="Ship a corrective 0.4.1 rather than rewriting 0.4.0." glyph="tick" from="publisher" appear={s.replyCard} font={40} />
      )}
      {/* Two ghost miniatures repeat the shape: flag up, tick back, a new box. Then 3 / 3. */}
      {s.ghosts.map((g, i) => {
        if (g <= 0) return null;
        const y = 640 + i * 96;
        return (
          <div key={i} style={{ position: 'absolute', left: 0, top: 0, opacity: 0.75 * g, transform: `translateX(${-30 * (1 - g)}px)` }}>
            <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
              <line x1={160} y1={y} x2={210} y2={y} stroke={C.muted} strokeWidth={3} />
              <line x1={320} y1={y} x2={370} y2={y} stroke={C.muted} strokeWidth={3} />
            </svg>
            <Pill x={110} y={y} face="tell" glyph="flag" scale={0.85} />
            <Pill x={265} y={y} face="tell" glyph="tick" scale={0.85} />
            <div style={{ position: 'absolute', left: 385, top: y - 28, width: 66, height: 56, borderRadius: 8, border: `3px dashed ${alpha(C.muted, 0.8)}` }} />
          </div>
        );
      })}
      {s.tally > 0 && (
        <div style={{ position: 'absolute', left: 520, top: 560, width: 420, textAlign: 'center', fontFamily, opacity: s.tally, transform: `scale(${0.7 + 0.3 * s.tally})` }}>
          <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: '-0.04em', ...gradientText }}>3 / 3</span>
        </div>
      )}
    </>
  );
};

type Close = Extract<ShelfState, { view: 'close' }>;

const CloseView: React.FC<{ s: Close; t: number }> = ({ s, t }) => {
  const leftOp = s.left * (1 - 0.6 * s.leftDim);
  const b = s.boxes[0];
  const floor = 720;
  const bw = 260;
  const bh = 208;
  return (
    <>
      {/* Left: a dim stack of ASK bubbles, "splitting work". */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 440, height: 1090, opacity: leftOp }}>
        {[0, 1, 2, 3].map((i) => (
          <Pill key={i} x={220 + (i % 2 ? 50 : -50)} y={250 + i * 112} face="ask" scale={1.55} />
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily, fontSize: 46, fontWeight: 700, color: C.muted, lineHeight: 1.15 }}>
          splitting
          <br />
          work
        </div>
      </div>
      <div style={{ position: 'absolute', left: 468, top: 170, width: 4, height: 760, borderRadius: 2, background: C.line, opacity: s.left }} />
      {/* Right: a session walks to the box and opens it. */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 1090, opacity: s.right }}>
        <div
          style={{
            position: 'absolute',
            left: 500,
            top: 120,
            width: 460,
            height: 820,
            borderRadius: 40,
            background: `radial-gradient(circle at 50% 62%, ${alpha(C.accent, 0.45 * Math.max(s.right, b.glow))}, transparent 68%)`,
          }}
        />
        <Pane x={590} y={170} w={280} h={170} t={t} bars={2} />
        <Walk x0={730} y0={340} x1={730} y1={floor - bh - 26} draw={s.walk} />
        <Shelf y={floor} x0={520} x1={940} />
        <PackageBox x={730} floor={floor} w={bw} h={bh} label={b.label} inside="" lid={b.lid} rise={0} glow={b.glow} />
        <Badge x={860} y={floor - bh - 10} size={84} glyph="tick" pop={b.glow} />
        <div style={{ position: 'absolute', left: 490, width: 480, top: 830, textAlign: 'center', fontFamily, fontSize: 46, fontWeight: 700, color: C.text, lineHeight: 1.15 }}>
          checking what you <span style={gradientText}>published</span>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- component

export const RegistryShelf: React.FC<AnimProps & ShelfProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      {s.view === 'trap' && <TrapView s={s} t={t} />}
      {s.view === 'inspect' && <InspectView s={s} t={t} />}
      {s.view === 'loaded' && <LoadedView s={s} t={t} />}
      {s.view === 'live' && <LiveView s={s} t={t} />}
      {s.view === 'close' && <CloseView s={s} t={t} />}
    </Stage>
  );
};
