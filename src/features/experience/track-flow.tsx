import { InView } from "@/components/motion/in-view";
import type {
  ExperienceTrack,
  FlowNode,
  TrackFlow as Flow,
  UiStrings,
} from "@/content/types";

/** In-page id of an area of ownership (1-based). */
export const areaId = (trackId: string, n: number) => `xp-${trackId}-${n}`;

function Stop({ node, index }: { node: FlowNode; index: number }) {
  return (
    <li
      className="flow-stop relative grid grid-cols-[1.75rem_1fr] gap-x-3 gap-y-1 md:grid-cols-1 md:content-start md:gap-y-2"
      style={{ "--i": index } as React.CSSProperties}
    >
      <span aria-hidden="true" className="node row-span-2 md:row-span-1">
        {index + 1}
      </span>
      <p className="flow-title pt-[0.15rem] leading-snug font-bold md:pt-1">
        {node.title}
      </p>
      <p className="md:max-w-[20em]">{node.note}</p>
    </li>
  );
}

/**
 * How the system behind a body of work runs, as a short numbered path:
 * vertical on phones, left to right from md up. The work that runs beside
 * the path, and the work around it, follow as plain lines; the areas of
 * ownership themselves are listed below the drawing.
 *
 * The drawing is real text (an ordered list), so it reads the same to a
 * screen reader and to find-in-page. When it arrives, the track fills stop
 * by stop, once, to show the direction (.flow-stop, CSS only).
 */
export function TrackFlowView({
  track,
  flow,
  ui,
}: {
  track: ExperienceTrack;
  flow: Flow;
  ui: UiStrings["experience"];
}) {
  const around = (flow.around ?? [])
    .map((n) => track.areas[n - 1]?.title)
    .filter(Boolean);
  return (
    <figure className="track-flow">
      <figcaption className="coord">{flow.label}</figcaption>
      <InView threshold={0.25}>
        <ol
          className="flow-path relative mt-4 grid gap-5 md:gap-7"
          style={{ "--stops": flow.path.length } as React.CSSProperties}
        >
          {flow.path.map((node, i) => (
            <Stop key={node.title} node={node} index={i} />
          ))}
        </ol>
      </InView>
      {flow.side || around.length > 0 ? (
        <dl className="mt-8 grid gap-4 border-t border-graticule pt-5 md:grid-cols-2 md:gap-x-10">
          {flow.side ? (
            <div>
              <dt className="coord">{flow.side.label}</dt>
              <dd className="mt-1">
                <p className="font-bold">{flow.side.title}</p>
                <p>{flow.side.note}</p>
              </dd>
            </div>
          ) : null}
          {around.length > 0 ? (
            <div>
              <dt className="coord">{ui.around}</dt>
              <dd className="mt-1">
                <ul className="bullets">
                  {around.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </figure>
  );
}
