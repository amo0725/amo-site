import type { AnimatedTier, RenderTier } from "@/lib/device/render-tier";

/** Everything the renderer needs to know about how hard it may work. */
export interface RadarQuality {
  /** Grid columns × rows = number of instanced cells (one draw call). */
  cols: number;
  rows: number;
  maxDpr: number;
  antialias: boolean;
  animated: boolean;
}

/**
 * Strategy table. Adding a tier or retuning one never touches renderer code.
 */
export const RADAR_QUALITY: Readonly<
  Record<Exclude<RenderTier, "none">, RadarQuality>
> = {
  high: { cols: 112, rows: 70, maxDpr: 2, antialias: true, animated: true },
  medium: { cols: 84, rows: 52, maxDpr: 1.5, antialias: true, animated: true },
  low: { cols: 56, rows: 35, maxDpr: 1.5, antialias: true, animated: true },
  static: { cols: 84, rows: 52, maxDpr: 1.5, antialias: true, animated: false },
};

/** Order used when the frame budget is missed and the scene must get cheaper. */
const DOWNGRADE: Readonly<Record<AnimatedTier, AnimatedTier | null>> = {
  high: "medium",
  medium: "low",
  low: null,
};

export function nextLowerTier(tier: RenderTier): AnimatedTier | null {
  return tier === "high" || tier === "medium" || tier === "low"
    ? DOWNGRADE[tier]
    : null;
}
