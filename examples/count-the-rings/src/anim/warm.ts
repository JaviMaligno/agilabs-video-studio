// Warm colours for the cooking (allowed by the script for the sear and the photo scenes only).
// UI chrome (badge, captions, outro) stays on the brand tokens in src/brand.ts.
export const WARM = {
  amber: '#f59e0b',
  orange: '#f97316',
  ember: '#fdba74',
  squid: '#efe6da',
  squidShade: '#cfc3b3',
  red: '#ef4444',
  metal: '#2a2a35',
  floor0: '#24242e',
  floor1: '#121218',
} as const;

export const WARM_GRADIENT = `linear-gradient(90deg, ${WARM.amber}, ${WARM.orange})`;
