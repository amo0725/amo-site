import type { SignalStateName as SignalState } from "@/content/types";

export type { SignalState };

/**
 * The reel's clock, shared by the choreography (scenes.tsx), the player
 * chrome and the beat map. Kept free of any scene code so the player can
 * import it without pulling the stage into the main bundle.
 */

/** One beat at 120 BPM. */
export const BEAT = 0.5;
export const b = (n: number) => n * BEAT;

/** Total length. The last frame matches the first, so the reel loops. */
export const DURATION = b(64);

/**
 * When the one recurring element changes shape. The scenes key their
 * morphs to these times; the beat map draws them.
 */
export const SIGNAL_STATES: ReadonlyArray<{ id: SignalState; at: number }> = [
  { id: "dot", at: 0 },
  { id: "packet", at: b(11) },
  { id: "inbox", at: b(22) },
  { id: "pen", at: b(34) },
  { id: "gate", at: b(46.5) },
  { id: "bar", at: b(56.5) },
  { id: "dot", at: b(61) },
];

export const signalAt = (id: SignalState, nth = 0): number =>
  SIGNAL_STATES.filter((s) => s.id === id)[nth].at;
