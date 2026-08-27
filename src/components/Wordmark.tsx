import { BRAND } from "@/lib/brand";

/**
 * Type based stand in for the real Pretty Vicious logo.
 *
 * When the transparent PNG lockups arrive, drop them in /public/brand/ and
 * swap the markup here for next/image. Nothing else on the site needs to
 * change. Keep the bone recolour for the nav and the burgundy tint for the
 * footer lockup.
 *
 *   /public/brand/wordmark-bone.png   nav, wordmark only
 *   /public/brand/lockup-burgundy.png footer, wordmark plus tagline
 */
export function Wordmark({
  className = "",
  tone = "bone",
}: {
  className?: string;
  tone?: "bone" | "burgundy";
}) {
  return (
    <span
      className={`gothic block leading-none ${
        tone === "burgundy" ? "text-accent" : "text-bone"
      } ${className}`}
    >
      {BRAND.name}
    </span>
  );
}

export function Lockup({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Wordmark tone="burgundy" className="text-[30px] sm:text-[38px]" />
      <span className="display text-[9px] text-[color:var(--bone-faint)]">
        {BRAND.tagline}
      </span>
    </div>
  );
}
