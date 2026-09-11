import { BRAND } from "@/lib/brand";

export default function QuoteBand() {
  return (
    <section className="quote-bg relative z-10 overflow-hidden border-y border-[color:var(--hairline-soft)] px-[clamp(20px,4vw,48px)] py-[clamp(72px,9vw,110px)] text-center">
      <blockquote className="relative mx-auto max-w-[820px] font-[family-name:var(--font-display)] text-[clamp(28px,4.4vw,48px)] font-normal italic leading-[1.25]">
        {BRAND.tagline}. Art was never meant to be{" "}
        <em className="italic text-accent">safe</em>.
      </blockquote>

      {/* Signature: a short hairline, then the initials, on one line. */}
      <div className="relative mt-7 font-[family-name:var(--font-display)] text-[16px] italic tracking-[0.32em] text-accent">
        <span
          aria-hidden="true"
          className="mr-3.5 inline-block h-px w-3.5 bg-[color:var(--color-accent-deep)] align-middle"
        />
        {BRAND.ownerInitials}
      </div>
    </section>
  );
}
