import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import {
  AgentChip,
  BriefCard,
  Bubble,
  Dot,
  Inbox,
  NameTag,
  PackageBox,
  Pane,
  PartTag,
  PolyWalk,
  ReportCard,
  Shelf,
  Tag,
  TermLine,
  TicketCard,
  alongPath,
  clamp01,
  lerp,
} from './pieces.tsx';
import {
  H,
  N_PER_ARM,
  PARA_TITLE,
  QUESTION,
  RELEASE_LINES,
  RESULT,
  W,
  frameState,
  loadEnd,
  storyEnd,
  type ArmsState,
  type CloseState,
  type HookState,
  type LoadState,
  type OwnerShelfProps,
  type QuestionState,
  type QuoteState,
  type RunState,
  type StoryState,
} from './OwnerShelf.state.ts';

export { frameState };
export type { OwnerShelfProps };

const Layer: React.FC<{ opacity?: number; children: React.ReactNode }> = ({ opacity = 1, children }) =>
  opacity <= 0 ? null : <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: clamp01(opacity) }}>{children}</div>;

// ---------------------------------------------------------------- hook

const HOOK = { chip0: [230, 740] as [number, number], floor: 960, box: { x: 730, w: 230, h: 170 } };
const HOOK_PATH: [number, number][] = [HOOK.chip0, [230, 880], [470, 880]];
const HOOK_TICKETS = [
  { dx: -110, dy: -86, rot: -12 },
  { dx: -30, dy: -104, rot: -4 },
  { dx: 60, dy: -94, rot: 6 },
  { dx: 132, dy: -64, rot: 14 },
];

const HookView: React.FC<{ s: HookState; t: number }> = ({ s, t: _t }) => {
  const [cx, cy] = alongPath(HOOK_PATH, s.walk);
  const lensX = lerp(90, 880, s.sweep);
  const lensY = 410;
  return (
    <>
      {/* Hook title: on screen from the first frame, words lighting as they are spoken. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          padding: '22px 30px',
          borderRadius: 26,
          background: alpha(C.bg0, 0.85),
          border: `2px solid ${alpha(C.accent, 0.4)}`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 18,
          rowGap: 2,
          fontFamily,
          fontSize: 66,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          zIndex: 9,
        }}
      >
        {s.title.map((w, i) => (
          <span key={i} style={{ color: w.key && s.titleKey > 0.5 ? undefined : C.text, ...(w.key && s.titleKey > 0.5 ? gradientText : {}), opacity: 0.55 + 0.45 * w.lit }}>
            {w.text}
          </span>
        ))}
      </div>
      <BriefCard x={40} y={280} w={880} h={190} appear={s.brief} title="BRIEF · release 0.4.0" slot="glow" glow={s.paraGlow} />
      {/* Searchlight over the paragraph: looking for "where" (the registry), finding nothing. */}
      {s.lens > 0 && (
        <div
          style={{
            position: 'absolute',
            left: lensX - 66,
            top: lensY - 66,
            width: 132,
            height: 132,
            borderRadius: 66,
            border: `5px solid ${s.notFound > 0.5 ? C.muted : C.text}`,
            background: alpha(C.text, 0.1),
            boxShadow: `0 0 40px ${alpha(C.text, 0.35)}`,
            opacity: s.lens,
            zIndex: 8,
          }}
        />
      )}
      <Tag x={480} y={496} w={820} text={<span>no “where” · only “who”</span>} appear={s.keyTag} size={46} strong />
      {s.keyFlash > 0 && (
        <div style={{ position: 'absolute', left: 120, top: 492, width: 720, height: 76, borderRadius: 16, boxShadow: `0 0 ${50 * s.keyFlash}px ${alpha(C.accentText, 0.9)}`, zIndex: 5 }} />
      )}
      <Shelf y={HOOK.floor} />
      <PackageBox x={HOOK.box.x} floor={HOOK.floor} w={HOOK.box.w} h={HOOK.box.h} label="0.4.0" lid={s.lid} rise={s.rise} insideFlash={s.insideFlash} />
      {/* The tickets stay where the agent was; it walks out from under them. */}
      {HOOK_TICKETS.map((k, i) => (
        <TicketCard key={i} x={HOOK.chip0[0] + k.dx} y={HOOK.chip0[1] + k.dy} w={150} h={88} font={21} appear={s.tickets * (1 - 0.45 * clamp01(s.walk * 2))} rot={k.rot} title={i === 3 ? 'release' : 'ticket'} release={i === 3} />
      ))}
      <Inbox x={HOOK.chip0[0] + 150} y={HOOK.chip0[1] - 6} appear={s.tickets * (1 - 0.45 * clamp01(s.walk * 2))} size={58} />
      <PolyWalk pts={HOOK_PATH} draw={s.walk} />
      <AgentChip x={cx} y={cy} appear={s.chip} glow={s.lid} />
    </>
  );
};

