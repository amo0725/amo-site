import type { Point, SystemEdge } from "@/content/types";

/** Gentle curve between two nodes; `bend` alternates so parallel edges do not overlap. */
export function edgePath(a: Point, b: Point, bend: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * len * bend;
  const cy = my + (dx / len) * len * bend;
  return `M ${a.x} ${a.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`;
}

export function isConnected(edge: SystemEdge, nodeId: string | null): boolean {
  return nodeId !== null && (edge.from === nodeId || edge.to === nodeId);
}

export function neighbours(
  edges: readonly SystemEdge[],
  nodeId: string,
): Set<string> {
  const ids = new Set<string>();
  for (const e of edges) {
    if (e.from === nodeId) ids.add(e.to);
    if (e.to === nodeId) ids.add(e.from);
  }
  return ids;
}
