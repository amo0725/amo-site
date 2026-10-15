/**
 * The showreel, scene by scene.
 *
 * One idea holds it together: a single signal, never cut. The green dot
 * that appears in the first frame is the same element all the way
 * through. It becomes the packet that walks a payment through four
 * systems, opens into the inbox, draws the heartbeat as its pen, turns
 * into the choke point, and finally stretches into the colour bar under
 * the name. Everything else grows out of it or collapses back into it,
 * so there are no crossfades between scenes.
 *
 * Timing sits on a 120 BPM grid (one beat = 0.5 s), written as `b(n)`.
 * Positions are on a fixed 1600 × 900 stage, centre-anchored.
 */
import type { ReelCopy } from "@/content/types";
import { fbm } from "@/lib/noise";
import { b, DURATION, signalAt } from "./timing";
import {
  ease,
  type CanvasLayer,
  type Easing,
  type Key,
  type PropName,
  type Track,
} from "./engine";

export const STAGE_W = 1600;
export const STAGE_H = 900;
export { DURATION };



const C = {
  fg: "var(--reel-fg)",
  dim: "var(--reel-dim)",
  line: "var(--reel-line)",
  panel: "var(--reel-panel)",
  e1: "var(--reel-e1)",
  e2: "var(--reel-e2)",
  e3: "var(--reel-e3)",
  e4: "var(--reel-e4)",
  e5: "var(--reel-e5)",
  e6: "var(--reel-e6)",
};

/* ------------------------------------------------------------------ */
/* Track helpers                                                       */
/* ------------------------------------------------------------------ */

type Step = readonly [at: number, value: number, easing?: Easing];

/** Keys for one property: [time, value, easing into it]. */
const prop = (name: PropName, steps: readonly Step[]): Key[] =>
  steps.map(([at, value, e]) => ({ at, [name]: value, ease: e }));

const at = (x: number, y: number): Key => ({ at: 0, x, y });
/** Present from `t` on, without a fade. */
const from = (t: number): Key[] => [
  { at: 0, opacity: 0 },
  { at: t, opacity: 0 },
  { at: t + 0.001, opacity: 1, ease: ease.linear },
];
/** Gone from `t` on, without a fade. */
const until = (t: number): Key[] => [
  { at: t, opacity: 1 },
  { at: t + 0.001, opacity: 0, ease: ease.linear },
];
/** Reveal from the left edge. */
const wipe = (t: number, d = 0.6): Key[] => [
  { at: t, clip: 0 },
  { at: t + d, clip: 1, ease: ease.outExpo },
];
/** Leave the way it came in: hidden from the left edge onward. */
const wipeOut = (t: number, d = 0.45): Key[] => [
  { at: t, clipL: 0 },
  { at: t + d, clipL: 1, ease: ease.inOutQuart },
];
const widen = (t: number, d = 1.1): Key[] => [
  { at: t, stretch: 62 },
  { at: t + d, stretch: 125, ease: ease.outExpo },
];
const draw = (t: number, d = 0.6, e: Easing = ease.inOutQuart): Key[] => [
  { at: t, draw: 0 },
  { at: t + d, draw: 1, ease: e },
];
/** Erase a stroke from its start, so it retracts towards its end. */
const retract = (t: number, d = 0.5): Key[] => [
  { at: t, trim: 0 },
  { at: t + d, trim: 1, ease: ease.inOutQuart },
];
const track = (id: string, ...keys: Array<Key | Key[]>): Track => ({
  id,
  keys: keys.flat(),
});

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const S1_CENTER = { x: 800, y: 360 };
const S2_X = [230, 610, 990, 1370] as const;
const S2_Y = 420;
const S2_NODE = { w: 310, h: 140 };
/** Nodes stand on the wire, so the packet rides along their base, clear of the labels. */
const S2_NODE_Y = S2_Y - S2_NODE.h / 2;
/** The inbox sits left of centre so the service pills have room to breathe. */
const S3_CENTER = { x: 760, y: 450 };
const S3_INBOX = { w: 400, h: 470 };
const S3_Y = [270, 450, 630] as const;
const S3_ROW_Y = (k: number) => 318 + k * 56;
const S3_CHANNEL_X = 230;
const S3_SERVICE_X = 1340;
const S3_WIRE_X0 = S3_CENTER.x + S3_INBOX.w / 2;
const S3_WIRE_X1 = S3_SERVICE_X - 240;
const S4_ECG = { x: 800, y: 380 };
const S4_GATE = { x: 800, y: 450 };
const S4_INCOMING = Array.from({ length: 7 }, (_, i) => 150 + i * 100);
const S5_BAR = { x: 800, y: 705 };

