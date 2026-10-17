// Narration settings for the TTS and audio QA scripts. Per-video content lives in src/.
export default {
  tts: {
    // 'auto': Cartesia when a key is available and the service answers, else the local Kokoro
    // voice for the whole language. 'cartesia' fails instead of switching; 'kokoro' stays offline.
    engine: 'auto',
    model: 'sonic-3.6-2026-08-27',
    // Slightly calmer than default: short end-of-line phrases read too fast as captions at 1.
    speed: 0.9,
    voices: {
      en: { id: '5568a7df-e5ab-4442-9fae-2e9ba1b15ad8', language: 'en' }, // en-GB
      es: null, // pick a Spanish voice before the first ES version
    },
    kokoro: {
      speed: 1,
      voices: {
        en: { voice: 'af_bella', lang: 'en-us' },
        es: { voice: 'ef_dora', lang: 'es' },
      },
    },
  },
};
