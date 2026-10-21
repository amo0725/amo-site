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

function AreaBadges({
  track,
  areas,
  ui,
  hrefBase,
}: {
  track: ExperienceTrack;
  areas: readonly number[];
  ui: UiStrings["experience"];
  hrefBase: string;
}) {
  return (
    <span className="flex flex-wrap gap-1">
      {areas.map((n) => {
        const area = track.areas[n - 1];
        return (
          <a
            key={n}
            href={`${hrefBase}#${areaId(track.id, n)}`}
            aria-label={fill(ui.area, { n: pad(n), title: area?.title ?? "" })}
            title={area?.title}
            className="area-badge inline-flex min-h-6 min-w-7 items-center justify-center bg-ink px-1.5 text-xs font-bold text-paper tabular transition-colors hover:bg-echo-2"
          >
            {pad(n)}
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
      className="flow-stop relative grid gap-1 md:content-start"
      style={{ "--i": index } as React.CSSProperties}
    >
      <span className="flex items-center gap-2.5 md:grid md:justify-items-start md:gap-2">
        <span
          aria-hidden="true"
          className="flow-dot relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper text-xs font-bold tabular"
        >
          {index + 1}
        </span>
        <span className="font-bold leading-tight">{node.title}</span>
      </span>
      <span className="pl-[2.375rem] text-sm text-ink-soft md:pl-0">
        {node.note}
      </span>
      <span className="pl-[2.375rem] md:pl-0">
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
 * How the system behind a body of work runs, as a path the reader can take
 * in at a glance: vertical on phones, left to right from md up. Each area
 * of ownership is a numbered badge on the stop it belongs to and links to
 * that area's detail. Work that runs beside the path is a dashed side lane;
 * work outside it is listed under the drawing.
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
      <figcaption className="text-xs font-semibold text-ink-soft">
        {flow.label}
      </figcaption>
      <InView threshold={0.5}>
        <ol
          className="flow-path relative mt-4 grid gap-4 md:gap-6"
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
        <div className="mt-5 grid gap-1 border border-dashed border-control p-3 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-x-4">
          <p className="text-xs font-semibold text-ink-soft md:col-span-3">
            {flow.side.label}
          </p>
          <p className="font-bold">{flow.side.title}</p>
          <p className="text-sm text-ink-soft">{flow.side.note}</p>
          <AreaBadges
            track={track}
            areas={flow.side.areas}
            ui={ui}
            hrefBase={hrefBase}
          />
        </div>
      ) : null}
      {flow.around && flow.around.length > 0 ? (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-soft">
          <span>{ui.around}</span>
          {flow.around.map((n) => (
            <span key={n} className="flex items-center gap-1.5">
              <AreaBadges
                track={track}
                areas={[n]}
                ui={ui}
                hrefBase={hrefBase}
              />
              <span className="text-ink">{track.areas[n - 1]?.title}</span>
            </span>
          ))}
        </p>
      ) : null}
    </figure>
  );
}
