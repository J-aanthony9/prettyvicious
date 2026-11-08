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
