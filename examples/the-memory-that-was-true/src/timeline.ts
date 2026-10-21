// The Memory That Was True — explainer video (EN). Narration from the approved script v1.0
// (script.md). One memory is a note pinned over the repository it describes (PinnedNote): the note
// never changes, the tree under it does. The audit is a wall of 35 notes (MemoryWall): green,
// red or grey, as in the article's table.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // 1-2. Cold open: the memory, true in July.
    anim(
      'hook',
      'PinnedNote',
      { mode: 'hook' },
      [say(0.25, 'My agent handed me a memory.', ''), say(0, 'It was true in July.', ''), say(0, 'It said: one workflow per article.', '')],
      { min: 4 },
    ),
    // 3. The world moves under the note.
    anim('drift', 'PinnedNote', { mode: 'drift', blend: true }, [say(0.2, 'Since then, a single queue file replaced them all.', '')], { min: 4.4 }),
    // 4-5. True when written, stale now.
    anim(
      'stale',
      'PinnedNote',
      { mode: 'stamp', blend: true },
      [say(0.2, 'The memory was not wrong.', ''), say(0, 'It stopped being true while nobody was looking.', '')],
      { min: 4 },
    ),
    // 6. The audit: 35 notes.
    anim(
      'audit',
      'MemoryWall',
      { mode: 'fill' },
      [say(0.3, 'So I audited the 35 memories my agent keeps.', '', { en: 'So I audited the thirty-five memories my agent keeps.' })],
      { min: 3.6 },
    ),
    // 7-8. The test, before any result: a check against the repo.
    anim(
      'check',
      'MemoryWall',
      { mode: 'thread', blend: true },
      [
        say(0.25, 'The idea: tie each memory to a check against the repository.', ''),
        say(0, 'It claims those workflows exist? If none is left, it turns red.', ''),
      ],
      { min: 5 },
    ),
    // 9-11. What makes this different: what expires on its own.
    anim(
      'expires',
      'MemoryWall',
      { mode: 'split' },
      [
        say(0.4, 'A preference changes only when I change my mind.', ''),
        say(0, 'A fact about the system expires on its own.', ''),
        say(0, 'Only that kind can be checked.', ''),
      ],
      { min: 5 },
    ),
    // 12. The tally.
    anim('tally', 'MemoryWall', { mode: 'tally' }, [say(0.3, 'Three came out red.', '')], { min: 3.4 }),
    // 13-14. The three reds, checked by hand.
    anim(
      'reds',
      'MemoryWall',
      { mode: 'reds', blend: true },
      [
        say(0.2, 'I checked each by hand.', ''),
        say(0, 'None was wrong when written.', ''),
        say(0, 'All three recorded a situation in progress,', ''),
        say(0, 'born with an expiry date.', ''),
      ],
      { min: 5 },
    ),
    // 15-16. The greys.
    anim(
      'greys',
      'MemoryWall',
      { mode: 'greys' },
      [
        say(0.25, "And most, 25 of them, can't be checked at all.", '', { en: "And most, twenty-five of them, can't be checked at all." }),
        say(0, "It's judgement and ways of working.", ''),
        say(0, "That isn't a flaw.", ''),
      ],
      { min: 5 },
    ),
    // 17-18. The green that was stale too.
    anim(
      'green',
      'MemoryWall',
      { mode: 'green', blend: true },
      [
        say(0.2, 'One green was stale too: its files existed, its expiry date had passed.', ''),
        say(0, 'A green certifies what was encoded, not the whole memory.', ''),
      ],
      { min: 5 },
    ),
    // 19. The hedge.
    anim('folder', 'MemoryWall', { mode: 'folder' }, [say(0.25, "That's one folder, not a staleness rate.", '')], { min: 3.2 }),
    // 20. The verdict on the tool.
    anim('verdict', 'MemoryWall', { mode: 'verdict' }, [say(0.25, 'The verdict: the checker is clumsy.', '')], { min: 4.8 }),
    // 21-22. What actually fixes it.
    anim(
      'close',
      'PinnedNote',
      { mode: 'close' },
      [say(0.25, 'What keeps a memory true is updating it when the work ends.', ''), say(0, 'And mark anything in progress as such: it will expire.', '')],
      { min: 5 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
