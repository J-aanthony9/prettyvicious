"use client";

import { useEffect, useRef } from "react";
import { motionNeedsPermission, requestMotion } from "@/lib/motion";

const SRC_SET = "/brand/frozen-pv-320.webp 320w, /brand/frozen-pv-520.webp 520w";
const SIZES = "(min-width: 640px) 230px, 40vw";

/**
 * The frozen PV, as a hologram you can tilt.
 *
 * The block tilts in 3D toward however the phone is held (or toward the
 * mouse on a computer). A few darker copies stacked behind give the ice
 * some thickness when it turns, an iridescent sheen slides across the
 * frozen surface, and a glare follows the light. Until a phone reports its
 * tilt (iPhones ask first) it sways gently on its own.
 *
 * Everything moves by two numbers, --tx and --ty (each -1 to 1), so the
 * browser only recomposites layers and repaints the small sheen. Nothing
 * runs when the hero is off screen or the visitor prefers reduced motion.
 */
export default function FrozenPV() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.removeAttribute("data-idle");
      return;
    }

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let onScreen = true;

    const step = () => {
      raf = 0;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.setProperty("--tx", cx.toFixed(3));
      el.style.setProperty("--ty", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(step);
    };
    const aim = (x: number, y: number) => {
      if (!onScreen) return;
      if (el.hasAttribute("data-idle")) {
        // Pick up from wherever the idle sway had got to, so nothing jumps.
        const style = getComputedStyle(el);
        cx = Number(style.getPropertyValue("--tx")) || 0;
        cy = Number(style.getPropertyValue("--ty")) || 0;
        el.removeAttribute("data-idle");
      }
      tx = Math.max(-1, Math.min(1, x));
      ty = Math.max(-1, Math.min(1, y));
      if (!raf) raf = requestAnimationFrame(step);
    };

    // The phone: tilt relative to however it was held at first, with that
    // resting angle slowly following the hand, so it never sticks off-centre.
    let rest: { beta: number; gamma: number } | null = null;
    const onOrient = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      if (!rest) rest = { beta: event.beta, gamma: event.gamma };
      rest.beta += (event.beta - rest.beta) * 0.01;
      rest.gamma += (event.gamma - rest.gamma) * 0.01;
      aim((event.gamma - rest.gamma) / 22, (event.beta - rest.beta) / 22);
    };
    // Always listening: where a phone needs permission first (iPhone), no
    // events arrive until it is given, and then they simply start.
    window.addEventListener("deviceorientation", onOrient);

    // A computer: follow the mouse across the window.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointer = (event: PointerEvent) =>
      aim((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    seen.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-idle=""
      className="frozen-pv hero-frozen relative mb-8"
      // An iPhone that has not been asked yet: tapping the PV asks.
      onClick={() => {
        if (motionNeedsPermission()) void requestMotion();
      }}
    >
      <div className="frozen-pv-shadow" aria-hidden="true" />
      <div className="frozen-pv-tilt">
        {[4, 3, 2, 1].map((depth) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={depth}
            src="/brand/frozen-pv-320.webp"
            srcSet={SRC_SET}
            sizes={SIZES}
            width={320}
            height={387}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="frozen-pv-depth"
            style={{ "--d": depth } as React.CSSProperties}
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/frozen-pv-320.webp"
          srcSet={SRC_SET}
          sizes={SIZES}
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
    </div>
  );
}
