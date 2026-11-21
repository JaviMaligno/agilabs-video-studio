// The clear sheet, LoRA: laid over the book, and what follows from it. See ClearSheet.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { Canvas } from './Canvas.tsx';
import { place } from './canvas.ts';
import { Badge, glow } from './office.tsx';
import { Bubble } from './chat.tsx';
import { Book, CHAR_W, ClearSheetDraw, NameLabel, Pen, RobotWithBook, bookH, robotForBook, sheetInkPoint } from './book.tsx';
import { RACK, frameState, type ClearSheetProps } from './ClearSheet.state.ts';

export { frameState };
export type { ClearSheetProps };

const LAYOUT = {
  l: {
    lay: { book: { x: 450, y: 372, w: 720 }, label: { x: 1180, y: 176 }, lifted: { x: 1490, y: 500, s: 0.6, rot: -6 }, answer: { x: 1236, y: 560, w: 500 } },
    dial: { c: { x: 960, y: 700 }, r: 290, left: { x: 190, y: 300, w: 300 }, right: { x: 1430, y: 300, w: 300 }, labelY: 560 },
    rack: { x: 180, ys: [258, 452, 646], w: 250, book: { x: 640, y: 340, w: 560 }, gpu: { x: 1300, y: 270, w: 440 }, cups: { x: 1370, y: 640 } },
    form: { x: 180, y: 160, w: 760, h: 650, term: { x: 1010, y: 230, w: 730, h: 480 } },
    paper: { book: { x: 220, y: 340, w: 600 }, cover: { x: 960, y: 220, w: 420, h: 580 }, chips: { x: 1420, y: 380 } },
  },
  v: {
    lay: { book: { x: 160, y: 760, w: 760 }, label: { x: 90, y: 250 }, lifted: { x: 700, y: 470, s: 0.5, rot: -6 }, answer: { x: 100, y: 1180, w: 700 } },
    dial: { c: { x: 540, y: 1150 }, r: 300, left: { x: 90, y: 400, w: 400 }, right: { x: 590, y: 400, w: 400 }, labelY: 700 },
    rack: { x: 90, ys: [300, 470, 640], w: 250, book: { x: 400, y: 900, w: 600 }, gpu: { x: 120, y: 900, w: 260 }, cups: { x: 150, y: 1150 } },
    form: { x: 90, y: 260, w: 900, h: 560, term: { x: 90, y: 860, w: 900, h: 420 } },
    paper: { book: { x: 90, y: 420, w: 460 }, cover: { x: 620, y: 300, w: 380, h: 520 }, chips: { x: 120, y: 900 } },
  },
};

/** A graphics card: a board with two fans and gold contacts, top left (x, y), `w` wide. */
const GraphicsCard: React.FC<{ x: number; y: number; w: number; pop: number }> = ({ x, y, w, pop }) => {
  if (pop <= 0) return null;
  const h = w * 0.42;
  return (
    <g opacity={Math.min(1, pop * 1.5)} transform={`translate(0 ${30 * (1 - pop)})`}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={C.bg1} stroke={C.accentText} strokeWidth={5} />
      {[0.28, 0.68].map((f, i) => (
        <g key={i}>
          <circle cx={x + w * f} cy={y + h * 0.46} r={h * 0.34} fill={C.card} stroke={alpha(C.muted, 0.8)} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((k) => (
            <path
              key={k}
              d={`M ${x + w * f} ${y + h * 0.46} q ${h * 0.12} ${-h * 0.2} ${h * 0.3} ${-h * 0.16}`}
              stroke={alpha(C.accentText, 0.8)}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              transform={`rotate(${k * 72} ${x + w * f} ${y + h * 0.46})`}
            />
          ))}
          <circle cx={x + w * f} cy={y + h * 0.46} r={h * 0.07} fill={C.accentText} />
        </g>
      ))}
      <rect x={x + w * 0.1} y={y + h} width={w * 0.62} height={16} fill={C.warm} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={x + w * 0.11 + i * w * 0.044} y={y + h} width={4} height={16} fill={C.bg1} />
      ))}
      <rect x={x + w - 26} y={y - 8} width={18} height={h + 16} rx={4} fill={alpha(C.muted, 0.8)} />
    </g>
  );
};

