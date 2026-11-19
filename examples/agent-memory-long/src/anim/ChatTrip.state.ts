// Pure state of the trip chat (rows 1, 2 and 39).
// - wrong (cold open, row 1): the whole chat is on screen from frame 0: high up the user's
//   correction ("my flight is Friday, not Thursday") and the AI's "Got it!"; a "later" divider and
//   an hour of collapsed messages; at the bottom the booking "Booked your hotel for Thursday night",
//   already made, pulsing red from the first frame. Each bubble lights as the voice names it.
//   Marks: [told, got, booked].
// - morning (row 2): the same chat, then a wipe to a fresh chat in morning light, the greeting
//   "Hi! How can I help you today?" and an empty input with a blinking cursor. Marks: [tomorrow, remember].
// - save (row 39): the chat beside the app's "Memory" panel; the old chat dims ("buried"), the user
//   types "Save to memory: my flight is Friday.", sends it, and the line appears in the panel, lit.
//   Marks: [buried, ask, names, pile].
// No Remotion or React here.
import { beatOr, bump, ease, loopTime, mark, pickMode } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export const CHAT_MODES = ['wrong', 'morning', 'save'] as const;
export type ChatMode = (typeof CHAT_MODES)[number];
export type ChatTripProps = { mode?: ChatMode; marks?: number[] };

/** The texts on screen, exactly as the script writes them. */
export const CHAT_TITLE = 'Trip planning';
export const NEW_CHAT_TITLE = 'New chat';
export const CORRECTION = 'Change of plan: my flight is Friday, not Thursday.';
export const GOT_IT = 'Got it!';
export const LATER = 'later';
export const BOOKING = 'Booked your hotel for Thursday night';
export const GREETING = 'Hi! How can I help you today?';
export const SAVE_LINE = 'Save to memory: my flight is Friday.';
/** Notes already in the Memory panel before the save (row 39). */
export const PANEL_NOTES = ['prefers a window seat', 'travels with hand luggage'] as const;

export type ChatTripState = {
  /** The cold-open chat: shown, its bubbles' glow, the booking's red pulse. */
  chat: { opacity: number; lit: number[]; alert: number };
  /** The wipe to the new chat: 0 = old chat, 1 = new chat fully in. */
  wipe: number;
  morning: number;
  greeting: number;
  cursor: number;
  /** save: the old chat dimmed, the draft typed (0..1), sent, the panel, the new note. */
  dim: number;
  typed: number;
  sent: number;
  panel: number;
  note: { opacity: number; lit: number };
};

export function frameState(props: ChatTripProps, t: number, beats: number[], dur: number): ChatTripState {
  const mode = pickMode(props.mode, CHAT_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  // The wrong booking pulses from frame 0: never fully off.
  const pulse = 0.55 + 0.45 * Math.sin(tm * 4.2);
  const none = { wipe: 0, morning: 0, greeting: 0, cursor: 0, dim: 0, typed: 0, sent: 0, panel: 0, note: { opacity: 0, lit: 0 } };

  if (mode === 'wrong') {
    const told = mark(m, 0, b0 + 0.4);
    const got = Math.max(told + 0.4, mark(m, 1, b0 + 2.4));
    const booked = Math.max(got + 0.4, mark(m, 2, b0 + 4.0));
    return {
      ...none,
      chat: {
        opacity: 1,
        lit: [bump(T, told - 0.1, 1.4), bump(T, got - 0.1, 1.2), 0],
        alert: Math.min(1, pulse + 0.4 * ease(T, booked - 0.1, 0.3)),
      },
    };
  }

  if (mode === 'morning') {
    const tomorrow = mark(m, 0, b0 + 0.6);
    const remember = Math.max(tomorrow + 0.6, mark(m, 1, b0 + 2.6));
    const wipe = ease(T, tomorrow - 0.2, 0.9);
    return {
      ...none,
      chat: { opacity: 1 - wipe, lit: [0, 0, 0], alert: pulse },
      wipe,
      morning: wipe,
      greeting: ease(T, tomorrow + 0.6, 0.4),
      cursor: wipe >= 1 && Math.floor(tm * 2) % 2 === 0 ? 1 : 0,
      dim: 0,
      typed: 0,
      sent: 0,
      panel: 0,
      note: { opacity: 0, lit: bump(T, remember - 0.1, 1.2) },
    };
  }

  // save
  const buried = mark(m, 0, b0 + 2.4);
  const ask = Math.max(buried + 0.4, mark(m, 1, b0 + 3.6));
  const names = Math.max(ask + 1.2, mark(m, 2, b0 + 6.4));
  const pile = Math.max(names + 0.8, mark(m, 3, b0 + 11));
  const sent = ease(T, names - 0.1, 0.4);
  return {
    ...none,
    chat: { opacity: 1, lit: [0, 0, 0], alert: 0 },
    morning: 1,
    dim: ease(T, buried - 0.1, 0.5),
    typed: progress(T, ask - 0.1, Math.max(0.6, names - ask - 0.2)),
    sent,
    cursor: sent < 1 ? (Math.floor(tm * 2) % 2 === 0 ? 1 : 0) : 0,
    panel: ease(T, b0, 0.5),
    note: { opacity: ease(T, names + 0.4, 0.5), lit: Math.max(bump(T, names + 0.4, 1.6), ease(T, pile - 0.1, 0.4)) },
  };
}
