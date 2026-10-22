import { FrameBudget } from "./frame-budget";
import type { RadarPalette } from "./palette";
import type { RadarQuality } from "./quality";
import {
  PING_SLOTS,
  TRAIL_LENGTH,
  radarFragmentShader,
  radarVertexShader,
} from "./shaders";

/** The contract the hero wrapper depends on. Any visual that satisfies it can replace the radar. */
export interface HeroRenderer {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  /** Pointer in normalised device coordinates (-1…1). */
  setPointer(x: number, y: number): void;
  releasePointer(): void;
  /** Sends an expanding ring out from a point (normalised device coordinates). */
  ping(x: number, y: number): void;
  /** 0 while the hero is fully in view, 1 once it has scrolled away. */
  setScroll(progress: number): void;
  setPalette(palette: RadarPalette): void;
  setQuality(quality: RadarQuality): void;
  dispose(): void;
}

export interface RadarRendererOptions {
  quality: RadarQuality;
  palette: RadarPalette;
  /** Called when the device keeps missing its frame budget at the current quality. */
  onSlow?: () => void;
}

const WORLD_WIDTH = 16;
const WORLD_DEPTH = 10;
/** tan(half horizontal FOV) a tall frame keeps: what a 30° lens gives at 3:4. */
const TALL_HALF_WIDTH = 0.75 * Math.tan((15 * Math.PI) / 180);
const REVEAL_MS = 2200;
const SWEEP_SPEED = 0.85; // radians per second
const TRAIL_INTERVAL = 0.07; // seconds between pointer trail samples
const NEAR = 0.1;
const FAR = 100;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/* ---------------- a little vector maths ---------------- */

type Vec3 = [number, number, number];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Spherical coordinates around the look-at point, as three.js defines them. */
interface Spherical {
  radius: number;
  /** Polar angle from +Y. */
  phi: number;
  /** Azimuth around +Y, measured from +Z. */
  theta: number;
}

const toSpherical = ([x, y, z]: Vec3): Spherical => {
  const radius = Math.hypot(x, y, z);
  return radius === 0
    ? { radius: 0, phi: 0, theta: 0 }
    : {
        radius,
        theta: Math.atan2(x, z),
        phi: Math.acos(Math.min(1, Math.max(-1, y / radius))),
      };
};

const fromSpherical = ({ radius, phi, theta }: Spherical): Vec3 => {
  const s = Math.sin(phi) * radius;
  return [s * Math.sin(theta), Math.cos(phi) * radius, s * Math.cos(theta)];
};

/* ---------------- geometry: one unit box, drawn once per cell ---------------- */

/**
 * A unit cube centred on the origin: 24 vertices (flat normals per face)
 * and 36 indices, counter-clockwise from outside.
 */
