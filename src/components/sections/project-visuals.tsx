import type { ProjectVisual } from "@/content/types";
import { fbm } from "@/lib/noise";

/** Deterministic blip positions per project, so each radar looks different. */
function blips(seed: number) {
  return [0, 1, 2, 3].map((i) => {
    const angle = fbm(seed + i * 3.1, i * 1.7) * Math.PI * 4;
    const radius = 14 + fbm(i * 2.3, seed * 0.7) * 28;
    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      band: (i % 3) + 2,
    };
  });
}

function MiniRadar({ seed }: { seed: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="mini-radar size-full"
      aria-hidden="true"
    >
      <g fill="none" stroke="var(--graticule)" strokeWidth="0.6">
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="31" />
        <circle cx="50" cy="50" r="16" />
        <line x1="4" y1="50" x2="96" y2="50" />
        <line x1="50" y1="4" x2="50" y2="96" />
      </g>
      <g className="mini-sweep" style={{ transformOrigin: "50px 50px" }}>
        <path
          d="M50 50 L50 4 A46 46 0 0 1 82.5 17.5 Z"
          fill="var(--echo-2)"
          opacity="0.28"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="4"
          stroke="var(--echo-2)"
          strokeWidth="1"
        />
      </g>
      {blips(seed).map((b, i) => (
        <rect
          key={i}
          x={b.x - 2.5}
          y={b.y - 2.5}
          width="5"
          height="5"
          fill={`var(--echo-${b.band})`}
        />
      ))}
    </svg>
  );
}

/** A page wireframe; on hover its blocks pick up design-tool selection boxes. */
function MiniFrames() {
  const blocks = [
    { x: 18, y: 30, w: 64, h: 18 },
    { x: 18, y: 54, w: 30, h: 26 },
    { x: 52, y: 54, w: 30, h: 26 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
      <rect
        x="10"
        y="12"
        width="80"
        height="76"
        rx="3"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="1.2"
      />
      <line
        x1="10"
        y1="22"
        x2="90"
        y2="22"
        stroke="var(--ink)"
        strokeWidth="1.2"
      />
      {[16, 21, 26].map((cx) => (
        <circle key={cx} cx={cx} cy="17" r="1.4" fill="var(--coast)" />
      ))}
      {blocks.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={i === 0 ? "var(--band-7)" : "var(--graticule)"}
          />
          {/* Selection box: drawn on hover (no fade), then the handles
              grow out of its corners. */}
          <g style={{ "--b": i } as React.CSSProperties}>
            <rect
              x={b.x - 1.5}
              y={b.y - 1.5}
              width={b.w + 3}
              height={b.h + 3}
              pathLength={1}
              fill="none"
              stroke="var(--echo-1)"
              strokeWidth="0.9"
              className="sel-box"
            />
            {[
              [b.x - 1.5, b.y - 1.5],
              [b.x + b.w + 1.5, b.y - 1.5],
              [b.x - 1.5, b.y + b.h + 1.5],
              [b.x + b.w + 1.5, b.y + b.h + 1.5],
            ].map(([cx, cy]) => (
              <rect
                key={`${cx}-${cy}`}
                x={cx - 1.6}
                y={cy - 1.6}
                width="3.2"
                height="3.2"
                fill="var(--paper)"
                stroke="var(--echo-1)"
                strokeWidth="0.8"
                className="sel-handle"
              />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}

const QR_SIZE = 11;
/** A QR-like code: three finder squares plus a fixed module pattern. */
const QR_MODULES = (() => {
  const cells: Array<[number, number]> = [];
  const inFinder = (c: number, r: number) =>
    (c < 4 && r < 4) ||
    (c > QR_SIZE - 5 && r < 4) ||
    (c < 4 && r > QR_SIZE - 5);
  for (let r = 0; r < QR_SIZE; r += 1) {
    for (let c = 0; c < QR_SIZE; c += 1) {
      if (inFinder(c, r)) continue;
      if (fbm(c * 0.9 + 1.3, r * 0.9 + 4.1) > 0.52) cells.push([c, r]);
    }
  }
  return cells;
})();

/** An attendee's QR code; a scan line passes over it on hover. */
function MiniQr() {
  const unit = 80 / QR_SIZE;
  const finder = (c: number, r: number) => (
    <g key={`${c}-${r}`}>
      <rect
        x={10 + c * unit + 0.6}
        y={10 + r * unit + 0.6}
        width={unit * 3 - 1.2}
        height={unit * 3 - 1.2}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.6"
      />
      <rect
        x={10 + (c + 1) * unit}
        y={10 + (r + 1) * unit}
        width={unit}
        height={unit}
        fill="var(--ink)"
      />
    </g>
  );
  return (
    <svg
      viewBox="0 0 100 100"
      className="size-full overflow-hidden"
      aria-hidden="true"
    >
      {finder(0, 0)}
      {finder(QR_SIZE - 3, 0)}
      {finder(0, QR_SIZE - 3)}
      {QR_MODULES.map(([c, r]) => (
        <rect
          key={`${c}-${r}`}
          x={10 + c * unit + 0.5}
          y={10 + r * unit + 0.5}
          width={unit - 1}
          height={unit - 1}
          fill="var(--ink)"
        />
      ))}
      <rect
        x="4"
        y="9"
        width="92"
        height="1.6"
        fill="var(--echo-2)"
        className="qr-scan"
      />
    </svg>
  );
}

/** Contour lines; on hover they redraw once, innermost first, then the dot. */
function MiniContour() {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
      <g fill="none" stroke="var(--echo-2)" strokeWidth="1.2">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            pathLength={1}
            className="contour-ring"
            // i = 4 is the innermost ring, so it draws first.
            style={{ "--d": 4 - i } as React.CSSProperties}
            cx={50 + i * 2}
            cy={56 - i * 3}
            rx={44 - i * 8}
            ry={30 - i * 5.5}
            transform={`rotate(${-12 + i * 5} 50 50)`}
            opacity={0.45 + i * 0.12}
          />
        ))}
      </g>
      <circle
        cx="58"
        cy="42"
        r="2.5"
        fill="var(--echo-5)"
        className="contour-dot"
      />
    </svg>
  );
}

/** Stacked layers that separate on hover. */
function MiniLayers() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="size-full overflow-visible"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d="M50 20 L88 40 L50 60 L12 40 Z"
          fill={i === 2 ? "var(--band-7)" : "var(--paper)"}
          stroke="var(--ink)"
          strokeWidth="1.2"
          className="layer transition-transform duration-500 ease-[var(--ease-out-expo)]"
          style={{ "--l": i } as React.CSSProperties}
          transform={`translate(0 ${24 - i * 12})`}
        />
      ))}
    </svg>
  );
}

const VISUALS: Record<ProjectVisual, (seed: number) => React.ReactNode> = {
  radar: (seed) => <MiniRadar seed={seed} />,
  grid: () => <MiniFrames />,
  tiles: () => <MiniQr />,
  contour: () => <MiniContour />,
  layers: () => <MiniLayers />,
};

export function ProjectVisualView({
  visual,
  seed,
}: {
  visual: ProjectVisual;
  seed: number;
}) {
  return VISUALS[visual](seed);
}
