import { loadFont } from '@remotion/google-fonts/Inter';

export const { fontFamily } = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

export const VERTICAL = { w: 1080, h: 1920 } as const;
export const LANDSCAPE = { w: 1920, h: 1080 } as const;

/** Vertical safe area: room left for platform UI (top bar, caption and action rail). */
export const SAFE = { top: 220, bottom: 380, side: 72 } as const;
