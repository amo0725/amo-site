"use client";

import { AnimatePresence } from "motion/react";
// The bare m component: the barrel export of "m" pulls the full feature
// set into the first-load bundle and defeats LazyMotion.
import * as m from "motion/react-m";
import { useState } from "react";
import type {
  GraphLayout,
  SystemEdge,
  SystemNode,
  UiStrings,
} from "@/content/types";
import { fill } from "@/lib/i18n";
import { useMotionPreference } from "@/lib/motion/preference";
import { GraphView } from "./graph-view";

const OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const IN_OUT_QUART = [0.76, 0, 0.24, 1] as const;
/* The panel is wiped, never faded: it enters from the left edge and leaves
   by the same edge moving right. Every inset is a percentage so Motion can
   interpolate between them; the slight negative insets keep glyph overhang
   (CJK, accents) from being shaved at rest. */
const CLIP_BEFORE = "inset(-10% 102% -10% -2%)";
const CLIP_SHOWN = "inset(-10% -2% -10% -2%)";
const CLIP_AFTER = "inset(-10% -2% -10% 102%)";

interface IntegrationMapProps {
  nodes: readonly SystemNode[];
  edges: readonly SystemEdge[];
  wide: GraphLayout;
  narrow: GraphLayout;
  ui: UiStrings["systems"];
}

export function IntegrationMap({
  nodes,
  edges,
  wide,
  narrow,
  ui,
}: IntegrationMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  // The node the camera is framed on. It stays put after a deselect so the
  // zoom-out happens around the same point it zoomed in on.
  const [cameraId, setCameraId] = useState<string | null>(null);
  const reduced = useMotionPreference() === "reduced";
  const activeId = previewId ?? selectedId;

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const active = activeId ? byId.get(activeId) : undefined;
  const flows = active
    ? edges.filter((e) => e.from === active.id || e.to === active.id)
    : [];

  const select = (id: string) => {
    setSelectedId((current) => (current === id ? null : id));
    setCameraId(id);
  };

  const shared = {
    nodes,
    edges,
    activeId,
    selectedId,
    onSelect: select,
    onPreview: setPreviewId,
    resetLabel: ui.reset,
    coreLabel: ui.core,
  };
  const selected = selectedId ? byId.get(selectedId) : undefined;

  return (
    <div
      className="grid gap-6 lg:grid-cols-12 lg:gap-8"
      // Escape puts the picked node back, as the panel's close does.
      onKeyDown={(e) => {
        if (e.key === "Escape" && selectedId) select(selectedId);
      }}
    >
      {/* What a pick changed, said once; hovering never speaks. */}
      <p className="sr-only" aria-live="polite">
        {selected ? selected.label : ""}
      </p>
      <div className="lg:col-span-8">
        <GraphView
          {...shared}
          layout={wide}
          camera={{ id: cameraId, zoomed: selectedId !== null }}
          className="hidden md:block"
        />
        <GraphView
          {...shared}
          layout={narrow}
          className="mx-auto max-w-[26rem] md:hidden"
        />
      </div>

      <div
        data-native-scroll
        data-docked={selectedId ? "" : undefined}
        // Docked and scrollable on phones and tablets: reachable by keyboard.
        tabIndex={selectedId ? 0 : undefined}
        aria-labelledby={active ? "systems-panel-title" : undefined}
        role={active ? "region" : undefined}
        // Below lg the map is taller than the screen, so a picked node's
        // panel docks to the bottom edge; otherwise a tap would change
        // nothing in view. With nothing picked it sits after the map.
        className={`-mx-5 border-t border-graticule px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:-mx-10 md:px-10 lg:static lg:col-span-4 lg:mx-0 lg:max-h-none lg:self-center lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 ${
          selectedId ? "sticky bottom-0 z-10 max-h-[40svh] overflow-y-auto bg-surface-display md:max-h-[34svh]" : ""
        }`}
      >
        {selectedId ? (
          <button
            type="button"
            onClick={() => select(selectedId)}
            className="relative z-10 float-right -mt-1 ml-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-control bg-surface-display px-3 text-sm font-semibold hover:border-ink lg:hidden"
          >
            {ui.close}
            <span aria-hidden="true" className="text-lg leading-none font-light">
              ×
            </span>
          </button>
        ) : null}
        {/* Only a click (or tap, or Enter) wipes the panel. Hovering a node
            swaps the text inside the current panel, so sweeping the pointer
            across a row of nodes never sets off a run of wipes. */}
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={selectedId ?? "none"}
            initial={{ clipPath: CLIP_BEFORE }}
            animate={{
              clipPath: CLIP_SHOWN,
              transition: reduced
                ? { duration: 0 }
                : { duration: 0.35, ease: OUT_EXPO, delay: 0.1 },
            }}
            exit={{
              clipPath: CLIP_AFTER,
              transition: reduced
                ? { duration: 0 }
                : { duration: 0.25, ease: IN_OUT_QUART },
            }}
          >
            {active ? (
              <>
                <h3
                  id="systems-panel-title"
                  className="text-lg font-bold font-expanded lg:text-xl"
                >
                  {active.label}
                </h3>
                <p className="mt-1 text-sm text-ink-soft lg:mt-2 lg:text-base">
                  {active.note}
                </p>
                <ul className="mt-4 space-y-3 border-l border-graticule pl-5 lg:mt-6 lg:space-y-4">
                  {flows.map((flow) => (
                    <li key={`${flow.from}-${flow.to}`}>
                      <p className="text-sm font-semibold">
                        {byId.get(flow.from)?.label}
                        <span aria-hidden="true" className="px-2 text-ink-soft">
                          →
                        </span>
                        <span className="sr-only"> {ui.flowsTo} </span>
                        {byId.get(flow.to)?.label}
                      </p>
                      <p className="text-sm text-ink-soft">{flow.flow}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">{ui.emptyTitle}</p>
                <p className="mt-2 text-ink-soft">
                  {fill(ui.emptyBody, {
                    nodes: nodes.length,
                    edges: edges.length,
                  })}
                </p>
              </>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
