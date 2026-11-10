/**
 * A tiny signal between the ice intro and the homepage snow: the snow
 * waits while the intro is up, and starts as the glass breaks, instead of
 * falling unseen behind the fog.
 */

let active = false;

export const ICE_DONE_EVENT = "pv-ice-done";

export function iceIntroActive(): boolean {
  return active;
}

export function markIceIntro(playing: boolean): void {
  active = playing;
  if (!playing && typeof window !== "undefined") window.dispatchEvent(new Event(ICE_DONE_EVENT));
}

/**
 * The cover that hides the homepage from the very first frame on a visit
 * where the intro will play (set by an inline script in layout.tsx), so
 * the page never shows and then gets fogged over. Lifted once the fog has
 * fully formed, or straight away if the intro is not going to play.
 */
export function iceCoverUp(): boolean {
  return typeof document !== "undefined" && document.documentElement.hasAttribute("data-ice-cover");
}

export function liftCover(): void {
  if (typeof document !== "undefined") document.documentElement.removeAttribute("data-ice-cover");
}
