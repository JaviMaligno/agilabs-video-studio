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
