"use client";

import { useEffect, useState } from "react";
import { Bat } from "@/components/BatEngraving";
import { INTRO, SEASON } from "@/lib/brand";

/** How long the CSS sequence runs before the veil has fully lifted. */
const RUN_MS = 2400;
const SKIP_MS = 260;

/**
 * The first-visit welcome on the homepage: the engraved bat draws itself,
 * the drop's name bleeds in like ink, then the veil lifts like a curtain.
 *
 * Whether it shows at all is decided before first paint by the inline
 * script in layout.tsx (homepage, first visit for this drop, motion
 * allowed), which sets data-intro on <html>. CSS only shows the veil while
 * that attribute is there, and lifts it on its own, so it can never get
 * stuck even if this script fails. This component just adds tap or key to
 * skip, remembers the visit, and tidies up.
 */
export default function WelcomeVeil() {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-intro")) return;

    try {
      window.localStorage.setItem(INTRO.storageKey, "1");
    } catch {
      // Storage blocked: it may play again next visit. Harmless.
    }

    const finish = () => root.removeAttribute("data-intro");
    let done = window.setTimeout(finish, RUN_MS);

    const skip = () => {
      window.clearTimeout(done);
      setLeaving(true);
      done = window.setTimeout(finish, SKIP_MS);
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    return () => {
      window.clearTimeout(done);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  if (!INTRO.enabled) return null;

  return (
    <div className={`veil ${leaving ? "veil-leaving" : ""}`} aria-hidden="true">
      <div className="veil-inner">
        <svg className="veil-mark" viewBox="40 128 320 140" fill="none">
          {SEASON === "all-hallows" ? (
            <Bat draw />
          ) : (
            <g stroke="#E9DFCE" strokeWidth={0.7}>
              <path
                className="veil-draw"
                pathLength={1}
                d="M200 132 L206 194 L268 200 L206 206 L200 268 L194 206 L132 200 L194 194 Z"
              />
            </g>
          )}
        </svg>
        <p className="veil-eyebrow">{INTRO.eyebrow}</p>
        <p className="veil-title">{INTRO.title}</p>
      </div>
      <span className="veil-skip">Skip</span>
    </div>
  );
}
