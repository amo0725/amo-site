"use client";

import { useRef, useState } from "react";
import type {
  GraphLayout,
  Point,
  SystemEdge,
  SystemNode,
} from "@/content/types";
import { cn } from "@/lib/cn";
import { edgePath, isConnected, neighbours } from "./geometry";

interface GraphViewProps {
  nodes: readonly SystemNode[];
  edges: readonly SystemEdge[];
  layout: GraphLayout;
  activeId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPreview: (id: string | null) => void;
  resetLabel: string;
  /**
   * Camera framing (wide layout only): when `zoomed`, the graph pushes in
   * around node `id`. The origin uses the laid-out position, not a dragged
   * one, so dragging the framed node never makes the view swim.
   */
  camera?: { id: string | null; zoomed: boolean };
  className?: string;
}

interface DragState {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  origin: Point;
  moved: boolean;
}

/**
 * Draws one layout of the graph. Edges are SVG; nodes are real buttons laid
 * over it, so they keep native focus, keyboard and screen-reader behaviour.
 * With a mouse, nodes can be dragged and the edges follow.
 */
export function GraphView({
  nodes,
  edges,
  layout,
  activeId,
  selectedId,
  onSelect,
  onPreview,
  resetLabel,
  camera,
  className,
}: GraphViewProps) {
  const { width, height } = layout.viewBox;
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);
  const [positions, setPositions] = useState<Record<string, Point>>(() => ({
    ...layout.positions,
  }));
  const [rearranged, setRearranged] = useState(false);
  const linked = activeId ? neighbours(edges, activeId) : null;
  const framed = camera?.id ? layout.positions[camera.id] : undefined;

  const toViewBox = (dxPx: number, dyPx: number) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return { dx: 0, dy: 0 };
    return {
      dx: (dxPx * width) / rect.width,
      dy: (dyPx * height) / rect.height,
    };
  };

  const onPointerDown =
    (id: string) => (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = {
        id,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        origin: positions[id],
        moved: false,
      };
    };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const px = e.clientX - d.startX;
    const py = e.clientY - d.startY;
    if (!d.moved && Math.hypot(px, py) < 5) return;
    d.moved = true;
    const { dx, dy } = toViewBox(px, py);
    const x = Math.min(width - 30, Math.max(30, d.origin.x + dx));
    const y = Math.min(height - 16, Math.max(16, d.origin.y + dy));
    setPositions((prev) => ({ ...prev, [d.id]: { x, y } }));
    setRearranged(true);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    suppressClick.current = d.moved;
    drag.current = null;
  };

  const onClick = (id: string) => () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onSelect(id);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className={camera ? "graph-frame" : undefined}>
        <div
          ref={boxRef}
          className={cn("relative w-full", camera && "graph-camera")}
          data-zoom={camera?.zoomed && framed ? "" : undefined}
          style={{
            aspectRatio: `${width} / ${height}`,
            transformOrigin: framed
              ? `${(framed.x / width) * 100}% ${(framed.y / height) * 100}%`
              : undefined,
          }}
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden="true"
          >
            {edges.map((edge, i) => {
              const a = positions[edge.from];
              const b = positions[edge.to];
              if (!a || !b) return null;
              const d = edgePath(a, b, i % 2 === 0 ? 0.12 : -0.12);
              const on = isConnected(edge, activeId);
              const dim = activeId !== null && !on;
              return (
                <g
                  key={`${edge.from}-${edge.to}`}
                  className="transition-opacity duration-300"
                  opacity={dim ? 0.3 : 1}
                >
                  <path
                    d={d}
                    pathLength={1}
                    fill="none"
                    stroke={on ? "var(--ink)" : "var(--coast)"}
                    strokeWidth={on ? 1.75 : 1}
                    vectorEffect="non-scaling-stroke"
                    className="edge-draw transition-[stroke] duration-300"
                  />
                  {!dim ? (
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--echo-2)"
                      strokeWidth={on ? 4 : 2.5}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      className={on ? "edge-flow" : "edge-flow-idle"}
                      opacity={on ? 1 : 0.55}
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>

          {nodes.map((node) => {
            const p = positions[node.id];
            if (!p) return null;
            const isActive = node.id === activeId;
            const dimmed =
              activeId !== null && !isActive && !linked?.has(node.id);
            const hub = node.kind === "hub";
            return (
              <button
                key={node.id}
                type="button"
                aria-pressed={node.id === selectedId}
                onClick={onClick(node.id)}
                onPointerDown={onPointerDown(node.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerEnter={(e) =>
                  e.pointerType === "mouse" && onPreview(node.id)
                }
                onPointerLeave={(e) =>
                  e.pointerType === "mouse" && onPreview(null)
                }
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border whitespace-nowrap select-none active:cursor-grabbing",
                  "transition-[opacity,background-color,color,box-shadow,scale] duration-300 ease-out",
                  "px-3 py-1 text-[0.8rem] md:px-4 md:py-1.5 md:text-sm",
                  hub
                    ? "border-ink bg-ink font-semibold text-paper"
                    : "border-coast bg-paper text-ink hover:border-ink",
                  isActive && "scale-110 shadow-[0_0_0_4px_var(--echo-2)]",
                  dimmed && "opacity-40",
                )}
                style={{
                  left: `${(p.x / width) * 100}%`,
                  top: `${(p.y / height) * 100}%`,
                }}
              >
                {node.label}
              </button>
            );
          })}
        </div>
      </div>
      {rearranged ? (
        <button
          type="button"
          onClick={() => {
            setPositions({ ...layout.positions });
            setRearranged(false);
          }}
          className="absolute top-0 right-0 rounded-full border border-coast px-3 py-1 text-sm hover:border-ink"
        >
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
}
