// The video: an ordered list of scenes with their narration (EN + ES).
// Placeholder until a real article is scripted: an intro card and an outro card.
import type { Cuts } from './types.ts';
import { intro, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    intro('intro', [
      say(0.4, 'The one finding of the article, in a single sentence.', 'El hallazgo del artículo, en una sola frase.'),
    ]),
    outro('outro', [
      say(0.4, 'The full write-up is on javieraguilar.ai.', 'El artículo completo está en javieraguilar.ai.'),
    ]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
