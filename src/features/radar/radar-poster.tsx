import { fbm } from "@/lib/noise";

const COLS = 40;
const ROWS = 25;
const CELL = 12;
const W = COLS * CELL;
const H = ROWS * CELL;

const ECHO_VARS = [
  "--echo-1",
  "--echo-2",
  "--echo-3",
  "--echo-4",
  "--echo-5",
  "--echo-6",
] as const;

interface PosterCell {
  x: number;
  y: number;
  band: number;
}

/** Computed once at build time; the poster is pure static SVG. */
function computeCells(): PosterCell[] {
  const cells: PosterCell[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const nx = (col + 0.5) / COLS - 0.5;
      const ny = (row + 0.5) / ROWS - 0.5;
      const r = Math.hypot(nx / 0.5, ny / 0.5);
      const scope = 1 - Math.min(1, Math.max(0, (r - 0.55) / 0.4));
      const n = fbm(col * 0.19 + 4.2, row * 0.19 + 1.7);
      const intensity = Math.max(0, (n - 0.5) / 0.32) * scope;
      if (intensity < 0.14) continue;
      const band = Math.min(6, Math.floor(((intensity - 0.14) / 0.86) * 6) + 1);
      cells.push({ x: col * CELL, y: row * CELL, band });
    }
  }
  return cells;
}

/** One path per echo band keeps the poster to a handful of DOM nodes. */
const bandPaths = (() => {
  const paths = ECHO_VARS.map(() => [] as string[]);
  for (const c of computeCells()) {
    paths[c.band - 1].push(
      `M${c.x + 1} ${c.y + 1}h${CELL - 2}v${CELL - 2}h-${CELL - 2}z`,
    );
  }
  return paths.map((d) => d.join(""));
})();

/**
 * Still image of the echo field, tilted with CSS 3D to roughly match the
 * WebGL camera so the cross-fade does not jump.
 */
export function RadarPoster() {
  return (
    <div className="absolute inset-0 overflow-hidden [perspective:900px]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-x-[-10%] top-[8%] h-[95%] w-[120%] origin-center [transform:rotateX(52deg)]"
      >
        <g fill="none" stroke="var(--graticule)" strokeWidth="1">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <ellipse
              key={f}
              cx={W / 2}
              cy={H / 2}
              rx={(W / 2) * f}
              ry={(H / 2) * f}
            />
          ))}
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} />
          <line x1={W / 2} y1={0} x2={W / 2} y2={H} />
        </g>
        {bandPaths.map((d, i) =>
          d ? (
            <path key={ECHO_VARS[i]} d={d} fill={`var(${ECHO_VARS[i]})`} />
          ) : null,
        )}
      </svg>
    </div>
  );
}
