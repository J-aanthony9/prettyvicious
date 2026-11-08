/**
 * The frozen PV with a holographic finish. An iridescent sheen slowly
 * drifts across the ice and a soft glare wanders over it, both clipped to
 * the PV by its own transparency, so the block shimmers like a hologram
 * without moving. CSS only (see .frozen-pv in globals.css): no script, no
 * permissions, a still sheen when the visitor prefers reduced motion.
 *
 * The image keeps its explicit size and high priority: it is the first
 * thing in view and the page's main content for load timing.
 */
export default function FrozenPV() {
  return (
    <div className="frozen-pv hero-frozen relative mb-8">
      <div className="frozen-pv-shadow" aria-hidden="true" />
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
        className="frozen-pv-face"
      />
      <div className="frozen-pv-holo" aria-hidden="true" />
      <div className="frozen-pv-glare" aria-hidden="true" />
    </div>
  );
}