function unitBox() {
  // For each face: its normal n and two edge directions u, v with u × v = n.
  const faces: Array<[Vec3, Vec3, Vec3]> = [
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
    [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
  ];
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const corners: Array<[number, number]> = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  faces.forEach(([n, u, v], face) => {
    for (const [a, b] of corners) {
      for (let k = 0; k < 3; k += 1) {
        positions.push(0.5 * (n[k] + a * u[k] + b * v[k]));
      }
      normals.push(...n);
    }
    const o = face * 4;
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}

/* ---------------- shaders ---------------- */

/** What three.js's ShaderMaterial would have put in front of the shared sources. */
const VERTEX_PRELUDE = `precision highp float;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec3 normal;
`;
const FRAGMENT_PRELUDE = `precision highp float;
`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create a shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Radar shader failed to compile: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext) {
  const program = gl.createProgram();
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_PRELUDE + radarVertexShader);
  const fragment = compile(
    gl,
    gl.FRAGMENT_SHADER,
    FRAGMENT_PRELUDE + radarFragmentShader,
  );
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Radar shaders failed to link: ${log}`);
  }
  return program;
}

const UNIFORMS = [
  "projectionMatrix",
  "modelViewMatrix",
  "uTime",
  "uSweep",
  "uReveal",
  "uGrid",
  "uWorld",
  "uScroll",
  "uTrail",
  "uPings",
  "uPaper",
  "uGraticule",
  "uEcho1",
  "uEcho2",
  "uEcho3",
  "uEcho4",
  "uEcho5",
  "uEcho6",
] as const;
type UniformName = (typeof UNIFORMS)[number];

/**
 * The radar field in plain WebGL2: one program, one unit box drawn once per
 * cell (instanced), a perspective camera on an orbit. Everything that
 * moves is computed in the vertex shader; per frame the CPU sets a dozen
 * uniforms and issues one draw call. (It used to run on three.js, about
 * 130 KB of compressed script for what is one material on one mesh.)
 */
export class RadarRenderer implements HeroRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly uniforms: Record<UniformName, WebGLUniformLocation | null>;
  private readonly vao: WebGLVertexArrayObject;
  private readonly buffers: WebGLBuffer[] = [];
  private readonly cellBuffer: WebGLBuffer;
  private readonly indexCount: number;
  private readonly budget: FrameBudget;

  private quality: RadarQuality;
  private instances = 0;
  private dpr = 1;
  private lost = false;
  private frame = 0;
  private running = false;
  private lastTime = 0;
  private elapsed = 0;
  private revealStart = -1;
  private reveal: number;

  private readonly pointerTarget: Vec3 = [0, 0, 0];
  private readonly pointerCurrent: Vec3 = [0, 0, 0];
  /** Pointer storm and its recent path: x, z, strength per sample. */
  private readonly trail = new Float32Array(TRAIL_LENGTH * 3);
  private trailClock = 0;
  private trailCursor = 1;
  /** Click pings: x, z, birth time, strength per slot. */
  private readonly pings = new Float32Array(PING_SLOTS * 4);
  private pingCursor = 0;

  private scrollTarget = 0;
  private scroll = 0;
  private aspect = 1;
  private fov = 30;
  private cameraLook: Vec3 = [0, 0, 0.8];
  private orbit: Spherical = { radius: 1, phi: 0, theta: 0 };
  private readonly parallax: [number, number] = [0, 0];
  private readonly parallaxNow: [number, number] = [0, 0];
  /** Camera position and basis, kept for picking (projectToGround). */
  private eye: Vec3 = [0, 0, 1];
  private basis: [Vec3, Vec3, Vec3] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  private readonly projection = new Float32Array(16);
  private readonly view = new Float32Array(16);

  constructor(canvas: HTMLCanvasElement, options: RadarRendererOptions) {
    this.canvas = canvas;
    this.quality = options.quality;
    this.reveal = options.quality.animated ? 0 : 1;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: options.quality.antialias,
      depth: true,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;

    this.program = link(gl);
    this.uniforms = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl.getUniformLocation(this.program, name)]),
    ) as Record<UniformName, WebGLUniformLocation | null>;

    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Could not create a vertex array");
    this.vao = vao;
    gl.bindVertexArray(vao);

    const box = unitBox();
    this.indexCount = box.indices.length;
    this.attribute("position", box.positions, 3);
    this.attribute("normal", box.normals, 3);
    this.buffer(gl.ELEMENT_ARRAY_BUFFER, box.indices);

    const cells = gl.createBuffer();
    if (!cells) throw new Error("Could not create a buffer");
    this.cellBuffer = cells;
    this.buffers.push(cells);
    const aCell = gl.getAttribLocation(this.program, "aCell");
    gl.bindBuffer(gl.ARRAY_BUFFER, cells);
    gl.enableVertexAttribArray(aCell);
    gl.vertexAttribPointer(aCell, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(aCell, 1);
    gl.bindVertexArray(null);
    this.setCells(options.quality);

    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.uWorld, WORLD_WIDTH, WORLD_DEPTH);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);

    canvas.addEventListener("webglcontextlost", this.onContextLost);

    this.setPalette(options.palette);
    this.budget = new FrameBudget(1000 / 48, 90, () => options.onSlow?.());
  }

  /* ---------------- public API ---------------- */

  start(): void {
    if (this.running || this.lost) return;
    if (!this.quality.animated) {
      this.render();
      return;
    }
    this.running = true;
    this.lastTime = performance.now();
    if (this.revealStart < 0) this.revealStart = this.lastTime;
    this.frame = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  resize(width: number, height: number): void {
    if (width === 0 || height === 0) return;
    this.dpr = Math.min(window.devicePixelRatio, this.quality.maxDpr);
    this.canvas.width = Math.floor(width * this.dpr);
    this.canvas.height = Math.floor(height * this.dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.frameCamera(width / height);
    if (!this.running) this.render();
  }

  setPointer(x: number, y: number): void {
    if (!this.quality.animated) return;
    const hit = this.projectToGround(x, y);
    if (hit) {
      this.pointerTarget[0] = hit[0];
      this.pointerTarget[1] = hit[1];
      this.pointerTarget[2] = 1;
    }
    this.parallax[0] = x;
    this.parallax[1] = y;
  }

  releasePointer(): void {
    this.pointerTarget[2] = 0;
    this.parallax[0] = 0;
    this.parallax[1] = 0;
  }

  ping(x: number, y: number): void {
    if (!this.quality.animated) return;
    const hit = this.projectToGround(x, y);
    if (!hit) return;
    this.pings.set([hit[0], hit[1], this.elapsed, 1], this.pingCursor * 4);
    this.pingCursor = (this.pingCursor + 1) % PING_SLOTS;
  }

  setScroll(progress: number): void {
    this.scrollTarget = Math.min(1, Math.max(0, progress));
  }

  setPalette(palette: RadarPalette): void {
    const { gl, uniforms: u } = this;
    gl.useProgram(this.program);
    gl.uniform3fv(u.uPaper, palette.paper);
    gl.uniform3fv(u.uGraticule, palette.graticule);
    const echoes = [u.uEcho1, u.uEcho2, u.uEcho3, u.uEcho4, u.uEcho5, u.uEcho6];
    palette.echoes.forEach((rgb, i) => gl.uniform3fv(echoes[i], rgb));
    if (!this.running) this.render();
  }

  setQuality(quality: RadarQuality): void {
    if (
      quality.cols !== this.quality.cols ||
      quality.rows !== this.quality.rows
    ) {
      this.setCells(quality);
    }
    this.quality = quality;
    if (!quality.animated) {
      this.stop();
      this.reveal = 1;
      this.releasePointer();
      this.trail.fill(0);
      this.pings.fill(0);
      this.pointerCurrent.fill(0);
      this.scroll = this.scrollTarget = 0;
    }
    this.resize(this.canvas.width / this.dpr, this.canvas.height / this.dpr);
  }

  dispose(): void {
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    const { gl } = this;
    this.buffers.forEach((b) => gl.deleteBuffer(b));
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }

  /* ---------------- internals ---------------- */

  private readonly onContextLost = (event: Event) => {
    event.preventDefault();
    this.lost = true;
    this.stop();
  };

  private buffer(target: number, data: ArrayBufferView) {
    const { gl } = this;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Could not create a buffer");
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    this.buffers.push(buffer);
    return buffer;
  }

  private attribute(name: string, data: Float32Array, size: number) {
    const { gl } = this;
    this.buffer(gl.ARRAY_BUFFER, data);
    const location = gl.getAttribLocation(this.program, name);
    if (location < 0) return;
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  /** One (column, row) pair per instance. */
  private setCells({ cols, rows }: RadarQuality): void {
    const { gl } = this;
    const cells = new Float32Array(cols * rows * 2);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const i = (row * cols + col) * 2;
        cells[i] = col;
        cells[i + 1] = row;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cellBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cells, gl.STATIC_DRAW);
    this.instances = cols * rows;
    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.uGrid, cols, rows);
  }

  private readonly tick = (now: number) => {
    if (!this.running) return;
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.budget.sample(delta);

    // rAF timestamps can precede the performance.now() taken in start().
    const dt = Math.max(0, Math.min(delta, 64)) / 1000;
    this.elapsed += dt;

    this.reveal = easeOutCubic(
      Math.min(1, Math.max(0, (now - this.revealStart) / REVEAL_MS)),
    );

    // Critically damped follow for the pointer storm, parallax and scroll.
    const follow = 1 - Math.exp(-dt * 6);
    for (let k = 0; k < 3; k += 1) {
      this.pointerCurrent[k] = lerp(
        this.pointerCurrent[k],
        this.pointerTarget[k],
        follow,
      );
    }
    this.updateTrail(dt);
    const ease = 1 - Math.exp(-dt * 3);
    this.parallaxNow[0] = lerp(this.parallaxNow[0], this.parallax[0], ease);
    this.parallaxNow[1] = lerp(this.parallaxNow[1], this.parallax[1], ease);
    this.scroll += (this.scrollTarget - this.scroll) * (1 - Math.exp(-dt * 8));

    this.placeCamera();
    this.render();
    this.frame = requestAnimationFrame(this.tick);
  };

  /** Head of the trail follows the pointer; older samples fade where they were left. */
  private updateTrail(dt: number): void {
    const t = this.trail;
    t[0] = this.pointerCurrent[0];
    t[1] = this.pointerCurrent[1];
    t[2] = this.pointerCurrent[2];
    const decay = Math.exp(-dt * 1.4);
    for (let i = 1; i < TRAIL_LENGTH; i += 1) t[i * 3 + 2] *= decay;

    // Leave a sample behind only once the pointer has actually travelled.
    this.trailClock += dt;
    const previous =
      (this.trailCursor === 1 ? TRAIL_LENGTH - 1 : this.trailCursor - 1) * 3;
    const travelled = Math.hypot(t[0] - t[previous], t[1] - t[previous + 1]);
    if (this.trailClock >= TRAIL_INTERVAL && t[2] > 0.05 && travelled > 0.6) {
      this.trailClock = 0;
      t.set([t[0], t[1], t[2] * 0.55], this.trailCursor * 3);
      this.trailCursor =
        this.trailCursor + 1 >= TRAIL_LENGTH ? 1 : this.trailCursor + 1;
    }
  }

  /**
   * Orbit camera: on load it swings in from the side and a little further
   * out; on scroll it climbs toward a top-down view and keeps turning.
   */
  private placeCamera(): void {
    const intro = 1 - this.reveal;
    const radius = this.orbit.radius * (1 + intro * 0.55 + this.scroll * 0.12);
    const theta =
      this.orbit.theta +
      -0.85 * intro +
      this.scroll * 0.7 +
      this.parallaxNow[0] * 0.08;
    const phi = Math.max(
      0.12,
      this.orbit.phi * (1 - this.scroll * 0.72) - this.parallaxNow[1] * 0.05,
    );
    const offset = fromSpherical({ radius, phi, theta });
    const look = this.cameraLook;
    const eye: Vec3 = [look[0] + offset[0], look[1] + offset[1], look[2] + offset[2]];

    // Look at the target with +Y up: the camera's -Z points at it.
    const z = normalize(sub(eye, look));
    const x = normalize(cross([0, 1, 0], z));
    const y = cross(z, x);
    this.eye = eye;
    this.basis = [x, y, z];

    // The view matrix is the camera's inverse: the basis transposed, and
    // the eye moved to the origin (column-major).
    // prettier-ignore
    this.view.set([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
    ]);
  }

  private setProjection(): void {
    const f = 1 / Math.tan((this.fov * Math.PI) / 360);
    const range = 1 / (NEAR - FAR);
    // prettier-ignore
    this.projection.set([
      f / this.aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (FAR + NEAR) * range, -1,
      0, 0, 2 * FAR * NEAR * range, 0,
    ]);
  }

  private render(): void {
    if (this.lost) return;
    const { gl, uniforms: u } = this;
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(u.projectionMatrix, false, this.projection);
    gl.uniformMatrix4fv(u.modelViewMatrix, false, this.view);
    gl.uniform1f(u.uTime, this.elapsed);
    gl.uniform1f(u.uSweep, (this.elapsed * SWEEP_SPEED) % (Math.PI * 2));
    gl.uniform1f(u.uReveal, this.reveal);
    gl.uniform1f(u.uScroll, this.scroll);
    gl.uniform3fv(u.uTrail, this.trail);
    gl.uniform4fv(u.uPings, this.pings);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindVertexArray(this.vao);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      this.indexCount,
      gl.UNSIGNED_SHORT,
      0,
      this.instances,
    );
    gl.bindVertexArray(null);
  }

  /**
   * Wide frames (the band above the copy on phones and tablets) look across
   * the whole scope. Tall frames (the desktop panel beside the copy) move in
   * close on the storm so it fills the panel and runs off its edges; the
   * vertical field of view opens up on very tall panels so the frame never
   * narrows to a sliver.
   */
  private frameCamera(aspect: number): void {
    const tall = aspect < 1;
    this.aspect = aspect;
    this.fov = tall
      ? Math.max(30, (2 * Math.atan(TALL_HALF_WIDTH / aspect) * 180) / Math.PI)
      : 30;
    this.setProjection();
    const base: Vec3 = tall ? [0, 8.8, 11.8] : [0, 9.2, 13.5];
    // Looking slightly left of centre puts the storm right of the panel's
    // middle, away from the copy and off the screen edge.
    this.cameraLook = [tall ? -0.5 : 0, 0, tall ? 0.9 : 1.1];
    this.orbit = toSpherical(sub(base, this.cameraLook));
    this.placeCamera();
  }

  /** Where a ray through a point on screen meets the ground (y = 0): x, z. */
  private projectToGround(x: number, y: number): [number, number] | null {
    // The ray's direction in camera space, then in the world.
    const f = 1 / Math.tan((this.fov * Math.PI) / 360);
    const local: Vec3 = [x * (this.aspect / f), y / f, -1];
    const [bx, by, bz] = this.basis;
    const ray = normalize([
      bx[0] * local[0] + by[0] * local[1] + bz[0] * local[2],
      bx[1] * local[0] + by[1] * local[1] + bz[1] * local[2],
      bx[2] * local[0] + by[2] * local[1] + bz[2] * local[2],
    ]);
    if (Math.abs(ray[1]) < 1e-4) return null;
    const t = -this.eye[1] / ray[1];
    if (t < 0) return null;
    return [this.eye[0] + ray[0] * t, this.eye[2] + ray[2] * t];
  }
}
