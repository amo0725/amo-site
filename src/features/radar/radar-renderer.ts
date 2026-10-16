import {
  BoxGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearSRGBColorSpace,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";
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

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export class RadarRenderer implements HeroRenderer {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(32, 1, 0.1, 100);
  private readonly material: ShaderMaterial;
  private readonly mesh: Mesh<InstancedBufferGeometry, ShaderMaterial>;
  private readonly budget: FrameBudget;

  private quality: RadarQuality;
  private frame = 0;
  private running = false;
  private lastTime = 0;
  private elapsed = 0;
  private revealStart = -1;

  private readonly pointerTarget = new Vector3(0, 0, 0);
  private readonly pointerCurrent = new Vector3(0, 0, 0);
  private readonly trail = Array.from(
    { length: TRAIL_LENGTH },
    () => new Vector3(),
  );
  private trailClock = 0;
  private trailCursor = 1;
  private readonly pings = Array.from(
    { length: PING_SLOTS },
    () => new Vector4(0, 0, 0, 0), // Vector4 defaults w to 1, which would fire a ping
  );
  private pingCursor = 0;

  private scrollTarget = 0;
  private scroll = 0;
  private readonly cameraLook = new Vector3(0, 0, 0.8);
  private readonly orbit = new Spherical();
  private readonly orbitNow = new Spherical();
  private readonly parallax = new Vector2();
  private readonly parallaxNow = new Vector2();

  constructor(canvas: HTMLCanvasElement, options: RadarRendererOptions) {
    this.quality = options.quality;

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: options.quality.antialias,
      powerPreference: "high-performance",
      stencil: false,
    });
    // Colours arrive as sRGB from CSS and must leave unchanged to match the page.
    this.renderer.outputColorSpace = LinearSRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);

    this.material = new ShaderMaterial({
      vertexShader: radarVertexShader,
      fragmentShader: radarFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSweep: { value: 0 },
        uReveal: { value: options.quality.animated ? 0 : 1 },
        uGrid: { value: new Vector2() },
        uWorld: { value: new Vector2(WORLD_WIDTH, WORLD_DEPTH) },
        uScroll: { value: 0 },
        uTrail: { value: [] as Vector3[] },
        uPings: { value: [] as Vector4[] },
        uPaper: { value: new Vector3() },
        uGraticule: { value: new Vector3() },
        uEcho1: { value: new Vector3() },
        uEcho2: { value: new Vector3() },
        uEcho3: { value: new Vector3() },
        uEcho4: { value: new Vector3() },
        uEcho5: { value: new Vector3() },
        uEcho6: { value: new Vector3() },
      },
    });

    this.material.uniforms.uTrail.value = this.trail;
    this.material.uniforms.uPings.value = this.pings;

    this.mesh = new Mesh(this.buildGeometry(options.quality), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    this.setPalette(options.palette);
    this.budget = new FrameBudget(1000 / 48, 90, () => options.onSlow?.());
  }

  /* ---------------- public API ---------------- */

  start(): void {
    if (this.running) return;
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
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, this.quality.maxDpr),
    );
    this.renderer.setSize(width, height, false);
    this.frameCamera(width / height);
    if (!this.running) this.render();
  }

  setPointer(x: number, y: number): void {
    if (!this.quality.animated) return;
    const hit = this.projectToGround(x, y);
    if (hit) this.pointerTarget.set(hit.x, hit.y, 1);
    this.parallax.set(x, y);
  }

  releasePointer(): void {
    this.pointerTarget.z = 0;
    this.parallax.set(0, 0);
  }

  ping(x: number, y: number): void {
    if (!this.quality.animated) return;
    const hit = this.projectToGround(x, y);
    if (!hit) return;
    this.pings[this.pingCursor].set(hit.x, hit.y, this.elapsed, 1);
    this.pingCursor = (this.pingCursor + 1) % PING_SLOTS;
  }

  setScroll(progress: number): void {
    this.scrollTarget = Math.min(1, Math.max(0, progress));
  }

  setPalette(palette: RadarPalette): void {
    const u = this.material.uniforms;
    u.uPaper.value.fromArray(palette.paper);
    u.uGraticule.value.fromArray(palette.graticule);
    palette.echoes.forEach((rgb, i) => u[`uEcho${i + 1}`].value.fromArray(rgb));
    if (!this.running) this.render();
  }

  setQuality(quality: RadarQuality): void {
    if (
      quality.cols !== this.quality.cols ||
      quality.rows !== this.quality.rows
    ) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = this.buildGeometry(quality);
    }
    this.quality = quality;
    if (!quality.animated) {
      this.stop();
      this.material.uniforms.uReveal.value = 1;
      this.releasePointer();
      this.trail.forEach((t) => t.set(0, 0, 0));
      this.pings.forEach((g) => g.set(0, 0, 0, 0));
      this.scroll = this.scrollTarget = 0;
      this.material.uniforms.uScroll.value = 0;
    }
    const { width, height } = this.renderer.domElement;
    const dpr = this.renderer.getPixelRatio();
    this.resize(width / dpr, height / dpr);
  }

  dispose(): void {
    this.stop();
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }

  /* ---------------- internals ---------------- */

  private readonly tick = (now: number) => {
    if (!this.running) return;
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.budget.sample(delta);

    // rAF timestamps can precede the performance.now() taken in start().
    const dt = Math.max(0, Math.min(delta, 64)) / 1000;
    this.elapsed += dt;

    const u = this.material.uniforms;
    u.uTime.value = this.elapsed;
    u.uSweep.value = (this.elapsed * SWEEP_SPEED) % (Math.PI * 2);
    u.uReveal.value = easeOutCubic(
      Math.min(1, Math.max(0, (now - this.revealStart) / REVEAL_MS)),
    );

    // Critically damped follow for the pointer storm, parallax and scroll.
    const follow = 1 - Math.exp(-dt * 6);
    this.pointerCurrent.lerp(this.pointerTarget, follow);
    this.updateTrail(dt);
    this.parallaxNow.lerp(this.parallax, 1 - Math.exp(-dt * 3));
    this.scroll += (this.scrollTarget - this.scroll) * (1 - Math.exp(-dt * 8));
    u.uScroll.value = this.scroll;

    this.placeCamera(u.uReveal.value);

    this.render();
    this.frame = requestAnimationFrame(this.tick);
  };

  /** Head of the trail follows the pointer; older samples fade where they were left. */
  private updateTrail(dt: number): void {
    const [head] = this.trail;
    head.copy(this.pointerCurrent);
    const decay = Math.exp(-dt * 1.4);
    for (let i = 1; i < TRAIL_LENGTH; i += 1) this.trail[i].z *= decay;

    // Leave a sample behind only once the pointer has actually travelled.
    this.trailClock += dt;
    const previous =
      this.trail[
        this.trailCursor === 1 ? TRAIL_LENGTH - 1 : this.trailCursor - 1
      ];
    const travelled = Math.hypot(head.x - previous.x, head.y - previous.y);
    if (this.trailClock >= TRAIL_INTERVAL && head.z > 0.05 && travelled > 0.6) {
      this.trailClock = 0;
      this.trail[this.trailCursor].set(head.x, head.y, head.z * 0.55);
      this.trailCursor =
        this.trailCursor + 1 >= TRAIL_LENGTH ? 1 : this.trailCursor + 1;
    }
  }

  /**
   * Orbit camera: on load it swings in from the side and a little further
   * out; on scroll it climbs toward a top-down view and keeps turning.
   */
  private placeCamera(reveal: number): void {
    const intro = 1 - reveal;
    const o = this.orbitNow.copy(this.orbit);
    o.radius *= 1 + intro * 0.55 + this.scroll * 0.12;
    o.theta += -0.85 * intro + this.scroll * 0.7 + this.parallaxNow.x * 0.08;
    o.phi = Math.max(
      0.12,
      o.phi * (1 - this.scroll * 0.72) - this.parallaxNow.y * 0.05,
    );
    this.camera.position.setFromSpherical(o).add(this.cameraLook);
    this.camera.lookAt(this.cameraLook);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private buildGeometry({ cols, rows }: RadarQuality): InstancedBufferGeometry {
    const box = new BoxGeometry(1, 1, 1);
    const geometry = new InstancedBufferGeometry();
    geometry.index = box.index;
    geometry.setAttribute("position", box.getAttribute("position"));
    geometry.setAttribute("normal", box.getAttribute("normal"));

    const cells = new Float32Array(cols * rows * 2);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const i = (row * cols + col) * 2;
        cells[i] = col;
        cells[i + 1] = row;
      }
    }
    geometry.setAttribute("aCell", new InstancedBufferAttribute(cells, 2));
    geometry.instanceCount = cols * rows;
    this.material.uniforms.uGrid.value.set(cols, rows);
    return geometry;
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
    this.camera.aspect = aspect;
    this.camera.fov = tall
      ? Math.max(30, (2 * Math.atan(TALL_HALF_WIDTH / aspect) * 180) / Math.PI)
      : 30;
    this.camera.updateProjectionMatrix();
    const base = tall ? new Vector3(0, 8.8, 11.8) : new Vector3(0, 9.2, 13.5);
    // Looking slightly left of centre puts the storm right of the panel's
    // middle, away from the copy and off the screen edge.
    this.cameraLook.set(tall ? -0.5 : 0, 0, tall ? 0.9 : 1.1);
    this.orbit.setFromVector3(base.sub(this.cameraLook));
    this.placeCamera(this.material.uniforms.uReveal.value);
  }

  private readonly ray = new Vector3();
  private projectToGround(x: number, y: number): Vector2 | null {
    this.ray
      .set(x, y, 0.5)
      .unproject(this.camera)
      .sub(this.camera.position)
      .normalize();
    if (Math.abs(this.ray.y) < 1e-4) return null;
    const t = -this.camera.position.y / this.ray.y;
    if (t < 0) return null;
    return new Vector2(
      this.camera.position.x + this.ray.x * t,
      this.camera.position.z + this.ray.z * t,
    );
  }
}
