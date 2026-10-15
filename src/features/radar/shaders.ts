/**
 * Radar echo field. Every cell is one instance of a unit box; all height,
 * colour and motion is computed on the GPU, so the CPU only updates a
 * handful of uniforms per frame.
 */

// 2D simplex noise — Ian McEwan / Ashima Arts (MIT).
const simplex = /* glsl */ `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

export const TRAIL_LENGTH = 6;
export const PING_SLOTS = 4;

export const radarVertexShader = /* glsl */ `
#define TRAIL ${TRAIL_LENGTH}
#define PINGS ${PING_SLOTS}

uniform float uTime;
uniform float uSweep;
uniform float uReveal;
uniform float uScroll;       // 0 at rest, 1 when the hero has scrolled away
uniform vec2 uGrid;
uniform vec2 uWorld;
uniform vec3 uTrail[TRAIL];  // pointer storm and its recent path: x, z, strength
uniform vec4 uPings[PINGS];  // click pings: x, z, birth time, strength
uniform vec3 uGraticule;
uniform vec3 uEcho1;
uniform vec3 uEcho2;
uniform vec3 uEcho3;
uniform vec3 uEcho4;
uniform vec3 uEcho5;
uniform vec3 uEcho6;

attribute vec2 aCell;

varying vec3 vColor;
varying float vShade;
varying float vFade;

${simplex}

vec3 echoColor(float band) {
  if (band < 0.5) return uGraticule;
  if (band < 1.5) return uEcho1;
  if (band < 2.5) return uEcho2;
  if (band < 3.5) return uEcho3;
  if (band < 4.5) return uEcho4;
  if (band < 5.5) return uEcho5;
  return uEcho6;
}

void main() {
  vec2 uv = (aCell + 0.5) / uGrid;
  vec2 p = (uv - 0.5) * uWorld;
  float cellSize = uWorld.x / uGrid.x;

  // Drifting storm system: three octaves of simplex noise.
  vec2 q = p * 0.15 + vec2(uTime * 0.045, -uTime * 0.025);
  float n = snoise(q) * 0.62 + snoise(q * 2.07 + 3.7) * 0.26 + snoise(q * 4.3 - 1.3) * 0.12;
  float intensity = smoothstep(0.08, 0.9, n);

  // The reader's pointer paints a storm that trails behind it.
  float storm = 0.0;
  for (int i = 0; i < TRAIL; i++) {
    vec3 t = uTrail[i];
    float d = distance(p, t.xy);
    storm += t.z * exp(-d * d * 0.42);
  }
  intensity += min(storm, 1.0) * 0.72;

  // Clicks send out expanding rings, like a ping on the scope.
  float ping = 0.0;
  for (int i = 0; i < PINGS; i++) {
    vec4 g = uPings[i];
    float age = uTime - g.z;
    if (g.w <= 0.0 || age < 0.0 || age > 4.0) continue;
    float d = distance(p, g.xy);
    float front = age * 6.5;
    ping += exp(-pow((d - front) * 1.5, 2.0)) * exp(-age * 0.8) * g.w;
  }
  intensity += ping * 0.6;

  // Radial falloff toward the scope edge, and the opening reveal.
  float r = length(p / (uWorld * 0.5));
  float scope = 1.0 - smoothstep(0.62, 1.0, r);
  float shown = 1.0 - smoothstep(uReveal * 1.35 - 0.18, uReveal * 1.35, r);
  intensity *= scope * shown;

  // Sweep: a bright leading edge, then cells that glow and decay behind it.
  float angle = atan(p.y, p.x);
  float behind = mod(uSweep - angle, 6.2831853);
  float trail = exp(-behind * 2.4) * shown;
  float beam = exp(-behind * 26.0) * shown * scope;

  float band = intensity < 0.14 ? 0.0 : min(6.0, floor((intensity - 0.14) / 0.86 * 6.0) + 1.0);
  float echo = step(0.5, band);

  float height = mix(0.03, 0.12 + intensity * 1.55, echo) * (1.0 + trail * 0.4 * echo);
  height += (trail * 0.05 + beam * 0.22) * (1.0 - echo);
  height += ping * 0.45;
  // Leaving the hero, the field settles flat as the camera rises above it.
  height *= 1.0 - uScroll * 0.85;

  vec3 color = echoColor(band);
  color = mix(color, uEcho2, (trail * 0.35 + beam * 0.65) * (1.0 - echo));
  color = mix(color, vec3(1.0), trail * 0.22 * echo + min(ping, 1.0) * 0.18);
  vColor = color;

  // Cheap faceted lighting from the box face normal.
  vShade = normal.y > 0.5 ? 1.0 : (abs(normal.x) > 0.5 ? 0.74 : 0.86);
  vFade = max(smoothstep(0.55, 1.02, r), uScroll * 0.6);

  vec3 pos = position;
  pos.y += 0.5;
  pos.xz *= cellSize * 0.8;
  pos.y *= height;
  pos.xz += p;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const radarFragmentShader = /* glsl */ `
uniform vec3 uPaper;

varying vec3 vColor;
varying float vShade;
varying float vFade;

void main() {
  vec3 color = mix(vColor * vShade, uPaper, vFade);
  gl_FragColor = vec4(color, 1.0);
}
`;
