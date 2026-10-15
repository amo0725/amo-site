"use client";

import { useEffect, useRef } from "react";

/**
 * Marks its element with data-in once at least `threshold` of it has been
 * on screen, so CSS can play a one-time, time-based animation (staggered
 * delays need real time, which scroll-driven timelines cannot give).
 */
export function InView({
  children,
  className,
  threshold = 0.6,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.in = "1";
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
