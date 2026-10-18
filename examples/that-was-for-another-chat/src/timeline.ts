// Sorry, That Was For Another Chat — article video (EN). Narration from the approved script
// (script.md). Each conversation is a jigsaw of its topic; the accidental paste is a piece from
// another box. Visuals are illustrative; every number on screen is the article's.
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';

const RUST = ["thread 'main'", 'panicked at', 'src/cfg.rs:42', 'called unwrap()', 'on a None'];
const GARDEN = L('Balcony garden', 'Huerto en el balcón');

const build = (): Cuts => ({
  main: [
    anim(
      'paste',
      'PuzzleChat',
      { mode: 'land', topic: 'garden', title: GARDEN, snippet: RUST, chip: L('Pasted into the wrong chat', 'Pegado en el chat equivocado') },
      [say(0, 'Ever pasted something into the wrong chat?', '¿Alguna vez has pegado algo en el chat equivocado?')],
      { min: 3.2 },
    ),
    anim(
      'wall',
      'PuzzleChat',
      {
        mode: 'grid',
        continues: true,
        title: GARDEN,
        snippet: RUST,
        chip: L('24 conversations, read by hand', '24 conversaciones, leídas a mano'),
        legend: 'GPT-5.6 sol · GPT-5.6 luna · Claude Opus 5',
      },
      [say(0.3, 'I did it on purpose: 24 conversations, three models, every reply read by hand.', 'Lo hice a propósito: 24 conversaciones, tres modelos, cada respuesta leída a mano.')],
    ),
    anim(
      'fork',
      'ThreeReadings',
      {
        mode: 'fork',
        // Each slot lands on its word: "junk", "a change of subject", "context" (TTS word timings).
        at: [1.55, 2.4, 3.85],
        slots: [L('clipboard junk', 'basura del portapapeles'), L('a deliberate pivot', 'un cambio de tema'), L('context I forgot', 'contexto olvidado')],
        glosses: [L('"ignore it"', '"ignóralo"'), L(`"let's talk about this"`, '"hablemos de esto"'), L('"you need this"', '"necesitas esto"')],
      },
      [say(0.3, 'A stray paste could be junk, a change of subject, or context you forgot to explain.', 'Un pegado suelto puede ser basura, un cambio de tema o contexto que olvidaste explicar.')],
      { min: 6.7 },
    ),
    anim(
      'verdict',
      'ThreeReadings',
      {
        mode: 'verdict',
        continues: true,
        slots: [L('clipboard junk', 'basura del portapapeles'), L('a deliberate pivot', 'un cambio de tema'), L('context I forgot', 'contexto olvidado')],
        stamp: { value: '0 / 24', label: L('read it as a mistake', 'lo vieron como error'), beat: 1 },
        total: 24,
      },
      [
        say(0.2, 'Not one reply considered that it might be a mistake.', 'Ninguna respuesta consideró que pudiera ser un error.'),
        say(0, 'Zero out of twenty-four.', 'Cero de veinticuatro.'),
      ],
    ),
    anim(
      'hammer',
      'PuzzleChat',
      { mode: 'hammer', topic: 'garden', title: GARDEN, snippet: RUST, tally: { value: '14', label: L('of 24 just did the work', 'de 24 hicieron el trabajo') } },
      [
        say(0.2, 'Fourteen just did the work.', 'Catorce hicieron el trabajo sin más.'),
        say(0, 'A chat about a balcony garden got its Rust bug fixed.', 'A un chat sobre un huerto en el balcón le arreglaron su bug de Rust.'),
      ],
    ),
    anim(
      'frames',
      'PuzzleChat',
      {
        mode: 'frames',
        topic: 'camera',
        title: L('Buying a camera', 'Comprar una cámara'),
        snippet: ['## v2.4.0', '- fix: parser', '- feat: yaml', '- perf: 2x'],
        frames: [L('release notes', 'notas de versión'), L('translate', 'traducir'), L('launch message', 'mensaje de lanzamiento')],
        tally: { value: '5', label: L('asked what to do with it', 'preguntaron qué hacer') },
        ghost: L('Does it belong here?', '¿Va aquí?'),
      },
      [
        say(0.2, 'Five asked what to do with it.', 'Cinco preguntaron qué hacer con ello.'),
        say(0, 'Never whether it belonged.', 'Nunca si pertenecía ahí.'),
      ],
      { min: 4.9 },
    ),
    anim(
      'carve',
      'PuzzleChat',
      {
        mode: 'carve',
        topic: 'run',
        title: L('Training for a 10K', 'Preparar un 10K'),
        snippet: ['NOW HIRING', 'Night baker', '2am-10am', 'Apply in store'],
        tally: { value: '1', label: L('invented a bridge', 'inventó un puente') },
        thread: [L('2am shift', 'turno de 2am'), L('April race', 'carrera de abril')],
        stamps: [L('Good advice', 'Buen consejo'), L('Invented connection', 'Conexión inventada')],
      },
      [
        say(0.2, "One invented a bridge, weaving a night-shift baker's job into a 10K training plan.", 'Uno inventó un puente: metió un trabajo de panadero de noche en un plan para un 10K.', {
          en: "One invented a bridge, weaving a night-shift baker's job into a ten-K training plan.",
        }),
        say(0, 'Good advice. Invented connection.', 'Buen consejo. Conexión inventada.'),
      ],
    ),
    anim(
      'aside',
      'PuzzleChat',
      {
        mode: 'aside',
        topic: 'bill',
        title: L('Electricity bill', 'Factura de la luz'),
        snippet: ['NOTICE', 'Lift repairs', "Residents'", 'assoc. €87'],
        tally: { value: '1', label: L('said it plainly', 'lo dijo claro') },
      },
      [say(0.2, "Only one said it plainly: this isn't from your electricity bill.", 'Solo una lo dijo claro: esto no es de tu factura de la luz.')],
      { min: 5.6 },
    ),
    anim(
      'ceiling',
      'PuzzleChat',
      { mode: 'ceiling', chip: L('1 of 24 set it aside', '1 de 24 lo apartó'), legend: 'GPT-5.6 sol · GPT-5.6 luna · Claude Opus 5' },
      [
        say(0.2, 'So the ceiling exists.', 'Así que el techo existe.'),
        say(0, "This isn't a capability problem.", 'No es un problema de capacidad.'),
      ],
    ),
    anim(
      'quote',
      'PuzzleChat',
      {
        mode: 'quote',
        continues: true,
        quote: {
          rows: [L('An observation, not a measurement.', 'Una observación, no una medida.'), L('Expect it to be taken seriously.', 'Cuenta con que se lo tome en serio.')],
          emphasis: ['seriously', 'serio'],
        },
      },
      [
        say(0.2, "It's an observation, not a measurement.", 'Es una observación, no una medida.'),
        say(0, 'But if you paste it, expect it to be taken seriously.', 'Pero si lo pegas, cuenta con que se lo tome en serio.'),
      ],
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', 'Más en javieraguilar.ai.', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
