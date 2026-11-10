/**
 * Naughty List: the screen as a cold window. Real frost (the frost photo,
 * public/brand/ice/frost-corner.webp) gathered in the bottom corners, the
 * way it settles at the foot of a pane, fainter frost in the top corners
 * (on the homepage the hero wall has its own), and a cold rim of light
 * round the edge. Fixed, faint, never interactive, no script. The photo
 * grows from the bottom left; the other corners are mirrors of it.
 */
const EDGES = ["frost-edge-bl", "frost-edge-br", "frost-edge-t frost-edge-tl", "frost-edge-t frost-edge-tr"] as const;

export default function FrostEdges() {
  return (
    <div className="frost-edges" aria-hidden="true">
      {EDGES.map((className) => (
        <div key={className} className={`frost-edge ${className}`} />
      ))}
    </div>
  );
}
