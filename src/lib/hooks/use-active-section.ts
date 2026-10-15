"use client";

import { useEffect, useState } from "react";

/** Returns the id of the section currently crossing the middle of the viewport, or null. */
export function useActiveSection(
  items: ReadonlyArray<{ id: string }>,
): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    const ids = key.split("|");
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}