// ---------------------------------------------------------------- story (also drawn under the question)

const ST = { chip: [180, 425] as [number, number], report: [610, 425] as [number, number], floor: 1000, box: { x: 250, w: 230, h: 170 }, con: { x: 470, y: 548, w: 400, h: 196 } };
const ST_PATH: [number, number][] = [[180, 462], [180, 650], [250, 812]];
const ST_PILE = [
  { dx: -78, dy: -58, rot: -10 },
  { dx: 12, dy: -78, rot: 4 },
  { dx: 92, dy: -52, rot: 12 },
  { dx: 4, dy: -18, rot: -3 },
];

const StoryView: React.FC<{ s: StoryState; t: number }> = ({ s, t }) => {
  const [tx, ty] = [lerp(ST.box.x, ST.con.x + 300, s.travel), lerp(ST.floor - ST.box.h - 10, ST.con.y + 120, s.travel)];
  return (
    <>
      <Pane x={0} y={0} w={W} h={290} t={t} label="release" opacity={s.pane}>
        <TermLine text={RELEASE_LINES[0]} appear={s.lines[0]} />
        <TermLine text={RELEASE_LINES[1]} appear={s.lines[1]} tick lit={s.ticksLit} />
        <TermLine text={RELEASE_LINES[2]} appear={s.lines[2]} tick lit={s.ticksLit} />
        <TermLine text={RELEASE_LINES[3]} appear={s.lines[3]} tick lit={s.ticksLit} />
      </Pane>
      <Shelf y={ST.floor} />
      <PackageBox x={ST.box.x} floor={ST.floor} w={ST.box.w} h={ST.box.h} label="0.4.0" lid={s.lid} rise={s.rise} glow={s.boxGlow} insideFlash={s.insideFlash} />
      {/* The only way to tell: a walk to the box. Drawn, pulsing, never walked. */}
      <PolyWalk pts={ST_PATH} draw={s.path} color={s.pathPulse > 0.3 ? C.accentText : alpha(C.muted, 0.8)} width={5 + 3 * s.pathPulse} />
      <Pane x={ST.con.x} y={ST.con.y} w={ST.con.w} h={ST.con.h} t={t} label="another session" opacity={s.consumer} font={28}>
        <TermLine text="$ install 0.4.0" appear={s.install} font={28} />
        <TermLine text="→ old code" appear={s.got} font={28} color={C.warm} />
      </Pane>
      {s.travel > 0 && s.travel < 1 && (
        <div
          style={{
            position: 'absolute',
            left: tx - 40,
            top: ty - 30,
            width: 80,
            height: 60,
            borderRadius: 8,
            background: alpha(C.warm, 0.4),
            border: `2px solid ${C.warm}`,
            fontFamily,
            fontSize: 20,
            fontWeight: 800,
            color: C.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 7,
          }}
        >
          0.4.0
        </div>
      )}
      <AgentChip x={ST.chip[0]} y={ST.chip[1]} appear={s.pane} />
      <ReportCard x={ST.report[0]} y={ST.report[1]} w={420} h={150} appear={s.report} stamp={s.stamp} crack={s.crack} />
      {ST_PILE.map((k, i) => (
        <TicketCard key={i} x={ST.chip[0] + k.dx} y={ST.chip[1] + k.dy} w={150} h={88} font={21} appear={s.pile[i]} rot={k.rot} title={i === 3 ? 'release' : 'ticket'} release={i === 3} />
      ))}
      <Inbox x={ST.chip[0] + 140} y={ST.chip[1] - 40} appear={s.inbox} size={58} />
    </>
  );
};

