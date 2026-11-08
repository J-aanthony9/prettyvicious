/**
 * Naughty List: the screen as a cold window. Frost gathered in the bottom
 * corners, the way it settles at the foot of a pane, fainter frost in the
 * top corners (on the homepage the hero has its own), and a cold rim of
 * light round the edge. Fixed, faint, never interactive, no script. The
 * drawings are static files (public/frost), cached after the first page,
 * drawn as CSS masks (see .frost-mask).
 */
const EDGES = [
  { className: "frost-edge-bl", seed: 53 },
  { className: "frost-edge-br", seed: 67 },
  { className: "frost-edge-t frost-edge-tl", seed: 71 },
  { className: "frost-edge-t frost-edge-tr", seed: 83 },
] as const;

export default function FrostEdges() {
  return (
    <div className="frost-edges" aria-hidden="true">
      {EDGES.map(({ className, seed }) => (
        <div
          key={seed}
          className={`frost-edge frost-mask ${className}`}
          style={{ "--frost-src": `url(/frost/frost-${seed}.svg)` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
