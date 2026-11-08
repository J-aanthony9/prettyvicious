"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
 * Naughty List: snow at the top of every page that thins out as you scroll
 * away. On the homepage it is heaviest over the hero and has stopped by the
 * time the hero has scrolled off; elsewhere it stops within the first
 * screen. Each flake has its own cut-off (--k), so it does not fade as one
 * sheet: fewer and fewer flakes fall until there are none. Three kinds of
 * flake: fine six-armed crystals, small soft dots, and a few big out of
 * focus ones close to the glass. A seeded sequence keeps server and
 * browser identical. `top` is where each rests when motion is reduced.
 */
const SNOW = SEASON === "naughty-list";
type FlakeSpec = {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  kind: "crystal" | "dot" | "soft";
  k: number;
  o: number;
};
const FLAKES: FlakeSpec[] = (() => {
  let seed = 17;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const count = 30;
  // Cut-offs spread evenly from 0.12 to 1, then shuffled across the flakes.
  const cutoffs = Array.from({ length: count }, (_, i) => 0.12 + (0.88 * (i + 1)) / count);
  for (let i = count - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [cutoffs[i], cutoffs[j]] = [cutoffs[j], cutoffs[i]];
  }
  return cutoffs.map((k, i) => {
    const roll = rand();
    const kind: FlakeSpec["kind"] = roll < 0.45 ? "crystal" : roll < 0.88 ? "dot" : "soft";
    const size =
      kind === "crystal" ? 6 + Math.round(rand() * 5) : kind === "dot" ? 3 + Math.round(rand() * 3) : 11 + Math.round(rand() * 6);
    const duration = kind === "soft" ? 24 + rand() * 10 : kind === "dot" ? 15 + rand() * 9 : 18 + rand() * 12;
    return {
      left: `${((i * 37) % 100) + rand() * 3}%`,
      top: `${Math.round(rand() * 90)}%`,
      size,
      duration: Math.round(duration),
      delay: -Math.round(rand() * duration),
      kind,
      k: Number(k.toFixed(3)),
      o: kind === "soft" ? 0.14 : kind === "dot" ? 0.5 : 0.42,
    };
  });
})();

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
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let frame = 0;
    let snowEnd = window.innerHeight;
    let lastSnow = -1;

    // Where the snow stops: the foot of the homepage hero, or one screen.
    const measure = () => {
      const hero = document.querySelector(".hero");
      snowEnd = hero ? hero.getBoundingClientRect().bottom + window.scrollY : window.innerHeight;
    };

    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      // The fog drifts with scroll, so it stays still for reduced motion.
      if (!reduced) root.style.setProperty("--sy", `${y.toFixed(1)}px`);
      if (SNOW) {
        const snow = Math.round(Math.min(1, Math.max(0, y / (snowEnd * 0.85))) * 100) / 100;
        if (snow !== lastSnow) {
          lastSnow = snow;
          root.style.setProperty("--snow", String(snow));
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
    // Measured again on every page, since the hero is only on the homepage.
  }, [pathname]);

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
                className={`flake flake-${flake.kind}`}
                style={
                  {
                    left: flake.left,
                    "--rest": flake.top,
                    "--k": flake.k,
                    "--o": flake.o,
                    width: flake.kind === "crystal" ? undefined : flake.size,
                    height: flake.kind === "crystal" ? undefined : flake.size,
                    animationDuration: `${flake.duration}s`,
                    animationDelay: `${flake.delay}s`,
                  } as React.CSSProperties
                }
              >
                {flake.kind === "crystal" ? <Flake size={flake.size} /> : null}
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
