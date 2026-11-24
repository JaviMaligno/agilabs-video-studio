// YouTube description draft for the landscape cut. The finished description links everything the
// narration names (people, concepts, papers, repos, news), grouped by chapter in the order it comes
// up; this draft lays out that skeleton: hook, article link, chapters, and per chapter the names
// heard in it, as a checklist of what to link. Pure, used by deliver.
import { youtubeChapters } from './chapters.ts';
import { tx, type Lang, type Scene } from './types.ts';

const MONTHS = new Set('January February March April May June July August September October November December'.split(' '));
const NEVER = new Set(['I', "I'll", "I'm", "I've", "I'd", 'OK']);

/** Capitalised words that appear somewhere in mid-sentence: names, not sentence starts. */
export function midSentenceNames(texts: string[]): Set<string> {
  const out = new Set<string>();
  for (const t of texts) {
    for (const m of t.replace(/"[^"]*"/g, ' ').matchAll(/(?<![.!?]\s)(?<!^)(?<=\s)([A-Z][\p{L}'’-]*)/gu)) out.add(m[1].replace(/['’]s$/, ''));
  }
  return out;
}

/**
 * Names in a line of narration worth checking for a link: runs of capitalised words and years.
 * A word that opens a sentence counts only if `known` (capitalised mid-sentence somewhere in the
 * narration) has it; quotes and month names are left out.
 */
export function namesIn(text: string, known: Set<string>): string[] {
  const out: string[] = [];
  const plain = text.replace(/"[^"]*"/g, ' . ');
  const re = /(^|[.!?:;]\s+|\s)((?:[A-Z][\p{L}'’-]*)(?:\s+(?:of\s+|de\s+|the\s+)?[A-Z][\p{L}'’-]*)*)/gu;
  for (const m of plain.matchAll(re)) {
    let words = m[2].split(/\s+/).map((w) => w.replace(/['’]s$/, ''));
    if (m[1] === '' || /[.!?:;]/.test(m[1])) while (words.length && !known.has(words[0])) words = words.slice(1);
    words = words.filter((w) => !NEVER.has(w));
    const name = words.join(' ');
    if (!name || words.every((w) => MONTHS.has(w))) continue;
    out.push(name);
  }
  for (const m of plain.matchAll(/\b(1[5-9]\d\d|20\d\d)\b/g)) out.push(m[1]);
  return out;
}

export type DescriptionInput = { articleUrl?: string; articleTitle?: string };

/** The draft: hook placeholder, article link, chapters, and the names heard in each chapter. */
export function youtubeDescriptionDraft(scenes: Scene[], lang: Lang, input: DescriptionInput = {}): string {
  const yt = youtubeChapters(scenes, lang);
  const byScene = new Map(scenes.map((s, i) => [s.id, i]));
  const known = midSentenceNames(scenes.flatMap((s) => s.lines.map((l) => tx(l.text, lang))));
  const parts: string[] = [];
  parts.push('<Two or three sentences: the hook and what the viewer will learn. No spoilers of the verdict.>');
  parts.push('');
  parts.push(input.articleUrl ? `Full article, with every source: ${input.articleUrl}` : '<Link to the article: set SETTINGS.articleUrl>');
  parts.push('');
  parts.push(yt.text.trimEnd());
  parts.push('');
  parts.push('Links, in the order they come up');
  yt.chapters.forEach((c, k) => {
    const from = byScene.get(c.scene) ?? 0;
    const to = k + 1 < yt.chapters.length ? (byScene.get(yt.chapters[k + 1].scene) ?? scenes.length) : scenes.length;
    const seen = new Set<string>();
    for (const s of scenes.slice(from, to)) for (const l of s.lines) for (const n of namesIn(tx(l.text, lang), known)) seen.add(n);
    parts.push('');
    parts.push(c.label);
    parts.push(seen.size ? `<names heard here (a hint, not the list: read the chapter's narration for concepts too): ${[...seen].join(', ')}>` : '<link every person, concept, paper or source named in this chapter>');
  });
  parts.push('');
  parts.push('More context');
  parts.push('<optional: sources the video does not name (the article has them)>');
  return parts.join('\n') + '\n';
}

/** The "m:ss Title" chapter lines of a finished description, to compare with the render's. */
export const chapterLines = (text: string): string[] => text.split('\n').filter((l) => /^\d+:\d\d(?::\d\d)? \S/.test(l.trim())).map((l) => l.trim());
