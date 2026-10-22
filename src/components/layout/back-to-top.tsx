import { cn } from "@/lib/cn";

/**
 * A labelled way back to the top on long pages: lower right, shown only
 * when the reader is far down and scrolling up (when they are looking for
 * a way out), and out of the tab order while it is away.
 */
export function BackToTop({ label, shown }: { label: string; shown: boolean }) {
  return (
    <a
      href="#top"
      aria-hidden={shown ? undefined : true}
      tabIndex={shown ? undefined : -1}
      className={cn(
        "back-to-top fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-flex min-h-11 items-center gap-2 rounded-full border border-control bg-paper px-4 text-sm font-semibold shadow-[0_6px_16px_-10px_color-mix(in_oklab,var(--ink)_60%,transparent)] transition-[opacity,translate,visibility] duration-200 hover:border-ink",
        shown
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-2 opacity-0",
      )}
    >
      <span aria-hidden="true">↑</span>
      {label}
    </a>
  );
}
