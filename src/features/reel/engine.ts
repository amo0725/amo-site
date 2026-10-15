/**
 * A tiny keyframe timeline, in the spirit of a compositor's tracks.
 *
 * Every visual property is a pure function of time, so the reel can be
 * played, paused and scrubbed to any frame with identical results. Each
 * frame writes styles straight to the DOM; React never re-renders.
 */

export type Easing = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  outCubic: (t: number) => 1 - (1 - t) ** 3,
  inCubic: (t: number) => t ** 3,
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  inOutQuart: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  /**
   * Closed-form damped spring, normalised to settle at t = 1. Damping is
   * high on purpose: a few percent of overshoot at most, never a bounce.
   */
  spring: (t: number) => {
    if (t >= 1) return 1;
    const zeta = 0.78;
    const omega = 11;
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega * t);
    return 1 - decay * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
  },
} satisfies Record<string, Easing>;

/** Animatable properties. Positions are in stage units (1600 × 900). */
export interface Props {
  x: number;
  y: number;
  scale: number;
  sx: number;
  sy: number;
  rotate: number;
  opacity: number;
  /** font-stretch, percent */
  stretch: number;
  /** font-weight */
  weight: number;
  /** box size in stage px, for elements that change shape */
  w: number;
  h: number;
  /** border-radius in stage px */
  radius: number;
  /** 0–1, written to --mix (fill colour blend) */
  mix: number;
  /** 0–1, written to --edge (border colour blend) */
  edge: number;
  /** 0–1 end of the visible stroke, for SVG shapes with pathLength="1" */
  draw: number;
  /** 0–1 start of the visible stroke: erases from the path's start */
  trim: number;
  /** 0–1 reveal from the left edge */
  clip: number;
  /** 0–1 hide from the left edge (the exit that follows a reveal) */
  clipL: number;
  /** numeric text content, e.g. a counter */
  count: number;
}

export type PropName = keyof Props;

export interface Key extends Partial<Props> {
  /** seconds */
  at: number;
  /** easing into this key from the previous one */
  ease?: Easing;
}

export interface Track {
  /** matches data-reel="…" on an element inside the stage */
  id: string;
  keys: Key[];
}

/** Imperative drawing for things too numerous for DOM nodes. */
export interface CanvasLayer {
  id: string;
  draw: (
    ctx: CanvasRenderingContext2D,
    t: number,
    width: number,
    height: number,
  ) => void;
}

interface Segment {
  at: number;
  value: number;
  ease: Easing;
}

interface CompiledTrack {
  el: HTMLElement | SVGElement;
  props: Partial<Record<PropName, Segment[]>>;
  centered: boolean;
  format?: Intl.NumberFormat;
}

const TRANSFORM_PROPS: PropName[] = ["x", "y", "scale", "sx", "sy", "rotate"];

function sample(segments: Segment[], t: number): number {
  if (t <= segments[0].at) return segments[0].value;
  const last = segments[segments.length - 1];
  if (t >= last.at) return last.value;
  for (let i = 1; i < segments.length; i += 1) {
    const b = segments[i];
    if (t <= b.at) {
      const a = segments[i - 1];
      const span = b.at - a.at || 1;
      return a.value + (b.value - a.value) * b.ease((t - a.at) / span);
    }
  }
  return last.value;
}

function compile(root: HTMLElement, track: Track): CompiledTrack | null {
  const el = root.querySelector<HTMLElement | SVGElement>(
    `[data-reel="${track.id}"]`,
  );
  if (!el) return null;
  const props: CompiledTrack["props"] = {};
  const keys = [...track.keys].sort((a, b) => a.at - b.at);
  for (const key of keys) {
    for (const name of Object.keys(key) as Array<keyof Key>) {
      if (name === "at" || name === "ease") continue;
      const value = key[name];
      if (typeof value !== "number") continue;
      (props[name] ??= []).push({
        at: key.at,
        value,
        ease: key.ease ?? ease.outCubic,
      });
    }
  }
  const format = props.count ? new Intl.NumberFormat("en-US") : undefined;
  return { el, props, centered: el.dataset.anchor !== "none", format };
}

