// Where's the Ball? Part 2 — article video (EN). Narration from script.md v1.0, word for word;
// some lines are voiced as two or three say() calls at their sentence ends, so each sentence is a
// beat the animation can land on. Four pictures carry it:
// - StoryPitch: part 1's real Metrica sequence with the ball hidden (the story);
// - ReaderGrid: the 2×2 of who reads × what gets read, filled cell by cell (the result);
// - CameraFlip: a long pass chased by the camera, and the correlation dial that flips sign;
// - SportScale: a football pitch and a basketball court, true size, then in the same box.
import type { Cuts, Scene } from './types.ts';
import { L, anim, intro, outro, say, videos } from './narrate.ts';
import { wordAt, withCues } from './cues.ts';

const build = (): Cuts => {
  // ── Story: part 1's pitch, the ball hidden.
  const part1 = anim(
    'part1',
    'StoryPitch',
    { mode: 'part1', play: [0, 4.0], cameos: [{ pose: 'laptop', at: [0, 'erased'] }] },
    [say(0.3, 'In part one, I erased the ball from football footage and kept the players.', '')],
    // Holds the long closing cue long enough to read (17 chars/s).
    { min: 5.6 },
  );
  const middle = anim(
    'middle',
    'StoryPitch',
    { mode: 'middle', play: [4.0, 4.4], blend: true },
    [say(0.2, 'Frontier AI did no better than pointing at the middle of the screen.', '')],
    // The real ball flashes in at the frame's edge after "middle"; it stays readable a moment.
    { min: 6.2 },
  );
  const doubt = anim(
    'doubt',
    'StoryPitch',
    { mode: 'doubt', play: [4.4, 4.4], blend: true },
    [say(0.2, "Maybe that's impossible.", ''), say(0, "Maybe the players don't give the ball away.", '', undefined, { emotion: 'skeptical' })],
  );
  const test = anim('test', 'StoryPitch', { mode: 'test', play: [4.4, 4.4], blend: true }, [say(0.15, 'So I tested exactly that.', '')], { min: 2.9 });

  // ── The 2×2 grid: who reads × what gets read.
  const rows = anim(
    'rows',
    'ReaderGrid',
    { mode: 'rows' },
    [say(0.3, 'Two kinds of reader, small nets trained for this one task, and frontier AI.', '')],
  );
  withCues(rows, { trained: wordAt(rows, 0, 'small'), frontier: wordAt(rows, 0, 'frontier') });

  const columns = anim('columns', 'ReaderGrid', { mode: 'columns', blend: true }, [say(0.15, 'Two inputs, the TV pixels or the player tracks underneath.', '')]);
  withCues(columns, { pixels: wordAt(columns, 0, 'TV'), tracks: wordAt(columns, 0, 'player') });

  const question = anim(
    'question',
    'ReaderGrid',
    { mode: 'question', blend: true },
    [say(0.15, 'The hard cases, balls far from the centre.', ''), say(0, 'Does a guess beat pointing at the middle?', '', undefined, { emotion: 'curious' })],
    // The question holds a beat before the answers.
    { min: 6.6 },
  );

  const trained = anim(
    'trained',
    'ReaderGrid',
    { mode: 'trained', blend: true },
    [say(0.15, 'The trained models did.', ''), say(0, '82% of the time from tracks, 74% from pixels.', '')],
  );
  withCues(trained, { tracks: wordAt(trained, 1, '82'), pixels: wordAt(trained, 1, '74') });

  const frontier = anim('frontier', 'ReaderGrid', { mode: 'frontier', blend: true, cameos: [{ pose: 'sceptical', at: [1, 'coin'], dur: 1.3 }] }, [say(0.15, "Frontier AI didn't.", ''), say(0, '53% on pixels, a coin flip.', '', { en: 'Fifty-three percent on pixels, a coin flip.' })]);
  withCues(frontier, { pixels: wordAt(frontier, 1, 'fifty'), coin: wordAt(frontier, 1, 'coin') });

  const astext = anim(
    'astext',
    'ReaderGrid',
    { mode: 'astext', blend: true },
    [
      say(0.15, 'On the very same tracks, as text, 35 to 38%. Below chance.', '', {
        en: 'On the very same tracks, as text, thirty-five to thirty-eight percent. Below chance.',
      }, { emotion: 'surprised' }),
    ],
  );
  withCues(astext, { tracks: wordAt(astext, 0, 'thirty'), below: wordAt(astext, 0, 'below') });

  const footnotes = anim(
    'footnotes',
    'ReaderGrid',
    { mode: 'footnotes', blend: true },
    [say(0.15, 'Those tracks are ground truth, a ceiling, and on easy balls the big models were more precise.', '')],
    // The second footnote (12 words) stays up ~4 s after it lands.
    { min: 7.4 },
  );
  withCues(footnotes, { easy: wordAt(footnotes, 0, 'easy') });

  const verdict = anim(
    'verdict',
    'ReaderGrid',
    { mode: 'verdict', blend: true },
    [
      say(0.15, 'So the information is there.', '', undefined, { emotion: 'confident', speed: 1.05 }),
      say(0, 'Training matters.', '', undefined, { emotion: 'confident', speed: 1.05 }),
      say(0, 'The input barely does.', '', undefined, { emotion: 'confident', speed: 1.05 }),
    ],
    // The verdict holds ~1.5 s once its last word lands.
    { min: 7.2 },
  );

  // ── The camera trap.
  const trap = anim('trap', 'CameraFlip', { mode: 'trap' }, [say(0.3, 'On TV, "the ball is near the players" is a trap.', '')]);
  withCues(trap, { trap: wordAt(trap, 0, 'trap') });
  const chase = anim(
    'chase',
    'CameraFlip',
    { mode: 'chase', blend: true },
    [say(0.15, 'An off-centre ball is usually flying ahead, players trailing, and the camera chases it.', '')],
    { min: 6.3 },
  );
  withCues(chase, { ahead: wordAt(chase, 0, 'flying'), camera: wordAt(chase, 0, 'camera') });
  const flip = anim(
    'flip',
    'CameraFlip',
    { mode: 'flip', blend: true },
    [
      say(0.15, "On screen, the players' centre and the ball correlate at −0.58.", '', {
        en: "On screen, the players' centre and the ball correlate at minus zero point five eight.",
      }),
      say(0, 'On the pitch, +0.83.', '', { en: 'On the pitch, plus zero point eight three.' }),
    ],
  );
  withCues(flip, { screen: wordAt(flip, 0, 'minus'), pitch: wordAt(flip, 1, 'plus') });
  const sign = anim('sign', 'CameraFlip', { mode: 'sign', blend: true, cameos: [{ pose: 'amazed', at: [0, 'flips'], dur: 2.0 }] }, [say(0.15, 'The camera flips the sign.', '', undefined, { emotion: 'amazed' })], { min: 3.6 });

  // ── Two sports.
  const basketball = anim('basketball', 'SportScale', { mode: 'sports' }, [say(0.3, 'Then I trained the same net on basketball.', '')], { min: 3.9 });
  const transfer = anim(
    'transfer',
    'SportScale',
    { mode: 'transfer', blend: true },
    [say(0.15, 'Basketball to football worked, with no football at all.', ''), say(0, 'Football to basketball failed.', '')],
    { min: 6.6 },
  );
  const speed = anim(
    'speed',
    'SportScale',
    { mode: 'speed', blend: true },
    [
      say(0.15, 'The culprit is speed.', ''),
      say(0, "On the small court, players move 3–4× faster in the model's units.", '', {
        en: "On the small court, players move three to four times faster in the model's units.",
      }),
    ],
  );
  withCues(speed, { times: wordAt(speed, 1, 'three') });
  const positions = anim(
    'positions',
    'SportScale',
    { mode: 'positions', blend: true },
    [say(0.15, 'Take velocity out, and positions transfer both ways.', '')],
    // The softened wording under it (14 words) needs ~3.5 s once in.
    { min: 6.4 },
  );
  withCues(positions, { out: wordAt(positions, 0, 'out'), both: wordAt(positions, 0, 'positions') });

  const scenes: Scene[] = [
    intro('hook', [say(0.4, "A model small enough to email finds the hidden ball where frontier AI can't.", '')]),
    part1,
    middle,
    doubt,
    test,
    rows,
    columns,
    question,
    trained,
    frontier,
    astext,
    footnotes,
    verdict,
    trap,
    chase,
    flip,
    sign,
    basketball,
    transfer,
    speed,
    positions,
    anim(
      'motion',
      'KeyQuote',
      { text: L('Knowing the game, for these models, means knowing what to do with motion.', ''), emphasis: ['motion'] },
      [say(0.3, 'Knowing the game, for these models, means knowing what to do with motion.', '')],
      { min: 5.4 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ];
  return { main: scenes };
};

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
