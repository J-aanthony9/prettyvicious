import Link from "next/link";
import { preload } from "react-dom";
import { BRAND, DROPS, FROST_BACKGROUND, SEASON } from "@/lib/brand";
import HeroMark from "@/components/home/HeroMark";
import FrozenPV from "@/components/home/FrozenPV";

const SHOP_HREF = `/collections/${DROPS.current.handle}`;

export default function Hero() {
  if (SEASON === "naughty-list") return <DropHero />;
  return (
    <section aria-label="Introduction" className="hero relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-[clamp(20px,4vw,48px)] pb-[120px] pt-24 text-center">
      <HeroMark />

      <p className="eyebrow relative mb-7">
        {BRAND.subLabel} ✦ Est. {BRAND.established}
      </p>

      <h1 className="hero-title relative">
        We Wear It
        <span className="hero-dark">
          <span aria-hidden="true" className="hero-star-glyph">
            ✦
          </span>
          <span className="distress">Dark</span>
          <span aria-hidden="true" className="hero-star-glyph">
            ✦
          </span>
        </span>
      </h1>

      <p className="dim relative mx-auto mb-10 mt-8 max-w-[520px] text-[16px] font-medium">
        {BRAND.positioning} {DROPS.current.heroLine}
      </p>

      <div className="relative flex flex-wrap justify-center gap-3.5">
        <Link href={SHOP_HREF} className="btn btn-solid">
          Shop the drop
        </Link>
        <Link href="/#club" className="btn">
          Join the club
        </Link>
      </div>
    </section>
  );
}

/**
 * Naughty List: the frozen PV is the whole hero (the thing the ice intro
 * shatters to reveal), with only the news under it, the drop is out, and
 * the one button that matters.
 */
function DropHero() {
  const wall = FROST_BACKGROUND === "wall";
  // The wall is the first thing painted behind the PV, so fetch it with the
  // page rather than when the stylesheet gets round to it.
  if (wall) {
    preload("/brand/ice/wall.webp", { as: "image", fetchPriority: "high" });
  }
  return (
    <section
      aria-label="Drop 003, Naughty List, out now"
      className={`hero relative flex min-h-[86vh] flex-col items-center justify-center overflow-hidden px-[clamp(20px,4vw,48px)] pb-[96px] pt-20 text-center ${wall ? "hero-wall" : ""}`}
    >
      <HeroMark />
      <FrozenPV />

      <p className="eyebrow relative">Drop {DROPS.current.number}</p>
      <h1 className="hero-drop-title relative mt-4">
        <span className="distress">{DROPS.current.title}</span>
      </h1>
      <p className="hero-status relative mt-5">
        <span aria-hidden="true">✦</span>
        {DROPS.current.status}
        <span aria-hidden="true">✦</span>
      </p>

      <div className="relative mt-10">
        <Link href={SHOP_HREF} className="btn btn-solid">
          Shop the drop
        </Link>
      </div>
    </section>
  );
}