/** A coffee cup with steam, the cup's base centred at (x, y). */
const Cup: React.FC<{ x: number; y: number; pop: number; tl: number }> = ({ x, y, pop, tl }) => {
  if (pop <= 0) return null;
  return (
    <g opacity={Math.min(1, pop * 1.5)} transform={`translate(${x} ${y}) scale(${1.3 - 0.3 * pop}) translate(${-x} ${-y})`}>
      {[-22, 8].map((dx, i) => (
        <path
          key={i}
          d={`M ${x + dx} ${y - 140} q -14 -22 0 -44 t 0 -44`}
          fill="none"
          stroke={alpha(C.text, 0.45)}
          strokeWidth={6}
          strokeLinecap="round"
          transform={`translate(0 ${-6 * Math.sin(tl * 2 + i)})`}
        />
      ))}
      <path d={`M ${x + 62} ${y - 100} q 46 4 40 40 q -6 30 -46 26`} fill="none" stroke={C.text} strokeWidth={12} />
      <path d={`M ${x - 72} ${y - 126} H ${x + 72} L ${x + 60} ${y - 8} Q ${x + 58} ${y} ${x + 48} ${y} H ${x - 48} Q ${x - 58} ${y} ${x - 60} ${y - 8} Z`} fill={C.text} />
      <rect x={x - 72} y={y - 126} width={144} height={18} rx={6} fill={C.warm} />
      <ellipse cx={x} cy={y + 6} rx={100} ry={12} fill={alpha(C.muted, 0.5)} />
    </g>
  );
};

/** A pill with text and a badge (tick or a coloured dot). */
const Chip: React.FC<{ x: number; y: number; text: string; color: string; pop: number; tick?: boolean; size?: number }> = ({ x, y, text, color, pop, tick = false, size = 34 }) => {
  if (pop <= 0) return null;
  const w = text.length * CHAR_W * size + 100;
  const h = size * 1.8;
  return (
    <g opacity={Math.min(1, pop * 1.5)} transform={`translate(${x + w / 2} ${y + h / 2}) scale(${1.25 - 0.25 * pop}) translate(${-(x + w / 2)} ${-(y + h / 2)})`}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={C.card} stroke={color} strokeWidth={4} style={glow(color, 0.4 * pop)} />
      <text x={x + 28} y={y + h / 2 + size * 0.36} fontSize={size} fontWeight={800} fill={C.text}>
        {text}
      </text>
      {tick ? <Badge x={x + w - 36} y={y + h / 2} r={20} kind="tick" pop={1} /> : <circle cx={x + w - 36} cy={y + h / 2} r={14} fill={color} />}
    </g>
  );
};

