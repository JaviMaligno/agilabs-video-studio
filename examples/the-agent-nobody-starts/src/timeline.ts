// The Agent Nobody Starts — article video (EN). Narration from the approved script v4 (script.md):
// it opens with the article's metaphor (a friend leaves her house with a neighbour: keys, a note,
// an evening message), turns to how we use AI today, then the real Monday (8:00 routine done in
// 15 minutes; 9:00 routine stops itself in 27 seconds) and closes on the same three things.
import type { Cuts } from './types.ts';
import { L, anim, intro, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // 1. Cold open: the friend far away, the house with the neighbour behind.
    intro(
      'hook',
      [say(0.1, 'A friend left her house with a neighbour for a few weeks, and never once had to check her phone.', 'Una amiga dejó su casa a una vecina unas semanas, y ni una vez tuvo que mirar el móvil.', undefined, { speed: 0.9 })],
      5,
      {
        name: 'Tableau',
        props: {
          items: [
            { src: 'draw/house-neighbour.png', x: 0.73, y: 0.3, w: 0.5, kind: 'static' },
            { src: 'draw/friend-relax.png', x: 0.38, y: 0.62, w: 0.74, kind: 'static' },
          ],
        },
      },
    ),
    // 2. The keys, not the drawer.
    anim(
      'keys',
      'Tableau',
      {
        items: [
          // "three things": the three small, one after another, until the keys come in big
          { src: 'draw/keyring.png', x: 0.2, y: 0.5, w: 0.26, at: 0, delay: 0.3, out: 1, kind: 'pop' },
          { src: 'draw/fridge-note.png', x: 0.5, y: 0.5, w: 0.22, at: 0, delay: 0.6, out: 1, kind: 'pop' },
          { src: 'draw/phone-night.png', x: 0.8, y: 0.5, w: 0.22, at: 0, delay: 0.9, out: 1, kind: 'pop' },
          { src: 'draw/keyring.png', x: 0.3, y: 0.4, w: 0.6, at: 1, kind: 'slide' },
          { text: L('front door · boiler room', 'puerta · caldera'), x: 0.32, y: 0.08, at: 1, delay: 0.6, size: 44, tone: 'ok' },
          { src: 'draw/drawer-locked.png', x: 0.7, y: 0.64, w: 0.58, at: 1, delay: 2.3, kind: 'pop' },
          { text: L('not this one', 'este no'), x: 0.7, y: 0.95, at: 1, delay: 2.9, size: 44, tone: 'bad', kind: 'stamp', rot: -6 },
        ],
      },
      [say(0.2, 'She gave her three things.', 'Le dio tres cosas.'), say(0, 'Keys: the front door and the boiler room, not the drawer with the papers.', 'Llaves: la de la puerta y la de la caldera, no la del cajón de los papeles.')],
      { min: 4 },
    ),
    // 3. The note on the fridge.
    anim(
      'note',
      'Tableau',
      {
        items: [
          { src: 'draw/fridge-note.png', x: 0.5, y: 0.52, w: 0.62, kind: 'slide' },
          { text: L('alarm → reset it', 'alarma → rearmarla'), x: 0.5, y: 0.08, delay: 1.2, size: 44, tone: 'ok' },
          { text: L('leak → call me', 'gotera → llámame'), x: 0.5, y: 0.95, delay: 3.0, size: 44, tone: 'accent' },
        ],
      },
      [say(0.2, 'A note: when the boiler alarm goes off, reset it. If the roof leaks, call me.', 'Una nota: si salta la alarma de la caldera, rearmarla. Si hay gotera, llámame.')],
      { min: 4 },
    ),
    // 4. The evening message.
    anim(
      'message',
      'Tableau',
      {
        items: [
          { src: 'draw/phone-night.png', x: 0.5, y: 0.5, w: 0.55, kind: 'slide' },
          { text: L('All quiet.', 'Todo tranquilo.'), x: 0.46, y: 0.44, delay: 0.9, size: 56, tone: 'night' },
        ],
      },
      [say(0.2, 'And a two-line message every evening.', 'Y un mensaje de dos líneas cada noche.')],
      { min: 3.6 },
    ),
    // 5. The turn.
    anim(
      'turn',
      'KeyQuote',
      { text: L("That's what automating with AI should look like. Most of the time, it isn't.", 'Así debería ser automatizar con IA. Casi nunca lo es.'), emphasis: ["isn't", 'nunca'] },
      [say(0.2, "That's what automating with AI should look like. Most of the time, it isn't.", 'Así debería ser automatizar con IA. Casi nunca lo es.', undefined, { emotion: 'confident', speed: 0.93 })],
      { min: 4 },
    ),
    // 6-8. How we use AI today: the loop goes through you, even on the bus.
    anim(
      'today',
      'Tableau',
      {
        items: [
          { src: 'draw/laptop-buzz.png', x: 0.5, y: 0.3, w: 0.92, kind: 'shake', out: 2 },
          { text: L('open', 'abrir'), x: 0.27, y: 0.68, delay: 1.0, size: 44, out: 1 },
          { text: L('explain', 'explicar'), x: 0.73, y: 0.68, delay: 1.7, size: 44, out: 1 },
          { text: L('wait', 'esperar'), x: 0.27, y: 0.84, delay: 2.4, size: 44, out: 1 },
          { text: L('check', 'comprobar'), x: 0.73, y: 0.84, delay: 3.1, size: 44, out: 1 },
          { src: 'avatar/avatar-laptop.png', x: 0.5, y: 0.76, w: 0.5, at: 1, kind: 'slide', out: 2 },
          { src: 'draw/avatar-bus.png', x: 0.5, y: 0.5, w: 0.66, at: 2, kind: 'slide' },
          { text: L('still at work', 'sigues trabajando'), x: 0.5, y: 0.95, at: 2, delay: 1.6, size: 48, tone: 'bad', kind: 'stamp', rot: -4 },
        ],
      },
      [
        say(0.2, 'A notification arrives. You open the laptop, start the AI, explain, wait, check.', 'Llega un aviso. Abres el portátil, arrancas la IA, explicas, esperas, compruebas.'),
        say(0, 'The AI did the typing. The work still went through you.', 'La IA ha tecleado. Pero el trabajo ha pasado por ti.', undefined, { speed: 0.9 }),
        say(10.3, "Doing it from your phone on the bus? You're still at work.", '¿Lo haces desde el móvil en el bus? Sigues trabajando.', undefined, { emotion: 'skeptical', speed: 0.94 }),
      ],
      { min: 6 },
    ),
    // 9. The same three things, for an AI.
    anim(
      'same',
      'Tableau',
      {
        items: [
          { src: 'draw/robot-cloud-desk.png', x: 0.5, y: 0.34, w: 0.92, kind: 'fade' },
          { src: 'draw/keyring.png', x: 0.18, y: 0.8, w: 0.28, delay: 1.0, kind: 'slide' },
          { src: 'draw/fridge-note.png', x: 0.5, y: 0.8, w: 0.22, delay: 1.5, kind: 'slide' },
          { src: 'draw/phone-night.png', x: 0.82, y: 0.8, w: 0.22, delay: 2.0, kind: 'slide' },
        ],
      },
      [say(0.2, 'An AI that works on its own needs exactly the same three things.', 'Una IA que trabaja sola necesita exactamente esas tres cosas.', undefined, { speed: 0.9 })],
      { min: 4 },
    ),
    // 10. Monday, 8:00.
    anim(
      'eight',
      'Tableau',
      {
        items: [
          { src: 'draw/robot-cloud-desk.png', x: 0.5, y: 0.42, w: 0.95, kind: 'fade' },
          { text: L('Monday · 08:00', 'Lunes · 08:00'), x: 0.5, y: 0.07, delay: 0.5, size: 60, tone: 'accent' },
          { src: 'draw/avatar-coffee.png', x: 0.84, y: 0.78, w: 0.3, delay: 2.4, kind: 'slide' },
        ],
      },
      [say(0.2, 'One Monday at eight, on schedule, an agent I had set up woke up on its own.', 'Un lunes a las ocho, a la hora programada, un agente que había preparado se despertó solo.')],
      { min: 4 },
    ),
    // 11. The update and the read-only check.
    anim(
      'check',
      'Tableau',
      {
        items: [
          { text: L('update installed', 'actualización instalada'), x: 0.5, y: 0.07, delay: 0.4, size: 48, tone: 'plain' },
          { src: 'draw/robot-magnifier.png', x: 0.5, y: 0.5, w: 0.62, delay: 1.0, kind: 'pop' },
          { text: L('only looks', 'solo mira'), x: 0.8, y: 0.22, delay: 2.4, size: 40, tone: 'night' },
          { text: '✓  ✓  ✓  ✓  ✓', x: 0.5, y: 0.9, delay: 4.6, size: 60, tone: 'ok' },
        ],
      },
      [say(0.2, 'It installed an update on our servers, then had a second bot, one that can only look, check that nothing broke.', 'Instaló una actualización en nuestros servidores y pidió a un segundo bot, uno que solo puede mirar, que comprobara que nada se había roto.')],
      { min: 5 },
    ),
    // 12. Fifteen minutes.
    anim(
      'fifteen',
      'Counter',
      { value: 15, suffix: ' min', label: L('start to finish', 'de principio a fin'), cameos: [{ pose: 'neutral', at: [0, 'summary'], dur: 2.6 }] },
      [say(0.2, 'Fifteen minutes. The summary was already on my phone.', 'Quince minutos. El resumen ya estaba en mi móvil.')],
      { min: 3.8 },
    ),
    // 13. Nine o'clock: 27 seconds, on purpose.
    anim(
      'nine',
      'Tableau',
      {
        items: [
          { text: L('Monday · 09:00', 'Lunes · 09:00'), x: 0.5, y: 0.07, size: 60, tone: 'accent' },
          { src: 'draw/robot-cloud-desk.png', x: 0.5, y: 0.48, w: 0.95, kind: 'fade', out: 1 },
          { src: 'cast/stopwatch.png', x: 0.5, y: 0.45, w: 0.56, at: 1, kind: 'pop' },
          { text: '27 s', x: 0.5, y: 0.47, at: 1, delay: 0.6, size: 96, tone: 'plain' },
          { text: 'STOP', x: 0.5, y: 0.88, at: 1, delay: 2.4, size: 88, tone: 'ok', kind: 'stamp', rot: -8 },
        ],
      },
      [
        say(0.2, 'At nine, a second agent woke up to switch on a setting.', 'A las nueve, un segundo agente se despertó para activar un ajuste.'),
        say(0, '27 seconds later, it stopped. On purpose.', '27 segundos después, se paró. A propósito.', { en: 'Twenty-seven seconds later, it stopped. On purpose.' }, { emotion: 'amazed' }),
      ],
      { min: 5 },
    ),
    // 14. Why: its first step checked the job was still pending.
    anim(
      'why',
      'Tableau',
      {
        items: [
          { text: L('1. still pending?', '1. ¿sigue pendiente?'), x: 0.5, y: 0.07, size: 54, tone: 'plain' },
          { text: L('✗ already marked done', '✗ ya marcada como hecha'), x: 0.5, y: 0.2, at: 1, delay: 0.4, size: 48, tone: 'bad', kind: 'stamp' },
          { src: 'draw/robot-cloud-desk.png', x: 0.5, y: 0.6, w: 0.9, kind: 'fade', out: 2 },
          { src: 'draw/robot-handsoff.png', x: 0.5, y: 0.62, w: 0.62, at: 2, kind: 'pop' },
        ],
      },
      [
        say(0.2, 'Its first step was to check the job was still pending.', 'Su primer paso era comprobar que la tarea seguía pendiente.'),
        say(0, 'Someone had already marked it done.', 'Alguien ya la había marcado como hecha.'),
        say(0, 'So it told me, and touched nothing.', 'Así que me avisó y no tocó nada.'),
      ],
      { min: 5 },
    ),
    // 15. The world changed; the first check caught it.
    anim(
      'caught',
      'KeyQuote',
      { text: L('The world had changed since I set it up, and that first check caught it.', 'El mundo había cambiado desde que lo preparé, y esa primera comprobación lo pilló.'), emphasis: ['first check', 'primera comprobación'] },
      [say(0.2, 'The world had changed since I set it up, and that first check caught it.', 'El mundo había cambiado desde que lo preparé, y esa primera comprobación lo pilló.', undefined, { emotion: 'confident' })],
      { min: 4 },
    ),
    // 16-19. What you leave before going.
    anim(
      'leave',
      'Tableau',
      {
        items: [
          { text: L('before you go', 'antes de irte'), x: 0.5, y: 0.07, size: 56, tone: 'accent' },
          { src: 'draw/house-neighbour.png', x: 0.5, y: 0.5, w: 0.62, kind: 'fade', out: 1 },
          { src: 'draw/fridge-note.png', x: 0.18, y: 0.45, w: 0.3, at: 1, kind: 'slide' },
          { text: L('when to act', 'cuándo actuar'), x: 0.18, y: 0.8, at: 1, delay: 0.4, size: 32 },
          { src: 'draw/keyring.png', x: 0.5, y: 0.45, w: 0.32, at: 2, kind: 'slide' },
          { text: L('just enough', 'las justas'), x: 0.5, y: 0.8, at: 2, delay: 0.4, size: 32 },
          { src: 'draw/phone-night.png', x: 0.82, y: 0.45, w: 0.27, at: 3, kind: 'slide' },
          { text: L('when you choose', 'cuando quieras'), x: 0.82, y: 0.8, at: 3, delay: 0.4, size: 32 },
        ],
      },
      [
        say(0.2, "The hard part isn't the AI. It's what you leave before going:", 'Lo difícil no es la IA. Es lo que dejas antes de irte:'),
        say(0, 'a note that says when to act and when to call you,', 'una nota que diga cuándo actuar y cuándo llamarte,'),
        say(0, 'keys for the job, not one more,', 'llaves para el trabajo, ni una más,'),
        say(0, 'and a message you read when you choose.', 'y un mensaje que lees cuando tú quieras.'),
      ],
      { min: 8 },
    ),
    // 20. Verdict.
    anim(
      'verdict',
      'Tableau',
      {
        items: [
          { src: 'draw/avatar-coffee.png', x: 0.3, y: 0.52, w: 0.56, kind: 'fade' },
          { src: 'draw/phone-night.png', x: 0.74, y: 0.45, w: 0.42, delay: 1.0, kind: 'slide' },
          { text: L('All quiet.', 'Todo tranquilo.'), x: 0.72, y: 0.41, delay: 1.8, size: 44, tone: 'night' },
        ],
      },
      [say(0.2, "Get those right, and the gain isn't minutes. It's every moment you didn't have to be there.", 'Si aciertas, no ganas minutos. Ganas todos los momentos en los que no tuviste que estar.', undefined, { emotion: 'confident', speed: 1.05 })],
      { min: 5 },
    ),
    outro('outro', [say(0.4, 'More at javieraguilar.ai', 'Más en javieraguilar.ai')]),
  ],
});

export const VIDEOS = videos(build);
export const TIMELINE = VIDEOS.en.main;
