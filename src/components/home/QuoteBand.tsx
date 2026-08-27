import { BRAND } from "@/lib/brand";

export default function QuoteBand() {
  return (
    <section className="relative border-y border-[color:var(--hairline)] bg-wine/60">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <blockquote className="display text-[clamp(1.25rem,4vw,2.15rem)] leading-[1.5]">
          {BRAND.tagline}. Art was never meant to be{" "}
          <em className="gothic not-italic text-accent">safe</em>.
        </blockquote>

        {/* Signature: short hairline, then the initials. Kept minimal. */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <span className="block h-px w-10 bg-[color:var(--color-accent)]" />
          <span className="display text-[10px] tracking-[0.5em] text-[color:var(--bone-dim)]">
            {BRAND.ownerInitials}
          </span>
        </div>
      </div>
    </section>
  );
}