function apply(track: CompiledTrack, t: number) {
  const { el, props } = track;
  const v = (name: PropName, fallback: number) => {
    const segs = props[name];
    return segs ? sample(segs, t) : fallback;
  };
  const style = el.style;

  if (TRANSFORM_PROPS.some((p) => props[p])) {
    const scale = v("scale", 1);
    const center = track.centered ? " translate(-50%, -50%)" : "";
    style.transform =
      `translate(${v("x", 0).toFixed(2)}px, ${v("y", 0).toFixed(2)}px)${center}` +
      ` rotate(${v("rotate", 0).toFixed(2)}deg) scale(${(v("sx", 1) * scale).toFixed(4)}, ${(v("sy", 1) * scale).toFixed(4)})`;
  }
  if (props.opacity) {
    const o = v("opacity", 1);
    style.opacity = o.toFixed(3);
    style.visibility = o <= 0.001 ? "hidden" : "visible";
  }
  if (props.stretch) style.fontStretch = `${v("stretch", 100).toFixed(1)}%`;
  if (props.weight) style.fontWeight = v("weight", 400).toFixed(0);
  if (props.w) style.width = `${v("w", 0).toFixed(2)}px`;
  if (props.h) style.height = `${v("h", 0).toFixed(2)}px`;
  if (props.radius) style.borderRadius = `${v("radius", 0).toFixed(2)}px`;
  if (props.mix) style.setProperty("--mix", v("mix", 0).toFixed(4));
  if (props.edge) style.setProperty("--edge", v("edge", 0).toFixed(4));
  if (props.draw || props.trim) {
    const start = v("trim", 0);
    const end = v("draw", 1);
    const len = Math.max(0, end - start);
    style.strokeDasharray = `${len.toFixed(4)} 2`;
    style.strokeDashoffset = (-start).toFixed(4);
    style.visibility = len <= 0.0005 ? "hidden" : "visible";
  }
  if (props.clip || props.clipL) {
    const right = (1 - v("clip", 1)) * 100;
    const left = v("clipL", 0) * 100;
    style.clipPath = `inset(-20% ${right.toFixed(2)}% -20% ${left.toFixed(2)}%)`;
  }
  if (props.count && track.format)
    el.textContent = track.format.format(Math.round(v("count", 0)));
}

export interface TimelineOptions {
  root: HTMLElement;
  canvas?: HTMLCanvasElement | null;
  tracks: Track[];
  layers?: CanvasLayer[];
  duration: number;
  onFrame?: (t: number) => void;
  onEnd?: () => void;
}

export class Timeline {
  readonly duration: number;
  private readonly compiled: CompiledTrack[];
  private readonly layers: CanvasLayer[];
  private readonly canvas: HTMLCanvasElement | null;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly onFrame?: (t: number) => void;
  private readonly onEnd?: () => void;
  private time = 0;
  private playing = false;
  private frame = 0;
  private last = 0;

  constructor(options: TimelineOptions) {
    this.duration = options.duration;
    this.compiled = options.tracks
      .map((track) => compile(options.root, track))
      .filter((t): t is CompiledTrack => t !== null);
    this.layers = options.layers ?? [];
    this.canvas = options.canvas ?? null;
    this.ctx = this.canvas?.getContext("2d") ?? null;
    this.onFrame = options.onFrame;
    this.onEnd = options.onEnd;
  }

  get currentTime(): number {
    return this.time;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  seek(t: number): void {
    this.time = Math.min(this.duration, Math.max(0, t));
    this.render();
  }

  play(): void {
    if (this.playing) return;
    if (this.time >= this.duration) this.time = 0;
    this.playing = true;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.frame);
  }

  dispose(): void {
    this.pause();
  }

  private readonly tick = (now: number) => {
    if (!this.playing) return;
    // Clamp long gaps (tab switches) so the reel never jumps a whole scene.
    this.time += Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (this.time >= this.duration) {
      this.time = this.duration;
      this.render();
      this.playing = false;
      this.onEnd?.();
      return;
    }
    this.render();
    this.frame = requestAnimationFrame(this.tick);
  };

  private render(): void {
    for (const track of this.compiled) apply(track, this.time);
    if (this.ctx && this.canvas) {
      const { width, height } = this.canvas;
      this.ctx.clearRect(0, 0, width, height);
      for (const layer of this.layers)
        layer.draw(this.ctx, this.time, width, height);
    }
    this.onFrame?.(this.time);
  }
}
