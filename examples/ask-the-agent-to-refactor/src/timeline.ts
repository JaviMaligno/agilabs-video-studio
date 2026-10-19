// Ask the agent to refactor — explainer video (EN). Narration from the approved script v1.1
// (script.md). The whole video is one map of files (CopyMap): copies of the same rule glow inside
// them, a search beam lights the ones it matches, and a refactor request folds them into one card.
// The code on the chips is the real midpoint code of Actual's loot-core (src/data/code.json).
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: the first sentence is the title, drawn by the scene itself over the moving map.
    anim(
      'hook',
      'CopyMap',
      { mode: 'hook', titleLine: true },
      [say(0, 'Codex merged three copies of a rule.', ''), say(0, 'Tests passed.', ''), say(0, 'The step failed.', '')],
      { min: 5.2 },
    ),
    anim(
      'miss',
      'CopyMap',
      { mode: 'miss', blend: true },
      [say(0.2, 'There was a fourth copy.', ''), say(0, 'Its search never matched it.', '')],
      { min: 5.4 },
    ),
    anim('quote', 'CopyMap', { mode: 'quote', blend: true }, [say(0.2, 'Matt Pocock says to use more abstractions and harsh lint.', '')], { min: 4.6 }),
    anim('question', 'CopyMap', { mode: 'question' }, [say(0.15, 'Can the agent be the designer?', '')], { min: 2.9 }),
    anim(
      'lanes',
      'CopyMap',
      { mode: 'lanes', blend: true },
      [
        say(0.15, 'I gave three agents real budgeting code:', ''),
        say(0, '384 task chains.', '', { en: 'three hundred and eighty-four task chains.' }),
      ],
      { min: 5.4 },
    ),
    anim(
      'levers',
      'CopyMap',
      { mode: 'levers' },
      [say(0.15, 'Three levers: a written rule,', ''), say(0, 'a duplication lint,', ''), say(0, 'or just asking for the refactor.', '')],
      { min: 6 },
    ),
    anim('rulelint', 'CopyMap', { mode: 'lanes-rule-lint' }, [say(0.15, 'The rule and the lint helped one agent of three.', '')], { min: 4.2 }),
    anim('dodge', 'CopyMap', { mode: 'lint-dodge' }, [say(0.15, 'Codex sometimes told the lint to skip its code.', '')], { min: 4.2 }),
    anim('fold', 'CopyMap', { mode: 'fold' }, [say(0.3, 'Only asking for the refactor lifted all three, if modestly.', '')], { min: 5 }),
    anim(
      'search',
      'CopyMap',
      { mode: 'search' },
      [say(0.15, 'What it bought was mostly search:', ''), say(0, 'going to find every copy.', '')],
      { min: 4.8 },
    ),
    anim(
      'propagate',
      'CopyMap',
      { mode: 'propagate', blend: true },
      [say(0.2, 'Then one edit reached every copy,', ''), say(0, 'even in a file it never opened.', '')],
      { min: 4.8 },
    ),
    anim(
      'missrate',
      'CopyMap',
      { mode: 'miss-rate' },
      [say(0.2, "Codex's missed copies fell from 33% to 12%.", '', { en: "Codex's missed copies fell from thirty-three percent to twelve percent." })],
      { min: 5.6 },
    ),
    anim(
      'close',
      'CopyMap',
      { mode: 'close' },
      [say(0.2, "Don't just write the rule.", ''), say(0, 'Ask for the refactor, and name what must survive.', '')],
      { min: 5 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
