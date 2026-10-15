"use client";

import {
  setMotionPreference,
  useMotionPreference,
} from "@/lib/motion/preference";
import { cn } from "@/lib/cn";
import { requestPing } from "@/lib/radar/ping-bus";

interface MotionToggleProps {
  label: string;
  on: string;
  off: string;
}

/** Lets a visitor override the system motion setting in either direction. */
export function MotionToggle({ label, on, off }: MotionToggleProps) {
  const preference = useMotionPreference();
  const enabled = preference === "full";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={(e) => {
        if (!enabled) {
          // Turning motion on: the green knob sends the first ping.
          const knob = e.currentTarget.querySelector("[data-knob]");
          const r = knob?.getBoundingClientRect();
          if (r) requestPing(r.left + r.width / 2, r.top + r.height / 2);
        }
        setMotionPreference(enabled ? "reduced" : "full");
      }}
      className="group inline-flex items-center gap-2.5 text-sm"
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 rounded-full border transition-colors duration-300",
          enabled ? "border-ink bg-ink" : "border-coast bg-transparent",
        )}
      >
        <span
          data-knob
          className={cn(
            "absolute top-1/2 left-0.5 size-3.5 -translate-y-1/2 rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)]",
            enabled ? "translate-x-4 bg-echo-2" : "bg-coast",
          )}
        />
      </span>
      <span className="w-6 text-left text-ink tabular" suppressHydrationWarning>
        {enabled ? on : off}
      </span>
    </button>
  );
}
