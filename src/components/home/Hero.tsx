import Link from "next/link";
import { BRAND, DROPS, SEASON } from "@/lib/brand";
import HeroMark from "@/components/home/HeroMark";

export default function Hero() {
  return (
    <section aria-label="Introduction" className="hero relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-[clamp(20px,4vw,48px)] pb-[120px] pt-24 text-center">
      <HeroMark />

      {/* Naughty List: the frozen PV is the centrepiece, the thing the ice
          intro shatters to reveal. Explicit width and height so it never
          shifts the layout, and high priority because it is the first
          thing in view. */}
      {SEASON === "naughty-list" ? (
        <img
          src="/brand/frozen-pv-320.webp"
          srcSet="/brand/frozen-pv-320.webp 320w, /brand/frozen-pv-520.webp 520w"
          sizes="(min-width: 640px) 230px, 40vw"
          width={320}
          height={387}
          alt="Pretty Vicious monogram encased in ice"
          fetchPriority="high"
          decoding="async"
          className="hero-frozen relative mb-8"
        />
      ) : null}

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
        <Link
          href={`/collections/${DROPS.current.handle}`}
          className="btn btn-solid"
        >
          Shop the drop
        </Link>
        <Link href="/#club" className="btn">
          Join the club
        </Link>
      </div>
    </section>
  );
}