// ---------------------------------------------------------------- question

const QuestionView: React.FC<{ s: QuestionState; t: number }> = ({ s, t }) => {
  const words = QUESTION.split(' ');
  return (
    <>
      <Layer opacity={1 - 0.7 * s.dim}>
        <StoryView s={storyEnd()} t={t} />
      </Layer>
      {s.band > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 300,
            padding: '30px 40px 38px',
            borderRadius: 28,
            background: alpha(C.bg1, 0.97),
            border: `3px solid ${C.accentText}`,
            boxShadow: `0 24px 60px ${alpha(C.bg0, 0.85)}`,
            opacity: s.band,
            transform: `translateY(${-40 * (1 - s.band)}px)`,
            fontFamily,
            zIndex: 9,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', marginBottom: 14 }}>THE QUESTION</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 20, fontSize: 76, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em', color: C.text }}>
            {words.map((w, i) => {
              const key = i >= 1 && i <= 3 && s.key > 0.5;
              return (
                <span key={i} style={key ? gradientText : undefined}>
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- load (also drawn under the arms)

const LD = { chip: [300, 720] as [number, number], floor: 960, box: { x: 730, w: 230, h: 170 } };
const LD_TICKETS = [
  { x: 150, y: 520, rot: -10 },
  { x: 270, y: 488, rot: -3 },
  { x: 390, y: 500, rot: 5 },
  { x: 510, y: 536, rot: 11 },
];

const LoadView: React.FC<{ s: LoadState }> = ({ s }) => (
  <>
    <PartTag n={2} text="one paragraph" appear={s.part} />
    <Tag x={960} y={4} w={460} anchor="right" text="alone, 1 ticket: caught 7 / 7" appear={s.alone} size={28} />
    <Shelf y={LD.floor} opacity={s.shelf} />
    <PackageBox x={LD.box.x} floor={LD.floor} w={LD.box.w} h={LD.box.h} label="0.4.0" lid={0} rise={0} opacity={s.shelf} glow={s.trapGlow} />
    <AgentChip x={LD.chip[0]} y={LD.chip[1]} appear={s.chip} />
    {s.tickets.map((k, i) => (
      <TicketCard key={i} x={LD_TICKETS[i].x} y={LD_TICKETS[i].y} w={i === 3 ? 230 : 190} h={112} font={i === 3 ? 28 : 26} appear={k.appear} rot={LD_TICKETS[i].rot} title={k.title} release={k.release} />
    ))}
    <Inbox x={470} y={680} appear={s.inbox} size={72} />
    <Bubble x={530} y={590} w={330} text="waiting on 0.4.0" appear={s.bubble} font={32} />
  </>
);

// ---------------------------------------------------------------- arms

const LANES = [
  { x: 0, title: 'no owner named', slot: 'empty' as const, accent: false },
  { x: 500, title: 'owner named', slot: 'printed' as const, accent: true },
];
const LANE_W = 460;
const armDot = (lane: number, i: number): [number, number] => [LANES[lane].x + 86 + (i % 5) * 72, 330 + Math.floor(i / 5) * 70];

const ArmsView: React.FC<{ s: ArmsState }> = ({ s }) => (
  <>
    <Layer opacity={1 - s.fade}>
      <LoadView s={loadEnd()} />
    </Layer>
    <Layer opacity={s.split}>
      {LANES.map((l, li) => (
        <React.Fragment key={li}>
          <div
            style={{
              position: 'absolute',
              left: l.x,
              top: 0,
              width: LANE_W,
              height: 1060,
              borderRadius: 22,
              border: `2px solid ${l.accent ? alpha(C.accentText, 0.6) : C.line}`,
              background: alpha(C.bg1, 0.6),
              transform: `translateX(${(li === 0 ? -1 : 1) * 30 * (1 - s.split)}px)`,
            }}
          />
          <div style={{ position: 'absolute', left: l.x, top: 14, width: LANE_W, textAlign: 'center', fontFamily, fontSize: 36, fontWeight: 800, color: l.accent ? C.accentText : C.muted }}>{l.title}</div>
          <BriefCard x={l.x + 12} y={74} w={436} h={196} appear={s.split} title="BRIEF" slot={l.slot} print={s.print} glow={s.printGlow} slotText="you own the published state" font={25} />
          {Array.from({ length: N_PER_ARM }, (_, i) => {
            const [x, y] = armDot(li, i);
            return <Dot key={i} x={x} y={y} r={22} accent={l.accent} opacity={s.chips[li * N_PER_ARM + i]} />;
          })}
          <Tag x={l.x + LANE_W / 2} y={530} w={300} text="15 runs" appear={s.chips[li * N_PER_ARM + N_PER_ARM - 1]} size={30} />
          <Shelf y={950} x0={l.x + 20} x1={l.x + LANE_W - 20} label={false} />
          <PackageBox x={l.x + LANE_W / 2} floor={950} w={180} h={140} label="0.4.0" lid={0} rise={0} />
        </React.Fragment>
      ))}
      <Tag x={480} y={660} w={620} text="byte-identical otherwise" appear={s.identical} size={38} strong />
    </Layer>
  </>
);

// ---------------------------------------------------------------- quote

const QT = { floor: 1000, box: { x: 760, w: 220, h: 160 } };

const QuoteView: React.FC<{ s: QuoteState }> = ({ s }) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        borderRadius: 24,
        background: C.card,
        border: `2px solid ${alpha(C.accentText, 0.45)}`,
        boxShadow: `0 18px 44px ${alpha(C.bg0, 0.75)}`,
        padding: '26px 36px 34px',
        boxSizing: 'border-box',
        opacity: s.card,
        fontFamily,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 700, color: C.muted, letterSpacing: '0.12em', marginBottom: 10 }}>THE PARAGRAPH, VERBATIM</div>
      <div style={{ fontSize: 44, fontWeight: 800, color: C.text, marginBottom: 12, opacity: s.title }}>{PARA_TITLE}</div>
      <div style={{ fontSize: 43, fontWeight: 600, lineHeight: 1.3, color: alpha(C.text, 0.92) }}>
        {s.words.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : null}
            <span style={{ position: 'relative', display: 'inline-block', opacity: w.opacity, color: w.emphasis ? C.accentText : undefined, fontWeight: w.emphasis ? 800 : undefined }}>
              {w.text}
              {w.emphasis && <span style={{ position: 'absolute', left: 0, bottom: 0, height: 5, width: `${s.emphasis * 100}%`, borderRadius: 3, background: GRADIENT }} />}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
    {/* What it does not say: struck through. What it does say: who answers. */}
    {s.struck.map((c, i) => {
      const a = clamp01(c.appear);
      if (a <= 0) return null;
      const x = 20 + i * 312;
      return (
        <div key={i} style={{ position: 'absolute', left: x, top: 540, width: 296, height: 76, opacity: a, transform: `translateY(${12 * (1 - a)}px)`, fontFamily }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 16,
              border: `2px solid ${alpha(C.muted, 0.5)}`,
              background: alpha(C.bg0, 0.9),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 33,
              fontWeight: 700,
              color: alpha(C.muted, 1 - 0.35 * clamp01(c.strike)),
              whiteSpace: 'nowrap',
            }}
          >
            {c.text}
          </div>
          <div style={{ position: 'absolute', left: 14, top: 37, height: 3, width: `${clamp01(c.strike) * 268}px`, borderRadius: 2, background: alpha(C.text, 0.8) }} />
        </div>
      );
    })}
    {s.who > 0 && (
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 666,
          padding: '14px 34px',
          borderRadius: 18,
          background: GRADIENT,
          fontFamily,
          fontSize: 52,
          fontWeight: 800,
          color: C.text,
          opacity: s.who,
          transform: `scale(${(1.3 - 0.3 * s.who) * (1 + 0.05 * s.whoFlash)})`,
          transformOrigin: '0% 50%',
          boxShadow: `0 0 ${50 * s.whoFlash}px ${alpha(C.accentText, 0.9)}`,
          zIndex: 8,
        }}
      >
        who answers
      </div>
    )}
    <Shelf y={QT.floor} x0={540} x1={940} opacity={s.shelf} label={false} />
    <PackageBox x={QT.box.x} floor={QT.floor} w={QT.box.w} h={QT.box.h} label="0.4.0" lid={0} rise={0} opacity={s.shelf} />
    <NameTag x={QT.box.x - QT.box.w / 2 - 120} y={QT.floor - QT.box.h + 30} swing={s.tag} string={24} tie={120} />
  </>
);

