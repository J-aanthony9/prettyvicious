/**
 * The frozen PV, hovering. The block floats up and down a few pixels, with
 * a slight sway, and its shadow below tightens as it rises, so it reads as
 * suspended in the cold. CSS only (see .frozen-pv in globals.css): no
 * script, still when the visitor prefers reduced motion.
 *
 * The image keeps its explicit size and high priority: it is the first
 * thing in view and the page's main content for load timing.
 */
export default function FrozenPV() {
  return (
    <div className="frozen-pv relative mb-8">
      <div className="frozen-pv-shadow" aria-hidden="true" />
      {/* Floats; the image inside keeps its own settle-in animation, so the
          two movements never fight over one transform. */}
      <div className="frozen-pv-float">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/frozen-pv-320.webp"
          srcSet="/brand/frozen-pv-320.webp 320w, /brand/frozen-pv-520.webp 520w"
          sizes="(min-width: 640px) 240px, 44vw"
          width={320}
          height={387}
          alt="Pretty Vicious monogram encased in ice"
          fetchPriority="high"
          decoding="async"
          className="frozen-pv-face hero-frozen"
        />
      </div>
    </div>
  );
}
