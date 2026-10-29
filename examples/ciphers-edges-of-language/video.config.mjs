// Narration settings for the TTS and audio QA scripts. Per-video content lives in src/.
// "Version B" clean-up chain for Javier's cloned voice (approved by Javier).
export const JAVIER_POST =
  'highpass=f=85,afftdn=nr=10:nf=-45,equalizer=f=220:t=q:w=1.2:g=-3.5,equalizer=f=3200:t=q:w=0.9:g=5,' +
  'highshelf=f=8500:g=4,acompressor=threshold=-24dB:ratio=3.5:attack=6:release=100:makeup=3';

export default {
  tts: {
    // 'auto': Cartesia when a key is available and the service answers, else the local Kokoro
    // voice for the whole language. 'cartesia' fails instead of switching; 'kokoro' stays offline.
    engine: 'auto',
    model: 'sonic-3.6-2026-08-27',
    speed: 1,
    emotion: 'excited', // default Cartesia emotion (EN); a line overrides it with its tone
    colonsAsStops: true, // voice a colon inside a line as a full stop
    // Each voice may carry `post`: an ffmpeg -af chain applied to every line right after synthesis
    // (part of the line cache, so changing it re-processes). It must not change a line's length.
    voices: {
      // Javier's own cloned voice + the "version B" clean-up chain for his weak mic.
      // Previous voice: Quentin (en-GB), { id: '5568a7df-e5ab-4442-9fae-2e9ba1b15ad8', language: 'en' }.
      en: { id: 'b7abe199-5f62-45fd-b77a-d12a1fe80a36', language: 'en', post: JAVIER_POST },
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