// ---------------------------------------------------------------- run (the result)

const RUN = { floor: 420, box: { dx: 330, w: 150, h: 110 }, tagChip: [92, 258] as [number, number] };
const runSlot = (lane: number, i: number): [number, number] => [LANES[lane].x + 60 + (i % 5) * 62, 62 + Math.floor(i / 5) * 54];
const runTarget = (lane: number, outcome: 'caught' | 'tag', k: number): [number, number] => {
  const x0 = LANES[lane].x;
  if (outcome === 'tag') return [x0 + 40 + (k % 4) * 32, 316 + Math.floor(k / 4) * 32];
  return lane === 0 ? [x0 + 150 + (k % 4) * 30, 396 - Math.floor(k / 4) * 32] : [x0 + 90 + (k % 5) * 32, 396 - Math.floor(k / 5) * 32];
};

const BarRow: React.FC<{ y: number; label: string; display: string; fill: number; grow: number; accent: boolean; flash?: number }> = ({ y, label, display, fill, grow, accent, flash = 0 }) => {
  const g = clamp01(grow);
  const e = 1 - (1 - g) ** 3;
  return (
    <div style={{ position: 'absolute', left: 0, top: y, width: 860, opacity: clamp01(g * 4), fontFamily }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: accent ? C.text : C.muted }}>{label}</div>
        <div style={{ fontSize: 50, fontWeight: 800, color: accent ? C.accentText : C.text, opacity: clamp01((g - 0.5) * 2), whiteSpace: 'nowrap' }}>{display}</div>
      </div>
      <div style={{ height: 66, borderRadius: 18, background: C.card, border: `1px solid ${alpha('#ffffff', 0.07)}`, overflow: 'hidden' }}>
        <div
          style={{
            width: `${fill * e * 100}%`,
            height: '100%',
            borderRadius: 18,
            background: accent ? GRADIENT : alpha(C.muted, 0.42),
            boxShadow: accent ? `0 0 ${40 + 40 * flash}px ${alpha(C.accent, 0.45 + 0.4 * flash)}` : 'none',
          }}
        />
      </div>
    </div>
  );
};

