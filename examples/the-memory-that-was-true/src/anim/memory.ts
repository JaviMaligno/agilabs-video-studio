// Shared, pure data for the two bespoke components (PinnedNote, MemoryWall): the file tree under
// the note, the wall of 35 memories and the texts on the notes. No Remotion or React here.
import { clamp01, easeOutCubic, progress } from './steps.ts';

/** Stage box (vertical): 960 x 1090, see layout.ts. */
export const STAGE_W = 960;
export const STAGE_H = 1090;

// ---------------------------------------------------------------- the file tree (the repository)

export type TreeRow = { id: string; text: string; depth: number; dir?: boolean; old?: boolean; fresh?: boolean };

/**
 * The repository under the note. The three `scheduled-publish-*.yml` files are the per-article
 * workflows the memory describes (illustrative count); `publish-schedule.json` is the manifest that
 * replaced them (the article: "one JSON file holding the publication queue").
 */
export const TREE: TreeRow[] = [
  { id: 'github', text: '.github/', depth: 0, dir: true },
  { id: 'workflows', text: 'workflows/', depth: 1, dir: true },
  { id: 'deploy', text: 'deploy.yml', depth: 2 },
  { id: 'devto', text: 'devto-post.yml', depth: 2 },
  { id: 'a', text: 'scheduled-publish-article-a.yml', depth: 2, old: true },
  { id: 'b', text: 'scheduled-publish-article-b.yml', depth: 2, old: true },
  { id: 'c', text: 'scheduled-publish-article-c.yml', depth: 2, old: true },
  { id: 'queue', text: 'publish-schedule.json', depth: 1, fresh: true },
];
export const OLD_ROWS = TREE.map((r, i) => (r.old ? i : -1)).filter((i) => i >= 0);
export const QUEUE_ROW = TREE.findIndex((r) => r.fresh);

/** The check, verbatim from the article. */
export const CHECK_JSON = ['{ "file_matches":', '  ".github/workflows/scheduled-publish-*.yml" }'];

// ---------------------------------------------------------------- the wall of 35 memories

export type Kind = 'green' | 'red' | 'grey';

/**
 * 5 x 7 wall, row by row: g = green (7), r = red (3), . = grey (25). The article's table on
 * 11 September: 7 green, 3 red, 25 grey. Slot 0 is the hook memory (red). Colours are spread by
 * hand so they do not band.
 */
const LAYOUT = ['r.g..', '...g.', 'g...r', '..g..', '.r..g', '.....', '.g.g.'].join('');
export const KINDS: Kind[] = [...LAYOUT].map((ch) => (ch === 'g' ? 'green' : ch === 'r' ? 'red' : 'grey'));
export const COLS = 5;
export const ROWS = 7;
export const COUNT = { green: 7, red: 3, grey: 25, all: 35 } as const;
export const REDS = KINDS.map((k, i) => (k === 'red' ? i : -1)).filter((i) => i >= 0);
export const GREENS = KINDS.map((k, i) => (k === 'green' ? i : -1)).filter((i) => i >= 0);
export const CHECKED = KINDS.map((k, i) => (k !== 'grey' ? i : -1)).filter((i) => i >= 0);
/** The green that was stale too: seven files, and a date inside them nobody checks. */
export const STALE_GREEN = 17;

/** Wall geometry in stage space. */
export const WALL = { x: 32, y: 116, w: 160, h: 96, gx: 24, gy: 20 } as const;
export const slot = (i: number) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  return { x: WALL.x + c * (WALL.w + WALL.gx), y: WALL.y + r * (WALL.h + WALL.gy), w: WALL.w, h: WALL.h };
};
/** Bottom of the wall; the repo band sits under it for the tally threads. */
export const WALL_BOTTOM = WALL.y + ROWS * WALL.h + (ROWS - 1) * WALL.gy;
export const REPO_BAND = { x: 32, y: WALL_BOTTOM + 70, w: 896, h: 92 } as const;

/** Texts of the three reds (generic paraphrases of the article's three bullets). */
export const RED_TEXTS = ['scheduling = one workflow per article', 'article pending on its branch', 'two articles awaiting review'];
export const RED_OUTCOMES = ['→ since replaced', '→ since published', '→ since published'];
export const GREY_KINDS = ['preference', 'judgement', 'way of working'];

// ---------------------------------------------------------------- helpers

export const lerp = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);
export const ease = (T: number, start: number, len: number) => easeOutCubic(progress(T, start, len));
/** A rise and fall in [0, 1]: up over `up` s from `start`, held, down over `down` s from `end`. */
export const pulseWindow = (T: number, start: number, up: number, end: number, down: number) =>
  clamp01(progress(T, start, up) * (1 - progress(T, end, down)));
/** A gentle oscillation in [0, 1], finite for any T. */
export const wave = (T: number, hz = 1.2) => 0.5 + 0.5 * Math.sin(((T % 1000) * Math.PI * 2 * hz));
/** A pop with a little overshoot that settles at exactly 1. */
export const pop = (T: number, start: number, len = 0.35) => {
  const p = progress(T, start, len);
  if (p >= 1) return 1;
  return clamp01(easeOutCubic(p) * (1 + 0.12 * Math.sin(p * Math.PI)));
};
