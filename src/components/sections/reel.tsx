import type { ReelCopy } from "@/content/types";
import { ReelPlayer } from "@/features/reel/reel-player";

/** The showreel: a looping motion piece rendered live in the browser. */
export function Reel({ copy }: { copy: ReelCopy }) {
  return (
    <section
      id="reel"
      aria-labelledby="reel-title"
      className="border-t border-graticule bg-surface-display px-5 py-16 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[90rem]">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div className="max-w-[40rem]">
            <h2
              id="reel-title"
              className="flex items-center gap-4 text-2xl font-bold tracking-tight font-expanded md:text-3xl"
            >
              <span
                aria-hidden="true"
                className="inline-block size-3 shrink-0 bg-echo-2 md:size-3.5"
              />
              <span>{copy.title}</span>
            </h2>
            <p className="mt-4 text-ink-soft">{copy.lead}</p>
          </div>
        </header>
        <p className="sr-only">{copy.summary}</p>
        <ReelPlayer copy={copy} />
        {/* Without JavaScript the live reel cannot run; the exported video stands in. */}
        <noscript>
          <video
            className="mt-6 aspect-video w-full rounded-sm bg-[#0a131a]"
            src={copy.video.src}
            poster={copy.video.poster}
            controls
            muted
            loop
            playsInline
            preload="none"
          />
        </noscript>
      </div>
    </section>
  );
}