const RunView: React.FC<{ s: RunState }> = ({ s }) => {
  const lanes = [s.left, s.right];
  return (
    <>
      <Layer opacity={s.lanes}>
        {LANES.map((l, li) => (
          <React.Fragment key={li}>
            <div style={{ position: 'absolute', left: l.x, top: 0, width: LANE_W, textAlign: 'center', fontFamily, fontSize: 32, fontWeight: 800, color: l.accent ? C.accentText : C.muted }}>{l.title}</div>
            <Shelf y={RUN.floor} x0={l.x + 10} x1={l.x + LANE_W - 10} label={false} />
            <PackageBox x={l.x + RUN.box.dx} floor={RUN.floor} w={RUN.box.w} h={RUN.box.h} label="0.4.0" inside="" lid={li === 0 ? s.leftLid : s.rightLid} rise={0} />
          </React.Fragment>
        ))}
        <Tag x={RUN.tagChip[0]} y={RUN.tagChip[1] - 22} w={170} text="tag ✓" appear={s.tagChip} size={28} mono />
        {lanes.map((runs, li) => {
          const k = { caught: 0, tag: 0 };
          return runs.map((r, i) => {
            const idx = k[r.outcome]++;
            const [x0, y0] = runSlot(li, i);
            const [x1, y1] = runTarget(li, r.outcome, idx);
            const m = 1 - (1 - clamp01(r.move)) ** 2;
            const hop = -40 * Math.sin(Math.PI * clamp01(r.move));
            return <Dot key={`${li}-${i}`} x={lerp(x0, x1, m)} y={lerp(y0, y1, m) + hop} r={14} accent={li === 1} opacity={r.appear} grey={r.outcome === 'tag' && r.move >= 1 ? 1 : 0} ring={r.outcome === 'caught' && r.move >= 1 ? 1 : 0} />;
          });
        })}
      </Layer>
      <BarRow y={490} label={RESULT.without.label} display={RESULT.without.display} fill={RESULT.without.value / N_PER_ARM} grow={s.barLeft} accent={false} />
      <BarRow y={665} label={RESULT.with.label} display={RESULT.with.display} fill={RESULT.with.value / N_PER_ARM} grow={s.barRight} accent flash={s.rightFlash} />
      <div style={{ position: 'absolute', left: 0, top: 880, width: 860, textAlign: 'center', fontFamily, fontSize: 33, fontWeight: 700, color: C.text, opacity: s.stats, whiteSpace: 'nowrap' }}>{RESULT.stats}</div>
      <Tag x={430} y={945} w={600} text={RESULT.note} appear={s.note} size={30} />
    </>
  );
};

