/**
 * Decides how much real-time graphics this device should get.
 * Kept separate from any renderer so other visuals can reuse it.
 *
 * - high / medium / low: animated WebGL at decreasing density
 * - static: GPU is fine but motion is unwanted (reduced-motion preference)
 *   → render one still frame
 * - none: no WebGL2, or only a software rasteriser → keep the SVG poster
 */
export type RenderTier = "high" | "medium" | "low" | "static" | "none";
export type AnimatedTier = Extract<RenderTier, "high" | "medium" | "low">;

interface NavigatorHints {
  deviceMemory?: number;
}

type WebGLSupport = "hardware" | "software" | "none";

/** CPU rasterisers that some headless browsers and VMs expose without flagging a caveat. */
const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|software|basic render/i;

function probeWebGL2(): WebGLSupport {
  const probe = (strict: boolean): WebGLSupport => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: strict,
    });
    if (!gl) return "none";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return SOFTWARE_RENDERER.test(name) ? "software" : "hardware";
  };
  try {
    const strict = probe(true);
    if (strict !== "none") return strict;
    return probe(false) === "none" ? "none" : "software";
  } catch {
    return "none";
  }
}

/**
 * @param reducedMotion the visitor's motion preference (system default or
 *   their own choice); passed in so this module never decides it.
 */
export function detectRenderTier(reducedMotion: boolean): RenderTier {
  const webgl = probeWebGL2();
  if (webgl === "none") return "none";

  const nav = navigator as Navigator & NavigatorHints;
  const matches = (query: string) => window.matchMedia(query).matches;

  // A CPU rasteriser would spend seconds compiling and drawing; the SVG poster is better there.
  if (webgl === "software") return "none";

  if (reducedMotion) return "static";

  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ?? 8; // Safari does not expose it
  const coarse = matches("(pointer: coarse)");
  const shortSide = Math.min(window.screen.width, window.screen.height);

  if (coarse && shortSide < 600) return "low"; // phones
  if (coarse || cores < 8 || memory < 8) return "medium"; // tablets, modest laptops
  return "high";
}
