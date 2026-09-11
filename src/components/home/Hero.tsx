import Link from "next/link";
import { BRAND, DROPS } from "@/lib/brand";

export default function Hero() {
  return (
    <section aria-label="Introduction" className="hero relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-[clamp(20px,4vw,48px)] pb-[120px] pt-24 text-center">
      {/* Compass rose from the brand lockup: four long points, four short. */}
      <svg className="hero-star" viewBox="0 0 400 400" aria-hidden="true">
        <path d="M200.0 14.0 L209.2 177.8 L260.8 139.2 L222.2 190.8 L386.0 200.0 L222.2 209.2 L260.8 260.8 L209.2 222.2 L200.0 386.0 L190.8 222.2 L139.2 260.8 L177.8 209.2 L14.0 200.0 L177.8 190.8 L139.2 139.2 L190.8 177.8 Z" fill="#E9DFCE" />
        <circle cx="200" cy="200" r="7" fill="#0C0A0B" />
      </svg>

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
        {BRAND.positioning} Drop {DROPS.current.number} is dedicated to the
        beauty professionals.
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
