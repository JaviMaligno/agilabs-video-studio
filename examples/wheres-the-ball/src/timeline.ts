// Where's the Ball? — series video (EN). Narration from the approved script v2 (script.md).
// Every scene plays a stretch of one real Metrica Sports sequence (src/data/play.json):
// a long ball down the right wing (0-5 s), taken by the keeper, then a still ball (10-14 s).
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    anim(
      'hidden',
      'PitchPlayback',
      // The "?" holds one spot across this scene and the next (qSpan), clear of every player.
      { mode: 'hidden', play: [0, 3.6], qSpan: [0, 4.4], chip: L('The ball: erased', 'El balón: borrado') },
      [
        say(
          0.3,
          'I erased the ball from the pitch and kept only the players. Can you tell where it is?',
          'Borré el balón del campo y dejé solo a los jugadores. ¿Sabes dónde está?',
        ),
      ],
      // A beat on the question: the "?" holds and the caption stays readable before the hand-over.
      { min: 6.6 },
    ),
    anim(
      'guess',
      'PitchPlayback',
      { mode: 'guess', play: [3.6, 4.4], qSpan: [0, 4.4], chip: L('Frontier AI guesses', 'Lo que dicen los modelos') },
      [
        say(0.2, 'From the stands, you usually can.', 'Desde la grada, normalmente sí.'),
        say(0, 'I wanted to know if frontier AI models could too.', 'Quería saber si los modelos de IA punteros también.'),
      ],
    ),
    anim(
      'reveal',
      'PitchPlayback',
      {
        mode: 'reveal',
        play: [4.4, 4.7],
        chip: L('The real ball', 'El balón real'),
        // The real ball and the AI misses hold the screen while the hard case is described;
        // the figure lands on "they did no better than a coin flip".
        counter: { value: 53, suffix: '%', label: L('Frontier AI on off-centre balls', 'IA puntera con balones descentrados'), coin: true, delay: 3.7 },
      },
      [
        say(
          0.3,
          'On the hard cases, balls far from the centre of the frame, they did no better than a coin flip.',
          'En los casos difíciles, balones lejos del centro de la imagen, no lo hicieron mejor que una moneda al aire.',
        ),
      ],
      // Lets the 53% land and its closing cue stay readable.
      { min: 7.2 },
    ),
    anim(
      'net',
      'PitchPlayback',
      {
        mode: 'net',
        play: [4.7, 6.2],
        counter: { value: 82, suffix: '%', label: L('60 kB net beats the camera bias', 'La red de 60 kB vence al sesgo de cámara'), accent: true, beat: 1, delay: 0.2 },
      },
      [
        say(0.2, 'Then I trained a sixty-kilobyte network on my laptop.', 'Después entrené una red de sesenta kilobytes en mi portátil.'),
        say(0, 'It beat that bias eighty-two percent of the time.', 'Venció ese sesgo el ochenta y dos por ciento de las veces.'),
      ],
    ),
    anim(
      'arrows',
      'PitchPlayback',
      { mode: 'arrows', play: [0.6, 3.6], chip: L("Where they're heading", 'Hacia dónde corren') },
      [
        say(
          0.2,
          'Its trick is almost embarrassingly simple: look where the running players are heading.',
          'Su truco es casi vergonzosamente simple: mirar hacia dónde corren los jugadores.',
        ),
      ],
      // Room for the arrows to be read, and for the fast closing cue to stay up.
      { min: 6.6 },
    ),
    anim(
      'centroid',
      'PitchPlayback',
      { mode: 'centroid', play: [3.2, 4.6], chip: L('Velocity-weighted centroid', 'Centroide ponderado por velocidad') },
      [say(0.2, 'One weighted average explains most of what it learned.', 'Una media ponderada explica casi todo lo que aprendió.')],
      { min: 5 },
    ),
    anim(
      'still',
      'PitchPlayback',
      // qSpan: the play seconds the "?" is on screen (from the second line), kept clear of players.
      { mode: 'still', play: [10, 13.9], qSpan: [12.2, 13.9], chip: L('Ball still: under 2 m/s', 'Balón quieto: menos de 2 m/s') },
      [
        say(0.2, "Which means the hardest ball to find isn't the one in flight.", 'Así que el balón más difícil de encontrar no es el que vuela.'),
        say(0, "It's the one standing still.", 'Es el que está quieto.'),
      ],
    ),
    anim(
      'quote',
      'PitchPlayback',
      { mode: 'quote', play: [13.9, 13.9], quote: { text: L('No motion, no signal.', 'Sin movimiento, no hay señal.'), emphasis: ['motion', 'signal', 'movimiento', 'señal'] } },
      [say(0.3, 'No motion, no signal.', 'Sin movimiento, no hay señal.')],
      { min: 3 },
    ),
    // The voice starts as the card pops in; the card ends OUTRO_TAIL after it.
    outro('outro', [
      say(0.15, "Where's the Ball?, a four-part series at javieraguilar.ai.", '¿Dónde está el balón?, una serie en cuatro partes en javieraguilar.ai.', {
        en: "Where's the Ball? A four-part series at javier aguilar dot A I.",
      }),
    ]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
