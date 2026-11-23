import { createHash } from 'node:crypto';

// Which TTS engine voices a language. Pure, so the fallback rules are testable.
// A language is always voiced by one engine end to end: when Cartesia fails half way through,
// the caller asks again with the error and re-voices every line of that language with Kokoro.

/**
 * @param {'cartesia'|'kokoro'|'auto'} engine requested engine
 * @param {boolean} hasKey whether CARTESIA_API_KEY was found
 * @param {string} [cartesiaError] why Cartesia could not be used, if it was tried
 * @returns {{ engine: 'cartesia'|'kokoro', warning?: string }}
 */
export function chooseEngine(engine, hasKey, cartesiaError) {
  if (engine === 'kokoro') return { engine: 'kokoro' };
  if (engine === 'cartesia') {
    if (!hasKey) throw new Error('tts.engine is "cartesia" but no CARTESIA_API_KEY was found (env, template/.env or ~/Documents/repos/.env)');
    if (cartesiaError) throw new Error(`Cartesia failed: ${cartesiaError}`);
    return { engine: 'cartesia' };
  }
  if (engine !== 'auto') throw new Error(`unknown tts.engine "${engine}" (cartesia, kokoro or auto)`);
  if (!hasKey) return { engine: 'kokoro', warning: 'no CARTESIA_API_KEY found: voicing with Kokoro (local)' };
  if (cartesiaError) return { engine: 'kokoro', warning: `Cartesia unavailable (${cartesiaError}): voicing with Kokoro (local)` };
  return { engine: 'cartesia' };
}

/** HTTP statuses that mean "Cartesia cannot serve us now" rather than "the request is wrong". */
export const cartesiaUnavailable = (status) => [401, 402, 403, 429].includes(status) || status >= 500;

// ── Per-voice post-processing: an ffmpeg -af chain applied to each line right after synthesis
// (e.g. to clean up a voice cloned from a weak microphone). Word timestamps come from the
// synthesis, so the chain must keep the line's length: filters that stretch, trim or pad are refused.
const LENGTH_CHANGING = ['atempo', 'rubberband', 'asetrate', 'silenceremove', 'atrim', 'apad', 'adelay', 'aloop', 'areverse'];

/**
 * The voice's `post` chain, trimmed; '' when there is none.
 * @param {any} voice a voice entry from video.config.mjs (Cartesia or Kokoro), or null
 * @returns {string}
 */
export function postChain(voice) {
  const post = voice?.post;
  if (post === undefined || post === null || post === '') return '';
  if (typeof post !== 'string') throw new Error(`voice "post" must be an ffmpeg -af chain (a string), got ${typeof post}`);
  const chain = post.trim();
  const names = chain.split(',').map((f) => f.trim().split('=')[0].trim());
  const bad = names.filter((n) => LENGTH_CHANGING.includes(n));
  if (bad.length) throw new Error(`voice "post" uses ${bad.join(', ')}: filters that change a line's length would break its word timestamps`);
  return chain;
}

/**
 * Cache hash of one voiced line. `parts` are the engine, voice and settings; the post chain is
 * appended only when set, so lines voiced before `post` existed keep their hash.
 * @param {(string|number)[]} parts
 * @param {string} text
 * @param {string} [post]
 */
export function lineHash(parts, text, post = '') {
  const key = [...parts, text].join('|') + (post ? `|post:${post}` : '');
  return createHash('sha1').update(key).digest('hex');
}

// ── Colons. Javier's cloned voice reads a colon inside a line as a question: the word before it
// rises ("It said:" sounds like "It said?"). A full stop makes it fall. So by default the TTS
// voices a colon followed by a space (or ending the line) as a full stop, capitalising the next
// word; the caption keeps its colon. Clock times, ratios and URLs ("10:30", "3:1", "https://")
// have no space after the colon and are left alone. Opt out with `tts.colonsAsStops: false`.
/**
 * @param {string} text the voiced text of a line (its spoken form, or else its caption)
 * @returns {string}
 */
export function colonsAsStops(text) {
  return text
    .replace(/:\s+(["“‘'(]?)(\p{L})/gu, (_, q, c) => `. ${q}${c.toUpperCase()}`)
    .replace(/:\s+/g, '. ')
    .replace(/:$/, '.');
}

// ── Cost guard. The cloned voice is paid per character, so changes to an approved Cartesia
// narration are local: only the lines whose text (or tone) changed are voiced again. A run that
// would re-voice many lines that already have a Cartesia take means something global changed
// (model, default emotion or speed, voice id, the post chain): that needs the author's explicit
// go-ahead (`--revoice-all`). Voicing lines for the first time (the switch after approval, new
// lines) is never blocked.
/** Most existing Cartesia takes a run may replace without `--revoice-all`. */
export const MAX_REVOICE = 10;

/**
 * @param {{ key: string; text: string; hadCartesia: boolean }[]} pending lines the run would voice
 * @param {{ revoiceAll?: boolean; limit?: number }} [opts]
 * @returns {{ lines: number; chars: number; revoiced: string[]; blocked: string | null }}
 */
export function revoiceCheck(pending, opts = {}) {
  const limit = opts.limit ?? MAX_REVOICE;
  const revoiced = pending.filter((p) => p.hadCartesia).map((p) => p.key);
  const chars = pending.reduce((n, p) => n + p.text.length, 0);
  const blocked =
    !opts.revoiceAll && revoiced.length > limit
      ? `this run would re-voice ${revoiced.length} lines that already have a Cartesia take (limit ${limit}). ` +
        'Something global changed (model, default emotion or speed, voice, post chain)? Changes to the ' +
        'cloned voice are local: revert it, or rerun with --revoice-all once the author has agreed.'
      : null;
  return { lines: pending.length, chars, revoiced, blocked };
}