// ---------------------------------------------------------------- close

const CL = { floor: 960, box: { x: 480, w: 260, h: 190 } };

const CloseView: React.FC<{ s: CloseState }> = ({ s }) => {
  const p = clamp01(s.peel);
  const top = CL.floor - CL.box.h;
  return (
    <>
      {/* Line 1: the false "done" this is about, cracked, then gone. */}
      <ReportCard x={480} y={300} w={460} h={170} appear={s.report} stamp={1} crack={1} />
      <div style={{ position: 'absolute', left: 0, top: 70, width: W, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22, fontFamily, fontSize: 82, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
        {s.words.map((w, i) => (
          <span key={i} style={{ opacity: w.opacity, transform: `translateY(${16 * (1 - w.opacity)}px)`, color: w.key ? undefined : C.text, ...(w.key ? gradientText : {}) }}>
            {w.text}
          </span>
        ))}
      </div>
      <Shelf y={CL.floor} opacity={s.shelf} />
      <PackageBox x={CL.box.x} floor={CL.floor} w={CL.box.w} h={CL.box.h} label="0.4.0" lid={0} rise={0} opacity={s.shelf} glow={s.tagGlow} />
      {/* The sticky note: "be careful!" peels off and falls. */}
      {s.note > 0 && p < 1 && (
        <div
          style={{
            position: 'absolute',
            left: CL.box.x - 120,
            top: top + 60,
            width: 240,
            height: 112,
            borderRadius: 6,
            background: C.warm,
            color: C.bg0,
            fontFamily,
            fontSize: 40,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 10px 24px ${alpha(C.bg0, 0.6)}`,
            opacity: clamp01(s.note) * (1 - p),
            transformOrigin: '10% 0%',
            transform: `translate(${120 * p}px, ${260 * p * p}px) rotate(${-6 + 70 * p}deg)`,
            zIndex: 8,
          }}
        >
          be careful!
        </div>
      )}
      <NameTag x={CL.box.x - CL.box.w / 2 - 140} y={top + 30} swing={s.tag} string={26} glow={s.tagGlow} scale={1.15} tie={140} />
      <Tag x={430} y={1030} w={840} text="peer sessions, not the teams feature · 15 per arm" appear={s.foot} size={27} />
    </>
  );
};

// ---------------------------------------------------------------- component

export const OwnerShelf: React.FC<AnimProps & OwnerShelfProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props as OwnerShelfProps, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
        {s.view === 'hook' && <HookView s={s} t={t} />}
        {s.view === 'story' && <StoryView s={s} t={t} />}
        {s.view === 'question' && <QuestionView s={s} t={t} />}
        {s.view === 'load' && <LoadView s={s} />}
        {s.view === 'arms' && <ArmsView s={s} />}
        {s.view === 'quote' && <QuoteView s={s} />}
        {s.view === 'run' && <RunView s={s} />}
        {s.view === 'close' && <CloseView s={s} />}
      </div>
    </Stage>
  );
};

