import Link from "next/link";
import { BRAND, DROPS } from "@/lib/brand";

export default function Hero() {
  return (
    <section aria-label="Introduction" className="hero relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-[clamp(20px,4vw,48px)] pb-[120px] pt-24 text-center">
      <svg
        className="hero-star"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#E9DFCE" strokeWidth="0.7">
          <path d="M200 8 L212 188 L392 200 L212 212 L200 392 L188 212 L8 200 L188 188 Z" />
          <path d="M200 60 L208 192 L340 200 L208 208 L200 340 L192 208 L60 200 L192 192 Z" />
          <circle cx="200" cy="200" r="150" strokeDasharray="1 7" />
          <circle cx="200" cy="200" r="192" strokeDasharray="1 10" opacity=".6" />
        </g>
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
