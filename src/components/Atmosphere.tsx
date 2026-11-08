"use client";

import { useEffect } from "react";
import { SEASON } from "@/lib/brand";
import { BAT_PATH } from "@/components/bat-path";

const MOTES = [
  { left: "12%", top: "18%", delay: "0s", duration: "22s" },
  { left: "78%", top: "26%", delay: "5s", duration: "26s", bat: true },
  { left: "34%", top: "62%", delay: "11s", duration: "24s" },
  { left: "64%", top: "74%", delay: "16s", duration: "28s" },
  { left: "88%", top: "48%", delay: "8s", duration: "21s", bat: true },
];

/** In the All Hallows season, two of the five motes are tiny bats. */
const BATS = SEASON === "all-hallows";

/**
 * Naughty List: a sparse, slow snowfall instead of the motes. Mostly tiny
 * six-armed flakes, a few stars. Negative delays mean the fall is already
 * under way when the page opens. `top` is where each one rests when motion
 * is reduced and nothing falls.
 */
const SNOW = SEASON === "naughty-list";
const FLAKES = [
  { left: "6%", top: "14%", size: 9, duration: 34, delay: -4, star: false },
  { left: "15%", top: "62%", size: 6, duration: 41, delay: -22, star: false },
  { left: "24%", top: "30%", size: 8, duration: 37, delay: -13, star: true },
  { left: "33%", top: "78%", size: 7, duration: 45, delay: -31, star: false },
  { left: "42%", top: "8%", size: 10, duration: 39, delay: -9, star: false },
  { left: "51%", top: "48%", size: 6, duration: 43, delay: -27, star: false },
  { left: "60%", top: "22%", size: 8, duration: 36, delay: -18, star: true },
  { left: "69%", top: "70%", size: 7, duration: 47, delay: -36, star: false },
  { left: "77%", top: "38%", size: 9, duration: 40, delay: -6, star: false },
  { left: "86%", top: "86%", size: 6, duration: 44, delay: -25, star: false },
  { left: "93%", top: "18%", size: 8, duration: 38, delay: -15, star: true },
  { left: "47%", top: "92%", size: 7, duration: 42, delay: -40, star: false },
];

function Flake({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="-6 -6 12 12" aria-hidden="true">
      <g stroke="currentColor" strokeWidth={0.9} strokeLinecap="round">
        <path d="M0 -5.5 V5.5 M-4.8 -2.75 L4.8 2.75 M-4.8 2.75 L4.8 -2.75" />
        <path d="M-1.2 -4.3 L0 -3.2 L1.2 -4.3 M-1.2 4.3 L0 3.2 L1.2 4.3" opacity=".8" />
      </g>
    </svg>
  );
}

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
        {SNOW
          ? FLAKES.map((flake, index) => (
              <span
                key={index}
                className="flake"
                style={
                  {
                    left: flake.left,
                    "--rest": flake.top,
                    animationDuration: `${flake.duration}s`,
                    animationDelay: `${flake.delay}s`,
                  } as React.CSSProperties
                }
              >
                {flake.star ? <span style={{ fontSize: flake.size }}>✦</span> : <Flake size={flake.size} />}
              </span>
            ))
          : null}
        {SNOW ? null : MOTES.map((mote, index) => (
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
            {BATS && mote.bat ? (
              <svg className="mote-bat" viewBox="-22 -9 44 17" aria-hidden="true">
                <path d={BAT_PATH} />
              </svg>
            ) : (
              "✦"
            )}
          </span>
        ))}
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