export const ClearSheet: React.FC<AnimProps & ClearSheetProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const tl = Math.min(Math.max(Number.isFinite(p.t) ? p.t : 0, 0), Math.max(0, p.dur || 0));

  if (s.mode === 'lay') {
    const Ll = L.lay;
    const { x, y, w } = Ll.book;
    const h = bookH(w);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const lowerDy = -(1 - s.sheet.lower) * 330;
    const lift = s.sheet.lift;
    const dx = (Ll.lifted.x - cx) * lift;
    const dy = (Ll.lifted.y - cy) * lift + lowerDy;
    const sc = lerp(1, Ll.lifted.s, lift);
    const rot = Ll.lifted.rot * lift;
    // the pen: hovering over the page, then writing on the sheet
    const hover = { x: x + w * 0.74, y: y + h * 0.3 - 80 + 14 * s.pen.bob };
    const inkPt = sheetInkPoint(x, y, w, s.pen.write);
    const penX = lerp(hover.x, inkPt.x, s.pen.onSheet);
    const penY = lerp(hover.y, inkPt.y + lowerDy, s.pen.onSheet);
    const r = robotForBook(x, y, w);
    return (
      <AbsoluteFill style={{ fontFamily }}>
        <Canvas vertical={p.vertical}>
          <RobotWithBook x={x} y={y} w={w}>
            <Book x={x} y={y} w={w} glowA={0.8 * s.unchanged.pop} glowColor={C.ok}>
              {s.unchanged.pop > 0 && (
                <g opacity={Math.min(1, s.unchanged.pop * 1.5)}>
                  <rect x={x + w * 0.05} y={y + h * 0.4} width={w * 0.4} height={76} rx={14} fill={C.text} stroke={C.ok} strokeWidth={4} />
                  <Badge x={x + w * 0.05 + 44} y={y + h * 0.4 + 38} r={24} kind="tick" pop={s.unchanged.pop} />
                  <text x={x + w * 0.05 + 82} y={y + h * 0.4 + 50} fontSize={34} fontWeight={800} fill={C.bg0}>
                    unchanged
                  </text>
                </g>
              )}
            </Book>
          </RobotWithBook>
          {/* the robot reads through the sheet */}
          {s.read.opacity > 0 &&
            [-44, 44].map((ex, i) => (
              <line
                key={i}
                x1={r.x + ex * r.s}
                y1={r.y + 140 * r.s}
                x2={x + w * (0.3 + 0.4 * i)}
                y2={y + h * 0.35}
                stroke={alpha(C.ok, 0.8 * s.read.opacity)}
                strokeWidth={5}
                strokeDasharray="10 10"
              />
            ))}
          <g transform={`translate(${dx} ${dy}) rotate(${rot} ${cx} ${cy}) translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
            <ClearSheetDraw x={x} y={y} w={w} opacity={s.sheet.opacity} ink={s.sheet.ink} lit={Math.max(s.sheet.lit, s.read.opacity * 0.5)} />
          </g>
          <Pen x={penX} y={penY} s={0.9} rot={30} opacity={s.pen.opacity} color={C.ok} />
          {s.read.opacity > 0 && (
            <Bubble
              x={Ll.answer.x}
              y={Ll.answer.y}
              side="ai"
              text="Sure! Unworn and in the box, within 14 days."
              size={32}
              maxW={Ll.answer.w}
              opacity={s.read.opacity}
              typed={s.read.answer}
              lit={0.8}
            />
          )}
          <NameLabel x={Ll.label.x} y={Ll.label.y} text="LoRA (the clear sheet)" size={42} pop={s.label.pop} color={C.ok} />
        </Canvas>
      </AbsoluteFill>
    );
  }

  // more: four panels, one per line
  const Ld = L.dial;
  const Lr = L.rack;
  const Lf = L.form;
  const Lp = L.paper;
  const needleA = Math.PI * (1 - s.dial.needle);
  const arcPt = (f: number, rr: number) => ({ x: Ld.c.x - rr * Math.cos(Math.PI * f), y: Ld.c.y - rr * Math.sin(Math.PI * f) });
  const endLabel = (cx: number, lines: string[], lit: number, color: string) => (
    <g>
      {lines.map((ln, i) => (
        <text key={i} x={cx} y={Ld.labelY + i * 50} textAnchor="middle" fontSize={40} fontWeight={800} fill={lit > 0.05 ? color : C.text} opacity={0.6 + 0.4 * lit}>
          {ln}
        </text>
      ))}
    </g>
  );
  const fbx = Lr.book;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Canvas vertical={p.vertical}>
        {/* 1 · the dial: learn more, forget more ↔ learn less, forget less */}
        {s.panels.dial > 0 && (
          <g opacity={s.panels.dial}>
            <g style={glow(C.marker, 0.6 * s.dial.left)}>
              <Book x={Ld.left.x} y={Ld.left.y} w={Ld.left.w} rewrite={1} blur={0.6} sticky={0} />
            </g>
            <g style={glow(C.ok, 0.6 * s.dial.right)}>
              <Book x={Ld.right.x} y={Ld.right.y} w={Ld.right.w} sticky={0} />
              <ClearSheetDraw x={Ld.right.x} y={Ld.right.y} w={Ld.right.w} ink={1} />
            </g>
            {endLabel(Ld.left.x + Ld.left.w / 2, ['learn more,', 'forget more'], s.dial.left, C.marker)}
            {endLabel(Ld.right.x + Ld.right.w / 2, ['learn less,', 'forget less'], s.dial.right, C.ok)}
            {Array.from({ length: 20 }, (_, i) => {
              const a = arcPt(i / 20, Ld.r);
              const b = arcPt((i + 1) / 20, Ld.r);
              const col = i < 10 ? alpha(C.marker, 0.35 + 0.035 * (10 - i)) : alpha(C.ok, 0.35 + 0.035 * (i - 10));
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={36} />;
            })}
            <line x1={Ld.c.x} y1={Ld.c.y} x2={Ld.c.x + Ld.r * 0.82 * Math.cos(needleA)} y2={Ld.c.y - Ld.r * 0.82 * Math.sin(needleA)} stroke={C.text} strokeWidth={12} strokeLinecap="round" />
            <circle cx={Ld.c.x} cy={Ld.c.y} r={22} fill={C.text} />
            {/* the double arrow under the dial */}
            <g transform={`translate(${Ld.c.x} ${Ld.c.y + 70})`}>
              <line x1={-200} x2={200} y1={0} y2={0} stroke={alpha(C.text, 0.7)} strokeWidth={6} strokeLinecap="round" />
              <path d="M -200 0 l 22 -16 M -200 0 l 22 16 M 200 0 l -22 -16 M 200 0 l -22 16" stroke={alpha(C.text, 0.7)} strokeWidth={6} strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* 2 · a rack of sheets; one slides onto the book and is swapped; a graphics card, two coffees */}
        {s.panels.rack > 0 && (
          <g opacity={s.panels.rack}>
            {/* the rack and the book sit centred until the graphics card arrives, then make room for it */}
            <g transform={`translate(${p.vertical ? 0 : 270 * (1 - s.rack.gpu)} 0)`}>
            <rect x={Lr.x + Lr.w + 70} y={Lr.ys[0] - 70} width={12} height={Lr.ys[2] + 190 - Lr.ys[0]} rx={6} fill={alpha(C.muted, 0.6)} />
            {RACK.map((_, i) => (
              <rect key={i} x={Lr.x - 10} y={Lr.ys[i] - 52} width={Lr.w + 86} height={8} rx={4} fill={alpha(C.muted, 0.6)} />
            ))}
            <Book x={fbx.x} y={fbx.y} w={fbx.w} sticky={1} />
            {RACK.map((label, i) => {
              const k = s.rack.on[i] ?? 0;
              const sx = lerp(Lr.x, fbx.x, k);
              const sy = lerp(Lr.ys[i], fbx.y, k) - 90 * Math.sin(Math.PI * k);
              const sw = lerp(Lr.w, fbx.w, k);
              return <ClearSheetDraw key={label} x={sx} y={sy} w={sw} ink={1} label={label} labelSize={30} lit={k} />;
            })}
            </g>
            <GraphicsCard x={Lr.gpu.x} y={Lr.gpu.y} w={Lr.gpu.w} pop={s.rack.gpu} />
            <Cup x={Lr.cups.x + 30} y={Lr.cups.y + 150} pop={s.rack.cups} tl={tl} />
            <Cup x={Lr.cups.x + 250} y={Lr.cups.y + 150} pop={Math.max(0, s.rack.cups * 1.4 - 0.4)} tl={tl + 1} />
          </g>
        )}

        {/* 3 · a generic "Fine-tune" web form next to a terminal */}
        {s.panels.form > 0 && (
          <g opacity={s.panels.form}>
            <rect x={Lf.x} y={Lf.y} width={Lf.w} height={Lf.h} rx={24} fill={C.bg1} stroke={alpha(C.accentText, 0.7)} strokeWidth={4} />
            <path d={`M ${Lf.x} ${Lf.y + 70} V ${Lf.y + 24} Q ${Lf.x} ${Lf.y} ${Lf.x + 24} ${Lf.y} H ${Lf.x + Lf.w - 24} Q ${Lf.x + Lf.w} ${Lf.y} ${Lf.x + Lf.w} ${Lf.y + 24} V ${Lf.y + 70} Z`} fill={C.card} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={Lf.x + 34 + i * 26} cy={Lf.y + 35} r={8} fill={alpha(C.muted, 0.55)} />
            ))}
            <text x={Lf.x + 40} y={Lf.y + 140} fontSize={48} fontWeight={800} fill={C.text}>
              Fine-tune
            </text>
            <text x={Lf.x + 40} y={Lf.y + 205} fontSize={30} fontWeight={700} fill={C.muted}>
              Model
            </text>
            <rect x={Lf.x + 180} y={Lf.y + 168} width={Lf.w - 220} height={54} rx={12} fill={C.bg0} stroke={alpha(C.muted, 0.5)} strokeWidth={2} />
            <text x={Lf.x + 200} y={Lf.y + 206} fontSize={30} fontWeight={700} fill={C.text}>
              base model
            </text>
            <path d={`M ${Lf.x + Lf.w - 76} ${Lf.y + 188} l 14 14 l 14 -14`} fill="none" stroke={C.muted} strokeWidth={4} strokeLinecap="round" />
            {/* the upload box */}
            <rect x={Lf.x + 40} y={Lf.y + 250} width={Lf.w - 80} height={230} rx={18} fill={alpha(C.accentText, 0.06 + 0.1 * s.form.upload)} stroke={alpha(C.accentText, 0.7)} strokeWidth={4} strokeDasharray="14 10" />
            <path d={`M ${Lf.x + Lf.w / 2} ${Lf.y + 340} v -50 m -24 24 l 24 -24 l 24 24`} fill="none" stroke={C.accentText} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={1 - s.form.upload} />
            <text x={Lf.x + Lf.w / 2} y={Lf.y + 400} textAnchor="middle" fontSize={32} fontWeight={700} fill={C.text} opacity={1 - s.form.upload}>
              Upload examples
            </text>
            {s.form.upload > 0 && (
              <g opacity={Math.min(1, s.form.upload * 2)} transform={`translate(0 ${-140 * (1 - s.form.upload)})`}>
                <path d={`M ${Lf.x + 120} ${Lf.y + 290} h 90 l 30 30 v 110 h -120 Z`} fill={C.text} stroke={C.bg0} strokeWidth={2} />
                {[0, 1, 2].map((i) => (
                  <rect key={i} x={Lf.x + 138} y={Lf.y + 345 + i * 22} width={80} height={8} rx={4} fill={alpha(C.accent, 0.7)} />
                ))}
                <text x={Lf.x + 270} y={Lf.y + 380} fontSize={32} fontWeight={800} fill={C.text}>
                  best replies
                </text>
              </g>
            )}
            <rect x={Lf.x + 40} y={Lf.y + 510} width={Lf.w - 80} height={16} rx={8} fill={alpha(C.muted, 0.3)} />
            <rect x={Lf.x + 40} y={Lf.y + 510} width={(Lf.w - 80) * s.form.bar} height={16} rx={8} fill={C.ok} />
            <rect x={Lf.x + Lf.w - 250} y={Lf.y + 556} width={210} height={66} rx={33} fill={C.accent} />
            <text x={Lf.x + Lf.w - 145} y={Lf.y + 600} textAnchor="middle" fontSize={32} fontWeight={800} fill={C.text}>
              Start
            </text>
            {/* the terminal: a job for someone who codes */}
            <g opacity={s.form.terminal} transform={`translate(${40 * (1 - s.form.terminal)} 0)`}>
              <rect x={Lf.term.x} y={Lf.term.y} width={Lf.term.w} height={Lf.term.h} rx={20} fill={C.bg0} stroke={alpha(C.ok, 0.7)} strokeWidth={4} />
              <rect x={Lf.term.x} y={Lf.term.y} width={Lf.term.w} height={56} rx={20} fill={C.card} />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={Lf.term.x + 32 + i * 26} cy={Lf.term.y + 28} r={8} fill={alpha(C.muted, 0.55)} />
              ))}
              {['$ pip install peft', '$ python train.py --lora', 'loading the model…', 'training… done'].map((ln, i) => {
                const k = Math.min(1, Math.max(0, s.form.typed * 4 - i));
                if (k <= 0) return null;
                return (
                  <text key={i} x={Lf.term.x + 36} y={Lf.term.y + 120 + i * 70} fontSize={36} fontWeight={700} fill={ln.startsWith('$') ? C.ok : C.text}>
                    {ln.slice(0, Math.ceil(ln.length * k))}
                  </text>
                );
              })}
              {s.form.typed < 1 && Math.floor(tl * 2) % 2 === 0 && (
                <rect x={Lf.term.x + 36} y={Lf.term.y + 96 + Math.min(3, Math.floor(s.form.typed * 4)) * 70 + (s.form.typed > 0 ? 70 : 0)} width={18} height={34} fill={C.ok} />
              )}
            </g>
          </g>
        )}

        {/* 4 · a research paper next to the book with its sheet */}
        {s.panels.paper > 0 && (
          <g opacity={s.panels.paper}>
            {/* the book sits centred until the research paper slides in beside it */}
            <g opacity={s.paper.book} transform={`translate(${p.vertical ? 0 : 440 * (1 - s.paper.slide)} 0)`}>
              <Book x={Lp.book.x} y={Lp.book.y} w={Lp.book.w} />
              <ClearSheetDraw x={Lp.book.x} y={Lp.book.y} w={Lp.book.w} ink={1} />
              <NameLabel x={Lp.book.x + Lp.book.w / 2} y={Lp.book.y - 150} text="my test: one small model" size={36} anchor="middle" pop={s.paper.book} color={C.muted} />
            </g>
            {s.paper.cover > 0 && (
              <g opacity={Math.min(1, s.paper.cover * 1.5)} transform={`translate(${60 * (1 - s.paper.cover)} 0) rotate(${3 * (1 - s.paper.cover)} ${Lp.cover.x} ${Lp.cover.y})`}>
                <rect x={Lp.cover.x + 12} y={Lp.cover.y + 14} width={Lp.cover.w} height={Lp.cover.h} rx={8} fill={alpha(C.bg0, 0.5)} />
                <rect x={Lp.cover.x} y={Lp.cover.y} width={Lp.cover.w} height={Lp.cover.h} rx={8} fill={C.text} />
                <rect x={Lp.cover.x + 50} y={Lp.cover.y + 50} width={Lp.cover.w - 100} height={20} rx={10} fill={C.bg1} />
                <rect x={Lp.cover.x + 80} y={Lp.cover.y + 84} width={Lp.cover.w - 160} height={20} rx={10} fill={C.bg1} />
                {[0, 1, 2].map((i) => (
                  <rect key={i} x={Lp.cover.x + 70 + i * 100} y={Lp.cover.y + 128} width={80} height={10} rx={5} fill={alpha(C.muted, 0.9)} />
                ))}
                <rect x={Lp.cover.x + 60} y={Lp.cover.y + 168} width={Lp.cover.w - 120} height={110} rx={6} fill={alpha(C.muted, 0.18)} />
                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x={Lp.cover.x + 76} y={Lp.cover.y + 186 + i * 22} width={(Lp.cover.w - 152) * (i === 3 ? 0.6 : 1)} height={8} rx={4} fill={alpha(C.muted, 0.8)} />
                ))}
                {[0, 1].map((col) =>
                  Array.from({ length: 10 }, (_, i) => (
                    <rect
                      key={`${col}-${i}`}
                      x={Lp.cover.x + 40 + col * ((Lp.cover.w - 80) / 2 + 10)}
                      y={Lp.cover.y + 310 + i * 24}
                      width={(Lp.cover.w - 100) / 2 * (i % 4 === 3 ? 0.6 : 1)}
                      height={8}
                      rx={4}
                      fill={alpha(C.muted, 0.7)}
                    />
                  )),
                )}
              </g>
            )}
            <NameLabel x={Lp.cover.x + Lp.cover.w / 2} y={Lp.cover.y - 62} text="research" size={34} anchor="middle" pop={s.paper.cover} />
            <Chip x={Lp.chips.x} y={Lp.chips.y} text="forgets less" color={C.ok} pop={s.paper.forgets} tick />
            <Chip x={Lp.chips.x} y={Lp.chips.y + 110} text="learns less" color={C.warm} pop={s.paper.learns} />
          </g>
        )}
      </Canvas>
    </AbsoluteFill>
  );
};
