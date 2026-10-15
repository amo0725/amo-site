"use client";

import { useEffect, useRef, useState } from "react";
import type { UiStrings } from "@/content/types";
import { cn } from "@/lib/cn";

interface RevMeterProps {
  name: string;
  note: string;
  ui: UiStrings["offDuty"];
}

const IDLE = 850;
const LIMIT = 6900;
const REDLINE = 6500;
const MAX = 8000;
const SWEEP = 240; // gauge arc in degrees
const START = -120;

const angleFor = (rpm: number) => START + (rpm / MAX) * SWEEP;

function polar(angleDeg: number, r: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [60 + Math.cos(a) * r, 60 + Math.sin(a) * r];
}

function arc(from: number, to: number, r: number): string {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

/**
 * Hold the button (or space) to rev. The needle climbs, bounces off the
 * limiter, and the title stretches and gets heavier with the revs.
 * All per-frame updates go straight to CSS variables, never to React state.
 */
export function RevMeter({ name, note, ui }: RevMeterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const throttle = useRef(false);
  const kick = useRef<() => void>(() => {});
  const [redline, setRedline] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const readout = readoutRef.current;
    if (!root || !readout) return;
    let rpm = IDLE;
    let last = 0;
    let frame = 0;
    let running = false;
    let limiterOpen = true;
    let wasRed = false;

    const paint = () => {
      const rev = (rpm - IDLE) / (LIMIT - IDLE);
      root.style.setProperty("--rev", Math.max(0, Math.min(1, rev)).toFixed(3));
      root.style.setProperty("--needle", `${angleFor(rpm).toFixed(2)}deg`);
      readout.textContent = String(Math.round(rpm / 10) * 10);
      const red = rpm >= REDLINE;
      if (red !== wasRed) {
        wasRed = red;
        setRedline(red);
      }
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      if (throttle.current) {
        // Climb fast, slower near the top; the limiter cuts and reopens.
        if (rpm >= LIMIT) limiterOpen = false;
        if (rpm < LIMIT - 280) limiterOpen = true;
        rpm += limiterOpen ? (MAX - rpm) * 2.6 * dt + 900 * dt : -5200 * dt;
      } else {
        rpm += (IDLE - rpm) * 3.2 * dt;
      }
      rpm = Math.max(IDLE * 0.92, Math.min(MAX, rpm));
      paint();
      const settled = !throttle.current && Math.abs(rpm - IDLE) < 2;
      if (settled) {
        rpm = IDLE;
        paint();
        running = false;
        last = 0;
        return;
      }
      frame = requestAnimationFrame(step);
    };

    kick.current = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    };
    paint();
    return () => cancelAnimationFrame(frame);
  }, []);

  const press = () => {
    throttle.current = true;
    kick.current();
  };
  const release = () => {
    throttle.current = false;
    kick.current();
  };

  const ticks = Array.from({ length: MAX / 1000 + 1 }, (_, i) => i);

  return (
    <div
      ref={rootRef}
      className="rev"
      style={{ "--rev": 0, "--needle": `${START}deg` } as React.CSSProperties}
    >
      <h3
        // Sized to its column so the title still fits on one line at full
        // revs, when it is about 1.36x wider than at idle.
        className="rev-name text-[min(7.5rem,14cqw)] leading-[0.85] tracking-[-0.03em] whitespace-nowrap"
      >
        {name}
      </h3>
      <p className="mt-6 max-w-[26rem] text-ink-soft">{note}</p>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <svg
          viewBox="0 0 120 112"
          className="w-44 overflow-visible md:w-52"
          aria-hidden="true"
        >
          <path
            d={arc(START, START + SWEEP, 50)}
            fill="none"
            stroke="var(--graticule)"
            strokeWidth="6"
          />
          <path
            d={arc(angleFor(REDLINE), START + SWEEP, 50)}
            fill="none"
            stroke="var(--echo-5)"
            strokeWidth="6"
          />
          {ticks.map((t) => {
            const a = angleFor(t * 1000);
            const [x1, y1] = polar(a, 41);
            const [x2, y2] = polar(a, 46);
            const [tx, ty] = polar(a, 33);
            return (
              <g key={t}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--ink)"
                  strokeWidth="1.2"
                />
                <text
                  x={tx}
                  y={ty}
                  fontSize="7"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={
                    t * 1000 >= REDLINE ? "var(--echo-5)" : "var(--ink-soft)"
                  }
                >
                  {t}
                </text>
              </g>
            );
          })}
          <g className="rev-needle" style={{ transformOrigin: "60px 60px" }}>
            <line
              x1="60"
              y1="66"
              x2="60"
              y2="16"
              stroke="var(--echo-5)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          <circle cx="60" cy="60" r="4" fill="var(--ink)" />
          <text
            x="60"
            y="88"
            fontSize="6.5"
            textAnchor="middle"
            fill="var(--ink-soft)"
          >
            ×1000 {ui.rpm}
          </text>
        </svg>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink-soft">
            {ui.rpm}{" "}
            <span
              ref={readoutRef}
              className="text-2xl font-bold text-ink tabular"
            >
              {IDLE}
            </span>
          </p>
          <button
            type="button"
            onPointerDown={press}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                press();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") release();
            }}
            onContextMenu={(e) => e.preventDefault()}
            className="touch-none rounded-full bg-ink px-6 py-3 font-semibold text-paper select-none active:scale-95"
          >
            {ui.hold}
          </button>
          <p className="text-xs text-ink-soft">{ui.holdKeys}</p>
          <p
            className={cn(
              "text-sm font-semibold text-echo-5 transition-opacity",
              redline ? "opacity-100" : "opacity-0",
            )}
            aria-live="polite"
          >
            {redline ? ui.redline : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
