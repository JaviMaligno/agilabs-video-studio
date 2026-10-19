// The squid rings of the photoreal cooking frames (public/cooking/*.png, 1024x1536, registered),
// measured once on rings-raw.png (pale pixels minus the empty pan, connected components):
// centre and outer / inner radius in image pixels. Drop order: the nested small ring lands last,
// inside the big ring's hole. No Remotion or React here.

export const IMG = { w: 1024, h: 1536 } as const;
/** objectFit cover into 1080x1920: scale 1.25 (1280x1920), 100 px cropped each side. */
export const COVER = { scale: 1.25, x: -100, y: 0 } as const;
/** The camera push-in scales the frame about this point (video px): the pan centre. */
export const ZOOM_ORIGIN = { x: 540, y: 856 } as const;
/** The pan floor (oil and metal) in image px. */
export const FLOOR = { x: 512, y: 685, r: 385 } as const;

export type PhotoRing = { id: string; x: number; y: number; ro: number; ri: number };

export const PHOTO_RINGS: PhotoRing[] = [
  { id: 'top-left', x: 373, y: 480, ro: 79, ri: 36 },
  { id: 'top-right', x: 615, y: 486, ro: 124, ri: 60 },
  { id: 'big', x: 379, y: 714, ro: 169, ri: 113 },
  { id: 'right', x: 793, y: 649, ro: 70, ri: 30 },
  { id: 'lower-right', x: 698, y: 821, ro: 110, ri: 56 },
  { id: 'bottom', x: 530, y: 944, ro: 74, ri: 32 },
  { id: 'nested', x: 365, y: 727, ro: 68, ri: 37 },
];

/** Image px to video px (1080x1920) under a push-in of `zoom` about ZOOM_ORIGIN. */
export const imgToVideo = (x: number, y: number, zoom = 1): { x: number; y: number } => {
  const vx = COVER.x + x * COVER.scale;
  const vy = COVER.y + y * COVER.scale;
  return { x: ZOOM_ORIGIN.x + zoom * (vx - ZOOM_ORIGIN.x), y: ZOOM_ORIGIN.y + zoom * (vy - ZOOM_ORIGIN.y) };
};

/** Push-in at the end of the opening shot = at the start of the closing one (match cuts). */
export const MATCH_ZOOM = 1.06;
