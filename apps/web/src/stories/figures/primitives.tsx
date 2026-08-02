import type { ReactNode } from "react";

/* ─────────────────────────────────────────────────────────
 * FIGURE PRIMITIVES - the shared drawing language every
 * story figure is built from, in the idiom of type-specimen
 * diagrams: grid paper under the drawing, dashed metric
 * guides that run out to small monospace labels, node dots
 * on the shapes, and tinted bands where space (or a problem)
 * lives. Rounded rects are surfaces, line segments are rows.
 * Amber marks what went wrong; the guides tell the story.
 *
 * One figure file per component lives beside this one and
 * imports from here; nothing else should draw its own axes.
 * ───────────────────────────────────────────────────────── */

export const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
export const AMBER = "#d97706";
export const AMBER_FILL = "rgba(251,146,60,0.16)";
export const GREEN_FILL = "rgba(16,185,129,0.09)";

const GRID_STROKE = "rgba(59,130,246,0.07)";

// The drawing lives in x 0..270; labels start at x 276.
export const LABEL_X = 276;

// The key to the tinted bands, specimen-style; lives here because this file
// owns the band colors. Rendered by StorySection under the timeline.
export function FigureLegend() {
  return (
    <div className="flex items-center gap-4 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground select-none">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px] border border-[rgba(217,119,6,0.35)] bg-[rgba(251,146,60,0.16)]" />
        Where it broke
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px] border border-[rgba(5,150,105,0.3)] bg-[rgba(16,185,129,0.09)]" />
        Context kept
      </span>
    </div>
  );
}

/** The grid-paper canvas every figure draws into. `id` namespaces its pattern. */
export function Figure({ id, height, children }: { id: string; height: number; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 360 ${height}`} fill="none" strokeLinecap="round" className="w-full h-auto" aria-hidden="true">
      <defs>
        <pattern id={`${id}-grid`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" stroke={GRID_STROKE} strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="270" height={height} fill={`url(#${id}-grid)`} />
      {children}
    </svg>
  );
}

/** A dashed metric guide running out to its label, specimen-style. */
export function Guide({
  y,
  label,
  color = "#6b7280",
  x1 = 0,
  x2 = 270,
}: {
  y: number;
  label: string;
  color?: string;
  x1?: number;
  x2?: number;
}) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#111" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.55" />
      <text x={LABEL_X} y={y + 2.5} fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill={color}>
        {label}
      </text>
    </g>
  );
}

/** A filled anchor node, like a selected bezier point. */
export function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="3" fill="#2563eb" stroke="white" strokeWidth="1.25" />;
}

/** A hollow diamond handle, the not-yet-committed kind of point. */
export function Dia({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y - 3} L${x + 3} ${y} L${x} ${y + 3} L${x - 3} ${y} Z`} fill="white" stroke="#111" strokeWidth="1" />;
}
