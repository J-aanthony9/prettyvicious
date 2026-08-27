"use client";

import { useEffect } from "react";

const MOTES = [
  { left: "12%", top: "18%", delay: "0s", duration: "22s" },
  { left: "78%", top: "26%", delay: "5s", duration: "26s" },
  { left: "34%", top: "62%", delay: "11s", duration: "24s" },
  { left: "64%", top: "74%", delay: "16s", duration: "28s" },
  { left: "88%", top: "48%", delay: "8s", duration: "21s" },
];

/**
 * Film grain, parallax fog and a few drifting motes.
 *
 * The fog layers read a single --sy custom property and each scales it by a
 * different factor in CSS, so one rAF-throttled write moves all three.
 * Nothing runs at all when the visitor prefers reduced motion.
 */
export default function Atmosphere() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      document.documentElement.style.setProperty(
        "--sy",
        `${window.scrollY.toFixed(1)}px`,
      );
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="fog-field" aria-hidden="true">
        <div className="fog fog-a" />
        <div className="fog fog-b" />
        <div className="fog fog-c" />
        {MOTES.map((mote, index) => (
          <span
            key={index}
            className="mote"
            style={{
              left: mote.left,
              top: mote.top,
              animationDelay: mote.delay,
              animationDuration: mote.duration,
            }}
          >
            ✦
          </span>
        ))}
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
