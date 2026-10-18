// Which Sport Is It? — article video (EN). Narration from the approved script (script.md).
// Real tracking clips (src/data/clips.json, scripts/extract-clips.py) replayed as dots on a dark
// stage: the hook is a basketball play whose answer is withheld until the last scene.
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';
import { FPS, sceneStarts } from './timing.ts';

/**
 * Every clip plays on one clock: each DotStage / SnapshotDeck scene gets the video second it
 * starts at (`clock`), and a `layout` so Video.tsx blends (instead of dipping) between two
 * consecutive scenes on the same layout.
 */
const withClock = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  return scenes.map((s, i) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const mode = String(s.anim.props.mode ?? '');
    const layout = s.anim.name === 'SnapshotDeck' ? 'deck' : ['quiz', 'question', 'reveal'].includes(mode) ? 'stage' : 'grid';
    return { ...s, anim: { ...s.anim, props: { ...s.anim.props, clock: +(starts[i] / FPS).toFixed(3), layout } } };
  });
};

const build = (): Cuts => ({
  main: withClock([
    anim(
      'hook',
      'DotStage',
      { mode: 'quiz' },
      [
        say(0.15, 'Ten dots.', 'Diez puntos.'),
        say(0, 'No pitch, no ball, no kits.', 'Sin campo, sin balón, sin equipaciones.'),
        say(0, 'Which sport is this?', '¿Qué deporte es?'),
      ],
    ),
    anim(
      'strip',
      'DotStage',
      { mode: 'strip' },
      [say(0.15, 'I took real tracking data from four sports and kept only how the players move.', 'Tomé datos de tracking reales de cuatro deportes y me quedé solo con cómo se mueven los jugadores.')],
      { min: 6.2 },
    ),
    anim('question', 'DotStage', { mode: 'question' }, [say(0.15, 'Is the sport still in there?', '¿Sigue ahí el deporte?')], { min: 2.7 }),
    anim(
      'specialist',
      'DotStage',
      { mode: 'specialist' },
      [
        say(0.15, 'A small classifier, trained in minutes on my laptop, gets it right 83% of the time.', 'Un clasificador pequeño, entrenado en minutos en mi portátil, acierta el 83% de las veces.', {
          en: 'A small classifier, trained in minutes on my laptop, gets it right eighty-three percent of the time.',
        }),
      ],
    ),
    anim(
      'guesses',
      'DotStage',
      { mode: 'guesses' },
      [
        say(0.15, 'Five frontier models, on the same clips, land between chance and 47%.', 'Cinco modelos punteros, con los mismos clips, quedan entre el azar y el 47%.', {
          en: 'Five frontier models, on the same clips, land between chance and forty-seven percent.',
        }),
      ],
      { min: 6.4 },
    ),
    anim('favourite', 'DotStage', { mode: 'favourite' }, [say(0.15, 'Most fall back on a favourite sport when unsure.', 'La mayoría recurre a un deporte favorito cuando duda.')], {
      min: 4.4,
    }),
    anim(
      'shuffle',
      'SnapshotDeck',
      { mode: 'shuffle' },
      [
        say(0.15, 'Then the real test: I shuffled the snapshots.', 'Luego la prueba de verdad: barajé las instantáneas.'),
        say(0, 'If you read motion, order matters.', 'Si lees el movimiento, el orden importa.'),
      ],
    ),
    anim(
      'verdict',
      'SnapshotDeck',
      { mode: 'verdict' },
      [
        say(0.15, 'Only Claude Opus 5.5 lost clearly: 10 points, almost as much as the classifier.', 'Solo Claude Opus 5.5 perdió claramente: 10 puntos, casi tanto como el clasificador.', {
          en: 'Only Claude Opus five point five lost clearly: ten points, almost as much as the classifier.',
        }),
      ],
      { min: 6.8 },
    ),
    anim(
      'hedge',
      'SnapshotDeck',
      { mode: 'hedge' },
      [
        say(0.15, 'For the other four, no evidence they use the order.', 'Para los otros cuatro, no hay evidencia de que usen el orden.'),
        say(0, "Which isn't proof they don't.", 'Lo que no prueba que no lo hagan.'),
      ],
    ),
    anim(
      'reveal',
      'DotStage',
      { mode: 'reveal' },
      [
        say(0.15, 'And those dots at the start? Basketball.', '¿Y aquellos puntos del principio? Baloncesto.'),
        say(0, 'Three models said American football.', 'Tres modelos dijeron fútbol americano.'),
      ],
      { min: 6.4 },
    ),
    // The voice starts as the card pops in; the card ends OUTRO_TAIL after it.
    outro('outro', [say(0.15, 'More at javieraguilar.ai', 'Más en javieraguilar.ai', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
