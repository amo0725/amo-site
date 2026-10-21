import { InView } from "@/components/motion/in-view";
import { MetricBars } from "@/components/ui/metric-bars";
import type { ExperienceTrack, ScopeArea, UiStrings } from "@/content/types";
import { areaId } from "./track-flow";

const pad = (n: number) => String(n).padStart(2, "0");

function AreaDetail({
  area,
  ui,
}: {
  area: ScopeArea;
  ui: UiStrings["experience"];
}) {
  return (
    <div className="pb-5 pl-[2.75rem] sm:pl-[3.5rem]">
      <p className="max-w-[40rem] text-ink-soft">{area.body}</p>
      {area.impact ? (
        <p className="mt-3 flex max-w-[40rem] gap-3 text-sm">
          <span className="shrink-0 font-semibold text-ink">{ui.impact}</span>
          <span className="text-ink-soft">{area.impact}</span>
        </p>
      ) : null}
      {area.metric ? (
        <InView className="metric-play mt-4 max-w-[34rem]">
          <MetricBars metrics={[area.metric]} />
        </InView>
      ) : null}
    </div>
  );
}

/**
 * A body of work's areas of ownership. On the home page every area is one
 * line with its detail a tap away, at every width (the flow drawing above
 * is the overview); a badge on the drawing opens its area (AnchorSettle).
 * On the track's own page they are all open.
 */
export function AreaList({
  track,
  ui,
  open = false,
}: {
  track: ExperienceTrack;
  ui: UiStrings["experience"];
  open?: boolean;
}) {
  return (
    <ol className="border-t border-graticule">
      {track.areas.map((area, i) => {
        const n = i + 1;
        const head = (
          <>
            <span
              aria-hidden="true"
              className={`${open ? "" : "index-ink "}text-sm font-semibold text-ink-soft tabular`}
            >
              {pad(n)}
            </span>
            <span className="font-bold">{area.title}</span>
          </>
        );
        return (
          <li
            key={area.title}
            id={areaId(track.id, n)}
            className="area-item border-b border-graticule"
          >
            {open ? (
              <>
                <h3 className="grid grid-cols-[2.25rem_1fr] items-baseline gap-x-2 pt-5 pb-2 sm:grid-cols-[3rem_1fr]">
                  {head}
                </h3>
                <AreaDetail area={area} ui={ui} />
              </>
            ) : (
              <details className="area-fold group/area">
                <summary className="grid cursor-pointer list-none grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-2 py-4 sm:grid-cols-[3rem_1fr_auto] [&::-webkit-details-marker]:hidden">
                  {head}
                  <span
                    aria-hidden="true"
                    className="text-2xl leading-none font-light text-ink-soft transition-[rotate] duration-300 group-open/area:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <AreaDetail area={area} ui={ui} />
              </details>
            )}
          </li>
        );
      })}
    </ol>
  );
}
