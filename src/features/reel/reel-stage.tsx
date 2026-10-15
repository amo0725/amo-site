"use client";

import { useEffect, useRef } from "react";
import type { ReelCopy } from "@/content/types";
import { Timeline } from "./engine";
import {
  DURATION,
  ReelStageMarkup,
  STAGE_H,
  STAGE_W,
  buildTracks,
  reelLayers,
} from "./scenes";

export interface ReelControls {
  play(): void;
  pause(): void;
  seek(t: number): void;
  readonly time: number;
  readonly playing: boolean;
  readonly duration: number;
}

interface ReelStageProps {
  copy: ReelCopy;
  onReady: (controls: ReelControls) => void;
  onFrame: (t: number) => void;
  onEnd: () => void;
}

/**
 * The 1600 × 900 stage, scaled to fit its frame, plus the timeline that
 * drives it. Loaded on demand, only once the reel is near the viewport.
 */
export default function ReelStage({
  copy,
  onReady,
  onFrame,
  onEnd,
}: ReelStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep the latest callbacks without re-creating the timeline.
  const callbacks = useRef({ onFrame, onEnd, onReady });
  useEffect(() => {
    callbacks.current = { onFrame, onEnd, onReady };
  });

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const frame = stage?.parentElement;
    if (!stage || !canvas || !frame) return;

    const timeline = new Timeline({
      root: stage,
      canvas,
      tracks: buildTracks(),
      layers: reelLayers,
      duration: DURATION,
      onFrame: (t) => callbacks.current.onFrame(t),
      onEnd: () => callbacks.current.onEnd(),
    });

    // Fit the stage into the frame (also in full screen) and size the canvas to real pixels.
    const fit = () => {
      const { width, height } = frame.getBoundingClientRect();
      const scale = Math.min(width / STAGE_W, height / STAGE_H) || 0.1;
      stage.style.transform = `translate(${(width - STAGE_W * scale) / 2}px, ${(height - STAGE_H * scale) / 2}px) scale(${scale})`;
      const density = Math.min(2, scale * window.devicePixelRatio);
      const w = Math.round(STAGE_W * density);
      const h = Math.round(STAGE_H * density);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        timeline.seek(timeline.currentTime);
      }
    };
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    fit();

    timeline.seek(0);
    stage.dataset.ready = "1";
    callbacks.current.onReady({
      play: () => timeline.play(),
      pause: () => timeline.pause(),
      seek: (t) => timeline.seek(t),
      get time() {
        return timeline.currentTime;
      },
      get playing() {
        return timeline.isPlaying;
      },
      duration: DURATION,
    });

    return () => {
      observer.disconnect();
      timeline.dispose();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="reel-stage absolute top-0 left-0 origin-top-left"
      style={{ width: STAGE_W, height: STAGE_H }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: STAGE_W, height: STAGE_H }}
      />
      <ReelStageMarkup copy={copy} />
    </div>
  );
}
