import { InView } from "@/components/motion/in-view";
import type {
  ExperienceTrack,
  FlowNode,
  TrackFlow as Flow,
  UiStrings,
} from "@/content/types";
import { fill } from "@/lib/i18n";

/** In-page id of an area of ownership (1-based), the target of its badge. */
export const areaId = (trackId: string, n: number) => `xp-${trackId}-${n}`;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The areas a stop carries, as coordinates: the same "01…07" index as the
 * list of areas, plotted on the drawing with the area's short name, each
 * linking to its area. `bare` drops the name where the drawing already
 * says it (the side lane's own title).
 */
function AreaBadges({
  track,
  areas,
  ui,
  hrefBase,
  bare = false,
}: {
  track: ExperienceTrack;
  areas: readonly number[];
  ui: UiStrings["experience"];
  hrefBase: string;
  bare?: boolean;
}) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      {areas.map((n) => {
        const area = track.areas[n - 1];
        return (
          <a
            key={n}
            href={`${hrefBase}#${areaId(track.id, n)}`}
            aria-label={fill(ui.area, { n: pad(n), title: area?.title ?? "" })}
            title={area?.title}
            className="area-badge"
          >
            <span className="area-badge-n">{pad(n)}</span>
            {!bare && area?.short ? (
              <span className="area-badge-name">{area.short}</span>
            ) : null}
          </a>
        );
      })}
    </span>
  );
}

function Stop({
  node,
  index,
  track,
  ui,
  hrefBase,
}: {
  node: FlowNode;
  index: number;
  track: ExperienceTrack;
  ui: UiStrings["experience"];
  hrefBase: string;
}) {
  return (
    <li
      className="flow-stop relative grid grid-cols-[1.75rem_1fr] gap-x-3 gap-y-1.5 md:grid-cols-1 md:content-start md:gap-y-2"
      style={{ "--i": index } as React.CSSProperties}
    >
      <span aria-hidden="true" className="node row-span-3 md:row-span-1">
        {index + 1}
      </span>
      <p className="flow-title pt-[0.2rem] leading-tight font-bold md:pt-1">
        {node.title}
      </p>
      <p className="text-sm text-ink-soft md:max-w-[20em]">{node.note}</p>
      <span className="flex items-center gap-2 pt-0.5">
        <span aria-hidden="true" className="leader" />
        <AreaBadges
          track={track}
          areas={node.areas}
          ui={ui}
          hrefBase={hrefBase}
        />
      </span>
    </li>
  );
}

/**
 * How the system behind a body of work runs, plotted as a path the reader
 * takes in at a glance: vertical on phones, left to right from md up. Each
 * area of ownership is a coordinate on the stop it belongs to and links to
 * that area's detail. Work that runs beside the path hangs below it on a
 * dashed axis; work outside it is a third row.
 *
 * The drawing is real text (an ordered list), so it reads the same to a
 * screen reader and to find-in-page. When it arrives, the track fills stop
 * by stop, once, to show the direction (.flow-stop, CSS only).
 */
export function TrackFlowView({
  track,
  flow,
  ui,
  hrefBase = "",
}: {
  track: ExperienceTrack;
  flow: Flow;
  ui: UiStrings["experience"];
  /** Prefix for area links: "" on the page that lists the areas. */
  hrefBase?: string;
}) {
  return (
    <figure className="track-flow">
      <figcaption className="coord">{flow.label}</figcaption>
      <InView threshold={0.25}>
        <ol
          className="flow-path relative mt-5 grid gap-5 md:gap-7"
          style={{ "--stops": flow.path.length } as React.CSSProperties}
        >
          {flow.path.map((node, i) => (
            <Stop
              key={node.title}
              node={node}
              index={i}
              track={track}
              ui={ui}
              hrefBase={hrefBase}
            />
          ))}
        </ol>
      </InView>
      {flow.side ? (
        <div className="mt-7">
          <p className="coord">{flow.side.label}</p>
          <div className="flow-side mt-2 grid grid-cols-[1.75rem_1fr] gap-x-3 gap-y-1 pt-3 md:grid-cols-[1.75rem_auto_1fr_auto] md:items-baseline">
            <span aria-hidden="true" className="node node-side mt-[0.3rem]" />
            <p className="font-bold">{flow.side.title}</p>
            <p className="col-start-2 text-sm text-ink-soft md:col-start-3">
              {flow.side.note}
            </p>
            <span className="col-start-2 flex items-center gap-2 pt-1 md:col-start-4 md:pt-0">
              <span aria-hidden="true" className="leader" />
              <AreaBadges
                track={track}
                areas={flow.side.areas}
                ui={ui}
                hrefBase={hrefBase}
                bare
              />
            </span>
          </div>
        </div>
      ) : null}
      {flow.around && flow.around.length > 0 ? (
        <div className="mt-5 grid grid-cols-[1.75rem_1fr] gap-x-3 border-t border-graticule pt-3">
          <span
            aria-hidden="true"
            className="node node-side mt-[0.3rem] rounded-full"
          />
          <div className="grid gap-1.5">
            <p className="coord">{ui.around}</p>
            <AreaBadges
              track={track}
              areas={flow.around}
              ui={ui}
              hrefBase={hrefBase}
            />
          </div>
        </div>
      ) : null}
    </figure>
  );
}
