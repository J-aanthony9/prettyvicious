import { SEASON } from "@/lib/brand";

/**
 * Gothic arch frames (Naughty List season): product cards and the product
 * gallery sit inside a pointed cathedral-window arch, like frosted stained
 * glass glowing in the dark.
 *
 * The shape is a pointed (lancet) arch on a 100 x 125 box (the frames are
 * 4:5): two arcs of radius 66 struck from points beyond the opposite side
 * of the centre line, meeting in a sharp point at the top, springing from
 * the sides about halfway down. The frame is cut to it with a CSS mask (.arch),
 * and ArchRim draws a steel-ice edge, a fine inner tracery line, and a small
 * star at the point.
 */
export const ARCHES = SEASON === "naughty-list";

const OUTER = "M0 125V64A66 66 0 0 1 50 0A66 66 0 0 1 100 64V125Z";
// The same arch, 4 units in: concentric arcs, so the tracery runs parallel.
const INNER = "M4 121V64A62 62 0 0 1 50 4.1A62 62 0 0 1 96 64V121Z";
const STAR = "M50 7.4L51 10.4L54 11.4L51 12.4L50 15.4L49 12.4L46 11.4L49 10.4Z";

export function ArchRim() {
  return (
    <svg className="arch-rim" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true">
      <path d={OUTER} className="arch-rim-outer" vectorEffect="non-scaling-stroke" />
      <path d={INNER} className="arch-rim-inner" vectorEffect="non-scaling-stroke" />
      <path d={STAR} className="arch-rim-star" />
    </svg>
  );
}