/** Heartbeat polyline around (0, 0); the signal follows it as the pen. */
const ECG_POINTS: ReadonlyArray<readonly [number, number]> = (() => {
  const pts: Array<[number, number]> = [[-700, 0]];
  for (let x = -700; x < 700; x += 200) {
    pts.push(
      [x + 70, 0],
      [x + 85, -14],
      [x + 100, 0],
      [x + 112, 18],
      [x + 124, -96],
      [x + 138, 42],
      [x + 150, 0],
      [x + 200, 0],
    );
  }
  return pts;
})();
const ECG_PATH = ECG_POINTS.map(
  ([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`,
).join(" ");

/** Keys that move along the heartbeat at constant speed, matching the stroke reveal. */
function alongEcg(t0: number, d: number): { x: Key[]; y: Key[] } {
  const lengths = [0];
  for (let i = 1; i < ECG_POINTS.length; i += 1) {
    const [ax, ay] = ECG_POINTS[i - 1];
    const [bx, by] = ECG_POINTS[i];
    lengths.push(lengths[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = lengths[lengths.length - 1];
  const x: Key[] = [];
  const y: Key[] = [];
  ECG_POINTS.forEach(([px, py], i) => {
    const t = t0 + (lengths[i] / total) * d;
    x.push({ at: t, x: S4_ECG.x + px, ease: ease.linear });
    y.push({ at: t, y: S4_ECG.y + py, ease: ease.linear });
  });
  return { x, y };
}

/* ------------------------------------------------------------------ */
/* The signal: one element, every scene                                 */
/* ------------------------------------------------------------------ */

const T = {
  // Scene 1: signal
  s1Line: b(3.5),
  s1Sub: b(5),
  s1Exit: b(7.5),
  absorb: b(8.5),
  // Scene 2: quote to cash
  toWire: b(8.75),
  wireStart: b(9.75),
  packet: signalAt("packet"),
  /** The payment lands on node i at arrive[i]. */
  arrive: [b(12), b(13.5), b(15), b(16.5)] as const,
  s2Line: b(17.5),
  s2Exit: b(20.5),
  // Scene 3: messages
  toInbox: b(21),
  inboxOpen: signalAt("inbox"),
  channels: b(22.5),
  bubbles: b(24),
  s3Wires: b(27.5),
  s3Line: b(28.5),
  s3Exit: b(31.5),
  inboxClose: b(32),
  // Scene 4: root cause
  toPen: b(33),
  ecgStart: signalAt("pen"),
  ecgDur: 2.25,
  socket: b(35),
  events: b(35.5),
  count: b(36),
  counted: b(38.5),
  looks: b(39),
  strike: b(41),
  broken: b(41.5),
  s4aExit: b(44.5),
  toGate: b(45),
  gateOpen: signalAt("gate"),
  fix: b(47.5),
  s4bExit: b(50.5),
  gateClose: b(51.5),
  // Scene 5: name
  echo: b(51),
  toBar: b(52),
  name: b(53),
  role: b(55),
  tagline: b(56),
  bar: signalAt("bar"),
  bands: b(57.5),
  // Loop: the card clears, the bar folds back into the dot, the dot
  // returns to where the reel began. The last frame equals the first.
  clear: b(60),
  unbar: signalAt("dot", 1),
  home: b(62.5),
};

function signalTrack(): Track {
  const pen = alongEcg(T.ecgStart, T.ecgDur);
  const [a0, , , a3] = T.arrive;
  const lastEcg = ECG_POINTS[ECG_POINTS.length - 1];
  const ecgEnd = { x: S4_ECG.x + lastEcg[0], y: S4_ECG.y + lastEcg[1] };
  const dwell = 0.15;
  return track(
    "sig",
    { at: 0, opacity: 1 },
    until(T.bands + 0.6),
    { at: T.unbar, opacity: 0 },
    { at: T.unbar + 0.001, opacity: 1, ease: ease.linear },
    prop("x", [
      [0, S1_CENTER.x],
      [T.toWire, S1_CENTER.x],
      [T.wireStart, S2_X[0], ease.inOutQuart],
      ...T.arrive.slice(1).flatMap((t, i): Step[] => [
        [T.arrive[i] + dwell, S2_X[i]],
        [t, S2_X[i + 1], ease.inOutQuart],
      ]),
      [T.toInbox, S2_X[3]],
      [T.inboxOpen, S3_CENTER.x, ease.inOutQuart],
      [T.toPen, S3_CENTER.x],
      [T.ecgStart, S4_ECG.x + ECG_POINTS[0][0], ease.inOutQuart],
    ]),
    pen.x,
    prop("x", [
      [T.toGate, ecgEnd.x],
      [T.toGate + 0.9, S4_GATE.x, ease.inOutQuart],
    ]),
    prop("y", [
      [0, S1_CENTER.y],
      [T.toInbox, S2_Y],
      [T.inboxOpen, S3_CENTER.y, ease.inOutQuart],
      [T.toPen, S3_CENTER.y],
      [T.ecgStart, S4_ECG.y, ease.inOutQuart],
    ]),
    pen.y,
    prop("y", [
      [T.toGate, ecgEnd.y],
      [T.toGate + 0.9, S4_GATE.y, ease.inOutQuart],
      [T.toBar, S4_GATE.y],
      [T.toBar + 0.9, S5_BAR.y, ease.inOutQuart],
      [T.home, S5_BAR.y],
      [DURATION - 0.15, S1_CENTER.y, ease.inOutQuart],
    ]),
    prop("scale", [
      [0, 1],
      [T.absorb, 1],
      [T.absorb + 0.12, 1.4, ease.outCubic],
      [T.absorb + 0.6, 1, ease.spring],
      // a short push each time the payment lands on a system
      ...T.arrive.flatMap((t): Step[] => [
        [t, 1],
        [t + 0.1, 1.3, ease.outCubic],
        [t + 0.5, 1, ease.spring],
      ]),
    ]),
    prop("w", [
      [0, 26],
      [T.inboxOpen, 26],
      [T.inboxOpen + 1.1, S3_INBOX.w, ease.spring],
      [T.inboxClose, S3_INBOX.w],
      [T.inboxClose + 0.6, 26, ease.inOutQuart],
      [T.gateOpen, 26],
      [T.gateOpen + 0.7, 64, ease.spring],
      [T.gateClose, 64],
      [T.gateClose + 0.4, 26, ease.inCubic],
      [T.bar, 26],
      [T.bar + 0.8, 420, ease.outExpo],
      [T.unbar, 420],
      [T.unbar + 0.8, 26, ease.inOutQuart],
    ]),
    prop("h", [
      [0, 26],
      [T.inboxOpen, 26],
      [T.inboxOpen + 1.1, S3_INBOX.h, ease.spring],
      [T.inboxClose, S3_INBOX.h],
      [T.inboxClose + 0.6, 26, ease.inOutQuart],
      [T.gateOpen, 26],
      [T.gateOpen + 0.7, 64, ease.spring],
      [T.gateClose, 64],
      [T.gateClose + 0.4, 26, ease.inCubic],
      [T.bar, 26],
      [T.bar + 0.8, 12, ease.outExpo],
      [T.unbar, 12],
      [T.unbar + 0.8, 26, ease.inOutQuart],
    ]),
    prop("radius", [
      [0, 13],
      [T.packet, 13],
      [T.packet + 0.4, 4, ease.outCubic],
      [T.toInbox, 4],
      [T.inboxOpen, 13, ease.outCubic],
      [T.inboxOpen + 1.1, 20, ease.outCubic],
      [T.inboxClose, 20],
      [T.inboxClose + 0.6, 13, ease.inOutQuart],
      [T.gateOpen, 13],
      [T.gateOpen + 0.5, 4, ease.outCubic],
      [T.gateClose, 4],
      [T.gateClose + 0.4, 13, ease.inCubic],
      [T.bar, 13],
      [T.bar + 0.5, 0, ease.outCubic],
      [T.unbar + 0.3, 0],
      [T.unbar + 0.8, 13, ease.inOutQuart],
    ]),
    prop("rotate", [
      [0, 0],
      [T.packet, 0],
      [T.packet + 0.4, 45, ease.outCubic],
      [a0, 45],
      [a3, 405, ease.linear],
      [T.toInbox, 405],
      [T.inboxOpen, 360, ease.outCubic],
      [T.gateOpen, 360],
      [T.gateOpen + 0.7, 405, ease.spring],
      [T.gateClose, 405],
      [T.gateClose + 0.4, 360, ease.inCubic],
    ]),
    prop("mix", [
      [0, 0],
      [T.inboxOpen, 0],
      [T.inboxOpen + 0.7, 1, ease.outCubic],
      [T.inboxClose, 1],
      [T.inboxClose + 0.5, 0, ease.inCubic],
      [T.gateOpen, 0],
      [T.gateOpen + 0.5, 1, ease.outCubic],
      [T.gateClose, 1],
      [T.gateClose + 0.4, 0, ease.inCubic],
    ]),
    prop("edge", [
      [0, 0],
      [T.inboxOpen, 0],
      [T.inboxOpen + 0.7, 1, ease.outCubic],
      [T.inboxClose, 1],
      [T.inboxClose + 0.5, 0, ease.inCubic],
    ]),
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1: a signal spreads out from the centre                        */
/* ------------------------------------------------------------------ */

const S1_SWEEP_START = b(2);
const S1_SWEEP_DEG_PER_S = 150;
const S1_BLIPS = Array.from({ length: 12 }, (_, k) => {
  const angle = k * 30 + fbm(k * 1.7, 3.1) * 22; // degrees clockwise from north
  const radius = 120 + fbm(k * 2.9, 7.3) * 190;
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    angle,
    x: S1_CENTER.x + Math.cos(rad) * radius,
    y: S1_CENTER.y + Math.sin(rad) * radius * 0.92,
    color: [C.e1, C.e2, C.e3, C.e4, C.e5, C.e6][k % 6],
  };
});

function scene1Tracks(): Track[] {
  const { x, y } = S1_CENTER;
  const close = T.absorb - 0.5;
  const tracks: Track[] = [
    track(
      "s1-h",
      at(x, y),
      prop("sx", [
        [b(1.5), 0],
        [b(1.5) + 0.8, 1, ease.outExpo],
        [close, 1],
        [T.absorb, 0, ease.inOutQuart],
      ]),
    ),
    track(
      "s1-v",
      at(x, y),
      prop("sy", [
        [b(1.75), 0],
        [b(1.75) + 0.8, 1, ease.outExpo],
        [close, 1],
        [T.absorb, 0, ease.inOutQuart],
      ]),
    ),
    track(
      "s1-rings",
      at(x, y),
      prop("scale", [
        [b(2), 0],
        [b(2) + 1, 1, ease.outExpo],
        [close, 1],
        [T.absorb, 0, ease.inOutQuart],
      ]),
    ),
    track(
      "s1-sweep",
      at(x, y),
      prop("rotate", [
        [S1_SWEEP_START, 0],
        [T.absorb, (T.absorb - S1_SWEEP_START) * S1_SWEEP_DEG_PER_S, ease.linear],
      ]),
      prop("scale", [
        [S1_SWEEP_START, 0.2],
        [S1_SWEEP_START + 0.6, 1, ease.outExpo],
        [close, 1],
        [T.absorb, 0, ease.inOutQuart],
      ]),
      from(S1_SWEEP_START),
    ),
  ];

  S1_BLIPS.forEach((blip, k) => {
    const hit = S1_SWEEP_START + blip.angle / S1_SWEEP_DEG_PER_S;
    tracks.push(
      track(
        `s1-blip-${k}`,
        prop("x", [
          [close, blip.x],
          [T.absorb, x, ease.inCubic],
        ]),
        prop("y", [
          [close, blip.y],
          [T.absorb, y, ease.inCubic],
        ]),
        prop("scale", [
          [hit, 0],
          [hit + 0.35, 1, ease.spring],
          [close, 1],
          [T.absorb, 0.3, ease.inCubic],
        ]),
        from(hit),
        until(T.absorb),
      ),
    );
  });

  tracks.push(
    track("s1-line", at(800, 650), wipe(T.s1Line, 0.8), widen(T.s1Line, 1.3), wipeOut(T.s1Exit)),
    track("s1-sub", at(800, 756), wipe(T.s1Sub, 0.7), wipeOut(T.s1Exit + 0.15)),
  );
  return tracks;
}

/* ------------------------------------------------------------------ */
/* Scene 2: quote to cash                                               */
/* ------------------------------------------------------------------ */

function scene2Tracks(): Track[] {
  const wireDur = 0.75;
  const tracks: Track[] = [
    track(
      "s2-wire",
      at(800, S2_Y),
      draw(T.wireStart, wireDur, ease.outCubic),
      retract(T.s2Exit + 0.3, 0.6),
    ),
  ];
  S2_X.forEach((nx, i) => {
    // Each node unfolds from the wire as the stroke reaches it.
    const reach = T.wireStart + ((nx - S2_X[0]) / (S2_X[3] - S2_X[0])) * wireDur * 0.8;
    const exit = T.s2Exit + i * 0.08;
    tracks.push(
      track(
        `s2-node-${i}`,
        prop("x", [[0, nx]]),
        prop("y", [
          [reach, S2_Y],
          [reach + 0.45, S2_NODE_Y, ease.outExpo],
          [exit, S2_NODE_Y],
          [exit + 0.35, S2_Y, ease.inOutQuart],
        ]),
        prop("sy", [
          [reach, 0.04],
          [reach + 0.45, 1, ease.outExpo],
          [exit, 1],
          [exit + 0.35, 0.04, ease.inOutQuart],
        ]),
        prop("sx", [
          [reach, 0.3],
          [reach + 0.3, 1, ease.outExpo],
        ]),
        from(reach),
        until(exit + 0.35),
      ),
      track(
        `s2-hit-${i}`,
        prop("x", [[0, nx]]),
        prop("y", [
          [exit, S2_NODE_Y],
          [exit + 0.35, S2_Y, ease.inOutQuart],
        ]),
        { at: 0, opacity: 0 },
        { at: T.arrive[i], opacity: 0 },
        { at: T.arrive[i] + 0.02, opacity: 1, ease: ease.linear },
        { at: T.arrive[i] + 0.6, opacity: 0.35, ease: ease.outCubic },
        prop("sy", [
          [exit, 1],
          [exit + 0.35, 0.04, ease.inOutQuart],
        ]),
        until(exit + 0.35),
      ),
    );
  });

  const done = T.arrive[3] + 0.2;
  tracks.push(
    track("s2-check", at(S2_X[3], 500), draw(done, 0.4, ease.outCubic), retract(T.s2Exit, 0.35)),
    track("s2-checktext", at(S2_X[3], 566), wipe(done + 0.15, 0.5), wipeOut(T.s2Exit)),
    track("s2-line", at(800, 720), wipe(T.s2Line, 0.7), widen(T.s2Line, 1.1), wipeOut(T.s2Exit + 0.1)),
  );
  return tracks;
}

/* ------------------------------------------------------------------ */
/* Scene 3: messages in, services out                                   */
/* ------------------------------------------------------------------ */

const S3_BUBBLES = Array.from({ length: 6 }, (_, k) => ({
  channel: k % 3,
  start: T.bubbles + k * 0.3,
  color: [C.e2, C.e3, C.e1][k % 3],
}));

function scene3Tracks(): Track[] {
  const tracks: Track[] = [
    track("s3-head", at(S3_CENTER.x, 250), wipe(T.inboxOpen + 0.9, 0.5), wipeOut(T.s3Exit)),
  ];
  S3_Y.forEach((y, i) => {
    const tIn = T.channels + i * 0.15;
    const tOut = T.s3Exit + i * 0.08;
    tracks.push(
      track(
        `s3-ch-${i}`,
        prop("y", [[0, y]]),
        prop("x", [
          [tIn, -260],
          [tIn + 0.7, S3_CHANNEL_X, ease.outExpo],
          [tOut, S3_CHANNEL_X],
          [tOut + 0.45, -300, ease.inCubic],
        ]),
      ),
      track(
        `s3-sv-${i}`,
        prop("y", [[0, y]]),
        prop("x", [
          [tIn + 0.25, 1900],
          [tIn + 0.95, S3_SERVICE_X, ease.outExpo],
          [tOut, S3_SERVICE_X],
          [tOut + 0.45, 1940, ease.inCubic],
        ]),
        prop("scale", [
          [T.s3Wires + 0.95 + i * 0.12, 1],
          [T.s3Wires + 1.07 + i * 0.12, 1.08, ease.outCubic],
          [T.s3Wires + 1.5 + i * 0.12, 1, ease.spring],
        ]),
      ),
    );
  });

  S3_BUBBLES.forEach((bubble, k) => {
    const y0 = S3_Y[bubble.channel];
    const arrive = bubble.start + 0.6;
    tracks.push(
      track(
        `s3-bubble-${k}`,
        prop("x", [
          [bubble.start, S3_CHANNEL_X + 160],
          [arrive, S3_CENTER.x, ease.inOutQuart],
        ]),
        prop("y", [
          [bubble.start, y0],
          [arrive, S3_ROW_Y(k), ease.inOutQuart],
        ]),
        prop("scale", [
          [bubble.start, 0.5],
          [arrive, 1, ease.inOutQuart],
        ]),
        from(bubble.start),
        until(arrive),
      ),
      track(
        `s3-row-${k}`,
        at(S3_CENTER.x, S3_ROW_Y(k)),
        wipe(arrive, 0.35),
        wipeOut(T.s3Exit + k * 0.04, 0.35),
      ),
    );
  });

  S3_Y.forEach((y, i) => {
    const t = T.s3Wires + i * 0.12;
    tracks.push(
      track(`s3-wire-${i}`, draw(t, 0.5), retract(T.s3Exit, 0.4)),
      track(
        `s3-pk-${i}`,
        prop("x", [
          [t + 0.35, S3_WIRE_X0],
          [t + 0.95, S3_WIRE_X1 + 10, ease.inOutQuart],
        ]),
        prop("y", [
          [t + 0.35, S3_CENTER.y],
          [t + 0.95, y, ease.inOutQuart],
        ]),
        from(t + 0.35),
        until(t + 0.95),
      ),
    );
  });
  tracks.push(
    track("s3-line", at(800, 800), wipe(T.s3Line, 0.7), widen(T.s3Line, 1.1), wipeOut(T.s3Exit + 0.1)),
  );
  return tracks;
}

/* ------------------------------------------------------------------ */
/* Scene 4: looks healthy, already broken, fixed at the choke point     */
/* ------------------------------------------------------------------ */

function scene4Tracks(): Track[] {
  const counted = T.counted;
  const out = T.s4aExit;
  const tracks: Track[] = [
    track(
      "s4-ecg",
      at(S4_ECG.x, S4_ECG.y),
      draw(T.ecgStart, T.ecgDur, ease.linear),
      retract(out, 0.9),
    ),
    track("s4-socket", at(330, 470), wipe(T.socket, 0.5), wipeOut(out)),
    track("s4-events-label", at(1320, 128), wipe(T.events, 0.5), wipeOut(out + 0.05)),
    track(
      "s4-count",
      at(1320, 196),
      wipe(T.count, 0.3),
      { at: T.count, count: 0 },
      { at: counted, count: 1204, ease: ease.outCubic },
      wipeOut(out + 0.1),
    ),
    track("s4-stalled", at(1320, 262), wipe(counted + 0.25, 0.35), wipeOut(out + 0.15)),
    track("s4-looks", at(800, 580), wipe(T.looks, 0.6), wipeOut(out)),
    track("s4-strike", at(800, 580), draw(T.strike, 0.3, ease.outCubic), retract(out, 0.45)),
    track("s4-broken", at(800, 725), wipe(T.broken, 0.4), wipeOut(out + 0.1)),
    // The choke point
    track("s4-out", draw(T.gateOpen + 0.6, 0.5), prop("draw", [[T.s4bExit, 1], [T.s4bExit + 0.45, 0, ease.inOutQuart]])),
    track("s4-out-on", draw(T.gateOpen + 1.2, 0.45), prop("draw", [[T.s4bExit, 1], [T.s4bExit + 0.45, 0, ease.inOutQuart]])),
    track("s4-fix", at(800, 815), wipe(T.fix, 0.6), widen(T.fix, 0.9), wipeOut(T.s4bExit)),
  ];
  S4_INCOMING.forEach((_, i) => {
    const t = T.gateOpen + i * 0.06;
    tracks.push(
      track(`s4-in-${i}`, draw(t, 0.6), retract(T.s4bExit + i * 0.03, 0.45)),
      track(
        `s4-in-on-${i}`,
        draw(T.gateOpen + 0.6 + i * 0.04, 0.45),
        retract(T.s4bExit + i * 0.03, 0.45),
      ),
    );
  });
  return tracks;
}

/* ------------------------------------------------------------------ */
/* Scene 5: echo field and the name                                     */
/* ------------------------------------------------------------------ */

function scene5Tracks(): Track[] {
  return [
    track(
      "s5-name",
      at(800, 420),
      wipe(T.name, 0.9),
      { at: T.name, stretch: 62, weight: 500 },
      { at: T.name + 1.2, stretch: 125, weight: 900, ease: ease.outExpo },
      wipeOut(T.clear + 0.2, 0.55),
    ),
    track(
      "s5-role",
      prop("x", [[0, 800]]),
      prop("y", [
        [T.role, 592],
        [T.role + 0.6, 566, ease.outExpo],
      ]),
      wipe(T.role, 0.6),
      wipeOut(T.clear + 0.1, 0.45),
    ),
    track("s5-tagline", at(800, 642), wipe(T.tagline, 0.7), wipeOut(T.clear, 0.45)),
    track(
      "s5-bar",
      at(S5_BAR.x, S5_BAR.y),
      wipe(T.bands, 0.6),
      { at: 0, opacity: 1 },
      until(T.unbar),
    ),
  ];
}

const GRID_COLS = 40;
const GRID_ROWS = 22;
const ECHO_RGB = [
  "#49c1f2",
  "#2cc257",
  "#f2d61c",
  "#ff9426",
  "#ff4048",
  "#d649cc",
];
const S5_START = T.echo;

/** Echo cells, revealed outward from where the signal sits. */
const GRID = (() => {
  const cells: Array<{
    c: number;
    r: number;
    band: number;
    appear: number;
    /** 0 at the centre, ~1 at the corners; the field folds back in by it. */
    d: number;
  }> = [];
  const cx = (S4_GATE.x / STAGE_W) * GRID_COLS - 0.5;
  const cy = (S4_GATE.y / STAGE_H) * GRID_ROWS - 0.5;
  const maxD = Math.hypot(GRID_COLS / 2, GRID_ROWS / 2);
  for (let r = 0; r < GRID_ROWS; r += 1) {
    for (let c = 0; c < GRID_COLS; c += 1) {
      const n = fbm(c * 0.17 + 2.3, r * 0.17 + 5.1);
      const intensity = Math.max(0, (n - 0.48) / 0.3);
      const band =
        intensity < 0.14
          ? -1
          : Math.min(5, Math.floor(((intensity - 0.14) / 0.86) * 6));
      const d = Math.hypot(c - cx, (r - cy) * 1.6) / maxD;
      const appear = S5_START + 0.15 + d * 1.1 + fbm(c, r) * 0.12;
      cells.push({ c, r, band, appear, d: Math.min(1, d) });
    }
  }
  return cells;
})();

export const reelLayers: CanvasLayer[] = [
  {
    id: "s5-echo",
    draw(ctx, t, w, h) {
      if (t < S5_START) return;
      const k = w / STAGE_W;
      const cw = w / GRID_COLS;
      const ch = h / GRID_ROWS;
      // Settle the field before the name lands on it.
      const dimFrom = T.name - 0.3;
      const dim = t > dimFrom ? 1 - Math.min(1, (t - dimFrom) / 0.7) * 0.82 : 1;
      for (const cell of GRID) {
        const p = Math.min(1, (t - cell.appear) / 0.45);
        if (p <= 0) continue;
        // Folding back: outer cells go first, the centre last.
        const fold = Math.min(
          1,
          Math.max(0, (t - (T.unbar + (1 - cell.d) * 1.1)) / 0.35),
        );
        if (fold >= 1) continue;
        const size = Math.max(
          0,
          Math.min(cw, ch) * 0.78 * ease.spring(p) * (1 - ease.inOutQuart(fold)),
        );
        ctx.globalAlpha = (cell.band < 0 ? 0.14 : 0.78) * dim;
        ctx.fillStyle = cell.band < 0 ? "#3a5260" : ECHO_RGB[cell.band];
        ctx.fillRect(
          cell.c * cw + (cw - size) / 2,
          cell.r * ch + (ch - size) / 2,
          size,
          size,
        );
      }
      // The sweep turns around the point the signal left from.
      const angle = (t - S5_START) * 1.4 - Math.PI / 2;
      const cx = (S4_GATE.x / STAGE_W) * w;
      const cy = (S4_GATE.y / STAGE_H) * h;
      ctx.globalAlpha = 0.5 * dim;
      ctx.strokeStyle = "#2cc257";
      ctx.lineWidth = 3 * k;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const reach =
        w * (1 - ease.inOutQuart(Math.min(1, Math.max(0, t - T.unbar))));
      ctx.lineTo(cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  },
];

export function buildTracks(): Track[] {
  return [
    ...scene1Tracks(),
    ...scene2Tracks(),
    ...scene3Tracks(),
    ...scene4Tracks(),
    ...scene5Tracks(),
    signalTrack(),
  ];
}

/* ------------------------------------------------------------------ */
/* Stage markup                                                        */
/* ------------------------------------------------------------------ */

/** Absolutely placed, centre-anchored element; the engine moves it. */
function El({
  id,
  className,
  style,
  children,
}: {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div data-reel={id} className={`reel-el ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

const text = (
  size: number,
  extra: React.CSSProperties = {},
): React.CSSProperties => ({
  fontSize: size,
  lineHeight: 1,
  whiteSpace: "nowrap",
  ...extra,
});

export function ReelStageMarkup({ copy }: { copy: ReelCopy }) {
  const node = (label: string) => (
    <div
      className="flex items-center justify-center rounded-[14px] border-2 font-bold"
      style={{
        width: S2_NODE.w,
        height: S2_NODE.h,
        borderColor: C.line,
        background: C.panel,
        ...text(54),
      }}
    >
      {label}
    </div>
  );
  const pill = (label: string, color: string) => (
    <div
      className="flex items-center gap-4 rounded-full border-2 px-7 font-semibold"
      style={{
        height: 84,
        borderColor: color,
        background: C.panel,
        ...text(46),
      }}
    >
      <span
        className="block size-4 rounded-full"
        style={{ background: color }}
      />
      {label}
    </div>
  );

  return (
    <>
      {/* Scene 1 */}
      <El id="s1-h" style={{ width: 1300, height: 2, background: C.line }} />
      <El id="s1-v" style={{ width: 2, height: 620, background: C.line }} />
      <El id="s1-rings">
        <svg
          width="640"
          height="640"
          viewBox="-320 -320 640 640"
          fill="none"
          stroke={C.line}
          strokeWidth="2"
        >
          <circle r="100" vectorEffect="non-scaling-stroke" />
          <circle r="200" vectorEffect="non-scaling-stroke" />
          <circle r="300" vectorEffect="non-scaling-stroke" />
        </svg>
      </El>
      <El id="s1-sweep">
        <svg width="640" height="640" viewBox="-320 -320 640 640">
          <path
            d="M0 0 L0 -310 A310 310 0 0 1 199.3 -237.5 Z"
            fill={C.e2}
            opacity="0.16"
          />
          <line x1="0" y1="0" x2="0" y2="-310" stroke={C.e2} strokeWidth="3" />
        </svg>
      </El>
      {S1_BLIPS.map((blip, k) => (
        <El
          key={k}
          id={`s1-blip-${k}`}
          style={{ width: 22, height: 22, background: blip.color }}
        />
      ))}
      <El id="s1-line" className="font-extrabold" style={text(132)}>
        {copy.s1.line}
      </El>
      <El id="s1-sub" style={text(58, { color: C.dim })}>
        {copy.s1.sub}
      </El>

      {/* Scene 2 */}
      <El id="s2-wire">
        <svg width="1140" height="8" viewBox="0 -4 1140 8" fill="none">
          <path d="M0 0 H1140" pathLength={1} stroke={C.line} strokeWidth="4" />
        </svg>
      </El>
      {copy.s2.nodes.map((label, i) => (
        <El key={label} id={`s2-node-${i}`}>
          {node(label)}
        </El>
      ))}
      {copy.s2.nodes.map((label, i) => (
        <El
          key={`hit-${label}`}
          id={`s2-hit-${i}`}
          className="rounded-[14px] border-2"
          style={{
            width: S2_NODE.w,
            height: S2_NODE.h,
            borderColor: C.e2,
            background: "color-mix(in oklab, var(--reel-e2) 20%, transparent)",
          }}
        />
      ))}
      <El id="s2-check">
        <svg width="72" height="58" viewBox="0 0 60 48" fill="none">
          <path
            d="M6 26 L22 40 L54 8"
            pathLength={1}
            stroke={C.e2}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </El>
      <El
        id="s2-checktext"
        className="font-semibold"
        style={text(46, { color: C.e2 })}
      >
        {copy.s2.check}
      </El>
      <El id="s2-line" className="font-extrabold" style={text(112)}>
        {copy.s2.line}
      </El>

      {/* Scene 3 */}
      {copy.s3.channels.map((label, i) => (
        <El key={label} id={`s3-ch-${i}`}>
          {pill(label, [C.e2, C.e3, C.e1][i])}
        </El>
      ))}
      {Array.from({ length: 6 }, (_, k) => (
        <El key={k} id={`s3-row-${k}`} style={{ zIndex: 6 }}>
          <div
            className="flex items-center gap-4 rounded-lg px-4"
            style={{ width: 340, height: 44, background: "var(--reel-row)" }}
          >
            <span
              className="block h-6 w-1.5 rounded-full"
              style={{ background: S3_BUBBLES[k].color }}
            />
            <span
              className="block h-3 rounded-full"
              style={{
                width: 120 + ((k * 53) % 110),
                background: C.dim,
                opacity: 0.6,
              }}
            />
          </div>
        </El>
      ))}
      {S3_BUBBLES.map((bubble, k) => (
        <El key={k} id={`s3-bubble-${k}`} style={{ zIndex: 6 }}>
          <div
            className="rounded-[22px] rounded-bl-md"
            style={{ width: 150, height: 50, background: bubble.color }}
          />
        </El>
      ))}
      {copy.s3.services.map((label, i) => (
        <El key={label} id={`s3-sv-${i}`}>
          {pill(label, C.e4)}
        </El>
      ))}
      <svg
        className="reel-el"
        data-anchor="none"
        style={{ left: 0, top: 0 }}
        width={STAGE_W}
        height={STAGE_H}
        fill="none"
      >
        {S3_Y.map((y, i) => (
          <path
            key={i}
            data-reel={`s3-wire-${i}`}
            d={`M ${S3_WIRE_X0} ${S3_CENTER.y} C ${S3_WIRE_X0 + 110} ${S3_CENTER.y}, ${S3_WIRE_X0 + 110} ${y}, ${S3_WIRE_X1} ${y}`}
            pathLength={1}
            stroke={C.line}
            strokeWidth="3"
          />
        ))}
      </svg>
      {S3_Y.map((_, i) => (
        <El
          key={i}
          id={`s3-pk-${i}`}
          className="rounded-full"
          style={{ width: 20, height: 20, background: C.e4 }}
        />
      ))}
      <El id="s3-line" className="font-extrabold" style={text(84)}>
        {copy.s3.line}
      </El>

      {/* Scene 4 */}
      <El id="s4-ecg">
        <svg width="1400" height="220" viewBox="-700 -110 1400 220" fill="none">
          <path
            d={ECG_PATH}
            pathLength={1}
            stroke={C.e2}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      </El>
      <El id="s4-socket">
        <div className="flex items-center gap-4 font-semibold" style={text(46)}>
          <span
            className="block size-5 rounded-full"
            style={{ background: C.e2 }}
          />
          {copy.s4.socket}
        </div>
      </El>
      <El id="s4-events-label" style={text(40, { color: C.dim })}>
        {copy.s4.events}
      </El>
      <El id="s4-count" className="font-extrabold tabular" style={text(96)}>
        0
      </El>
      <El
        id="s4-stalled"
        className="font-bold"
        style={text(46, { color: C.e5 })}
      >
        {copy.s4.stalled}
      </El>
      <El id="s4-looks" className="font-extrabold" style={text(124)}>
        {copy.s4.looks}
      </El>
      <El id="s4-strike">
        <svg width="760" height="16" viewBox="0 -8 760 16" fill="none">
          <path
            d="M0 0 H760"
            pathLength={1}
            stroke={C.e5}
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
      </El>
      <El
        id="s4-broken"
        className="font-extrabold"
        style={text(124, { color: C.e5 })}
      >
        {copy.s4.broken}
      </El>
      <svg
        className="reel-el"
        data-anchor="none"
        style={{ left: 0, top: 0 }}
        width={STAGE_W}
        height={STAGE_H}
        fill="none"
      >
        {S4_INCOMING.map((y, i) => {
          const d = `M 120 ${y} C 460 ${y}, 560 450, 770 450`;
          return (
            <g key={i}>
              <path
                data-reel={`s4-in-${i}`}
                d={d}
                pathLength={1}
                stroke={C.line}
                strokeWidth="3"
              />
              <path
                data-reel={`s4-in-on-${i}`}
                d={d}
                pathLength={1}
                stroke={C.e2}
                strokeWidth="3"
              />
            </g>
          );
        })}
        <path
          data-reel="s4-out"
          d="M 830 450 H 1480"
          pathLength={1}
          stroke={C.line}
          strokeWidth="5"
        />
        <path
          data-reel="s4-out-on"
          d="M 830 450 H 1480"
          pathLength={1}
          stroke={C.e2}
          strokeWidth="5"
        />
      </svg>
      <El id="s4-fix" className="font-extrabold" style={text(92)}>
        {copy.s4.fix}
      </El>

      {/* Scene 5 */}
      <El id="s5-name" style={text(196, { letterSpacing: "-0.03em" })}>
        Amo Feng
      </El>
      <El id="s5-role" className="font-semibold" style={text(60)}>
        {copy.s5.role}
      </El>
      <El id="s5-tagline" style={text(48, { color: C.dim, whiteSpace: "pre" })}>
        {copy.s5.tagline}
      </El>
      <El id="s5-bar" className="flex" style={{ width: 420, height: 12 }}>
        {[C.e1, C.e2, C.e3, C.e4, C.e5, C.e6].map((c) => (
          <span
            key={c}
            className="block h-full flex-1"
            style={{ background: c }}
          />
        ))}
      </El>

      {/* Scene 3's inbox header sits on top of the signal once it has opened. */}
      <El
        id="sig"
        className="reel-signal"
        style={{ width: 26, height: 26, borderRadius: 13, zIndex: 5 }}
      />
      <El id="s3-head" style={{ zIndex: 6 }}>
        <div
          className="flex items-center gap-3 border-b-2 px-7"
          style={{
            width: S3_INBOX.w,
            height: 70,
            borderColor: C.line,
            ...text(44),
          }}
        >
          <span
            className="block size-4 rounded-full"
            style={{ background: C.e2 }}
          />
          <span className="font-bold">{copy.s3.inbox}</span>
        </div>
      </El>
    </>
  );
}
