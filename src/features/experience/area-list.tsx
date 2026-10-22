import { InView } from "@/components/motion/in-view";
import { MetricBars } from "@/components/ui/metric-bars";
import type { ExperienceTrack, ScopeArea, UiStrings } from "@/content/types";
import { areaId } from "./track-flow";

function AreaDetail({
  area,
  ui,
}: {
  area: ScopeArea;
  ui: UiStrings["experience"];
}) {
  return (
    <div className="pb-6">
      <p className="max-w-[40rem]">{area.body}</p>
      {area.impact ? (
        <p className="mt-3 max-w-[40rem]">
          <span className="font-semibold">{ui.impact}</span>
          {ui.colon}
          {area.impact}
        </p>
      ) : null}
      {area.metric ? (
        <InView className="metric-play mt-4 max-w-[34rem]">
          <MetricBars metrics={[area.metric]} to={ui.to} />
        </InView>
      ) : null}
    </div>
  );
}

/**
 * A body of work's areas of ownership. On the home page every area is one
 * line with its detail a tap away, at every width (the flow drawing above
 * is the overview). On the track's own page they are all open.
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
    // On the home page the list sits under its fold's summary line, whose
    // rule already tops it on phones.
    <ul className={open ? "border-t border-graticule" : "border-graticule md:border-t"}>
      {track.areas.map((area, i) => (
        <li
          key={area.title}
          id={areaId(track.id, i + 1)}
          className="area-item border-b border-graticule"
        >
          {open ? (
            <>
              <h3 className="pt-5 pb-2 font-bold">{area.title}</h3>
              <AreaDetail area={area} ui={ui} />
            </>
          ) : (
            <details className="area-fold group/area">
              <summary className="pen-row flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                <span className="font-bold">{area.title}</span>
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
      ))}
    </ul>
  );
}
