"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Status = "idle" | "copied" | "failed";

export function CopyEmailButton({
  email,
  labels,
  className,
}: {
  email: string;
  labels: Record<Status, string>;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn("relative overflow-hidden", className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={status}
          className="block"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {labels[status]}
        </m.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {status === "idle" ? "" : labels[status]}
      </span>
    </button>
  );
}
