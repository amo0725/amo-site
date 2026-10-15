"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { detectRenderTier, type RenderTier } from "@/lib/device/render-tier";
import { useMotionPreference } from "@/lib/motion/preference";
import { onPing } from "@/lib/radar/ping-bus";
import { cn } from "@/lib/cn";
import { onIdle } from "@/lib/schedule";
import { readPalette } from "./palette";
import { RADAR_QUALITY, nextLowerTier } from "./quality";
import type { HeroRenderer } from "./radar-renderer";

interface HeroVisualProps {
  /** Server-rendered still shown before WebGL is ready and kept when it never is. */
  poster: ReactNode;
}

type ActiveTier = Exclude<RenderTier, "none">;

/** Converts a pointer event to normalised device coordinates over `el`. */
function toNdc(el: Element, event: PointerEvent): [number, number] {
  const rect = el.getBoundingClientRect();
  return [
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -(((event.clientY - rect.top) / rect.height) * 2 - 1),
  ];
}

/**
 * Wires DOM input and lifecycle to a renderer. Returns a cleanup function.
 * Kept separate from the component so the wiring can be read on its own.
 */
function connect(
  renderer: HeroRenderer,
  host: HTMLElement,
  onResume: () => void,
) {
  const cleanups: Array<() => void> = [];
  const on = (
    target: EventTarget,
    type: string,
    fn: EventListener,
    opts?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  // Size
  const resizeObserver = new ResizeObserver(([entry]) => {
    renderer.resize(entry.contentRect.width, entry.contentRect.height);
  });
  resizeObserver.observe(host);
  cleanups.push(() => resizeObserver.disconnect());

  // Theme
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  on(scheme, "change", () => renderer.setPalette(readPalette(host)));

  // Pointer: the whole hero section is the input surface.
  const surface = host.closest("section") ?? host;
  on(
    surface,
    "pointermove",
    (e) => renderer.setPointer(...toNdc(host, e as PointerEvent)),
    { passive: true },
  );
  on(
    surface,
    "pointerdown",
    (e) => {
      const [x, y] = toNdc(host, e as PointerEvent);
      renderer.setPointer(x, y);
      renderer.ping(x, y);
    },
    { passive: true },
  );
  // Pings sent from elsewhere on the page (the motion switch).
  cleanups.push(
    onPing(({ clientX, clientY }) => {
      const rect = host.getBoundingClientRect();
      renderer.ping(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -(((clientY - rect.top) / rect.height) * 2 - 1),
      );
    }),
  );
  on(surface, "pointerleave", () => renderer.releasePointer());
  on(surface, "pointercancel", () => renderer.releasePointer());

  // Scroll: how far the hero has left the viewport.
  let scrollFrame = 0;
  const onScroll = () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const height = surface.getBoundingClientRect().height || 1;
      renderer.setScroll(window.scrollY / height);
    });
  };
  on(window, "scroll", onScroll, { passive: true });
  cleanups.push(() => cancelAnimationFrame(scrollFrame));
  onScroll();

  // Visibility: only animate while on screen and while the tab is visible.
  const intersection = new IntersectionObserver(([entry]) => {
    host.dataset.visible = entry.isIntersecting ? "1" : "0";
    onResume();
  });
  intersection.observe(host);
  cleanups.push(() => intersection.disconnect());
  on(document, "visibilitychange", onResume);

  return () => cleanups.forEach((fn) => fn());
}

/**
 * Owns the lifecycle of the 3D radar: decides whether to load it at all,
 * loads three.js off the critical path, and only renders while visible.
 * Re-initialises when the visitor changes the motion preference.
 */
export function HeroVisual({ poster }: HeroVisualProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preference = useMotionPreference();
  const [liveFor, setLiveFor] = useState<string | null>(null);
  const live = liveFor === preference;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const detected = detectRenderTier(preference === "reduced");
    if (detected === "none") return;
    let tier: ActiveTier = detected;

    let renderer: HeroRenderer | null = null;
    let disconnect: (() => void) | undefined;
    let disposed = false;

    const resume = () => {
      const visible = host.dataset.visible !== "0";
      if (renderer && visible && document.visibilityState === "visible")
        renderer.start();
      else renderer?.stop();
    };

    // Missed frame budget: step down a tier; below the lowest, freeze on a still frame.
    const downgrade = () => {
      if (!renderer) return;
      tier = nextLowerTier(tier) ?? "static";
      renderer.setQuality(RADAR_QUALITY[tier]);
    };

    const cancelIdle = onIdle(async () => {
      const { RadarRenderer } = await import("./radar-renderer");
      if (disposed) return;
      renderer = new RadarRenderer(canvas, {
        quality: RADAR_QUALITY[tier],
        palette: readPalette(host),
        onSlow: downgrade,
      });
      renderer.resize(host.clientWidth, host.clientHeight);
      disconnect = connect(renderer, host, resume);
      resume();
      setLiveFor(preference);
    });

    return () => {
      disposed = true;
      cancelIdle();
      disconnect?.();
      renderer?.dispose();
    };
  }, [preference]);

  return (
    <div ref={hostRef} className="absolute inset-0" aria-hidden="true">
      {/* The still poster is uncovered by the same front the shader uses to
          reveal the field (centre outward, same duration and curve), so the
          two read as one reveal, not a crossfade. */}
      <div
        className={cn(
          "absolute inset-0",
          live && (preference === "reduced" ? "invisible" : "poster-reveal"),
        )}
      >
        {poster}
      </div>
      {/* A fresh canvas per preference, so a new WebGL context never inherits a disposed one. */}
      <canvas
        key={preference}
        ref={canvasRef}
        className="absolute inset-0 size-full"
      />
    </div>
  );
}
