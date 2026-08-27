import Link from "next/link";
import { BRAND, DROPS } from "@/lib/brand";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="haze" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-5 py-28 text-center sm:px-8">
        <p className="eyebrow">
          {BRAND.subLabel} · Est. {BRAND.established}
        </p>

        <h1 className="mt-10 flex flex-col items-center gap-4">
          <span className="display text-[clamp(2.4rem,9vw,5.2rem)]">We Wear It</span>
          <span className="flex items-center gap-5 sm:gap-8">
            <span
              aria-hidden="true"
              className="text-[clamp(0.7rem,2vw,1.1rem)] text-accent"
            >
              ✦
            </span>
            <span className="gothic distress text-[clamp(3.6rem,15vw,9rem)] leading-[0.85] text-bone">
              Dark
            </span>
            <span
              aria-hidden="true"
              className="text-[clamp(0.7rem,2vw,1.1rem)] text-accent"
            >
              ✦
            </span>
          </span>
        </h1>

        <p className="dim mt-10 max-w-md text-[15px] leading-relaxed">
          {BRAND.positioning} {BRAND.tagline}.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href={`/collections/${DROPS.current.handle}`}
            className="btn btn-solid"
          >
            Shop Drop {DROPS.current.number}
          </Link>
          <Link href="/story" className="btn">
            Read the story
          </Link>
        </div>
      </div>
    </section>
  );
}
