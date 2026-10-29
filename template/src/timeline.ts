// The video: an ordered list of scenes with their narration (EN + ES).
// Placeholder until a real article is scripted: an intro card, one animation and an outro card.
import type { Cuts } from './types.ts';
import { L, anim, intro, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    intro('intro', [
      say(0.1, 'The one finding of the article, in a single sentence.', 'El hallazgo del artículo, en una sola frase.'),
    ]),
    anim(
      'quote',
      'KeyQuote',
      { text: L('The sentence the whole article hangs on.', 'La frase de la que cuelga todo el artículo.'), emphasis: ['whole', 'todo'] },
      [say(0.4, 'Then the sentence the whole article hangs on.', 'Después, la frase de la que cuelga todo el artículo.')],
      { min: 4 },
    ),
    outro('outro', [
      say(0.4, 'The full write-up is on javieraguilar.ai.', 'El artículo completo está en javieraguilar.ai.'),
    ]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
